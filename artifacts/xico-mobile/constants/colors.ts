// XICO — Paleta de color 2026
// Inspirada en Luis Barragán (Casa Gilardi, 1976) y los interiores de la Casa Azul (Coyoacán)
// NO el azul cobalto de la fachada — los interiores que nadie usa

export const Colors = {
  // BASE · brandbook §1 + §7.1 aligned
  background: "#080508",      // Warm black, slight magenta tint. NEVER pure black.
  surface: "#13101A",         // L1 — primary elevated (cards, sidebar, despacho header)
  surfaceHigh: "#1C1822",     // L2 — secondary elevated (nested cards, hover)
  surfaceHigher: "#26212C",   // L3 — overlay (modals, bottom sheets, banners)

  border: "#1E1610",          // Default border (matches surface warmth)
  borderLight: "rgba(240,236,230,0.06)",  // Hairline card separator
  borderMedium: "rgba(240,236,230,0.10)", // Stronger divider
  borderStrong: "rgba(240,236,230,0.18)", // Active state, focus ring

  // COLOR PRIMARIO — Magenta Barragán
  // Referencia: muro de la Casa Gilardi (1976), piscina magenta
  primary: "#9c1a47",
  primaryLight: "#c44a78",
  primaryDim: "#3d0a1c",
  magenta: "#9c1a47",

  // OCRE — Casa Azul interior
  // Referencia: cocina amarilla de Coyoacán, el color del maíz y del mezcal
  ochre: "#b8820a",
  ochreLight: "#d4a030",
  ochreDim: "#3a2803",

  // COBALTO — Interior profundo
  // Referencia: azul de los interiores de la Casa Azul — profundo, no el cobalto turístico
  cobalt: "#1a3d8a",
  cobaltLight: "#2a5daa",
  cobaltDim: "#0a1a3d",

  // TERRACOTA — Tezontle Barragán
  // Referencia: pisos de tezontle volcánico en Las Arboledas y Casa Barragán
  terracota: "#8b3a1a",
  terracotaLight: "#b45a30",
  terracotaDim: "#2a0f06",

  // VERDE JARDÍN — Casa Azul
  // Referencia: jardín de Coyoacán — cactus, bougainvillea, selva densa
  verde: "#1a4a1a",
  verdeLight: "#2a6a2a",
  verdeDim: "#0a1e0a",

  // ASIGNACIÓN POR PILAR (semántica, no decorativa)
  // Cada sección de XICO tiene UN color. No se mezclan.
  pillarIndice: "#9c1a47",      // Magenta — portada, identidad central
  pillarCultura: "#1a3d8a",     // Cobalto — exposiciones, artes visuales, cine, literatura
  pillarMexicoAhora: "#b8820a", // Ocre — gastronomía, mezcal, actualidad
  pillarTradicion: "#8b3a1a",   // Terracota — artes escénicas, Día de Muertos, música
  pillarArchivo: "#1a4a1a",     // Verde — perfil, pasaporte, colección personal

  // SUBCATEGORÍAS dentro de Cultura
  gastronomia: "#b8820a",
  artesVisuales: "#1a3d8a",
  artesEscenicas: "#8b3a1a",
  fotografia: "#1a3d8a",
  cine: "#1a3d8a",
  literatura: "#1a4a1a",
  moda: "#8b3a1a",
  historias: "#1a3d8a",
  artePopular: "#8b3a1a",

  // TIPOGRAFÍA · brandbook §3 · discrete values (not alpha) so contrast holds
  // when text crosses elevated surfaces.
  textPrimary: "#F0ECE6",        // Warm bone white · 17.5:1 vs bg · AAA
  textSecondary: "#C9C3B8",      // Captions, dek, byline, standfirst · 12:1 · AAA
  textTertiary: "#8C887F",       // Timestamps, metadata, kicker · 6:1 · AA body
  textQuaternary: "#5A574F",     // Disabled, watermarks, hairlines · 3.2:1 · AA large

  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
};

// Aggregate pillar palette — shorter keys for ergonomic downstream imports.
// Mirrors Colors.pillar* properties; additive, does not replace them.
export const Pillars = {
  indice: Colors.pillarIndice,
  cultura: Colors.pillarCultura,
  mexicoAhora: Colors.pillarMexicoAhora,
  tradicion: Colors.pillarTradicion,
  archivo: Colors.pillarArchivo,
} as const;
export type PillarKey = keyof typeof Pillars;

const colors = {
  light: {
    text: Colors.textPrimary,
    tint: Colors.primary,
    background: Colors.background,
    foreground: Colors.textPrimary,
    card: Colors.surface,
    cardForeground: Colors.textPrimary,
    primary: Colors.primary,
    primaryForeground: Colors.white,
    secondary: Colors.surfaceHigh,
    secondaryForeground: Colors.textSecondary,
    muted: Colors.surfaceHigh,
    mutedForeground: Colors.textTertiary,
    accent: Colors.primaryDim,
    accentForeground: Colors.primary,
    destructive: "#ef4444",
    destructiveForeground: Colors.white,
    border: Colors.border,
    input: Colors.border,
  },
  radius: 4,
};

export default colors;

// Devuelve el color de acento según pilar o subcategoría
export function getAccentColor(name: string): string {
  switch (name?.toLowerCase().replace(/[- ]/g, "")) {
    // Pilares principales
    case "indice":
    case "portada":
    case "magenta":
    case "primary":
      return Colors.pillarIndice;
    case "cultura":
      return Colors.pillarCultura;
    case "mexicoahora":
    case "méxicoahora":
      return Colors.pillarMexicoAhora;
    case "tradicion":
    case "tradición":
      return Colors.pillarTradicion;
    case "archivo":
    case "mixico":
    case "mixico":
      return Colors.pillarArchivo;

    // Subcategorías
    case "gastronomia":
    case "gastronomía":
    case "mezcal":
    case "destilados":
      return Colors.gastronomia;
    case "artesvisuales":
    case "fotografia":
    case "fotografía":
    case "cine":
    case "literatura":
    case "historias":
      return Colors.artesVisuales;
    case "artesescenicas":
    case "artesescénicas":
    case "musica":
    case "música":
    case "moda":
    case "artepopular":
      return Colors.artesEscenicas;

    default:
      return Colors.primary;
  }
}

// Re-export rumbo helpers for ergonomic access alongside getAccentColor.
// Rumbos are the gamification taxonomy (Mexica cardinal directions); pillars
// are the editorial taxonomy. They are SEPARATE — never mix.
export { Rumbos, getRumboColor, getRumboDef, RUMBO_ORDER, TIER_LABELS } from "./rumbos";
export type { RumboSlug, RumboDef, TierKey } from "./rumbos";

// Devuelve la versión dim/oscura del color de acento
export function getAccentDim(name: string): string {
  switch (name?.toLowerCase().replace(/[- ]/g, "")) {
    case "indice":
    case "portada":
    case "magenta":
    case "primary":
      return Colors.primaryDim;
    case "cultura":
    case "artesvisuales":
    case "fotografia":
    case "fotografía":
    case "cine":
    case "literatura":
      return Colors.cobaltDim;
    case "mexicoahora":
    case "gastronomia":
    case "mezcal":
      return Colors.ochreDim;
    case "tradicion":
    case "artesescenicas":
    case "artepopular":
      return Colors.terracotaDim;
    case "archivo":
      return Colors.verdeDim;
    default:
      return Colors.primaryDim;
  }
}