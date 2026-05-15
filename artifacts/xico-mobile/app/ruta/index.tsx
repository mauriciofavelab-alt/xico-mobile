import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { XicoLoader } from "@/components/XicoLoader";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpringPressable } from "@/components/primitives";
import { haptic } from "@/constants/haptics";

import { Colors, Pillars } from "@/constants/colors";
import { Fonts, Space, Tracking, TypeSize } from "@/constants/editorial";
import { isInauguralWeek } from "@/constants/editorial-calendar";
import { RevealOnMount } from "@/components/editorial";
import { GlassMasthead } from "@/components/liquid-glass";
import { ChromeTabBar } from "@/components/nav/ChromeTabBar";
import { Roseton } from "@/components/pasaporte/Roseton";
import { StopCardFeatured } from "@/components/ruta/StopCardFeatured";
import { StopCardCompact } from "@/components/ruta/StopCardCompact";
import { useCurrentRuta, type RutaStopLite } from "@/hooks/useCurrentRuta";
import { useTier } from "@/hooks/useTier";
import { useSellos, type SelloRecord } from "@/hooks/useSellos";
import { useTypographyMode } from "@/hooks/useTypographyMode";
import { LiveActivity } from "@/modules/live-activity/src";
import type { RumboSlug } from "@/constants/rumbos";

/** AsyncStorage key for the active Ruta Live Activity id · Phase 7.2. */
const ACTIVE_RUTA_ACTIVITY_KEY = "active_ruta_activity_id";

/**
 * La Ruta de la semana · /ruta
 *
 * Phase 4 Task 4.4 redesign · spec §7.2.
 *
 * Hero is a magazine-spread table of contents — GlassMasthead + Fraunces
 * monumental title + italic byline + inline rosetón state. Stops below
 * alternate featured / compact cards, each carrying its OWN rumbo accent
 * (border-left + glass kicker chip + earned-sello pip). One saturation
 * anchor per card · the rumbo. The screen-level pillar accent (masthead
 * live dot, hero italic accent) is the Indice magenta — La Ruta lives
 * under the Indice pillar surface, so this is the editorial anchor that
 * unifies the spread without competing with the per-card rumbos.
 *
 * Earned-sello pips read as "you've been here" — rumbo-colored discs on
 * the right margin (compact) or bottom-right (featured). Pure visual
 * decoration; no badge / score / streak language anywhere.
 *
 * Hero copy is data-driven: stop count maps to the Spanish numeral
 * (Una, Dos, Tres…) so the editorial register holds for any Ruta size,
 * not just the inaugural 5-stop spread.
 */

/** 1-7 → Spanish editorial numerals. Anything else falls back to the digit. */
function spanishNumber(n: number): string {
  const map: Record<number, string> = {
    1: "Una",
    2: "Dos",
    3: "Tres",
    4: "Cuatro",
    5: "Cinco",
    6: "Seis",
    7: "Siete",
  };
  return map[n] ?? String(n);
}

function formatWeekLabel(week_key: string | null): string {
  if (!week_key) return "XICO · LA RUTA";
  const match = week_key.match(/^\d{4}-W(\d{1,2})$/i);
  return match
    ? `XICO · LA RUTA · SEMANA ${match[1]}`
    : `XICO · LA RUTA · ${week_key.toUpperCase()}`;
}

function formatHeroTitle(stopCount: number): { lead: string; accent: string } {
  // Editorial register: "Cinco paradas en cinco barrios" is the inaugural
  // copy. For other Ruta sizes we keep the structure honest — the count is
  // exact, but we don't claim a barrio count we can't verify (the API
  // doesn't carry a structured `barrio` field, and splitting addresses is
  // fragile). Generic "para esta semana" is the trust-preserving fallback.
  if (stopCount === 5) {
    return { lead: "Cinco paradas ", accent: "en cinco barrios" };
  }
  if (stopCount === 0) {
    // We're in a loading/empty path · render won't actually reach here.
    return { lead: "La Ruta ", accent: "esta semana" };
  }
  return {
    lead: `${spanishNumber(stopCount)} paradas `,
    accent: "para esta semana",
  };
}

export default function RutaIndex() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 24 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 24;

  const ruta = useCurrentRuta();
  const tier = useTier();
  const sellos = useSellos();
  const typo = useTypographyMode();

  // Scroll-driven masthead blur (Apple-patterns §4.7) · UI-thread worklet.
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Pull-to-refresh (Apple-patterns §4.5) · refetches Ruta + sellos. Tint =
  // magenta (Pillars.indice) — La Ruta lives under the Indice pillar surface,
  // matches the masthead live dot.
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([ruta.refetch(), sellos.refetch(), tier.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [ruta, sellos, tier]);

  // Stop-precise earned set. useSellos hits GET /api/sellos-rumbo which
  // returns the user's full sello list with ruta_stop_id per row.
  // useSelloMutation already invalidates ["sellos-rumbo"] on earn, so this
  // stays in sync without manual refetch.
  const earnedStopIds = useMemo<Set<string>>(
    () => new Set((sellos.data?.sellos ?? []).map((s: SelloRecord) => s.ruta_stop_id)),
    [sellos.data?.sellos],
  );

  const stops = ruta.data?.stops ?? [];
  const totalStops = stops.length;
  const heroTitle = formatHeroTitle(totalStops);

  // ── Live Activity (Phase 7.2) ──────────────────────────────────────────
  // The Empezar button is the single saturated CTA on this screen (magenta
  // pillar accent, same hue as the masthead live dot). It only renders when
  // (a) we have an active Ruta with stops, (b) the user hasn't already
  // started this week's Live Activity (we track the id in AsyncStorage),
  // and (c) Live Activities are supported + enabled (checked at tap time
  // rather than on mount, since the user can flip the Settings toggle).
  const [activeActivityId, setActiveActivityId] = useState<string | null>(null);
  const [empezarBusy, setEmpezarBusy] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_RUTA_ACTIVITY_KEY)
      .then((v) => setActiveActivityId(v))
      .catch(() => {
        /* AsyncStorage failures shouldn't crash this surface · default to
           "no active activity" so the Empezar button shows. */
        setActiveActivityId(null);
      });
  }, []);

  const handleEmpezarRuta = useCallback(async () => {
    if (empezarBusy) return;
    if (!ruta.data || stops.length === 0) return;
    setEmpezarBusy(true);
    try {
      const enabled = await LiveActivity.areEnabled();
      if (!enabled) {
        Alert.alert(
          "Live Activities desactivadas",
          "Activa Live Activities en Ajustes para ver La Ruta en la Dynamic Island.",
        );
        return;
      }
      const first = stops[0];
      const id = await LiveActivity.start({
        attributes: {
          weekKey: ruta.data.week_key ?? "",
          editorName: ruta.data.editor_name ?? "",
        },
        contentState: {
          stopsCompleted: 0,
          stopsTotal: stops.length,
          nextStopName: first.name,
          nextStopDistanceM: 0,
          nextStopRumboHex: first.rumbo?.color_hex ?? Pillars.indice,
          rosetonState: [0, 0, 0, 0],
        },
      });
      await AsyncStorage.setItem(ACTIVE_RUTA_ACTIVITY_KEY, id);
      setActiveActivityId(id);
    } catch (e) {
      // Non-blocking · the user can keep using the app even if Live
      // Activities fail. Surface the error so we get signal during
      // TestFlight without a hard crash.
      console.warn("[LiveActivity] start failed", e);
      Alert.alert(
        "No se pudo iniciar",
        "La Dynamic Island no pudo arrancar esta vez. Puedes seguir caminando La Ruta normalmente.",
      );
    } finally {
      setEmpezarBusy(false);
    }
  }, [empezarBusy, ruta.data, stops]);

  const showEmpezar = !activeActivityId && !!ruta.data && stops.length > 0 && Platform.OS === "ios";

  // Tier byRumbo for the inline rosetón. useTier returns by_rumbo;
  // useSellos.data.by_rumbo is equivalent (both come from the same server
  // computation), but useTier is the canonical source for tier-shaped data.
  const byRumbo = tier.data?.by_rumbo ?? { norte: 0, este: 0, sur: 0, oeste: 0 };
  const totalSellos = tier.data?.total ?? 0;
  const earnedThisRuta = earnedStopIds.size;
  const tierKey = tier.data?.tier ?? "iniciado";

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      {/* Modo hora atmosphere overlay · atardecer = warm wash over entire screen */}
      {typo.atmosphereOverlay ? (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: typo.atmosphereOverlay }]}
          pointerEvents="none"
        />
      ) : null}

      {/* Back / close affordance · top-left */}
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
        style={s.closeBtn}
        hitSlop={12}
        accessibilityLabel="Volver"
        accessibilityRole="button"
      >
        <Feather name="chevron-left" size={22} color={Colors.textSecondary} />
      </Pressable>

      <Animated.ScrollView
        contentContainerStyle={{
          // GlassMasthead floats absolutely at top: 81pt (or insets.top+22)
          // with height 38 + 10pt breathing room before content; the hero
          // must clear it. 81 + 38 + 16 ≈ 135 + insets.top adjustment.
          paddingTop: 140,
          paddingHorizontal: Space.lg,
          paddingBottom: bottomPad,
        }}
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
        {ruta.isLoading ? (
          // Editorial loader · brandbook §6 violation fix (Agent D · 2026-05-15):
          // the generic RN ActivityIndicator was a manifesto break · users see
          // a stock spinner in the most-trafficked loading state and the
          // editorial register collapses for ~3s on every cold open. The
          // XicoLoader is a quiet pulsing wordmark + hairline rule · same
          // visual register as the rest of the app · honors useReducedMotion
          // internally (no spin on reduced motion).
          <View style={s.loading}>
            <XicoLoader color={Colors.textSecondary} inline />
            <Text style={s.loadingText}>Cargando la Ruta…</Text>
          </View>
        ) : ruta.isError || !ruta.data ? (
          <View style={s.loading}>
            <Text style={s.loadingText}>
              No hay Ruta activa esta semana. La próxima edición se publica el domingo a las 9.
            </Text>
          </View>
        ) : (
          <>
            {/* Hero block · monumental title + italic byline + inline rosetón.
                Spec §7.2 pts 3-5. Photo (pt 2) is deferred — once per-week
                editor photography lands, swap the surface for an Image and
                keep the type stack as-is. */}
            <RevealOnMount delay={200} duration={700}>
              <View style={s.heroBlock}>
                <Text style={s.heroTitle}>
                  {heroTitle.lead}
                  <Text style={[s.heroItalicAccent, { color: Pillars.indice }]}>
                    {heroTitle.accent}
                  </Text>
                </Text>

                <Text style={s.heroByline}>
                  {`— de ${ruta.data.editor_name ?? "Equipo XICO"} · editora cultural`}
                </Text>
              </View>
            </RevealOnMount>

            {/* Inline rosetón state · "Tu pasaporte · N / M sellos" (spec pt 5).
                Lifetime mode (canonical), size=36 · the Roseton spec doesn't
                expose a `mini` prop — `size` alone is sufficient. */}
            <RevealOnMount delay={350} duration={600}>
              <View style={s.progressInline}>
                <Roseton
                  size={36}
                  byRumbo={byRumbo}
                  tier={tierKey}
                  totalSellos={totalSellos}
                />
                <View style={s.progressMeta}>
                  <Text style={s.progressLabel}>Tu pasaporte</Text>
                  <Text style={s.progressCount}>
                    {`${earnedThisRuta} / ${totalStops} sellos`}
                  </Text>
                </View>
              </View>
            </RevealOnMount>

            {/* Empezar La Ruta · Live Activity entry-point (Phase 7.2).
                Single saturated CTA on the screen · pillar Indice magenta,
                same hue as the masthead live dot · saturation discipline
                anchor. Hidden once the Live Activity is running (AsyncStorage
                check) so we don't double-start. iOS-only (no Live Activities
                on web / Android). */}
            {showEmpezar ? (
              <RevealOnMount delay={420} duration={600}>
                <SpringPressable
                  onPress={() => {
                    haptic.impactMedium();
                    handleEmpezarRuta();
                  }}
                  disabled={empezarBusy}
                  style={[
                    s.empezarBtn,
                    empezarBusy && s.empezarBtnDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Empezar La Ruta · activa la Dynamic Island"
                  hitSlop={8}
                  // SpringPressable already fires `selection` by default · the
                  // medium impact haptic above is the ceremonial weight for
                  // the primary CTA. Set haptic={null} so we don't double-fire.
                  haptic={null}
                >
                  <Text style={s.empezarText}>
                    {empezarBusy ? "INICIANDO…" : "EMPEZAR LA RUTA"}
                  </Text>
                </SpringPressable>
              </RevealOnMount>
            ) : null}

            {/* Stops · alternating featured / compact. mod-2 alternation
                generalizes across any Ruta size (5 stops → F C F C F,
                7 stops → F C F C F C F, 4 stops → F C F C). Each card
                carries its own rumbo accent. */}
            <View style={s.stopList}>
              {stops.map((stop: RutaStopLite, i: number) => {
                const orderIdx = stop.order ?? i + 1;
                const isFeatured = i % 2 === 0;
                const earned = earnedStopIds.has(stop.id);
                const rumboSlug = (stop.rumbo?.slug as RumboSlug | undefined) ?? null;
                const rumboNahuatl = stop.rumbo?.nahuatl_name ?? null;

                return (
                  <RevealOnMount key={stop.id} delay={500 + i * 120} duration={620}>
                    {isFeatured ? (
                      <StopCardFeatured
                        index={orderIdx}
                        total={totalStops}
                        name={stop.name}
                        address={stop.address}
                        rumboSlug={rumboSlug}
                        rumboNahuatl={rumboNahuatl}
                        earnedSello={earned}
                        onPress={() => router.push(`/ruta/stop/${stop.id}` as any)}
                      />
                    ) : (
                      <StopCardCompact
                        index={orderIdx}
                        total={totalStops}
                        name={stop.name}
                        rumboSlug={rumboSlug}
                        rumboNahuatl={rumboNahuatl}
                        distanceToNext={stop.distanceToNext}
                        earnedSello={earned}
                        onPress={() => router.push(`/ruta/stop/${stop.id}` as any)}
                      />
                    )}
                  </RevealOnMount>
                );
              })}
            </View>
          </>
        )}
      </Animated.ScrollView>

      {/* Floating glass masthead · spec §7.2 pt 1. Live dot = Pillars.indice
          (magenta) because La Ruta lives under the Indice ritual surface —
          this is the screen-level pillar anchor that unifies the spread.
          Per-card rumbo accents (different colors for each card) are the
          second saturation layer; they live inside the cards, not on chrome.
          scrollY drives the masthead blur/tint thickening as the user scrolls
          stop cards underneath. */}
      <GlassMasthead
        label={formatWeekLabel(ruta.data?.week_key ?? null)}
        meta={isInauguralWeek(ruta.data?.week_key) ? "INAUGURAL" : undefined}
        liveDotColor={Pillars.indice}
        scrollY={scrollY}
      />

      {/* Spec §7.2 pt 9 · floating glass tab bar with La Ruta active. /ruta
          lives outside the (tabs) group so the navigator's tab bar doesn't
          render here — we mount the standalone ChromeTabBar so the user
          can switch tabs without backing out. /ruta/stop/[id] intentionally
          does NOT include this (the Stop screen is the immersive showpiece
          per spec §7.3). */}
      <ChromeTabBar />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  closeBtn: {
    position: "absolute",
    left: Space.md,
    top: Platform.OS === "web" ? Space.md : 60,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  loading: {
    paddingVertical: Space.huge,
    alignItems: "center",
    justifyContent: "center",
    gap: Space.md,
  },
  loadingText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: Space.xl,
    lineHeight: TypeSize.body * 1.5,
  },

  // Hero block · monumental Fraunces title + italic byline. Spec §7.2 pts 3-4.
  // Fraunces 36pt at 500 — the spec's "144" refers to the optical-size axis
  // value, not point-size; 36pt at fontFamily 500 reads as the same
  // editorial weight on iOS that 144 in Figma compiles to in a desktop
  // layout. We mirror the Tu Códice hero name treatment (42pt) at one
  // step down because this is a screen-level title, not a personal name.
  heroBlock: {
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 36,
    lineHeight: 36 * 1.05,
    letterSpacing: -0.035 * 36,
    color: Colors.textPrimary,
  },
  heroItalicAccent: {
    fontFamily: "Fraunces_400Regular_Italic",
    // color injected inline · pillar Indice magenta (saturation discipline
    // anchor for La Ruta · same italic-color pattern as Tu Códice but
    // sourced from the pillar instead of the user's current rumbo).
  },
  heroByline: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 14,
    color: Colors.textTertiary,
    letterSpacing: 0.1,
    marginTop: 10,
  },

  // Inline rosetón state · spec §7.2 pt 5.
  progressInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 14,
    marginBottom: 24,
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

  // Stop list · spec §7.2 pts 6-8. Featured/compact alternation managed
  // by index parity in the map above. Each card owns its own rumbo accent.
  stopList: {
    marginTop: 4,
  },

  // Empezar La Ruta CTA · Phase 7.2. The one saturated button on the
  // screen · pillar Indice magenta. Centered, generous tap target. Sits
  // BELOW the rosetón inline state and ABOVE the stop list so the user
  // reads through "this is the Ruta → here's your progress → start it now"
  // top-to-bottom. Once tapped + activity is running, the button hides ·
  // the Dynamic Island becomes the user's progress surface, the listing
  // returns to read-only mode.
  empezarBtn: {
    backgroundColor: Pillars.indice,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 28,
    shadowColor: Pillars.indice,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  empezarBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },
  empezarBtnDisabled: {
    opacity: 0.7,
  },
  empezarText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 2,
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
});
