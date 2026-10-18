import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { fetchProductBySlug, absoluteImageUrl } from "@/utils/server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const description = (
    product.description ||
    `Compra ${product.name} en NexusCore. ${product.stock > 0 ? "Disponible en stock." : "Producto agotado."}`
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);

  const image = absoluteImageUrl(product.image_url);

  return {
    title: product.name,
    description,
    keywords: [product.name, product.sku, product.category?.name].filter(Boolean) as string[],
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description ?? undefined,
    image: absoluteImageUrl(product.image_url),
    brand: { "@type": "Brand", name: "NexusCore" },
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/products/${product.slug}`,
      priceCurrency: "USD",
      price: product.price,
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <ProductDetail slug={slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
