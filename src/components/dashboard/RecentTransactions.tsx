
import {
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

import { formatMoney } from "../../lib/money";
import type {
  FinanceTransaction,
  Wallet,
} from "../../types/finance";

type Props = {
  transactions: FinanceTransaction[];
  wallets: Wallet[];
};

export default function RecentTransactions({
  transactions,
  wallets,
}: Props) {
  return (
    <section className="mt-7">
      <h3 className="mb-4 text-lg font-bold">
        Últimos movimientos
      </h3>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111D30]">
        {transactions.length === 0 && (
          <p className="p-5 text-center text-sm text-slate-400">
            Todavía no tienes movimientos.
          </p>
        )}

        {transactions.slice(0, 5).map((tx) => {
          const expense = tx.type === "expense";

          const wallet = wallets.find(
            (item) => item.id === tx.walletId
          );

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 border-b border-white/5 p-4 last:border-b-0"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                expense ? "bg-rose-500/20" : "bg-emerald-500/20"
              }`}>
                {expense
                  ? <ArrowUpRight className="text-rose-400" />
                  : <ArrowDownLeft className="text-emerald-400" />}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {tx.description || tx.category}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {wallet?.name || "Billetera"} ·{" "}
                  {new Date(tx.createdAt).toLocaleDateString("es-PE")}
                </p>
              </div>

              <p className={`shrink-0 text-sm font-bold ${
                expense ? "text-rose-400" : "text-emerald-400"
              }`}>
                {expense ? "-" : "+"}{formatMoney(tx.amount)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
