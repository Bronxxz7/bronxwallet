
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { watchWallets } from "../services/walletService";
import type { Wallet } from "../types/finance";

export function useWallets() {
  const { user } = useAuthContext();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = watchWallets(
      user.uid,
      (data) => {
        setWallets(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const totalBalance = useMemo(
    () => wallets.reduce(
      (sum, wallet) => sum + wallet.balance, 0
    ),
    [wallets]
  );

  return { wallets, totalBalance, loading, error };
}
