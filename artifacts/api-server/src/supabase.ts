import { createClient } from '@supabase/supabase-js'

// Security boundary · 2026-05-15
// The api-server uses the SERVICE ROLE key, which bypasses RLS policies.
// Auth is enforced at the API layer via `requireAuth` middleware. RLS is
// the second line of defense for direct Supabase REST calls made with
// the anon key (which ships in every iOS .ipa and is therefore public).
//
// If SUPABASE_SERVICE_ROLE_KEY is NOT set, fall back to the anon key
// with a loud warning · this keeps local development working but in
// production it means RLS-protected queries will fail (intended:
// production MUST have the service role key set).
//
// See migrations/2026-05-15-rls-enforce.sql for the RLS policies that
// gate the anon key from reading/writing other users' data.

const supabaseUrl = process.env.SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey = process.env.SUPABASE_ANON_KEY as string

if (!serviceRoleKey) {
  console.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY not set · falling back to anon key. " +
    "In production this means RLS-protected queries from the server will FAIL. " +
    "Set the service role key in Railway env vars."
  )
}

const supabaseKey = serviceRoleKey ?? anonKey

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Server-side client doesn't manage user sessions · disable to avoid
    // Supabase JS storing tokens or auto-refreshing on the backend.
    autoRefreshToken: false,
    persistSession: false,
  },
})
