import React from "react";
import { StyleSheet, Text, TextProps, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  children: React.ReactNode;
  color?: string;
  withRule?: boolean;
  size?: "small" | "default";
  style?: ViewStyle;
} & Pick<TextProps, "numberOfLines">;

export function Kicker({ children, color = Colors.textPrimary, withRule = false, size = "default", style, numberOfLines }: Props) {
  // ui-ux-pro-max + iOS HIG: editorial kickers were 9pt which falls below the
  // 11pt readability floor when not rendered as the very-fine label variant.
  // Default Kicker now sits at TypeSize.caption (11); "small" variant keeps
  // TypeSize.small (10) — both above the floor while preserving hierarchy.
  const fontSize = size === "small" ? TypeSize.small : TypeSize.caption;
  return (
    <View style={[k.row, style]}>
      {withRule && <View style={[k.rule, { backgroundColor: color }]} />}
      <Text
        numberOfLines={numberOfLines}
        style={[k.label, { color, fontSize, letterSpacing: Tracking.wider }]}
      >
        {String(children).toUpperCase()}
      </Text>
    </View>
  );
}

const k = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  rule: { width: 18, height: Hairline.bold },
  label: { fontFamily: Fonts.sansSemibold },
});
