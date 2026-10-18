import { cn } from "@/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTablePagination {
  page: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  pagination?: DataTablePagination;
}

export function DataTable<T extends object>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No hay datos",
  pagination,
}: DataTableProps<T>) {
  const showPagination = pagination && pagination.lastPage > 1;

  const table = data.length === 0 ? (
    <div className="text-center py-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900">
      {emptyMessage}
    </div>
  ) : (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "bg-white dark:bg-slate-900 transition",
                onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50",
              )}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-sm text-slate-700 dark:text-slate-300", col.className)}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (!showPagination) return table;

  const { page, lastPage, total, onPageChange } = pagination!;

  return (
    <div className="space-y-3">
      {table}
      <div className="flex items-center justify-between text-sm">
        <p className="text-slate-500 dark:text-slate-400">
          Página {page} de {lastPage} · {total} registros
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Anterior
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
