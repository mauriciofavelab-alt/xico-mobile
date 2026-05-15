import React, { useMemo } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Pillars } from "@/constants/colors";
import { Fonts, Space, Tracking, TypeSize } from "@/constants/editorial";
import { RevealOnMount } from "@/components/editorial";
import { GlassMasthead } from "@/components/liquid-glass";
import { Roseton } from "@/components/pasaporte/Roseton";
import { StopCardFeatured } from "@/components/ruta/StopCardFeatured";
import { StopCardCompact } from "@/components/ruta/StopCardCompact";
import { useCurrentRuta, type RutaStopLite } from "@/hooks/useCurrentRuta";
import { useTier } from "@/hooks/useTier";
import { useSellos, type SelloRecord } from "@/hooks/useSellos";
import { useTypographyMode } from "@/hooks/useTypographyMode";
import type { RumboSlug } from "@/constants/rumbos";

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

      <ScrollView
        contentContainerStyle={{
          // GlassMasthead floats absolutely at top: 81pt (or insets.top+22)
          // with height 38 + 10pt breathing room before content; the hero
          // must clear it. 81 + 38 + 16 ≈ 135 + insets.top adjustment.
          paddingTop: 140,
          paddingHorizontal: Space.lg,
          paddingBottom: bottomPad,
        }}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>

      {/* Floating glass masthead · spec §7.2 pt 1. Live dot = Pillars.indice
          (magenta) because La Ruta lives under the Indice ritual surface —
          this is the screen-level pillar anchor that unifies the spread.
          Per-card rumbo accents (different colors for each card) are the
          second saturation layer; they live inside the cards, not on chrome. */}
      <GlassMasthead
        label={formatWeekLabel(ruta.data?.week_key ?? null)}
        meta={ruta.data?.week_key === "2026-W19" ? "INAUGURAL" : undefined}
        liveDotColor={Pillars.indice}
      />
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
});
