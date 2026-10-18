"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, getAuthHeaders, type Paginated } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Button, DataTable, Modal, Input, Select, Badge, TableSkeleton,
} from "@/components/ui";
import { toast } from "sonner";

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: string;
  min_amount: string | null;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
}

export default function DashboardCouponsPage() {
  const { token, user } = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    min_amount: "",
    usage_limit: "",
    expires_at: "",
    is_active: true,
  });

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    api<Paginated<Coupon>>("admin/coupons?per_page=100", { headers: getAuthHeaders() }).then((res) => {
      if (!res.error) setCoupons(res.data.data);
      setLoading(false);
    });
  }, [token, user]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", type: "percent", value: "", min_amount: "", usage_limit: "", expires_at: "", is_active: true });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      min_amount: c.min_amount ?? "",
      usage_limit: c.usage_limit !== null ? String(c.usage_limit) : "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
      is_active: c.is_active,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload = {
      code: form.code,
      type: form.type,
      value: parseFloat(form.value),
      min_amount: form.min_amount === "" ? null : parseFloat(form.min_amount),
      usage_limit: form.usage_limit === "" ? null : parseInt(form.usage_limit, 10),
      expires_at: form.expires_at === "" ? null : form.expires_at,
      is_active: form.is_active,
    };

    const headers = getAuthHeaders();
    const res = editing
      ? await api(`admin/coupons/${editing.id}`, { method: "PUT", headers, body: JSON.stringify(payload) })
      : await api("admin/coupons", { method: "POST", headers, body: JSON.stringify(payload) });

    setSaving(false);
    if (res.error) {
      setError(res.message);
      return;
    }

    toast.success(editing ? "Cupón actualizado" : "Cupón creado");
    setModalOpen(false);
    const list = await api<Paginated<Coupon>>("admin/coupons?per_page=100", { headers: getAuthHeaders() });
    if (!list.error) setCoupons(list.data.data);
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`¿Eliminar el cupón "${c.code}"?`)) return;
    const res = await api(`admin/coupons/${c.id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.error) {
      toast.error(res.message);
      return;
    }
    toast.success("Cupón eliminado");
    setCoupons((prev) => prev.filter((x) => x.id !== c.id));
  };

  if (!token || user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Cupones</h1>
          <p className="text-slate-500">{coupons.length} cupones</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Nuevo cupón</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <DataTable
          data={coupons}
          emptyMessage="No hay cupones"
          columns={[
            { key: "code", header: "Código", render: (r) => (
              <span className="font-bold text-blue-600">{r.code}</span>
            )},
            { key: "type", header: "Tipo", render: (r) => (
              <Badge color={r.type === "percent" ? "purple" : "blue"}>
                {r.type === "percent" ? `${parseFloat(r.value)}%` : `$${parseFloat(r.value)}`}
              </Badge>
            )},
            { key: "min_amount", header: "Mínimo", render: (r) => (
              r.min_amount ? `$${parseFloat(r.min_amount).toLocaleString()}` : "—"
            )},
            { key: "used_count", header: "Usos", render: (r) => (
              <span>{r.used_count}{r.usage_limit !== null ? ` / ${r.usage_limit}` : ""}</span>
            )},
            { key: "expires_at", header: "Expira", render: (r) => (
              r.expires_at ? new Date(r.expires_at).toLocaleDateString("es-MX") : "Sin límite"
            )},
            { key: "is_active", header: "Estado", render: (r) => (
              <Badge color={r.is_active ? "green" : "slate"}>{r.is_active ? "Activo" : "Inactivo"}</Badge>
            )},
            { key: "actions", header: "", render: (r) => (
              <div className="flex gap-1">
                <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={15} /></button>
              </div>
            )},
          ]}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar cupón" : "Nuevo cupón"}>
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl">{error}</div>}
          <Input
            label="Código"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="BIENVENIDO10"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { value: "percent", label: "Porcentaje (%)" },
                { value: "fixed", label: "Monto fijo ($)" },
              ]}
            />
            <Input
              label={form.type === "percent" ? "Valor (%)" : "Valor ($)"}
              type="number"
              min="0.01"
              step="0.01"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monto mínimo (opcional)"
              type="number"
              min="0"
              value={form.min_amount}
              onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
            />
            <Input
              label="Límite de usos (opcional)"
              type="number"
              min="1"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            />
          </div>
          <Input
            label="Expira (opcional)"
            type="date"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded border-slate-300"
            />
            Activo
          </label>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
