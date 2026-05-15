import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";

interface GlassVibrantProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function GlassVibrant({ children, style }: GlassVibrantProps) {
  const variant = LiquidGlass.vibrant;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variant.backgroundColor, borderColor: variant.borderColor },
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
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowColor: "#000",
  },
  blur: {
    borderRadius: 16,
  },
  content: {
    padding: 18,
  },
});
