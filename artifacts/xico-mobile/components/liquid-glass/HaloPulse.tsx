import React, { ReactNode, useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface HaloPulseProps {
  children: ReactNode;
  /** Primary halo color (rgba) */
  primaryColor: string;
  /** Secondary halo color (rgba) */
  secondaryColor?: string;
  /** Pulse cycle in ms · default 4000 */
  cycleMs?: number;
  style?: ViewStyle;
}

export function HaloPulse({
  children,
  primaryColor,
  secondaryColor,
  cycleMs = 4000,
  style,
}: HaloPulseProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 0.5;
      return;
    }
    scale.value = withRepeat(
      withTiming(1.08, { duration: cycleMs / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.65, { duration: cycleMs / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reducedMotion, cycleMs, scale, opacity]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
        <LinearGradient
          colors={[primaryColor, secondaryColor ?? "transparent", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 999,
    overflow: "hidden",
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
