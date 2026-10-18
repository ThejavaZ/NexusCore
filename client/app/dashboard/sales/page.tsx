"use client";

import { useState, useEffect } from "react";
import { Eye, DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { api, getAuthHeaders, type Paginated } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import {
  DataTable, Modal, StatusBadge, TableSkeleton, StatCard, Select, Input,
} from "@/components/ui";

interface SaleDetail {
  id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

interface Sale {
  id: number;
  invoice_number: string;
  sale_date: string;
  customer_name: string;
  customer_email: string | null;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  payment_method: string;
  status: string;
  details: SaleDetail[];
}

interface Summary {
  today_sales: number;
  today_revenue: number;
  month_revenue: number;
  total_sales: number;
}

export default function DashboardSalesPage() {
  const { token } = useAuthStore();
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Sale | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [payment, setPayment] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<Summary>("sales/summary", { headers: getAuthHeaders() }).then((summaryRes) => {
      if (cancelled) return;
      if (!summaryRes.error) setSummary(summaryRes.data);
    });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (payment) params.set("payment_method", payment);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (search) params.set("search", search);
    api<Paginated<Sale>>(`sales?${params}`, { headers: getAuthHeaders() }).then((salesRes) => {
      if (cancelled) return;
      if (!salesRes.error) {
        setSales(salesRes.data.data);
        setLastPage(salesRes.data.last_page);
        setTotal(salesRes.data.total);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, page, payment, from, to, search]);

  const resetPage = (fn: () => void) => {
    setPage(1);
    fn();
  };

  if (!token) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Ventas</h1>
        <p className="text-slate-500">Historial de transacciones</p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Ventas hoy" value={summary.today_sales} icon={<ShoppingCart size={20} />} accent="blue" />
          <StatCard label="Ingresos hoy" value={`$${summary.today_revenue.toLocaleString()}`} icon={<DollarSign size={20} />} accent="green" />
          <StatCard label="Ingresos mes" value={`$${summary.month_revenue.toLocaleString()}`} icon={<TrendingUp size={20} />} accent="purple" />
          <StatCard label="Total ventas" value={summary.total_sales} accent="slate" />
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Método de pago"
          value={payment}
          onChange={(e) => resetPage(() => setPayment(e.target.value))}
          options={[
            { value: "", label: "Todos" },
            { value: "cash", label: "Efectivo" },
            { value: "card", label: "Tarjeta" },
            { value: "transfer", label: "Transferencia" },
          ]}
        />
        <Input label="Desde" type="date" value={from} onChange={(e) => resetPage(() => setFrom(e.target.value))} />
        <Input label="Hasta" type="date" value={to} onChange={(e) => resetPage(() => setTo(e.target.value))} />
        <Input
          label="Buscar"
          value={search}
          onChange={(e) => resetPage(() => setSearch(e.target.value))}
          placeholder="Factura o cliente..."
        />
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : (
        <DataTable
          data={sales}
          emptyMessage="No hay ventas registradas"
          onRowClick={(r) => setDetail(r)}
          pagination={{ page, lastPage, total, onPageChange: setPage }}
          columns={[
            { key: "invoice_number", header: "Factura", render: (r) => <span className="font-bold text-blue-600">{r.invoice_number}</span> },
            { key: "sale_date", header: "Fecha", render: (r) => new Date(r.sale_date).toLocaleDateString("es-MX") },
            { key: "customer_name", header: "Cliente" },
            { key: "payment_method", header: "Pago", render: (r) => <StatusBadge status={r.payment_method} /> },
            { key: "status", header: "Estado", render: (r) => <StatusBadge status={r.status} /> },
            { key: "total_amount", header: "Total", render: (r) => <span className="font-bold">${parseFloat(r.total_amount).toLocaleString()}</span> },
            { key: "view", header: "", render: () => <Eye size={16} className="text-slate-400" /> },
          ]}
        />
      )}

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.invoice_number}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Cliente</p>
                <p className="font-medium">{detail.customer_name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Fecha</p>
                <p className="font-medium">{new Date(detail.sale_date).toLocaleString("es-MX")}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase font-bold">Pago</p>
                <StatusBadge status={detail.payment_method} />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs uppercase font-bold text-slate-400 mb-3">Productos</p>
              <div className="space-y-2">
                {detail.details?.map((d) => (
                  <div key={d.id} className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <span>{d.product_name} × {d.quantity}</span>
                    <span className="font-medium">${parseFloat(d.total_price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>${parseFloat(detail.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">IVA</span><span>${parseFloat(detail.tax_amount).toLocaleString()}</span></div>
              <div className="flex justify-between text-lg font-black"><span>Total</span><span>${parseFloat(detail.total_amount).toLocaleString()}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
