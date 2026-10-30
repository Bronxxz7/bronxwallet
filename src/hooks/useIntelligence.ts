
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../lib/firebase";
import { watchTransactions } from "../services/transactionService";
import { analyzeFinancialWeek } from "../services/intelligenceService";

import {
  getSavedWeeklyReport,
  getWeeklyReportHistory,
  getWeekId,
  type SavedWeeklyReport,
} from "../services/weeklyReportService";

import type { FinanceTransaction } from "../types/finance";

export function useIntelligence() {
  const [uid, setUid] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<
    FinanceTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedReport, setSavedReport] =
    useState<SavedWeeklyReport | null>(null);

  const [history, setHistory] = useState<
    SavedWeeklyReport[]
  >([]);

  const [reportsLoading, setReportsLoading] =
    useState(false);

  const [reportsError, setReportsError] =
    useState<string | null>(null);

  useEffect(() => {
    let stopTransactions: (() => void) | undefined;

    const stopAuth = onAuthStateChanged(auth, (user) => {
      stopTransactions?.();
      stopTransactions = undefined;

      setUid(user?.uid ?? null);
      setTransactions([]);
      setSavedReport(null);
      setHistory([]);
      setError(null);
      setReportsError(null);

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      stopTransactions = watchTransactions(
        user.uid,
        (data) => {
          setTransactions(data);
          setLoading(false);
        },
        (err) => {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar tus movimientos."
          );
          setLoading(false);
        }
      );
    });

    return () => {
      stopTransactions?.();
      stopAuth();
    };
  }, []);

  const report = useMemo(
    () => analyzeFinancialWeek(transactions),
    [transactions]
  );

  const weekId = getWeekId(report.periodStart);

  useEffect(() => {
    if (!uid) {
      setReportsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadReports() {
      setReportsLoading(true);
      setReportsError(null);

      try {
        const [currentReport, reportHistory] =
          await Promise.all([
            getSavedWeeklyReport(uid!, weekId),
            getWeeklyReportHistory(uid!),
          ]);

        if (cancelled) return;

        setSavedReport(currentReport);
        setHistory(reportHistory);
      } catch (err) {
        if (cancelled) return;

        setReportsError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los reportes."
        );
      } finally {
        if (!cancelled) {
          setReportsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [uid, weekId]);

  return {
    report,
    transactions,
    loading,
    error,

    savedReport,
    history,
    reportsLoading,
    reportsError,
    weekId,
  };
}
