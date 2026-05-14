import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReducedMotion } from "react-native-reanimated";
import type { Stamp } from "@/hooks/usePassport";
import { Fonts, lh, Space, Tracking, TypeSize } from "@/constants/editorial";

const STAMP_ROMAN: Record<string, string> = {
  "primera-lectura": "I",
  "explorador":      "II",
  "conocedor":       "III",
  "momentos":        "IV",
  "agenda":          "V",
  "ruta":            "VI",
  "guardado":        "VII",
  "madrugador":      "VIII",
  "despacho":        "IX",
};

interface Props {
  stamp: Stamp | null;
  onDismiss: () => void;
}

export function StampNotification({ stamp, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  // ui-ux-pro-max CRITICAL · sello-earn fires every time the user finishes
  // a stop. Vestibular-sensitive users need this to render statically.
  // When reduced-motion is set, jump to the final state without the spring.
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // When Reduce Motion is enabled, skip the spring/fade entirely and snap
    // to the target state — equivalent visual outcome, no vestibular trigger.
    const snap = (yTo: number, opacityTo: number, done?: () => void) => {
      translateY.setValue(yTo);
      opacity.setValue(opacityTo);
      done?.();
    };
    const animateIn = reducedMotion
      ? () => snap(0, 1)
      : () => {
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
            Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
        };
    const animateOut = (done: () => void) =>
      reducedMotion
        ? snap(-120, 0, done)
        : Animated.parallel([
            Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
          ]).start(done);

    if (stamp) {
      animateIn();
      const timer = setTimeout(() => animateOut(() => onDismiss()), 3000);
      return () => clearTimeout(timer);
    } else {
      snap(-120, 0);
    }
  }, [stamp, reducedMotion]);

  if (!stamp) return null;

  const numeral = STAMP_ROMAN[stamp.id] ?? "✦";

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + Space.md, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <Pressable onPress={onDismiss} style={styles.inner}>
        <View style={[styles.topAccent, { backgroundColor: stamp.color }]} />
        <View style={styles.contentRow}>
          <View style={[styles.numeralBox, { borderColor: stamp.color }]}>
            <Text style={[styles.numeral, { color: stamp.color }]}>{numeral}</Text>
          </View>
          <View style={styles.textBlock}>
            <Text style={[styles.kicker, { color: stamp.color }]}>SELLO OBTENIDO</Text>
            <Text style={styles.titulo}>{stamp.titulo}</Text>
            <Text style={styles.desc} numberOfLines={1}>{stamp.descripcion}</Text>
          </View>
          <View style={styles.pts}>
            <Text style={[styles.ptsNum, { color: stamp.color }]}>+{stamp.pts}</Text>
            <Text style={styles.ptsSub}>puntos</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Space.base,
    right: Space.base,
    zIndex: 9999,
  },
  inner: {
    backgroundColor: "#0f0d0f",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  topAccent: {
    height: 3,
    width: "100%",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
    gap: Space.md,
  },
  numeralBox: {
    width: 40,
    height: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  numeral: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.subhead - 2,
    letterSpacing: Tracking.wide,
  },
  textBlock: { flex: 1, gap: 2 },
  kicker: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
  },
  titulo: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.body,
    color: "#fff",
    lineHeight: lh(TypeSize.body, 1.15),
    letterSpacing: Tracking.tight,
  },
  desc: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.caption,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: Tracking.tight,
  },
  pts: { alignItems: "flex-end", gap: 2 },
  ptsNum: {
    fontFamily: Fonts.serifLight,
    fontSize: TypeSize.subhead,
    lineHeight: TypeSize.subhead,
    letterSpacing: Tracking.tight,
  },
  ptsSub: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.micro,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: Tracking.wide,
    textTransform: "uppercase",
  },
});
