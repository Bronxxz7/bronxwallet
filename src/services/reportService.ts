
import type {
  FinanceTransaction,
  TransactionType,
} from "../types/finance";

export type ReportPeriod = "week" | "month" | "year" | "all";

export type CategoryTotal = {
  category: string;
  amount: number;
  percentage: number;
};

export type DailyTotal = {
  date: string;
  income: number;
  expense: number;
  net: number;
};

export type ReportSummary = {
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  transactionCount: number;
  categories: CategoryTotal[];
  daily: DailyTotal[];
};

function dateKey(timestamp: number): string {
  const date = new Date(timestamp);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getPeriodStart(
  period: ReportPeriod,
  now = new Date()
): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);

  switch (period) {
    case "week": {
      const day = (date.getDay() + 6) % 7;
      date.setDate(date.getDate() - day);
      return date.getTime();
    }

    case "month":
      date.setDate(1);
      return date.getTime();

    case "year":
      date.setMonth(0, 1);
      return date.getTime();

    case "all":
      return 0;
  }
}

export function filterTransactionsByPeriod(
  transactions: FinanceTransaction[],
  period: ReportPeriod,
  now = new Date()
): FinanceTransaction[] {
  const start = getPeriodStart(period, now);
  const end = now.getTime();

  return transactions.filter(
    (item) =>
      Number.isFinite(item.createdAt) &&
      item.createdAt >= start &&
      item.createdAt <= end
  );
}

export function getTotalByType(
  transactions: FinanceTransaction[],
  type: TransactionType
): number {
  return transactions
    .filter((item) => item.type === type)
    .reduce((sum, item) => sum + item.amount, 0);
}

export function calculateReport(
  transactions: FinanceTransaction[]
): ReportSummary {
  const income = getTotalByType(transactions, "income");
  const expense = getTotalByType(transactions, "expense");
  const net = income - expense;

  const categoryMap = new Map<string, number>();
  const dailyMap = new Map<string, DailyTotal>();

  for (const item of transactions) {
    // Las transferencias no son ingresos ni gastos.
    if (item.type === "transfer") continue;

    const key = dateKey(item.createdAt);

    if (!dailyMap.has(key)) {
      dailyMap.set(key, {
        date: key,
        income: 0,
        expense: 0,
        net: 0,
      });
    }

    const day = dailyMap.get(key)!;

    if (item.type === "income") {
      day.income += item.amount;
      day.net += item.amount;
    }

    if (item.type === "expense") {
      day.expense += item.amount;
      day.net -= item.amount;

      const category = item.category || "Otros";

      categoryMap.set(
        category,
        (categoryMap.get(category) ?? 0) + item.amount
      );
    }
  }

  const categories: CategoryTotal[] = [
    ...categoryMap.entries(),
  ]
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        expense > 0 ? (amount / expense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const daily = [...dailyMap.values()].sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  return {
    income,
    expense,
    net,
    savingsRate:
      income > 0 ? (net / income) * 100 : 0,
    transactionCount: transactions.length,
    categories,
    daily,
  };
}
