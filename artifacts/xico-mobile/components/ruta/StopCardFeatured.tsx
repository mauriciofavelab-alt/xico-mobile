import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";
import { GlassChip } from "@/components/liquid-glass";

/**
 * StopCardFeatured · Phase 4 Task 4.4 · spec §7.2 pt 7 (featured variant).
 *
 * Used for odd-indexed stops (1, 3, 5) in the La Ruta listing. Full-bleed
 * photo region (PHOTO SLOT · until per-stop photos land, a rumbo-tinted
 * LinearGradient stands in — same placeholder approach used on /hoy for the
 * article hero). A GlassChip kicker top-left carries the rumbo Nahuatl name
 * in rumbo color; the right edge of the hero gets a small folio "01 / 05"
 * in tracked Inter caps. Below the hero: monumental Fraunces stop name with
 * italic-accented trailing punctuation in rumbo color (mirrors the Stop
 * screen's monumental name). Optional barrio italic line — currently
 * omitted because the API doesn't carry a structured barrio field and
 * splitting addresses is fragile (see Phase 4.4 commit notes).
 *
 * Saturation discipline (brandbook §6): exactly ONE rumbo accent runs
 * through this card — kicker chip text + 3pt left border + italic
 * punctuation + earned-sello pip (when present). Folio, address-pre and
 * card body remain neutral.
 *
 * Hairline > shadow (brandbook §2 + ADR-002): card uses the sanctioned
 * `shadow.elevated` recipe — the same one the Stop screen's Despacho card
 * uses post-Phase 4.2. Featured cards float just enough over the L0 ground.
 */

const NAME_PUNCT_RE = /[.!?…]+$/;
function splitName(name: string): { body: string; punct: string } {
  const match = name.match(NAME_PUNCT_RE);
  if (match) return { body: name.slice(0, -match[0].length), punct: match[0] };
  return { body: name, punct: "." };
}

type Props = {
  /** 1-based position in the Ruta (for the "01 / 05" folio). */
  index: number;
  /** Total stops in this Ruta. */
  total: number;
  /** Stop name (monumental). */
  name: string;
  /** Stop address (kicker line above the name · uppercase tracked caps). */
  address: string;
  /** Rumbo slug · resolves color + Nahuatl label. */
  rumboSlug: RumboSlug | null | undefined;
  /** Rumbo Nahuatl name (e.g. "Tlapallan") — passed in to avoid double-lookup. */
  rumboNahuatl: string | null | undefined;
  /** User has already earned this stop's sello. */
  earnedSello: boolean;
  /** Tap → /ruta/stop/[id]. */
  onPress?: () => void;
};

export function StopCardFeatured({
  index,
  total,
  name,
  address,
  rumboSlug,
  rumboNahuatl,
  earnedSello,
  onPress,
}: Props) {
  const rumbo = rumboSlug ? Rumbos[rumboSlug] : null;
  const accent = rumbo?.hex ?? Colors.textTertiary;
  const accentDim = rumbo?.dim ?? Colors.surfaceHigh;
  const { body: nameBody, punct: namePunct } = splitName(name);
  const folio = `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.root, { borderLeftColor: accent }, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`Parada ${index} de ${total}: ${name}`}
    >
      {/* PHOTO SLOT · rumbo-tinted gradient placeholder until per-stop
          photos are sourced per ADR-003. Goes from rumbo `dim` (deep) →
          L1 surface → rumbo hex hint at the corner — gives the surface
          a directional sense of saturation without faking photography. */}
      <LinearGradient
        colors={[accentDim, Colors.surfaceHigh, `${accent}22`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroPhoto}
      >
        {/* Kicker chip top-left · rumbo Nahuatl in rumbo color */}
        {rumbo && rumboNahuatl ? (
          <View style={s.kickerWrap}>
            <GlassChip tintColor={`${accent}30`} minHeight={26}>
              <View style={[s.kickerDot, { backgroundColor: accent }]} />
              <Text style={[s.kickerText, { color: accent }]}>
                {rumboNahuatl.toUpperCase()}
              </Text>
            </GlassChip>
          </View>
        ) : null}

        {/* Folio top-right · tracked caps Inter (neutral) */}
        <View style={s.folioWrap}>
          <Text style={s.folioText}>{folio}</Text>
        </View>
      </LinearGradient>

      <View style={s.body}>
        <Text style={s.address}>{address.toUpperCase()}</Text>

        <Text style={s.name}>
          {nameBody}
          <Text style={[s.nameAccent, { color: accent }]}>{namePunct}</Text>
        </Text>

        {/* Earned-sello pip · rumbo-colored disc on the right margin.
            Inline (not a separate component) — it's a 4-line View with no
            independent behavior. Caption clarifies the meaning for AT users. */}
        {earnedSello ? (
          <View style={s.selloRow} pointerEvents="none">
            <View style={[s.selloPip, { backgroundColor: accent, borderColor: accent }]} />
            <Text style={s.selloLabel}>SELLO ENTREGADO</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  // Card root · L1 with rumbo 3pt left border + shadow.elevated.
  // Same recipe Phase 4.2 sanctioned for the Stop screen's Despacho card —
  // featured stop cards float just enough to read as "spread headlines."
  root: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: "transparent", // overridden inline by rumbo accent
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    // shadow.elevated · brandbook §2 floating-element recipe (sanctioned
    // exception per ADR-002 for in-flow editorial cards on warm-dark).
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },

  // PHOTO SLOT · 200pt full-bleed region. Once real per-stop photography
  // is sourced, swap the LinearGradient for an <Image> with the same height
  // + overflow:hidden parent. Kicker + folio overlay survive unchanged.
  heroPhoto: {
    height: 200,
    width: "100%",
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  kickerWrap: { flexShrink: 1 },
  kickerDot: { width: 6, height: 6, borderRadius: 3 },
  kickerText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  folioWrap: { paddingTop: 4 },
  folioText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.65)",
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  address: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.65)",
    marginBottom: 8,
  },
  // Monumental stop name · Fraunces 36pt (Fraunces 100 in the spec refers
  // to the optical-size axis · 36pt at fontFamily 500 reads as the same
  // editorial weight on iOS). Italic-accented trailing punctuation in rumbo.
  name: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 36,
    lineHeight: 36 * 1.02,
    letterSpacing: -0.035 * 36,
    color: Colors.textPrimary,
  },
  nameAccent: { fontFamily: "Fraunces_400Regular_Italic" },

  selloRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-end",
  },
  selloPip: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
  },
  selloLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
});
