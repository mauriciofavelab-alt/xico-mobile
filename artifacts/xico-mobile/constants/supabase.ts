import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// EXPO_PUBLIC_ prefixed env vars are baked into the JS bundle at build time.
// In dev: set them in `.env.local` (see `.env.example`).
// In TestFlight / production: set them via `eas secret:create` per EAS profile.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Surface whether Supabase is actually wired up so the auth gate can route
// the user to the editorial preview instead of the magic-link screen when
// the bundle was built without secrets (web brand preview, dev builds, etc.).
export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Defensive init · the previous version called `createClient(undefined, undefined)`
// at module-load when env vars were missing, which throws "supabaseUrl is required."
// synchronously and kills the entire bundle before React mounts. That made
// missing env vars catastrophic instead of degradable.
//
// Now: if either env var is missing we log a one-time warning and export a
// throwing proxy. The app boots, the UI renders, and only the FIRST network call
// surfaces a clear error ("Supabase not configured · check EXPO_PUBLIC_SUPABASE_URL").
// This is the right shape for an editorial product where most surfaces have
// local fallback content (despachos from `constants/despachos.ts`, etc.).
let _supabase: SupabaseClient;
if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "implicit",
    },
  });
} else {
  if (typeof console !== "undefined") {
    console.warn(
      "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY missing — auth + remote data disabled. Local fallback content still renders.",
    );
  }
  const reason = "Supabase not configured · set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your env";
  const throwingProxy: any = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === "auth") {
          // Auth namespace needs a stable shape (the app's AuthContext calls .getSession / .onAuthStateChange).
          // Return no-op stubs that resolve to "no session" rather than throwing — the app's auth context
          // treats this as anonymous user, which is the right state when Supabase is unconfigured.
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
            signInWithOtp: () => Promise.reject(new Error(reason)),
            signOut: () => Promise.resolve({ error: null }),
            setSession: () => Promise.reject(new Error(reason)),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          };
        }
        // Every other method (from / rpc / storage / functions / channel) returns a thenable that rejects
        // with the clear reason. React Query hooks surface this as an error state, not a crash.
        return () => Promise.reject(new Error(reason));
      },
    },
  );
  _supabase = throwingProxy as SupabaseClient;
}

export const supabase = _supabase;
