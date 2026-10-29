
import { ArrowDown, ArrowUp, PiggyBank } from "lucide-react";
import { formatMoney } from "../../lib/money";
import type { FinanceTransaction } from "../../types/finance";

type Props = {
  transactions: FinanceTransaction[];
};

export default function TodaySummary({ transactions }: Props) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(), now.getMonth(), now.getDate()
  ).getTime();

  const today = transactions.filter(
    (tx) => tx.createdAt >= start
  );

  const expenses = today
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const incomes = today
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const savings = incomes - expenses;

  const items = [
    {
      label: "Gastos",
      value: expenses,
      icon: ArrowDown,
      color: "text-rose-400",
      bg: "bg-rose-500/20",
    },
    {
      label: "Ingresos",
      value: incomes,
      icon: ArrowUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/20",
    },
    {
      label: "Ahorro neto",
      value: savings,
      icon: PiggyBank,
      color: "text-blue-400",
      bg: "bg-blue-500/20",
    },
  ];

  return (
    <section className="mt-7">
      <h3 className="mb-4 text-lg font-bold">
        Resumen de hoy
      </h3>

      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="min-w-0 rounded-2xl border border-white/10 bg-[#111D30] p-3"
          >
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon size={19} className={item.color} />
            </div>

            <p className="text-xs text-slate-400">
              {item.label}
            </p>

            <p className={`mt-1 break-words text-sm font-bold ${item.color}`}>
              {formatMoney(item.value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
