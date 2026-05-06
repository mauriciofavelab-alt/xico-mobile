import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

export function XicoLoader({ color = Colors.primary }: { color?: string }) {
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
    <View style={s.wrap}>
      <Animated.Text style={[s.logo, { color, opacity: fade, transform: [{ scale }] }]}>
        XICO
      </Animated.Text>
      <Animated.View style={[s.line, { backgroundColor: color, opacity: fade }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
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
