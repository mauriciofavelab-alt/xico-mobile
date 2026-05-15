import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlass } from "@/constants/liquidGlass";
import { Colors } from "@/constants/colors";
import { TypeSize, Tracking, Fonts } from "@/constants/editorial";

interface GlassMastheadProps {
  /** Caps label, left side (e.g. "XICO · HOY") */
  label: string;
  /** Caps label, right side (e.g. "VIERNES 15 MAY") */
  meta?: string;
  /** Show a pulsing colored dot before the label (today's despacho accent color hex) */
  liveDotColor?: string;
}

export function GlassMasthead({ label, meta, liveDotColor }: GlassMastheadProps) {
  const insets = useSafeAreaInsets();
  // Spec §18.3 · top: 81pt from top to clear Dynamic Island (59pt status + 22pt DI clearance)
  const topOffset = Math.max(insets.top + 22, 81);

  return (
    <View
      style={[
        styles.container,
        { top: topOffset, marginHorizontal: 16 },
      ]}
      accessibilityRole="header"
      accessibilityLabel={`${label}${meta ? ` · ${meta}` : ""}`}
    >
      <BlurView
        intensity={LiquidGlass.ultraThin.blurAmount}
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      <View style={styles.contentRow}>
        <View style={styles.leftRow}>
          {liveDotColor && (
            <View style={[styles.dot, { backgroundColor: liveDotColor, shadowColor: liveDotColor }]} />
          )}
          <Text style={styles.labelText}>{label}</Text>
        </View>
        {meta && <Text style={styles.metaText}>{meta}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 38,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LiquidGlass.ultraThin.borderColor,
    backgroundColor: LiquidGlass.ultraThin.backgroundColor,
    zIndex: 3,
  },
  blur: {
    borderRadius: 14,
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  labelText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.caption - 1,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.textPrimary,
  },
  metaText: {
    fontFamily: Fonts.sansRegular,
    fontSize: TypeSize.caption - 1,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: Colors.textSecondary,
  },
});
