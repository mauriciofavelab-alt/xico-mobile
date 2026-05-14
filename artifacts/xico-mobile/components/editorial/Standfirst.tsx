import React from "react";
import { StyleSheet, Text, TextStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, lh, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  children: React.ReactNode;
  size?: "default" | "large";
  color?: string;
  style?: TextStyle;
};

export function Standfirst({ children, size = "default", color, style }: Props) {
  const fontSize = size === "large" ? TypeSize.subhead : TypeSize.standfirst;
  return (
    <Text
      style={[
        sf.text,
        {
          fontSize,
          lineHeight: lh(fontSize, 1.55),
          color: color ?? Colors.textPrimary,
          opacity: color ? 1 : 0.78,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const sf = StyleSheet.create({
  text: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    letterSpacing: Tracking.tight,
  },
});
