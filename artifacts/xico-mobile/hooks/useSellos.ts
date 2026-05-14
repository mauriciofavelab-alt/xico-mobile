import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import type { RumboSlug, TierKey } from "@/constants/rumbos";

/**
 * useSellos · reads the authenticated user's tier + per-rumbo distribution +
 * the full sello list from GET /api/sellos-rumbo.
 *
 * Used by /ruta listing to decorate completed stops with their earned-sello
 * pip, and anywhere else that needs the stop-precision earned-set rather
 * than just the rolled-up tier counts (useTier already covers that).
 *
 * queryKey ["sellos-rumbo"] aligns with the invalidation already wired by
 * useSelloMutation.ts — earning a sello automatically refetches this hook.
 */

export type SelloRecord = {
  id: string;
  ruta_stop_id: string;
  rumbo_id: string;
  earned_at: string;
  photo_url: string | null;
};

export type SellosResponse = {
  tier: TierKey;
  total: number;
  by_rumbo: Record<RumboSlug, number>;
  distinct_rumbos: number;
  min_per_rumbo: number;
  sellos: SelloRecord[];
};

export function useSellos() {
  const { session } = useAuth();
  return useQuery<SellosResponse>({
    queryKey: ["sellos-rumbo"],
    enabled: !!session,
    staleTime: 30_000,
    queryFn: () => fetchJson<SellosResponse>("/api/sellos-rumbo"),
  });
}
