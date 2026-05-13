import React, { useMemo } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/colors";
import { Fonts, Space, Tracking, TypeSize } from "@/constants/editorial";
import { ByLine, Masthead, Rule, Standfirst, RevealOnMount } from "@/components/editorial";
import { StopCard } from "@/components/ruta/StopCard";
import { useCurrentRuta, type RutaStopLite } from "@/hooks/useCurrentRuta";
import { useTier } from "@/hooks/useTier";
import type { RumboSlug } from "@/constants/rumbos";

/**
 * La Ruta de la semana · /ruta
 *
 * Reads from GET /api/ruta/current. Lists stops vertically with rumbo accent
 * stripe, folio number, name, address, 1-line tease (truncated despacho_text).
 * Completed stops show a rumbo-colored sello in the right margin.
 *
 * Stop tap → /ruta/stop/[id] (Week 3 Task 4).
 */

function formatWeekLabel(week_key: string | null): string {
  if (!week_key) return "La Ruta";
  // 'YYYY-WW' → 'Semana WW'
  const match = week_key.match(/^\d{4}-W(\d{1,2})$/i);
  return match ? `La Ruta · Semana ${match[1]}` : `La Ruta · ${week_key}`;
}

function formatPublishedDate(iso: string | null): string | undefined {
  if (!iso) return undefined;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return undefined;
  }
}

export default function RutaIndex() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 24 : insets.top + 12;
  const bottomPad = Platform.OS === "web" ? 24 : insets.bottom + 24;

  const ruta = useCurrentRuta();
  const tier = useTier();

  // Build a set of earned stop_ids so each StopCard knows whether to show sello
  const earnedStopIds = useMemo<Set<string>>(() => {
    // sellos list comes from /api/sellos-rumbo, not /api/profile/tier. For v1,
    // we infer earned-ness from by_rumbo counts ≠ 0 — not stop-precise but
    // visually adequate until we wire useSellosRumbo. Replace in Week 3 Task 3.
    return new Set();
  }, []);

  const totalStops = ruta.data?.stops.length ?? 0;
  const earnedCount = earnedStopIds.size;

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      {/* Back / close affordance · top-left */}
      <Pressable
        onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
        style={s.closeBtn}
        hitSlop={12}
        accessibilityLabel="Volver"
        accessibilityRole="button"
      >
        <Feather name="chevron-left" size={22} color={Colors.textSecondary} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Space.lg, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        <RevealOnMount index={0}>
          <Masthead
            title={formatWeekLabel(ruta.data?.week_key ?? null)}
            status="Madrid"
            date={formatPublishedDate(ruta.data?.published_at ?? null) ?? "—"}
            volume={ruta.data?.week_key?.split("-")[0]?.slice(-2)}
            issue={ruta.data?.week_key?.match(/W(\d+)/i)?.[1]}
          />
        </RevealOnMount>

        {ruta.isLoading ? (
          <View style={s.loading}>
            <ActivityIndicator color={Colors.textSecondary} />
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
            <RevealOnMount index={1}>
              <View style={{ marginTop: Space.lg }}>
                <Standfirst>{ruta.data.subtitle}</Standfirst>
              </View>
            </RevealOnMount>

            <RevealOnMount index={2}>
              <View style={{ marginTop: Space.lg, marginBottom: Space.xl }}>
                <ByLine
                  author={ruta.data.editor_name ?? "Equipo XICO"}
                  date={ruta.data.month ?? formatPublishedDate(ruta.data.published_at)}
                  readTime={`${totalStops} paradas`}
                />
              </View>
            </RevealOnMount>

            {/* Progress strip — non-coercive: just states the fact */}
            {tier.data && earnedCount > 0 ? (
              <RevealOnMount index={3}>
                <View style={s.progressStrip}>
                  <Text style={s.progressText}>
                    Llevas {earnedCount} de {totalStops} sellos en esta Ruta.
                  </Text>
                </View>
              </RevealOnMount>
            ) : null}

            <Rule />

            {/* Stops · vertical list */}
            <View style={{ marginTop: Space.lg, gap: 0 }}>
              {ruta.data.stops.map((stop: RutaStopLite, i: number) => (
                <RevealOnMount key={stop.id} index={4 + i}>
                  <StopCard
                    index={stop.order ?? i + 1}
                    total={totalStops}
                    name={stop.name}
                    address={stop.address}
                    tease={stop.despacho_text ?? stop.description ?? ""}
                    rumboSlug={(stop.rumbo?.slug as RumboSlug | undefined) ?? null}
                    earned={earnedStopIds.has(stop.id)}
                    onPress={() => router.push(`/ruta/stop/${stop.id}` as any)}
                  />
                </RevealOnMount>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  progressStrip: {
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    backgroundColor: Colors.surfaceHigh,
    marginVertical: Space.md,
  },
  progressText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textSecondary,
    letterSpacing: Tracking.tight,
  },
});
