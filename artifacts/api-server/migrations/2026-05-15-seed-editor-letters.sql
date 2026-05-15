-- ═══════════════════════════════════════════════════════════════════════════
-- XICO · Seed editor_letters · 2026-05-15
-- ═══════════════════════════════════════════════════════════════════════════
-- Carta del Equipo seed · one letter per pillar (the 5 walkthrough chips)
-- plus 2 legacy interest slugs so existing test users see content too.
--
-- WHY THIS MATTERS · Pre-TestFlight content audit (2026-05-15) found that
-- the editor_letters table was empty in production. Every user who finished
-- onboarding and opened Tu Códice saw the Carta del Equipo card silently
-- HIDE (per manifesto: better silence than fake content). This left Tu
-- Códice without a named editorial voice — which is exactly the moat that
-- defends XICO against Casa de México, the Embajada, and Instagram tourist
-- accounts. Without a Carta, "una publicación" wobbles.
--
-- Apply via Supabase SQL editor. Idempotent: re-running upserts on
-- (interest_match) thanks to the ON CONFLICT clause.
--
-- ✏️ EDITORIAL NOTE (read before running): these letters are *drafts* in
-- the brand voice (manifesto-aligned, Newsreader-italic register, no
-- streak/guilt language, named editor + role). They are good enough to
-- ship to TestFlight Build #11. They should be reviewed by Mauricio
-- and the named editors before any public submission. Edit the
-- message_template values below freely.
-- ═══════════════════════════════════════════════════════════════════════════

-- Add a UNIQUE constraint on (interest_match) if not already present, so the
-- ON CONFLICT below has something to target. Safe to run multiple times.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'editor_letters'
      AND indexname = 'editor_letters_interest_match_key'
  ) THEN
    ALTER TABLE editor_letters
      ADD CONSTRAINT editor_letters_interest_match_key UNIQUE (interest_match);
  END IF;
END $$;

INSERT INTO editor_letters (editor_name, editor_role, interest_match, message_template, accent_color)
VALUES

-- ─── New 5-pillar taxonomy (walkthrough step-5 chips) ────────────────────

(
  'María Vázquez',
  'editora del despacho',
  'Despacho',
  'Elegiste el Despacho. Eso me dice que vienes a XICO buscando una mañana — no un feed. Tres líneas escritas para hoy, en voz humana. Eso es lo que prometo cada día a las nueve. Algunas semanas más oscuras que otras. Ninguna automática. Si una mañana el Despacho te corta el día por la mitad, ya hicimos nuestro trabajo.',
  '#9C1A47'
),

(
  'Ximena Caraza Campos',
  'editora cultura',
  'Cultura',
  'Elegiste Cultura. Eso significa que te interesa la conversación que pasa entre Madrid y México sin pasar por Instagram. PHotoESPAÑA, Casa de México, Reina Sofía: aquí encontrarás lo que importa de cada temporada, antes que se vuelva tendencia. Sin algoritmo. Solo lo que vale la pena perder una tarde.',
  '#1A3D8A'
),

(
  'Adriana Vilchis Nava',
  'editora méxico ahora',
  'México Ahora',
  'Elegiste México Ahora. Bienvenida a la sección que más rápido envejece. Aquí va la agenda de la semana: lo que se inaugura, lo que cierra, lo que solo dura cuarenta y ocho horas. No es lista. Es atención. Si terminas el mes habiendo ido a tres de estas cosas, hicimos lo que prometimos.',
  '#C4A55A'
),

(
  'María Vázquez',
  'editora de la ruta',
  'La Ruta',
  'Elegiste La Ruta. Eso me dice que entiendes algo fundamental: una ciudad no se aprende en el feed, se aprende a pie. Cada domingo a las nueve subo cinco paradas. Las camino antes de publicarlas. Si el orden no funciona, no las publico. Si encuentras que tu domingo cambia por ellas, sabré que merecieron el trabajo.',
  '#D9357B'
),

(
  'Sofía Mendoza',
  'archivera',
  'Archivo',
  'Elegiste Archivo. Significa que prefieres lo que aguanta — no lo que aparece. Aquí guardamos lo que la actualidad olvida muy rápido: cómo entró el achiote a la pintura barroca, qué quería decir nepantla antes de que se volviera frase, por qué el chocolate llegó amargo y se quedó dulce. Lecturas largas. Cita imprescindible: no la última noticia.',
  '#1A4A1A'
),

-- ─── Legacy 8-category taxonomy (existing test users) ────────────────────

(
  'Sofía Mendoza',
  'editora gastronomía',
  'Gastronomía',
  'Elegiste Gastronomía. Madrid en 2026 come distinto que hace cinco años — la cocina mexicana se asentó en la conversación seria. Aquí cubrimos las mesas que importan: Punto MX, Barracuda, Los Montes, las botanas del Mercado de San Fernando. No reseñas. Direcciones para usar. Y por qué cada cosa importa.',
  '#1A4A1A'
),

(
  'Ximena Caraza Campos',
  'editora fotografía',
  'Fotografía y Memoria',
  'Elegiste Fotografía. Bien. Madrid tiene cinco galerías serias que muestran fotografía mexicana este año — y eso no es accidente. Iturbide, Garduño, Edburg, los archivos del SEMEFO. Aquí guardamos lo que se expone, lo que ya pasó pero merece volver, y los nombres que aún no son conocidos pero deberían serlo.',
  '#1A3D8A'
)

ON CONFLICT (interest_match) DO UPDATE SET
  editor_name      = EXCLUDED.editor_name,
  editor_role      = EXCLUDED.editor_role,
  message_template = EXCLUDED.message_template,
  accent_color     = EXCLUDED.accent_color;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification · after running, hit these endpoints to confirm each letter
-- returns 200 with the editor + voice. Run them with the anon key (no auth):
--
-- curl 'https://xico-api-production.up.railway.app/api/editor-letters?interest=Despacho'
-- curl 'https://xico-api-production.up.railway.app/api/editor-letters?interest=Cultura'
-- curl 'https://xico-api-production.up.railway.app/api/editor-letters?interest=M%C3%A9xico%20Ahora'
-- curl 'https://xico-api-production.up.railway.app/api/editor-letters?interest=La%20Ruta'
-- curl 'https://xico-api-production.up.railway.app/api/editor-letters?interest=Archivo'
-- ═══════════════════════════════════════════════════════════════════════════
