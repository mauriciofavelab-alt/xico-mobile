import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";

interface GlassChipProps {
  children: ReactNode;
  /** Optional tint color blended into the glass (rgba). For rumbo-tinted chips. */
  tintColor?: string;
  /** Minimum 44pt height for HIG. Defaults to 44. */
  minHeight?: number;
  style?: ViewStyle;
}

export function GlassChip({ children, tintColor, minHeight = 44, style }: GlassChipProps) {
  const variant = LiquidGlass.thin;
  return (
    <View
      style={[
        styles.container,
        { minHeight, backgroundColor: tintColor ?? variant.backgroundColor, borderColor: variant.borderColor },
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
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  blur: {
    borderRadius: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
