"use client";

import { useState, useEffect } from "react";
import { Wrench, Clock, CheckCircle2, Package, Loader2 } from "lucide-react";
import { api, getAuthHeaders } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Button, DataTable, Modal, Select, Textarea, StatusBadge, TableSkeleton, StatCard,
} from "@/components/ui";

interface Repair {
  id: number;
  repair_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  issue_description: string;
  technician_notes: string | null;
  estimated_cost: string | null;
  final_cost: string | null;
  status: string;
  received_at: string;
  estimated_delivery: string | null;
  delivered_at: string | null;
  technician: { id: number; name: string } | null;
}

interface RepairSummary {
  pending: number;
  in_progress: number;
  completed: number;
  delivered: number;
  total: number;
}

interface Paginated<T> { data: T[] }

const STATUSES = [
  { value: "pending", label: "Pendiente" },
  { value: "diagnosed", label: "Diagnosticado" },
  { value: "approved", label: "Aprobado" },
  { value: "in_progress", label: "En progreso" },
  { value: "completed", label: "Completado" },
  { value: "delivered", label: "Entregado" },
];

export default function DashboardRepairsPage() {
  const { token } = useAuthStore();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [summary, setSummary] = useState<RepairSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState<Repair | null>(null);
  const [statusModal, setStatusModal] = useState<Repair | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const headers = getAuthHeaders();
    const params = filter ? `?status=${filter}` : "";
    Promise.all([
      api<Paginated<Repair>>(`repairs${params}`, { headers }),
      api<RepairSummary>("repairs/summary", { headers }),
    ]).then(([repairsRes, summaryRes]) => {
      if (cancelled) return;
      if (!repairsRes.error) setRepairs(repairsRes.data.data);
      if (!summaryRes.error) setSummary(summaryRes.data);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, filter]);

  const handleStatusChange = async () => {
    if (!statusModal || !newStatus) return;
    setSaving(true);
    await api(`repairs/${statusModal.id}/change-status`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus, notes: notes || undefined }),
    });
    setSaving(false);
    setStatusModal(null);
    setNewStatus("");
    setNotes("");
    setDetail(null);
    // Trigger reload by toggling filter state
    setFilter((f) => f);
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Reparaciones</h1>
        <p className="text-slate-500">Gestión de órdenes de servicio</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Pendientes" value={summary.pending} icon={<Clock size={20} />} accent="yellow" />
          <StatCard label="En progreso" value={summary.in_progress} icon={<Loader2 size={20} />} accent="blue" />
          <StatCard label="Completadas" value={summary.completed} icon={<CheckCircle2 size={20} />} accent="green" />
          <StatCard label="Entregadas" value={summary.delivered} icon={<Package size={20} />} accent="purple" />
          <StatCard label="Total" value={summary.total} icon={<Wrench size={20} />} accent="slate" />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={filter === "" ? "primary" : "secondary"} onClick={() => setFilter("")}>Todas</Button>
        {STATUSES.map((s) => (
          <Button key={s.value} size="sm" variant={filter === s.value ? "primary" : "secondary"} onClick={() => setFilter(s.value)}>
            {s.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <DataTable
          data={repairs}
          emptyMessage="No hay reparaciones"
          onRowClick={(r) => setDetail(r)}
          columns={[
            { key: "repair_number", header: "Folio", render: (r) => <span className="font-bold text-blue-600">{r.repair_number}</span> },
            { key: "customer_name", header: "Cliente" },
            { key: "device_type", header: "Dispositivo", render: (r) => `${r.brand || ""} ${r.device_type}`.trim() },
            { key: "status", header: "Estado", render: (r) => <StatusBadge status={r.status} /> },
            { key: "estimated_cost", header: "Costo est.", render: (r) => r.estimated_cost ? `$${parseFloat(r.estimated_cost).toLocaleString()}` : "—" },
            { key: "action", header: "", render: (r) => (
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setStatusModal(r); setNewStatus(r.status); }}>
                Cambiar estado
              </Button>
            )},
          ]}
        />
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.repair_number}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs uppercase font-bold text-slate-400">Cliente</p><p className="font-medium">{detail.customer_name}</p></div>
              <div><p className="text-xs uppercase font-bold text-slate-400">Email</p><p className="font-medium">{detail.customer_email}</p></div>
              <div><p className="text-xs uppercase font-bold text-slate-400">Dispositivo</p><p className="font-medium">{detail.brand} {detail.model} ({detail.device_type})</p></div>
              <div><p className="text-xs uppercase font-bold text-slate-400">Serial</p><p className="font-medium">{detail.serial_number || "—"}</p></div>
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Problema reportado</p>
              <p className="mt-1">{detail.issue_description}</p>
            </div>
            {detail.technician_notes && (
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">Notas del técnico</p>
                <p className="mt-1">{detail.technician_notes}</p>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <StatusBadge status={detail.status} />
              <Button size="sm" onClick={() => { setDetail(null); setStatusModal(detail); setNewStatus(detail.status); }}>
                Cambiar estado
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Change Modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title={`Cambiar estado — ${statusModal?.repair_number}`}>
        <div className="space-y-4">
          <Select
            label="Nuevo estado"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={STATUSES}
          />
          <Textarea
            label="Notas (opcional)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalles del cambio..."
          />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setStatusModal(null)}>Cancelar</Button>
            <Button className="flex-1" loading={saving} disabled={!newStatus || newStatus === statusModal?.status} onClick={handleStatusChange}>
              Confirmar cambio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
