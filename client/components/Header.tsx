"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingCart, User, Search, Menu, X, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMounted } from "@/hooks/useMounted";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  const { user } = useAuthStore();
  const cartCount = useCartStore((state) => state.count);
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();

  const toggleMenu = () => setIsOpen(!isOpen);
  const isStaff = user?.role === "admin" || user?.role === "staff";

  if (!mounted) return null;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              NexusCore
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Productos
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Nosotros
            </Link>
            {user && (
              <Link
                href="/orders"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Mis pedidos
              </Link>
            )}
            {isStaff && (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-gray-700 hover:text-blue-600 font-medium"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
              <Search size={22} />
            </button>

            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-blue-600 transition"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {isStaff && (
                  <Link
                    href="/dashboard"
                    className="hidden md:flex items-center gap-1.5 p-2 text-emerald-600 bg-emerald-50 rounded-xl transition hover:bg-emerald-100"
                  >
                    <LayoutDashboard size={18} />
                    <span className="text-sm font-bold">ERP</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-2 text-blue-600 bg-blue-50 rounded-xl transition hover:bg-blue-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-sm font-bold">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition border-l pl-4 ml-2"
              >
                <User size={22} />
                <span className="hidden lg:inline text-sm font-semibold">
                  Entrar
                </span>
              </Link>
            )}

            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 p-2"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-white ${isOpen ? "max-h-96 border-t shadow-lg" : "max-h-0"}`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1">
          <Link
            href="/"
            onClick={toggleMenu}
            className="block px-3 py-3 rounded-md font-medium text-gray-700"
          >
            Inicio
          </Link>
          <Link
            href="/products"
            onClick={toggleMenu}
            className="block px-3 py-3 rounded-md font-medium text-gray-700"
          >
            Productos
          </Link>
          <Link
            href="/about"
            onClick={toggleMenu}
            className="block px-3 py-3 rounded-md font-medium text-gray-700"
          >
            Nosotros
          </Link>
          {user && (
            <Link
              href="/orders"
              onClick={toggleMenu}
              className="block px-3 py-3 rounded-md font-medium text-gray-700"
            >
              Mis pedidos
            </Link>
          )}
          {isStaff && (
            <Link
              href="/dashboard"
              onClick={toggleMenu}
              className="block px-3 py-3 rounded-md font-medium text-emerald-600"
            >
              Dashboard ERP
            </Link>
          )}
          <div className="pt-4 border-t border-gray-100">
            {!user && (
              <Link href="/login" onClick={toggleMenu} className="block px-3 py-3 font-semibold text-blue-600">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
