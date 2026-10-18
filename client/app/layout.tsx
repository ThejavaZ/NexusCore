import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "NexusCore — Comercio y Operaciones",
    template: "%s · NexusCore",
  },
  description:
    "Plataforma de e-commerce y ERP con catálogo, ventas, reparaciones y dashboard en una sola aplicación.",
  keywords: ["ecommerce", "ERP", "tienda online", "ventas", "reparaciones"],
  openGraph: {
    type: "website",
    siteName: "NexusCore",
    locale: "es_MX",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased min-h-screen flex flex-col
          bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100
        `}
      >
        <ThemeProvider>
          <Header />
          <main className="grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
