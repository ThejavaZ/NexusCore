"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, getAuthHeaders, type Paginated } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Button, DataTable, Modal, Input, Select, Badge, TableSkeleton,
} from "@/components/ui";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "staff", label: "Staff" },
  { value: "customer", label: "Cliente" },
];

export default function DashboardUsersPage() {
  const { token, user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<Paginated<User>>(`users?page=${page}`, { headers: getAuthHeaders() }).then((res) => {
      if (cancelled) return;
      if (!res.error) {
        setUsers(res.data.data);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, page, refreshKey]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", password: "", role: "customer" });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const headers = getAuthHeaders();
    const body = editing
      ? { name: form.name, email: form.email, role: form.role }
      : form;

    const res = editing
      ? await api(`users/${editing.id}`, { method: "PUT", headers, body: JSON.stringify(body) })
      : await api("users", { method: "POST", headers, body: JSON.stringify(body) });

    setSaving(false);
    if (res.error) {
      setError(res.message);
      return;
    }

    toast.success(editing ? "Usuario actualizado" : "Usuario creado");
    setModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUser?.id) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }
    if (!confirm(`¿Eliminar "${u.name}"?`)) return;
    const res = await api(`users/${u.id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.error) {
      toast.error("No se pudo eliminar");
      return;
    }
    toast.success("Usuario eliminado");
    setRefreshKey((k) => k + 1);
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Usuarios</h1>
          <p className="text-slate-500">{total} cuentas registradas</p>
        </div>
        <Button onClick={openCreate}><Plus size={16} /> Nuevo usuario</Button>
      </div>

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <DataTable
          data={users}
          emptyMessage="No hay usuarios"
          pagination={{ page, lastPage, total, onPageChange: setPage }}
          columns={[
            { key: "name", header: "Nombre", render: (r) => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-xs">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.email}</p>
                </div>
              </div>
            )},
            { key: "role", header: "Rol", render: (r) => (
              <Badge color={r.role === "admin" ? "purple" : r.role === "staff" ? "blue" : "slate"}>
                {r.role}
              </Badge>
            )},
            { key: "is_active", header: "Estado", render: (r) => (
              <Badge color={r.is_active ? "green" : "red"}>{r.is_active ? "Activo" : "Inactivo"}</Badge>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar usuario" : "Nuevo usuario"}>
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl">{error}</div>}
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {!editing && (
            <Input label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
          )}
          <Select label="Rol" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={ROLE_OPTIONS} />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
