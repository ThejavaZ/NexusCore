"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui";
import { resolveImageUrl } from "@/utils/image";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, count } = useCartStore();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + parseFloat(String(item.price)), 0);
  const tax = total * 0.16;
  const grandTotal = total + tax;

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart size={64} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Tu carrito está vacío</h1>
        <p className="text-slate-500 mb-6">Agrega productos del catálogo para comenzar.</p>
        <Link href="/products">
          <Button>Explorar productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Carrito de compras</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>Vaciar carrito</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl shrink-0">
                {resolveImageUrl(item.image_url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resolveImageUrl(item.image_url)!} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  "📦"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={item.slug ? `/products/${item.slug}` : "/products"}
                  className="font-bold text-slate-900 dark:text-white hover:text-blue-600 truncate block"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-slate-500">${parseFloat(String(item.price)).toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
            <h2 className="font-bold mb-4">Resumen</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal ({count} items)</span>
                <span className="font-medium">${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IVA (16%)</span>
                <span className="font-medium">${tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between text-lg font-black">
                <span>Total</span>
                <span>${grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              size="lg"
              onClick={() => router.push("/checkout")}
            >
              Proceder al pago <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
