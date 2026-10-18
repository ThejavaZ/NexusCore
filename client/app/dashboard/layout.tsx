"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Package,
  Users,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMounted } from "@/hooks/useMounted";

const NAV_ITEMS = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ventas", href: "/dashboard/sales", icon: ShoppingCart },
  { label: "Reparaciones", href: "/dashboard/repairs", icon: Wrench },
  { label: "Productos", href: "/dashboard/products", icon: Package },
];

const ADMIN_ONLY = [{ label: "Usuarios", href: "/dashboard/users", icon: Users }];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const mounted = useMounted();

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-400 font-bold">Cargando...</div>
      </div>
    );
  }

  const isStaff = user.role === "admin" || user.role === "staff";
  if (!isStaff) {
    router.push("/");
    return null;
  }

  const navItems = user.role === "admin" ? [...NAV_ITEMS, ...ADMIN_ONLY] : NAV_ITEMS;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-[80vh] gap-6">
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sticky top-24">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase">Panel ERP</p>
            <p className="font-bold text-slate-800">{user.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">
              {user.role}
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
