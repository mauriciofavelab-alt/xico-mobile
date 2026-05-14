import { useMemo } from "react";
import { useTimeModeCtx } from "@/context/TimeModeContext";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/editorial";
import type { TimeMode } from "@/hooks/useTimeMode";

/**
 * useTypographyMode · adjusts typography + atmosphere by current time mode.
 *
 * Manifesto promise: the user opening at 1am must feel something different —
 * "calmer, quieter, more sustained" — than the same user opening at 5pm.
 *
 * Returns the live time mode + token overrides ready to spread into styles:
 *   - madrugada · Newsreader 300 Light, secondary-as-primary contrast (lower),
 *                 grain opacity bumped slightly, accent saturation dropped
 *   - atardecer · default weights, but adds an atmospheric warm overlay color
 *                 the consumer can paint over hero surfaces (Cihuatlampa light)
 *   - dia       · the baseline · no override
 *
 * All values are tokens — never hardcoded. Consumers spread into existing
 * StyleSheet objects: `style={[base, mode.bodyOverride]}`.
 */

type Overrides = {
  mode: TimeMode;
  bodyFontFamily: string;
  bodyColor: string;
  headingFontFamily: string;
  accentOpacity: number;
  /** Optional overlay color the consumer paints over hero images / heads.
   *  null means: do not paint. */
  atmosphereOverlay: string | null;
  /** TTS should auto-play at this hour? */
  ttsAutoPlay: boolean;
  /** Grain overlay opacity (brandbook §7.6) */
  grainOpacity: number;
};

export function useTypographyMode(): Overrides {
  const mode = useTimeModeCtx();

  return useMemo<Overrides>(() => {
    if (mode === "madrugada") {
      return {
        mode,
        bodyFontFamily: Fonts.serifLight,
        bodyColor: Colors.textSecondary,
        headingFontFamily: Fonts.serifRegular,
        accentOpacity: 0.65,
        atmosphereOverlay: null,
        ttsAutoPlay: false,
        grainOpacity: 0.045,
      };
    }
    if (mode === "atardecer") {
      return {
        mode,
        bodyFontFamily: Fonts.serifRegular,
        bodyColor: Colors.textPrimary,
        headingFontFamily: Fonts.serifMedium,
        accentOpacity: 1,
        // Cihuatlampa (Oeste) bone at 8% alpha — warm hour-gold overlay
        atmosphereOverlay: "rgba(237,230,216,0.08)",
        ttsAutoPlay: true,
        grainOpacity: 0.035,
      };
    }
    // dia — baseline
    return {
      mode,
      bodyFontFamily: Fonts.serifRegular,
      bodyColor: Colors.textPrimary,
      headingFontFamily: Fonts.serifMedium,
      accentOpacity: 1,
      atmosphereOverlay: null,
      ttsAutoPlay: true,
      grainOpacity: 0.03,
    };
  }, [mode]);
}
