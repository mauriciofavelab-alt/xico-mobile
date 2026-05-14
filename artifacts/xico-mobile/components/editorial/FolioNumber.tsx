import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  number?: string | number;
  total?: string | number;
  date?: string;
  color?: string;
  align?: "left" | "right" | "center";
  style?: ViewStyle;
};

export function FolioNumber({ number, total, date, color = Colors.textTertiary, align = "left", style }: Props) {
  const parts: string[] = [];
  if (number !== undefined && total !== undefined) parts.push(`${pad(number)} / ${pad(total)}`);
  else if (number !== undefined) parts.push(`N.º ${pad(number)}`);
  if (date) parts.push(date);

  return (
    <View style={[fn.row, { justifyContent: alignToFlex(align) }, style]}>
      <View style={[fn.tick, { backgroundColor: color }]} />
      <Text style={[fn.text, { color }]}>{parts.join("  ·  ")}</Text>
      <View style={[fn.tick, { backgroundColor: color }]} />
    </View>
  );
}

function pad(v: string | number): string {
  const s = String(v);
  return s.length === 1 ? `0${s}` : s;
}

function alignToFlex(a: "left" | "right" | "center") {
  if (a === "left") return "flex-start";
  if (a === "right") return "flex-end";
  return "center";
}

const fn = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  tick: { width: 8, height: Hairline.thin },
  text: {
    fontFamily: Fonts.sansMedium,
    // Lifted from TypeSize.small - 1 (9pt, below the iOS HIG 11pt floor) to
    // TypeSize.caption (11). Folio numbers appear in every list row and
    // standfirst — the lift propagates across the whole product.
    fontSize: TypeSize.caption,
    letterSpacing: Tracking.wide,
  },
});
