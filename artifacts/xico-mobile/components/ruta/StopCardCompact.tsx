import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "@/constants/colors";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";

/**
 * StopCardCompact · Phase 4 Task 4.4 · spec §7.2 pt 7 (compact variant).
 *
 * Used for even-indexed stops (2, 4) in the La Ruta listing. A 56pt
 * rumbo-tinted thumbnail on the left (PHOTO SLOT · LinearGradient stand-in
 * until photography lands per ADR-003) + 2-line stop name in Fraunces 500
 * at 18pt + a meta row carrying the rumbo Nahuatl label and the
 * `distance_to_next` walking value. Earned-sello pip on the right margin
 * when the user already has this stop's sello.
 *
 * Same saturation discipline + L1+shadow.elevated treatment as the
 * featured variant, just denser. Featured/compact alternation gives the
 * listing a magazine spread cadence: spread → break → spread → break →
 * spread.
 */

type Props = {
  /** 1-based position in the Ruta (for the "02 / 05" folio). */
  index: number;
  /** Total stops in this Ruta. */
  total: number;
  /** Stop name (2-line clamp at 18pt). */
  name: string;
  /** Rumbo slug · resolves color + label. */
  rumboSlug: RumboSlug | null | undefined;
  /** Rumbo Nahuatl name (e.g. "Mictlampa") — passed in to avoid double-lookup. */
  rumboNahuatl: string | null | undefined;
  /** Walking distance string ("350m") · optional. */
  distanceToNext: string | null | undefined;
  /** User has already earned this stop's sello. */
  earnedSello: boolean;
  /** Tap → /ruta/stop/[id]. */
  onPress?: () => void;
};

export function StopCardCompact({
  index,
  total,
  name,
  rumboSlug,
  rumboNahuatl,
  distanceToNext,
  earnedSello,
  onPress,
}: Props) {
  const rumbo = rumboSlug ? Rumbos[rumboSlug] : null;
  const accent = rumbo?.hex ?? Colors.textTertiary;
  const accentDim = rumbo?.dim ?? Colors.surfaceHigh;

  // Meta line — only join the parts that exist, so we never render "· "
  // dangling separators (manifesto: don't fake).
  const metaParts = [rumboNahuatl, distanceToNext].filter(Boolean) as string[];
  const meta = metaParts.join(" · ");
  const folio = `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.root, { borderLeftColor: accent }, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={`Parada ${index} de ${total}: ${name}`}
    >
      {/* 56pt rumbo-tinted thumb · PHOTO SLOT */}
      <LinearGradient
        colors={[accentDim, Colors.surfaceHigh, `${accent}33`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.thumb}
      />

      <View style={s.body}>
        <Text style={s.folio}>{folio}</Text>
        <Text style={s.name} numberOfLines={2}>
          {name}
        </Text>
        {meta ? (
          <Text style={s.meta} numberOfLines={1}>
            <Text style={[s.metaRumbo, { color: accent }]}>{rumboNahuatl ?? ""}</Text>
            {rumboNahuatl && distanceToNext ? " · " : ""}
            {distanceToNext ?? ""}
          </Text>
        ) : null}
      </View>

      {/* Right-margin pip · only when earned. Inline View · no shadow. */}
      {earnedSello ? (
        <View style={s.selloWrap} pointerEvents="none">
          <View style={[s.selloPip, { backgroundColor: accent, borderColor: accent }]} />
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
    borderRadius: 10,
    paddingVertical: 12,
    paddingRight: 14,
    marginBottom: 16,
    overflow: "hidden",
    // Same sanctioned shadow.elevated recipe as the featured variant —
    // hairline > shadow rule overridden by ADR-002 + Phase 4.2 precedent.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginLeft: 12,
    marginRight: 14,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  folio: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.6)",
  },
  name: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 18,
    lineHeight: 18 * 1.18,
    letterSpacing: -0.02 * 18,
    color: Colors.textPrimary,
  },
  meta: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 0.4,
    color: Colors.textTertiary,
  },
  metaRumbo: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  selloWrap: {
    paddingLeft: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selloPip: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
});
