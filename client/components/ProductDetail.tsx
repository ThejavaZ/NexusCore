"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart, Package, Minus, Plus, Zap, ChevronRight,
} from "lucide-react";
import { api } from "@/utils/api";
import { resolveImageUrl } from "@/utils/image";
import { useCartStore } from "@/store/useCartStore";
import { Badge, Button, Skeleton } from "@/components/ui";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  stock: number;
  min_stock: number;
  price: string;
  cost: string;
  image_url: string | null;
  is_active: boolean;
  category: { id: number; name: string; slug: string } | null;
}

interface Paginated<T> {
  data: T[];
}

export function ProductDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    let cancelled = false;
    api<Product>(`products/${slug}`).then((res) => {
      if (cancelled) return;
      if (res.error) {
        setNotFound(true);
      } else {
        setProduct(res.data);
        if (res.data.category) {
          api<Paginated<Product>>(`products?category_id=${res.data.category.id}&per_page=8`).then((r) => {
            if (cancelled || r.error) return;
            setRelated(r.data.data.filter((p) => p.slug !== res.data.slug).slice(0, 4));
          });
        }
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="text-center py-20">
        <Package size={64} className="mx-auto text-slate-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Producto no encontrado</h1>
        <p className="text-slate-500 mb-6">El producto que buscas no existe o fue removido.</p>
        <Button onClick={() => router.push("/products")}>Volver al catálogo</Button>
      </div>
    );
  }

  const lowStock = product.stock > 0 && product.stock <= product.min_stock;
  const outOfStock = product.stock === 0;

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`Añadido al carrito: ${product.name} × ${qty}`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    router.push("/checkout");
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Inicio</Link>
        <ChevronRight size={14} className="text-slate-300" />
        <Link href="/products" className="hover:text-blue-600">Productos</Link>
        {product.category && (
          <>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-slate-800 dark:text-slate-200">{product.category.name}</span>
          </>
        )}
        <ChevronRight size={14} className="text-slate-300" />
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
          {resolveImageUrl(product.image_url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resolveImageUrl(product.image_url)!} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package size={80} className="text-slate-300" />
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Badge color="blue" className="mb-3">{product.category.name}</Badge>
            )}
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{product.name}</h1>
            <p className="text-sm text-slate-400 mt-1">SKU: {product.sku}</p>
          </div>

          <div className="text-4xl font-black text-blue-600">
            ${parseFloat(product.price).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </div>

          {product.description && (
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-3">
            {outOfStock ? (
              <Badge color="red">Agotado</Badge>
            ) : lowStock ? (
              <Badge color="yellow">Últimas {product.stock} unidades</Badge>
            ) : (
              <Badge color="green">En stock ({product.stock} disponibles)</Badge>
            )}
          </div>

          {!outOfStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                  aria-label="Reducir cantidad"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-slate-400">máx. {product.stock}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              disabled={outOfStock}
              onClick={handleAdd}
            >
              <ShoppingCart size={20} />
              {outOfStock ? "Sin stock" : "Agregar al carrito"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={outOfStock}
              onClick={handleBuyNow}
            >
              <Zap size={20} />
              Comprar ahora
            </Button>
          </div>

          <div className="text-sm text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1">
            <p>✓ Envío y disponibilidad confirmados al pagar</p>
            <p>✓ Stock descontado en tiempo real</p>
            <p>✓ Pago en efectivo, tarjeta o transferencia</p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="aspect-square bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center">
                  {resolveImageUrl(p.image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveImageUrl(p.image_url)!}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Package size={40} className="text-slate-300" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 mb-2">
                    {p.name}
                  </h3>
                  <span className="font-black text-blue-600">
                    ${parseFloat(p.price).toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
