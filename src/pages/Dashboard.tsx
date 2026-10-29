
import { Bell, LogOut, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { signOut } from "firebase/auth";

import { auth } from "../lib/firebase";
import { useAuthContext } from "../contexts/AuthContext";
import { useWallets } from "../hooks/useWallets";
import { useTransactions } from "../hooks/useTransactions";

import AnimatedCard from "../components/ui/AnimatedCard";
import BalanceCard from "../components/dashboard/BalanceCard";
import WalletGrid from "../components/dashboard/WalletGrid";
import WealthChart from "../components/dashboard/WealthChart";
import TodaySummary from "../components/dashboard/TodaySummary";
import RecentTransactions from "../components/dashboard/RecentTransactions";

type Props = {
  onNavigate?: (page: "wallets") => void;
};

export default function Dashboard({
  onNavigate,
}: Props) {
  const { user } = useAuthContext();
  const reducedMotion = useReducedMotion();

  const {
    wallets,
    totalBalance,
    loading: walletsLoading,
    error: walletsError,
  } = useWallets();

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions();

  const loading = walletsLoading || transactionsLoading;
  const error = walletsError || transactionsError;

  return (
    <main className="bronx-dashboard mx-auto min-h-screen max-w-lg px-4 pb-28 pt-7 text-white">
      <header className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet
            size={23}
            className="text-[#729FFF]"
          />

          <h1 className="text-[23px] font-extrabold tracking-[-1px]">
            BRONX
            <span className="text-[#5684FF]">
              WALLET
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Bell
            size={20}
            className="text-slate-400"
          />

          <motion.button
            type="button"
            onClick={() => signOut(auth)}
            whileTap={
              reducedMotion ? undefined : { scale: 0.9 }
            }
            aria-label="Cerrar sesión"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1A202B] text-xs font-semibold"
          >
            {user?.displayName?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              "U"}
            <LogOut size={10} className="ml-1 opacity-50" />
          </motion.button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          Error al consultar Firebase: {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          <div className="fm-skeleton h-36" />
          <div className="grid grid-cols-3 gap-2">
            <div className="fm-skeleton h-16" />
            <div className="fm-skeleton h-16" />
            <div className="fm-skeleton h-16" />
          </div>
          <div className="fm-skeleton h-64" />
          <div className="fm-skeleton h-36" />
        </div>
      ) : !error ? (
        <>
          <AnimatedCard delay={0.04}>
            <BalanceCard
              balance={totalBalance}
              walletCount={wallets.length}
            />
          </AnimatedCard>

          <AnimatedCard delay={0.1}>
            <WalletGrid
              wallets={wallets}
              onViewAll={() => onNavigate?.("wallets")}
            />
          </AnimatedCard>

          <AnimatedCard delay={0.15}>
            <WealthChart
              balance={totalBalance}
              transactions={transactions}
            />
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <TodaySummary
              transactions={transactions}
            />
          </AnimatedCard>

          <AnimatedCard delay={0.25}>
            <RecentTransactions
              transactions={transactions}
              wallets={wallets}
            />
          </AnimatedCard>
        </>
      ) : null}
    </main>
  );
}
