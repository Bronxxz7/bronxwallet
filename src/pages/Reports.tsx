
import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ChartNoAxesColumnIncreasing,
  PiggyBank,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { db } from "../lib/firebase";
import { useAuthContext } from "../contexts/AuthContext";

type Period = "week" | "month" | "year";

type FinanceTransaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  createdAt: Date;
};

type ChartPoint = {
  label: string;
  income: number;
  expense: number;
};

const COLORS = [
  "#F35C78",
  "#477FFF",
  "#916BFF",
  "#32CDA1",
  "#F5C653",
  "#8395B5",
  "#39B8DF",
];

const money = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value / 100);

const shortMoney = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    maximumFractionDigits: 0,
  }).format(value / 100);

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();

  if (value instanceof Date) return value;

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }

  return new Date(0);
}

function normalizeType(value: string): "income" | "expense" | "other" {
  const type = value.toLowerCase();

  if (type === "income" || type === "ingreso") {
    return "income";
  }

  if (type === "expense" || type === "gasto") {
    return "expense";
  }

  return "other";
}

function getPeriodRange(
  period: Period,
  offset: number
): { start: Date; end: Date } {
  const now = new Date();

  if (period === "week") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const day = (start.getDay() + 6) % 7;

    start.setDate(start.getDate() - day + offset * 7);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }

  if (period === "month") {
    return {
      start: new Date(
        now.getFullYear(),
        now.getMonth() + offset,
        1
      ),
      end: new Date(
        now.getFullYear(),
        now.getMonth() + offset + 1,
        1
      ),
    };
  }

  return {
    start: new Date(now.getFullYear() + offset, 0, 1),
    end: new Date(now.getFullYear() + offset + 1, 0, 1),
  };
}

function getPeriodLabel(period: Period, start: Date): string {
  if (period === "year") {
    return String(start.getFullYear());
  }

  if (period === "month") {
    return new Intl.DateTimeFormat("es-PE", {
      month: "long",
      year: "numeric",
    }).format(start);
  }

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const format = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
  });

  return `${format.format(start)} - ${format.format(end)}`;
}

function getBucket(
  date: Date,
  period: Period,
  start: Date
): number {
  if (period === "week") {
    return Math.floor(
      (date.getTime() - start.getTime()) / 86400000
    );
  }

  if (period === "month") {
    return Math.floor((date.getDate() - 1) / 7);
  }

  return date.getMonth();
}

function buildChartData(
  transactions: FinanceTransaction[],
  period: Period,
  start: Date
): ChartPoint[] {
  const count =
    period === "week" ? 7 : period === "month" ? 5 : 12;

  const points: ChartPoint[] = Array.from(
    { length: count },
    (_, index) => ({
      label:
        period === "week"
          ? ["L", "M", "X", "J", "V", "S", "D"][index]
          : period === "month"
            ? `S${index + 1}`
            : [
                "Ene", "Feb", "Mar", "Abr",
                "May", "Jun", "Jul", "Ago",
                "Sep", "Oct", "Nov", "Dic",
              ][index],
      income: 0,
      expense: 0,
    })
  );

  for (const tx of transactions) {
    const index = getBucket(tx.createdAt, period, start);

    if (index < 0 || index >= points.length) continue;

    const type = normalizeType(tx.type);

    if (type === "income") {
      points[index].income += tx.amount;
    }

    if (type === "expense") {
      points[index].expense += tx.amount;
    }
  }

  return points;
}

function StatCard({
  title,
  value,
  icon,
  accent,
  delay = 0,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-[20px] border border-white/[0.075] bg-gradient-to-br from-[#1A202A] to-[#10141B] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
    >
      <div
        className="pointer-events-none absolute -right-7 -top-8 h-24 w-24 rounded-full blur-3xl"
        style={{ backgroundColor: `${accent}18` }}
      />

      <div className="relative flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10"
          style={{
            backgroundColor: `${accent}18`,
            color: accent,
          }}
        >
          {icon}
        </div>

        <p className="text-xs text-slate-400">{title}</p>
      </div>

      <p className="relative mt-4 break-words text-[22px] font-bold tracking-tight text-white">
        {value}
      </p>
    </motion.div>
  );
}

function ChartPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[23px] border border-white/[0.075] bg-gradient-to-b from-[#161C26] to-[#0F131A] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.2)]">
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-48 rounded-full bg-blue-500/[0.055] blur-3xl" />

      <h2 className="relative mb-5 text-sm font-semibold text-white">
        {title}
      </h2>

      <div className="relative">{children}</div>
    </section>
  );
}

export default function Reports() {
  const { user } = useAuthContext();
  const reducedMotion = useReducedMotion();

  const [period, setPeriod] = useState<Period>("month");
  const [offset, setOffset] = useState(0);
  const [transactions, setTransactions] = useState<
    FinanceTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const ref = collection(
      db,
      "users",
      user.uid,
      "transactions"
    );

    const q = query(ref, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: FinanceTransaction[] =
          snapshot.docs.map((doc) => {
            const item = doc.data();

            return {
              id: doc.id,
              type: String(item.type ?? ""),
              amount:
                typeof item.amount === "number" &&
                Number.isFinite(item.amount)
                  ? Math.abs(item.amount)
                  : 0,
              category: String(
                item.category ?? "Otros"
              ),
              createdAt: toDate(item.createdAt),
            };
          });

        setTransactions(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const range = useMemo(
    () => getPeriodRange(period, offset),
    [period, offset]
  );

  const filtered = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.createdAt >= range.start &&
          tx.createdAt < range.end
      ),
    [transactions, range]
  );

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;

    const categories = new Map<string, number>();

    for (const tx of filtered) {
      const type = normalizeType(tx.type);

      if (type === "income") {
        income += tx.amount;
      }

      if (type === "expense") {
        expense += tx.amount;

        const category = tx.category || "Otros";

        categories.set(
          category,
          (categories.get(category) ?? 0) + tx.amount
        );
      }
    }

    const savings = income - expense;

    const savingsRate =
      income > 0 ? (savings / income) * 100 : 0;

    const categoryData = Array.from(
      categories.entries()
    )
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      income,
      expense,
      savings,
      savingsRate,
      categoryData,
    };
  }, [filtered]);

  const chartData = useMemo(
    () => buildChartData(filtered, period, range.start),
    [filtered, period, range]
  );

  function changePeriod(next: Period) {
    setPeriod(next);
    setOffset(0);
  }

  return (
    <main className="min-h-dvh bg-[#080A0E] px-4 pb-32 pt-7 text-white">
      <div className="mx-auto max-w-lg space-y-6">
        {/* ENCABEZADO */}
        <header>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7899DB]">
            BRONXWALLET
          </p>

          <h1 className="text-[28px] font-bold tracking-tight">
            Reportes
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Tu dinero, analizado con claridad.
          </p>
        </header>

        {/* SELECTOR DE PERIODO */}
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/[0.07] bg-[#151A23] p-1">
          {(
            [
              ["week", "Semana"],
              ["month", "Mes"],
              ["year", "Año"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changePeriod(value)}
              className={`relative rounded-xl py-3 text-xs font-semibold transition-colors ${
                period === value
                  ? "text-white"
                  : "text-slate-500"
              }`}
            >
              {period === value && (
                <motion.span
                  layoutId="report-period"
                  className="absolute inset-0 rounded-xl border border-blue-300/20 bg-gradient-to-b from-[#487AF0] to-[#2758C8] shadow-[0_4px_15px_rgba(57,116,255,0.15)]"
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 30,
                  }}
                />
              )}

              <span className="relative z-10">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* NAVEGACIÓN ENTRE FECHAS */}
        <div className="flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={() => setOffset((prev) => prev - 1)}
            aria-label="Periodo anterior"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#171D27] text-slate-300"
          >
            <ChevronLeft size={19} />
          </button>

          <p className="min-w-[150px] text-center text-sm font-semibold capitalize">
            {getPeriodLabel(period, range.start)}
          </p>

          <button
            type="button"
            onClick={() => setOffset((prev) => prev + 1)}
            disabled={offset >= 0}
            aria-label="Periodo siguiente"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#171D27] text-slate-300 disabled:opacity-25"
          >
            <ChevronRight size={19} />
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            No se pudieron cargar los movimientos: {error}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            <div className="h-40 animate-pulse rounded-2xl bg-[#171D27]" />
            <div className="h-64 animate-pulse rounded-2xl bg-[#171D27]" />
          </div>
        ) : (
          <>
            {/* RESUMEN */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                title="Ingresos"
                value={money(summary.income)}
                icon={<ArrowDownLeft size={21} />}
                accent="#34D3A2"
              />

              <StatCard
                title="Gastos"
                value={money(summary.expense)}
                icon={<ArrowUpRight size={21} />}
                accent="#F35C78"
                delay={0.05}
              />

              <StatCard
                title="Ahorro neto"
                value={money(summary.savings)}
                icon={<PiggyBank size={21} />}
                accent="#729AFF"
                delay={0.1}
              />

              <StatCard
                title="Tasa de ahorro"
                value={`${summary.savingsRate.toFixed(1)}%`}
                icon={<TrendingUp size={21} />}
                accent="#AA7BFF"
                delay={0.15}
              />
            </div>

            {/* GRÁFICO DE GASTOS POR CATEGORÍA */}
            <ChartPanel title="Gastos por categoría">
              {summary.categoryData.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center text-center">
                  <Wallet
                    size={28}
                    className="mb-3 text-slate-600"
                  />
                  <p className="text-sm text-slate-400">
                    Aún no hay gastos en este periodo
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={summary.categoryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={3}
                          stroke="none"
                          isAnimationActive={!reducedMotion}
                        >
                          {summary.categoryData.map(
                            (entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  COLORS[index % COLORS.length]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            money(Number(value))
                          }
                          contentStyle={{
                            background: "#151C28",
                            border: "1px solid #303B50",
                            borderRadius: 14,
                            color: "#FFFFFF",
                          }}
                          itemStyle={{ color: "#FFFFFF" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 space-y-3">
                    {summary.categoryData.map(
                      (category, index) => {
                        const percent =
                          summary.expense > 0
                            ? (category.value /
                                summary.expense) *
                              100
                            : 0;

                        return (
                          <div
                            key={category.name}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    COLORS[
                                      index % COLORS.length
                                    ],
                                }}
                              />

                              <span className="truncate text-xs text-slate-300">
                                {category.name}
                              </span>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span className="text-xs text-slate-400">
                                {money(category.value)}
                              </span>

                              <span className="w-10 text-right text-xs font-semibold">
                                {percent.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </>
              )}
            </ChartPanel>

            {/* EVOLUCIÓN DE GASTOS */}
            <ChartPanel title="Evolución de gastos">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 4,
                      left: -18,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="bronxBarGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#76A0FF"
                        />
                        <stop
                          offset="100%"
                          stopColor="#245BD8"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#FFFFFF"
                      strokeOpacity={0.06}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fill: "#8190A8",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#8190A8",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={shortMoney}
                    />

                    <Tooltip
                      formatter={(value) =>
                        money(Number(value))
                      }
                      contentStyle={{
                        background: "#151C28",
                        border: "1px solid #303B50",
                        borderRadius: 14,
                        color: "#FFFFFF",
                      }}
                      cursor={{
                        fill: "rgba(255,255,255,0.025)",
                      }}
                    />

                    <Bar
                      dataKey="expense"
                      name="Gastos"
                      fill="url(#bronxBarGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={38}
                      isAnimationActive={!reducedMotion}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            {/* INGRESOS VS GASTOS */}
            <ChartPanel title="Ingresos vs. gastos">
              <div className="mb-4 flex items-center gap-4">
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Ingresos
                </span>

                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  Gastos
                </span>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 4,
                      left: -18,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="bronxIncomeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34D3A2"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#34D3A2"
                          stopOpacity={0}
                        />
                      </linearGradient>

                      <linearGradient
                        id="bronxExpenseGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#F35C78"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor="#F35C78"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#FFFFFF"
                      strokeOpacity={0.06}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tick={{
                        fill: "#8190A8",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fill: "#8190A8",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={shortMoney}
                    />

                    <Tooltip
                      formatter={(value) =>
                        money(Number(value))
                      }
                      contentStyle={{
                        background: "#151C28",
                        border: "1px solid #303B50",
                        borderRadius: 14,
                        color: "#FFFFFF",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Ingresos"
                      stroke="#34D3A2"
                      strokeWidth={2.5}
                      fill="url(#bronxIncomeGradient)"
                      isAnimationActive={!reducedMotion}
                    />

                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Gastos"
                      stroke="#F35C78"
                      strokeWidth={2.5}
                      fill="url(#bronxExpenseGradient)"
                      isAnimationActive={!reducedMotion}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartPanel>

            <div className="flex items-center justify-center gap-2 pb-3 text-xs text-slate-500">
              <ChartNoAxesColumnIncreasing size={15} />
              <span>
                Datos calculados a partir de tus movimientos
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
