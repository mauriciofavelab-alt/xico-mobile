/**
 * Liquid Glass material variants for XICO.
 *
 * Note on the warm-black palette: `rgba(20, 14, 16, ...)` (#140E10) is the
 * glass-tuned warm-black, intentionally slightly lighter than
 * `Colors.background` (#080508). The lift compensates for translucency so
 * the glass reads as warm-dark rather than muddy when layered over the app
 * background or over photo content. Do not unify these two values.
 */
export const LiquidGlass = {
  /** .ultraThinMaterial — masthead, statusbar overlays. Background remains highly visible. */
  ultraThin: {
    backgroundColor: "rgba(20, 14, 16, 0.18)",
    blurAmount: 40,
    saturation: 1.8,
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.22)",
  },
  /** .thinMaterial — chips overlaying photos. */
  thin: {
    backgroundColor: "rgba(20, 14, 16, 0.35)",
    blurAmount: 20,
    saturation: 1.8,
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.18)",
  },
  /** .regularMaterial — floating tab bar, action sheets. */
  regular: {
    backgroundColor: "rgba(20, 14, 16, 0.55)",
    blurAmount: 40,
    saturation: 2.2,
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.22)",
    dropShadow: { offsetX: 0, offsetY: 8, radius: 24, color: "rgba(0,0,0,0.5)" },
  },
  /** .thickMaterial — full-screen modals, sello ceremony. */
  thick: {
    backgroundColor: "rgba(20, 14, 16, 0.75)",
    blurAmount: 40,
    saturation: 2.2,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.25)",
  },
  /** Glass-vibrant · custom · for Carta del Equipo card · maximum vibrancy. */
  vibrant: {
    backgroundColor: "rgba(20, 14, 16, 0.32)",
    blurAmount: 60,
    saturation: 2.8,
    brightness: 1.1,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.3)",
    dropShadow: { offsetX: 0, offsetY: 12, radius: 32, color: "rgba(0,0,0,0.45)" },
  },
} as const;

export type LiquidGlassVariant = keyof typeof LiquidGlass;

/** Returns `expo-blur` tint for the given variant. iOS only — Android falls back to solid. */
export function blurTintForVariant(_variant: LiquidGlassVariant): "dark" | "default" {
  // All XICO glass uses dark tint over warm-black bg
  return "dark";
}
