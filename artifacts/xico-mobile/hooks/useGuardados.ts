import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";

/**
 * Shape returned by GET /api/saved (article rows from the articles table).
 * Stays loose because the only thing Tu Códice cares about for v1.1 is the
 * array length for the stats row; downstream archive lists (v1.2) will
 * narrow the type.
 */
export type SavedArticle = {
  id: string;
  pillar: string;
  title?: string;
  subtitle?: string;
  hero_image_url?: string | null;
  [key: string]: unknown;
};

/**
 * Auth-gated React Query wrapper for the user's saved articles list.
 * Mirrors the pattern in useTier.ts (queryKey, enabled, staleTime).
 * Used by Tu Códice (§7.4 pt 9) for the "guardados" stat in the stats row.
 *
 * Server returns `[]` when the user has no profile or no saved articles, so
 * the consumer can safely read `data?.length ?? 0`.
 */
export function useGuardados() {
  const { session } = useAuth();
  return useQuery<SavedArticle[]>({
    queryKey: ["guardados"],
    enabled: !!session,
    staleTime: 60_000,
    queryFn: () => fetchJson<SavedArticle[]>("/api/saved"),
  });
}
