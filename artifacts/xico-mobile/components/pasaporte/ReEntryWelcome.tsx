import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, FadeIn } from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";
import { Kicker, Masthead } from "@/components/editorial";
import { useMadridPulse } from "@/hooks/useMadridPulse";

/**
 * Re-entrada emocional · welcome screen shown when days_since_last_open ≥ 7
 *
 * Per manifesto (operational philosophy filter):
 *   - Greet by name + count days, NEVER as guilt or "we missed you"
 *   - Single atmospheric line about Madrid since they were gone (madrid_pulse)
 *   - Reference to a saved despacho if available (v2)
 *   - Single "Empezar" button → enters Índice
 *
 * "Los lugares quedan." — the Ruta is referenced as still-available, never
 * as missed.
 */

type Props = {
  daysSinceLastOpen: number;
  displayName?: string | null;
  onContinue: () => void;
};

function pluralDias(n: number): string {
  return n === 1 ? "un día" : `${n} días`;
}

export function ReEntryWelcome({ daysSinceLastOpen, displayName, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const pulse = useMadridPulse();

  const greeting = displayName
    ? `Hola, ${displayName.split(" ")[0]}.`
    : "Hola.";

  return (
    <View style={[s.root, { paddingTop: insets.top + Space.lg, paddingBottom: insets.bottom + Space.lg }]}>
      <View style={{ paddingHorizontal: Space.lg }}>
        <Masthead status="XICO" location="Madrid" />
      </View>

      <View style={s.body}>
        <Animated.View entering={FadeIn.duration(400)}>
          <Kicker>Bienvenida de vuelta</Kicker>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.intro}>
            Hace {pluralDias(daysSinceLastOpen)} que no te leíamos. No tienes nada que recuperar — la Ruta sigue su curso, los lugares quedan.
          </Text>
        </Animated.View>

        <View style={s.divider} />

        {/* Madrid pulse · atmospheric line about Madrid since they were gone */}
        <Animated.View entering={FadeIn.delay(200).duration(600)}>
          <Kicker>Madrid · esta semana</Kicker>
          {pulse.isLoading ? (
            <Text style={s.pulseTextLoading}>Cargando contexto…</Text>
          ) : pulse.data ? (
            <>
              <Text style={s.pulseText}>{pulse.data.text}</Text>
              {pulse.data.editor_name ? (
                <Text style={s.pulseEditor}>— {pulse.data.editor_name}</Text>
              ) : null}
            </>
          ) : (
            <Text style={s.pulseText}>Madrid sigue ahí, esperando que vuelvas a mirarla.</Text>
          )}
        </Animated.View>
      </View>

      <View style={[s.actions, { paddingBottom: insets.bottom + Space.lg }]}>
        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.7 }]}
          accessibilityRole="button"
          accessibilityLabel="Empezar"
        >
          <Text style={s.ctaText}>Empezar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: Space.lg,
    paddingTop: Space.xl,
    gap: Space.xl,
  },
  greeting: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.hero,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
    lineHeight: TypeSize.hero * 1.05,
    marginTop: Space.sm,
  },
  intro: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body + 1,
    color: Colors.textSecondary,
    lineHeight: (TypeSize.body + 1) * 1.7,
    marginTop: Space.md,
  },
  divider: {
    height: Hairline.thin,
    backgroundColor: Colors.borderLight,
    width: "100%",
  },
  pulseText: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.body,
    color: Colors.textPrimary,
    lineHeight: TypeSize.body * 1.65,
    marginTop: Space.sm,
  },
  pulseTextLoading: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textTertiary,
    marginTop: Space.sm,
  },
  pulseEditor: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textTertiary,
    marginTop: Space.sm,
  },
  actions: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
  },
  cta: {
    paddingVertical: Space.lg,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.textPrimary,
  },
  ctaText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.meta,
    color: Colors.textPrimary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
});
