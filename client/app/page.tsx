"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, ShoppingCart, Truck, ShieldCheck, Headphones, ArrowRight } from "lucide-react";
import { api, type Paginated } from "@/utils/api";
import { resolveImageUrl } from "@/utils/image";
import { useCartStore } from "@/store/useCartStore";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  image_url?: string | null;
  category?: { id: number; name: string; slug: string } | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api<Paginated<Product>>("products?sort=newest&per_page=8"),
      api<Category[]>("categories"),
    ]).then(([productsRes, categoriesRes]) => {
      if (cancelled) return;
      if (!productsRes.error) setFeatured(productsRes.data.data);
      if (!categoriesRes.error) setCategories(categoriesRes.data.slice(0, 8));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-20 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-1 text-sm font-semibold text-blue-400">
            Plataforma de Comercio y Operaciones
          </span>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-6xl">
            Gestiona tu negocio con{" "}
            <span className="text-blue-500">NexusCore</span>
          </h1>
          <p className="mb-8 text-lg text-slate-400">
            Catálogo de productos, ventas, reparaciones y dashboard ERP — todo
            en una sola plataforma moderna.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-700 active:scale-95"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 font-bold backdrop-blur-sm transition hover:bg-slate-800"
            >
              Acceder al ERP
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section>
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                Categorías
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Encuentra exactamente lo que buscas
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-blue-600 hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center hover:border-blue-400 hover:shadow-lg transition-all"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Package size={24} />
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {cat.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section>
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Productos destacados
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Lo más reciente del catálogo
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            Ver catálogo completo
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse"
              >
                <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 mb-4" />
                <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800 mb-2" />
                <div className="h-6 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500">
            Aún no hay productos en el catálogo.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-2xl transition-all"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-6xl overflow-hidden">
                    {resolveImageUrl(product.image_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={resolveImageUrl(product.image_url)!}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                </Link>
                <div className="p-5">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                    {product.category?.name || "General"}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    className="block font-bold text-slate-800 dark:text-slate-100 mb-4 hover:text-blue-600 transition line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      ${parseFloat(product.price).toLocaleString()}
                    </span>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                      className={`px-3 py-2 rounded-lg font-bold text-sm transition-all ${
                        product.stock === 0
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          : "bg-slate-900 dark:bg-blue-600 text-white hover:bg-blue-600 active:scale-95"
                      }`}
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Value props */}
      <section>
        <h2 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
          ¿Por qué NexusCore?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Envíos rápidos",
              desc: "Despacho de pedidos con seguimiento de estados.",
              icon: Truck,
            },
            {
              title: "Compra segura",
              desc: "Checkout con IVA, medios de pago y factura en línea.",
              icon: ShieldCheck,
            },
            {
              title: "Soporte técnico",
              desc: "Órdenes de reparación con historial y garantía.",
              icon: Headphones,
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 hover:shadow-lg transition"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                {f.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="rounded-3xl bg-blue-600 px-8 py-14 text-center text-white shadow-xl">
        <h2 className="text-3xl font-extrabold mb-3">
          ¿Listo para modernizar tu negocio?
        </h2>
        <p className="mb-8 text-blue-100 max-w-xl mx-auto">
          Explora el catálogo, compra en línea o accede al panel ERP para
          gestionar ventas, stock y reparaciones.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/products"
            className="rounded-xl bg-white px-8 py-4 font-bold text-blue-700 transition hover:bg-blue-50 active:scale-95"
          >
            Ir al catálogo <ArrowRight size={18} className="inline ml-1" />
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-blue-300 px-8 py-4 font-bold transition hover:bg-blue-700"
          >
            Crear cuenta
          </Link>
        </div>
      </section>
    </div>
  );
}
