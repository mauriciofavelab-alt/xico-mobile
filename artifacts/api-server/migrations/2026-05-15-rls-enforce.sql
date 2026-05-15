-- ═══════════════════════════════════════════════════════════════════════════
-- XICO · Migration 2026-05-15 · ENFORCE ROW-LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════
-- 🔴 CRITICAL: this migration MUST be applied via Supabase SQL editor before
-- Build #11 ships to TestFlight. The anon key ships in every .ipa (it's
-- shipped to every user) and currently has full READ + WRITE access to user
-- data on profiles, sellos_rumbo, ruta_stop_notes, and emotional_events.
--
-- Live probe on 2026-05-15 confirmed:
--   · GET /rest/v1/profiles with anon key → 200 returns real profile rows
--   · PATCH /rest/v1/profiles?id=eq.<uuid> with anon key → 200 writes succeed
--   · GET /rest/v1/emotional_events with anon key → 200 returns events
--
-- Application order (DO NOT REVERSE):
--   1. Set SUPABASE_SERVICE_ROLE_KEY in Railway env vars (api-server
--      bypasses RLS via service role, while RLS protects the public anon key)
--   2. Wait for Railway redeploy to pick up the new env var
--   3. Run this migration in Supabase SQL editor
--   4. Verify: re-run the probes above; should now return 200 [] (empty)
--
-- Pattern · profile-scoped tables join through profiles.auth_user_id which
-- holds the Supabase auth.users.id (set on row creation by the trigger that
-- mirrors auth.users → profiles).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── profiles · user owns their own row ────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;

CREATE POLICY "profiles_select_own"  ON profiles  FOR SELECT
  USING (auth.uid() = auth_user_id);
CREATE POLICY "profiles_insert_own"  ON profiles  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "profiles_update_own"  ON profiles  FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);
-- No DELETE policy · users cannot delete their profile row. Account deletion
-- is a server-side operation (service role) that must clean up cascade.

-- ─── sellos_rumbo · user can see + earn their own sellos ───────────────────
ALTER TABLE sellos_rumbo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sellos_select_own" ON sellos_rumbo;
DROP POLICY IF EXISTS "sellos_insert_own" ON sellos_rumbo;

CREATE POLICY "sellos_select_own" ON sellos_rumbo FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = sellos_rumbo.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
CREATE POLICY "sellos_insert_own" ON sellos_rumbo FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = sellos_rumbo.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
-- No UPDATE/DELETE policy · sellos are permanent record per spec §6.

-- ─── ruta_stop_notes · user owns their annotations ─────────────────────────
ALTER TABLE ruta_stop_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_select_own"  ON ruta_stop_notes;
DROP POLICY IF EXISTS "notes_insert_own"  ON ruta_stop_notes;
DROP POLICY IF EXISTS "notes_update_own"  ON ruta_stop_notes;
DROP POLICY IF EXISTS "notes_delete_own"  ON ruta_stop_notes;

CREATE POLICY "notes_select_own" ON ruta_stop_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = ruta_stop_notes.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
CREATE POLICY "notes_insert_own" ON ruta_stop_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = ruta_stop_notes.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
CREATE POLICY "notes_update_own" ON ruta_stop_notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = ruta_stop_notes.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
CREATE POLICY "notes_delete_own" ON ruta_stop_notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = ruta_stop_notes.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));

-- ─── emotional_events · user owns their behavior log ───────────────────────
ALTER TABLE emotional_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emotional_select_own" ON emotional_events;
DROP POLICY IF EXISTS "emotional_insert_own" ON emotional_events;

CREATE POLICY "emotional_select_own" ON emotional_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = emotional_events.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
CREATE POLICY "emotional_insert_own" ON emotional_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = emotional_events.profile_id
      AND profiles.auth_user_id = auth.uid()
  ));
-- No UPDATE/DELETE · events are append-only.

-- ═══════════════════════════════════════════════════════════════════════════
-- Editorial / public tables · lock writes (read stays open)
-- These hold curated editorial content. Anyone with the anon key currently
-- can INSERT/UPDATE/DELETE rumbos, ruta_stops, madrid_pulse, etc. Lock
-- writes; reads remain public.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'rumbos', 'ruta', 'ruta_stops', 'madrid_pulse', 'partners',
      'companion_phrases', 'editor_letters'
    ])
  LOOP
    -- Skip tables that don't exist (e.g. companion_phrases or editor_letters
    -- might not be created yet in this branch).
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('DROP POLICY IF EXISTS "%s_public_read" ON %I', tbl, tbl);
      EXECUTE format('CREATE POLICY "%s_public_read" ON %I FOR SELECT USING (true)', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- No INSERT/UPDATE/DELETE policies on the above · service role bypasses RLS
-- so editorial workflows (api-server seeding, admin scripts) still work.
-- Anon key cannot vandalize.

-- ═══════════════════════════════════════════════════════════════════════════
-- Verification queries · run AFTER applying this migration to confirm
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. SELECT relname, relrowsecurity FROM pg_class WHERE relname IN
--    ('profiles','sellos_rumbo','ruta_stop_notes','emotional_events','rumbos','ruta_stops')
--    → all should show relrowsecurity = true
--
-- 2. From outside Supabase, with ONLY the anon key (no auth bearer token):
--    curl '$SUPA_URL/rest/v1/profiles?select=*' -H "apikey: $ANON_KEY"
--    → expected: 200 with [] (empty array · RLS hid every row)
--
-- 3. From the mobile app (logged-in session), open the app · profile + sellos
--    + emotional events should still load correctly (auth.uid() matches own
--    rows; policies pass).
-- ═══════════════════════════════════════════════════════════════════════════
