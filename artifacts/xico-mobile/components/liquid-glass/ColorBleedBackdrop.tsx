import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorBleed } from "@/hooks/useColorBleed";

interface ColorBleedBackdropProps {
  pillarColor: string;
  style?: ViewStyle;
}

/**
 * Renders three radial-shaped overlays that tint the photo behind based on
 * user state · top-center = pillar, bottom-left = tier, bottom-right = next
 * rumbo to advance.
 *
 * Stack of 3 LinearGradients (since react-native doesn't support radial
 * natively without expo-radial-gradient · linear approximations work for the
 * subtle ambient tint we need here).
 */
export function ColorBleedBackdrop({ pillarColor, style }: ColorBleedBackdropProps) {
  const { primaryColor, tierColor, nextRumboColor } = useColorBleed(pillarColor);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <LinearGradient
        colors={[`${primaryColor}30`, "transparent"]}
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", `${tierColor}20`, "transparent"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.2, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", `${nextRumboColor}1a`]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
