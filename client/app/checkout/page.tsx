"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CreditCard, CheckCircle2, Download, XCircle } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api, getAuthHeaders } from "@/utils/api";
import { useMounted } from "@/hooks/useMounted";
import { Button, Input, Select } from "@/components/ui";
import { OrderInvoice, type Order } from "@/components/OrderInvoice";

function CheckoutView() {
  const { cart, clearCart, count } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const mounted = useMounted();
  const cancelled = useSearchParams().get("cancelled") === "1";
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    payment_method: "cash",
  });

  // Prefill from user on first render after mount
  const [userEmail, setUserEmail] = useState("");
  if (mounted && user && userEmail !== user.email) {
    setUserEmail(user.email);
    setForm((f) => ({
      ...f,
      customer_name: user.name,
      customer_email: user.email,
    }));
  }

  const total = cart.reduce(
    (sum, item) => sum + parseFloat(String(item.price)) * item.quantity,
    0,
  );
  const tax = total * 0.16;
  const grandTotal = total + tax;

  if (!mounted) return null;

  if (order) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            ¡Pedido confirmado!
          </h1>
          <p className="text-slate-500 mt-2">
            Gracias, {order.customer_name}. Tu compra fue registrada y el stock fue actualizado.
          </p>
        </div>

        <OrderInvoice
          order={order}
          actions={
            <>
              <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
                <Download size={16} /> Imprimir factura
              </Button>
              <Button className="flex-1" onClick={() => router.push("/products")}>
                Seguir comprando
              </Button>
            </>
          }
        />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-2">Carrito vacío</h1>
        <p className="text-slate-500 mb-6">Agrega productos antes de pagar.</p>
        <Button onClick={() => router.push("/products")}>Explorar productos</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const headers = token ? getAuthHeaders() : undefined;
    const res = await api<Order>("orders", {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...form,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    if (res.error) {
      setError(res.message);
      setLoading(false);
      return;
    }

    if (res.data.payment_url) {
      window.location.href = res.data.payment_url;
      return;
    }

    clearCart();
    setOrder(res.data);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Finalizar compra</h1>
        {!token && (
          <p className="text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Inicia sesión
            </Link>{" "}
            o compra como invitado.
          </p>
        )}
      </div>

      {cancelled && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-700 dark:text-amber-400 text-sm font-medium rounded-r-xl flex items-center gap-2">
          <XCircle size={16} className="shrink-0" />
          El pago fue cancelado — tu pedido sigue pendiente, puedes volver a intentarlo.
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <CreditCard size={18} /> Datos de compra
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-600 text-sm rounded-r-xl">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Nombre completo"
                required
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              />
              <Input
                label="Teléfono"
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                placeholder="555 123 4567"
              />
              <Input
                label="Email (para tu comprobante)"
                type="email"
                required
                value={form.customer_email}
                onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
              />
              <Select
                label="Método de pago"
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                options={[
                  { value: "cash", label: "Efectivo (al recibir)" },
                  { value: "card", label: "Tarjeta (Stripe)" },
                  { value: "transfer", label: "Transferencia" },
                ]}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400">
            ✓ Puedes comprar sin cuenta — solo necesitamos tus datos para la factura.
          </p>
        </form>

        {/* Summary */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
            <h2 className="font-bold mb-4 text-slate-900 dark:text-white">
              Tu pedido ({count} unidades)
            </h2>
            <div className="space-y-2 text-sm mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-slate-500 truncate">
                    {item.name}
                    <span className="text-slate-400 ml-1">× {item.quantity}</span>
                  </span>
                  <span className="font-medium shrink-0 text-slate-800 dark:text-slate-200">
                    ${(parseFloat(String(item.price)) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IVA (16%)</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-2">
                <span>Total</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-6"
              size="lg"
              loading={loading}
              onClick={handleSubmit}
            >
              Confirmar compra
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutView />
    </Suspense>
  );
}
