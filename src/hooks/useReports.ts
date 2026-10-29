
import { useEffect, useMemo, useState } from "react";

import { useAuthContext } from "../contexts/AuthContext";
import { watchTransactions } from "../services/transactionService";

import {
  calculateReport,
  filterTransactionsByPeriod,
  type ReportPeriod,
} from "../services/reportService";

import type { FinanceTransaction } from "../types/finance";

export function useReports(period: ReportPeriod = "month") {
  const { user } = useAuthContext();

  const [transactions, setTransactions] = useState<
    FinanceTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = watchTransactions(
      user.uid,
      (items) => {
        setTransactions(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filteredTransactions = useMemo(
    () => filterTransactionsByPeriod(transactions, period),
    [transactions, period]
  );

  const report = useMemo(
    () => calculateReport(filteredTransactions),
    [filteredTransactions]
  );

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    report,
    loading,
    error,
    period,
  };
}

export default useReports;
