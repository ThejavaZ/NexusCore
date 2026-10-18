"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle, Clock } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui";
import { OrderInvoice, type Order } from "@/components/OrderInvoice";

function SuccessView() {
  const sessionId = useSearchParams().get("session_id");
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const polls = useRef(0);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    api<Order>(`orders/by-session/${sessionId}`).then((res) => {
      if (cancelled) return;
      if (res.error) {
        setNotFound(true);
      } else {
        setOrder(res.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // Mientras el pago siga pendiente (webhook), consultamos cada pocos segundos
  useEffect(() => {
    if (!sessionId || order?.status !== "pending_payment" || timedOut) return;

    const timer = setInterval(() => {
      polls.current += 1;
      if (polls.current > 24) {
        clearInterval(timer);
        setTimedOut(true);
        return;
      }
      api<Order>(`orders/by-session/${sessionId}`).then((res) => {
        if (!res.error) setOrder(res.data);
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [sessionId, order?.status, timedOut]);

  if (!sessionId || notFound) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <XCircle size={64} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-black mb-2">Pedido no encontrado</h1>
        <p className="text-slate-500 mb-6">
          El enlace de confirmación no es válido o el pedido fue eliminado.
        </p>
        <Link href="/products">
          <Button>Volver al catálogo</Button>
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Loader2 size={40} className="mx-auto animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500">Cargando tu pedido…</p>
      </div>
    );
  }

  if (order.status === "cancelled") {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <XCircle size={64} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-black mb-2">Pago cancelado</h1>
        <p className="text-slate-500 mb-6">
          Este pedido fue cancelado y el stock fue restaurado.
        </p>
        <Link href="/checkout">
          <Button>Volver al checkout</Button>
        </Link>
      </div>
    );
  }

  const pending = order.status === "pending_payment";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        {pending ? (
          <>
            <Clock size={64} className="mx-auto text-amber-400 mb-4" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              Procesando tu pago…
            </h1>
            <p className="text-slate-500 mt-2">
              Estamos esperando la confirmación de la pasarela. Esta página se
              actualiza automáticamente.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4" />
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
              ¡Pago confirmado!
            </h1>
            <p className="text-slate-500 mt-2">
              Gracias, {order.customer_name}. Tu compra quedó registrada.
            </p>
          </>
        )}
      </div>

      {pending && timedOut && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-r-xl">
          La confirmación está tardando más de lo normal. Recarga la página en
          unos minutos o contáctanos con tu número {order.invoice_number}.
        </div>
      )}

      <OrderInvoice
        order={order}
        actions={
          <>
            <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
              Imprimir
            </Button>
            <Link href="/products" className="flex-1">
              <Button className="w-full">Seguir comprando</Button>
            </Link>
          </>
        }
      />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessView />
    </Suspense>
  );
}
