import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";

export type FeaturedArticle = {
  id: string;
  slug: string;
  pillar: string | null;
  subcategory: string | null;
  category: string | null;
  tag: string | null;
  title: string;
  subtitle: string | null;
  author_name: string | null;
  institution: string | null;
  image_key: string | null;
  read_time_minutes: number;
  accent_color: string | null;
  readTime: string;
  is_featured: boolean;
  featured: boolean;
  is_published: boolean;
  published_at: string | null;
};

/**
 * Reads the most recent published featured article from GET
 * /api/articles/featured/today. Powers the Hoy screen's editorial Featured
 * card · replaces the hardcoded placeholder so the surface reads as a real
 * publication, not a static CMS slot.
 *
 * When no featured article is published (404), `data` is undefined and the
 * Hoy screen renders no Featured card — manifesto-honest "curated, not
 * algorithmic" empty state.
 */
export function useFeaturedArticle() {
  return useQuery<FeaturedArticle | null>({
    queryKey: ["articles", "featured", "today"],
    staleTime: 60_000 * 60 * 6, // 6 hours · editorial cadence is daily-ish
    retry: false, // 404 means no article today; don't hammer
    queryFn: async () => {
      try {
        return await fetchJson<FeaturedArticle>("/api/articles/featured/today");
      } catch {
        return null;
      }
    },
  });
}
