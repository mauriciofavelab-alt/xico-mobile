import React from "react";
import { View, ViewStyle } from "react-native";
import Animated, { Easing, FadeInUp, useReducedMotion } from "react-native-reanimated";

type Props = {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  step?: number;
  distance?: number;
  duration?: number;
  style?: ViewStyle;
};

export function RevealOnMount({
  children,
  index = 0,
  delay = 0,
  step = 60,
  distance = 14,
  duration = 480,
  style,
}: Props) {
  // ui-ux-pro-max CRITICAL · RevealOnMount wraps nearly every block on the
  // Índice screen. Without a reduced-motion gate, vestibular-impaired users
  // get a 480ms fade-up on every section every time they load the home tab.
  // When set, render the children inline with no animation.
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return <View style={style}>{children}</View>;
  }

  const total = delay + index * step;
  return (
    <Animated.View
      style={style}
      entering={FadeInUp.duration(duration)
        .delay(total)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ transform: [{ translateY: distance }], opacity: 0 })}
    >
      {children}
    </Animated.View>
  );
}
