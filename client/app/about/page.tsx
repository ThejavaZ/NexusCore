import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "Conoce NexusCore: la plataforma de e-commerce y ERP construida con Laravel y Next.js para gestionar catálogo, ventas y reparaciones.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16">
      {/* 1. HERO SECTION: Degradado Azul */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-900 px-8 py-20 text-white shadow-xl">
        <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
          <div>
            <span className="text-blue-200 font-semibold uppercase tracking-widest text-sm">
              Nuestra Esencia
            </span>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight">
              Conoce a NexusCore
            </h1>
            <p className="mt-6 text-lg text-blue-100/80">
              Plataforma full-stack que combina e-commerce y ERP en una sola
              aplicación. Laravel 12 + Next.js 16 + TypeScript.
            </p>
          </div>
          <div className="hidden md:block bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl aspect-video flex items-center justify-center">
            {/* Aquí puedes poner una imagen de tu setup o equipo */}
            <span className="text-white/40">Hardware Visual Placeholder</span>
          </div>
        </div>
      </section>

      {/* 2. PILARES: Grid de 3 Columnas */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">
          Nuestros Pilares
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Misión",
              desc: "Entregar tecnología de punta para elevar el rendimiento digital.",
              icon: "💡",
            },
            {
              title: "Visión",
              desc: "Ser el referente principal de hardware especializado en la región.",
              icon: "🏔️",
            },
            {
              title: "Valores",
              desc: "Innovación, Calidad certificada y Soporte técnico real.",
              icon: "🤝",
            },
          ].map((pilar) => (
            <div
              key={pilar.title}
              className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition text-center"
            >
              <div className="text-4xl mb-4">{pilar.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">
                {pilar.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {pilar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CTA FINAL: Potencia tu Setup */}
      <section className="bg-slate-900 rounded-3xl p-12 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">¡Potencia tu Setup!</h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Explora nuestro catálogo de componentes premium y periféricos
          seleccionados por expertos.
        </p>
        <Link
          href="/productos"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold transition-all transform hover:scale-105"
        >
          Explorar Productos
        </Link>
      </section>
    </div>
  );
}
