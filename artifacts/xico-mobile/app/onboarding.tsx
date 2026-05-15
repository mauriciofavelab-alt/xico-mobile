// XICO · Walkthrough · 6-stage editorial introduction · 2026-05-15
//
// Replaces the legacy 4-step interest-selection screen with a deeply-architected
// 6-stage walkthrough served at the same path (`app/onboarding.tsx`) so the
// root `_layout.tsx` route guard keeps working unchanged:
//
//   1 · Manifesto             "Una publicación, no una app"
//   2 · El Despacho del día   editorial daily card preview
//   3 · La Ruta semanal       5 rumbo-colored dots fill L→R
//   4 · Tu Códice             live Roseton fills petal-by-petal
//   5 · Tus lecturas          5 pillar chips (Despacho · Cultura · México Ahora · La Ruta · Archivo)
//   6 · Bienvenida            day-of-week CTA · writes AsyncStorage + Supabase
//
// Architecture:
// - Single file (this one). Stage shell is `<WalkthroughStage>` accepting
//   backdrop/eyebrow/hero/body/heroAnimation/footer. Each stage's hero
//   animation lives inline; they're small enough to keep collocated.
// - Step state is local `useState<number>` (NOT separate routes) so we own
//   the spring page transitions and never push to the navigation stack.
// - All animations gate on `useReducedMotion()` — when set, every motion
//   short-circuits to its final state.
//
// Re-runnable from Tu Códice:
// - When `from=settings` query param is present, step 5 (interests) is
//   skipped (jump 4→6), and step 6 "Comenzar" calls `router.back()` instead
//   of writing the AsyncStorage flag or re-saving interests.
//
// Persistence (first-run mode only):
// - `xico_onboarding_done` = "1"            · AsyncStorage flag the root
//                                              layout reads on cold-start
// - `xico_interests` = JSON pillar slugs    · AsyncStorage cache
// - PATCH /api/profile { interests: [...] } · Supabase profile sync (best
//                                              effort; 401 for anonymous
//                                              users is swallowed exactly
//                                              like the legacy onboarding)

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SpringPressable } from "@/components/primitives/SpringPressable";
import { Roseton } from "@/components/pasaporte/Roseton";
import { Colors } from "@/constants/colors";
import { Fonts, Tracking } from "@/constants/editorial";
import { haptic } from "@/constants/haptics";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";
import { InsetRim, Shadow } from "@/constants/shadows";

// ============================================================================
// Backdrops · sourced from existing CC BY-SA assets in assets/lugares/
// Curated per stage mood per the spec brief.
// ============================================================================

const BACKDROP_MANIFESTO = require("@/assets/lugares/008-casa-de-mexico.jpg");
const BACKDROP_DESPACHO = require("@/assets/lugares/_backdrop-tu-codice.jpg");
const BACKDROP_RUTA = require("@/assets/lugares/019-circulo-bellas-artes.jpg");
const BACKDROP_CODICE = require("@/assets/lugares/010-tienda-casa-mexico.jpg");
const BACKDROP_INTERESES = require("@/assets/lugares/004-jardin-botanico-retiro.jpg");
const BACKDROP_BIENVENIDA = require("@/assets/lugares/028-tlatelolco.jpg");

// ============================================================================
// Pillar chip catalog · the 5 walkthrough-specific interest pillars
// Spec: "Despacho · Cultura · México Ahora · La Ruta · Archivo". These are
// NOT the legacy INTERESTS subcategories — they represent editorial sections
// the user wants surfaced. We persist these slugs as the `interests` array
// so the existing Supabase column accepts them; downstream filtering in
// the rest of the app continues to work off the legacy subcategory taxonomy
// until interest-sync is harmonized in a follow-up.
// ============================================================================

type PillarChip = {
  id: string;        // human label (also persisted as the interests array entry)
  accent: string;    // magenta · single accent for all pillars in walkthrough mode
};

const PILLAR_CHIPS: PillarChip[] = [
  { id: "Despacho", accent: Colors.primary },
  { id: "Cultura", accent: Colors.primary },
  { id: "México Ahora", accent: Colors.primary },
  { id: "La Ruta", accent: Colors.primary },
  { id: "Archivo", accent: Colors.primary },
];

// ============================================================================
// Day label · "Hoy es lunes. Y XICO te espera." copy on the bienvenida step.
// Inline (not imported from tabs per spec). Lowercase Spanish day name.
// ============================================================================

const DAY_NAMES_ES = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function todayDayName(): string {
  return DAY_NAMES_ES[new Date().getDay()];
}

// ============================================================================
// WalkthroughStage · shared shell for every step. Accepts a backdrop image,
// scrim opacity, eyebrow, hero (React node so we can break out word-stagger,
// hero animations, etc.), body copy, hero animation slot (rendered below body),
// and footer slot.
// ============================================================================

type StageProps = {
  backdrop: ImageSourcePropType;
  scrim: number; // 0..1 fraction (e.g. 0.32)
  eyebrow: string;
  hero: React.ReactNode;
  body: React.ReactNode;
  heroAnimation?: React.ReactNode;
  // Whether to render the Saltar link in the stage's top-right.
  showSkip: boolean;
  onSkip: () => void;
  // When true, the eyebrow + hero + body block is wrapped in a BlurView
  // glass card · used on step 5 (Intereses) so the participatory bright
  // backdrop stays bright but the title still has hairline-rim contrast.
  glassHeader?: boolean;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

function WalkthroughStage({
  backdrop,
  scrim,
  eyebrow,
  hero,
  body,
  heroAnimation,
  showSkip,
  onSkip,
  glassHeader,
}: StageProps) {
  const stageHeaderRow = (
    <View style={styles.stageHeader}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      {showSkip && (
        <SpringPressable
          onPress={onSkip}
          hitSlop={12}
          haptic="selection"
          accessibilityRole="button"
          accessibilityLabel="Saltar la introducción"
        >
          <Text style={styles.skipLink}>Saltar</Text>
        </SpringPressable>
      )}
    </View>
  );

  const heroAndBody = (
    <>
      {hero}
      <View style={styles.stageBodyBlock}>{body}</View>
    </>
  );

  return (
    <View style={styles.stageRoot} pointerEvents="box-none">
      <Image
        source={backdrop}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
        accessibilityIgnoresInvertColors
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(8,5,8,${scrim})` },
        ]}
      />
      {/* Top scrim gradient — strengthens eyebrow contrast without darkening
          the whole frame. Kept as a flat overlay (no LinearGradient import). */}
      <View style={styles.stageTopScrim} pointerEvents="none" />

      <View style={styles.stageInner} pointerEvents="box-none">
        {stageHeaderRow}
        <View style={styles.stageHero} pointerEvents="box-none">
          {glassHeader ? (
            <BlurView intensity={30} tint="dark" style={styles.glassHeaderCard}>
              <View style={[StyleSheet.absoluteFill, styles.glassHeaderTint]} />
              <View style={styles.glassHeaderInner}>{heroAndBody}</View>
            </BlurView>
          ) : (
            heroAndBody
          )}
          {heroAnimation ? (
            <View style={styles.stageAnimationBlock} pointerEvents="box-none">
              {heroAnimation}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// Step 1 · Manifesto hero · word-by-word stagger on the title
// "Una publicación, no una app" — wraps to 2 lines. Each word fades in
// from below 200ms apart. Reduced-motion shows the whole title instantly.
// ============================================================================

const MANIFESTO_WORDS = ["Una", "publicación,", "no", "una", "app"];

function ManifestoHero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <View style={styles.manifestoHeroWrap}>
      <View style={styles.manifestoWords}>
        {MANIFESTO_WORDS.map((word, i) =>
          reducedMotion ? (
            <Text key={i} style={styles.heroDisplay56}>
              {word}{i < MANIFESTO_WORDS.length - 1 ? " " : ""}
            </Text>
          ) : (
            <Animated.Text
              key={i}
              entering={FadeInUp.delay(i * 200).duration(500)}
              style={styles.heroDisplay56}
            >
              {word}{i < MANIFESTO_WORDS.length - 1 ? " " : ""}
            </Animated.Text>
          ),
        )}
      </View>
    </View>
  );
}

// ============================================================================
// Step 2 · Despacho sample card · slides up after hero settles.
// Small BlurView card showing a date + 3 lines + byline.
// ============================================================================

function DespachoSampleCard({ reducedMotion }: { reducedMotion: boolean }) {
  const todayPretty = useMemo(() => {
    const d = new Date();
    const day = DAY_NAMES_ES[d.getDay()];
    const monthFmt = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(d);
    return `${day[0].toUpperCase()}${day.slice(1)}, ${d.getDate()} ${monthFmt}`;
  }, []);

  const inner = (
    <BlurView
      intensity={30}
      tint="dark"
      style={[styles.despachoCard, Shadow.cardLift, InsetRim]}
    >
      <Text style={styles.despachoDate}>{todayPretty}</Text>
      <Text style={styles.despachoBody}>
        Casa Barragán cumple cincuenta años. Una piscina magenta, una luz que
        nadie ha podido imitar — y un archivo que Madrid acaba de heredar.
      </Text>
      <Text style={styles.despachoByline}>MARÍA VÁZQUEZ · EDITORA</Text>
    </BlurView>
  );

  if (reducedMotion) return inner;
  return (
    <Animated.View
      entering={FadeInUp.delay(900).duration(640)}
      style={{ width: "100%" }}
    >
      {inner}
    </Animated.View>
  );
}

// ============================================================================
// Step 3 · Ruta dots · 5 rumbo-colored dots fill L→R with 150ms stagger.
// Each filled dot carries a colored glow halo (Shadow.glow + shadowColor).
// ============================================================================

const RUTA_DOT_COLORS: string[] = [
  Rumbos.norte.hex,                  // Mictlampa  #0E1018
  Rumbos.este.hex,                   // Tlapallan  #D9357B
  Rumbos.sur.hex,                    // Huitzlampa #234698
  Rumbos.oeste.hex,                  // Cihuatlampa #EDE6D8 (Barragán bone)
  Rumbos.center.light,               // Tlalxicco  warm-green
];

function RutaDotsAnimation({ reducedMotion }: { reducedMotion: boolean }) {
  // Each dot tracks its own fill progress 0..1 via a SharedValue. We drive
  // them with a delay schedule so the cascade reads L→R.
  const fills = [
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
    useSharedValue(0),
  ];

  useEffect(() => {
    if (reducedMotion) {
      fills.forEach((sv) => (sv.value = 1));
      return;
    }
    fills.forEach((sv, i) => {
      sv.value = withDelay(
        700 + i * 150,
        withTiming(1, { duration: 360, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
      );
    });
  }, [reducedMotion]);

  return (
    <View style={styles.rutaDotsRow}>
      {RUTA_DOT_COLORS.map((c, i) => (
        <RutaDot key={i} color={c} fill={fills[i]} />
      ))}
    </View>
  );
}

function RutaDot({ color, fill }: { color: string; fill: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    opacity: 0.18 + 0.82 * fill.value,
    transform: [{ scale: 0.78 + 0.22 * fill.value }],
  }));
  return (
    <Animated.View
      style={[
        styles.rutaDot,
        { backgroundColor: color, shadowColor: color, ...Shadow.glow },
        style,
      ]}
    />
  );
}

// ============================================================================
// Step 4 · Roseton preview · fills petal-by-petal over 2.4s (600ms stagger).
// Drives the existing Roseton via its byRumbo prop (lifetime mode). No
// changes needed to Roseton.tsx since byRumbo is already a first-class input.
// ============================================================================

const PETAL_FILL_ORDER: RumboSlug[] = ["este", "sur", "norte", "oeste"];

function RosetonPreview({ reducedMotion }: { reducedMotion: boolean }) {
  // Stage count progressing 0..4. Each tick adds one petal in PETAL_FILL_ORDER.
  // We don't try to animate the SVG path interior — the Roseton's own mount
  // animation handles the visual reveal of each filled petal as we re-render
  // it with a richer byRumbo map.
  const [revealed, setRevealed] = useState<number>(reducedMotion ? 4 : 0);

  useEffect(() => {
    if (reducedMotion) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < PETAL_FILL_ORDER.length; i++) {
      timers.push(
        setTimeout(() => setRevealed((prev) => Math.max(prev, i + 1)), 500 + i * 600),
      );
    }
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const byRumbo: Record<RumboSlug, number> = useMemo(() => {
    const map: Record<RumboSlug, number> = { norte: 0, este: 0, sur: 0, oeste: 0 };
    for (let i = 0; i < revealed; i++) {
      map[PETAL_FILL_ORDER[i]] = 1;
    }
    return map;
  }, [revealed]);

  return (
    <View style={styles.rosetonPreviewWrap} pointerEvents="none">
      <Roseton
        mode="lifetime"
        size={150}
        byRumbo={byRumbo}
        tier="iniciado"
        totalSellos={revealed}
      />
    </View>
  );
}

// ============================================================================
// Step 5 · Pillar chip · rebuilt fresh per spec.
// ============================================================================

function PillarChipButton({
  id,
  selected,
  onToggle,
}: {
  id: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <SpringPressable
      onPress={onToggle}
      haptic="impactLight"
      accessibilityRole="checkbox"
      accessibilityLabel={`${id}${selected ? ", seleccionado" : ""}`}
      accessibilityState={{ checked: selected }}
      style={styles.pillarChipPress}
    >
      <BlurView
        intensity={30}
        tint="dark"
        style={[
          styles.pillarChip,
          Shadow.cardLift,
          {
            borderColor: selected ? Colors.primary : Colors.textQuaternary,
            borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
          },
        ]}
      >
        <Text
          style={[
            styles.pillarChipLabel,
            selected && { color: Colors.primaryLight },
          ]}
        >
          {id}
        </Text>
        {selected && <View style={styles.pillarChipDot} />}
      </BlurView>
    </SpringPressable>
  );
}

// ============================================================================
// Footer chrome · 6 dots + Continuar (or Comenzar) CTA. Shared across all stages.
// ============================================================================

const STEP_COUNT = 6;

function FooterChrome({
  stepIndex,
  canContinue,
  isFinalStep,
  ctaLabel,
  onContinue,
  bottomInset,
}: {
  stepIndex: number; // 0..5
  canContinue: boolean;
  isFinalStep: boolean;
  ctaLabel: string;
  onContinue: () => void;
  bottomInset: number;
}) {
  return (
    <View
      style={[
        styles.footer,
        {
          paddingBottom: Math.max(bottomInset + 16, 32),
        },
      ]}
    >
      <View style={styles.dotsRow}>
        {Array.from({ length: STEP_COUNT }).map((_, i) => {
          const isActive = i === stepIndex;
          return (
            <View
              key={i}
              style={[
                styles.dotBase,
                isActive
                  ? {
                      backgroundColor: Colors.primary,
                      borderColor: Colors.primary,
                      shadowColor: Colors.primary,
                      ...Shadow.glow,
                    }
                  : {
                      backgroundColor: "transparent",
                      borderColor: Colors.textQuaternary,
                      borderWidth: StyleSheet.hairlineWidth,
                    },
              ]}
            />
          );
        })}
      </View>
      <SpringPressable
        onPress={onContinue}
        disabled={!canContinue}
        haptic={canContinue ? "impactMedium" : null}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        accessibilityState={{ disabled: !canContinue }}
        style={[
          styles.cta,
          isFinalStep ? { backgroundColor: Colors.primary } : { backgroundColor: Colors.surfaceHigher },
          !canContinue && styles.ctaDisabled,
        ]}
      >
        <Text
          style={[
            styles.ctaText,
            !canContinue && styles.ctaTextDisabled,
            isFinalStep && { color: Colors.textPrimary },
          ]}
        >
          {ctaLabel}
        </Text>
      </SpringPressable>
    </View>
  );
}

// ============================================================================
// Onboarding screen · orchestrates the 6-stage walkthrough.
// ============================================================================

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  // Query param: when from=settings is present, the walkthrough is being
  // re-run from Tu Códice. Skip step 5 (interests are already saved) and
  // close via router.back() on completion.
  const params = useLocalSearchParams<{ from?: string }>();
  const isReRun = params.from === "settings";

  const [step, setStep] = useState<number>(0);
  // Selected pillar chips · index 4 step. State is held at this top level so
  // navigating away from step 5 and coming back preserves the user's choices.
  const [selected, setSelected] = useState<string[]>([]);

  // Page transition · each forward press fades in the new step from a small
  // horizontal offset. Backward press slides from the opposite side. Backdrop
  // crossfade is implicit because each step's <WalkthroughStage> renders its
  // own backdrop and only one stage is mounted at a time.
  const slide = useSharedValue(0);
  const fade = useSharedValue(1);

  const animatedStageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value }],
    opacity: fade.value,
  }));

  const goToStep = useCallback(
    (next: number) => {
      const forward = next > step;
      if (reducedMotion) {
        setStep(next);
        return;
      }
      const exitOffset = forward ? -40 : 40;
      const enterOffset = forward ? 40 : -40;
      fade.value = withTiming(0, { duration: 180, easing: Easing.bezier(0.5, 0, 0.75, 0) });
      slide.value = withTiming(exitOffset, { duration: 180, easing: Easing.bezier(0.5, 0, 0.75, 0) }, (finished) => {
        if (!finished) return;
        slide.value = enterOffset;
        runOnJS(setStep)(next);
        slide.value = withTiming(0, { duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1) });
        fade.value = withTiming(1, { duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1) });
      });
    },
    [step, reducedMotion, fade, slide],
  );

  const togglePillar = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }, []);

  // Saltar tap → confirmation dialog → jump to step 5 (interests · mandatory).
  // On the re-run path (from=settings) there's no Saltar anywhere; this stays
  // local to the first-run flow.
  const handleSkip = useCallback(() => {
    Alert.alert(
      "¿Saltar la introducción?",
      "Podrás verla otra vez desde Tu Códice.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Saltar", style: "default", onPress: () => goToStep(4) },
      ],
      { cancelable: true },
    );
  }, [goToStep]);

  // Step 6 · Comenzar — finalize the walkthrough.
  // First-run mode: writes the AsyncStorage `xico_onboarding_done` flag,
  // caches selected pillars locally, and best-effort PATCHes Supabase
  // profile.interests. Then router.replace into the tabs.
  // Re-run mode: just router.back() — no flag writes, no Supabase call.
  const handleFinish = useCallback(async () => {
    if (isReRun) {
      router.back();
      return;
    }
    haptic.success();
    try {
      await AsyncStorage.setItem("xico_onboarding_done", "1");
      await AsyncStorage.setItem("xico_interests", JSON.stringify(selected));
    } catch (_) {
      /* swallow · AsyncStorage failures here should not block the user. */
    }
    try {
      const { API_BASE, getAuthHeaders } = await import("@/constants/api");
      const authHeaders = await getAuthHeaders();
      if (authHeaders.Authorization) {
        await fetch(`${API_BASE}/api/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ interests: selected }),
        });
      }
    } catch (_) {
      /* swallow · anonymous users 401 here; matches legacy behavior. */
    }
    router.replace("/(tabs)");
  }, [isReRun, selected]);

  // Continuar wiring per step. Step 4 has special routing for the re-run path:
  // jumps directly to step 6 instead of step 5 (interests · already saved).
  const handleContinue = useCallback(() => {
    if (step === 5) {
      handleFinish();
      return;
    }
    if (step === 3 && isReRun) {
      goToStep(5);
      return;
    }
    goToStep(step + 1);
  }, [step, isReRun, goToStep, handleFinish]);

  // canContinue · step 5 needs 2+ selected; the rest are always continue-able.
  const canContinue = step === 4 ? selected.length >= 2 : true;
  const isFinalStep = step === 5;
  const ctaLabel = isFinalStep
    ? isReRun ? "Cerrar" : "Comenzar"
    : "Continuar";
  // Saltar appears on steps 1-4 (indices 0..3) and only in first-run mode.
  const showSkip = !isReRun && step <= 3;

  const dayName = useMemo(() => todayDayName(), []);

  // Render the current stage. Each stage's contents are inline below.
  let stage: React.ReactNode = null;
  switch (step) {
    case 0:
      stage = (
        <WalkthroughStage
          backdrop={BACKDROP_MANIFESTO}
          scrim={0.72}
          eyebrow="XICO"
          showSkip={showSkip}
          onSkip={handleSkip}
          hero={<ManifestoHero reducedMotion={reducedMotion} />}
          body={
            <Animated.Text
              entering={reducedMotion ? undefined : FadeIn.delay(MANIFESTO_WORDS.length * 200 + 200).duration(600)}
              style={styles.bodyItalic22}
            >
              XICO no informa. Revela.{"\n"}No te empuja. Te acompaña.
            </Animated.Text>
          }
        />
      );
      break;
    case 1:
      stage = (
        <WalkthroughStage
          backdrop={BACKDROP_DESPACHO}
          scrim={0.24}
          eyebrow="01 · CADA MAÑANA"
          showSkip={showSkip}
          onSkip={handleSkip}
          hero={<Text style={styles.heroDisplay48}>El Despacho</Text>}
          body={
            <Text style={styles.bodyItalic18}>
              Tres líneas escritas para hoy, en voz humana.
            </Text>
          }
          heroAnimation={<DespachoSampleCard reducedMotion={reducedMotion} />}
        />
      );
      break;
    case 2:
      stage = (
        <WalkthroughStage
          backdrop={BACKDROP_RUTA}
          scrim={0.55}
          eyebrow="02 · DOMINGOS 9 AM"
          showSkip={showSkip}
          onSkip={handleSkip}
          hero={<Text style={styles.heroDisplay48}>La Ruta</Text>}
          body={
            <Text style={styles.bodyItalic18}>
              Cinco paradas a pie. Un sello por cada lugar al que llegas.
            </Text>
          }
          heroAnimation={<RutaDotsAnimation reducedMotion={reducedMotion} />}
        />
      );
      break;
    case 3:
      stage = (
        <WalkthroughStage
          backdrop={BACKDROP_CODICE}
          scrim={0.22}
          eyebrow="03 · LOS CUATRO RUMBOS"
          showSkip={showSkip}
          onSkip={handleSkip}
          hero={<Text style={styles.heroDisplay48}>Tu Códice</Text>}
          body={
            <Text style={styles.bodyItalic18}>
              Mictlampa, Tlapallan, Huitzlampa, Cihuatlampa. Tu rosetón crece con cada lugar al que llegas.
            </Text>
          }
          heroAnimation={<RosetonPreview reducedMotion={reducedMotion} />}
        />
      );
      break;
    case 4:
      stage = (
        <WalkthroughStage
          backdrop={BACKDROP_INTERESES}
          scrim={0.34}
          glassHeader
          eyebrow="04 · TUS LECTURAS"
          showSkip={false}
          onSkip={handleSkip}
          hero={<Text style={styles.heroDisplay40}>Elige lo que te llama</Text>}
          body={
            <Text style={[styles.bodyItalic18, { fontSize: 16, lineHeight: 24 }]}>
              Escoge al menos dos. Podrás cambiar esto cuando quieras.
            </Text>
          }
          heroAnimation={
            <View style={styles.pillarGrid}>
              {PILLAR_CHIPS.map((chip) => (
                <PillarChipButton
                  key={chip.id}
                  id={chip.id}
                  selected={selected.includes(chip.id)}
                  onToggle={() => togglePillar(chip.id)}
                />
              ))}
            </View>
          }
        />
      );
      break;
    case 5:
    default:
      stage = (
        <WalkthroughStage
          backdrop={BACKDROP_BIENVENIDA}
          scrim={0.55}
          eyebrow="BIENVENIDO"
          showSkip={false}
          onSkip={handleSkip}
          hero={
            <Text style={styles.heroDisplay44}>
              Hoy es {dayName}.{"\n"}Y XICO te espera.
            </Text>
          }
          body={
            <Text style={styles.bodyItalic18}>
              Tu primer Despacho ya está listo.
            </Text>
          }
        />
      );
      break;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 24 : 12) }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStageStyle]} pointerEvents="box-none">
        {stage}
      </Animated.View>
      <FooterChrome
        stepIndex={step}
        canContinue={canContinue}
        isFinalStep={isFinalStep}
        ctaLabel={ctaLabel}
        onContinue={handleContinue}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

// ============================================================================
// Styles · scoped to the walkthrough. Typography sourced from constants/editorial.
// Fraunces for hero display, Newsreader italic for body, Inter caps for eyebrows.
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stageRoot: {
    flex: 1,
    position: "relative",
  },
  stageTopScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "rgba(8,5,8,0.35)",
  },
  stageInner: {
    flex: 1,
    paddingHorizontal: 28,
  },
  stageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    minHeight: 32,
  },
  stageHero: {
    flex: 1,
    paddingTop: 64,
    paddingBottom: 200,
  },
  stageBodyBlock: {
    marginTop: 24,
  },
  stageAnimationBlock: {
    marginTop: 36,
    alignItems: "center",
  },
  // Step 5 (Intereses) · glass-treated header so the participatory bright
  // backdrop can stay bright but the title block still has hairline-rim
  // contrast. Mirrors the BlurView chip pattern below.
  glassHeaderCard: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  glassHeaderTint: {
    backgroundColor: "rgba(8,5,8,0.32)",
  },
  glassHeaderInner: {
    paddingHorizontal: 22,
    paddingVertical: 22,
  },
  eyebrow: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 11,
    letterSpacing: Tracking.widest,
    color: Colors.textTertiary,
    textTransform: "uppercase",
  },
  skipLink: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: 14,
    color: Colors.textSecondary,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 4,
  },

  // ---- Hero display sizes ------------------------------------------------
  heroDisplay56: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 56,
    lineHeight: 56 * 1.05,
    letterSpacing: Tracking.tight,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 2 },
  },
  heroDisplay48: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 48,
    lineHeight: 48 * 1.05,
    letterSpacing: Tracking.tight,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 2 },
  },
  heroDisplay44: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 44,
    lineHeight: 44 * 1.1,
    letterSpacing: Tracking.tight,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 2 },
  },
  heroDisplay40: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 40,
    lineHeight: 40 * 1.1,
    letterSpacing: Tracking.tight,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 2 },
  },
  manifestoHeroWrap: {
    flexDirection: "row",
  },
  manifestoWords: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: SCREEN_W - 56,
  },

  // ---- Body italic copy --------------------------------------------------
  bodyItalic22: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 22,
    lineHeight: 22 * 1.4,
    color: Colors.textSecondary,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 6,
  },
  bodyItalic18: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 18,
    lineHeight: 18 * 1.4,
    color: Colors.textSecondary,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 6,
  },

  // ---- Step 2 · despacho sample card ------------------------------------
  despachoCard: {
    width: "88%",
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    overflow: "hidden",
    backgroundColor: "rgba(19,16,26,0.55)",
  },
  despachoDate: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 13,
    color: Colors.textTertiary,
    marginBottom: 8,
  },
  despachoBody: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  despachoByline: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: Tracking.wider,
    color: Colors.textTertiary,
  },

  // ---- Step 3 · ruta dots row -------------------------------------------
  rutaDotsRow: {
    flexDirection: "row",
    gap: 18,
    justifyContent: "center",
    paddingVertical: 10,
  },
  rutaDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  // ---- Step 4 · roseton preview wrap ------------------------------------
  rosetonPreviewWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  // ---- Step 5 · pillar chip grid ----------------------------------------
  pillarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingTop: 8,
  },
  pillarChipPress: {
    // SpringPressable wraps the chip; the BlurView inside carries the visual.
  },
  pillarChip: {
    minWidth: 120,
    height: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(19,16,26,0.45)",
  },
  pillarChipLabel: {
    fontFamily: "Newsreader_500Medium",
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  // Selected-state indicator on pillar chips. A magenta dot is more
  // brand-coherent than an ASCII check glyph (brandbook §5 reserves
  // typography for words; iconography uses Mexica glyphs or geometric
  // primitives — never an Inter checkmark character).
  pillarChipDot: {
    position: "absolute",
    top: 8,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryLight,
  },

  // ---- Footer chrome ----------------------------------------------------
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    paddingTop: 14,
    backgroundColor: "transparent",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
  },
  dotBase: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cta: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    // Unified primary CTA radius across auth + walkthrough + ruta empezar
    // (auth and ruta already at 12pt; walkthrough was 2pt; see visual audit).
    borderRadius: 12,
    paddingHorizontal: 28,
    ...Shadow.cardLift,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 12,
    letterSpacing: Tracking.widest,
    color: Colors.textPrimary,
    textTransform: "uppercase",
  },
  ctaTextDisabled: {
    color: Colors.textTertiary,
  },
});

// Silence unused-warning · we read SCREEN_H elsewhere if step 6 ever
// reaches for a vertical anchor; keeping the reference makes the import
// surface explicit.
void SCREEN_H;
