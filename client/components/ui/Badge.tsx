import { cn } from "@/utils/cn";

const colors = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

interface BadgeProps {
  children: React.ReactNode;
  color?: keyof typeof colors;
  className?: string;
}

export function Badge({ children, color = "slate", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusColors: Record<string, keyof typeof colors> = {
  pending: "yellow",
  diagnosed: "blue",
  approved: "purple",
  in_progress: "blue",
  completed: "green",
  delivered: "green",
  cancelled: "red",
  cash: "green",
  card: "blue",
  transfer: "purple",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  diagnosed: "Diagnosticado",
  approved: "Aprobado",
  in_progress: "En progreso",
  completed: "Completado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge color={statusColors[status] || "slate"}>{statusLabels[status] || status}</Badge>;
}
