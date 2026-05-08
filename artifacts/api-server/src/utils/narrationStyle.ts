export type NarrationStyle = "visual" | "material" | "intellectual" | "kinesthetic" | "conceptual";

const INTEREST_STYLE_MAP: Record<string, NarrationStyle[]> = {
  "Fotografía y Memoria": ["visual"],
  "Arte Mesoamericano": ["visual", "conceptual"],
  "Gastronomía": ["material"],
  "Arte Popular y Artesanía": ["material"],
  "Cine y Literatura": ["intellectual"],
  "Diseño e Identidad": ["intellectual", "conceptual"],
  "Artes Escénicas": ["kinesthetic"],
  "Arte Contemporáneo": ["conceptual"],
};

// Priority order for tie-breaking
const STYLE_PRIORITY: NarrationStyle[] = [
  "intellectual",
  "visual",
  "material",
  "conceptual",
  "kinesthetic",
];

export function computeNarrationStyle(interests: string[]): NarrationStyle {
  const scores: Record<NarrationStyle, number> = {
    visual: 0,
    material: 0,
    intellectual: 0,
    kinesthetic: 0,
    conceptual: 0,
  };

  for (const interest of interests) {
    for (const style of INTEREST_STYLE_MAP[interest] ?? []) {
      scores[style] += 1;
    }
  }

  let dominant: NarrationStyle = "intellectual";
  let max = 0;

  for (const style of STYLE_PRIORITY) {
    if (scores[style] > max) {
      max = scores[style];
      dominant = style;
    }
  }

  return dominant;
}
