import Link from "next/link";

const STOPS = [
  { id: 1, name: "Casa de México en España", barrio: "Chamberí", rumbo: "Mictlampa", rumboColor: "var(--color-rumbo-norte)" },
  { id: 2, name: "Punto MX", barrio: "Salamanca", rumbo: "Tlapallan", rumboColor: "var(--color-rumbo-este)" },
  { id: 3, name: "Barracuda MX", barrio: "Retiro", rumbo: "Huitzlampa", rumboColor: "var(--color-rumbo-sur)" },
  { id: 4, name: "Corazón Agavero", barrio: "La Latina", rumbo: "Cihuatlampa", rumboColor: "var(--color-rumbo-oeste)" },
  { id: 5, name: "La Botica de la Condesa", barrio: "Malasaña", rumbo: "Mictlampa", rumboColor: "var(--color-rumbo-norte)" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* Masthead · matches the mobile app's editorial header */}
      <header className="border-b-2 border-text-primary">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex items-center justify-between">
            <p className="font-sans text-[11px] uppercase tracking-[3px] text-magenta">
              <span className="inline-block w-1.5 h-1.5 bg-magenta align-middle mr-2" />
              Edición Inaugural · Madrid 2026
            </p>
            <p className="font-sans text-[10px] uppercase tracking-[2px] text-text-tertiary">
              Vol. III · Nº 05
            </p>
          </div>

          <h1
            className="mt-6 font-serif font-semibold text-text-primary leading-none"
            style={{ fontSize: "clamp(64px, 14vw, 144px)", letterSpacing: "12px" }}
          >
            XICO
          </h1>

          <p className="mt-4 font-serif italic text-text-secondary text-lg md:text-xl leading-snug">
            México en Madrid, semana a semana.
          </p>
        </div>
      </header>

      {/* Standfirst */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="font-serif text-2xl md:text-3xl leading-snug text-text-primary tracking-tight">
          XICO es una publicación editorial sobre la presencia mexicana en Madrid.{" "}
          <span className="italic text-text-secondary">No te dice qué ver: te dice qué reconocer.</span>
        </p>

        <div className="hairline mt-12" />

        <div className="mt-12 grid md:grid-cols-2 gap-x-8 gap-y-6 font-serif text-base md:text-[17px] leading-[1.65] text-text-secondary">
          <p>
            Cada domingo a las 9, una editora mexicana publica una <strong className="text-text-primary font-medium">Ruta</strong> nueva. Cinco paradas en Madrid — una galería, una mezcalería, una sala, un barrio. Cada parada tiene un <em>despacho</em> público que puedes leer desde casa, y un <em>apunte in situ</em> que solo se abre cuando llegas al sitio.
          </p>
          <p>
            Caminar la Ruta llena tu <strong className="text-text-primary font-medium">Pasaporte de los Cuatro Rumbos</strong>. Sin streaks. Sin notificaciones. Sin puntos. Solo paso. Pensado para mexicanos en Europa y para quien sea con curiosidad por una capital cultural que España todavía está aprendiendo a leer.
          </p>
        </div>
      </section>

      {/* The inaugural Ruta · numbered list */}
      <section className="border-t border-b border-[rgba(240,236,230,0.1)]">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <div className="flex items-center gap-3 mb-10">
            <span className="inline-block w-4 h-px bg-magenta" />
            <p className="font-sans text-[11px] uppercase tracking-[2.5px] text-magenta">
              La Ruta inaugural · Semana 19
            </p>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl text-text-primary leading-tight tracking-tight mb-2">
            Cinco paradas, cinco barrios, cinco rumbos.
          </h2>
          <p className="font-serif italic text-text-secondary text-base md:text-lg mb-12">
            Escrita por María Vázquez · publicada el domingo 17 de mayo
          </p>

          <ol className="space-y-0">
            {STOPS.map((stop) => (
              <li
                key={stop.id}
                className="flex items-baseline gap-6 py-5 border-b border-[rgba(240,236,230,0.06)] last:border-b-0"
              >
                <span className="font-sans text-[11px] uppercase tracking-[2.5px] text-text-tertiary w-12 flex-shrink-0">
                  {String(stop.id).padStart(2, "0")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xl md:text-2xl text-text-primary leading-tight">
                    {stop.name}
                  </p>
                  <p className="font-sans text-[12px] uppercase tracking-[2px] text-text-tertiary mt-1">
                    {stop.barrio}
                  </p>
                </div>
                <span
                  className="font-serif italic text-[13px] md:text-sm text-text-tertiary flex-shrink-0"
                  style={{ color: stop.rumboColor === "var(--color-rumbo-norte)" ? "var(--color-text-secondary)" : stop.rumboColor }}
                >
                  {stop.rumbo}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Disponible próximamente */}
      <section className="mx-auto max-w-3xl px-6 py-20 md:py-28 text-center">
        <p className="font-sans text-[11px] uppercase tracking-[3px] text-text-tertiary mb-6">
          Estado
        </p>
        <p className="font-serif text-3xl md:text-4xl text-text-primary leading-tight tracking-tight">
          Disponible próximamente.
        </p>
        <p className="mt-6 font-serif italic text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
          XICO está en pruebas internas vía TestFlight. La versión pública en App Store llega en cuanto Apple termine de revisarla.
        </p>
        <p className="mt-8 font-serif text-base text-text-tertiary">
          <a
            href="mailto:maufavela@hotmail.com?subject=XICO%20%C2%B7%20Quiero%20entrar%20al%20beta"
            className="text-text-secondary"
          >
            Escribe a maufavela@hotmail.com →
          </a>
        </p>
      </section>

      {/* Footer · editorial colophon */}
      <footer className="border-t border-[rgba(240,236,230,0.1)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-[12px] font-sans uppercase tracking-[2px] text-text-tertiary">
            <div>
              <p className="text-text-secondary mb-2">XICO</p>
              <p className="normal-case tracking-normal font-serif italic text-text-tertiary">
                Una publicación editorial. Madrid, 2026.
              </p>
            </div>
            <div>
              <p className="text-text-secondary mb-2">Editorial</p>
              <p className="normal-case tracking-normal font-serif text-text-tertiary">
                Mauricio Favela <span className="italic">(fundador)</span>
                <br />
                María Vázquez <span className="italic">(editora inaugural)</span>
              </p>
            </div>
            <div>
              <p className="text-text-secondary mb-2">Información</p>
              <ul className="normal-case tracking-normal font-serif text-text-tertiary space-y-1">
                <li>
                  <Link href="/privacidad">Política de privacidad</Link>
                </li>
                <li>
                  <Link href="/soporte">Soporte</Link>
                </li>
                <li>
                  <a href="mailto:maufavela@hotmail.com">Contacto</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
