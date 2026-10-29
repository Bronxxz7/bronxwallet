
import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { FinanceTransaction } from "../../types/finance";
import { CATEGORY_COLORS } from "../../constants/categories";
import { formatMoney } from "../../constants/theme";

type Props = {
  transactions: FinanceTransaction[];
};

export default function ExpenseChart({ transactions }: Props) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();

    for (const item of transactions) {
      if (item.type !== "expense") continue;

      const category = item.category || "Otros";
      totals.set(
        category,
        (totals.get(category) ?? 0) + item.amount
      );
    }

    return [...totals.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-[26px] border border-white/10 bg-gradient-to-br from-[#171E2B] to-[#0F141D] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
      <h2 className="text-base font-semibold text-white">
        Gastos por categoría
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Distribución de tus gastos
      </p>

      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-center text-sm text-slate-500">
          Aún no tienes gastos registrados.
        </div>
      ) : (
        <>
          <div className="relative mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="64%"
                  outerRadius="88%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.map((item) => (
                    <Cell
                      key={item.name}
                      fill={
                        CATEGORY_COLORS[item.name] ??
                        CATEGORY_COLORS.Otros
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    formatMoney(Number(value ?? 0))
                  }
                  contentStyle={{
                    background: "#11151E",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 14,
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400">Total</span>
              <strong className="mt-1 text-xl text-white">
                {formatMoney(total)}
              </strong>
            </div>
          </div>

          <div className="mt-3 space-y-3">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background:
                        CATEGORY_COLORS[item.name] ??
                        CATEGORY_COLORS.Otros,
                    }}
                  />
                  <span className="truncate text-slate-300">
                    {item.name}
                  </span>
                </div>

                <span className="font-medium text-white">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
