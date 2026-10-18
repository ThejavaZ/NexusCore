"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Receipt, Loader2 } from "lucide-react";
import { api, getAuthHeaders, type Paginated } from "@/utils/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useMounted } from "@/hooks/useMounted";
import { Button, Modal, StatusBadge } from "@/components/ui";
import { OrderInvoice, type Order } from "@/components/OrderInvoice";

export default function MyOrdersPage() {
  const { user, token } = useAuthStore();
  const mounted = useMounted();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<Paginated<Order>>("orders/mine", { headers: getAuthHeaders() }).then((res) => {
      if (cancelled) return;
      if (!res.error) setOrders(res.data.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!mounted) return null;

  if (!user || !token) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <Package size={56} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-black mb-2">Inicia sesión</h1>
        <p className="text-slate-500 mb-6">
          Necesitas una cuenta para ver tu historial de pedidos.
        </p>
        <Link href="/login">
          <Button>Iniciar sesión</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Receipt size={28} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Mis pedidos
          </h1>
          <p className="text-sm text-slate-500">
            Historial de tus compras en NexusCore
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={36} className="mx-auto animate-spin text-blue-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-6">Aún no has hecho ningún pedido.</p>
          <Link href="/products">
            <Button>Explorar catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-black text-blue-600">
                    {order.invoice_number}
                  </span>
                  {order.status && <StatusBadge status={order.status} />}
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(order.sale_date).toLocaleDateString("es-MX", {
                    dateStyle: "long",
                  })}
                  {" · "}
                  {order.details.length} producto
                  {order.details.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ${parseFloat(order.total_amount).toLocaleString()}
                </span>
                <Button variant="secondary" onClick={() => setSelected(order)}>
                  Ver factura
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={`Factura ${selected?.invoice_number ?? ""}`}
        className="max-w-2xl"
      >
        {selected && <OrderInvoice order={selected} />}
      </Modal>
    </div>
  );
}
