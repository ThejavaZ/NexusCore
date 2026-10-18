"use client";

import { useState, useEffect, useCallback } from "react";
import { useCartStore } from "@/store/useCartStore";
import { api } from "@/utils/api";
import { resolveImageUrl } from "@/utils/image";

interface Product {
  id: number;
  slug?: string;
  name: string;
  price: string;
  stock: number;
  image_url: string | null;
  category: { id: number; name: string } | null;
}

interface Category {
  id: number;
  name: string;
}

interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const addToCart = useCartStore((state) => state.addToCart);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("category_id", String(filter));
    if (search) params.set("search", search);

    const res = await api<Paginated<Product>>(`products?${params}`);
    if (!res.error) {
      setProducts(res.data.data);
    }
    setLoading(false);
  }, [filter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    api<Category[]>("categories").then((res) => {
      if (!res.error) setCategories(res.data);
    });
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre o SKU..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4 border-b pb-2">Categorías</h2>
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setFilter(null)}
              className={`text-left px-3 py-2 rounded-lg transition ${
                filter === null
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`text-left px-3 py-2 rounded-lg transition ${
                  filter === cat.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Grid */}
      <main className="flex-1">
        {loading ? (
          <div className="p-10 text-center font-bold text-slate-400">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            No se encontraron productos
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all"
              >
                {product.stock === 0 && (
                  <span className="absolute top-3 left-3 z-10 px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-500 text-white">
                    Agotado
                  </span>
                )}

                <div className="aspect-square bg-slate-50 flex items-center justify-center text-6xl overflow-hidden">
                  {resolveImageUrl(product.image_url) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImageUrl(product.image_url)!} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    "📦"
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">
                    {product.category?.name || "General"}
                  </p>
                  <h3 className="text-slate-800 font-bold text-lg mb-4">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-black text-slate-900">
                      ${parseFloat(product.price).toLocaleString()}
                    </span>
                    <button
                      disabled={product.stock === 0}
                      onClick={() => addToCart(product)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        product.stock === 0
                          ? "bg-slate-100 text-slate-400"
                          : "bg-slate-900 text-white hover:bg-blue-600"
                      }`}
                    >
                      {product.stock === 0 ? "Sin Stock" : "Agregar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
