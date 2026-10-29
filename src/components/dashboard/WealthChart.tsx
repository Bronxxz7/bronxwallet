
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

import type { FinanceTransaction } from "../../types/finance";
import { formatMoney } from "../../lib/money";

type Props = {
  balance: number;
  transactions: FinanceTransaction[];
};

type Period = "7D" | "30D" | "90D";

const periods: Period[] = ["7D", "30D", "90D"];

const currency = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

function makeData(
  balance: number,
  transactions: FinanceTransaction[],
  days: number
) {
  const today = startOfDay(new Date());
  const dayMs = 86400000;

  const result = [];

  let runningBalance = balance;

  for (let offset = 0; offset < days; offset++) {
    const day = today - offset * dayMs;
    const nextDay = offset === 0
      ? Number.POSITIVE_INFINITY
      : day + dayMs;

    result.push({
      date: day,
      balance: runningBalance / 100,
    });

    const movements = transactions.filter(
      (tx) =>
        tx.createdAt >= day &&
        tx.createdAt < nextDay
    );

    for (const tx of movements) {
      if (tx.type === "income") {
        runningBalance -= tx.amount;
      } else if (tx.type === "expense") {
        runningBalance += tx.amount;
      }
    }
  }

  return result.reverse().map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString(
      "es-PE",
      {
        day: "2-digit",
        month: "short",
      }
    ),
  }));
}

export default function WealthChart({
  balance,
  transactions,
}: Props) {
  const [period, setPeriod] = useState<Period>("7D");
  const reducedMotion = useReducedMotion();

  const days =
    period === "7D" ? 7 :
    period === "30D" ? 30 : 90;

  const data = useMemo(
    () => makeData(balance, transactions, days),
    [balance, transactions, days]
  );

  const first = data[0]?.balance ?? 0;
  const last = data[data.length - 1]?.balance ?? 0;
  const difference = last - first;

  return (
    <section className="bronx-chart-card mt-6 overflow-hidden p-4">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp
              size={17}
              className="text-[#6394FF]"
            />
            <h2 className="text-[15px] font-semibold text-white">
              Evolución de tu dinero
            </h2>
          </div>

          <p className="mt-1 text-[11px] text-slate-500">
            Patrimonio estimado
          </p>
        </div>

        <div className="flex rounded-xl border border-white/5 bg-[#090D14] p-1">
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={`relative rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                period === item
                  ? "text-white"
                  : "text-slate-500"
              }`}
            >
              {period === item && (
                <motion.span
                  layoutId="bronx-chart-period"
                  className="absolute inset-0 rounded-lg bg-[#273D66]"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative">{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-baseline gap-3">
        <p className="text-2xl font-bold tracking-tight text-white">
          {formatMoney(balance)}
        </p>

        <span
          className={`text-xs font-semibold ${
            difference >= 0
              ? "text-emerald-400"
              : "text-rose-400"
          }`}
        >
          {difference >= 0 ? "+" : "-"}
          {currency.format(Math.abs(difference))}
        </span>
      </div>

      <div className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 12,
              right: 6,
              left: 6,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="bronxWealthFill"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#3974FF"
                  stopOpacity={0.35}
                />
                <stop
                  offset="60%"
                  stopColor="#3974FF"
                  stopOpacity={0.09}
                />
                <stop
                  offset="100%"
                  stopColor="#3974FF"
                  stopOpacity={0}
                />
              </linearGradient>

              <filter
                id="bronxLineGlow"
                x="-30%"
                y="-50%"
                width="160%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.055)"
              strokeDasharray="3 5"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={18}
              tick={{
                fill: "#657184",
                fontSize: 10,
              }}
              dy={9}
            />

            <Tooltip
              cursor={{
                stroke: "#5D91FF",
                strokeDasharray: "3 4",
                strokeOpacity: 0.5,
              }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) {
                  return null;
                }

                const point = payload[0].payload as {
                  label: string;
                  balance: number;
                };

                return (
                  <div className="rounded-xl border border-[#34455F] bg-[#161E2B]/95 px-3 py-2 shadow-xl backdrop-blur-xl">
                    <p className="text-[10px] text-slate-400">
                      {point.label}
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {currency.format(point.balance)}
                    </p>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke="#3974FF"
              strokeWidth={9}
              strokeOpacity={0.15}
              fill="none"
              filter="url(#bronxLineGlow)"
              dot={false}
              activeDot={false}
              isAnimationActive={!reducedMotion}
            />

            <Area
              type="monotone"
              dataKey="balance"
              stroke="#6296FF"
              strokeWidth={2.5}
              fill="url(#bronxWealthFill)"
              dot={false}
              activeDot={{
                r: 5,
                stroke: "#FFFFFF",
                strokeWidth: 2,
                fill: "#3974FF",
              }}
              isAnimationActive={!reducedMotion}
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
        Evolución calculada a partir de tus movimientos registrados.
      </p>
    </section>
  );
}
