import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, lh, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  text?: string;
  credit?: string;
  align?: "left" | "right";
  style?: ViewStyle;
};

export function Caption({ text, credit, align = "left", style }: Props) {
  if (!text && !credit) return null;
  return (
    <View style={[c.container, align === "right" && c.right, style]}>
      {text && <Text style={c.text}>{text}</Text>}
      {credit && <Text style={c.credit}>{credit.toUpperCase()}</Text>}
    </View>
  );
}

const c = StyleSheet.create({
  container: {
    gap: Space.xs,
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
  },
  right: { alignItems: "flex-end" },
  text: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    lineHeight: lh(TypeSize.meta, 1.5),
    color: Colors.textSecondary,
    letterSpacing: Tracking.tight,
  },
  credit: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
  },
});
