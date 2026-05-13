import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";
import type { TierState } from "@/hooks/useTier";

/**
 * useSelloMutation · POST /api/sellos-rumbo
 *
 * Body: { visit_token, stop_id, photo_url? }
 * Returns: { sello, tier (new state), tier_changed, previous_tier }
 *
 * On success, invalidates ["tier"] and ["sellos-rumbo"] so all consumers
 * (rosetón, Mi Lectura, /ruta progress strip) refetch.
 */

export type SelloEarnInput = {
  visit_token: string;
  stop_id: string;
  photo_url?: string;
};

export type SelloEarnResult = {
  ok: boolean;
  sello: {
    id: string;
    ruta_stop_id: string;
    rumbo_id: string;
    earned_at: string;
    photo_url: string | null;
  };
  tier: TierState;
  tier_changed: boolean;
  previous_tier: TierState["tier"];
};

async function postSello(input: SelloEarnInput): Promise<SelloEarnResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

  const res = await fetch(`${API_BASE}/api/sellos-rumbo`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as any;
  if (!res.ok || !data?.ok) {
    const reason = data?.reason ?? data?.error ?? `HTTP ${res.status}`;
    throw new Error(`Sello claim failed: ${reason}`);
  }
  return data as SelloEarnResult;
}

export function useSelloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postSello,
    onSuccess: () => {
      // Force the Roseton + TierStatusBlock + Mi Lectura progress to refetch.
      qc.invalidateQueries({ queryKey: ["tier"] });
      qc.invalidateQueries({ queryKey: ["sellos-rumbo"] });
      qc.invalidateQueries({ queryKey: ["ruta", "current"] });
    },
  });
}
