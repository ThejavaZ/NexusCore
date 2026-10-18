"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, KeyRound } from "lucide-react";
import { useAuthStore, type User } from "@/store/useAuthStore";
import { api } from "@/utils/api";

interface LoginResponse {
  user: User;
  access_token: string;
  token_type: string;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await api<LoginResponse>("auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.error) {
      setError(response.message);
      setLoading(false);
      return;
    }

    const { user, access_token } = response.data;
    setAuth(user, access_token);

    if (user.role === "admin" || user.role === "staff") {
      router.push("/dashboard");
    } else {
      router.push("/");
    }
    router.refresh();
    setLoading(false);
  };

  const inputClass =
    "w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 text-slate-900 dark:text-white placeholder:text-slate-400";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
            <KeyRound size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Bienvenido de nuevo
          </h1>
          <p className="text-slate-500 mt-2">
            Ingresa a tu cuenta de NexusCore
          </p>
        </div>

        {justRegistered && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-r-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            Cuenta creada — inicia sesión para continuar.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 text-sm font-medium rounded-r-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                required
                disabled={loading}
                className={inputClass}
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Iniciar Sesión <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">
            Cuentas demo
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => { setEmail("admin@nexuscore.dev"); setPassword("password"); }}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition text-left"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200">Admin</span>
              <span className="block text-slate-400">admin@nexuscore.dev</span>
            </button>
            <button
              type="button"
              onClick={() => { setEmail("staff@nexuscore.dev"); setPassword("password"); }}
              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition text-left"
            >
              <span className="font-bold text-slate-800 dark:text-slate-200">Staff</span>
              <span className="block text-slate-400">staff@nexuscore.dev</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Click para autocompletar · password</p>
        </div>

        <div className="mt-6 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
