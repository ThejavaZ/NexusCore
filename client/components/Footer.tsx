import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Columna 1: Marca y Propósito */}
          <div className="col-span-1 md:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold text-white tracking-tight"
            >
              Nexus<span className="text-blue-500">Core</span>
            </Link>
            <p className="mt-4 text-sm leading-6">
              Plataforma de comercio y operaciones. Laravel + Next.js.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Tienda
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/productos"
                  className="hover:text-blue-400 transition"
                >
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link
                  href="/laptops"
                  className="hover:text-blue-400 transition"
                >
                  Laptops
                </Link>
              </li>
              <li>
                <Link
                  href="/componentes"
                  className="hover:text-blue-400 transition"
                >
                  Componentes
                </Link>
              </li>
              <li>
                <Link
                  href="/perifericos"
                  className="hover:text-blue-400 transition"
                >
                  Periféricos
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Soporte */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Soporte
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/contacto"
                  className="hover:text-blue-400 transition"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/envios" className="hover:text-blue-400 transition">
                  Guía de envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/garantia"
                  className="hover:text-blue-400 transition"
                >
                  Garantía
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-blue-400 transition">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Newsletter o Redes */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Síguenos
            </h3>
            <div className="mt-4 flex space-x-4">
              {/* Aquí puedes poner tus SVGs de redes sociales */}
              <p className="text-sm">
                Mantente al tanto de los nuevos lanzamientos de hardware.
              </p>
            </div>
          </div>
        </div>

        {/* Línea divisoria y Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {currentYear} NexusCore. Todos los derechos reservados.
          </p>
          <div className="flex space-x-6 text-xs">
            <Link href="/privacidad" className="hover:text-white">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
