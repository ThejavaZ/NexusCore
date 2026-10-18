"use client";

import { useState } from "react";
import { User, ShieldCheck, KeyRound } from "lucide-react";
import { api, getAuthHeaders } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import { Button, Input, Badge } from "@/components/ui";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const handleChangePassword = async () => {
    setSaving(true);
    setError(null);
    const res = await api("auth/change-password", {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.error) {
      setError(res.message);
      return;
    }
    toast.success("Contraseña actualizada");
    setForm({ current_password: "", password: "", password_confirmation: "" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Mi perfil</h1>
        <p className="text-slate-500">Cuenta y seguridad</p>
      </div>

      {/* Account info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
          <User size={28} />
        </div>
        <div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{user.name}</p>
          <p className="text-sm text-slate-500">{user.email}</p>
          <Badge color={user.role === "admin" ? "purple" : user.role === "staff" ? "blue" : "slate"} className="mt-2">
            <ShieldCheck size={12} className="mr-1" />
            {user.role}
          </Badge>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={18} className="text-slate-400" />
          <h2 className="font-bold text-slate-900 dark:text-white">Cambiar contraseña</h2>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl">{error}</div>
          )}
          <Input
            label="Contraseña actual"
            type="password"
            value={form.current_password}
            onChange={(e) => setForm({ ...form, current_password: e.target.value })}
            required
          />
          <Input
            label="Nueva contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
          <Input
            label="Confirmar nueva contraseña"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            required
          />
          <p className="text-xs text-slate-400">
            Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos.
          </p>
          <Button
            loading={saving}
            disabled={!form.current_password || !form.password || !form.password_confirmation}
            onClick={handleChangePassword}
          >
            Actualizar contraseña
          </Button>
        </div>
      </div>
    </div>
  );
}
