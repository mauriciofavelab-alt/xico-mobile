/**
 * Cuatro Rumbos · Mexica cardinal directions (Codex Fejérváry-Mayer plate 1)
 * rendered through Barragán-derived modern values for warm-dark legibility.
 *
 * Canonical reference: vault/projects/xico/brandbook.md §5
 *
 * Norte=black (Mictlampa), Sur=blue (Huitzlampa), Este=red (Tlapallan),
 * Oeste=white (Cihuatlampa), Centro=green (Tlalxicco, reserved for Cronista).
 *
 * Render notes from brandbook §5:
 *   - Norte's #0E1018 is "the blackest visible petal" — keeps cosmological
 *     meaning while remaining legible on warm-black bg.
 *   - Oeste's #EDE6D8 is Las Arboledas bone — white as Barragán painted it,
 *     not RGB-white (which would feel harsh on warm-dark).
 *   - Center #3F5A3A (Tlalxicco) is accent-only, never a petal — reserved
 *     as Cronista status indicator at the rosetón core.
 */

export type RumboSlug = "norte" | "sur" | "este" | "oeste";

export type RumboDef = {
  slug: RumboSlug | "center";
  mexica: string;
  meaning: string;
  hex: string;
  light: string;
  dim: string;
  /**
   * Glyph id (consumed by `<GlifoMaya id={...} />`) used as the rumbo's
   * stamp imagery when a sello is earned at a stop in this rumbo.
   *
   * Mapped by semantic resonance:
   *   norte (Mictlampa · memoria/antepasados) → `conocedor` (RAÍZ · axis mundi,
   *     tree of ancestors)
   *   sur (Huitzlampa · sol guerrero / fuego celeste) → `momentos` (DESTELLO ·
   *     lightning, captured celestial energy)
   *   este (Tlapallan · amanecer / renovación) → `madrugador` (ALBA · sunrise,
   *     the new day)
   *   oeste (Cihuatlampa · oficio / cosecha / atardecer) → `agenda` (PRESENCIA ·
   *     body present, oficio)
   *   center (Tlalxicco · fuego / tiempo) → `ruta` (PEREGRINO · spiral, the
   *     sacred journey through time)
   *
   * Reuses the existing 8-glyph catalog in `components/GlifoMaya.tsx`; no new
   * artwork required for v1.
   */
  glyphId: "primera-lectura" | "explorador" | "conocedor" | "momentos" | "agenda" | "ruta" | "guardado" | "madrugador";
};

export const Rumbos: Record<RumboSlug | "center", RumboDef> = {
  norte: {
    slug: "norte",
    mexica: "Mictlampa",
    meaning: "memoria · antepasados · norte frío",
    hex: "#0E1018",
    light: "#1A1D2E",
    dim: "#050507",
    glyphId: "conocedor",
  },
  sur: {
    slug: "sur",
    mexica: "Huitzlampa",
    meaning: "Huitzilopochtli · sol · alcance celeste",
    hex: "#234698",
    light: "#3A65C0",
    dim: "#0E1A3D",
    glyphId: "momentos",
  },
  este: {
    slug: "este",
    mexica: "Tlapallan",
    meaning: "Xipe Totec · amanecer · renovación",
    hex: "#D9357B",
    light: "#E66BA0",
    dim: "#5A1535",
    glyphId: "madrugador",
  },
  oeste: {
    slug: "oeste",
    mexica: "Cihuatlampa",
    meaning: "femenino · atardecer · oficio · cosecha",
    hex: "#EDE6D8",
    light: "#F5F0E5",
    dim: "#8B847B",
    glyphId: "agenda",
  },
  center: {
    slug: "center",
    mexica: "Tlalxicco",
    meaning: "Xiuhtecuhtli · fuego · tiempo",
    hex: "#3F5A3A",
    light: "#5A7855",
    dim: "#1A2418",
    glyphId: "ruta",
  },
};

export function getRumboColor(slug: string | null | undefined): string {
  if (!slug) return Rumbos.norte.hex;
  const r = Rumbos[slug.toLowerCase() as RumboSlug | "center"];
  return r ? r.hex : Rumbos.norte.hex;
}

export function getRumboDef(slug: string | null | undefined): RumboDef {
  if (!slug) return Rumbos.norte;
  const r = Rumbos[slug.toLowerCase() as RumboSlug | "center"];
  return r ?? Rumbos.norte;
}

export const RUMBO_ORDER: RumboSlug[] = ["norte", "este", "sur", "oeste"];

export const TIER_LABELS = {
  iniciado: "Iniciado",
  conocedor: "Conocedor",
  curador: "Curador",
  cronista: "Cronista",
} as const;

export type TierKey = keyof typeof TIER_LABELS;
