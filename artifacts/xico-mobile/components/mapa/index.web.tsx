// Web fallback · Mapa is iOS-first. `react-native-maps` doesn't have a usable web
// implementation in our setup (Apple Maps has no JS SDK, and we don't want a
// Google Maps API key for the web build). Show a tasteful editorial placeholder.
import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Colors, Pillars } from "@/constants/colors";

export default function MapaScreen() {
  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      <Text style={styles.kicker}>XICO · MAPA</Text>
      <Text style={styles.heading}>El mapa vive en iOS.</Text>
      <Text style={styles.body}>
        Abre XICO en tu iPhone para ver La Ruta sobre Apple Maps con las paradas en sus rumbos.
      </Text>
      <View style={[styles.accent, { backgroundColor: Pillars.indice }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  kicker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.textTertiary,
    marginBottom: 24,
  },
  heading: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 32,
    lineHeight: 32 * 1.05,
    letterSpacing: -0.025 * 32,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  body: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 15,
    lineHeight: 15 * 1.55,
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: 420,
    marginBottom: 24,
  },
  accent: {
    width: 36,
    height: 3,
  },
});
