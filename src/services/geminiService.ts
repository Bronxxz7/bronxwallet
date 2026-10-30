
import {
  getAI,
  getGenerativeModel,
  GoogleAIBackend,
} from "firebase/ai";

import { app } from "../lib/firebase";
import type { IntelligenceReport } from "../types/intelligence";

const ai = getAI(app, {
  backend: new GoogleAIBackend(),
});

const model = getGenerativeModel(ai, {
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.4,
    maxOutputTokens: 900,
  },
});

export async function generateGeminiWeeklyAdvice(
  report: IntelligenceReport
): Promise<string> {
  const summary = {
    currency: "PEN",
    amountsUnit: "soles",
    income: report.income / 100,
    expenses: report.expenses / 100,
    netFlow: report.netFlow / 100,
    savingsRate: report.health.savingsRate,
    suggestedWeeklySaving:
      report.suggestedWeeklySaving / 100,
    categories: report.categories.map((category) => ({
      name: category.category,
      amount: category.amount / 100,
      percentage: category.percentage,
      transactions: category.count,
    })),
    alerts: report.alerts.map((alert) => ({
      title: alert.title,
      message: alert.message,
    })),
  };

  const prompt = `
Eres BRONX INTELLIGENCE, el asistente financiero
de la aplicación BRONXWALLET en Perú.

Analiza este resumen financiero semanal:

${JSON.stringify(summary)}

REGLAS:
- Responde en español claro y natural.
- Utiliza soles peruanos (S/).
- No inventes cifras ni movimientos.
- No confundas transferencias con gastos.
- No afirmes que el usuario malgastó dinero
  sin evidencia suficiente.
- No juzgues ni avergüences al usuario.
- Si faltan ingresos registrados, aclara
  que el análisis es parcial.
- Da recomendaciones prácticas y realistas.
- No recomiendes inversiones específicas.
- No solicites información personal.
- Máximo 180 palabras.

ESTRUCTURA:
1. Resumen de la semana.
2. Principal oportunidad de mejora.
3. Gastos hormiga, si existen.
4. Tres consejos concretos.
5. Meta de ahorro sugerida.

No utilices tablas.
`;

  try {
    const result = await model.generateContent(prompt);
    const advice = result.response.text().trim();

    if (!advice) {
      throw new Error("Gemini devolvió una respuesta vacía.");
    }

    return advice;
  } catch (error) {
    console.error("BRONX AI:", error);

    throw new Error(
      "No se pudo generar el análisis con Gemini. " +
      "Tus reportes financieros locales siguen disponibles."
    );
  }
}
