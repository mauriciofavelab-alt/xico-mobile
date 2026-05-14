import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Hairline, lh, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  children: React.ReactNode;
  attribution?: string;
  accent?: string;
  align?: "left" | "center";
  style?: ViewStyle;
};

export function PullQuote({ children, attribution, accent = Colors.textPrimary, align = "left", style }: Props) {
  return (
    <View style={[pq.wrap, style]}>
      <View style={[pq.markRow, align === "center" && pq.centerRow]}>
        <View style={[pq.mark, { backgroundColor: accent }]} />
      </View>
      <Text style={[pq.quote, align === "center" && { textAlign: "center" }]}>
        {children}
      </Text>
      {attribution && (
        <View style={[pq.attribRow, align === "center" && pq.centerRow]}>
          <View style={[pq.attribRule, { backgroundColor: accent }]} />
          <Text style={[pq.attrib, { color: accent }]}>{attribution.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}

const pq = StyleSheet.create({
  wrap: {
    gap: Space.md,
    marginVertical: Space.xl,
    paddingHorizontal: Space.sm,
  },
  markRow: { flexDirection: "row" },
  centerRow: { justifyContent: "center" },
  mark: { width: 36, height: Hairline.bold },
  quote: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    fontSize: TypeSize.subhead + 2,
    lineHeight: lh(TypeSize.subhead + 2, 1.4),
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  attribRow: { flexDirection: "row", alignItems: "center", gap: Space.sm, marginTop: Space.xs },
  attribRule: { width: 18, height: Hairline.thin },
  attrib: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
  },
});
