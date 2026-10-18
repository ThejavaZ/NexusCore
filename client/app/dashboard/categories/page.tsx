"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, getAuthHeaders } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Button, DataTable, Modal, Input, Textarea, Badge, TableSkeleton,
} from "@/components/ui";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  products_count?: number;
}

export default function DashboardCategoriesPage() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    api<Category[]>("admin/categories", { headers: getAuthHeaders() }).then((res) => {
      if (!res.error) setCategories(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "" });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || "" });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const headers = getAuthHeaders();

    const res = editing
      ? await api(`admin/categories/${editing.id}`, { method: "PUT", headers, body: JSON.stringify(form) })
      : await api("admin/categories", { method: "POST", headers, body: JSON.stringify(form) });

    setSaving(false);
    if (res.error) {
      setError(res.message);
      return;
    }

    toast.success(editing ? "Categoría actualizada" : "Categoría creada");
    setModalOpen(false);
    load();
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`¿Eliminar "${c.name}"?`)) return;
    const res = await api(`admin/categories/${c.id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.error) {
      toast.error(res.message);
      return;
    }
    toast.success("Categoría eliminada");
    load();
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Categorías</h1>
          <p className="text-slate-500">{categories.length} categorías</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Nueva categoría</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : (
        <DataTable
          data={categories}
          emptyMessage="No hay categorías"
          columns={[
            { key: "name", header: "Nombre", render: (r) => (
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                <p className="text-xs text-slate-400">{r.slug}</p>
              </div>
            )},
            { key: "description", header: "Descripción", render: (r) => r.description || "—" },
            { key: "products_count", header: "Productos", render: (r) => (
              <Badge color="blue">{r.products_count ?? 0}</Badge>
            )},
            { key: "is_active", header: "Estado", render: (r) => (
              <Badge color={r.is_active ? "green" : "slate"}>{r.is_active ? "Activa" : "Inactiva"}</Badge>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar categoría" : "Nueva categoría"}>
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl">{error}</div>}
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Descripción" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
