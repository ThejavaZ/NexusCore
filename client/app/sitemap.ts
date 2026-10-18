import type { MetadataRoute } from "next";
import { getApiBase, getSiteUrl } from "@/utils/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    const res = await fetch(`${getApiBase()}/api/v1/products?per_page=100`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const body = await res.json();
      const products: Array<{ slug: string; updated_at?: string }> = body.data?.data ?? body.data ?? [];
      for (const product of products) {
        if (!product.slug) continue;
        entries.push({
          url: `${site}/products/${product.slug}`,
          lastModified: product.updated_at ? new Date(product.updated_at) : now,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // API caída: el sitemap al menos incluye las rutas estáticas
  }

  return entries;
}
