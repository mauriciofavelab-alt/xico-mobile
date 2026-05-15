import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInUp,
  SlideInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { Fonts, Hairline, scaledFontSize, Space, Tracking, TypeSize } from "@/constants/editorial";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";
import { ByLine, Kicker, RevealOnMount } from "@/components/editorial";
import { GlassMasthead, GlassChip } from "@/components/liquid-glass";
import { GlifoMaya } from "@/components/GlifoMaya";
import { ProgressRing } from "@/components/ruta/ProgressRing";
import { StopVeil } from "@/components/ruta/StopVeil";
import { fetchJson, API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";
import { useVisitToken } from "@/hooks/useVisitToken";
import { useSelloMutation, type SelloEarnResult } from "@/hooks/useSelloMutation";
import { useTypographyMode } from "@/hooks/useTypographyMode";
import { useCurrentRuta } from "@/hooks/useCurrentRuta";

/**
 * Stop screen · /ruta/stop/[id]
 *
 * Five-state choreography per spec §Mobile screens:
 *   1. en_camino       · veiled hero + despacho_text always visible
 *   2. llegada         · veil lifts, apunte appears, ring fills
 *   3. sello_entregado · server enforces 30s; on response we mark earned
 *   4. anotacion       · optional 1-line note (slide-up input)
 *   5. tier_up         · full-screen overlay if tier_changed
 *
 * All animations on UI thread via worklets. useReducedMotion respected.
 * Concurrent animation cap = 2 (per ui-ux-pro-max excessive-motion rule).
 */

type StopPublic = {
  id: string;
  ruta_id: string;
  order_num: number;
  name: string;
  address: string;
  description: string;
  category: string;
  accent_color: string | null;
  time_suggestion: string | null;
  distance_to_next: string | null;
  lat: number | null;
  lng: number | null;
  rumbo_id: string | null;
  despacho_text: string | null;
};

type StopState = "en_camino" | "llegada" | "sello_entregado" | "anotacion" | "tier_up";

type RumboLite = {
  id: string;
  slug: RumboSlug;
  nahuatl_name: string;
  meaning: string;
  color_hex: string;
};

// Trailing-punctuation parser for the monumental stop name. Some stops end with
// "?" or "!" (e.g. "¿Café o té?"), most end with no punctuation. We render the
// trailing punctuation italic + rumbo-colored as an editorial signature; if the
// name has none, we add a single italic period. The period is THE finality cue.
const NAME_PUNCT_RE = /[.!?…]+$/;
function splitStopName(name: string): { body: string; punct: string } {
  const match = name.match(NAME_PUNCT_RE);
  if (match) return { body: name.slice(0, -match[0].length), punct: match[0] };
  return { body: name, punct: "." };
}

// ─── Local data hooks ─────────────────────────────────────────────────────
function useStop(stopId: string | undefined) {
  return useQuery<StopPublic>({
    queryKey: ["ruta-stop", stopId],
    enabled: !!stopId,
    staleTime: 60_000 * 30,
    queryFn: () => fetchJson<StopPublic>(`/api/ruta-stops/${stopId}`),
  });
}

function useRumbos() {
  return useQuery<RumboLite[]>({
    queryKey: ["rumbos"],
    staleTime: Infinity,
    queryFn: () => fetchJson<RumboLite[]>("/api/rumbos"),
  });
}

function postAnnotation(input: { ruta_stop_id: string; text: string }) {
  return (supabase.auth.getSession() as Promise<{ data: { session: any } }>).then(async ({ data: { session } }: { data: { session: any } }) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;
    const res = await fetch(`${API_BASE}/api/ruta-stop-notes`, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error(`Annotation failed: ${res.status}`);
    return res.json();
  });
}

// ═══════════════════════════════════════════════════════════════════════════
export default function StopScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const stopId = typeof rawId === "string" ? rawId : null;
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  const stop = useStop(stopId ?? undefined);
  const rumbos = useRumbos();
  const visit = useVisitToken(stopId);
  const selloMut = useSelloMutation();
  const typo = useTypographyMode();
  // Used to compute the folio total (01 / 05). The /ruta listing already
  // fetched this and React Query dedupes the request — no extra network.
  const currentRuta = useCurrentRuta();
  const totalStops = currentRuta.data?.stops.length ?? null;

  // Find the stop's rumbo
  const rumbo: RumboLite | null = useMemo(() => {
    if (!stop.data?.rumbo_id || !rumbos.data) return null;
    return rumbos.data.find((r: RumboLite) => r.id === stop.data!.rumbo_id) ?? null;
  }, [stop.data?.rumbo_id, rumbos.data]);

  const accent = rumbo?.color_hex ?? Colors.textTertiary;

  // ─── State machine ─────────────────────────────────────────────────────
  const [state, setState] = useState<StopState>("en_camino");
  const [note, setNote] = useState("");
  const [annotationSubmitted, setAnnotationSubmitted] = useState(false);
  // Dismissing the annotation block doesn't exit the screen — the user still
  // sees the apunte_in_situ and the earned sello disc above. They use the
  // top-left close button when they're done lingering.
  const [annotationDismissed, setAnnotationDismissed] = useState(false);
  const [tierUpInfo, setTierUpInfo] = useState<{ from: string; to: string } | null>(null);
  const haveFiredEarnRef = useRef(false);

  // State 1 → 2: visit-token arrived means we're within 50m and server agreed
  useEffect(() => {
    if (visit.visit_token && state === "en_camino") {
      setState("llegada");
    }
  }, [visit.visit_token, state]);

  // State 2 → 3: ring completes (calls onComplete which triggers earn flow)
  const onRingComplete = useCallback(() => {
    if (!visit.visit_token || !stopId || haveFiredEarnRef.current) return;
    haveFiredEarnRef.current = true;

    // Haptic ×3 spaced 80ms apart · ui-ux-pro-max touch rule + spec choreography
    Haptics.selectionAsync();
    setTimeout(() => Haptics.selectionAsync(), 80);
    setTimeout(() => Haptics.selectionAsync(), 160);

    selloMut.mutate(
      { visit_token: visit.visit_token, stop_id: stopId },
      {
        onSuccess: (result: SelloEarnResult) => {
          setState("sello_entregado");
          if (result.tier_changed) {
            setTierUpInfo({ from: result.previous_tier, to: result.tier.tier });
          }
          // Advance to annotation after the sello-earn ceremony settles
          setTimeout(() => setState("anotacion"), reducedMotion ? 0 : 1400);
        },
        onError: (e: unknown) => {
          // Silent rollback per spec failure handling — soft notice in UI
          console.warn("[stop] sello earn failed:", (e as Error).message);
        },
      },
    );
  }, [visit.visit_token, stopId, selloMut, reducedMotion]);

  // ─── Sello-earn animation: wax-seal medallion ──────────────────────────
  // The emotional peak of the app. Spring-physics stamp lands center-screen
  // with a slight rotation, settles, then fades out as the static sello disc
  // at top-right takes over the role of "this is earned." Per ui-ux-pro-max
  // critique (P3 · 2026-05-14 evening): the previous empty-ring glyph was the
  // weakest visual at the strongest moment; this redesign borrows from the
  // Mexica codex stamp tradition via the existing <GlifoMaya /> catalog.
  const glyphScale = useSharedValue(0.35);
  const glyphRotate = useSharedValue(-8); // degrees
  const glyphOpacity = useSharedValue(0);

  useEffect(() => {
    if (state !== "sello_entregado") return;
    if (reducedMotion) {
      glyphOpacity.value = withTiming(1, { duration: 200 });
      glyphScale.value = withTiming(1, { duration: 200 });
      glyphRotate.value = 0;
      // No bounce, no extended visibility — fade out after 1.2s
      glyphOpacity.value = withDelay(1200, withTiming(0, { duration: 300 }));
      return;
    }
    // Stamp lands: opacity in fast, scale springs from 0.35 → 1.0, rotation -8° → 0°
    glyphOpacity.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
      withDelay(1100, withTiming(0, { duration: 360, easing: Easing.bezier(0.5, 0, 0.75, 0) })),
    );
    glyphScale.value = withSpring(1, { damping: 12, stiffness: 100, mass: 0.8 });
    glyphRotate.value = withSpring(0, { damping: 14, stiffness: 90, mass: 0.7 });
  }, [state, glyphOpacity, glyphScale, glyphRotate, reducedMotion]);

  const glyphStyle = useAnimatedStyle(() => ({
    opacity: glyphOpacity.value,
    transform: [
      { scale: glyphScale.value },
      { rotate: `${glyphRotate.value}deg` },
    ],
  }));

  // ─── Scroll-driven motion (iOS-native hero feel) ───────────────────────
  // Captures scrollY into a sharedValue, then drives three transforms on the
  // hero: parallax translate, title fade, title shrink. State indicator at
  // top-right stays absolutely positioned and does NOT participate — the
  // user keeps a constant signal of state regardless of scroll position.
  // Per ui-ux-pro-max P2 audit: "play with all sorts of transitions and
  // designs adapted to what a modern app on iphone needs."
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Hero parallax — translates at half scroll speed.
  const heroParallaxStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    return { transform: [{ translateY: scrollY.value * 0.5 }] };
  });

  // Display title — fades + shrinks as user scrolls into the despacho.
  const heroTitleStyle = useAnimatedStyle(() => {
    if (reducedMotion) return {};
    const opacity = interpolate(scrollY.value, [0, 200], [1, 0.25], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [0, 200], [1, 0.92], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // ─── Annotation submission ─────────────────────────────────────────────
  const annotateMut = useMutation({
    mutationFn: postAnnotation,
    onSuccess: () => setAnnotationSubmitted(true),
  });

  const submitAnnotation = useCallback(() => {
    if (!stopId || !note.trim()) return;
    annotateMut.mutate({ ruta_stop_id: stopId, text: note.trim() });
  }, [stopId, note, annotateMut]);

  // Close the screen safely. If the user has typed an annotation but not
  // submitted it, confirm before losing the text (ui-ux-pro-max
  // sheet-dismiss-confirm rule). After explicit save OR dismiss, no guard.
  const handleClose = useCallback(() => {
    const hasUnsavedNote = !!note.trim() && !annotationSubmitted && !annotationDismissed;
    if (!hasUnsavedNote) {
      router.canGoBack() ? router.back() : router.replace("/ruta" as any);
      return;
    }
    Alert.alert(
      "¿Salir sin guardar la nota?",
      "Tu línea se va a perder. El equipo no la verá.",
      [
        { text: "Volver a la nota", style: "cancel" },
        {
          text: "Salir igual",
          style: "destructive",
          onPress: () => (router.canGoBack() ? router.back() : router.replace("/ruta" as any)),
        },
      ],
    );
  }, [note, annotationSubmitted, annotationDismissed]);

  // Dismiss the annotation block without exiting the screen. User still sees
  // the apunte_in_situ + sello disc above. They use the close button when ready.
  const dismissAnnotation = useCallback(() => {
    setAnnotationDismissed(true);
  }, []);

  // ─── Loading + error states ────────────────────────────────────────────
  if (!stopId || stop.isLoading) {
    return (
      <View style={[s.root, { paddingTop: insets.top, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={Colors.textSecondary} />
      </View>
    );
  }
  if (stop.isError || !stop.data) {
    return (
      <View style={[s.root, { paddingTop: insets.top, alignItems: "center", justifyContent: "center" }]}>
        <Text style={s.loadingText}>No se pudo cargar la parada.</Text>
      </View>
    );
  }

  const data = stop.data;
  const veilLifted = state !== "en_camino";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.ScrollView
        style={s.root}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Hero · 340pt region with editorial display chrome. The whole region
            parallaxes at half scroll speed (iOS-native feel). Inside, the
            display name fades + shrinks slightly to "rise into the nav" as
            the user scrolls. State indicator (lock/ring/sello) is pinned
            absolutely OUTSIDE this region so it survives any scroll position. */}
        {/* Hero · 340pt veiled region. Photo + rumbo wash + grain. The
            monumental stop name, folio, rumbo tag, and italic address now
            live BELOW the hero in the body composition (spec §7.3 pts 4-8).
            Masthead floats above, lock chip floats top-right. */}
        <Animated.View style={heroParallaxStyle}>
          <StopVeil accent={accent} lifted={veilLifted} height={340} atmosphereOverlay={typo.atmosphereOverlay} />
        </Animated.View>

        {/* Pinned controls · close (top-left) + state indicator (top-right).
            ABSOLUTE to the screen, NOT to the hero — they survive scroll. */}
        <View style={[s.heroOverlay, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
          <Pressable
            onPress={handleClose}
            hitSlop={12}
            style={s.closeBtn}
            accessibilityLabel="Volver a La Ruta"
            accessibilityRole="button"
          >
            <Feather name="chevron-left" size={22} color={Colors.textPrimary} />
          </Pressable>

          {/* Top-right: ring (state 2) → sello (state 3+).
              The "en_camino" lock chip is now rendered as a floating glass
              chip OUTSIDE the ScrollView so it sits above the GlassMasthead
              line · see end of file. */}
          {state === "en_camino" ? null : state === "llegada" ? (
            <View style={s.ringWrap}>
              <ProgressRing
                size={36}
                color={accent}
                durationMs={30_000}
                active
                onComplete={onRingComplete}
              />
            </View>
          ) : (
            <View style={[s.selloFinal, { borderColor: accent, backgroundColor: `${accent}22` }]}>
              <View style={[s.selloDot, { backgroundColor: accent }]} />
            </View>
          )}
        </View>

        {/* Body composition · spec §7.3 pts 4-8. Staggered reveal cascades in
            below the hero photo: folio (tracked caps) → rumbo tag pill →
            monumental Fraunces 44pt name with italic-accent punctuation →
            italic Newsreader address line → Despacho L1 card with rumbo
            kicker + drop cap. ONE rumbo accent across all of them — that's
            the saturation discipline. */}
        {(() => {
          const { body: nameBody, punct: namePunct } = splitStopName(data.name);
          const rumboSlug = rumbo?.slug;
          const rumboMeaning = rumbo?.meaning ?? "";
          const cardinalLabel = rumboSlug
            ? rumboSlug.charAt(0).toUpperCase() + rumboSlug.slice(1)
            : "";
          const rumboTagParts = rumbo
            ? [rumbo.nahuatl_name, cardinalLabel, rumboMeaning].filter(Boolean)
            : [];
          const rumboTagText = rumboTagParts.join(" · ");
          return (
            <View style={s.stopNameBlock}>
              <Animated.View
                entering={reducedMotion ? undefined : FadeInUp.duration(420).delay(200).easing(Easing.bezier(0.22, 1, 0.36, 1))}
              >
                <Text style={s.stopFolio}>{data.address.toUpperCase()}</Text>
              </Animated.View>
              {rumbo && rumboTagText ? (
                <Animated.View
                  entering={reducedMotion ? undefined : FadeInUp.duration(420).delay(300).easing(Easing.bezier(0.22, 1, 0.36, 1))}
                  style={s.rumboTag}
                >
                  <GlassChip tintColor={`${accent}30`} minHeight={28}>
                    <View style={[s.rumboSwatch, { backgroundColor: accent }]} />
                    <Text style={[s.rumboText, { color: accent }]}>{rumboTagText}</Text>
                  </GlassChip>
                </Animated.View>
              ) : null}
              <Animated.View
                entering={reducedMotion ? undefined : FadeInUp.duration(540).delay(400).easing(Easing.bezier(0.22, 1, 0.36, 1))}
              >
                <Text style={s.stopName}>
                  {nameBody}
                  <Text style={[s.stopNameAccent, { color: accent }]}>{namePunct}</Text>
                </Text>
              </Animated.View>
              {data.description ? (
                <Animated.View
                  entering={reducedMotion ? undefined : FadeInUp.duration(540).delay(500).easing(Easing.bezier(0.22, 1, 0.36, 1))}
                >
                  <Text style={s.stopAddressItalic}>{data.description}</Text>
                </Animated.View>
              ) : null}
            </View>
          );
        })()}

        {/* Despacho card · spec §7.3 pt 8. L1 surface with rumbo-colored 3pt
            left border + sanctioned `shadow.elevated`. Rumbo kicker + rumbo
            drop cap on the first letter. Only renders if despacho_text exists
            — no algorithmic placeholder per manifesto. */}
        {data.despacho_text ? (
          <Animated.View
            entering={reducedMotion ? undefined : FadeInUp.duration(540).delay(600).easing(Easing.bezier(0.22, 1, 0.36, 1))}
            style={[s.despachoCard, { borderLeftColor: accent }]}
          >
            <Text style={[s.cardLabel, { color: accent }]}>EL DESPACHO</Text>
            <Text style={[s.cardBody, { fontFamily: typo.bodyFontFamily, color: typo.bodyColor }]}>
              <Text style={[s.cardDropCap, { color: accent }]}>{data.despacho_text[0]}</Text>
              {data.despacho_text.slice(1)}
            </Text>
          </Animated.View>
        ) : null}

        {/* Apunte card · spec §7.3 pt 9. The EMOTIONAL PEAK of the screen.
            Reveals AFTER arrival (state !== "en_camino"), slide-up from below
            with a longer 800ms editorial easing — María's voice arriving in
            situ. SAME L1 surface + rumbo left-border + shadow.elevated as the
            Despacho card (DRY · reuses `s.despachoCard`), but spaced 12pt
            below and WITHOUT a drop cap — the Apunte is more intimate and
            shorter, a drop cap would overstate it. Reduced-motion follows the
            same `reducedMotion ? undefined : ...` pattern as every other
            entering animation on this screen. */}
        {state !== "en_camino" && visit.apunte_in_situ ? (
          <Animated.View
            entering={reducedMotion ? undefined : SlideInUp.duration(800).easing(Easing.bezier(0.22, 1, 0.36, 1))}
            style={[s.despachoCard, { borderLeftColor: accent, marginTop: 12 }]}
          >
            <Text style={[s.cardLabel, { color: accent }]}>EL APUNTE · IN SITU</Text>
            <Text style={[s.cardBody, { fontFamily: typo.bodyFontFamily, color: typo.bodyColor }]}>
              {visit.apunte_in_situ}
            </Text>
          </Animated.View>
        ) : null}

        <View style={s.body}>
          {/* Permission / distance feedback for state=en_camino */}
          {state === "en_camino" ? (
            <View style={s.geoBlock}>
              {visit.permission === "denied" ? (
                <Pressable onPress={visit.requestPermission} style={s.geoLink}>
                  <Text style={s.geoText}>
                    Para abrir el apunte XICO necesita saber que estás aquí. Concede ubicación.
                  </Text>
                </Pressable>
              ) : visit.distance_m != null && visit.distance_m > 50 ? (
                <Text style={s.geoText}>Te faltan ~{Math.round(visit.distance_m)}m hasta el sitio.</Text>
              ) : visit.permission === "unknown" || visit.permission === "granted" ? (
                <Text style={s.geoText}>Llega al sitio para abrir el apunte.</Text>
              ) : null}
            </View>
          ) : null}

          {/* Annotation block · visible during state=anotacion. Hides after the
              user explicitly saves OR dismisses. Dismiss DOES NOT exit the
              screen — user keeps reading the apunte + sello disc above. */}
          {(state === "anotacion" || annotationSubmitted) && !annotationDismissed && rumbo ? (
            <Animated.View
              entering={reducedMotion ? undefined : FadeInUp.duration(400)}
              style={s.annotationBlock}
            >
              {annotationSubmitted ? (
                <View accessibilityLiveRegion="polite" accessibilityRole="text">
                  <Text style={s.annotationDone}>Anotación guardada. El equipo la lee.</Text>
                </View>
              ) : (
                <>
                  <Text style={s.annotationLabel}>Una línea, opcional</Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Lo que viste, lo que se te quedó, lo que descartes el equipo lo guarda."
                    placeholderTextColor={Colors.textTertiary}
                    multiline
                    maxLength={280}
                    style={s.annotationInput}
                  />
                  <Text style={s.charCount}>{note.length} / 280</Text>
                  <View style={s.annotationActions}>
                    <Pressable
                      onPress={submitAnnotation}
                      disabled={!note.trim() || annotateMut.isPending}
                      style={[
                        s.annotationSave,
                        { borderColor: accent },
                        (!note.trim() || annotateMut.isPending) && { opacity: 0.5 },
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: !note.trim() || annotateMut.isPending, busy: annotateMut.isPending }}
                      accessibilityLabel={annotateMut.isPending ? "Guardando anotación" : "Guardar la anotación de una línea"}
                    >
                      {annotateMut.isPending ? (
                        <View style={s.annotationSaveBusy}>
                          <ActivityIndicator size="small" color={accent} />
                          <Text style={[s.annotationSaveText, { color: accent }]}>
                            Guardando…
                          </Text>
                        </View>
                      ) : (
                        <Text style={[s.annotationSaveText, { color: accent }]}>
                          Guardar · 1 línea
                        </Text>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={dismissAnnotation}
                      style={s.annotationSkip}
                      accessibilityRole="button"
                      accessibilityLabel="Cerrar el campo de anotación sin guardar"
                    >
                      <Text style={s.annotationSkipText}>Cerrar</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Animated.View>
          ) : null}
        </View>

        {/* Sello-earn wax-seal medallion · springs in center-screen, settles
            into the static top-right disc as the stamp completes. The glyph
            inside is the rumbo-specific Mayan glyph from the existing
            GlifoMaya catalog (mapped via Rumbos[slug].glyphId). */}
        {state === "sello_entregado" || state === "anotacion" ? (
          <Animated.View
            style={[s.glyphOverlay, glyphStyle]}
            pointerEvents="none"
            accessibilityLiveRegion="polite"
            accessibilityLabel={rumbo ? `Sello entregado · ${rumbo.nahuatl_name}` : "Sello entregado"}
          >
            {/* Wax-seal disc: rumbo accent at full saturation, hairline ring,
                grain to mimic the texture of wax pressed into paper. */}
            <View style={[s.waxSeal, { backgroundColor: accent }]}>
              <View style={[s.waxSealInner, { borderColor: `${accent}88` }]}>
                <GlifoMaya
                  id={rumbo && Rumbos[rumbo.slug as RumboSlug]
                    ? Rumbos[rumbo.slug as RumboSlug].glyphId
                    : "ruta"}
                  size={52}
                  color={Colors.textPrimary}
                  opacity={0.95}
                />
              </View>
            </View>
          </Animated.View>
        ) : null}
      </Animated.ScrollView>

      {/* Floating glass masthead · spec §7.3 point 2.
          The live-dot uses the stop's rumbo color (this stop IS a rumbo
          experience — not a generic accent). Total stops comes from
          useCurrentRuta (already fetched · React Query dedupes); falls
          back to "05" while the ruta data is in flight. */}
      <GlassMasthead
        label="XICO · LA RUTA · PARADA"
        meta={`${String(stop.data?.order_num ?? 0).padStart(2, "0")} / ${String(totalStops ?? 5).padStart(2, "0")}`}
        liveDotColor={accent}
      />

      {/* Floating glass lock chip · spec §7.3 point 3.
          Only while user has not arrived (state === "en_camino"). Shows
          live distance when geolocation has resolved one; otherwise the
          neutral "Apunte cerrado" alone keeps the editorial register.
          Reuses visit.distance_m · no new geolocation watch. */}
      {state === "en_camino" ? (
        <Animated.View
          entering={reducedMotion ? undefined : FadeIn.duration(400).delay(200)}
          style={[s.lockChipFloating, { top: Math.max(insets.top + 22, 81) + 38 + 10 }]}
          pointerEvents="none"
        >
          <GlassChip minHeight={32}>
            <Text style={s.lockChipFloatingText}>
              {visit.distance_m != null
                ? `Apunte cerrado · ${Math.round(visit.distance_m)}m`
                : "Apunte cerrado"}
            </Text>
          </GlassChip>
        </Animated.View>
      ) : null}

      {/* Tier-up overlay · stacks on top once unlocked */}
      {tierUpInfo ? (
        <TierUpOverlay info={tierUpInfo} accent={accent} onDismiss={() => setTierUpInfo(null)} />
      ) : null}
    </KeyboardAvoidingView>
  );
}

// ─── Tier-up overlay ────────────────────────────────────────────────────
function TierUpOverlay({ info, accent, onDismiss }: { info: { from: string; to: string }; accent: string; onDismiss: () => void }) {
  const reducedMotion = useReducedMotion();
  const TIER_ROMAN: Record<string, string> = {
    iniciado: "I",
    conocedor: "II",
    curador: "III",
    cronista: "IV",
  };
  const TIER_NAME: Record<string, string> = {
    iniciado: "Iniciado",
    conocedor: "Conocedor",
    curador: "Curador",
    cronista: "Cronista",
  };
  const TIER_NOTE: Record<string, string> = {
    conocedor:
      "Conocedor · llevas dos rumbos. La Ruta es tuya como práctica, no como tarea.",
    curador:
      "Curador · puedes reservar con 24h de prioridad en restaurantes Sello Copil.",
    cronista:
      "Cronista · estás en la última capa. Diciembre 2026: reunión presencial en Madrid.",
  };

  return (
    <Animated.View
      entering={reducedMotion ? undefined : FadeInUp.duration(600).easing(Easing.bezier(0.22, 1, 0.36, 1))}
      style={s.tierUpRoot}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Cerrar" />
      <View style={s.tierUpCard}>
        <View style={[s.tierUpAccent, { backgroundColor: accent }]} />
        <Text style={s.tierUpLabel}>Has alcanzado</Text>
        <Text style={s.tierUpRoman}>{TIER_ROMAN[info.to] ?? "·"}</Text>
        <Text style={s.tierUpName}>{TIER_NAME[info.to] ?? info.to}</Text>
        <Text style={s.tierUpNote}>{TIER_NOTE[info.to] ?? ""}</Text>
        <Pressable onPress={onDismiss} style={[s.tierUpClose, { borderColor: accent }]}>
          <Text style={[s.tierUpCloseText, { color: accent }]}>Continuar</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loadingText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
  },

  // Phase 9 cleanup · `heroContent` / `heroFolio` / `heroName` / `heroKicker`
  // were the old hero text styles for a chrome-on-photo composition that
  // Phase 3/4 replaced with the `stopNameBlock` + `stopName` system below.
  // Removed in Phase 9.

  // Pinned controls overlay · absolute to the screen, top of stack.
  // Stays put while the hero parallaxes underneath.
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Space.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  lockChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.xs,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: Hairline.thin,
    borderColor: Colors.borderMedium,
    backgroundColor: "rgba(8,5,8,0.5)",
  },
  lockChipText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
  // Floating glass lock chip · spec §7.3 point 3.
  // Top offset = masthead top (81pt minimum) + masthead height (38pt) + 10pt gap.
  // Right-aligned with the same 16pt horizontal margin as GlassMasthead.
  lockChipFloating: {
    position: "absolute",
    right: 16,
    zIndex: 4,
  },
  lockChipFloatingText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    color: Colors.textPrimary,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
  },
  ringWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  selloFinal: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  selloDot: { width: 10, height: 10, borderRadius: 5 },

  body: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.lg,
    gap: Space.md,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  orderNum: {
    fontFamily: Fonts.serifLight,
    fontSize: TypeSize.body,
    color: Colors.textTertiary,
    letterSpacing: Tracking.wider,
  },
  name: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.display,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
    lineHeight: TypeSize.display * 1.05,
  },
  address: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.caption,
    color: Colors.textTertiary,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
    marginTop: Space.xs,
  },

  // Phase 9 cleanup · `despachoBlock` / `despachoLabel` / `despachoText`
  // were the pre-Phase-4.2 plain-text despacho rendering. Phase 4.2 replaced
  // them with the `despachoCard` + `cardLabel` + `cardBody` + `cardDropCap`
  // system below. Removed in Phase 9.

  // Spec §7.3 pts 4-7 · body composition that sits below the hero veil.
  // Folio (tracked-caps) → rumbo tag pill → monumental Fraunces 44pt name
  // with italic-accent punctuation in rumbo color → italic Newsreader address.
  stopNameBlock: { paddingHorizontal: 20, paddingTop: Space.lg },
  stopFolio: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.65)",
    marginBottom: 5,
  },
  rumboTag: { flexDirection: "row", marginBottom: 14 },
  rumboSwatch: { width: 8, height: 8, borderRadius: 2 },
  rumboText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  stopName: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 44,
    lineHeight: 44 * 0.96,
    letterSpacing: -0.035 * 44,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  stopNameAccent: { fontFamily: "Fraunces_400Regular_Italic" },
  stopAddressItalic: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 13 * 1.35,
    color: "rgba(245,239,227,0.78)",
    marginBottom: 18,
  },

  // Spec §7.3 pt 8 · Despacho card. L1 surface, rumbo 3pt left border,
  // sanctioned `shadow.elevated` (the ONE shadow site on this screen per
  // brandbook §2 override). Rumbo kicker + drop cap echo the saturation
  // anchor without doubling it.
  despachoCard: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: "transparent", // overridden inline with rumbo color
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    // shadow.elevated · brandbook §2 floating-element recipe
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },
  cardLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardBody: {
    // Phase 9 (Task 9.2) · scaledFontSize on body so Dynamic Type users can
    // actually read the despacho/apunte content. lineHeight derives from the
    // scaled size so the rhythm stays proportional at any setting.
    fontFamily: "Newsreader_400Regular",
    fontSize: scaledFontSize(14),
    lineHeight: scaledFontSize(14) * 1.55,
    color: Colors.textSecondary,
  },
  cardDropCap: {
    fontFamily: "Fraunces_600SemiBold",
    fontSize: 34,
    lineHeight: 34 * 0.85,
  },

  geoBlock: {
    marginTop: Space.lg,
    paddingVertical: Space.md,
    paddingHorizontal: Space.md,
    borderWidth: Hairline.thin,
    borderColor: Colors.borderLight,
  },
  geoLink: {},
  geoText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textSecondary,
    lineHeight: TypeSize.meta * 1.5,
  },

  annotationBlock: {
    marginTop: Space.xl,
    paddingHorizontal: Space.md,
    paddingVertical: Space.lg,
    backgroundColor: Colors.surfaceHigh,
  },
  annotationDone: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  annotationLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
    marginBottom: Space.sm,
  },
  annotationInput: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.body,
    color: Colors.textPrimary,
    minHeight: 80,
    padding: Space.sm,
    backgroundColor: Colors.background,
    borderWidth: Hairline.thin,
    borderColor: Colors.borderLight,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    alignSelf: "flex-end",
    marginTop: Space.xs,
    letterSpacing: Tracking.wider,
  },
  annotationActions: {
    flexDirection: "row",
    gap: Space.md,
    marginTop: Space.md,
  },
  annotationSave: {
    flex: 1,
    paddingVertical: Space.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44, // touch-target-size · ui-ux-pro-max CRITICAL
  },
  annotationSaveBusy: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
  },
  annotationSaveText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.meta,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
  },
  annotationSkip: {
    flex: 1,
    paddingVertical: Space.md,
    alignItems: "center",
    borderBottomWidth: Hairline.thin,
    borderBottomColor: Colors.borderMedium,
  },
  annotationSkipText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textSecondary,
  },

  glyphOverlay: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  waxSeal: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    // Subtle elevation only for this moment — the only place we use shadow
    // in-flow on warm-dark, sanctioned by brandbook §2 ("Reserve shadows for
    // floating elements only"). The seal IS floating during the stamp.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,
  },
  waxSealInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,5,8,0.18)",
  },

  tierUpRoot: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,5,8,0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Space.lg,
  },
  tierUpCard: {
    backgroundColor: Colors.surfaceHigher,
    padding: Space.xl,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    gap: Space.md,
  },
  tierUpAccent: {
    height: 2,
    width: 48,
  },
  tierUpLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.small,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
    marginTop: Space.sm,
  },
  tierUpRoman: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.monumental,
    color: Colors.textPrimary,
    lineHeight: TypeSize.monumental * 0.95,
  },
  tierUpName: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.title,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  tierUpNote: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    lineHeight: TypeSize.body * 1.55,
    textAlign: "center",
    paddingHorizontal: Space.md,
    marginTop: Space.sm,
  },
  tierUpClose: {
    paddingVertical: Space.md,
    paddingHorizontal: Space.xl,
    borderWidth: 1.5,
    marginTop: Space.md,
  },
  tierUpCloseText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.meta,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
  },
});
