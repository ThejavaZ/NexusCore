"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCcw, PackagePlus } from "lucide-react";
import { api, getAuthHeaders, type Paginated } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import { DataTable, Select, TableSkeleton, Badge } from "@/components/ui";

interface StockMovement {
  id: number;
  type: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
  product: { id: number; name: string; slug: string };
  creator: { id: number; name: string } | null;
}

const TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "initial", label: "Inicial" },
  { value: "purchase", label: "Compra" },
  { value: "sale", label: "Venta" },
  { value: "adjustment", label: "Ajuste" },
  { value: "restock", label: "Reposición" },
];

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { color: "blue" | "green" | "yellow" | "purple" | "slate"; label: string }> = {
    initial: { color: "slate", label: "Inicial" },
    purchase: { color: "green", label: "Compra" },
    sale: { color: "blue", label: "Venta" },
    adjustment: { color: "yellow", label: "Ajuste" },
    restock: { color: "purple", label: "Reposición" },
  };
  const cfg = map[type] ?? { color: "slate", label: type };
  return <Badge color={cfg.color}>{cfg.label}</Badge>;
}

export default function DashboardStockPage() {
  const { token } = useAuthStore();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    params.set("page", String(page));
    api<Paginated<StockMovement>>(`admin/stock-movements?${params}`, {
      headers: getAuthHeaders(),
    }).then((res) => {
      if (cancelled) return;
      if (!res.error) {
        setMovements(res.data.data);
        setLastPage(res.data.last_page);
        setTotal(res.data.total);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, type, page]);

  const changeType = (value: string) => {
    setPage(1);
    setType(value);
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Movimientos de stock</h1>
        <p className="text-slate-500">Historial de entradas, salidas y ajustes de inventario</p>
      </div>

      <div className="max-w-xs">
        <Select label="Tipo de movimiento" value={type} onChange={(e) => changeType(e.target.value)} options={TYPE_OPTIONS} />
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <DataTable
          data={movements}
          emptyMessage="No hay movimientos registrados"
          pagination={{ page, lastPage, total, onPageChange: setPage }}
          columns={[
            { key: "product", header: "Producto", render: (r) => (
              <span className="font-bold text-slate-900 dark:text-white">{r.product?.name ?? "—"}</span>
            )},
            { key: "type", header: "Tipo", render: (r) => <TypeBadge type={r.type} /> },
            { key: "quantity", header: "Cantidad", render: (r) => {
              const positive = r.quantity > 0;
              const Icon = r.type === "adjustment" ? RefreshCcw : positive ? ArrowUpRight : ArrowDownRight;
              return (
                <span className={`inline-flex items-center gap-1 font-bold ${positive ? "text-green-600" : "text-red-500"}`}>
                  <Icon size={14} />
                  {positive ? "+" : ""}{r.quantity}
                </span>
              );
            }},
            { key: "stock", header: "Stock", render: (r) => (
              <span className="text-slate-500 dark:text-slate-400">
                {r.stock_before} <span className="text-slate-300 dark:text-slate-600">→</span>{" "}
                <span className="font-medium text-slate-800 dark:text-slate-200">{r.stock_after}</span>
              </span>
            )},
            { key: "reference", header: "Motivo", render: (r) => (
              <span className="line-clamp-1 max-w-[200px]">{r.reference || "—"}</span>
            )},
            { key: "created_by", header: "Usuario", render: (r) => (
              <span className="inline-flex items-center gap-1.5">
                <PackagePlus size={14} className="text-slate-400" />
                {r.creator?.name ?? "—"}
              </span>
            )},
            { key: "created_at", header: "Fecha", render: (r) => (
              <span className="text-slate-500">{new Date(r.created_at).toLocaleString("es-MX")}</span>
            )},
          ]}
        />
      )}
    </div>
  );
}
