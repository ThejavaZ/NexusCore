import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function SupportPage({ params }: { params: { slug: string } }) {
  // Limpiamos el texto del slug para que se vea bien como título
  const title = params.slug.replace("-", " ").toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 min-h-[60vh]">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 font-semibold mb-6 hover:gap-2 transition-all"
      >
        <ChevronLeft size={20} /> Volver a la tienda
      </Link>

      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-10">
        <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
          Sección de Soporte
        </span>
        <h1 className="text-4xl font-black text-slate-900 mt-4 mb-6">
          {title}
        </h1>

        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-400 font-medium text-lg">
            Estamos trabajando en la documentación de{" "}
            <span className="text-slate-600">{title}</span>.
          </p>
          <p className="text-slate-400 text-sm mt-2 italic">
            Estará disponible para la versión final de NexusCore (ERP).
          </p>
        </div>
      </div>
    </div>
  );
}
