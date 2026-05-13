import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";
import type { RumboSlug, TierKey } from "@/constants/rumbos";

export type TierState = {
  tier: TierKey;
  total: number;
  by_rumbo: Record<RumboSlug, number>;
  distinct_rumbos: number;
  min_per_rumbo: number;
  eligible_perks: Array<{
    id: string;
    partner_type: "restaurant_sello_copil" | "museum" | "gallery" | "bookstore";
    name: string;
    redemption_method: "manual_show_id" | "voucher_code" | "partner_api";
    min_tier_required: TierKey;
    accent_color: string | null;
    notes: string | null;
  }>;
};

/**
 * Reads the user's computed tier from GET /api/profile/tier.
 * Tier is computed on the server from sellos_rumbo rows; we never cache it
 * client-side beyond React Query's staleTime. After a sello earn the
 * mutation should invalidateQueries(["tier"]) to force a refetch.
 */
export function useTier() {
  const { session } = useAuth();
  return useQuery<TierState>({
    queryKey: ["tier"],
    enabled: !!session,
    staleTime: 30_000,
    queryFn: () => fetchJson<TierState>("/api/profile/tier"),
  });
}
