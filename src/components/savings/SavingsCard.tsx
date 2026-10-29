
import { motion } from "motion/react";
import { PiggyBank } from "lucide-react";
import { formatMoney } from "../../constants/theme";

type Props = {
  name: string;
  target: number;
  saved: number;
};

export default function SavingsCard({
  name,
  target,
  saved,
}: Props) {
  const progress =
    target > 0 ? Math.min(100, (saved / target) * 100) : 0;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-[25px] border border-white/10 bg-gradient-to-br from-[#1A2130] to-[#10151D] p-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
          <PiggyBank size={23} />
        </span>
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-xs text-slate-500">
            Meta: {formatMoney(target)}
          </p>
        </div>
      </div>

      <p className="mt-6 text-2xl font-bold text-white">
        {formatMoney(saved)}
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-[#80A7FF]"
        />
      </div>

      <p className="mt-3 text-right text-xs text-slate-400">
        {Math.round(progress)}% completado
      </p>
    </motion.article>
  );
}
