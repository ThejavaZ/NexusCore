import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-20 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="mb-4 inline-block rounded-full bg-blue-500/20 px-4 py-1 text-sm font-semibold text-blue-400">
            Plataforma de Comercio y Operaciones
          </span>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-6xl">
            Gestiona tu negocio con{" "}
            <span className="text-blue-500">NexusCore</span>
          </h1>
          <p className="mb-8 text-lg text-slate-400">
            Catálogo de productos, ventas, reparaciones y dashboard ERP — todo
            en una sola plataforma moderna.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/products"
              className="rounded-xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-700 active:scale-95"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-800/50 px-8 py-4 font-bold backdrop-blur-sm transition hover:bg-slate-800"
            >
              Acceder al ERP
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute -bottom-20 right-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-8 text-3xl font-bold">¿Qué incluye?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Catálogo en línea",
              desc: "Productos con stock, categorías, búsqueda y filtros.",
              icon: "🛍️",
            },
            {
              title: "Gestión de ventas",
              desc: "Facturación con IVA, control de stock automático.",
              icon: "💰",
            },
            {
              title: "Reparaciones",
              desc: "Seguimiento de órdenes con historial de estados.",
              icon: "🔧",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
