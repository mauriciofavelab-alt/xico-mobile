import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";
import { FolioNumber, Kicker } from "@/components/editorial";

/**
 * StopCard · vertical card for the Ruta index list.
 *
 * Layout: FolioNumber (top row) + name (Newsreader display) + address (sans
 * caps) + 1-line tease (truncated despacho_text). Left-edge rumbo accent stripe
 * (2px hairline). When `earned=true`, shows a small rumbo-colored sello pip in
 * the right margin — the "completed" marker.
 *
 * Saturation discipline (brandbook §6): only ONE saturated accent per card —
 * the rumbo. Address + tease + folio are all neutral.
 */

type Props = {
  index: number;
  total: number;
  name: string;
  address: string;
  tease: string;
  rumboSlug: RumboSlug | null | undefined;
  earned?: boolean;
  onPress?: () => void;
};

const TEASE_MAX = 80;

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

export function StopCard({ index, total, name, address, tease, rumboSlug, earned, onPress }: Props) {
  const rumbo = rumboSlug ? Rumbos[rumboSlug] : null;
  const accent = rumbo?.hex ?? Colors.textTertiary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.root,
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Parada ${index}: ${name} en ${address}`}
    >
      {/* Left accent stripe · the one saturated hit per card */}
      <View style={[s.stripe, { backgroundColor: accent }]} pointerEvents="none" />

      <View style={s.body}>
        <View style={s.header}>
          <FolioNumber number={index} total={total} align="left" color={Colors.textTertiary} />
          {rumbo ? (
            <Kicker color={accent}>{rumbo.mexica}</Kicker>
          ) : null}
        </View>

        <Text style={s.name}>{name}</Text>
        <Text style={s.address}>{address}</Text>
        <Text style={s.tease}>{truncate(tease ?? "", TEASE_MAX)}</Text>
      </View>

      {earned ? (
        <View style={s.selloWrap} pointerEvents="none">
          <View style={[s.selloPip, { backgroundColor: accent, borderColor: accent }]} />
          <Text style={s.selloLabel}>SELLO</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    paddingVertical: Space.lg,
    paddingHorizontal: Space.lg,
    borderBottomWidth: Hairline.thin,
    borderBottomColor: Colors.borderLight,
  },
  stripe: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  body: { flex: 1, gap: Space.xs },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Space.md,
    marginBottom: Space.sm,
  },
  name: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.subhead,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
    lineHeight: TypeSize.subhead * 1.15,
  },
  address: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.caption,
    color: Colors.textTertiary,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
    marginTop: Space.xs,
  },
  tease: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body - 1,
    color: Colors.textSecondary,
    lineHeight: (TypeSize.body - 1) * 1.5,
    marginTop: Space.sm,
  },
  selloWrap: {
    alignItems: "center",
    justifyContent: "flex-start",
    paddingLeft: Space.md,
    gap: Space.xs,
  },
  selloPip: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  selloLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
  },
});
