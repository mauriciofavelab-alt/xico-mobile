import { Platform } from "react-native";
import { supabase } from "@/constants/supabase";

const getApiBase = () => {
  const domain = typeof process !== "undefined" ? process.env.EXPO_PUBLIC_DOMAIN : undefined;
  if (domain) {
    const isLocal = domain.startsWith("localhost") || domain.startsWith("192.168") || domain.startsWith("10.");
    return isLocal ? `http://${domain}` : `https://${domain}`;
  }
  if (Platform.OS === "web") return "http://localhost:8080";
  return "http://localhost:8080";
};

export const API_BASE = getApiBase();

async function getAuthHeaders(): Promise<Record<string, string>> {
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