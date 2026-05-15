// LEGACY mi-xico.tsx replaced 2026-05-15 · Liquid Glass redesign Phase 3 · spec §7.4
// Phase 3 Task 3.2 · identity block (pre-line + Fraunces 42pt name with italic
// family-name in current-rumbo color) + tier badge GlassChip.
// Body sections (rosetón / stats / Carta) land in Tasks 3.3 + 3.4.
import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { GlassMasthead, ColorBleedBackdrop, GlassChip } from "@/components/liquid-glass";
import { RevealOnMount } from "@/components/editorial/RevealOnMount";
import { Colors, Pillars } from "@/constants/colors";
import { Rumbos, TIER_LABELS, type RumboSlug, type TierKey } from "@/constants/rumbos";
import { useTier } from "@/hooks/useTier";
import { useProfile } from "@/hooks/useProfile";

/**
 * Derive `{ first, family }` from a display name or, failing that, an email.
 * Examples:
 *   ("Mauricio Favela", _)             → { first: "Mauricio", family: "Favela" }
 *   ("Mauricio Favela Solano", _)      → { first: "Mauricio", family: "Favela Solano" }
 *   ("Mauricio", _)                    → { first: "Mauricio", family: "" }
 *   ("", "mauricio.favela@x.com")      → { first: "Mauricio", family: "Favela" }
 *   ("", "mauricio@x.com")             → { first: "Mauricio", family: "" }
 * The family slot may be empty — the JSX renders only the first name in that case.
 */
function deriveName(displayName: string | undefined, email: string | undefined): { first: string; family: string } {
  const cap = (s: string) => (s.length ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s);
  const trimmed = (displayName ?? "").trim();
  if (trimmed.length > 0) {
    const parts = trimmed.split(/\s+/);
    return { first: parts[0], family: parts.slice(1).join(" ") };
  }
  const local = (email ?? "").split("@")[0] ?? "";
  if (!local) return { first: "", family: "" };
  const chunks = local.split(/[._-]+/).filter(Boolean).map(cap);
  if (chunks.length === 0) return { first: "", family: "" };
  return { first: chunks[0], family: chunks.slice(1).join(" ") };
}

/**
 * Pick the user's current dominant rumbo: highest sello count, with a canonical
 * tiebreaker (este → sur → norte → oeste · sunrise → afternoon → memory → craft).
 * Iniciado users (0 sellos everywhere) default to `este` — Tlapallan pink,
 * the sunrise rumbo, the natural beginning per Mexica cosmology.
 */
const CANONICAL_TIEBREAK: RumboSlug[] = ["este", "sur", "norte", "oeste"];

function pickCurrentRumbo(byRumbo: Record<RumboSlug, number> | undefined): RumboSlug {
  if (!byRumbo) return "este";
  let best: RumboSlug = "este";
  let bestCount = -1;
  for (const slug of CANONICAL_TIEBREAK) {
    const c = byRumbo[slug] ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = slug;
    }
  }
  return best;
}

/**
 * Compose the tier-badge label. The API currently returns `memberSince` as a
 * year string only (e.g. "2026") — schema migration for a real `member_since_month`
 * is deferred to v1.2. Graceful degradation:
 *   - if memberSince year === current year, use current month name (covers new signups)
 *   - else use just the year (older accounts read "INICIADO · 2024" — still honest)
 * Localized to es-ES, uppercased per editorial chip style.
 */
function formatMemberSinceLabel(memberSinceYear: string | undefined): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const yearNum = Number(memberSinceYear);
  if (Number.isFinite(yearNum) && yearNum === currentYear) {
    const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(now);
    return `${month} ${yearNum}`.toUpperCase();
  }
  if (Number.isFinite(yearNum)) {
    return String(yearNum);
  }
  // Final fallback: current month + year
  const formatter = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });
  return formatter.format(now).toUpperCase();
}

export default function TuCodiceScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tier, isLoading: tierLoading } = useTier();

  const { first, family } = useMemo(
    () => deriveName(profile?.name, profile?.email),
    [profile?.name, profile?.email],
  );

  const currentRumbo = useMemo(
    () => pickCurrentRumbo(tier?.by_rumbo),
    [tier?.by_rumbo],
  );
  const currentRumboColor = Rumbos[currentRumbo].hex;

  const tierKey: TierKey = tier?.tier ?? "iniciado";
  const memberSinceLabel = useMemo(
    () => formatMemberSinceLabel(profile?.memberSince),
    [profile?.memberSince],
  );

  const showIdentity = !!profile && !profileLoading;

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* PHOTO SLOT · golden-hour Madrid · drops in via assets/images/tu-codice-backdrop.jpg */}
      {/* Until the photo lands, a vertical gradient fallback so the screen reads intentional, not broken */}
      <LinearGradient
        colors={[Colors.background, Pillars.archivo + "33"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.backdrop}
      />
      <View style={styles.backdropOverlay} />

      {/* Three-radial color bleed · tier-driven via useColorBleed; pillar accent = Archivo verde */}
      <ColorBleedBackdrop pillarColor={Pillars.archivo} style={styles.bleedOverlay} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 7.4 pt 5-7 · Identity block + tier badge */}
        {showIdentity && (
          <View style={styles.identityBlock}>
            <RevealOnMount index={0} delay={300} step={200} duration={700}>
              <Text style={styles.preLine}>El códice de</Text>
            </RevealOnMount>

            <RevealOnMount index={1} delay={300} step={200} duration={700}>
              <Text style={styles.nameDisplay}>
                {first}
                {family ? (
                  <>
                    {" "}
                    <Text style={[styles.nameItalic, { color: currentRumboColor }]}>{family}</Text>
                  </>
                ) : null}
              </Text>
            </RevealOnMount>

            <RevealOnMount index={2} delay={300} step={200} duration={700}>
              <View style={styles.tierBadgeRow}>
                <GlassChip tintColor={`${Rumbos.center.hex}30`}>
                  <View style={[styles.tierGlyph, { backgroundColor: Rumbos.center.hex }]} />
                  <Text style={styles.tierBadgeText}>
                    {`${TIER_LABELS[tierKey].toUpperCase()} · ${memberSinceLabel}`}
                  </Text>
                </GlassChip>
              </View>
            </RevealOnMount>
          </View>
        )}

        {/* 3.3 · rosetón + halo pulse */}
        {/* 3.4 · stats row + Carta del Equipo */}
      </ScrollView>

      <GlassMasthead
        label="XICO · TU CÓDICE"
        meta="FOLIO #1"
        liveDotColor={Rumbos.center.hex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backdropOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(8,5,8,0.7)",
    zIndex: 0,
  },
  bleedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  identityBlock: {
    marginBottom: 22,
  },
  preLine: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 15,
    color: Colors.textSecondary,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
    marginBottom: 4,
  },
  nameDisplay: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: -0.035 * 42,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowRadius: 12,
    textShadowOffset: { width: 0, height: 2 },
    marginBottom: 12,
  },
  nameItalic: {
    fontFamily: "Fraunces_400Regular_Italic",
    // color set inline · data-driven by current rumbo
  },
  tierBadgeRow: {
    flexDirection: "row",
  },
  tierGlyph: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tierBadgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: Colors.textPrimary,
  },
});
