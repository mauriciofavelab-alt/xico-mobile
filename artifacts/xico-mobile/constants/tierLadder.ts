import { TierKey, TIER_LABELS } from "./rumbos";

/**
 * Alias for spec naming continuity. The canonical type is `TierKey` from
 * `./rumbos`; `TierName` here refers to the same union so existing
 * consumers using `TIER_LABELS[tier]` keep working without churn.
 */
export type TierName = TierKey;

export interface TierDefinition {
  name: TierName;
  iosIconName: string;  // CFBundleAlternateIcons key
  minSellos: number;
  minDistinctRumbos: number;
  minPerRumbo?: number;
  description: string;
}

export const TierLadder: TierDefinition[] = [
  {
    name: "iniciado",
    iosIconName: "AppIcon-Iniciado",
    minSellos: 0,
    minDistinctRumbos: 0,
    description: "El comienzo · 0 a 5 sellos",
  },
  {
    name: "conocedor",
    iosIconName: "AppIcon-Conocedor",
    minSellos: 6,
    minDistinctRumbos: 2,
    description: "Dos rumbos reconocidos · ≥6 sellos",
  },
  {
    name: "curador",
    iosIconName: "AppIcon-Curador",
    minSellos: 16,
    minDistinctRumbos: 3,
    description: "Tres rumbos cubiertos · ≥16 sellos",
  },
  {
    name: "cronista",
    iosIconName: "AppIcon-Cronista",
    minSellos: 36,
    minDistinctRumbos: 4,
    minPerRumbo: 5,
    description: "Los cuatro rumbos · centro Tlalxicco",
  },
];

/**
 * Returns the tier the user currently belongs to given their stats.
 *
 * Param naming intentionally matches the server payload contract used by
 * `useTier` / `useSellos` (snake_case: total, distinct_rumbos, min_per_rumbo).
 * `min_per_rumbo` is optional — only Cronista evaluates it, defaults to 0.
 *
 * Use `TIER_LABELS[computeTier(stats)]` to render the localized display name.
 */
export function computeTier(stats: {
  total: number;
  distinct_rumbos: number;
  min_per_rumbo?: number;
}): TierName {
  const minPer = stats.min_per_rumbo ?? 0;
  for (let i = TierLadder.length - 1; i >= 0; i--) {
    const t = TierLadder[i];
    if (stats.total < t.minSellos) continue;
    if (stats.distinct_rumbos < t.minDistinctRumbos) continue;
    if (t.minPerRumbo && minPer < t.minPerRumbo) continue;
    return t.name;
  }
  return "iniciado";
}

// Re-export TIER_LABELS for ergonomic single-import at call sites.
export { TIER_LABELS };
