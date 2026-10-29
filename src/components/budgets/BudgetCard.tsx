
import { motion } from "motion/react";
import { Target } from "lucide-react";
import { formatMoney } from "../../constants/theme";

type Props = {
  category: string;
  limit: number;
  spent: number;
};

export default function BudgetCard({
  category,
  limit,
  spent,
}: Props) {
  const percentage =
    limit > 0 ? (spent / limit) * 100 : 0;

  const exceeded = spent > limit;
  const remaining = Math.max(0, limit - spent);

  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#171E2B] to-[#10141C] p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3974FF]/10 text-[#80A7FF]">
            <Target size={20} />
          </span>
          <div>
            <h3 className="font-semibold text-white">{category}</h3>
            <p className="text-xs text-slate-500">
              Límite: {formatMoney(limit)}
            </p>
          </div>
        </div>
        <span className="text-sm font-semibold text-slate-300">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percentage)}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{
            background: exceeded ? "#FB6575" : "#3974FF",
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Gastado: {formatMoney(spent)}
        </span>
        <span className={exceeded ? "text-[#FB6575]" : "text-[#25C58B]"}>
          {exceeded
            ? `Excedido: ${formatMoney(spent - limit)}`
            : `Disponible: ${formatMoney(remaining)}`}
        </span>
      </div>
    </motion.article>
  );
}
