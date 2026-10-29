
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  ReceiptText,
  Search,
  AlertCircle,
} from "lucide-react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuthContext } from "../contexts/AuthContext";

type Filter = "all" | "expense" | "income" | "transfer";

type TransactionItem = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  createdAt: Date | null;
};

const formatMoney = (cents: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(cents / 100);

function getType(type: string): Filter {
  const normalized = type.toLowerCase();

  if (normalized === "expense" || normalized === "gasto") {
    return "expense";
  }

  if (normalized === "income" || normalized === "ingreso") {
    return "income";
  }

  if (
    normalized === "transfer" ||
    normalized === "transferencia"
  ) {
    return "transfer";
  }

  return "all";
}

function getDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;

  if (typeof value === "number" || typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "expense", label: "Gastos" },
  { id: "income", label: "Ingresos" },
  { id: "transfer", label: "Transferencias" },
];

export default function Transactions() {
  const { user } = useAuthContext();
  const reducedMotion = useReducedMotion();

  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
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

    const transactionsRef = collection(
      db,
      "users",
      user.uid,
      "transactions"
    );

    const transactionsQuery = query(
      transactionsRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((document) => {
          const data = document.data();

          return {
            id: document.id,
            type: String(data.type ?? ""),
            amount:
              typeof data.amount === "number" &&
              Number.isFinite(data.amount)
                ? Math.abs(data.amount)
                : 0,
            category: String(data.category ?? "Otros"),
            description: String(data.description ?? ""),
            createdAt: getDate(data.createdAt),
          };
        });

        setTransactions(items);
        setLoading(false);
      },
      (firebaseError) => {
        setError(firebaseError.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType =
        filter === "all" ||
        getType(transaction.type) === filter;

      const matchesSearch =
        !term ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.description.toLowerCase().includes(term);

      return matchesType && matchesSearch;
    });
  }, [transactions, filter, search]);

  return (
    <main className="min-h-dvh bg-[#080A0E] px-4 pb-32 pt-7 text-white">
      <div className="mx-auto max-w-lg">
        <header className="mb-7">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7899DB]">
            BRONXWALLET
          </p>

          <h1 className="text-[28px] font-bold tracking-tight">
            Movimientos
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Consulta tus ingresos, gastos y transferencias.
          </p>
        </header>

        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#151B25] px-4 py-3 focus-within:border-blue-400/30">
          <Search size={18} className="shrink-0 text-slate-500" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar movimientos..."
            aria-label="Buscar movimientos"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((item) => {
            const active = filter === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-blue-400/25 bg-[#244579] text-white"
                    : "border-white/[0.08] bg-[#151B25] text-slate-400"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-[82px] animate-pulse rounded-2xl bg-[#151B25]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[24px] border border-white/[0.07] bg-gradient-to-br from-[#171D27] to-[#10141B] px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#202A3B]">
              <ReceiptText
                size={25}
                className="text-[#8BAAFF]"
              />
            </div>

            <h2 className="text-base font-semibold">
              No hay movimientos
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {transactions.length === 0
                ? "Tus movimientos aparecerán aquí cuando registres ingresos o gastos."
                : "No encontramos movimientos con estos filtros."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((transaction, index) => {
              const type = getType(transaction.type);
              const isIncome = type === "income";
              const isExpense = type === "expense";

              const Icon = isIncome
                ? ArrowDownLeft
                : isExpense
                  ? ArrowUpRight
                  : ArrowLeftRight;

              const accent = isIncome
                ? "#38D4A3"
                : isExpense
                  ? "#F46A80"
                  : "#80A6FF";

              return (
                <motion.article
                  key={transaction.id}
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, y: 10 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: reducedMotion
                      ? 0
                      : Math.min(index * 0.035, 0.25),
                  }}
                  className="flex items-center gap-3 rounded-[19px] border border-white/[0.075] bg-gradient-to-br from-[#181E29] to-[#10141B] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10"
                    style={{
                      color: accent,
                      backgroundColor: `${accent}16`,
                    }}
                  >
                    <Icon size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {transaction.description ||
                        transaction.category ||
                        "Movimiento"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {transaction.category}
                      {transaction.createdAt
                        ? ` · ${new Intl.DateTimeFormat(
                            "es-PE",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          ).format(transaction.createdAt)}`
                        : ""}
                    </p>
                  </div>

                  <p
                    className="shrink-0 text-sm font-bold"
                    style={{ color: accent }}
                  >
                    {isIncome ? "+" : isExpense ? "-" : ""}
                    {formatMoney(transaction.amount)}
                  </p>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
