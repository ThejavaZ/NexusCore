export interface SeoProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  stock: number;
  min_stock: number;
  price: string;
  image_url: string | null;
  is_active: boolean;
  category: { id: number; name: string; slug: string } | null;
  updated_at?: string;
}

export function getApiBase(): string {
  return (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteImageUrl(imageUrl?: string | null): string | undefined {
  if (!imageUrl || !imageUrl.startsWith("/")) return undefined;
  return `${getApiBase()}${imageUrl}`;
}

export async function fetchProductBySlug(slug: string): Promise<SeoProduct | null> {
  try {
    const res = await fetch(`${getApiBase()}/api/v1/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body.data ?? null) as SeoProduct | null;
  } catch {
    return null;
  }
}
