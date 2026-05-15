import { useMemo } from "react";
import { Rumbos } from "@/constants/colors";
import type { RumboSlug } from "@/constants/rumbos";
import { useTier } from "./useTier";

export interface ColorBleedConfig {
  primaryColor: string;   // Top center, pillar
  tierColor: string;      // Bottom-left, user's tier marker color
  nextRumboColor: string; // Bottom-right, next rumbo to advance
}

/**
 * Maps the user's tier + rumbo progress into a three-color palette used by
 * <ColorBleedBackdrop /> to tint photography behind glass primitives.
 *
 * - primaryColor: caller-provided pillar accent (top-center radial)
 * - tierColor: marker color for the user's current tier (bottom-left)
 * - nextRumboColor: rumbo with the fewest sellos — the one to advance next
 *   (bottom-right). Falls back to norte when tier data isn't loaded yet.
 *
 * `useTier` returns a React Query result whose payload uses snake_case
 * (`by_rumbo`), so we destructure `data` and use the snake_case key directly
 * rather than the camelCase shape the original spec assumed.
 */
export function useColorBleed(pillarColor: string): ColorBleedConfig {
  const { data } = useTier();

  return useMemo(() => {
    const tier = data?.tier;
    const byRumbo = data?.by_rumbo;

    // Tier marker color · cronista=center green, curador=este pink,
    // conocedor=sur cobalt, iniciado (and undefined) → norte black.
    const tierColor =
      tier === "cronista" ? Rumbos.center.hex :
      tier === "curador" ? Rumbos.este.hex :
      tier === "conocedor" ? Rumbos.sur.hex :
      Rumbos.norte.hex;

    // Find the rumbo with the LEAST sellos — that's the next one to advance.
    // Ties broken by RUMBO_ORDER (norte first via array order below).
    const rumbosSorted = (["norte", "sur", "este", "oeste"] as const satisfies readonly RumboSlug[])
      .map(slug => ({ slug, count: byRumbo?.[slug] ?? 0 }))
      .sort((a, b) => a.count - b.count);
    const nextSlug = rumbosSorted[0].slug;
    const nextRumboColor = Rumbos[nextSlug].hex;

    return { primaryColor: pillarColor, tierColor, nextRumboColor };
  }, [data, pillarColor]);
}
