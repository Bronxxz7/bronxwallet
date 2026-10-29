
import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { watchTransactions } from "../services/transactionService";
import type { FinanceTransaction } from "../types/finance";

export function useTransactions() {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    return watchTransactions(
      user.uid,
      (data) => {
        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [user]);

  return { transactions, loading, error };
}
