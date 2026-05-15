import React, { useEffect, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors } from "@/constants/colors";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";
import { Fonts, Space, Tracking, TypeSize } from "@/constants/editorial";
import { Masthead, Kicker, Standfirst, Rule } from "@/components/editorial";
import { Roseton, GrainOverlay } from "@/components/pasaporte";

/**
 * Dev-only showcase for the Roseton at different states.
 * Navigate via: /dev/pasaporte (in the running Expo app).
 *
 * Lets us validate the Roseton against the manifesto cross-check before it
 * lands in Mi Lectura:
 *   - empty state (0 sellos) — ghost petals + atmospheric copy
 *   - early state (5 sellos · iniciado · the inaugural Ruta outcome)
 *   - conocedor (8 sellos across 3 rumbos)
 *   - curador (18 sellos across 4 rumbos)
 *   - cronista (40+ sellos)
 */

type Scenario = {
  label: string;
  tier: "iniciado" | "conocedor" | "curador" | "cronista";
  total: number;
  byRumbo: Record<RumboSlug, number>;
  blurb: string;
};

const SCENARIOS: Scenario[] = [
  {
    label: "Empty · primera vez",
    tier: "iniciado",
    total: 0,
    byRumbo: { norte: 0, este: 0, sur: 0, oeste: 0 },
    blurb: "Tu rosetón se llenará al caminar tu primera Ruta.",
  },
  {
    label: "Tras Semana 19",
    tier: "iniciado",
    total: 5,
    byRumbo: { norte: 2, este: 1, sur: 1, oeste: 1 },
    blurb: "Caminaste la inaugural. Cinco sellos, cuatro rumbos en juego.",
  },
  {
    label: "Conocedor",
    tier: "conocedor",
    total: 8,
    byRumbo: { norte: 3, este: 2, sur: 2, oeste: 1 },
    blurb: "Ocho sellos · tres rumbos · estás leyendo Madrid con criterio.",
  },
  {
    label: "Curador",
    tier: "curador",
    total: 18,
    byRumbo: { norte: 6, este: 4, sur: 5, oeste: 3 },
    blurb: "Curador · puedes reservar con prioridad en Sello Copil restaurants.",
  },
  {
    label: "Cronista",
    tier: "cronista",
    total: 42,
    byRumbo: { norte: 11, este: 9, sur: 11, oeste: 11 },
    blurb: "Cronista · vives Madrid como infraestructura, no como destino.",
  },
];

export default function PasaporteShowcase() {
  // Prod gate · 2026-05-15 (Agent D · diagnostic-code.md §F-9):
  // /dev/pasaporte was shipping in the production bundle as a navigable route
  // because expo-router picks up every file under app/. The screen is a dev
  // sandbox (5-scenario Roseton showcase) · not part of the public surface.
  // We early-return-back when __DEV__ is false so a malicious deep-link or
  // accidental router.push cannot land a user on the dev preview in prod.
  // A clean follow-up is to MOVE this file outside app/ entirely; gating
  // here is the fast safe answer for Build #11.
  useEffect(() => {
    if (!__DEV__) {
      router.back();
    }
  }, []);

  const insets = useSafeAreaInsets();
  const top = Platform.OS === "web" ? 24 : insets.top + 12;
  const [scenarioIdx, setScenarioIdx] = useState(1);
  const scenario = SCENARIOS[scenarioIdx]!;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={{ paddingHorizontal: Space.lg, paddingTop: top, paddingBottom: Space.huge }}
    >
      <Masthead status="Dev" location="Pasaporte" date="14.05.26" volume="01" issue="01" />

      <View style={{ marginTop: Space.lg, marginBottom: Space.xl }}>
        <Standfirst>
          Rosetón de los Cuatro Rumbos · cinco escenarios para validar contra el manifesto.
        </Standfirst>
      </View>

      {/* Scenario picker */}
      <View style={s.picker}>
        {SCENARIOS.map((sc, i) => (
          <Pressable
            key={sc.label}
            onPress={() => setScenarioIdx(i)}
            style={[s.chip, scenarioIdx === i && s.chipActive]}
          >
            <Text style={[s.chipText, scenarioIdx === i && s.chipTextActive]}>{sc.label}</Text>
          </Pressable>
        ))}
      </View>

      <Rule />

      {/* The Rosetón itself */}
      <View style={s.rosetonStage}>
        <Roseton
          key={scenario.label /* re-mount on scenario change to replay entry */}
          tier={scenario.tier}
          totalSellos={scenario.total}
          byRumbo={scenario.byRumbo}
          onPetalPress={(slug) => console.log("petal", slug)}
          onCenterPress={() => console.log("center")}
        />
      </View>

      <Text style={s.blurb}>{scenario.blurb}</Text>

      <Rule />

      {/* Rumbo legend */}
      <View style={{ gap: Space.md, marginTop: Space.lg }}>
        <Kicker>Cosmología</Kicker>
        {(["norte", "este", "sur", "oeste"] as RumboSlug[]).map((slug) => {
          const r = Rumbos[slug];
          return (
            <View key={slug} style={s.legendRow}>
              <View style={[s.swatch, { backgroundColor: r.hex }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.legendName}>{r.mexica.toUpperCase()}</Text>
                <Text style={s.legendMeaning}>{r.meaning}</Text>
              </View>
              <Text style={s.legendCount}>{scenario.byRumbo[slug]}</Text>
            </View>
          );
        })}
      </View>

      <View style={s.grainTest}>
        <GrainOverlay opacity={0.03} />
        <Text style={s.grainText}>Grain overlay sample · 3%</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  picker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Space.sm,
    marginBottom: Space.lg,
  },
  chip: {
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderMedium,
  },
  chipActive: {
    backgroundColor: Colors.surfaceHigh,
    borderColor: Colors.borderStrong,
  },
  chipText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro + 1,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
  chipTextActive: { color: Colors.textPrimary },
  rosetonStage: {
    alignItems: "center",
    paddingVertical: Space.xl,
  },
  blurb: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Space.lg,
    marginBottom: Space.lg,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.md,
    paddingVertical: Space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  swatch: {
    width: 28,
    height: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderMedium,
  },
  legendName: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.small,
    color: Colors.textPrimary,
    letterSpacing: Tracking.wider,
  },
  legendMeaning: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  legendCount: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.subhead,
    color: Colors.textPrimary,
  },
  grainTest: {
    marginTop: Space.xl,
    height: 80,
    backgroundColor: Colors.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  grainText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textSecondary,
  },
});
