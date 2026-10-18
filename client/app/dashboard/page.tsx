"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { api, getAuthHeaders } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import { StatCard, CardSkeleton } from "@/components/ui";
import { DollarSign, TrendingUp, ShoppingCart, Wrench } from "lucide-react";

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

interface ChartPoint {
  date: string;
  total: number;
  revenue: number;
}

export default function DashboardPage() {
  const { token } = useAuthStore();
  const [sales, setSales] = useState<SalesSummary | null>(null);
  const [repairs, setRepairs] = useState<RepairsSummary | null>(null);
  const [chart, setChart] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const headers = getAuthHeaders();

    Promise.all([
      api<SalesSummary>("sales/summary", { headers }),
      api<RepairsSummary>("repairs/summary", { headers }),
      api<ChartPoint[]>("sales/chart", { headers }),
    ]).then(([s, r, c]) => {
      if (cancelled) return;
      if (!s.error) setSales(s.data);
      if (!r.error) setRepairs(r.data);
      if (!c.error) setChart(c.data);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const repairCards = [
    { label: "Pendientes", value: repairs?.pending ?? 0, accent: "yellow" as const },
    { label: "En progreso", value: repairs?.in_progress ?? 0, accent: "blue" as const },
    { label: "Completadas", value: repairs?.completed ?? 0, accent: "green" as const },
    { label: "Entregadas", value: repairs?.delivered ?? 0, accent: "purple" as const },
  ];

  const chartData = chart.map((c) => ({
    ...c,
    label: new Date(c.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Resumen</h1>
        <p className="text-slate-500">Vista general del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ventas hoy" value={sales?.today_sales ?? 0} icon={<ShoppingCart size={20} />} accent="blue" />
        <StatCard label="Ingresos hoy" value={`$${(sales?.today_revenue ?? 0).toLocaleString()}`} icon={<DollarSign size={20} />} accent="green" />
        <StatCard label="Ingresos mes" value={`$${(sales?.month_revenue ?? 0).toLocaleString()}`} icon={<TrendingUp size={20} />} accent="purple" />
        <StatCard label="Total ventas" value={sales?.total_sales ?? 0} accent="slate" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Ventas por día</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#33415520" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, "Ingresos"]}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Repairs */}
      <div>
        <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Reparaciones</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {repairCards.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={<Wrench size={20} />} accent={s.accent} />
          ))}
        </div>
      </div>

      {/* Top products */}
      {sales?.top_products && sales.top_products.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Productos más vendidos</h2>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {sales.top_products.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{p.product_name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-white">
                    ${(p.total_revenue || 0).toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 ml-2">({p.total_qty} uds)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
