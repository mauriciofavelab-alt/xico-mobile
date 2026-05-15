// LEGACY mi-xico.tsx replaced 2026-05-15 · Liquid Glass redesign Phase 3 · spec §7.4
// Phase 3 Task 3.2 · identity block (pre-line + Fraunces 42pt name with italic
// family-name in current-rumbo color) + tier badge GlassChip.
// Phase 3 Task 3.3 · hero rosetón (220pt, lifetime mode, withDropShadows)
// wrapped in HaloPulse using the user's two dominant rumbo colors.
// Phase 3 Task 3.4 · stats row (sellos · guardados) in GlassCard +
// Carta del Equipo glass-vibrant card with gold-accented drop cap.
import React, { useCallback, useMemo, useState } from "react";
import { Image, Pressable, RefreshControl, View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

// Tu Códice golden-hour Madrid backdrop · Build #11 photo program.
// Lives at `assets/lugares/_backdrop-tu-codice.jpg`. Metro statically
// resolves this require() at bundle time; the file ships once with the
// app, no network fetch on render.
const TU_CODICE_BACKDROP = require("@/assets/lugares/_backdrop-tu-codice.jpg");

import { GlassMasthead, ColorBleedBackdrop, GlassChip, HaloPulse, GlassCard, GlassVibrant } from "@/components/liquid-glass";
import { RevealOnMount } from "@/components/editorial/RevealOnMount";
import { Roseton } from "@/components/pasaporte";
import { Colors, Pillars } from "@/constants/colors";
import { Rumbos, TIER_LABELS, type RumboSlug, type TierKey } from "@/constants/rumbos";
import { useTier } from "@/hooks/useTier";
import { useProfile } from "@/hooks/useProfile";
import { useGuardados } from "@/hooks/useGuardados";
import { useEditorLetter } from "@/hooks/useEditorLetter";
import { scaledFontSize } from "@/constants/editorial";

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

/**
 * Gold fallback accent for the Carta del Equipo card per spec §7.4 pt 10.
 * The editor's own `accent_color` wins when it parses as a valid `#RRGGBB`;
 * otherwise we render the brandbook gold (`#D4A030`) — Coyoacán kitchen ochre
 * light variant — which is XICO's editorial gold across the system.
 */
const CARTA_FALLBACK_GOLD = "#D4A030";

function isValidHex(c: string | undefined | null): c is string {
  return !!c && /^#[0-9a-f]{6}$/i.test(c.trim());
}

export default function TuCodiceScreen() {
  const insets = useSafeAreaInsets();
  const profileQ = useProfile();
  const tierQ = useTier();
  const guardadosQ = useGuardados();
  const { data: profile, isLoading: profileLoading } = profileQ;
  const { data: tier, isLoading: tierLoading } = tierQ;
  const { data: guardados } = guardadosQ;

  // The editor letter is interest-keyed on the server (NOT week-keyed, as the
  // plan draft assumed). Use the user's first selected interest as the lookup
  // key. If they have no interests, the hook short-circuits and returns
  // undefined — the Carta block then hides per manifesto rule (no algorithmic
  // placeholder copy).
  const primaryInterest = profile?.interests?.[0];
  const editorLetterQ = useEditorLetter(primaryInterest);
  const { data: editorLetter } = editorLetterQ;

  // Scroll-driven masthead blur (Apple-patterns §4.7) · chrome thickens
  // as content scrolls underneath. UI-thread worklet via Reanimated.
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // Pull-to-refresh (Apple-patterns §4.5) · refetches the four hooks that
  // back this screen. Tint = archivo-verde (Tu Códice's pillar accent), the
  // canonical chromatic moment for this surface.
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        profileQ.refetch(),
        tierQ.refetch(),
        guardadosQ.refetch(),
        editorLetterQ.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [profileQ, tierQ, guardadosQ, editorLetterQ]);

  const { first, family } = useMemo(
    () => deriveName(profile?.name, profile?.email),
    [profile?.name, profile?.email],
  );

  const currentRumbo = useMemo(
    () => pickCurrentRumbo(tier?.by_rumbo),
    [tier?.by_rumbo],
  );
  const currentRumboColor = Rumbos[currentRumbo].hex;

  /**
   * Two dominant rumbos for the halo pulse · primary + secondary, sorted by
   * sello count with the canonical este→sur→norte→oeste tiebreaker. For an
   * Iniciado user with 0 sellos everywhere the order falls through to the
   * tiebreaker order — primary=este (Tlapallan pink), secondary=sur
   * (Huitzlampa cobalt) — the warmest opening signature for a new account.
   * Alpha suffixes: `38` ≈ 22% (primary), `1F` ≈ 12% (secondary). Soft,
   * atmospheric pulse — NOT theatrical. Saturation discipline preserved.
   */
  const [haloPrimaryHex, haloSecondaryHex] = useMemo(() => {
    const byRumbo = tier?.by_rumbo;
    const ranked = [...CANONICAL_TIEBREAK]
      .map((slug) => ({ slug, count: byRumbo?.[slug] ?? 0 }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return CANONICAL_TIEBREAK.indexOf(a.slug) - CANONICAL_TIEBREAK.indexOf(b.slug);
      });
    return [Rumbos[ranked[0].slug].hex, Rumbos[ranked[1].slug].hex];
  }, [tier?.by_rumbo]);
  const haloPrimary = `${haloPrimaryHex}38`;
  const haloSecondary = `${haloSecondaryHex}1F`;

  const tierKey: TierKey = tier?.tier ?? "iniciado";
  const memberSinceLabel = useMemo(
    () => formatMemberSinceLabel(profile?.memberSince),
    [profile?.memberSince],
  );

  /**
   * Carta del Equipo · letter body with seed-data `{interest}` placeholder
   * substituted to the user's matched interest. Per seed.sql comment line 506,
   * `{interest}` is the only placeholder used in v1.1 templates. We do a
   * case-insensitive replace so future copy editors can write `{Interest}` or
   * `{INTEREST}` without breaking rendering.
   */
  const letterText = useMemo(() => {
    if (!editorLetter) return "";
    return editorLetter.message_template.replace(/\{interest\}/gi, editorLetter.interest_match);
  }, [editorLetter]);

  /**
   * Carta drop-cap + label accent. The editor's `accent_color` wins when
   * present and parseable; brandbook gold `#D4A030` is the fallback per
   * spec §7.4 pt 10. The accent appears on the kicker label AND the drop
   * cap — saturation discipline is preserved because both chromatic moments
   * sit inside the same vibrant card (counted as one editorial accent).
   */
  const cartaAccent = useMemo(() => {
    return isValidHex(editorLetter?.accent_color) ? editorLetter!.accent_color : CARTA_FALLBACK_GOLD;
  }, [editorLetter]);

  const showIdentity = !!profile && !profileLoading;

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* Golden-hour Madrid backdrop · spec §7.4 photo slot. The image is
          the BASE layer; the dark overlay below + ColorBleed stack on top so
          the warm-dark editorial register reads through the photograph. */}
      <Image
        source={TU_CODICE_BACKDROP}
        style={styles.backdrop}
        resizeMode="cover"
        accessible={false}
        accessibilityIgnoresInvertColors
      />
      <View style={styles.backdropOverlay} />

      {/* Three-radial color bleed · tier-driven via useColorBleed; pillar accent = Archivo verde */}
      <ColorBleedBackdrop pillarColor={Pillars.archivo} style={styles.bleedOverlay} />

      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Pillars.archivo}
            colors={[Pillars.archivo]}
          />
        }
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

        {/* 7.4 pt 8 · Hero rosetón (220pt, lifetime mode) wrapped in halo
            pulse using the user's two dominant rumbo colors. RevealOnMount
            index=3 lands the rosetón last in the cascade — the user reads
            their name, tier, then the codex blooms in. */}
        <RevealOnMount index={3} delay={300} step={200} duration={700}>
          <View style={styles.rosetonHero}>
            <HaloPulse primaryColor={haloPrimary} secondaryColor={haloSecondary}>
              <Roseton
                size={220}
                byRumbo={tier?.by_rumbo ?? { norte: 0, este: 0, sur: 0, oeste: 0 }}
                tier={tier?.tier ?? "iniciado"}
                totalSellos={tier?.total ?? 0}
                withDropShadows
              />
            </HaloPulse>
          </View>
        </RevealOnMount>

        {/* 7.4 pt 9 · Glass-deep stats row · sellos + guardados.
            Spec calls for THREE stats (sellos · guardados · leídos) but
            `articles_read` is not in the API or ProfileState yet — the
            schema/API addition is deferred to v1.2 per Phase 3 scope.
            Faking the count would violate the manifesto ("curated, not
            algorithmic") so we ship two columns and add the third when
            the backend lands. RevealOnMount index 4 · 1100ms beat. */}
        <RevealOnMount index={4} delay={300} step={200} duration={700}>
          <GlassCard style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{tier?.total ?? 0}</Text>
              <Text style={styles.statLabel}>sellos</Text>
            </View>
            <View style={styles.statSeparator} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>{guardados?.length ?? 0}</Text>
              <Text style={styles.statLabel}>guardados</Text>
            </View>
          </GlassCard>
        </RevealOnMount>

        {/* 7.4 pt 10-11 · Glass-vibrant Carta del Equipo. Only renders when
            an editor letter is matched to the user's primary interest — the
            manifesto's "curated not algorithmic" rule forbids a fallback
            placeholder letter, so the screen reads as intentional (rosetón +
            stats as a complete experience) when there is no curation.
            v1.1 drop cap = oversized inline first character (React Native
            constraint · no true hanging-initial typography). The cap reads
            as a magazine pull-cap, which preserves the editorial feel.
            RevealOnMount index 5 · 1300ms beat — last in the cascade so the
            user reads the rosetón and stats first, then the editor's voice. */}
        {editorLetter && letterText.length > 0 && (
          <RevealOnMount index={5} delay={300} step={200} duration={700}>
            <GlassVibrant style={styles.cartaCard}>
              <Text style={[styles.cartaLabel, { color: cartaAccent }]}>
                CARTA DEL EQUIPO
              </Text>
              <Text style={styles.cartaBody}>
                <Text style={[styles.cartaDropCap, { color: cartaAccent }]}>
                  {letterText.charAt(0)}
                </Text>
                {letterText.slice(1)}
              </Text>
              <Text style={styles.cartaByline}>
                {`— ${editorLetter.editor_name} · ${editorLetter.editor_role.toLowerCase()}`}
              </Text>
            </GlassVibrant>
          </RevealOnMount>
        )}

        {/* Ver introducción · re-runnable walkthrough entry point. 2026-05-15.
            The walkthrough reads `?from=settings` and switches into re-run mode:
            step 5 (interests · already saved) is skipped 4→6, and step 6
            "Cerrar" closes via router.back() without clobbering the existing
            onboarding flag or PATCHing Supabase. Italic Newsreader matches
            the créditos footer treatment below · auxiliary navigation, not a
            CTA. */}
        <RevealOnMount index={6} delay={300} step={200} duration={700}>
          <Pressable
            onPress={() => router.push("/onboarding?from=settings" as any)}
            accessibilityRole="link"
            accessibilityLabel="Ver la introducción otra vez"
            style={({ pressed }) => [styles.creditsLink, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <Text style={styles.creditsLinkText}>
              Ver introducción otra vez →
            </Text>
          </Pressable>
        </RevealOnMount>

        {/* Créditos link · CC BY-SA attribution surface required by ADR-003 +
            photo-sourcing-plan. Lives at the foot of Tu Códice as the natural
            "settings / pasaporte personal" location. Single italic line —
            no chrome button — keeps the editorial register and matches the
            footer treatment of magazines that credit their photographers in
            small italics at the back. Per the spec scope note this Pressable
            is intentionally NOT swapped to SpringPressable — the footer link
            reads as auxiliary navigation, and a spring/haptic would over-
            promote it. Plain opacity-fade is the editorial register here. */}
        <RevealOnMount index={7} delay={300} step={200} duration={700}>
          <Pressable
            onPress={() => router.push("/credits" as any)}
            accessibilityRole="link"
            accessibilityLabel="Ver créditos · fotografía y licencias"
            style={({ pressed }) => [styles.creditsLink, pressed && { opacity: 0.6 }]}
            hitSlop={8}
          >
            <Text style={styles.creditsLinkText}>
              Créditos · fotografía y licencias →
            </Text>
          </Pressable>
        </RevealOnMount>
      </Animated.ScrollView>

      <GlassMasthead
        label="XICO · TU CÓDICE"
        meta="FOLIO #1"
        liveDotColor={Rumbos.center.hex}
        scrollY={scrollY}
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
  rosetonHero: {
    alignItems: "center",
    marginVertical: 8,
    marginBottom: 24,
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

  // 7.4 pt 9 · Glass-deep stats row. Hairline vertical separator between
  // columns (brandbook §2: hairline > shadow). Fraunces numerals with subtle
  // text shadow so they stay readable over the backdrop + bleed.
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 22,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.015 * 32,
    color: Colors.textPrimary,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 6,
  },
  statLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.55)",
    marginTop: 6,
  },
  statSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: "rgba(245,239,227,0.18)",
  },

  // 7.4 pt 10-11 · Glass-vibrant Carta del Equipo. The card's only chromatic
  // moment is the gold (or editor accent) on the kicker + drop cap.
  // Body text is Newsreader regular for editorial-letter intimacy. Byline is
  // italic Newsreader, smaller, secondary text color.
  cartaCard: {
    marginBottom: 32,
  },
  cartaLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    // color set inline · editor accent or fallback gold #D4A030
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 3,
    marginBottom: 12,
  },
  cartaBody: {
    // Phase 9 (Task 9.2) · Carta del Equipo is body the reader reads. Scale
    // it to the user's Dynamic Type setting; keep the drop-cap and byline
    // fixed (design + chrome respectively).
    fontFamily: "Newsreader_400Regular",
    fontSize: scaledFontSize(15),
    lineHeight: scaledFontSize(15) * 1.55,
    color: Colors.textPrimary,
  },
  cartaDropCap: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 48,
    lineHeight: 48,
    letterSpacing: -0.04 * 48,
    // color set inline · matches kicker accent
  },
  cartaByline: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 14,
  },

  // Créditos footer link · italic Newsreader at body-meta scale. Single line,
  // tinted secondary so it reads as auxiliary navigation, not a CTA.
  creditsLink: {
    marginTop: 8,
    paddingVertical: 12,
    minHeight: 44, // touch target
    justifyContent: "center",
  },
  creditsLinkText: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 13,
    color: "rgba(245,239,227,0.55)",
    letterSpacing: 0.2,
  },
});
