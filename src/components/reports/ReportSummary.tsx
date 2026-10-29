
import { ArrowDownLeft, ArrowUpRight, PiggyBank } from "lucide-react";

import type { FinanceTransaction } from "../../types/finance";
import { formatMoney } from "../../constants/theme";

type Props = {
  transactions: FinanceTransaction[];
};

export default function ReportSummary({ transactions }: Props) {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const net = income - expense;

  const items = [
    {
      label: "Ingresos",
      amount: income,
      Icon: ArrowDownLeft,
      color: "#25C58B",
    },
    {
      label: "Gastos",
      amount: expense,
      Icon: ArrowUpRight,
      color: "#FB6575",
    },
    {
      label: "Balance neto",
      amount: net,
      Icon: PiggyBank,
      color: "#80A7FF",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(({ label, amount, Icon, color }, index) => (
        <div
          key={label}
          className={`rounded-[23px] border border-white/10 bg-gradient-to-br from-[#192131] to-[#10151E] p-4 ${
            index === 2 ? "col-span-2" : ""
          }`}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              color,
              background: `${color}18`,
            }}
          >
            <Icon size={20} />
          </span>

          <p className="mt-4 text-xs text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-white">
            {formatMoney(amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
