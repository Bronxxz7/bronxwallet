
import { Target } from "lucide-react";

export default function Budgets() {
  return (
    <main className="min-h-dvh bg-[#080A0E] px-5 pb-32 pt-8 text-white">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#779DFF]">
          BRONXWALLET
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Presupuestos
        </h1>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-gradient-to-br from-[#191F2B] to-[#10141C] p-6">
          <Target
            size={30}
            className="text-[#82A5FF]"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Controla tus límites
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Esta sección mostrará tus presupuestos
            por categoría y cuánto te queda disponible
            cuando configuremos esa funcionalidad.
          </p>
        </div>
      </div>
    </main>
  );
}
