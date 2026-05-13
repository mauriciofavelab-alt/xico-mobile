/**
 * Resolves auth_user_id (Supabase Auth UUID set on req.userId by requireAuth)
 * to the profile.id used by foreign keys in sellos_rumbo, ruta_stop_notes,
 * emotional_events, etc.
 *
 * Creates the profile row on first lookup if it doesn't exist — mirrors the
 * pattern in routes/profile.ts so first-time auth doesn't 404 across the API.
 */

import { supabase } from "../supabase.js";

export async function resolveProfileId(authUserId: string): Promise<string> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) throw new Error(`profile lookup failed: ${error.message}`);
  if (data) return data.id as string;

  const { data: created, error: createErr } = await supabase
    .from("profiles")
    .insert({ auth_user_id: authUserId, interests: [] })
    .select("id")
    .single();

  if (createErr || !created) {
    throw new Error(`profile auto-create failed: ${createErr?.message ?? "unknown"}`);
  }
  return created.id as string;
}
