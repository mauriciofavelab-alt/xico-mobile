import { useMemo } from "react";
import { useCurrentRuta } from "@/hooks/useCurrentRuta";
import { useSellos } from "@/hooks/useSellos";
import { RUMBO_ORDER, type RumboSlug } from "@/constants/rumbos";

/**
 * useCurrentRutaProgress · the user's walk-progress for THIS WEEK'S Ruta only.
 *
 * Why this hook exists: the Rosetón v1 originally aggregated lifetime sellos.
 * The 2026-05-14 design-critique audit found that the empty-state psychology
 * ("4 ghost petals + 1 tick = 1/52 done") undermined the manifesto's
 * "emotional residency over engagement." The locked reframe (Option A) is to
 * show the Rosetón AS THIS WEEK'S RUTA — so it's empty before the walk,
 * complete after the walk, and never signals lifetime incompleteness.
 *
 * Returns:
 *   - `rutaStopsByRumbo` · how many stops in this Ruta are tagged to each rumbo
 *   - `earnedByRumbo` · how many of those stops the user has earned this week
 *   - `totalStops` · total stops in this Ruta (5 for inaugural)
 *   - `earnedStops` · stops in this Ruta the user has earned (0..5)
 *   - `isComplete` · earnedStops === totalStops AND totalStops > 0
 *   - `weekLabel` · e.g. "Semana 19" derived from ruta.week_key
 *   - `editorName` · e.g. "María Vázquez"
 *   - `isLoading` · either query still resolving
 *
 * The earned set is filtered by `ruta_stop_id` membership in the current Ruta's
 * stops — a sello earned on stop-001 of a PREVIOUS week's Ruta would NOT count
 * here. (In practice this only matters once we ship a second Ruta; for the
 * inaugural Ruta all earned sellos are this-week sellos.)
 *
 * Consumers should NOT also call useCurrentRuta or useSellos — this hook is
 * the consolidated source for week-mode Rosetón rendering.
 */
export function useCurrentRutaProgress() {
  const rutaQuery = useCurrentRuta();
  const sellosQuery = useSellos();

  const result = useMemo(() => {
    const ruta = rutaQuery.data;
    if (!ruta) {
      return {
        rutaStopsByRumbo: { norte: 0, este: 0, sur: 0, oeste: 0 } as Record<RumboSlug, number>,
        earnedByRumbo: { norte: 0, este: 0, sur: 0, oeste: 0 } as Record<RumboSlug, number>,
        totalStops: 0,
        earnedStops: 0,
        isComplete: false,
        weekLabel: null as string | null,
        editorName: null as string | null,
      };
    }

    // Build a map of stop_id → rumbo slug for THIS Ruta only.
    const stopToRumbo: Record<string, RumboSlug | null> = {};
    const rutaStopsByRumbo: Record<RumboSlug, number> = {
      norte: 0, este: 0, sur: 0, oeste: 0,
    };
    for (const s of ruta.stops) {
      const slug = (s.rumbo?.slug ?? null) as RumboSlug | null;
      stopToRumbo[s.id] = slug;
      if (slug && RUMBO_ORDER.includes(slug)) {
        rutaStopsByRumbo[slug] += 1;
      }
    }

    // Filter the lifetime sellos to this Ruta's stop ids.
    const earnedByRumbo: Record<RumboSlug, number> = {
      norte: 0, este: 0, sur: 0, oeste: 0,
    };
    let earnedStops = 0;
    for (const sello of sellosQuery.data?.sellos ?? []) {
      const slug = stopToRumbo[sello.ruta_stop_id];
      if (slug && RUMBO_ORDER.includes(slug)) {
        earnedByRumbo[slug] += 1;
        earnedStops += 1;
      }
    }

    const totalStops = ruta.stops.length;
    const isComplete = totalStops > 0 && earnedStops >= totalStops;

    // Parse "YYYY-W##" into "Semana ##" for the human label.
    let weekLabel: string | null = null;
    if (ruta.week_key) {
      const match = ruta.week_key.match(/^\d{4}-W(\d{1,2})$/i);
      weekLabel = match ? `Semana ${match[1]}` : ruta.week_key;
    }

    return {
      rutaStopsByRumbo,
      earnedByRumbo,
      totalStops,
      earnedStops,
      isComplete,
      weekLabel,
      editorName: ruta.editor_name ?? null,
    };
  }, [rutaQuery.data, sellosQuery.data?.sellos]);

  return {
    ...result,
    isLoading: rutaQuery.isLoading || sellosQuery.isLoading,
  };
}
