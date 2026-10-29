
import { motion, useReducedMotion } from "motion/react";
import {
  House,
  ArrowLeftRight,
  Plus,
  ChartNoAxesColumn,
  Wallet,
} from "lucide-react";

export type NavPage =
  | "dashboard"
  | "transactions"
  | "reports"
  | "wallets";

type Props = {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  onAdd: () => void;
};

const items = [
  {
    id: "dashboard",
    label: "Inicio",
    Icon: House,
  },
  {
    id: "transactions",
    label: "Movimientos",
    Icon: ArrowLeftRight,
  },
  {
    id: "reports",
    label: "Reportes",
    Icon: ChartNoAxesColumn,
  },
  {
    id: "wallets",
    label: "Billeteras",
    Icon: Wallet,
  },
] as const;

export default function BottomNav({
  activePage,
  onNavigate,
  onAdd,
}: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]"
    >
      <div className="bronx-liquid-nav pointer-events-auto relative flex h-[72px] w-full max-w-[420px] items-center justify-around rounded-[24px] px-2">
        {items.slice(0, 2).map(({ id, label, Icon }) => {
          const active = activePage === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative flex h-[60px] w-[58px] items-center justify-center"
            >
              {active && (
                <motion.span
                  layoutId="bronx-liquid-indicator"
                  className="absolute -top-[14px] h-[58px] w-[58px] rounded-full border border-white/70 bg-gradient-to-b from-white to-[#E4E9F4] shadow-[0_8px_25px_rgba(0,0,0,0.4)]"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 360,
                          damping: 27,
                        }
                  }
                />
              )}

              <motion.div
                animate={{
                  y: active ? -14 : 0,
                  scale: active ? 1.08 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 27,
                }}
                className="relative z-10"
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.9}
                  className={
                    active
                      ? "text-[#10141C]"
                      : "text-[#8793A8]"
                  }
                />
              </motion.div>

              {active && (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-[5px] text-[9px] font-medium text-white"
                >
                  {label}
                </motion.span>
              )}
            </button>
          );
        })}

        <motion.button
          type="button"
          onClick={onAdd}
          aria-label="Nuevo movimiento"
          whileTap={
            reducedMotion ? undefined : { scale: 0.9 }
          }
          whileHover={
            reducedMotion ? undefined : { scale: 1.06 }
          }
          className="bronx-nav-add relative z-10 flex h-[51px] w-[51px] shrink-0 items-center justify-center rounded-full"
        >
          <Plus size={26} strokeWidth={2.2} />
        </motion.button>

        {items.slice(2).map(({ id, label, Icon }) => {
          const active = activePage === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className="relative flex h-[60px] w-[58px] items-center justify-center"
            >
              {active && (
                <motion.span
                  layoutId="bronx-liquid-indicator"
                  className="absolute -top-[14px] h-[58px] w-[58px] rounded-full border border-white/70 bg-gradient-to-b from-white to-[#E4E9F4] shadow-[0_8px_25px_rgba(0,0,0,0.4)]"
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 360,
                          damping: 27,
                        }
                  }
                />
              )}

              <motion.div
                animate={{
                  y: active ? -14 : 0,
                  scale: active ? 1.08 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 360,
                  damping: 27,
                }}
                className="relative z-10"
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.9}
                  className={
                    active
                      ? "text-[#10141C]"
                      : "text-[#8793A8]"
                  }
                />
              </motion.div>

              {active && (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-[5px] text-[9px] font-medium text-white"
                >
                  {label}
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
