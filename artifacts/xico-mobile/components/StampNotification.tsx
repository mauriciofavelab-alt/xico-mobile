import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Stamp } from "@/hooks/usePassport";

interface Props {
  stamp: Stamp | null;
  onDismiss: () => void;
}

export function StampNotification({ stamp, onDismiss }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (stamp) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: -120, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start(() => onDismiss());
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }
  }, [stamp]);

  if (!stamp) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 12, transform: [{ translateY }], opacity },
      ]}
      pointerEvents="box-none"
    >
      <Pressable onPress={onDismiss} style={styles.inner}>
        <View style={[styles.icon, { backgroundColor: stamp.color }]}>
          <Text style={styles.iconText}>✦</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.label}>NUEVO SELLO</Text>
          <Text style={styles.titulo}>{stamp.titulo}</Text>
          <Text style={styles.desc} numberOfLines={1}>{stamp.descripcion}</Text>
        </View>
        <View style={styles.pts}>
          <Text style={[styles.ptsNum, { color: stamp.color }]}>+{stamp.pts}</Text>
          <Text style={styles.ptsSub}>pts</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  inner: {
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 16, color: "#fff" },
  textBlock: { flex: 1, gap: 2 },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.35)",
  },
  titulo: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#fff",
    letterSpacing: 0.3,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
  },
  pts: { alignItems: "center" },
  ptsNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    lineHeight: 20,
  },
  ptsSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  },
});
