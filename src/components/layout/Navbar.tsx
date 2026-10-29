
import { Bell, ChevronLeft, Settings2 } from "lucide-react";

type Props = {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onSettings?: () => void;
};

export default function Navbar({
  title = "BRONXWALLET",
  subtitle,
  onBack,
  onSettings,
}: Props) {
  return (
    <header className="flex items-center justify-between gap-3 px-5 pb-5 pt-8">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151B26] text-slate-300"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className="min-w-0">
          {subtitle && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#80A7FF]">
              {subtitle}
            </p>
          )}
          <h1 className="truncate text-xl font-bold tracking-tight text-white">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151B26] text-slate-400">
          <Bell size={18} />
        </span>

        {onSettings && (
          <button
            type="button"
            onClick={onSettings}
            aria-label="Configuración"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#151B26] text-slate-300"
          >
            <Settings2 size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
