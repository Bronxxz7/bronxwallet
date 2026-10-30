
import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  cert,
  getApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenAI } from "@google/genai";

const projectId = process.env.FIREBASE_PROJECT_ID;
const serviceAccountJson =
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const geminiApiKey = process.env.GEMINI_API_KEY;

const MAX_TRANSACTIONS = 500;
const MAX_RESPONSE_CHARS = 5000;

type Movement = {
  type: "income" | "expense" | "transfer";
  amount: number;
  category: string;
  createdAt: number;
};

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!projectId || !serviceAccountJson) {
    throw new Error(
      "Faltan las credenciales privadas de Firebase."
    );
  }

  return initializeApp({
    credential: cert(JSON.parse(serviceAccountJson)),
    projectId,
  });
}

function getWeekPeriod() {
  const now = new Date();

  // Semana de lunes a domingo, zona horaria de Perú.
  const peruDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [year, month, day] = peruDate
    .split("-")
    .map(Number);

  const localDate = new Date(
    Date.UTC(year, month - 1, day)
  );

  const weekday = localDate.getUTCDay();
  const daysFromMonday = (weekday + 6) % 7;

  localDate.setUTCDate(
    localDate.getUTCDate() - daysFromMonday
  );

  const monday = localDate.toISOString().slice(0, 10);

  const sundayDate = new Date(localDate);
  sundayDate.setUTCDate(sundayDate.getUTCDate() + 6);

  const sunday = sundayDate.toISOString().slice(0, 10);

  // Lima utiliza UTC-5.
  const startMs = Date.parse(
    `${monday}T05:00:00.000Z`
  );

  const endMs =
    Date.parse(`${sunday}T05:00:00.000Z`) +
    24 * 60 * 60 * 1000;

  return {
    monday,
    sunday,
    startMs,
    endMs,
    reportId: monday,
  };
}

function summarizeTransactions(movements: Movement[]) {
  let income = 0;
  let expenses = 0;

  const categoryTotals = new Map<
    string,
    { amount: number; count: number }
  >();

  let smallExpensesCount = 0;
  let smallExpensesTotal = 0;

  for (const movement of movements) {
    if (movement.type === "income") {
      income += movement.amount;
      continue;
    }

    if (movement.type !== "expense") {
      continue;
    }

    expenses += movement.amount;

    const category = movement.category || "Otros";

    const previous = categoryTotals.get(category) ?? {
      amount: 0,
      count: 0,
    };

    categoryTotals.set(category, {
      amount: previous.amount + movement.amount,
      count: previous.count + 1,
    });

    if (movement.amount <= 1500) {
      smallExpensesCount += 1;
      smallExpensesTotal += movement.amount;
    }
  }

  const categories = Array.from(
    categoryTotals.entries()
  )
    .map(([name, value]) => ({
      name,
      amount: value.amount / 100,
      count: value.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const netFlow = income - expenses;

  return {
    currency: "PEN",
    income: income / 100,
    expenses: expenses / 100,
    netFlow: netFlow / 100,
    savingsRate:
      income > 0
        ? Math.round((netFlow / income) * 100)
        : null,
    smallExpensesCount,
    smallExpensesTotal: smallExpensesTotal / 100,
    categories,
    transactionCount: movements.length,
    suggestedWeeklySaving:
      Math.max(0, Math.round(netFlow * 0.2)) / 100,
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido.",
    });
  }

  const authorization = req.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      error: "Debes iniciar sesión.",
    });
  }

  if (!geminiApiKey) {
    return res.status(503).json({
      error: "Gemini no está configurado.",
    });
  }

  let uid: string;

  try {
    const firebaseApp = initializeFirebaseAdmin();

    const token = authorization.slice(7);

    const decoded = await getAuth(
      firebaseApp
    ).verifyIdToken(token, true);

    uid = decoded.uid;
  } catch (error) {
    console.error("Error de autenticación BRONX AI:", error);

    return res.status(401).json({
      error: "Tu sesión no es válida. Vuelve a iniciar sesión.",
    });
  }

  try {
    const firebaseApp = getApp();
    const db = getFirestore(firebaseApp);

    const period = getWeekPeriod();

    const reportRef = db
      .collection("users")
      .doc(uid)
      .collection("intelligenceReports")
      .doc(period.reportId);

    // Si ya existe un reporte, reutilizarlo.
    const existing = await reportRef.get();

    if (existing.exists) {
      const data = existing.data();

      if (data?.status === "completed") {
        return res.status(200).json({
          ok: true,
          cached: true,
          report: {
            weekStart: data.weekStart,
            weekEnd: data.weekEnd,
            summary: data.summary,
            advice: data.advice,
          },
        });
      }
    }

    // Reservar la generación para evitar llamadas
    // simultáneas y controlar el consumo de Gemini.
    const reservation = await db.runTransaction(
      async (transaction) => {
        const snapshot = await transaction.get(reportRef);
        const data = snapshot.data();

        if (data?.status === "completed") {
          return "completed";
        }

        if (data?.status === "processing") {
          const startedAt = data.startedAt ?? 0;

          if (
            typeof startedAt === "number" &&
            Date.now() - startedAt < 120000
          ) {
            return "processing";
          }
        }

        transaction.set(reportRef, {
          status: "processing",
          weekStart: period.monday,
          weekEnd: period.sunday,
          startedAt: Date.now(),
          updatedAt: Date.now(),
        });

        return "reserved";
      }
    );

    if (reservation === "completed") {
      const saved = await reportRef.get();
      const data = saved.data();

      return res.status(200).json({
        ok: true,
        cached: true,
        report: {
          weekStart: data?.weekStart,
          weekEnd: data?.weekEnd,
          summary: data?.summary,
          advice: data?.advice,
        },
      });
    }

    if (reservation === "processing") {
      return res.status(202).json({
        ok: false,
        processing: true,
        message:
          "Tu reporte semanal se está generando. Intenta nuevamente en unos segundos.",
      });
    }

    try {
      const snapshot = await db
        .collection("users")
        .doc(uid)
        .collection("transactions")
        .where("createdAt", ">=", period.startMs)
        .where("createdAt", "<", period.endMs)
        .orderBy("createdAt", "desc")
        .limit(MAX_TRANSACTIONS + 1)
        .get();

      if (snapshot.size > MAX_TRANSACTIONS) {
        throw new Error(
          "Hay demasiados movimientos esta semana para generar un reporte completo."
        );
      }

      const movements: Movement[] = snapshot.docs
        .map((doc) => doc.data())
        .filter((data) => {
          return (
            ["income", "expense", "transfer"].includes(
              data.type
            ) &&
            Number.isSafeInteger(data.amount) &&
            data.amount > 0 &&
            typeof data.category === "string" &&
            Number.isSafeInteger(data.createdAt)
          );
        })
        .map((data) => ({
          type: data.type as Movement["type"],
          amount: data.amount,
          category: data.category,
          createdAt: data.createdAt,
        }));

      const summary = summarizeTransactions(movements);

      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
      });

      const prompt = `
Eres BRONX INTELLIGENCE, un asistente de educación
financiera personal para usuarios de Perú.

Analiza únicamente el resumen numérico proporcionado.

Reglas:
- Responde en español peruano, claro y profesional.
- No inventes ingresos, gastos ni ahorros.
- No afirmes que se ahorró dinero si solo existe
  una sugerencia de ahorro.
- Si no hay datos suficientes, indícalo.
- No recomiendes inversiones específicas ni créditos.
- No solicites datos personales.
- No puedes ejecutar operaciones financieras.
- Máximo 250 palabras.
- Incluye un diagnóstico, gastos importantes,
  posibles gastos hormiga y tres recomendaciones.
- Usa montos en soles (S/).

Periodo: ${period.monday} al ${period.sunday}

Resumen financiero:
${JSON.stringify(summary)}
      `.trim();

      const result = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
          maxOutputTokens: 1200,
        },
      });

      const advice = result.text?.trim();

      if (!advice) {
        throw new Error(
          "Gemini no devolvió un análisis."
        );
      }

      const finalAdvice = advice.slice(
        0,
        MAX_RESPONSE_CHARS
      );

      const savedReport = {
        status: "completed",
        weekStart: period.monday,
        weekEnd: period.sunday,
        summary,
        advice: finalAdvice,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await reportRef.set(savedReport);

      return res.status(200).json({
        ok: true,
        cached: false,
        report: {
          weekStart: period.monday,
          weekEnd: period.sunday,
          summary,
          advice: finalAdvice,
        },
      });
    } catch (error) {
      await reportRef.set(
        {
          status: "failed",
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      throw error;
    }
  } catch (error) {
    console.error("Error generando reporte BRONX AI:", error);

    return res.status(500).json({
      error:
        "No se pudo generar el reporte semanal. Intenta nuevamente más tarde.",
    });
  }
}
