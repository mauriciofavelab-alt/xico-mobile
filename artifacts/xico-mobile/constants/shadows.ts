// Apple-grade shadow tokens for XICO · 2026-05-15
//
// Rationale: brandbook §2 says "hairline > shadow" as a DEFAULT for in-flow
// cards on warm-dark. The Apple-patterns diagnostic (see
// `.claude/diagnostic-apple-patterns.md` §Category 1) reconciles that rule
// with the user's "filled with shadows" directive: Apple uses shadows everywhere
// but at a disciplined visual recipe. We adopt that vocabulary on:
//
//   - floating chrome (masthead, tab bar, sheets, modals, FABs) → `chromeFloat`
//   - in-flow lift cards (article cards, despacho card, etc.)   → `cardLift`
//   - color-themed accent halos (rosetón hero, CTA glow)        → `glow` + override shadowColor
//
// In-flow cards with a left-border accent (the editorial rumbo/pillar signature
// on /hoy + Stop screen + Ruta listing) intentionally do NOT spread `cardLift`
// — the left-border is the editorial moment and the card stays flat in flow.
// The featured/compact stop cards already opt-in to the elevated recipe per
// ADR-002 + Phase 4.2 sanction; this file gives a single source of truth so
// future surfaces stay consistent.
//
// iOS-only shadows render natively via `shadowColor` + `shadowOffset` +
// `shadowOpacity` + `shadowRadius`. Android falls back to `elevation` (no
// color tinting · no offset control). XICO is iOS-first; Android renders the
// app but the chromatic shadow tints are an iOS-exclusive moment.

import type { ViewStyle } from "react-native";

export const Shadow = {
  /**
   * In-flow card lift · the subtle suspension Apple News uses on its Today
   * cards. ~6pt lift, 18pt soft halo, 18% opacity. Reads as "this card sits
   * on the canvas, just barely above it" — never as a chunky drop shadow.
   *
   * Apply to: GlassCard, StopCardFeatured, StopCardCompact, despacho cards
   * that DON'T have a left-border editorial accent (the left-border is the
   * signature for those; doubling with a card lift would be too loud).
   */
  cardLift: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  } satisfies ViewStyle,

  /**
   * Floating chrome · masthead, tab bar, modals. Wider blur (24pt), larger
   * y-offset (8pt), 32% opacity. Reads as "this surface floats ABOVE the
   * scrolling content beneath it" — the wider blur is the signal. Pair this
   * with a 0.5pt inset white hairline on the top edge to fake Apple's
   * "inset highlight" trick that catches ambient light.
   *
   * Apply to: GlassMasthead, GlassTabBar, ChromeTabBar (delegates to GlassTabBar).
   */
  chromeFloat: {
    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  } satisfies ViewStyle,

  /**
   * Color-themed glow · for hero accents (rosetón petals, active CTAs, tier
   * badge). Spread inline ALONGSIDE `shadowColor: <accent>` so the glow
   * inherits the accent color. No y-offset · the glow is symmetric, centered
   * on the element, with 55% opacity at 16pt radius.
   *
   * iOS-only · Android `elevation` doesn't tint, so the glow appears as a
   * plain shadow on Android. That's acceptable since XICO is iOS-first.
   *
   * Apply to: Rosetón hero filled petals (rumbo color), Empezar La Ruta CTA
   * (Pillars.indice magenta), tier badge, etc.
   */
  glow: {
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    // shadowColor MUST be overridden at the call-site with the accent hex.
  } satisfies ViewStyle,
} as const;

/**
 * Apple's inset-highlight trick · a 0.5pt top hairline at 18% white catches
 * ambient light against the glass surface, giving the chrome dimension above
 * the dark canvas. RN doesn't support inset shadows directly; we fake it with
 * a borderTopWidth on the chrome's outer container.
 *
 * Spread alongside the chrome's existing borderWidth/borderColor (these are
 * mostly hairline-wide already · the inset highlight sits ON TOP).
 */
export const InsetRim = {
  borderTopWidth: 0.5,
  borderTopColor: "rgba(255,255,255,0.18)",
} as const;
