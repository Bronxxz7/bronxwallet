
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Eye, EyeOff, Activity } from "lucide-react";

import AnimatedNumber from "../ui/AnimatedNumber";

type Props = {
  balance: number;
  walletCount?: number;
};

export default function BalanceCard({
  balance,
  walletCount = 0,
}: Props) {
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      whileHover={
        reducedMotion ? undefined : { y: -2 }
      }
      className="bronx-balance p-5"
    >
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-slate-400">
            Saldo total
          </span>

          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={
              visible ? "Ocultar saldo" : "Mostrar saldo"
            }
            className="text-slate-400 hover:text-white"
          >
            {visible
              ? <Eye size={17} />
              : <EyeOff size={17} />}
          </button>
        </div>

        <Activity
          size={17}
          className="text-[#709EFF]"
        />
      </div>

      <div className="relative z-10 mt-3">
        <h2 className="text-[34px] font-bold tracking-[-1px] text-white">
          {visible ? (
            <AnimatedNumber value={balance} />
          ) : (
            "S/ ••••••"
          )}
        </h2>
      </div>

      <p className="relative z-10 mt-3 text-[11px] text-slate-400">
        {walletCount}{" "}
        {walletCount === 1 ? "billetera" : "billeteras"}
      </p>
    </motion.section>
  );
}
