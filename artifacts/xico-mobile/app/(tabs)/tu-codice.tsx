// LEGACY mi-xico.tsx replaced 2026-05-15 · Liquid Glass redesign Phase 3 · spec §7.4
// Scaffold only · body content lands in Tasks 3.2 (identity) · 3.3 (rosetón + halo) · 3.4 (stats + Carta).
import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { GlassMasthead, ColorBleedBackdrop } from "@/components/liquid-glass";
import { Colors, Pillars } from "@/constants/colors";
import { Rumbos } from "@/constants/rumbos";

export default function TuCodiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* PHOTO SLOT · golden-hour Madrid · drops in via assets/images/tu-codice-backdrop.jpg */}
      {/* Until the photo lands, a vertical gradient fallback so the screen reads intentional, not broken */}
      <LinearGradient
        colors={[Colors.background, Pillars.archivo + "33"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      />
      <View style={styles.backdropOverlay} />

      {/* Three-radial color bleed · tier-driven via useColorBleed; pillar accent = Archivo verde */}
      <ColorBleedBackdrop pillarColor={Pillars.archivo} style={styles.bleedOverlay} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Body content lands in Tasks 3.2-3.4 */}
      </ScrollView>

      <GlassMasthead
        label="XICO · TU CÓDICE"
        meta="FOLIO #1"
        liveDotColor={Rumbos.center.hex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(8,5,8,0.7)",
    zIndex: 0,
  },
  bleedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: 20,
    zIndex: 2,
  },
});
