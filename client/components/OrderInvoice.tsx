"use client";

import type { ReactNode } from "react";
import { FileText } from "lucide-react";

export interface OrderDetail {
  id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

export interface Order {
  id: number;
  invoice_number: string;
  sale_date: string;
  customer_name: string;
  customer_email: string | null;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  payment_method: string;
  status?: string;
  payment_url?: string | null;
  details: OrderDetail[];
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
};

export const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  paid: { label: "Pagado", className: "bg-emerald-500/15 text-emerald-400" },
  pending_payment: { label: "Pendiente de pago", className: "bg-amber-500/15 text-amber-400" },
  cancelled: { label: "Cancelado", className: "bg-red-500/15 text-red-400" },
};

export function OrderInvoice({
  order,
  actions,
}: {
  order: Order;
  actions?: ReactNode;
}) {
  const badge = order.status ? STATUS_BADGES[order.status] : undefined;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText size={22} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Factura</p>
              <p className="text-xl font-black">{order.invoice_number}</p>
            </div>
            {badge && (
              <span className={`ml-2 px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>
          <div className="text-right text-sm">
            <p className="text-slate-400">Fecha</p>
            <p className="font-bold">{new Date(order.sale_date).toLocaleString("es-MX")}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Cliente</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">{order.customer_name}</p>
              {order.customer_email && (
                <p className="text-slate-500">{order.customer_email}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Método de pago</p>
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {PAYMENT_LABELS[order.payment_method] ?? order.payment_method}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <p className="text-xs uppercase font-bold text-slate-400 mb-3">Productos</p>
            <div className="space-y-2">
              {order.details.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800 last:border-0"
                >
                  <span className="text-slate-700 dark:text-slate-300">
                    {d.product_name}{" "}
                    <span className="text-slate-400">
                      × {d.quantity} @ ${parseFloat(d.unit_price).toLocaleString()}
                    </span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    ${parseFloat(d.total_price).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>${parseFloat(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IVA (16%)</span>
              <span>${parseFloat(order.tax_amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-black pt-2">
              <span>Total</span>
              <span className="text-blue-600">
                ${parseFloat(order.total_amount).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {actions && <div className="flex flex-col sm:flex-row gap-3 mt-6">{actions}</div>}
    </>
  );
}
