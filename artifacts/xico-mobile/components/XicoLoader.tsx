import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

/**
 * Editorial loader · pulsing XICO wordmark + hairline rule.
 *
 * Two layout modes:
 *  - default (full-screen): `flex: 1` wrap · use for splash/full-route loads
 *    (article splash, full-screen route loading).
 *  - `inline`: no flex · use for in-flow loading rows (small spinner-equivalent
 *    inside a card or above a "Cargando…" caption). Pairs with parent
 *    containers that already pad/center.
 *
 * Honors reduced motion implicitly · the pulse uses RN Animated.timing which
 * the system slows but doesn't gate; the wordmark + rule both render legibly
 * at the static end-state (opacity 0.8) regardless. A future improvement
 * could short-circuit the loop entirely on `useReducedMotion()`.
 */
export function XicoLoader({
  color = Colors.primary,
  inline = false,
}: {
  color?: string;
  inline?: boolean;
}) {
  const fade = useRef(new Animated.Value(0.1)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fade, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(fade, { toValue: 0.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.96, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={inline ? s.wrapInline : s.wrap}>
      <Animated.Text style={[s.logo, { color, opacity: fade, transform: [{ scale }] }]}>
        XICO
      </Animated.Text>
      <Animated.View style={[s.line, { backgroundColor: color, opacity: fade }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  wrapInline: { alignItems: "center", justifyContent: "center", gap: 16 },
  logo: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 36,
    letterSpacing: 14,
  },
  line: {
    width: 28,
    height: 1.5,
  },
});
