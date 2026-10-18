"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Package,
  Boxes,
  Users,
  FolderTree,
  UserCircle,
  LogOut,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMounted } from "@/hooks/useMounted";

const NAV_ITEMS = [
  { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { label: "Ventas", href: "/dashboard/sales", icon: ShoppingCart },
  { label: "Reparaciones", href: "/dashboard/repairs", icon: Wrench },
  { label: "Productos", href: "/dashboard/products", icon: Package },
  { label: "Stock", href: "/dashboard/stock", icon: Boxes },
  { label: "Mi perfil", href: "/dashboard/profile", icon: UserCircle },
];

const ADMIN_ONLY = [
  { label: "Usuarios", href: "/dashboard/users", icon: Users },
  { label: "Categorías", href: "/dashboard/categories", icon: FolderTree },
  { label: "Cupones", href: "/dashboard/coupons", icon: Ticket },
];

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
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sticky top-24">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-400 uppercase">Panel ERP</p>
            <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400">
              {user.role}
            </span>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
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
