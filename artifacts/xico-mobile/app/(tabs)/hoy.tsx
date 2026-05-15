import React, { useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassMasthead, ColorBleedBackdrop } from "@/components/liquid-glass";
import { Colors, Pillars } from "@/constants/colors";
import { getDespachoForToday, type Despacho } from "@/constants/despachos";

// Task 2.2 · Hoy hero takeover (spec §7.1)
// Body content (drop cap, Ruta card, featured article) lands in Task 2.3.
// Animations land in Task 2.4 — no animations yet.
//
// NOTE on data shape: the project does not (yet) export a `useTodaysDespacho`
// hook · the source of truth is `getDespachoForToday()` in
// `constants/despachos.ts`, which returns a synchronous Despacho with NESTED
// `color`, `palabra`, and `lugar` objects. The Despacho also has no
// `lugar_image_url` field — per-day photographs are not yet authored, so the
// hero photo slot is currently empty (the ColorBleedBackdrop reads cleanly on
// the dark background alone). When Mauricio adds photos, drop them in below
// the comment marked "// HERO PHOTO SLOT".

function dayLabel(): string {
  const d = new Date();
  const raw = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  // "viernes, 15 may" → "VIERNES 15 MAY" (drop the comma, uppercase, strip period)
  return raw.replace(",", "").replace(".", "").toUpperCase();
}

export default function HoyScreen() {
  const insets = useSafeAreaInsets();
  const despacho: Despacho = useMemo(() => getDespachoForToday(), []);
  const todayLabel = useMemo(() => dayLabel(), []);

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* HERO PHOTO SLOT · per-day photos not yet authored — backdrop reads on dark. */}
      <View style={styles.heroGradientOverlay} />
      <ColorBleedBackdrop pillarColor={Pillars.indice} style={styles.bleedOverlay} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeroBlock despacho={despacho} />
        {/* Task 2.3 will append body content (drop cap + Ruta card + featured article) below. */}
      </ScrollView>

      <GlassMasthead
        label="XICO · HOY"
        meta={todayLabel}
        liveDotColor={despacho.color.hex}
      />
    </View>
  );
}

interface HeroBlockProps {
  despacho: Despacho;
}

function HeroBlock({ despacho }: HeroBlockProps) {
  const kicker = `EL DESPACHO DEL DÍA · ${despacho.color.nombre.toUpperCase()}`;
  return (
    <View>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.heroTitle}>
        {despacho.palabra.nahuatl}
        <Text style={styles.italicAccent}>.</Text>
      </Text>
      <View style={[styles.colorBand, { backgroundColor: despacho.color.hex }]} />
      <Text style={styles.meaning}>{`— ${despacho.palabra.español}`}</Text>
      <View style={styles.lugarRow}>
        <Text style={styles.lugarLabel}>Hoy · lugar</Text>
        <Text style={styles.lugarName}>
          {`${despacho.lugar.nombre} · ${despacho.lugar.barrio}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 540,
    backgroundColor: "rgba(8,5,8,0.4)",
    zIndex: 1,
  },
  bleedOverlay: {
    top: 0,
    left: 0,
    right: 0,
    height: 540,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 200,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  kicker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: Colors.ochreLight, // gold-light · day's accent
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 56,
    lineHeight: 56 * 0.92,
    letterSpacing: -0.045 * 56,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 2 },
  },
  italicAccent: {
    fontFamily: "Fraunces_400Regular_Italic",
    color: Colors.ochreLight,
  },
  colorBand: {
    height: 4,
    width: 72,
    marginVertical: 14,
    shadowColor: Colors.ochre,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  meaning: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 17,
    lineHeight: 17 * 1.35,
    color: "rgba(245,239,227,0.88)",
    marginBottom: 22,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
  lugarRow: { marginBottom: 28 },
  lugarLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.6)",
    marginBottom: 4,
  },
  lugarName: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 14,
    color: Colors.textPrimary,
  },
});
