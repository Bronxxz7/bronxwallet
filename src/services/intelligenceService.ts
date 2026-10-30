 
import type { FinanceTransaction } from "../types/finance";

import type {
  IntelligenceReport,
  IntelligenceAlert,
  CategoryInsight,
  FinancialHealth,
} from "../types/intelligence";

const SMALL_EXPENSE_LIMIT = 1500; // S/ 15 en céntimos

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function getWeekStart(date: Date): number {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);

  // Semana de lunes a domingo
  const day = start.getDay();
  const daysSinceMonday = (day + 6) % 7;

  start.setDate(start.getDate() - daysSinceMonday);

  return start.getTime();
}

function calculateHealth(
  income: number,
  expenses: number
): FinancialHealth {
  if (income <= 0) {
    return {
      score: 0,
      level: "attention",
      savingsRate: 0,
    };
  }

  const savingsRate = ((income - expenses) / income) * 100;

  // Indicador orientativo, no calificación crediticia.
  const spendingControl = expenses <= income ? 50 : 0;

  const savingPoints = Math.max(
    0,
    Math.min(50, savingsRate * 2.5)
  );

  const score = Math.round(
    spendingControl + savingPoints
  );

  return {
    score,
    level:
      score >= 80
        ? "excellent"
        : score >= 50
          ? "good"
          : "attention",
    savingsRate: Math.round(savingsRate),
  };
}

export function analyzeFinancialWeek(
  transactions: FinanceTransaction[],
  referenceDate = new Date()
): IntelligenceReport {
  const periodStart = getWeekStart(referenceDate);

  const nextMonday = new Date(periodStart);
  nextMonday.setDate(nextMonday.getDate() + 7);

  const periodEnd = nextMonday.getTime();

  // No contamos transferencias como ingresos ni gastos
  const currentWeek = transactions.filter(
    (transaction) =>
      transaction.createdAt >= periodStart &&
      transaction.createdAt < periodEnd &&
      (transaction.type === "income" ||
        transaction.type === "expense")
  );

  const income = sum(
    currentWeek
      .filter((transaction) => transaction.type === "income")
      .map((transaction) => transaction.amount)
  );

  const expenseTransactions = currentWeek.filter(
    (transaction) => transaction.type === "expense"
  );

  const expenses = sum(
    expenseTransactions.map(
      (transaction) => transaction.amount
    )
  );

  // Agrupar gastos por categoría
  const categoryMap = new Map<
    string,
    { amount: number; count: number }
  >();

  for (const transaction of expenseTransactions) {
    const category = transaction.category || "Otros";

    const previous = categoryMap.get(category) ?? {
      amount: 0,
      count: 0,
    };

    categoryMap.set(category, {
      amount: previous.amount + transaction.amount,
      count: previous.count + 1,
    });
  }

  const categories: CategoryInsight[] = Array.from(
    categoryMap.entries()
  )
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage:
        expenses > 0
          ? Math.round((data.amount / expenses) * 100)
          : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Alertas financieras
  const alerts: IntelligenceAlert[] = [];

  // Gastos hormiga: hasta S/ 15
  const smallExpenses = expenseTransactions.filter(
    (transaction) =>
      transaction.amount > 0 &&
      transaction.amount <= SMALL_EXPENSE_LIMIT
  );

  const smallExpensesTotal = sum(
    smallExpenses.map(
      (transaction) => transaction.amount
    )
  );

  if (smallExpenses.length >= 4) {
    alerts.push({
      id: "small-expenses",
      title: "Gastos pequeños frecuentes",
      message:
        `Registraste ${smallExpenses.length} gastos ` +
        `de S/ 15 o menos, por un total de ` +
        `S/ ${(smallExpensesTotal / 100).toFixed(2)}.`,
      severity: "info",
    });
  }

  if (income > 0 && expenses > income) {
    alerts.push({
      id: "overspending",
      title: "Gastos superiores a tus ingresos",
      message:
        "Tus gastos registrados esta semana superan " +
        "tus ingresos registrados en el mismo período.",
      severity: "warning",
    });
  }

  const health = calculateHealth(income, expenses);

  if (income > 0 && health.savingsRate >= 20) {
    alerts.push({
      id: "saving-progress",
      title: "Buen margen de ahorro",
      message:
        "Tus ingresos registrados superan tus gastos " +
        "por al menos un 20 % esta semana.",
      severity: "success",
    });
  }

  const netFlow = income - expenses;

  // Sugerencia orientativa: 20 % del flujo neto positivo
  const suggestedWeeklySaving =
    netFlow > 0 ? Math.round(netFlow * 0.2) : 0;

  return {
    periodStart,
    periodEnd,
    income,
    expenses,
    netFlow,
    categories,
    alerts,
    health,
    suggestedWeeklySaving,
  };
}
