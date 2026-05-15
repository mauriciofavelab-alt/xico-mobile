import { Platform } from "react-native";
import { supabase } from "@/constants/supabase";

const getApiBase = () => {
  const domain = typeof process !== "undefined" ? process.env.EXPO_PUBLIC_DOMAIN : undefined;
  if (domain) {
    const isLocal = domain.startsWith("localhost") || domain.startsWith("192.168") || domain.startsWith("10.");
    return isLocal ? `http://${domain}` : `https://${domain}`;
  }
  if (Platform.OS === "web") return "http://localhost:8080";
  return "https://xico-api-production.up.railway.app";
};

export const API_BASE = getApiBase();

/**
 * Lifted from 6 inline copies · 2026-05-15 (Agent D · diagnostic-code.md §G-4):
 *
 * Returns a header object containing the bearer Authorization header when an
 * authenticated session exists, or an empty object when the user is anonymous
 * (the api-server's public endpoints accept both shapes; auth-gated endpoints
 * 401 cleanly when the header is missing).
 *
 * Use this in every place that needs to attach auth to a raw fetch call.
 * Routes that go through `fetchJson` (below) already wire this automatically.
 *
 * Previously duplicated in: useVisitToken, useSelloMutation, app/onboarding,
 * app/edit-interests, app/ruta/stop/[id] (latter via double-cast). Lifting
 * here keeps the bearer-attach contract in one place — when Supabase rotates
 * the session model or we add a refresh-on-401 retry, there is exactly one
 * file to touch.
 *
 * Note: `useSelloMutation.ts` was held OUT of this refactor on 2026-05-15
 * because Agent B is concurrently shipping zod validation + retry logic
 * through the same call site. The agent-coordinator will land that change
 * in a follow-up merge once Agent B's branch settles.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...authHeaders, ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` | ${text}` : ""}`);
  }
  return res.json();
}