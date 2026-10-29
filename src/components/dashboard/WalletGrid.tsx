
import { motion, useReducedMotion } from "motion/react";
import {
  ChevronRight,
  Plus,
  Wallet as WalletIcon,
} from "lucide-react";

type WalletItem = {
  id: string;
  name: string;
  balance: number;
};

type Props = {
  wallets: WalletItem[];
  onViewAll?: () => void;
  onAddWallet?: () => void;
};

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

const brands = [
  { key: "yape", file: "yape.png", color: "#8524CE", label: "Y" },
  { key: "bcp", file: "bcp.png", color: "#0757BE", label: "BCP" },
  { key: "prex", file: "prexpe.png", color: "#E8CB25", label: "P" },
  { key: "lemon", file: "lemon-cash.png", color: "#83CF29", label: "L" },
  { key: "binance", file: "binance.png", color: "#D6A72D", label: "B" },
  { key: "paypal", file: "paypal.png", color: "#185CB2", label: "PP" },
  { key: "efectivo", file: "efectivo.png", color: "#E6A62B", label: "S/" },
];

function WalletLogo({ name }: { name: string }) {
  const brand = brands.find((item) =>
    name.toLowerCase().includes(item.key)
  );

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-bold text-white"
      style={{
        background: brand?.color ?? "#263349",
      }}
    >
      {brand ? (
        <>
          <img
            src={`/wallets/${brand.file}`}
            alt={name}
            className="h-full w-full object-contain"
            onError={(event) => {
              event.currentTarget.style.display = "none";

              const fallback =
                event.currentTarget.nextElementSibling;

              if (fallback instanceof HTMLElement) {
                fallback.style.display = "block";
              }
            }}
          />

          <span style={{ display: "none" }}>
            {brand.label}
          </span>
        </>
      ) : (
        <WalletIcon size={18} />
      )}
    </div>
  );
}

export default function WalletGrid({
  wallets,
  onViewAll,
  onAddWallet,
}: Props) {
  const reducedMotion = useReducedMotion();

  function handleViewAll() {
    if (onViewAll) {
      onViewAll();
    } else {
      window.location.assign("/wallets");
    }
  }

  function handleAdd() {
    if (onAddWallet) {
      onAddWallet();
    } else {
      window.location.assign("/wallets?add=1");
    }
  }

  return (
    <section className="mt-7">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">
          Mis billeteras
        </h2>

        <button
          type="button"
          onClick={handleViewAll}
          className="flex items-center gap-1 text-xs text-[#729FFF] transition-colors hover:text-[#A5BEFF]"
        >
          Ver todas
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {wallets.slice(0, 5).map((wallet, index) => (
          <motion.div
            key={wallet.id}
            initial={
              reducedMotion
                ? false
                : { opacity: 0, y: 12 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: reducedMotion ? 0 : index * 0.05,
            }}
            className="bronx-wallet flex min-w-0 items-center gap-2 p-2"
          >
            <WalletLogo name={wallet.name} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-white">
                {wallet.name}
              </p>

              <p className="mt-1 truncate text-[10px] text-slate-300">
                {money.format(wallet.balance / 100)}
              </p>
            </div>
          </motion.div>
        ))}

        <motion.button
          type="button"
          onClick={handleAdd}
          aria-label="Agregar nueva billetera"
          whileTap={
            reducedMotion ? undefined : { scale: 0.95 }
          }
          whileHover={
            reducedMotion ? undefined : { y: -2 }
          }
          className="bronx-wallet flex min-h-[62px] items-center justify-center gap-2 border-dashed text-slate-400 transition-colors hover:text-[#A5BEFF]"
        >
          <Plus size={18} />
          <span className="text-[11px]">Agregar</span>
        </motion.button>
      </div>
    </section>
  );
}
