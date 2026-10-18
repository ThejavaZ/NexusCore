"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Package } from "lucide-react";
import { api } from "@/utils/api";
import { resolveImageUrl } from "@/utils/image";
import { useCartStore } from "@/store/useCartStore";
import { Badge, Button, Skeleton } from "@/components/ui";

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

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    if (!slug) return;
    api<Product>(`products/${slug}`).then((res) => {
      if (res.error) {
        setNotFound(true);
      } else {
        setProduct(res.data);
      }
      setLoading(false);
    });
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

  return (
    <div>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-6"
      >
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

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
            {product.stock === 0 ? (
              <Badge color="red">Agotado</Badge>
            ) : lowStock ? (
              <Badge color="yellow">Últimas {product.stock} unidades</Badge>
            ) : (
              <Badge color="green">En stock ({product.stock} disponibles)</Badge>
            )}
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={product.stock === 0}
            onClick={() => {
              addToCart(product);
              router.push("/cart");
            }}          >
            <ShoppingCart size={20} />
            {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </div>
  );
}
