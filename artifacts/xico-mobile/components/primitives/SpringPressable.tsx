// SpringPressable · Apple-grade press primitive for XICO · 2026-05-15
//
// Replaces every `<Pressable>` and `<TouchableOpacity>` in the screens. The
// difference vs. RN's defaults: scale-to-0.96 on press-in via Reanimated
// spring physics (damping=14, stiffness=280, mass=0.6), spring back to 1.0
// on press-out, with a sub-perceptual selection haptic at the press-in
// moment. This is the single biggest "feels like a native Apple app" delta
// per the Apple-patterns diagnostic §2.1.
//
// Reduced-motion contract: when `useReducedMotion()` is true, the scale
// animation is skipped (we never run the spring), but the haptic still fires.
// Apple's apps honor Reduce Motion for visuals while keeping haptics on —
// the OS already has a separate "Haptic Touch" setting that expo-haptics
// respects at a lower layer. This matches Apple's behavior.
//
// Web bypass: on web there's no native press-physics that feels right (and
// no haptic at all), so we render a passive Animated.View that just passes
// onPress through. The CSS-based hover/active states the browser provides
// are acceptable for web · iOS is where the polish lives.

import React, { forwardRef } from "react";
import {
  Insets,
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { haptic } from "@/constants/haptics";

export type SpringPressableProps = {
  /** Tap handler · fires on press-out as normal RN Pressable. */
  onPress?: PressableProps["onPress"];
  /** Long-press handler · passthrough to underlying Pressable. */
  onLongPress?: PressableProps["onLongPress"];
  /** Optional press-in callback · fires alongside the spring + haptic. */
  onPressIn?: PressableProps["onPressIn"];
  /** Optional press-out callback. */
  onPressOut?: PressableProps["onPressOut"];

  /** Standard ViewStyle. Can be a static object or an array. */
  style?: StyleProp<ViewStyle>;

  /** Disable the press · no spring, no haptic, no onPress. */
  disabled?: boolean;

  /** Tap target padding (HIG: 44pt minimum touch area). */
  hitSlop?: Insets | number;

  /** Override the default selection-haptic with another haptic flavor.
   *  Use `null` to disable haptic on press-in entirely (rare).
   *  Defaults to `selection` (Apple's "tab tap" sub-perceptual click). */
  haptic?: "selection" | "impactLight" | "impactMedium" | "impactHeavy" | "success" | null;

  /** Accessibility passthrough. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: PressableProps["accessibilityRole"];
  accessibilityState?: PressableProps["accessibilityState"];

  /** Children render below the animated wrapper. */
  children?: React.ReactNode;

  /** Spring config overrides. Defaults to Apple's "card press" feel.
   *  damping=14 · slightly under-damped so the bounce-back has a sub-tle
   *  overshoot (the "received" signal). stiffness=280 · fast settle.
   *  mass=0.6 · light feel matching iOS card presses. */
  springDamping?: number;
  springStiffness?: number;
  springMass?: number;

  /** How far to scale on press-in. Default 0.96 matches Apple News cards. */
  scaleDown?: number;
};

function SpringPressableInner(
  {
    onPress,
    onLongPress,
    onPressIn,
    onPressOut,
    style,
    disabled,
    hitSlop,
    haptic: hapticKind = "selection",
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
    children,
    springDamping = 14,
    springStiffness = 280,
    springMass = 0.6,
    scaleDown = 0.96,
  }: SpringPressableProps,
  ref: React.ForwardedRef<View>,
) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Web bypass · render a plain Pressable wrapped in a static View. CSS
  // hover/active states in the browser are acceptable; Reanimated worklets
  // also don't always cooperate with web layout.
  if (Platform.OS === "web") {
    return (
      <Pressable
        ref={ref as React.Ref<View>}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        style={style}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
      >
        {children}
      </Pressable>
    );
  }

  const handlePressIn: PressableProps["onPressIn"] = (e) => {
    if (disabled) return;
    if (hapticKind) {
      haptic[hapticKind]();
    }
    if (!reducedMotion) {
      scale.value = withSpring(scaleDown, {
        damping: springDamping,
        stiffness: springStiffness,
        mass: springMass,
      });
    }
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps["onPressOut"] = (e) => {
    if (disabled) return;
    if (!reducedMotion) {
      scale.value = withSpring(1, {
        damping: springDamping,
        stiffness: springStiffness,
        mass: springMass,
      });
    }
    onPressOut?.(e);
  };

  return (
    <Animated.View ref={ref as React.Ref<View>} style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export const SpringPressable = forwardRef<View, SpringPressableProps>(SpringPressableInner);
SpringPressable.displayName = "SpringPressable";
