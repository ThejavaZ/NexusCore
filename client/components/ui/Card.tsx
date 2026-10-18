import { cn } from "@/utils/cn";

export function Card({
  children,
  className,
  padding = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800",
        padding && "p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: "blue" | "green" | "purple" | "yellow" | "red" | "slate";
}) {
  const accents = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    slate: "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        {icon && (
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accents[accent])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
