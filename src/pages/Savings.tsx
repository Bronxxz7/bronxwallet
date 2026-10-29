
import { PiggyBank } from "lucide-react";

export default function Savings() {
  return (
    <main className="min-h-dvh bg-[#080A0E] px-5 pb-32 pt-8 text-white">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#779DFF]">
          BRONXWALLET
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Mis ahorros
        </h1>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-gradient-to-br from-[#191F2B] to-[#10141C] p-6">
          <PiggyBank
            size={30}
            className="text-[#82A5FF]"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Control de ahorros
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Aquí podrás consultar tus metas de ahorro
            y su progreso cuando conectemos esta sección
            con tus datos reales.
          </p>
        </div>
      </div>
    </main>
  );
}
