import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";

interface GlassCardProps {
  children: ReactNode;
  /** Optional left accent border color · 3pt wide */
  accentBorder?: string;
  style?: ViewStyle;
}

export function GlassCard({ children, accentBorder, style }: GlassCardProps) {
  const variant = LiquidGlass.regular;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variant.backgroundColor,
          borderColor: variant.borderColor,
        },
        accentBorder ? { borderLeftWidth: 3, borderLeftColor: accentBorder } : null,
        style,
      ]}
    >
      <BlurView intensity={variant.blurAmount} tint="dark" style={[StyleSheet.absoluteFill, styles.blur]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowColor: "#000",
  },
  blur: {
    borderRadius: 14,
  },
  content: {
    padding: 16,
  },
});
