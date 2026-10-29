
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { FinanceTransaction } from "../../types/finance";
import { formatMoney } from "../../constants/theme";

type Props = {
  transactions: FinanceTransaction[];
};

export default function IncomeChart({ transactions }: Props) {
  const data = useMemo(() => {
    const totals = new Map<string, number>();

    for (const item of transactions) {
      if (item.type !== "income") continue;

      const date = new Date(item.createdAt);
      if (Number.isNaN(date.getTime())) continue;

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      totals.set(key, (totals.get(key) ?? 0) + item.amount);
    }

    return [...totals.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({
        date: date.slice(5),
        amount: amount / 100,
      }));
  }, [transactions]);

  return (
    <section className="rounded-[26px] border border-white/10 bg-gradient-to-br from-[#171E2B] to-[#0F141D] p-5">
      <h2 className="text-base font-semibold text-white">
        Evolución de ingresos
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Ingresos registrados por día
      </p>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-500">
          Aún no tienes ingresos registrados.
        </div>
      ) : (
        <div className="mt-5 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="bronxIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#25C58B" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#25C58B" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,.06)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#69788D"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                stroke="#69788D"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={35}
              />
              <Tooltip
                formatter={(value) =>
                  formatMoney(Math.round(Number(value ?? 0) * 100))
                }
                contentStyle={{
                  background: "#11151E",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 14,
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#25C58B"
                strokeWidth={3}
                fill="url(#bronxIncome)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
