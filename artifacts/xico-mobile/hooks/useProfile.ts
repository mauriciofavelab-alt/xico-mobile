import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import { supabaseConfigured } from "@/constants/supabase";

/**
 * Profile shape returned by GET /api/profile (see api-server/src/routes/profile.ts).
 * `name` is the single `display_name` column (split into first/family display-side).
 * `memberSince` is just the year string ("2026") — the month label is composed
 * client-side in `tu-codice.tsx` because the API doesn't yet return month-of-join
 * (schema migration deferred to v1.2 per Phase 3 scope).
 */
export type ProfileState = {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  interests: string[];
  narration_style: string;
  memberType: string;
  memberSince: string;
  city: string;
  country: string;
  points: number;
  streakDays: number;
};

/**
 * Synthetic "invitado" profile used when the bundle has no Supabase config
 * (web brand preview, unconfigured dev builds). Keeps Tu Códice's identity
 * block rendering so the editorial design demos correctly — falls through
 * to the email-derivation pathway in `tu-codice.tsx` which produces "El
 * códice de · Invitado". iOS production has Supabase so this branch never
 * fires there.
 */
const PREVIEW_PROFILE: ProfileState = {
  id: "preview",
  auth_user_id: "preview",
  name: "Invitado",
  email: "invitado@xico.app",
  interests: [],
  narration_style: "neutral",
  memberType: "invitado",
  memberSince: String(new Date().getFullYear()),
  city: "Madrid",
  country: "ES",
  points: 0,
  streakDays: 0,
};

/**
 * Auth-gated React Query wrapper for the user profile.
 * Mirrors the pattern in useTier.ts (queryKey, enabled, staleTime).
 * Used by Tu Códice (§7.4 pt 5-6) for the editorial identity block.
 */
export function useProfile() {
  const { session } = useAuth();
  return useQuery<ProfileState>({
    queryKey: ["profile", supabaseConfigured ? "live" : "preview"],
    enabled: supabaseConfigured ? !!session : true,
    staleTime: 60_000,
    queryFn: async () => {
      if (!supabaseConfigured) return PREVIEW_PROFILE;
      return fetchJson<ProfileState>("/api/profile");
    },
  });
}
