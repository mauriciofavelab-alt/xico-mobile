import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  paragraph: string;
  accent?: string;
  size?: "default" | "large";
};

export function DropCap({ paragraph, accent = Colors.textPrimary, size = "default" }: Props) {
  if (!paragraph) return null;
  const letter = paragraph.charAt(0);
  const rest = paragraph.slice(1);
  const capSize = size === "large" ? TypeSize.monumental + 16 : TypeSize.monumental + 8;
  const capLineHeight = Math.round(capSize * 0.85);

  return (
    <View style={dc.row}>
      <View style={[dc.box, { width: capSize * 0.78, height: capLineHeight }]}>
        <Text
          style={[
            dc.letter,
            { color: accent, fontSize: capSize, lineHeight: capLineHeight },
          ]}
        >
          {letter}
        </Text>
      </View>
      <View style={dc.rest}>
        <Text style={dc.text}>{rest}</Text>
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Space.lg,
    gap: Space.sm,
  },
  box: {
    alignItems: "center",
    justifyContent: "flex-start",
    flexShrink: 0,
    marginTop: 4,
  },
  letter: {
    fontFamily: Fonts.serifSemibold,
    letterSpacing: Tracking.tight,
  },
  rest: { flex: 1, paddingTop: 4 },
  text: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.lede + 2,
    lineHeight: 32,
    color: Colors.textPrimary,
    opacity: 0.95,
    letterSpacing: Tracking.body,
  },
});
