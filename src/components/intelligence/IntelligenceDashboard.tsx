import { useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  CalendarDays,
  CircleAlert,
  Lightbulb,
  LoaderCircle,
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import { auth } from "../../lib/firebase";
import { useIntelligence } from "../../hooks/useIntelligence";
type WeeklySummary = {
  currency: string;
  income: number;
  expenses: number;
  netFlow: number;
  savingsRate: number | null;
  smallExpensesCount: number;
  smallExpensesTotal: number;
  categories: {
    name: string;
    amount: number;
    count: number;
  }[];
  transactionCount: number;
  suggestedWeeklySaving: number;
};
type GeminiReport = {
  weekStart: string;
  weekEnd: string;
  summary: WeeklySummary;
  advice: string;
};
type ApiResult = {
  ok?: boolean;
  cached?: boolean;
  processing?: boolean;
  message?: string;
  error?: string;
  report?: GeminiReport;
};
function money(cents: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(cents / 100);
}
function soles(amount: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}
function getHealthLabel(score: number, income: number) {
  if (income <= 0) return "Datos insuficientes";
  if (score >= 80) return "Excelente";
  if (score >= 50) return "Estable";
  return "Necesita atención";
}
function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-[26px] border border-white/[0.07] " +
        "bg-white/[0.035] p-5 backdrop-blur-xl " +
        className
      }
    >
      {children}
    </div>
  );
}
export default function IntelligenceDashboard() {
  const { report, loading, error } = useIntelligence();
  const [generating, setGenerating] = useState(false);
  const [geminiReport, setGeminiReport] =
    useState<GeminiReport | null>(null);
  const [geminiError, setGeminiError] = useState("");
  const [geminiMessage, setGeminiMessage] = useState("");
  const [cached, setCached] = useState(false);
  async function generateWeeklyReport() {
    if (generating) return;
    setGenerating(true);
    setGeminiError("");
    setGeminiMessage("");
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          "Debes iniciar sesión para generar tu reporte."
        );
      }
      const token = await user.getIdToken();
      const response = await fetch("/api/weekly-report", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result: ApiResult = await response.json();
      if (response.status === 202 && result.processing) {
        setGeminiMessage(
          result.message ||
            "Tu reporte se está generando. Intenta nuevamente en unos segundos."
        );
        return;
      }
      if (!response.ok || result.ok !== true) {
        throw new Error(
          result.error ||
            `No se pudo generar el reporte (${response.status}).`
        );
      }
      if (
        !result.report ||
        typeof result.report.advice !== "string" ||
        !result.report.summary
      ) {
        throw new Error(
          "El servidor devolvió un reporte incompleto."
        );
      }
      setGeminiReport(result.report);
      setCached(result.cached === true);
    } catch (err) {
      setGeminiError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error inesperado."
      );
    } finally {
      setGenerating(false);
    }
  }
  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center text-white/50">
        <Sparkles className="mr-3 h-5 w-5 animate-pulse text-blue-400" />
        Analizando tus finanzas...
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
        No pudimos cargar tus movimientos: {error}
      </div>
    );
  }
  const healthLabel = getHealthLabel(
    report.health.score,
    report.income
  );
  const maxCategory = Math.max(
    ...report.categories.map((category) => category.amount),
    1
  );
  return (
   <div className="relative mx-auto w-full max-w-3xl pb-4 text-white">
      <div className="pointer-events-none absolute -top-16 left-1/3 h-60 w-60 rounded-full bg-blue-600/[0.08] blur-[100px]" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative space-y-5"
      >
        {/* ENCABEZADO */}
        <div className="flex items-start justify-between gap-3 pt-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
              <Sparkles size={14} />
              BRONX INTELLIGENCE
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Tu dinero, más claro.
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Información inteligente sobre tus finanzas.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-400/15 bg-blue-500/10 p-3 text-blue-300">
            <BrainCircuit size={25} />
          </div>
        </div>
        {/* SALUD FINANCIERA */}
        <GlassCard className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/10 blur-[60px]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <Activity size={16} />
              Salud financiera semanal
            </div>
            <span className="rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1 text-[11px] text-blue-300">
              {healthLabel}
            </span>
          </div>
          <div className="relative mt-6 flex items-end gap-2">
            <span className="text-6xl font-semibold tracking-[-0.06em]">
              {report.health.score}
            </span>
            <span className="mb-2 text-lg text-white/30">
              / 100
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${report.health.score}%`,
              }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-300"
            />
          </div>
          <p className="mt-4 text-xs leading-5 text-white/40">
            Indicador orientativo basado en tus ingresos y
            gastos registrados esta semana. No es una
            calificación crediticia.
          </p>
        </GlassCard>
        {/* INGRESOS Y GASTOS */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard>
            <div className="flex items-center gap-2 text-xs text-white/45">
              <ArrowDownRight
                size={16}
                className="text-emerald-400"
              />
              Ingresos
            </div>
            <p className="mt-3 break-all text-xl font-semibold tracking-tight">
              {money(report.income)}
            </p>
            <p className="mt-1 text-[11px] text-white/30">
              Esta semana
            </p>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 text-xs text-white/45">
              <ArrowUpRight
                size={16}
                className="text-rose-400"
              />
              Gastos
            </div>
            <p className="mt-3 break-all text-xl font-semibold tracking-tight">
              {money(report.expenses)}
            </p>
            <p className="mt-1 text-[11px] text-white/30">
              Esta semana
            </p>
          </GlassCard>
        </div>
        {/* FLUJO NETO */}
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-white/55">
              <Wallet size={17} />
              Flujo neto semanal
            </div>
            <TrendingUp
              size={17}
              className="text-blue-400"
            />
          </div>
          <p
            className={
              "mt-3 text-3xl font-semibold tracking-tight " +
              (report.netFlow >= 0
                ? "text-emerald-300"
                : "text-rose-300")
            }
          >
            {money(report.netFlow)}
          </p>
          <p className="mt-2 text-xs text-white/40">
            Ingresos menos gastos. No representa necesariamente
            el saldo disponible de tus billeteras.
          </p>
        </GlassCard>
        {/* CATEGORÍAS */}
        <GlassCard>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              ¿En qué gastaste?
            </h2>
            <span className="text-xs text-white/35">
              Esta semana
            </span>
          </div>
          {report.categories.length === 0 ? (
            <div className="py-7 text-center text-sm text-white/35">
              Aún no tienes gastos registrados esta semana.
            </div>
          ) : (
            <div className="space-y-5">
              {report.categories.slice(0, 6).map((category) => (
                <div key={category.category}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">
                        {category.category}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/35">
                        {category.count} movimientos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {money(category.amount)}
                      </p>
                      <p className="text-[11px] text-white/35">
                        {category.percentage} %
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{
                        width: `${
                          (category.amount / maxCategory) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
        {/* ALERTAS */}
        <GlassCard>
          <div className="mb-4 flex items-center gap-2">
            <CircleAlert
              size={18}
              className="text-amber-300"
            />
            <h2 className="text-base font-semibold">
              Alertas inteligentes
            </h2>
          </div>
          {report.alerts.length === 0 ? (
            <div className="flex items-start gap-3 rounded-2xl bg-white/[0.035] p-4">
              <ShieldCheck
                size={19}
                className="shrink-0 text-emerald-400"
              />
              <p className="text-sm leading-6 text-white/50">
                No se detectaron alertas con las reglas
                actuales. Sigue registrando tus movimientos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.035] p-4"
                >
                  <p className="text-sm font-medium">
                    {alert.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/45">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
        {/* AHORRO */}
        <GlassCard className="border-blue-400/15 bg-blue-500/[0.055]">
          <div className="flex items-center gap-2 text-blue-300">
            <PiggyBank size={19} />
            <h2 className="text-base font-semibold">
              Oportunidad de ahorro
            </h2>
          </div>
          <p className="mt-4 text-3xl font-semibold">
            {money(report.suggestedWeeklySaving)}
          </p>
          <p className="mt-2 text-xs leading-5 text-white/45">
            Propuesta inicial basada en el 20 % de tu flujo
            neto semanal positivo. No es dinero ya ahorrado.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/[0.04] p-3">
            <Lightbulb
              size={16}
              className="mt-0.5 shrink-0 text-amber-300"
            />
            <p className="text-xs leading-5 text-white/60">
              Revisa tus gastos más frecuentes y elige un
              objetivo pequeño que puedas mantener cada semana.
            </p>
          </div>
        </GlassCard>
        {/* GEMINI AI */}
        <GlassCard className="border-blue-400/15">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
              <Sparkles size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                Reporte con Gemini
              </p>
              <p className="mt-1 text-xs text-white/40">
                Análisis financiero personalizado de tu semana
              </p>
            </div>
            {geminiReport && (
              <ShieldCheck
                size={20}
                className="text-emerald-400"
              />
            )}
          </div>
          {!geminiReport && (
            <button
              type="button"
              onClick={generateWeeklyReport}
              disabled={generating}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Gemini está analizando...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generar mi reporte con Gemini
                </>
              )}
            </button>
          )}
          {geminiError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-300"
            >
              {geminiError}
            </div>
          )}
          {geminiMessage && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-5 text-blue-300"
            >
              {geminiMessage}
            </div>
          )}
          {geminiReport && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 space-y-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                  Reporte generado
                </span>
                {cached && (
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[11px] text-blue-300">
                    Recuperado de Firestore
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/45">
                <CalendarDays size={15} />
                {geminiReport.weekStart} al{" "}
                {geminiReport.weekEnd}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-[11px] text-white/40">
                    Gastos analizados
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {soles(geminiReport.summary.expenses)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-[11px] text-white/40">
                    Gastos hormiga
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {soles(
                      geminiReport.summary.smallExpensesTotal
                    )}
                  </p>
                  <p className="mt-1 text-[10px] text-white/35">
                    {
                      geminiReport.summary
                        .smallExpensesCount
                    }{" "}
                    movimientos pequeños
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-400/10 bg-blue-500/[0.055] p-4">
                <div className="mb-4 flex items-center gap-2 text-blue-300">
                  <BrainCircuit size={18} />
                  <h3 className="text-sm font-semibold">
                    Análisis de BRONX AI
                  </h3>
                </div>
                <div className="break-words text-sm leading-7 text-white/75">
                  <ReactMarkdown
                    components={{
                      strong: ({ children }) => (
                        <strong className="font-bold text-blue-200">{children}</strong>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 last:mb-0">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="mb-3 mt-5 text-lg font-bold text-blue-300">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-3 mt-5 text-base font-bold text-blue-300">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-2 mt-4 font-bold text-blue-300">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 list-disc space-y-1 pl-5">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 list-decimal space-y-1 pl-5">{children}</ol>
                      ),
                      li: ({ children }) => <li className="pl-1">{children}</li>,
                    }}
                  >
                    {geminiReport.advice}
                  </ReactMarkdown>
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.035] p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <PiggyBank
                    size={17}
                    className="text-blue-300"
                  />
                  Ahorro semanal sugerido
                </div>
                <p className="mt-3 text-2xl font-semibold text-emerald-300">
                  {soles(
                    geminiReport.summary
                      .suggestedWeeklySaving
                  )}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/40">
                  Es una recomendación, no un ahorro
                  realizado ni una transferencia automática.
                </p>
              </div>
              <button
                type="button"
                onClick={generateWeeklyReport}
                disabled={generating}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={
                    generating ? "animate-spin" : ""
                  }
                />
                Consultar reporte guardado
              </button>
            </motion.div>
          )}
          <p className="mt-4 text-[11px] leading-5 text-white/30">
            Gemini analiza un resumen de tus movimientos.
            No puede modificar saldos ni ejecutar pagos.
            El reporte semanal se guarda para evitar
            generaciones repetidas.
          </p>
        </GlassCard>
        <p className="pb-4 text-center text-[11px] text-white/25">
          BRONX INTELLIGENCE · Tus datos, tus decisiones.
        </p>
      </motion.div>
    </div>
  );
}
