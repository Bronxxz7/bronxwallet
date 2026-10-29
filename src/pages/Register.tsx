
import { useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Wallet } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(result.user, {
        displayName: name.trim(),
      });
    } catch {
      setError("No se pudo crear la cuenta. Verifica tus datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D17] flex items-center justify-center p-5 text-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#3974FF] p-4 rounded-2xl mb-4">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-bold">FlowMoney</h1>
          <p className="text-slate-400 mt-2">
            Crea tu cuenta personal
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-[#111D30] border border-white/10 rounded-3xl p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold">
            Crear cuenta
          </h2>

          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full bg-[#080D17] p-3 rounded-xl outline-none"
          />

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Correo electrónico"
            className="w-full bg-[#080D17] p-3 rounded-xl outline-none"
          />

          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña (mínimo 6 caracteres)"
            className="w-full bg-[#080D17] p-3 rounded-xl outline-none"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-[#3974FF] py-3 rounded-xl font-semibold disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>

          <p className="text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-[#3974FF]">
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
