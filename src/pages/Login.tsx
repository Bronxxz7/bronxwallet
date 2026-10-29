
import { useState, type FormEvent } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Wallet, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080D17] flex items-center justify-center p-5 text-white">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-[#3974FF] p-4 rounded-2xl mb-4">
            <Wallet size={32} />
          </div>
          <h1 className="text-3xl font-bold">FlowMoney</h1>
          <p className="text-slate-400 mt-2">
            Controla tu dinero fácilmente
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-[#111D30] border border-white/10 rounded-3xl p-6 space-y-5"
        >
          <h2 className="text-xl font-semibold">
            Iniciar sesión
          </h2>

          <div>
            <label className="text-sm text-slate-400">
              Correo electrónico
            </label>
            <div className="flex items-center bg-[#080D17] rounded-xl px-3 mt-2">
              <Mail size={18} className="text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400">
              Contraseña
            </label>
            <div className="flex items-center bg-[#080D17] rounded-xl px-3 mt-2">
              <Lock size={18} className="text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent p-3 outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            disabled={loading}
            className="w-full bg-[#3974FF] rounded-xl py-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          <p className="text-center text-sm text-slate-400">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-[#3974FF]">
              Regístrate
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}
