import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";
import { Shadow } from "@/constants/shadows";

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
    // Apple-grade in-flow card lift · per Apple-patterns diagnostic §1.1.
    // 6pt y-offset, 18pt halo, 18% opacity. Reads as the Apple News "Today"
    // card suspension — quiet lift, never chunky drop. Token sourced from
    // constants/shadows.ts so future surfaces stay consistent.
    ...Shadow.cardLift,
  },
  blur: {
    borderRadius: 14,
  },
  content: {
    padding: 16,
  },
});
