
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Gamepad2,
  House,
  GraduationCap,
  HeartPulse,
  MoreHorizontal,
  BriefcaseBusiness,
  Gift,
  Wallet,
  Check,
  LoaderCircle,
  FileText,
  ChevronDown,
} from "lucide-react";

type MovementType = "expense" | "income" | "transfer";

type WalletItem = {
  id: string;
  name: string;
  balance: number;
};

type Category = {
  id: string;
  label: string;
  icon: typeof Wallet;
  color: string;
};

type MovementPayload = {
  type: MovementType;
  amount: number;
  category: string;
  description: string;
  walletId: string;
  toWalletId?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  wallets: WalletItem[];
  onSave?: (movement: MovementPayload) => Promise<void> | void;
};

const expenseCategories: Category[] = [
  { id: "Comida", label: "Comida", icon: UtensilsCrossed, color: "#F36A7C" },
  { id: "Transporte", label: "Transporte", icon: Bus, color: "#69A1FF" },
  { id: "Compras", label: "Compras", icon: ShoppingBag, color: "#B38AFF" },
  { id: "Entretenimiento", label: "Entretenimiento", icon: Gamepad2, color: "#D28AFF" },
  { id: "Servicios", label: "Servicios", icon: House, color: "#56D4C0" },
  { id: "Educación", label: "Educación", icon: GraduationCap, color: "#78A8FF" },
  { id: "Salud", label: "Salud", icon: HeartPulse, color: "#FF7795" },
  { id: "Otros", label: "Otros", icon: MoreHorizontal, color: "#A5AFC1" },
];

const incomeCategories: Category[] = [
  { id: "Sueldo", label: "Sueldo", icon: BriefcaseBusiness, color: "#45D9AB" },
  { id: "Ventas", label: "Ventas", icon: ShoppingBag, color: "#69A1FF" },
  { id: "Regalo", label: "Regalo", icon: Gift, color: "#D28AFF" },
  { id: "Otros", label: "Otros", icon: MoreHorizontal, color: "#A5AFC1" },
];

const walletImages = [
  { key: "yape", file: "yape.png" },
  { key: "bcp", file: "bcp.png" },
  { key: "prex", file: "prexpe.png" },
  { key: "lemon", file: "lemon-cash.png" },
  { key: "binance", file: "binance.png" },
  { key: "paypal", file: "paypal.png" },
  { key: "efectivo", file: "efectivo.png" },
];

function WalletLogo({ name }: { name: string }) {
  const [failed, setFailed] = useState(false);

  const image = walletImages.find((item) =>
    name.toLowerCase().includes(item.key)
  );

  useEffect(() => setFailed(false), [name]);

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#1A2230]">
      {image && !failed ? (
        <img
          src={`/wallets/${image.file}`}
          alt=""
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <Wallet size={18} className="text-[#8BA6D6]" />
      )}
    </span>
  );
}

function parseAmount(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole, fraction = ""] = normalized.split(".");
  const cents =
    Number(whole) * 100 +
    Number(fraction.padEnd(2, "0"));

  return Number.isSafeInteger(cents) && cents > 0
    ? cents
    : null;
}

export default function QuickAddSheet({
  open,
  onClose,
  wallets,
  onSave,
}: Props) {
  const reducedMotion = useReducedMotion();

  const [type, setType] = useState<MovementType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories =
    type === "income" ? incomeCategories : expenseCategories;

  const accent =
    type === "expense"
      ? "#F36A7C"
      : type === "income"
        ? "#45D9AB"
        : "#6C99FF";

  useEffect(() => {
    if (!open) return;

    setType("expense");
    setAmount("");
    setCategory("Comida");
    setDescription("");
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (!wallets.some((wallet) => wallet.id === walletId)) {
      setWalletId(wallets[0]?.id ?? "");
    }

    if (!wallets.some((wallet) => wallet.id === toWalletId)) {
      setToWalletId(wallets[1]?.id ?? "");
    }
  }, [open, wallets, walletId, toWalletId]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, saving, onClose]);

  function changeType(nextType: MovementType) {
    setType(nextType);
    setCategory(
      nextType === "income"
        ? "Sueldo"
        : nextType === "expense"
          ? "Comida"
          : "Transferencia"
    );
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    const cents = parseAmount(amount);

    if (cents === null) {
      setError("Ingresa un monto válido mayor que cero.");
      return;
    }

    if (!walletId) {
      setError("Selecciona una billetera.");
      return;
    }

    if (type === "transfer") {
      if (!toWalletId || toWalletId === walletId) {
        setError("Selecciona una billetera de destino diferente.");
        return;
      }
    }

    if (!onSave) {
      setError(
        "Falta conectar el guardado de movimientos con Firebase."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      await onSave({
        type,
        amount: cents,
        category,
        description: description.trim(),
        walletId,
        ...(type === "transfer" ? { toWalletId } : {}),
      });

      onClose();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo guardar el movimiento."
      );
    } finally {
      setSaving(false);
    }
  }

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="quick-add-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/80 backdrop-blur-[12px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              onClose();
            }
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bronx-movement-title"
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 70, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.98 }}
            transition={{
              type: "spring",
              stiffness: 330,
              damping: 32,
            }}
            className="bronx-movement-sheet relative flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-[30px] border border-white/[0.09] text-white sm:max-h-[90dvh] sm:rounded-[30px]"
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 h-44 w-64 -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-[75px]" />

            <div className="relative shrink-0 px-5 pt-3">
              <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7B9DDB]">
                    BRONXWALLET
                  </p>

                  <h2
                    id="bronx-movement-title"
                    className="text-[23px] font-bold tracking-tight"
                  >
                    Nuevo movimiento
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  aria-label="Cerrar"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 transition-colors hover:bg-white/10"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mb-1 grid grid-cols-3 gap-1 rounded-[18px] border border-white/[0.06] bg-[#080B11] p-1">
                {([
                  ["expense", "Gasto", ArrowUpRight],
                  ["income", "Ingreso", ArrowDownLeft],
                  ["transfer", "Transferir", ArrowLeftRight],
                ] as const).map(([value, label, Icon]) => {
                  const active = type === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => changeType(value)}
                      className={`relative flex min-w-0 items-center justify-center gap-1.5 rounded-[14px] px-1 py-3 text-[12px] font-semibold transition-colors ${
                        active
                          ? "text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="bronx-movement-tab"
                          className="absolute inset-0 rounded-[14px] border border-white/10"
                          style={{
                            background:
                              type === "expense"
                                ? "linear-gradient(145deg,#803346,#542734)"
                                : type === "income"
                                  ? "linear-gradient(145deg,#166C59,#16483E)"
                                  : "linear-gradient(145deg,#3159A1,#213E73)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 35,
                          }}
                        />
                      )}

                      <Icon size={15} className="relative" />
                      <span className="relative">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5"
            >
              <div className="mb-7 text-center">
                <p className="mb-3 text-xs font-medium text-slate-500">
                  {type === "expense"
                    ? "¿Cuánto gastaste?"
                    : type === "income"
                      ? "¿Cuánto recibiste?"
                      : "¿Cuánto transferirás?"}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-semibold text-slate-500">
                    S/
                  </span>

                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                    placeholder="0.00"
                    aria-label="Monto en soles"
                    className="bronx-amount-input w-[180px] max-w-[65%] bg-transparent text-center text-[42px] font-bold tracking-tight text-white outline-none placeholder:text-slate-600"
                  />
                </div>

                <div
                  className="mx-auto mt-3 h-px w-28"
                  style={{
                    background: `linear-gradient(90deg,transparent,${accent}80,transparent)`,
                  }}
                />
              </div>

              {type !== "transfer" && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-semibold text-slate-300">
                    Categoría
                  </h3>

                  <div className="grid grid-cols-4 gap-2">
                    {categories.map((item) => {
                      const Icon = item.icon;
                      const active = category === item.id;

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => setCategory(item.id)}
                          whileTap={
                            reducedMotion
                              ? undefined
                              : { scale: 0.94 }
                          }
                          className={`relative flex min-h-[83px] min-w-0 flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-1.5 py-2 transition-colors ${
                            active
                              ? "border-white/20 bg-[#202631]"
                              : "border-white/[0.07] bg-[#131820]"
                          }`}
                        >
                          {active && (
                            <span
                              className="pointer-events-none absolute inset-0 opacity-[0.07]"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                          )}

                          <Icon
                            size={21}
                            className="relative"
                            style={{ color: item.color }}
                          />

                          <span className="relative w-full break-words text-center text-[10px] font-medium leading-tight text-slate-300">
                            {item.label}
                          </span>

                          {active && (
                            <span
                              className="absolute bottom-0 h-[2px] w-10 rounded-full"
                              style={{
                                backgroundColor: item.color,
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label
                  htmlFor="bronx-source-wallet"
                  className="mb-3 block text-sm font-semibold text-slate-300"
                >
                  {type === "income"
                    ? "Billetera de destino"
                    : "Billetera de origen"}
                </label>

                <div className="relative flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#111720] p-3">
                  <WalletLogo
                    name={
                      wallets.find((wallet) => wallet.id === walletId)
                        ?.name ?? ""
                    }
                  />

                  <select
                    id="bronx-source-wallet"
                    value={walletId}
                    onChange={(event) =>
                      setWalletId(event.target.value)
                    }
                    className="min-w-0 flex-1 appearance-none bg-transparent pr-7 text-sm font-semibold text-white outline-none"
                  >
                    {wallets.length === 0 && (
                      <option value="" className="bg-[#111720]">
                        No hay billeteras
                      </option>
                    )}

                    {wallets.map((wallet) => (
                      <option
                        key={wallet.id}
                        value={wallet.id}
                        className="bg-[#111720]"
                      >
                        {wallet.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 text-slate-500"
                  />
                </div>
              </div>

              {type === "transfer" && (
                <div className="mb-5">
                  <label
                    htmlFor="bronx-destination-wallet"
                    className="mb-3 block text-sm font-semibold text-slate-300"
                  >
                    Billetera de destino
                  </label>

                  <div className="relative flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#111720] p-3">
                    <WalletLogo
                      name={
                        wallets.find(
                          (wallet) => wallet.id === toWalletId
                        )?.name ?? ""
                      }
                    />

                    <select
                      id="bronx-destination-wallet"
                      value={toWalletId}
                      onChange={(event) =>
                        setToWalletId(event.target.value)
                      }
                      className="min-w-0 flex-1 appearance-none bg-transparent pr-7 text-sm font-semibold text-white outline-none"
                    >
                      {wallets
                        .filter((wallet) => wallet.id !== walletId)
                        .map((wallet) => (
                          <option
                            key={wallet.id}
                            value={wallet.id}
                            className="bg-[#111720]"
                          >
                            {wallet.name}
                          </option>
                        ))}
                    </select>

                    <ChevronDown
                      size={17}
                      className="pointer-events-none absolute right-4 text-slate-500"
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label
                  htmlFor="bronx-description"
                  className="mb-3 block text-sm font-semibold text-slate-300"
                >
                  Descripción{" "}
                  <span className="font-normal text-slate-500">
                    (opcional)
                  </span>
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-[#111720] px-4 py-4 focus-within:border-blue-400/25">
                  <FileText
                    size={19}
                    className="shrink-0 text-slate-500"
                  />

                  <input
                    id="bronx-description"
                    value={description}
                    onChange={(event) =>
                      setDescription(event.target.value)
                    }
                    placeholder="¿En qué consistió?"
                    maxLength={160}
                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300"
                >
                  {error}
                </p>
              )}

              <motion.button
                type="submit"
                disabled={saving || wallets.length === 0}
                whileTap={
                  reducedMotion || saving
                    ? undefined
                    : { scale: 0.98 }
                }
                className="bronx-movement-submit flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background:
                    type === "expense"
                      ? "linear-gradient(135deg,#A93D54,#D24E69)"
                      : type === "income"
                        ? "linear-gradient(135deg,#157A61,#27A77D)"
                        : "linear-gradient(135deg,#3158A8,#3C70D6)",
                }}
              >
                {saving ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={18} />
                )}

                {saving
                  ? "Guardando..."
                  : type === "expense"
                    ? "Guardar gasto"
                    : type === "income"
                      ? "Guardar ingreso"
                      : "Confirmar transferencia"}
              </motion.button>

              <p className="mt-4 text-center text-[10px] text-slate-600">
                BRONXWALLET · Control de tus finanzas
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : null;
}
