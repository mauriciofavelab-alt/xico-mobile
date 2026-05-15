import { Rumbos } from "./colors";

export type TierName = "iniciado" | "conocedor" | "curador" | "cronista";

export interface TierDefinition {
  name: TierName;
  displayName: string;
  iosIconName: string;  // CFBundleAlternateIcons key
  minSellos: number;
  minDistinctRumbos: number;
  minPerRumbo?: number;
  description: string;
}

export const TierLadder: TierDefinition[] = [
  {
    name: "iniciado",
    displayName: "Iniciado",
    iosIconName: "AppIcon-Iniciado",
    minSellos: 0,
    minDistinctRumbos: 0,
    description: "El comienzo · 0 a 5 sellos",
  },
  {
    name: "conocedor",
    displayName: "Conocedor",
    iosIconName: "AppIcon-Conocedor",
    minSellos: 6,
    minDistinctRumbos: 2,
    description: "Dos rumbos reconocidos · ≥6 sellos",
  },
  {
    name: "curador",
    displayName: "Curador",
    iosIconName: "AppIcon-Curador",
    minSellos: 16,
    minDistinctRumbos: 3,
    description: "Tres rumbos cubiertos · ≥16 sellos",
  },
  {
    name: "cronista",
    displayName: "Cronista",
    iosIconName: "AppIcon-Cronista",
    minSellos: 36,
    minDistinctRumbos: 4,
    minPerRumbo: 5,
    description: "Los cuatro rumbos · centro Tlalxicco",
  },
];

/** Returns the tier the user currently belongs to given their stats. */
export function computeTier(stats: {
  total: number;
  distinctRumbos: number;
  minPerRumbo: number;
}): TierName {
  for (let i = TierLadder.length - 1; i >= 0; i--) {
    const t = TierLadder[i];
    if (stats.total < t.minSellos) continue;
    if (stats.distinctRumbos < t.minDistinctRumbos) continue;
    if (t.minPerRumbo && stats.minPerRumbo < t.minPerRumbo) continue;
    return t.name;
  }
  return "iniciado";
}
