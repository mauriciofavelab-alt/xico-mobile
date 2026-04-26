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
  const contentSlide = useRef(new Animated.Value(12)).current;

  const despacho = getDespachoForToday();

  const todayLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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

  // Pulse when sealed
  useEffect(() => {
    if (opened !== false) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.06, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1.0, duration: 2200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opened]);

  // Animate content in after opened flips to true
  useEffect(() => {
    if (opened !== true) return;
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [opened]);

  const handleOpen = useCallback(async () => {
    if (opened !== false) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(STORAGE_KEY, "opened");

    Animated.parallel([
      Animated.timing(sealOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(sealScale, { toValue: 0.72, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setOpened(true);
      onOpen?.();
    });
  }, [opened, onOpen]);

  if (opened === null) return null;

  return (
    <View style={s.card}>
      {/* Color accent bar */}
      <View style={[s.colorBar, { backgroundColor: despacho.color.hex }]} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={[s.dot, { backgroundColor: despacho.color.hex }]} />
          <Text style={s.eyebrow}>El Despacho del Día</Text>
        </View>
        <Text style={[s.numero, { color: despacho.color.hex }]}>Nº {despacho.numero}</Text>
      </View>

      {/* Subtitulo always visible */}
      <View style={s.introWrap}>
        <Text style={s.subtitulo}>{despacho.subtitulo}</Text>
        <Text style={s.fecha}>{todayCaps}</Text>
      </View>

      {/* SEALED STATE */}
      {opened === false && (
        <Pressable onPress={handleOpen} style={s.sealArea}>
          <Animated.View
            style={[
              s.sealRing,
              {
                borderColor: despacho.color.hex,
                opacity: sealOpacity,
                transform: [{ scale: sealScale }, { scale: pulseScale }],
              },
            ]}
          >
            <View style={[s.sealInner, { borderColor: despacho.color.hex + "44" }]}>
              <Text style={[s.sealLogo, { color: despacho.color.hex }]}>XICO</Text>
              <View style={[s.sealRule, { backgroundColor: despacho.color.hex + "66" }]} />
              <Text style={s.sealColorName}>{despacho.color.nombre.toUpperCase()}</Text>
            </View>
          </Animated.View>
          <Animated.Text style={[s.tapHint, { opacity: sealOpacity }]}>
            Toca para abrir
          </Animated.Text>
        </Pressable>
      )}

      {/* OPENED STATE */}
      {opened === true && (
        <Animated.View
          style={[s.content, { opacity: contentOpacity, transform: [{ translateY: contentSlide }] }]}
        >
          {/* Color swatch row */}
          <View style={s.swatchRow}>
            <View style={[s.swatch, { backgroundColor: despacho.color.hex }]} />
            <Text style={s.swatchLabel}>{despacho.color.nombre.toUpperCase()}</Text>
          </View>

          {/* Pensamiento */}
          <Text style={s.pensamiento}>{despacho.pensamiento}</Text>

          <View style={s.rule} />

          {/* Pistas */}
          <PistaRow label="PALABRA" colorHex={despacho.color.hex}>
            <Text style={s.pistaTitle}>{despacho.palabra.nahuatl}</Text>
            <Text style={s.pistaEsp}>"{despacho.palabra.español}"</Text>
            <Text style={s.pistaNota}>{despacho.palabra.nota}</Text>
          </PistaRow>

          <PistaRow label="LUGAR" colorHex={despacho.color.hex}>
            <Text style={s.pistaTitle}>{despacho.lugar.nombre}</Text>
            <Text style={s.pistaEsp}>{despacho.lugar.barrio}</Text>
            <Text style={s.pistaNota}>{despacho.lugar.nota}</Text>
          </PistaRow>

          <PistaRow label="HECHO" colorHex={despacho.color.hex}>
            <Text style={s.pistaNota}>{despacho.hecho}</Text>
          </PistaRow>

          <View style={s.rule} />

          {/* Pregunta */}
          <Text style={s.pregunta}>{despacho.pregunta}</Text>

          <View style={s.rule} />

          {/* Teaser */}
          <Text style={s.teaser}>{despacho.teaser}</Text>

          {/* Footer */}
          <View style={s.footerRow}>
            <View style={[s.footerDot, { backgroundColor: despacho.color.hex }]} />
            <Text style={s.footerText}>Despacho abierto · {todayCaps}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function PistaRow({
  label,
  colorHex,
  children,
}: {
  label: string;
  colorHex: string;
  children: React.ReactNode;
}) {
  return (
    <View style={p.row}>
      <Text style={[p.key, { color: colorHex }]}>{label}</Text>
      <View style={p.body}>{children}</View>
    </View>
  );
}

const p = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  key: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 7,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    width: 52,
    paddingTop: 3,
    flexShrink: 0,
  },
  body: { flex: 1, gap: 3 },
});

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  colorBar: {
    height: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 5,
    height: 5,
  },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 7,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
  },
  numero: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2,
  },
  introWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 4,
    gap: 6,
  },
  subtitulo: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 28,
    lineHeight: 32,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  fecha: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.22)",
    textTransform: "uppercase",
  },

  // --- SEALED ---
  sealArea: {
    alignItems: "center",
    paddingVertical: 36,
    gap: 16,
  },
  sealRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  sealInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sealLogo: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 14,
    letterSpacing: 6,
  },
  sealRule: {
    width: 24,
    height: 1,
  },
  sealColorName: {
    fontFamily: "Inter_400Regular",
    fontSize: 5,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.3)",
  },
  tapHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase",
  },

  // --- OPENED ---
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 20,
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  swatch: {
    width: 32,
    height: 10,
  },
  swatchLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.3)",
  },
  pensamiento: {
    fontFamily: "CormorantGaramond_300Light",
    fontSize: 20,
    lineHeight: 28,
    color: Colors.textPrimary,
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginVertical: 4,
  },
  pistaTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  pistaEsp: {
    fontFamily: "CormorantGaramond_300Light_Italic",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.55)",
  },
  pistaNota: {
    fontFamily: "Inter_300Light",
    fontSize: 11,
    lineHeight: 17,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 0.1,
  },
  pregunta: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 22,
    lineHeight: 30,
    color: Colors.textPrimary,
    paddingVertical: 16,
    letterSpacing: -0.2,
  },
  teaser: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 1.8,
    color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase",
    paddingTop: 4,
    paddingBottom: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 12,
  },
  footerDot: {
    width: 4,
    height: 4,
  },
  footerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.18)",
    textTransform: "uppercase",
  },
});
