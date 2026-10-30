
export type IntelligenceSeverity = "info" | "warning" | "success";

export interface IntelligenceAlert {
  id: string;
  title: string;
  message: string;
  severity: IntelligenceSeverity;
}

export interface CategoryInsight {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface FinancialHealth {
  score: number;
  level: "excellent" | "good" | "attention";
  savingsRate: number;
}

export interface IntelligenceReport {
  periodStart: number;
  periodEnd: number;
  income: number;
  expenses: number;
  netFlow: number;
  categories: CategoryInsight[];
  alerts: IntelligenceAlert[];
  health: FinancialHealth;
  suggestedWeeklySaving: number;
}
