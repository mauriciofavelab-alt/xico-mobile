import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  FadeInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";
import { Rumbos, type RumboSlug } from "@/constants/rumbos";
import { ByLine, Kicker, RevealOnMount } from "@/components/editorial";
import { ProgressRing } from "@/components/ruta/ProgressRing";
import { StopVeil } from "@/components/ruta/StopVeil";
import { fetchJson, API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";
import { useVisitToken } from "@/hooks/useVisitToken";
import { useSelloMutation, type SelloEarnResult } from "@/hooks/useSelloMutation";

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

type RumboLite = { id: string; slug: RumboSlug; nahuatl_name: string; color_hex: string };

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

  // ─── Animations: glyph flash on state=sello_entregado ──────────────────
  const glyphScale = useSharedValue(0.4);
  const glyphOpacity = useSharedValue(0);

  useEffect(() => {
    if (state !== "sello_entregado") return;
    if (reducedMotion) {
      glyphOpacity.value = 1;
      glyphScale.value = 1;
      return;
    }
    glyphOpacity.value = withSequence(
      withTiming(1, { duration: 200, easing: Easing.bezier(0.22, 1, 0.36, 1) }),
      withDelay(900, withTiming(0, { duration: 300 })),
    );
    glyphScale.value = withTiming(1.05, { duration: 800, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, [state, glyphOpacity, glyphScale, reducedMotion]);

  const glyphStyle = useAnimatedStyle(() => ({
    opacity: glyphOpacity.value,
    transform: [{ scale: glyphScale.value }],
  }));

  // ─── Annotation submission ─────────────────────────────────────────────
  const annotateMut = useMutation({
    mutationFn: postAnnotation,
    onSuccess: () => setAnnotationSubmitted(true),
  });

  const submitAnnotation = useCallback(() => {
    if (!stopId || !note.trim()) return;
    annotateMut.mutate({ ruta_stop_id: stopId, text: note.trim() });
  }, [stopId, note, annotateMut]);

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
      <ScrollView
        style={s.root}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero · always shown; veil controls visibility */}
        <StopVeil accent={accent} lifted={veilLifted} height={280}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.surfaceHigh }]} />
        </StopVeil>

        {/* Close button + ring indicator overlay */}
        <View style={[s.heroOverlay, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/ruta" as any))}
            hitSlop={12}
            style={s.closeBtn}
            accessibilityLabel="Volver a La Ruta"
            accessibilityRole="button"
          >
            <Feather name="chevron-left" size={22} color={Colors.textPrimary} />
          </Pressable>

          {/* Top-right: lock chip (state 1) → ring (state 2) → sello (state 3+) */}
          {state === "en_camino" ? (
            <View style={s.lockChip}>
              <Feather name="lock" size={11} color={Colors.textTertiary} />
              <Text style={s.lockChipText}>Apunte cerrado</Text>
            </View>
          ) : state === "llegada" ? (
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

        <View style={s.body}>
          {/* Order + rumbo line */}
          <View style={s.headerRow}>
            <Text style={s.orderNum}>
              {String(data.order_num ?? 0).padStart(2, "0")} / {/* total filled by parent on /ruta */}
            </Text>
            {rumbo ? <Kicker color={accent}>{rumbo.nahuatl_name}</Kicker> : null}
          </View>

          <Text style={s.name}>{data.name}</Text>
          <Text style={s.address}>{data.address}</Text>

          {/* Despacho · always rendered */}
          {data.despacho_text ? (
            <View style={s.despachoBlock}>
              <Text style={s.despachoLabel}>El despacho</Text>
              <Text style={s.despachoText}>{data.despacho_text}</Text>
            </View>
          ) : null}

          {/* Apunte in situ · revealed when visit-token arrives */}
          {state !== "en_camino" && visit.apunte_in_situ ? (
            <Animated.View
              entering={reducedMotion ? undefined : FadeInUp.duration(600).easing(Easing.bezier(0.22, 1, 0.36, 1))}
              style={s.apunteBlock}
            >
              <View style={[s.apunteAccent, { backgroundColor: accent }]} />
              <Text style={s.apunteLabel}>El apunte · in situ</Text>
              <Text style={s.apunteText}>{visit.apunte_in_situ}</Text>
            </Animated.View>
          ) : null}

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

          {/* Annotation input · state=anotacion */}
          {(state === "anotacion" || annotationSubmitted) && rumbo ? (
            <Animated.View
              entering={reducedMotion ? undefined : FadeInUp.duration(400)}
              style={s.annotationBlock}
            >
              {annotationSubmitted ? (
                <View>
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
                    >
                      <Text style={[s.annotationSaveText, { color: accent }]}>
                        Guardar · 1 línea
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => router.back()}
                      style={s.annotationSkip}
                      accessibilityRole="button"
                    >
                      <Text style={s.annotationSkipText}>Sigo · sin anotar</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </Animated.View>
          ) : null}
        </View>

        {/* Sello-earn glyph flash overlay · only visible briefly on state=sello_entregado */}
        {state === "sello_entregado" || state === "anotacion" ? (
          <Animated.View
            style={[s.glyphOverlay, glyphStyle]}
            pointerEvents="none"
          >
            <View style={[s.glyphRing, { borderColor: accent }]}>
              <View style={[s.glyphDot, { backgroundColor: accent }]} />
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

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

  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
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

  despachoBlock: { marginTop: Space.lg, gap: Space.sm },
  despachoLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
  despachoText: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.body,
    color: Colors.textPrimary,
    lineHeight: TypeSize.body * 1.65,
  },

  apunteBlock: {
    marginTop: Space.xl,
    paddingTop: Space.lg,
    paddingHorizontal: Space.md,
    paddingBottom: Space.lg,
    backgroundColor: Colors.surface,
    position: "relative",
  },
  apunteAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    right: 0,
  },
  apunteLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
    marginBottom: Space.sm,
  },
  apunteText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body + 1,
    color: Colors.textPrimary,
    lineHeight: (TypeSize.body + 1) * 1.7,
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
    top: 140,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
