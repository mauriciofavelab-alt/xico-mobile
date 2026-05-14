import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  title?: string;
  volume?: string | number;
  issue?: string | number;
  date?: string;
  location?: string;
  status?: string;
  accent?: string;
  style?: ViewStyle;
};

export function Masthead({
  title = "XICO",
  volume,
  issue,
  date,
  location,
  status,
  accent = Colors.textPrimary,
  style,
}: Props) {
  const upper: string[] = [];
  if (status) upper.push(status);
  if (location) upper.push(location);
  if (date) upper.push(date);

  const lower: string[] = [];
  if (volume !== undefined) lower.push(`Vol. ${pad(volume)}`);
  if (issue !== undefined) lower.push(`N.º ${pad(issue)}`);

  return (
    <View style={[m.container, style]}>
      <View style={m.row}>
        <Text style={[m.upperText, { color: accent }]}>{upper.join("  ·  ")}</Text>
        <View style={[m.flexRule, { backgroundColor: accent }]} />
      </View>
      <Text style={m.title}>{title.toUpperCase()}</Text>
      {lower.length > 0 && (
        <View style={m.row}>
          <View style={[m.flexRule, { backgroundColor: Colors.textTertiary }]} />
          <Text style={m.lowerText}>{lower.join("  ·  ")}</Text>
        </View>
      )}
    </View>
  );
}

function pad(v: string | number): string {
  const s = String(v);
  return s.length === 1 ? `0${s}` : s;
}

const m = StyleSheet.create({
  container: { gap: Space.sm, paddingVertical: Space.md },
  row: { flexDirection: "row", alignItems: "center", gap: Space.md },
  flexRule: { flex: 1, height: Hairline.thin, opacity: 0.5 },
  upperText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro + 1,
    letterSpacing: Tracking.widest,
  },
  title: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.hero,
    lineHeight: TypeSize.hero,
    color: Colors.textPrimary,
    letterSpacing: Tracking.wide,
    marginVertical: Space.xs,
  },
  lowerText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.caption,
    color: Colors.textTertiary,
    letterSpacing: Tracking.tight,
  },
});
