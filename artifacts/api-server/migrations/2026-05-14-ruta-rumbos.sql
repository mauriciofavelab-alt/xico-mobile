-- ═══════════════════════════════════════════════════════════════════════════
-- XICO · Migration 2026-05-14 · La Ruta Semanal + Pasaporte de los Cuatro Rumbos
-- ═══════════════════════════════════════════════════════════════════════════
-- Apply via Supabase SQL editor. Idempotent: safe to re-run.
--
-- Spec: docs/superpowers/specs/2026-05-13-ruta-semanal-rumbos-design.md
-- Plan: .claude/plans/magical-hopping-axolotl.md
-- Brandbook §5 §7: vault/projects/xico/brandbook.md
--
-- Note on ID types: ruta(id) and ruta_stops(id) are TEXT in this codebase
-- (see seed.sql:445 and seed-all.ts:40 — literal IDs like 'ruta-001').
-- All FKs to those tables use TEXT, not UUID. profiles(id) is UUID.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extension (gen_random_uuid) ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Rumbos · 4 fixed cardinal directions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS rumbos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL CHECK (slug IN ('norte','sur','este','oeste')),
  nahuatl_name TEXT NOT NULL,
  meaning      TEXT NOT NULL,
  color_hex    TEXT NOT NULL,
  description  TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ─── ruta_stops · extend with geo + rumbo + dual-layer text ────────────────
ALTER TABLE ruta_stops ADD COLUMN IF NOT EXISTS lat            DOUBLE PRECISION;
ALTER TABLE ruta_stops ADD COLUMN IF NOT EXISTS lng            DOUBLE PRECISION;
ALTER TABLE ruta_stops ADD COLUMN IF NOT EXISTS rumbo_id       UUID REFERENCES rumbos(id);
ALTER TABLE ruta_stops ADD COLUMN IF NOT EXISTS despacho_text  TEXT;
ALTER TABLE ruta_stops ADD COLUMN IF NOT EXISTS apunte_in_situ TEXT;

-- ─── ruta · extend with week-keyed publication tracking ────────────────────
ALTER TABLE ruta ADD COLUMN IF NOT EXISTS week_key     TEXT;
ALTER TABLE ruta ADD COLUMN IF NOT EXISTS editor_name  TEXT;
ALTER TABLE ruta ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_ruta_week_key ON ruta(week_key) WHERE week_key IS NOT NULL;

-- ─── sellos_rumbo · one per (profile, stop), permanent record ──────────────
CREATE TABLE IF NOT EXISTS sellos_rumbo (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ruta_stop_id          TEXT NOT NULL REFERENCES ruta_stops(id) ON DELETE RESTRICT,
  rumbo_id              UUID NOT NULL REFERENCES rumbos(id),
  earned_at             TIMESTAMPTZ DEFAULT now(),
  geo_verified          BOOLEAN NOT NULL DEFAULT true,
  time_verified_seconds INTEGER NOT NULL,
  photo_url             TEXT,
  UNIQUE (profile_id, ruta_stop_id)
);

CREATE INDEX IF NOT EXISTS idx_sellos_rumbo_profile       ON sellos_rumbo(profile_id);
CREATE INDEX IF NOT EXISTS idx_sellos_rumbo_profile_rumbo ON sellos_rumbo(profile_id, rumbo_id);

-- ─── ruta_stop_notes · optional 1-line annotations ─────────────────────────
CREATE TABLE IF NOT EXISTS ruta_stop_notes (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ruta_stop_id             TEXT NOT NULL REFERENCES ruta_stops(id) ON DELETE RESTRICT,
  text                     TEXT NOT NULL CHECK (length(text) BETWEEN 1 AND 280),
  is_published_anonymized  BOOLEAN NOT NULL DEFAULT false,
  created_at               TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ruta_stop_notes_profile ON ruta_stop_notes(profile_id, created_at DESC);

-- ─── emotional_events · pattern capture, no dashboard in v1 ────────────────
CREATE TABLE IF NOT EXISTS emotional_events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type           TEXT NOT NULL CHECK (event_type IN (
    'session_open','re_entry','despacho_reread','sello_earned',
    'annotation_left','late_night_open','quiet_return','ruta_complete'
  )),
  context              JSONB,
  hour_of_day          SMALLINT NOT NULL,
  days_since_last_open INTEGER,
  created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emotional_events_profile ON emotional_events(profile_id, created_at DESC);

-- ─── partners · v1 ships empty; v2 populates ───────────────────────────────
CREATE TABLE IF NOT EXISTS partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type      TEXT NOT NULL CHECK (partner_type IN (
    'restaurant_sello_copil','museum','gallery','bookstore'
  )),
  name              TEXT NOT NULL,
  redemption_method TEXT NOT NULL CHECK (redemption_method IN (
    'manual_show_id','voucher_code','partner_api'
  )),
  min_tier_required TEXT NOT NULL CHECK (min_tier_required IN ('curador','cronista')),
  accent_color      TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ─── madrid_pulse · 1 row per day, editor-curated atmospheric line ─────────
CREATE TABLE IF NOT EXISTS madrid_pulse (
  date_key    DATE PRIMARY KEY,
  text        TEXT NOT NULL,
  editor_name TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── companion_phrases · add time_mode dimension ──────────────────────────
-- Schema reality: companion_phrases.phrases is TEXT[], one row per
-- (level, narration_style). Adding time_mode means the row uniqueness moves to
-- (level, narration_style, time_mode). Existing rows default to 'dia'.
ALTER TABLE companion_phrases
  ADD COLUMN IF NOT EXISTS time_mode TEXT NOT NULL DEFAULT 'dia'
  CHECK (time_mode IN ('madrugada','dia','atardecer'));

-- Drop any prior unique on (level, narration_style); restore at the new shape.
-- The constraint name in this codebase isn't fixed, so we drop by the most
-- common Supabase-generated names defensively.
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT conname
      FROM pg_constraint
      WHERE conrelid = 'companion_phrases'::regclass
        AND contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE companion_phrases DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE companion_phrases
  ADD CONSTRAINT companion_phrases_level_style_timemode_unique
  UNIQUE (level, narration_style, time_mode);

-- ═══════════════════════════════════════════════════════════════════════════
-- profile_tier(p_profile_id UUID) · single source of truth for tier
-- ═══════════════════════════════════════════════════════════════════════════
-- Tier is computed, never stored. sellos_rumbo rows are the truth.
--
-- Tiers:
--   Iniciado  : <6 sellos
--   Conocedor : ≥6  in ≥2 distinct rumbos
--   Curador   : ≥16 in ≥3 distinct rumbos
--   Cronista  : ≥36 in ALL 4 rumbos AND ≥5 per rumbo
--
-- The distinct_rumbos = 4 constraint on Cronista is critical: without it,
-- a user with 100 sellos all in Sur would falsely qualify.
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION profile_tier(p_profile_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total           INTEGER;
  v_by_rumbo        JSONB;
  v_min_per_rumbo   INTEGER;
  v_distinct_rumbos INTEGER;
  v_tier            TEXT;
BEGIN
  SELECT COUNT(*) INTO v_total FROM sellos_rumbo WHERE profile_id = p_profile_id;

  SELECT jsonb_object_agg(r.slug, COALESCE(c.cnt, 0))
    INTO v_by_rumbo
    FROM rumbos r
    LEFT JOIN (
      SELECT rumbo_id, COUNT(*) AS cnt
        FROM sellos_rumbo
        WHERE profile_id = p_profile_id
        GROUP BY rumbo_id
    ) c ON c.rumbo_id = r.id;

  SELECT COUNT(*), MIN(cnt) INTO v_distinct_rumbos, v_min_per_rumbo
    FROM (
      SELECT rumbo_id, COUNT(*) AS cnt
        FROM sellos_rumbo
        WHERE profile_id = p_profile_id
        GROUP BY rumbo_id
    ) sub;

  v_tier := CASE
    WHEN v_total >= 36 AND v_distinct_rumbos = 4 AND v_min_per_rumbo >= 5 THEN 'cronista'
    WHEN v_total >= 16 AND v_distinct_rumbos >= 3                         THEN 'curador'
    WHEN v_total >= 6  AND v_distinct_rumbos >= 2                         THEN 'conocedor'
    ELSE 'iniciado'
  END;

  RETURN jsonb_build_object(
    'tier',            v_tier,
    'total',           v_total,
    'by_rumbo',        COALESCE(v_by_rumbo, '{}'::jsonb),
    'distinct_rumbos', COALESCE(v_distinct_rumbos, 0),
    'min_per_rumbo',   COALESCE(v_min_per_rumbo, 0)
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed · 4 rumbos (Mexica-accurate, Codex Fejérváry-Mayer plate 1)
-- Brandbook §5: colors rendered through Barragán-derived modern values
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO rumbos (slug, nahuatl_name, meaning, color_hex, description)
VALUES
  ('norte', 'Mictlampa',  'memoria · antepasados · norte frío',
   '#0E1018',
   'El rumbo de la muerte y la memoria. En la cosmología mexica, Mictlampa es el norte: el rumbo de los antepasados y del frío. Su color es el negro. En XICO se renderiza como el pétalo más oscuro visible sobre el fondo cálido del producto — un cobalto-casi-negro que conserva la lectura cosmológica sin perderse en el lienzo.'),

  ('sur', 'Huitzlampa',  'Huitzilopochtli · sol · alcance celeste',
   '#234698',
   'El rumbo del sol guerrero. Huitzlampa es el sur del Codex Fejérváry-Mayer: el rumbo de Huitzilopochtli, las espinas del agave, el alcance celeste del sol al mediodía. Su color es el azul. En XICO se renderiza con el ultramarino interior de la Casa Azul — no el cobalto turístico, el azul que Frida tenía en las paredes que nadie fotografía.'),

  ('este', 'Tlapallan',  'Xipe Totec · amanecer · renovación',
   '#D9357B',
   'El rumbo del amanecer y la renovación. Tlapallan es el este: el rumbo de Xipe Totec, la piel desollada, lo masculino que comienza otra vez. Su color es el rojo. En XICO se renderiza como el rosa de Barragán — el muro de la Casa Gilardi, el rosa mexicano más cálido que el bermellón institucional.'),

  ('oeste', 'Cihuatlampa',  'femenino · atardecer · oficio · cosecha',
   '#EDE6D8',
   'El rumbo del atardecer y lo femenino. Cihuatlampa es el oeste: el rumbo de las mujeres guerreras, del oficio acumulado, de la cosecha al final del día. Su color es el blanco. En XICO se renderiza como el hueso de Las Arboledas — blanco como Barragán lo pintaba, no blanco RGB. Sobre el lienzo cálido sostiene la luz sin agredir.')
ON CONFLICT (slug) DO UPDATE SET
  nahuatl_name = EXCLUDED.nahuatl_name,
  meaning      = EXCLUDED.meaning,
  color_hex    = EXCLUDED.color_hex,
  description  = EXCLUDED.description;
