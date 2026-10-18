import type { Metadata } from "next";
import { HomeView } from "@/components/HomeView";
import { getSiteUrl } from "@/utils/server";

export const metadata: Metadata = {
  title: { absolute: "NexusCore — Comercio y Operaciones" },
  description:
    "Plataforma de e-commerce y ERP: catálogo con stock en tiempo real, checkout con pagos en línea, ventas, reparaciones y dashboard de administración. Laravel + Next.js.",
  keywords: ["ecommerce", "ERP", "tienda online", "ventas", "reparaciones", "Laravel", "Next.js"],
  openGraph: {
    title: "NexusCore — Comercio y Operaciones",
    description:
      "Catálogo, checkout con pagos en línea, ventas y dashboard ERP en una sola plataforma.",
    type: "website",
    siteName: "NexusCore",
  },
};

export default function HomePage() {
  const site = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: "NexusCore",
        url: site,
        description: "Plataforma de e-commerce y ERP",
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        name: "NexusCore",
        url: site,
        publisher: { "@id": `${site}/#organization` },
      },
    ],
  };

  return (
    <>
      <HomeView />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
