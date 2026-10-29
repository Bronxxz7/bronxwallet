
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Plus,
  X,
  Check,
  Wallet as WalletIcon,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";

import { useAuthContext } from "../contexts/AuthContext";
import { useWallets } from "../hooks/useWallets";
import { createWallet } from "../services/walletService";
import WalletBrandIcon from "../components/wallets/WalletBrandIcon";

type Brand = {
  id: string;
  name: string;
  color: string;
};

const BRANDS: Brand[] = [
  { id: "yape", name: "Yape", color: "#A229E9" },
  { id: "bcp", name: "BCP", color: "#2563EB" },
  { id: "prexpe", name: "Prexpe", color: "#EABF35" },
  { id: "lemon", name: "Lemon Cash", color: "#A3E635" },
  { id: "binance", name: "Binance", color: "#F3BA2F" },
  { id: "paypal", name: "PayPal", color: "#3B82F6" },
  { id: "efectivo", name: "Efectivo", color: "#F5B83D" },
];

const formatMoney = (cents: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(cents / 100);

function parseMoney(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [whole, decimal = ""] = normalized.split(".");

  const cents =
    Number(whole) * 100 +
    Number(decimal.padEnd(2, "0"));

  return Number.isSafeInteger(cents) && cents >= 0
    ? cents
    : null;
}

export default function Wallets() {
  const { user } = useAuthContext();
  const {
    wallets,
    totalBalance,
    loading,
    error: walletsError,
  } = useWallets();

  const reducedMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("yape");
  const [balance, setBalance] = useState("0");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const existingNames = new Set(
    wallets.map((wallet) =>
      wallet.name.toLowerCase().trim()
    )
  );

  const selectedBrand =
    BRANDS.find((brand) => brand.id === selectedId) ??
    BRANDS[0];

  function openCreateWallet() {
    const firstAvailable = BRANDS.find(
      (brand) =>
        !existingNames.has(brand.name.toLowerCase())
    );

    setSelectedId(firstAvailable?.id ?? "yape");
    setBalance("0");
    setFormError("");
    setIsOpen(true);
  }

  function closeCreateWallet() {
    if (!saving) setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, saving]);

  async function handleCreateWallet() {
    if (saving) return;

    if (!user) {
      setFormError("Debes iniciar sesión.");
      return;
    }

    if (
      existingNames.has(selectedBrand.name.toLowerCase())
    ) {
      setFormError("Esta billetera ya existe.");
      return;
    }

    const cents = parseMoney(balance);

    if (cents === null) {
      setFormError(
        "Ingresa un saldo válido. Ejemplo: 125.50"
      );
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await createWallet(
        user.uid,
        selectedBrand.name,
        cents
      );

      setIsOpen(false);
      setBalance("0");
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo crear la billetera."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <main className="min-h-dvh bg-[#080A0E] px-4 pb-32 pt-7 text-white">
        <div className="mx-auto max-w-lg">
          <header className="mb-7 flex items-center justify-between">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7899DB]">
                BRONXWALLET
              </p>

              <h1 className="text-[27px] font-bold tracking-tight">
                Mis billeteras
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Todas tus cuentas en un solo lugar
              </p>
            </div>

            <motion.button
              type="button"
              onClick={openCreateWallet}
              whileTap={
                reducedMotion ? undefined : { scale: 0.93 }
              }
              aria-label="Agregar billetera"
              className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-[#1B2941] text-[#8FAFFF] shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
            >
              <Plus size={23} />
            </motion.button>
          </header>

          <section className="relative mb-7 overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-br from-[#1B202B] via-[#111720] to-[#17243B] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
            <div className="pointer-events-none absolute -bottom-16 right-0 h-36 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Saldo total
              </p>

              <WalletIcon
                size={19}
                className="text-[#86A8FF]"
              />
            </div>

            <h2 className="relative mt-3 text-[37px] font-bold tracking-tight">
              {formatMoney(totalBalance)}
            </h2>

            <p className="relative mt-3 text-xs text-slate-400">
              {wallets.length}{" "}
              {wallets.length === 1
                ? "billetera registrada"
                : "billeteras registradas"}
            </p>
          </section>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Tus cuentas
            </h2>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
              {wallets.length} activas
            </span>
          </div>

          {walletsError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300"
            >
              {walletsError}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-2xl bg-[#151B25]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {wallets.map((wallet, index) => {
                const brand = BRANDS.find(
                  (item) =>
                    item.name.toLowerCase() ===
                    wallet.name.toLowerCase()
                );

                return (
                  <motion.article
                    key={wallet.id}
                    initial={
                      reducedMotion
                        ? false
                        : { opacity: 0, y: 14 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: reducedMotion
                        ? 0
                        : index * 0.05,
                    }}
                    className="relative min-w-0 overflow-hidden rounded-[21px] border border-white/[0.08] bg-gradient-to-br from-[#1B212C] to-[#10141C] p-4 shadow-[0_8px_26px_rgba(0,0,0,0.18)]"
                  >
                    <div
                      className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 blur-3xl"
                      style={{
                        backgroundColor:
                          brand?.color ?? "#3974FF",
                      }}
                    />

                    <WalletBrandIcon
                      name={wallet.name}
                      size={46}
                    />

                    <p className="relative mt-4 truncate text-sm font-medium text-slate-300">
                      {wallet.name}
                    </p>

                    <p className="relative mt-1 break-words text-[20px] font-bold tracking-tight">
                      {formatMoney(wallet.balance)}
                    </p>
                  </motion.article>
                );
              })}

              <motion.button
                type="button"
                onClick={openCreateWallet}
                whileTap={
                  reducedMotion
                    ? undefined
                    : { scale: 0.96 }
                }
                className="flex min-h-[155px] flex-col items-center justify-center gap-3 rounded-[21px] border border-dashed border-white/15 bg-[#131923]/70 text-slate-400 transition-colors hover:border-blue-400/30 hover:text-white"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#202A39]">
                  <Plus size={22} />
                </span>

                <span className="text-xs font-medium">
                  Agregar billetera
                </span>
              </motion.button>
            </div>
          )}

          <div className="mt-7 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={15} />
            <span>
              Tus billeteras están vinculadas a tu cuenta.
            </span>
          </div>
        </div>
      </main>

      {/* PORTAL: EL MODAL NO QUEDA DETRÁS DE LA NAVEGACIÓN */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="wallet-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  closeCreateWallet();
                }
              }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-wallet-title"
                initial={
                  reducedMotion
                    ? false
                    : { opacity: 0, y: 65, scale: 0.98 }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 45,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 32,
                }}
                className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#131923] p-5 pb-[max(28px,env(safe-area-inset-bottom))] text-white shadow-[0_30px_100px_rgba(0,0,0,0.65)] sm:rounded-[28px]"
              >
                <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-white/15 sm:hidden" />

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7C9EE8]">
                      BRONXWALLET
                    </p>

                    <h2
                      id="create-wallet-title"
                      className="text-xl font-bold"
                    >
                      Nueva billetera
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={closeCreateWallet}
                    disabled={saving}
                    aria-label="Cerrar ventana"
                    className="rounded-full border border-white/10 bg-[#242B37] p-2 text-slate-300 disabled:opacity-50"
                  >
                    <X size={19} />
                  </button>
                </div>

                <p className="mb-3 text-xs font-medium text-slate-400">
                  Selecciona tu billetera
                </p>

                <div className="mb-6 grid grid-cols-4 gap-2">
                  {BRANDS.map((brand) => {
                    const active = selectedId === brand.id;
                    const exists = existingNames.has(
                      brand.name.toLowerCase()
                    );

                    return (
                      <motion.button
                        key={brand.id}
                        type="button"
                        disabled={exists || saving}
                        onClick={() => {
                          setSelectedId(brand.id);
                          setFormError("");
                        }}
                        whileTap={
                          reducedMotion
                            ? undefined
                            : { scale: 0.95 }
                        }
                        className={`relative flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-2xl border p-2 transition-colors ${
                          active
                            ? "border-[#5889F7] bg-[#1D2D49]"
                            : "border-white/[0.08] bg-[#1B222E]"
                        } ${
                          exists
                            ? "cursor-not-allowed opacity-35"
                            : ""
                        }`}
                      >
                        {active && (
                          <Check
                            size={12}
                            className="absolute right-2 top-2 text-[#94B4FF]"
                          />
                        )}

                        <WalletBrandIcon
                          name={brand.name}
                          size={37}
                        />

                        <span className="text-center text-[10px] font-medium leading-tight text-slate-200">
                          {brand.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                <label
                  htmlFor="new-wallet-balance"
                  className="mb-2 block text-xs font-medium text-slate-400"
                >
                  Saldo inicial (S/)
                </label>

                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#090D14] px-4 py-4 focus-within:border-blue-400/50">
                  <span className="text-xl font-semibold text-slate-500">
                    S/
                  </span>

                  <input
                    id="new-wallet-balance"
                    type="text"
                    inputMode="decimal"
                    value={balance}
                    onChange={(event) =>
                      setBalance(event.target.value)
                    }
                    placeholder="0.00"
                    className="w-full bg-transparent text-2xl font-semibold text-white outline-none placeholder:text-slate-600"
                  />
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="mb-4 text-sm text-rose-400"
                  >
                    {formError}
                  </p>
                )}

                <motion.button
                  type="button"
                  onClick={handleCreateWallet}
                  disabled={saving}
                  whileTap={
                    reducedMotion || saving
                      ? undefined
                      : { scale: 0.97 }
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-300/20 bg-gradient-to-b from-[#4B7EF0] to-[#285EDB] py-4 font-semibold text-white shadow-[0_8px_24px_rgba(57,116,255,0.16)] disabled:opacity-50"
                >
                  {saving && (
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Guardando..."
                    : "Crear billetera"}
                </motion.button>

                <button
                  type="button"
                  onClick={closeCreateWallet}
                  disabled={saving}
                  className="mt-4 w-full py-2 text-sm text-slate-500 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
