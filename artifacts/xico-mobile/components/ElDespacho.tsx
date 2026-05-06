import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "@/constants/colors";
import { getDespachoForToday } from "@/constants/despachos";

const TODAY = new Date().toISOString().slice(0, 10);
const STORAGE_KEY = `xico_despacho_${TODAY}`;

export function ElDespacho({ onOpen }: { onOpen?: () => void }) {
  const [opened, setOpened] = useState<boolean | null>(null);

  const sealOpacity = useRef(new Animated.Value(1)).current;
  const sealScale = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(10)).current;

  const despacho = getDespachoForToday();

  const todayLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const todayCaps = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      const isOpen = val === "opened";
      setOpened(isOpen);
      if (isOpen) {
        sealOpacity.setValue(0);
        contentOpacity.setValue(1);
        contentSlide.setValue(0);
      }
    });
  }, []);

  useEffect(() => {
    if (opened !== false) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.05, duration: 2400, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1.0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opened]);

  useEffect(() => {
    if (opened !== true) return;
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [opened]);

  const handleOpen = useCallback(async () => {
    if (opened !== false) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(STORAGE_KEY, "opened");

    Animated.parallel([
      Animated.timing(sealOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(sealScale, { toValue: 0.7, duration: 240, useNativeDriver: true }),
    ]).start(() => {
      setOpened(true);
      onOpen?.();
    });
  }, [opened, onOpen]);

  if (opened === null) return null;

  return (
    <View style={s.card}>
      <View style={[s.topBar, { backgroundColor: despacho.color.hex }]} />

      {/* Header */}
      <View style={s.header}>
        <Text style={[s.eyebrow, { color: despacho.color.hex }]}>El Despacho</Text>
        <Text style={s.fecha}>{todayCaps}</Text>
      </View>

      {/* Subtítulo — always visible */}
      <Text style={s.subtitulo}>{despacho.subtitulo}</Text>

      {/* SEALED */}
      {opened === false && (
        <Pressable
          onPress={handleOpen}
          style={[s.sealWrap, { backgroundColor: `${despacho.color.hex}0D` }]}
        >
          <Animated.View
            style={{
              opacity: sealOpacity,
              transform: [{ scale: sealScale }],
              alignItems: "center",
            }}
          >
            <Animated.View
              style={[
                s.sealRing,
                {
                  borderColor: `${despacho.color.hex}28`,
                  transform: [{ scale: pulseScale }],
                },
              ]}
            />
            <View style={[s.sealCircle, { borderColor: despacho.color.hex }]}>
              <Text style={[s.sealText, { color: despacho.color.hex }]}>XICO</Text>
            </View>
            <Text style={s.tapHint}>Toca para abrir</Text>
          </Animated.View>
        </Pressable>
      )}

      {/* OPENED */}
      {opened === true && (
        <Animated.View
          style={[s.content, {
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          }]}
        >
          {/* Color + pensamiento */}
          <View style={s.colorRow}>
            <View style={[s.colorSwatch, { backgroundColor: despacho.color.hex }]} />
            <Text style={s.colorName}>{despacho.color.nombre.toUpperCase()}</Text>
          </View>

          <Text style={s.pensamiento}>{despacho.pensamiento}</Text>

          {/* Three items — no labels, just editorial fragments */}
          <View style={s.divider} />

          <View style={s.fragmentsBlock}>
            <View style={s.fragment}>
              <Text style={s.fragmentTitle}>
                {despacho.palabra.nahuatl}
                <Text style={s.fragmentSep}> · </Text>
                <Text style={s.fragmentSub}>{despacho.palabra.español}</Text>
              </Text>
              <Text style={s.fragmentNota}>{despacho.palabra.nota}</Text>
            </View>

            <View style={s.fragment}>
              <Text style={s.fragmentTitle}>
                {despacho.lugar.nombre}
                <Text style={s.fragmentSep}> · </Text>
                <Text style={s.fragmentSub}>{despacho.lugar.barrio}</Text>
              </Text>
              <Text style={s.fragmentNota}>{despacho.lugar.nota}</Text>
            </View>

            <View style={[s.fragment, { borderBottomWidth: 0 }]}>
              <Text style={s.fragmentNota}>{despacho.hecho}</Text>
            </View>
          </View>

          {/* Question — the climax */}
          <View style={s.divider} />
          <Text style={s.pregunta}>{despacho.pregunta}</Text>

          {/* Teaser */}
          <Text style={s.teaser}>{despacho.teaser}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  topBar: {
    height: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 2,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 7,
    letterSpacing: 3.5,
    textTransform: "uppercase",
  },
  fecha: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 0.5,
    color: "rgba(255,255,255,0.2)",
    textTransform: "capitalize",
  },
  subtitulo: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 34,
    lineHeight: 38,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 4,
  },

  // SEALED
  sealWrap: {
    alignItems: "center",
    paddingVertical: 48,
  },
  sealRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
  },
  sealCircle: {
    width: 84,
    height: 84,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  sealText: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 14,
    letterSpacing: 6,
  },
  tapHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.18)",
    textTransform: "uppercase",
  },

  // OPENED
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  colorSwatch: {
    width: 28,
    height: 8,
  },
  colorName: {
    fontFamily: "Inter_400Regular",
    fontSize: 6,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.25)",
  },
  pensamiento: {
    fontFamily: "Newsreader_300Light",
    fontSize: 22,
    lineHeight: 31,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginVertical: 20,
  },
  fragmentsBlock: {
    gap: 0,
  },
  fragment: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 5,
  },
  fragmentTitle: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  fragmentSep: {
    color: "rgba(255,255,255,0.25)",
    fontFamily: "Newsreader_300Light",
  },
  fragmentSub: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
  },
  fragmentNota: {
    fontFamily: "Inter_300Light",
    fontSize: 11,
    lineHeight: 17,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.1,
  },
  pregunta: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 28,
    lineHeight: 36,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  teaser: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.18)",
    textTransform: "uppercase",
  },
});
