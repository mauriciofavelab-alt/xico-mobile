import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Image, Pressable, RefreshControl, View, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { GlassMasthead, ColorBleedBackdrop } from "@/components/liquid-glass";
import { Colors, Pillars, getAccentColor } from "@/constants/colors";
import { getDespachoForToday, type Despacho } from "@/constants/despachos";
import { Rule, RevealOnMount, SectionOpener } from "@/components/editorial";
import { Roseton } from "@/components/pasaporte/Roseton";
import { useCurrentRuta } from "@/hooks/useCurrentRuta";
import { useCurrentRutaProgress } from "@/hooks/useCurrentRutaProgress";
import { useTier } from "@/hooks/useTier";
import { useFeaturedArticle, type FeaturedArticle } from "@/hooks/useFeaturedArticle";
import { isInauguralWeek } from "@/constants/editorial-calendar";
import { scaledFontSize } from "@/constants/editorial";

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
  // dayLabel() captures `new Date()` at call time. If the app sits open past
  // midnight, a useMemo([], ...) would leave "VIERNES 15 MAY" stale on
  // Saturday morning. We re-derive on AppState `active` transitions so the
  // masthead always reflects the current day after returning from background.
  // Per diagnostic §E-1.
  const [todayLabel, setTodayLabel] = useState<string>(() => dayLabel());
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") setTodayLabel(dayLabel());
    });
    return () => sub.remove();
  }, []);

  // Scroll-driven masthead blur (Apple-patterns §4.7) — the chrome thickens
  // as the user scrolls content underneath. scrollY is captured by the
  // worklet on the UI thread and shared with the GlassMasthead, which
  // interpolates blur intensity + bg tint over the first 120pt of scroll.
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Pull-to-refresh (Apple-patterns §4.5) — Hoy currently reads the
  // local-only despacho corpus per ADR-001, so onRefresh re-derives the
  // day label + lightly bumps the today getter to surface any AppState-
  // missed midnight crossing. Cheap, table-stakes affordance — the spinner
  // tint is pillar magenta (Indice) so it matches the surface chromatic
  // anchor on Hoy.
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh day label · the despacho is a memo by-day, but rendering
      // the new label is a visible signal that the pull worked.
      setTodayLabel(dayLabel());
      // 600ms theatre · long enough that the user sees the spinner do its
      // work, short enough that it never feels broken. Real backend
      // refetches land here when the editor-admin path ships per ADR-001.
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* HERO PHOTO · 460pt full-bleed lugar photograph. Rendered at low opacity
          (Apple Music / Kinfolk pattern) so it functions as warm atmospheric
          texture underneath the typography rather than a competing image. The
          editorial composition reads first; the photograph supplies tonal
          warmth and place-specificity. Photo also fades to transparent at its
          bottom edge so the body text below sits on solid Colors.background. */}
      {despacho.lugar_image_url ? (
        <>
          <Image
            source={despacho.lugar_image_url}
            style={[styles.heroPhoto, { opacity: 0.35 }]}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            accessible={false}
          />
          {/* Bottom-edge fade · gradient from transparent through to the
              background color so the photo dissolves into the dark canvas as
              the user's eye reaches the body text region (Y ≈ 430-460pt). */}
          <LinearGradient
            colors={["transparent", "transparent", Colors.background]}
            locations={[0, 0.75, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroGradientOverlay}
            pointerEvents="none"
          />
        </>
      ) : (
        <View style={styles.heroGradientOverlay} />
      )}
      <ColorBleedBackdrop pillarColor={Pillars.indice} style={styles.bleedOverlay} />

      <Animated.ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Pillars.indice}
            colors={[Pillars.indice]}
          />
        }
      >
        <HeroBlock despacho={despacho} />

        {/* Drop cap body — first paragraph of today's despacho.pensamiento.
            Float layout: oversized Fraunces capital in pillar magenta, the
            remainder of the paragraph wraps next to it. */}
        <DropCapBody pensamiento={despacho.pensamiento} />

        {/* Tapered rule — visual rest between the despacho and the Ruta card. */}
        <Rule variant="accent" color={Pillars.indice} style={styles.ruleSpacing} />

        {/* La Ruta hero card — L1 + magenta L-border + inline rosetón. */}
        <RevealOnMount delay={1000} duration={700}>
          <RutaHeroCardInline />
        </RevealOnMount>

        {/*
         * Section opener — "EL EQUIPO TE PROPONE"
         *
         * Saturation-discipline fix · 2026-05-15 (Agent D · diagnostic-visual.md #5):
         * the surface used to stack THREE saturated accents on a single 1000px
         * scroll — magenta (despacho kicker + Ruta L-border) → magenta SectionOpener
         * → cobalt (FeaturedArticle L-border + kicker chip), with the ochre
         * day-color hit on `Nahuatlato.` at the top. Brandbook §6 says one
         * saturated hit per surface section.
         *
         * Resolution: the SectionOpener is editorial chrome BETWEEN two accented
         * cards · it should be a neutral connector, not a third magenta hit.
         * Demoting `accent` to Colors.textTertiary keeps the serial number `01`,
         * the rule, and the label legible while letting the Ruta card (magenta)
         * and the Featured article (cobalt) own their respective saturated hits.
         * The scroll now reads: magenta (Ruta) → neutral (section opener) →
         * cobalt (Featured) — clean handoff.
         */}
        {/* Featured editorial section — only renders when there's a real
         * published+featured article (manifesto: curated, not algorithmic).
         * The SectionOpener and card live together so we hide both when
         * the editorial pipeline has no Featured slot scheduled. */}
        <FeaturedEditorialSection />
      </Animated.ScrollView>

      <GlassMasthead
        label="XICO · HOY"
        meta={todayLabel}
        liveDotColor={despacho.color.hex}
        scrollY={scrollY}
      />
    </View>
  );
}

interface HeroBlockProps {
  despacho: Despacho;
}

function HeroBlock({ despacho }: HeroBlockProps) {
  const kicker = `EL DESPACHO DEL DÍA · ${despacho.color.nombre.toUpperCase()}`;
  // Task 2.4 · staggered entrance per spec §7.1. RevealOnMount handles
  // useReducedMotion() internally (rendering children inline if Reduce
  // Motion is on), so each block fades up with cubic-out easing on
  // first mount. Masthead at 100ms is excluded — see top-level note.
  return (
    <View>
      <RevealOnMount delay={300} duration={700}>
        <Text style={[styles.kicker, { color: despacho.color.hex }]}>{kicker}</Text>
      </RevealOnMount>
      <RevealOnMount delay={450} duration={800}>
        <Text style={styles.heroTitle}>
          {despacho.palabra.nahuatl}
          <Text style={[styles.italicAccent, { color: despacho.color.hex }]}>.</Text>
        </Text>
      </RevealOnMount>
      <RevealOnMount delay={600} duration={600}>
        <View style={[styles.colorBand, { backgroundColor: despacho.color.hex, shadowColor: despacho.color.hex }]} />
      </RevealOnMount>
      <RevealOnMount delay={700} duration={800}>
        <Text style={styles.meaning}>{`— ${despacho.palabra.español}`}</Text>
      </RevealOnMount>
      <RevealOnMount delay={850} duration={700}>
        <View style={styles.lugarRow}>
          <Text style={styles.lugarLabel}>Hoy · lugar</Text>
          <Text style={styles.lugarName}>
            {`${despacho.lugar.nombre} · ${despacho.lugar.barrio}`}
          </Text>
        </View>
      </RevealOnMount>
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
  const isInaugural = isInauguralWeek(ruta.data?.week_key);

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
 * FeaturedEditorialSection — reads today's curated Featured article from
 * `useFeaturedArticle` (which fetches `GET /api/articles/featured/today`).
 * Renders the SectionOpener + L1 card together; returns null when no
 * featured article is published (the editorial "no Featured slot today"
 * state is silent — manifesto rule "curated, not algorithmic").
 *
 * Replaced the static FeaturedArticlePlaceholder on 2026-05-15 so the
 * Hoy surface is no longer paste-shipping a static placeholder that
 * repeated every day. The editorial CMS is the existing `articles`
 * table — when `featured=true AND is_published=true` exists, this card
 * renders that article verbatim with a tap-to-open Pressable.
 */
function FeaturedEditorialSection() {
  const { data: article, isPending } = useFeaturedArticle();

  // Render nothing while pending or when no featured article exists.
  // Manifesto: better silence than a fake card.
  if (isPending || !article) return null;

  return (
    <>
      <RevealOnMount delay={1150} duration={600}>
        <SectionOpener
          serial={1}
          label="El equipo te propone"
          accent={Colors.textTertiary}
          style={styles.sectionOpenerSpacing}
        />
      </RevealOnMount>

      <RevealOnMount delay={1300} duration={700}>
        <FeaturedArticleCard article={article} />
      </RevealOnMount>
    </>
  );
}

/**
 * FeaturedArticleCard — L1 surface card with kicker chip + headline +
 * standfirst + byline. Tappable → /article/[id]. Kicker color derives
 * from the article's subcategory or pillar via getAccentColor() so the
 * one-accent-per-card discipline holds even as editorial categories
 * shift week-to-week.
 */
function FeaturedArticleCard({ article }: { article: FeaturedArticle }) {
  const kickerLabel = (article.subcategory || article.category || article.pillar || "CULTURA").toUpperCase();
  // Pillar/subcategory → hex accent. Fallback to cultura cobalt for the
  // legacy "portada" pillar (cover-story styling).
  const accentSource = article.subcategory || article.pillar || "cultura";
  const accent = getAccentColor(accentSource) ?? Pillars.cultura;

  return (
    <Pressable
      onPress={() => router.push(`/article/${article.id}` as never)}
      accessibilityRole="link"
      accessibilityLabel={`Abrir artículo · ${article.title}`}
      style={({ pressed }) => [article_s.card, pressed && { opacity: 0.85 }]}
    >
      {/* PHOTO SLOT · article hero. Real photo lands when image_key is wired
          to a CDN URL; for now the gradient placeholder reads as editorial
          rather than as a broken state. */}
      <LinearGradient
        colors={[Colors.surfaceHigh, Colors.surfaceHigher, Colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={article_s.heroPlaceholder}
      >
        <View style={[article_s.heroBorderLeft, { backgroundColor: accent }]} />
      </LinearGradient>

      <View style={article_s.body}>
        <View style={[article_s.kickerChip, { borderColor: accent }]}>
          <Text style={[article_s.kickerChipText, { color: accent }]}>{kickerLabel}</Text>
        </View>
        <Text style={article_s.headline} numberOfLines={3}>
          {article.title}
        </Text>
        {article.subtitle ? (
          <Text style={article_s.standfirst} numberOfLines={3}>
            {article.subtitle}
          </Text>
        ) : null}
        <Text style={article_s.byline}>
          {article.author_name ? `— de ${article.author_name}` : "— Editorial"}
          {article.institution ? ` · ${article.institution}` : ""}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Hero photo region · confined to top 460pt (≈55% of 812pt iPhone viewport
  // per spec §7.1 "50-60% of canvas"). Original 540pt extended into the body
  // text region, leaving line 1-3 of the despacho paragraph unreadable over
  // the photograph.
  heroPhoto: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 460,
    width: "100%",
    zIndex: 0,
  },
  heroGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 460,
    backgroundColor: "rgba(8,5,8,0.4)",
    zIndex: 1,
  },
  // Note · 2026-05-15 (Agent D · diagnostic-code.md §F-6):
  // `heroPhotoFade` and `heroGradientOverlayWithPhoto` style entries used to
  // live here but had no consumers · the photo fade is now handled inline
  // via the LinearGradient at the top of the screen (locations stops do the
  // work). Removed to keep the styles object as a contract with what renders.
  bleedOverlay: {
    top: 0,
    left: 0,
    right: 0,
    height: 460,
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
    // Stronger shadow on photo backdrops · 90% black + 8pt radius gives the
    // tracked-caps a halo that survives any photograph in the lugar corpus.
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 8,
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
    // Phase 9 (Task 9.2) · italic meaning is the line the user is reading,
    // not chrome. Scale it. The display name above it (Fraunces 42pt) and
    // the tracked lugarLabel below it stay fixed (design + chrome).
    // Stronger shadow on photographic backdrops for legibility (90% black).
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: scaledFontSize(17),
    lineHeight: scaledFontSize(17) * 1.35,
    color: Colors.textSecondary,
    marginBottom: 22,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
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
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
  lugarName: {
    // Phase 9 (Task 9.2) · italic lugar name reads as continuation of the
    // meaning line — same body-text treatment + photo-legibility shadow.
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: scaledFontSize(14),
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
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
    // Phase 9 (Task 9.2) · the despacho hero body paragraph, the most-read
    // chunk on Hoy. Drop-cap above stays at 48pt (design).
    fontFamily: "Newsreader_400Regular",
    fontSize: scaledFontSize(16),
    lineHeight: scaledFontSize(24),
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
