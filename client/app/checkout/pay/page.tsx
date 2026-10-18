"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FlaskConical, Loader2, ShieldCheck, X } from "lucide-react";
import { api } from "@/utils/api";
import { Button } from "@/components/ui";
import { OrderInvoice, type Order } from "@/components/OrderInvoice";

function PayView() {
  const sessionId = useSearchParams().get("session_id");
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const simulatePayment = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);

    const res = await api("payments/fake/confirm", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (res.error) {
      setError(res.message);
      setLoading(false);
      return;
    }

    router.replace(`/checkout/success?session_id=${sessionId}`);
  };

  if (!sessionId || notFound) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <X size={64} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-black mb-2">Sesión de pago no válida</h1>
        <Link href="/checkout">
          <Button className="mt-4">Volver al checkout</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl mb-4">
          <FlaskConical size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Pago simulado
        </h1>
        <p className="text-slate-500 mt-2 flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          Entorno de demostración — no se realiza ningún cobro real.
        </p>
      </div>

      {!order ? (
        <div className="text-center py-10">
          <Loader2 size={36} className="mx-auto animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 text-sm rounded-r-xl">
            Pedido <strong>{order.invoice_number}</strong> por{" "}
            <strong>
              ${parseFloat(order.total_amount).toLocaleString()}
            </strong>{" "}
            — confirma el pago para marcarlo como pagado.
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 text-sm rounded-r-xl">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" size="lg" loading={loading} onClick={simulatePayment}>
              Simular pago aprobado
            </Button>
            <Link href="/checkout?cancelled=1" className="flex-1">
              <Button variant="secondary" className="w-full" size="lg">
                Cancelar
              </Button>
            </Link>
          </div>

          <div className="mt-8 opacity-70">
            <OrderInvoice order={order} />
          </div>
        </>
      )}
    </div>
  );
}

export default function CheckoutPayPage() {
  return (
    <Suspense fallback={null}>
      <PayView />
    </Suspense>
  );
}
