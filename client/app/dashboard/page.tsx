"use client";

import { useEffect, useState } from "react";
import { api, getAuthHeaders } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";

interface SalesSummary {
  today_sales: number;
  today_revenue: number;
  month_revenue: number;
  total_sales: number;
  top_products: { product_name: string; total_qty: number; total_revenue: number }[];
}

interface RepairsSummary {
  pending: number;
  in_progress: number;
  completed: number;
  delivered: number;
  total: number;
}

export default function DashboardPage() {
  const { token } = useAuthStore();
  const [sales, setSales] = useState<SalesSummary | null>(null);
  const [repairs, setRepairs] = useState<RepairsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      const headers = getAuthHeaders();
      const [salesRes, repairsRes] = await Promise.all([
        api<SalesSummary>("sales/summary", { headers }),
        api<RepairsSummary>("repairs/summary", { headers }),
      ]);

      if (!salesRes.error) setSales(salesRes.data);
      if (!repairsRes.error) setRepairs(repairsRes.data);
      setLoading(false);
    };

    load();
  }, [token]);

  if (loading) {
    return <div className="p-10 text-center text-slate-400 font-bold">Cargando resumen...</div>;
  }

  const stats = [
    { label: "Ventas hoy", value: sales?.today_sales ?? 0, accent: "blue" },
    { label: "Ingresos hoy", value: `$${(sales?.today_revenue ?? 0).toLocaleString()}`, accent: "green" },
    { label: "Ingresos del mes", value: `$${(sales?.month_revenue ?? 0).toLocaleString()}`, accent: "indigo" },
    { label: "Total ventas", value: sales?.total_sales ?? 0, accent: "slate" },
  ];

  const repairStats = [
    { label: "Pendientes", value: repairs?.pending ?? 0, color: "text-yellow-600 bg-yellow-50" },
    { label: "En progreso", value: repairs?.in_progress ?? 0, color: "text-blue-600 bg-blue-50" },
    { label: "Completadas", value: repairs?.completed ?? 0, color: "text-green-600 bg-green-50" },
    { label: "Entregadas", value: repairs?.delivered ?? 0, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Resumen</h1>
        <p className="text-slate-500">Vista general del negocio</p>
      </div>

      {/* Sales stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-bold text-slate-400 uppercase">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Repairs stats */}
      <div>
        <h2 className="text-lg font-bold mb-4">Reparaciones por estado</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {repairStats.map((s) => (
            <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
              <p className="text-xs font-bold uppercase opacity-70">{s.label}</p>
              <p className="text-3xl font-black mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      {sales?.top_products && sales.top_products.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold mb-4">Productos más vendidos</h2>
          <div className="divide-y divide-slate-100">
            {sales.top_products.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-800">{p.product_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">
                    ${(p.total_revenue || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 ml-2">
                    ({p.total_qty} uds)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
