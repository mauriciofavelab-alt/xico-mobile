import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";
import { useAuth } from "@/context/AuthContext";

/**
 * Shape returned by GET /api/editor-letters?interest=<label>
 * See api-server/src/routes/editor-letters.ts. `message_template` may contain
 * the literal `{interest}` placeholder which the client substitutes before
 * rendering (per seed.sql comment).
 */
export type EditorLetter = {
  editor_name: string;
  editor_role: string;
  interest_match: string;
  message_template: string;
  accent_color: string;
};

/**
 * Fetches the editor letter matched to the user's primary interest.
 * Used by Tu Códice (§7.4 pt 10) to render the Carta del Equipo card.
 *
 * If the user has no interest selected, or the matching letter 404s, returns
 * `undefined` and the Carta block hides gracefully — the manifesto's
 * "curated not algorithmic" rule means no generic placeholder letter.
 *
 * Auth-gated like useTier / useProfile; the interest argument also gates the
 * fetch so we don't fire a 400 request when the user has no interests yet.
 */
export function useEditorLetter(interest: string | undefined) {
  const { session } = useAuth();
  return useQuery<EditorLetter | undefined>({
    queryKey: ["editor-letter", interest ?? null],
    enabled: !!session && !!interest,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!interest) return undefined;
      try {
        return await fetchJson<EditorLetter>(
          `/api/editor-letters?interest=${encodeURIComponent(interest)}`,
        );
      } catch {
        // 404 (no letter for this interest) is non-fatal — return undefined
        // so the Carta block hides instead of surfacing a broken state.
        return undefined;
      }
    },
  });
}
