"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

interface RegisterErrors {
  [key: string]: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    if (formData.password !== formData.password_confirmation) {
      setErrors({ password: ["Las contraseñas no coinciden"] });
      setLoading(false);
      return;
    }

    const response = await api("auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    if (response.error) {
      setErrors(response.errors || { general: [response.message] });
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  };

  const inputClass =
    "w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50 text-slate-900 dark:text-white placeholder:text-slate-400";

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Crea tu cuenta</h1>
          <p className="text-slate-500 mt-2">
            Únete a la comunidad de NexusCore
          </p>
        </div>

        {errors && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/40">
            <p className="font-bold mb-1">Hay problemas con los datos:</p>
            <ul className="list-disc pl-4">
              {Object.values(errors)
                .flat()
                .map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                required
                disabled={loading}
                className={inputClass}
                placeholder="Tu nombre"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                required
                disabled={loading}
                className={inputClass}
                placeholder="tu@correo.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirmar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder="••••••••"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_confirmation: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:bg-blue-300"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Crear cuenta <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-bold text-blue-600 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
