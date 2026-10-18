"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard, CheckCircle2, FileText, Download,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api, getAuthHeaders } from "@/utils/api";
import { useMounted } from "@/hooks/useMounted";
import { Button, Input, Select } from "@/components/ui";

interface OrderDetail {
  id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  total_price: string;
}

interface Order {
  id: number;
  invoice_number: string;
  sale_date: string;
  customer_name: string;
  customer_email: string | null;
  subtotal: string;
  tax_amount: string;
  total_amount: string;
  payment_method: string;
  details: OrderDetail[];
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
};

export default function CheckoutPage() {
  const { cart, clearCart, count } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const mounted = useMounted();
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
        {/* Success header */}
        <div className="text-center mb-8">
          <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-4" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            ¡Pedido confirmado!
          </h1>
          <p className="text-slate-500 mt-2">
            Gracias, {order.customer_name}. Tu compra fue registrada y el stock fue actualizado.
          </p>
        </div>

        {/* Invoice */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={22} className="text-blue-400" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Factura</p>
                <p className="text-xl font-black">{order.invoice_number}</p>
              </div>
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

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
            <Download size={16} /> Imprimir factura
          </Button>
          <Button className="flex-1" onClick={() => router.push("/products")}>
            Seguir comprando
          </Button>
        </div>
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
                  { value: "cash", label: "Efectivo" },
                  { value: "card", label: "Tarjeta" },
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
