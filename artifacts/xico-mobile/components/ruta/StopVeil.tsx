import React, { useEffect } from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";

/**
 * StopVeil · veiled hero overlay for the Stop screen.
 *
 * State 1 (en camino): veiled — LinearGradient with rumbo accent tint covers
 *   the hero image. Implies "there's something behind this, but you can't
 *   read it from here yet."
 * State 2 (llegada): veil lifts in 600ms cubic-out (brandbook §7.6 editorial
 *   easing). Reduced motion → instant fade.
 *
 * Wraps the hero image content as children; positions the veil as an
 * absolutely-positioned overlay sibling.
 */

type Props = ViewProps & {
  accent: string;
  lifted: boolean;
  height?: number;
};

export function StopVeil({ accent, lifted, height = 280, children, style, ...rest }: Props) {
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = lifted ? 0 : 1;
      return;
    }
    opacity.value = withTiming(lifted ? 0 : 1, {
      duration: 600,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [lifted, opacity, reducedMotion]);

  const veilStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ height, position: "relative", overflow: "hidden" }, style]} {...rest}>
      {children}
      <Animated.View style={[StyleSheet.absoluteFill, veilStyle]} pointerEvents="none">
        {/* Base near-black layer for legibility */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.background, opacity: 0.55 }]} />
        {/* Rumbo accent tint at ≤10% per brandbook §6 — one accent per surface */}
        <LinearGradient
          colors={[`${accent}1A`, "transparent", `${accent}10`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Bottom shadow for text legibility */}
        <LinearGradient
          colors={["transparent", "rgba(8,5,8,0.85)"]}
          start={{ x: 0.5, y: 0.55 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
