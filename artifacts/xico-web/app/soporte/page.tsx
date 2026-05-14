import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soporte · XICO",
  description: "Cómo contactar al equipo XICO. Problemas comunes y respuestas.",
};

const FAQS = [
  {
    q: "El enlace mágico no llega.",
    a: "Revisa tu carpeta de spam. Si en cinco minutos no llega, pide otro desde la app. El correo viene de Supabase a nombre de XICO; algunos proveedores lo marcan la primera vez.",
  },
  {
    q: "No puedo abrir el apunte aunque estoy en el sitio.",
    a: "La app necesita permiso de ubicación. Ajustes → XICO → Ubicación → \"Mientras uso la app\". Si la señal GPS es débil (interiores, calles estrechas), sal un momento a la calle y vuelve a intentar.",
  },
  {
    q: "Olvidé hacer una anotación al llegar a una parada.",
    a: "Las anotaciones son opcionales. Si quieres añadir una después, vuelve a la parada en la próxima visita o escríbenos a soporte. El sello del lugar ya está en tu Pasaporte de los Cuatro Rumbos.",
  },
  {
    q: "Quiero borrar mi cuenta.",
    a: "Escribe a maufavela@hotmail.com con el asunto \"Eliminar mi cuenta\". Borramos todos tus datos en 7 días laborables como máximo.",
  },
  {
    q: "¿Cuándo sale la próxima Ruta?",
    a: "Cada domingo a las 9 de la mañana. Una nueva editora cada semana. Si llevas siete días sin abrir la app, te recibimos al volver — sin culpa.",
  },
  {
    q: "¿Puedo proponer un lugar para una Ruta futura?",
    a: "Sí, y nos gusta. Escribe a maufavela@hotmail.com con el nombre del sitio, una línea sobre por qué es relevante, y tu nombre. Las propuestas las lee el equipo editorial.",
  },
];

export default function SupportPage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-[rgba(240,236,230,0.1)]">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <Link href="/" className="font-sans text-[11px] uppercase tracking-[2.5px] text-text-tertiary">
            ← Volver a XICO
          </Link>
          <h1 className="mt-6 font-serif text-3xl md:text-4xl text-text-primary leading-tight tracking-tight">
            Soporte
          </h1>
          <p className="mt-3 font-serif italic text-text-secondary text-lg">
            Para lo que se rompa, lo que no entiendas o lo que quieras proponer.
          </p>
        </div>
      </header>

      {/* Direct contact card */}
      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="border border-[rgba(240,236,230,0.18)] p-8 md:p-10">
          <p className="font-sans text-[11px] uppercase tracking-[3px] text-magenta mb-4">
            <span className="inline-block w-1.5 h-1.5 bg-magenta align-middle mr-2" />
            Contacto directo
          </p>
          <a
            href="mailto:maufavela@hotmail.com?subject=XICO%20%C2%B7%20Soporte"
            className="font-serif text-2xl md:text-3xl text-text-primary block underline-offset-4 hover:underline"
          >
            maufavela@hotmail.com
          </a>
          <p className="mt-4 font-serif italic text-text-secondary text-base leading-relaxed">
            Respuesta garantizada en menos de 48 horas. El equipo es pequeño y lee todo personalmente.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[rgba(240,236,230,0.1)]">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="flex items-center gap-3 mb-10">
            <span className="inline-block w-4 h-px bg-magenta" />
            <p className="font-sans text-[11px] uppercase tracking-[2.5px] text-magenta">
              Preguntas frecuentes
            </p>
          </div>

          <dl className="space-y-10">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <dt className="font-serif text-xl md:text-2xl text-text-primary leading-snug tracking-tight">
                  {faq.q}
                </dt>
                <dd className="mt-3 font-serif text-base md:text-[17px] leading-[1.65] text-text-secondary">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <footer className="border-t border-[rgba(240,236,230,0.1)] mt-12">
        <div className="mx-auto max-w-2xl px-6 py-8 text-center">
          <Link href="/" className="font-sans text-[11px] uppercase tracking-[2.5px] text-text-tertiary">
            ← Volver a XICO
          </Link>
        </div>
      </footer>
    </main>
  );
}
