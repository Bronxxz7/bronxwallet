
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <main className="min-h-dvh bg-[#080A0E] px-5 pb-32 pt-8 text-white">
      <div className="mx-auto max-w-lg">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#779DFF]">
          BRONXWALLET
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Configuración
        </h1>

        <div className="mt-8 rounded-[24px] border border-white/10 bg-gradient-to-br from-[#191F2B] to-[#10141C] p-6">
          <SettingsIcon
            size={30}
            className="text-[#82A5FF]"
          />

          <h2 className="mt-5 text-xl font-semibold">
            Preferencias de la aplicación
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Aquí podrás administrar las preferencias
            de BRONXWALLET cuando implementemos
            sus opciones de configuración.
          </p>
        </div>
      </div>
    </main>
  );
}
