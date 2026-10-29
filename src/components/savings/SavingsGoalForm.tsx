
import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

type Props = {
  onClose: () => void;
  onSave: (goal: {
    name: string;
    target: number;
  }) => Promise<void>;
};

export default function SavingsGoalForm({
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const target = Math.round(Number(amount) * 100);

    if (!name.trim()) {
      setError("Ingresa un nombre para tu meta.");
      return;
    }

    if (!Number.isSafeInteger(target) || target <= 0) {
      setError("Ingresa un monto válido.");
      return;
    }

    setLoading(true);

    try {
      await onSave({
        name: name.trim(),
        target,
      });
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la meta."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-[#121824] p-6 text-white shadow-2xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Nueva meta de ahorro</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-xl bg-white/5 p-2 text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <label className="mt-6 block text-sm text-slate-300">
        Nombre de la meta
        <input
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Nueva laptop"
          className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-[#080D16] px-4 text-white outline-none focus:border-[#3974FF]"
        />
      </label>

      <label className="mt-5 block text-sm text-slate-300">
        Monto objetivo (S/)
        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="mt-2 h-14 w-full rounded-2xl border border-white/10 bg-[#080D16] px-4 text-white outline-none focus:border-[#3974FF]"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 text-sm text-[#FB6575]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 h-14 w-full rounded-2xl bg-[#3974FF] font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar meta"}
      </button>
    </form>
  );
}
