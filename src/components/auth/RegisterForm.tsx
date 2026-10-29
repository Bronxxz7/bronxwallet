

import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

type Props = {
  onSubmit: (email: string, password: string) => Promise<void>;
};

export default function RegisterForm({ onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await onSubmit(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la cuenta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Correo electrónico</span>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#11151E] px-4">
          <Mail size={18} className="text-slate-500" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="h-14 w-full bg-transparent text-white outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Contraseña</span>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#11151E] px-4">
          <LockKeyhole size={18} className="text-slate-500" />
          <input
            type={visible ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="h-14 w-full bg-transparent text-white outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label="Mostrar u ocultar contraseña"
            className="text-slate-400"
          >
            {visible ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Confirmar contraseña</span>
        <input
          type={visible ? "text" : "password"}
          required
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repite tu contraseña"
          className="h-14 w-full rounded-2xl border border-white/10 bg-[#11151E] px-4 text-white outline-none"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-14 w-full rounded-2xl bg-[#3974FF] font-semibold text-white transition disabled:opacity-50"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
