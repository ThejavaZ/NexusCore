import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusCore — Comercio y Operaciones",
  description: "Plataforma de e-commerce y ERP con Laravel + Next.js",
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
        </ThemeProvider>
      </body>
    </html>
  );
}
