import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad · XICO",
  description: "Qué datos recoge XICO, por qué los recoge, y dónde se guardan.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh">
      <header className="border-b border-[rgba(240,236,230,0.1)]">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <Link href="/" className="font-sans text-[11px] uppercase tracking-[2.5px] text-text-tertiary">
            ← Volver a XICO
          </Link>
          <h1 className="mt-6 font-serif text-3xl md:text-4xl text-text-primary leading-tight tracking-tight">
            Política de Privacidad
          </h1>
          <p className="mt-2 font-sans text-[11px] uppercase tracking-[2px] text-text-tertiary">
            Última actualización · 14 de mayo de 2026
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-2xl px-6 py-12 space-y-8 font-serif text-base md:text-[17px] leading-[1.7] text-text-secondary">
        <p className="text-lg italic text-text-primary">
          XICO está diseñada para no recopilar lo que no necesita. Esta política dice exactamente qué se recoge y por qué.
        </p>

        <section>
          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-3 font-medium">Datos que XICO recoge</h2>
          <ul className="space-y-3 pl-5 list-disc marker:text-text-tertiary">
            <li>
              <strong className="text-text-primary font-medium">Tu dirección de correo electrónico.</strong> Necesaria
              para iniciar sesión mediante un enlace mágico (no usamos contraseñas) y para sincronizar tu Pasaporte
              entre dispositivos.
            </li>
            <li>
              <strong className="text-text-primary font-medium">Tu ubicación, solo durante la apertura de un apunte.</strong>{" "}
              Cuando intentas abrir el apunte in situ de una parada, la app compara tu posición con la del sitio
              (radio de 50 metros) y rechaza la apertura si estás lejos. Tu ubicación nunca se guarda.
            </li>
            <li>
              <strong className="text-text-primary font-medium">Las anotaciones que escribes.</strong> Si tras llegar
              a una parada decides dejar una línea (opcional, máximo 280 caracteres), la guardamos junto a tu
              identificador. El equipo editorial las lee.
            </li>
            <li>
              <strong className="text-text-primary font-medium">Los sellos que ganas.</strong> Cada vez que cumples
              las condiciones de una parada, se inserta un sello en tu Pasaporte. Persiste mientras tu cuenta exista.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-3 font-medium">Datos que XICO NO recoge</h2>
          <ul className="space-y-2 pl-5 list-disc marker:text-text-tertiary">
            <li>Ubicación precisa de seguimiento (solo se consulta puntualmente para verificar paradas)</li>
            <li>Contactos, fotos, calendario, ni ningún otro permiso del sistema</li>
            <li>Historial de navegación dentro de la app para fines publicitarios</li>
            <li>Datos de uso anónimos vendidos a terceros</li>
            <li>Información de pago (no hay compras dentro de la app)</li>
            <li>Identificadores publicitarios (IDFA, Google Ad ID)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-3 font-medium">Dónde se guarda tu información</h2>
          <p>
            La autenticación, la base de datos y los archivos de sello se alojan en{" "}
            <a href="https://supabase.com" target="_blank" rel="noopener" className="text-text-primary underline-offset-4">
              Supabase
            </a>
            , con servidores en la región <em>Europa Oeste</em> (Irlanda). La API que conecta la app con la base
            de datos corre en{" "}
            <a href="https://railway.app" target="_blank" rel="noopener" className="text-text-primary underline-offset-4">
              Railway
            </a>
            , también en Europa. No transferimos tus datos fuera del Espacio Económico Europeo.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-3 font-medium">Cómo eliminar tus datos</h2>
          <p>
            Escribe a{" "}
            <a href="mailto:maufavela@hotmail.com?subject=XICO%20%C2%B7%20Eliminar%20mi%20cuenta" className="text-text-primary underline-offset-4">
              maufavela@hotmail.com
            </a>{" "}
            con el asunto <em>"Eliminar mi cuenta"</em>. Borraremos todos tus datos en un plazo máximo de 7 días
            laborables y te enviaremos una confirmación. No conservamos copias de seguridad después de la eliminación.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-3 font-medium">Responsable</h2>
          <p>
            El responsable del tratamiento es Mauricio Favela ({" "}
            <a href="mailto:maufavela@hotmail.com" className="text-text-primary underline-offset-4">
              maufavela@hotmail.com
            </a>
            ), Madrid, España. Esta política se rige por el{" "}
            <abbr title="Reglamento General de Protección de Datos">RGPD</abbr> y la Ley Orgánica 3/2018 de
            Protección de Datos Personales y Garantía de los Derechos Digitales.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl md:text-2xl text-text-primary mb-3 font-medium">Cambios a esta política</h2>
          <p>
            Cuando esta política cambie, actualizaremos la fecha de "última actualización" arriba. Los cambios
            importantes (recogida de un nuevo tipo de dato, cambio de proveedor de infraestructura) se anunciarán
            en la propia app antes de aplicarse.
          </p>
        </section>
      </article>

      <footer className="border-t border-[rgba(240,236,230,0.1)] mt-12">
        <div className="mx-auto max-w-2xl px-6 py-8 text-center">
          <Link
            href="/"
            className="font-sans text-[11px] uppercase tracking-[2.5px] text-text-tertiary"
          >
            ← Volver a XICO
          </Link>
        </div>
      </footer>
    </main>
  );
}
