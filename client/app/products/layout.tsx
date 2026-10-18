import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo de productos de NexusCore — tecnología y dispositivos con stock en tiempo real. Filtra por categoría, precio y disponibilidad.",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
