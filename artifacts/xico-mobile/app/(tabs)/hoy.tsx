import React, { useMemo } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { GlassMasthead, ColorBleedBackdrop } from "@/components/liquid-glass";
import { Colors, Pillars } from "@/constants/colors";
import { getDespachoForToday, type Despacho } from "@/constants/despachos";
import { Rule, SectionOpener } from "@/components/editorial";
import { Roseton } from "@/components/pasaporte/Roseton";
import { useCurrentRuta } from "@/hooks/useCurrentRuta";
import { useCurrentRutaProgress } from "@/hooks/useCurrentRutaProgress";
import { useTier } from "@/hooks/useTier";

// Task 2.2 · Hoy hero takeover (spec §7.1)
// Task 2.3 · Body content below the hero — drop cap, Ruta card, featured article.
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
//
// DESIGN-RULES DECISION: the task spec mentioned GlassCard for the Ruta hero
// card BUT the same spec's "Constraints" section forbids glass on in-flow
// cards ("L1 + hairline OR L1 + magenta L-border, NOT glass"). The manifesto
// rule is clear: glass blur is ONLY for chrome that floats over content. So
// the Ruta card here is a plain View with Colors.surface (L1) + a 3pt magenta
// left border — same visual contract as GlassCard would render, minus the
// forbidden BlurView. The featured article uses the same pattern with a
// hairline border (no magenta L-border, since one saturated accent per
// surface is already spoken for by the cobalt kicker chip).

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

        {/* Drop cap body — first paragraph of today's despacho.pensamiento.
            Float layout: oversized Fraunces capital in pillar magenta, the
            remainder of the paragraph wraps next to it. */}
        <DropCapBody pensamiento={despacho.pensamiento} />

        {/* Tapered rule — visual rest between the despacho and the Ruta card. */}
        <Rule variant="accent" color={Pillars.indice} style={styles.ruleSpacing} />

        {/* La Ruta hero card — L1 + magenta L-border + inline rosetón. */}
        <RutaHeroCardInline />

        {/* Section opener — "EL EQUIPO TE PROPONE" */}
        <SectionOpener
          serial={1}
          label="El equipo te propone"
          accent={Pillars.indice}
          style={styles.sectionOpenerSpacing}
        />

        {/* Featured article placeholder — cultura-cobalt kicker chip on L1. */}
        <FeaturedArticlePlaceholder />
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
      <Text style={[styles.kicker, { color: despacho.color.hex }]}>{kicker}</Text>
      <Text style={styles.heroTitle}>
        {despacho.palabra.nahuatl}
        <Text style={[styles.italicAccent, { color: despacho.color.hex }]}>.</Text>
      </Text>
      <View style={[styles.colorBand, { backgroundColor: despacho.color.hex, shadowColor: despacho.color.hex }]} />
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

/**
 * DropCapBody — renders the first paragraph of today's pensamiento with a
 * 48pt Fraunces 600 drop cap in pillar magenta, 3-line deep float, rest of
 * paragraph wraps in Newsreader. Layout uses a row with the cap as a
 * fixed-width sibling of the wrapping text block (RN doesn't support true
 * CSS float, so this approximates a 3-line deep float by sizing the cap to
 * roughly 3 line-heights tall).
 *
 * We don't reuse the editorial/DropCap primitive because it sizes from
 * TypeSize.monumental (64) and uses serifSemibold (Newsreader 600). The
 * spec for this screen is Fraunces 600 at 48pt — the despacho's editorial
 * voice is Fraunces, not Newsreader.
 */
function DropCapBody({ pensamiento }: { pensamiento: string }) {
  if (!pensamiento) return null;
  const first = pensamiento.charAt(0);
  const rest = pensamiento.slice(1);
  return (
    <View style={dropCap.row}>
      <View style={dropCap.capBox}>
        <Text style={dropCap.cap}>{first}</Text>
      </View>
      <View style={dropCap.textBlock}>
        <Text style={dropCap.body}>{rest}</Text>
      </View>
    </View>
  );
}

/**
 * RutaHeroCardInline — L1 surface card with magenta L-border, kicker, hed
 * with italic accent on "en cinco barrios", María Vázquez byline, and an
 * inline mini-rosetón (week mode) showing the user's current sello fill.
 *
 * Reads useCurrentRuta + useCurrentRutaProgress + useTier. If any are still
 * loading, falls back to a sensible static frame (the card still renders
 * with placeholder week/editor strings so the layout doesn't reflow).
 */
function RutaHeroCardInline() {
  const ruta = useCurrentRuta();
  const progress = useCurrentRutaProgress();
  const tier = useTier();

  // Editorial fallback values for offline / loading state. The "INAUGURAL"
  // label is conditional on the actual inaugural week_key — future Rutas
  // won't falsely claim to be inaugural.
  const week = progress.weekLabel ?? "Semana 19";
  const editor = progress.editorName ?? ruta.data?.editor_name ?? "María Vázquez";
  const weekKey = ruta.data?.week_key;
  const isInaugural = weekKey === "2026-W19";

  return (
    <View style={ruta_s.card}>
      <Text style={ruta_s.kicker}>{`LA RUTA · ${week.toUpperCase()}${isInaugural ? " · INAUGURAL" : ""}`}</Text>
      <Text style={ruta_s.headline}>
        {"Cinco paradas "}
        <Text style={ruta_s.italicAccent}>en cinco barrios</Text>
      </Text>
      <Text style={ruta_s.byline}>{`— de ${editor} · editora cultural`}</Text>

      <View style={ruta_s.progressRow}>
        <Roseton
          mode="week"
          size={72}
          rutaStopsByRumbo={progress.rutaStopsByRumbo}
          earnedByRumbo={progress.earnedByRumbo}
          totalStops={progress.totalStops || 5}
          earnedStops={progress.earnedStops}
          isComplete={progress.isComplete}
          weekLabel={progress.weekLabel}
          tier={tier.data?.tier}
        />
        <View style={ruta_s.progressMeta}>
          <Text style={ruta_s.progressLabel}>Tu pasaporte</Text>
          <Text style={ruta_s.progressCount}>
            {`${progress.earnedStops} / ${progress.totalStops || 5} sellos`}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * FeaturedArticlePlaceholder — L1 surface card with magenta-bordered hero
 * gradient placeholder + cultura-cobalt kicker chip + Fraunces headline +
 * italic standfirst. Real article photography lands later.
 */
function FeaturedArticlePlaceholder() {
  return (
    <View style={article_s.card}>
      {/* PHOTO SLOT · article hero — real photo lands when sourced. */}
      <LinearGradient
        colors={[Colors.surfaceHigh, Colors.surfaceHigher, Colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={article_s.heroPlaceholder}
      >
        <View style={[article_s.heroBorderLeft, { backgroundColor: Pillars.cultura }]} />
      </LinearGradient>

      <View style={article_s.body}>
        <View style={[article_s.kickerChip, { borderColor: Pillars.cultura }]}>
          <Text style={[article_s.kickerChipText, { color: Pillars.cultura }]}>CULTURA</Text>
        </View>
        <Text style={article_s.headline}>
          {"El mole que llegó "}
          <Text style={article_s.italicAccent}>antes que el papeleo</Text>
        </Text>
        <Text style={article_s.standfirst}>
          Tres puestos del Mercado de San Fernando ya servían recetas oaxaqueñas en 2018, dos años antes de que la palabra "fusión" entrara en la conversación madrileña.
        </Text>
        <Text style={article_s.byline}>— de Sofía Mendoza · editora gastronomía</Text>
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
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  meaning: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 17,
    lineHeight: 17 * 1.35,
    color: Colors.textSecondary,
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
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  lugarName: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  ruleSpacing: {
    marginTop: 8,
    marginBottom: 28,
  },
  sectionOpenerSpacing: {
    marginTop: 12,
    marginBottom: 8,
  },
});

const dropCap = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 28,
  },
  capBox: {
    width: 44,
    height: 60, // approximately 3 line-heights of the body text below
    marginRight: 8,
    marginTop: 2,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  cap: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -1.2,
    color: Pillars.indice,
  },
  textBlock: { flex: 1 },
  body: {
    fontFamily: "Newsreader_400Regular",
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
    letterSpacing: 0.05,
  },
});

const ruta_s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Pillars.indice,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 24,
  },
  kicker: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2.5,
    color: Pillars.indice,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  headline: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: Colors.textPrimary,
  },
  italicAccent: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    color: Colors.textPrimary,
  },
  byline: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
    letterSpacing: 0.1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
  },
  progressMeta: { flex: 1 },
  progressLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  progressCount: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
});

const article_s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    marginBottom: 32,
    overflow: "hidden",
  },
  heroPlaceholder: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  heroBorderLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  kickerChip: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  kickerChipText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  headline: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.3,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  italicAccent: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    color: Colors.textPrimary,
  },
  standfirst: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  byline: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.4,
  },
});
