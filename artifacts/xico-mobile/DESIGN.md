---
name: XICO Mobile
description: Warm-dark editorial publication design system. Barragán + Mexica palette. Style = Editorial Grid / Magazine × Bold Typography (Mobile Poster). Saturation discipline. Hairline > shadow. No glassmorphism default.
version: 0.1.0-ruta-v1
spec: docs/superpowers/specs/2026-05-13-ruta-semanal-rumbos-design.md
plan: ../../.claude/plans/magical-hopping-axolotl.md
ui_recommendations_source: ui-ux-pro-max v2.5.0 query 2026-05-14
brandbook: ../../vault/projects/xico/brandbook.md

colors:
  background:        '#080508'
  surface:           '#13101A'
  surfaceHigh:       '#1C1822'
  surfaceHigher:     '#26212C'
  textPrimary:       '#F0ECE6'
  textSecondary:     '#C9C3B8'
  textTertiary:      '#8C887F'
  textQuaternary:    '#5A574F'
  borderLight:       'rgba(240,236,230,0.06)'
  borderMedium:      'rgba(240,236,230,0.10)'
  borderStrong:      'rgba(240,236,230,0.18)'

  pillars:
    indice:          '#9C1A47'
    cultura:         '#1A3D8A'
    mexicoAhora:     '#B8820A'
    tradicion:       '#8B3A1A'
    archivo:         '#1A4A1A'

  rumbos:
    norte:           '#0E1018'   # Mictlampa
    sur:             '#234698'   # Huitzlampa
    este:            '#D9357B'   # Tlapallan
    oeste:           '#EDE6D8'   # Cihuatlampa
    center:          '#3F5A3A'   # Tlalxicco (Cronista accent)

  rumbosLight:
    norte:           '#1A1D2E'
    sur:             '#3A65C0'
    este:            '#E66BA0'
    oeste:           '#F5F0E5'
    center:          '#5A7855'

typography:
  font_pairing: Newsreader + Inter
  pairing_class: News Editorial × Classic Elegant hybrid (validated against ui-ux-pro-max typography.csv)
  serif: Newsreader
  serifLight: Newsreader_300Light
  serifLightItalic: Newsreader_300Light_Italic
  serifRegular: Newsreader_400Regular
  serifItalic: Newsreader_400Regular_Italic
  serifMedium: Newsreader_500Medium
  serifSemibold: Newsreader_600SemiBold
  serifSemiboldItalic: Newsreader_600SemiBold_Italic
  sans: Inter
  sansLight: Inter_300Light
  sansRegular: Inter_400Regular
  sansMedium: Inter_500Medium
  sansSemibold: Inter_600SemiBold
  sansBold: Inter_700Bold

  scale:
    micro: 8
    small: 10
    caption: 11
    meta: 13
    body: 16
    lede: 18
    standfirst: 19
    subhead: 22
    title: 28
    display: 36
    hero: 48
    monumental: 64

  tracking:
    tight: -0.3
    body: 0.1
    wide: 1.5
    wider: 2.5
    widest: 3

  lineHeight:
    tight: 1.05
    snug: 1.2
    normal: 1.45
    relaxed: 1.6
    loose: 1.75

spacing:
  hairline: hairlineWidth
  xs: 4
  sm: 8
  md: 12
  base: 16
  lg: 24
  xl: 32
  xxl: 48
  huge: 64
  giant: 96

rounded:
  none: 0
  hairline: 1
  small: 3
  full: 999

motion:
  easing:
    editorial: 'cubic-bezier(0.22, 1, 0.36, 1)'   # cubic-out · entrance default
    exit:      'cubic-bezier(0.5, 0, 0.75, 0)'    # sharp-in · dismissals
  duration:
    micro:   120
    short:   240
    medium:  480
    long:    800
    cap:    1500
  stagger:
    tight:  25
    normal: 60
    slow:  120

elevation:
  hairline_card: '1px solid rgba(240,236,230,0.06)'
  hairline_div:  '1px solid rgba(240,236,230,0.08)'
  shadow_subtle:   '0 1px 2px rgba(0,0,0,0.4)'
  shadow_elevated: '0 4px 16px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.4)'
  shadow_floating: '0 16px 48px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.45)'
---

# XICO Mobile · Design System

## Style classification

This system sits at the intersection of two documented styles in the ui-ux-pro-max database:

- **Editorial Grid / Magazine** (general) — print-inspired typography, asymmetric grid, drop caps, pull quotes, column layout, WCAG AAA. Maps directly onto Phase 0 primitives (`Masthead`, `Standfirst`, `FolioNumber`, `DropCap`, `PullQuote`, `Caption`, `ByLine`, `Rule`, `SectionOpener`).
- **Bold Typography (Mobile Poster)** (mobile-specific, React Native 10/10) — near-black + warm-white, edge-to-edge type, underline CTAs, 0 border-radius containers, 200ms transitions, no shadows, 18:1 contrast achievable. Our `#080508 / #F0ECE6` pair fits this exactly.

Filtered through the **XICO manifesto** (premium not pretentious, contemporary not folkloric, emotional residency over engagement) and the **brandbook §6 saturation discipline** (one accent per surface, never two).

**Explicitly rejected styles** from the database (despite warm-dark / editorial keyword overlap):

- **Modern Dark (Cinema Mobile)** — would push us toward BlurView glassmorphism, LinearGradient base screens, animated ambient blobs, accent glow. This is the "AI-generated-dark-UI" tell the brandbook §7.2 explicitly forbids. WCAG AA only.
- **Dark Mode (OLED)** — uses pure `#000000`, vibrant neon accents. Our warm-black `#080508` (slight magenta tint) is correct; pure black smears on OLED.
- **Cyberpunk UI** — neon HUD aesthetic, polar opposite of editorial.

## Font pairing validation

**Newsreader + Inter** is validated against the typography database:

- **Newsreader** appears in the canonical "News Editorial" pairing (with Roboto) — designed for long-form reading, journalism, content-heavy products.
- **Inter** appears in "Classic Elegant" (with Playfair Display) — premium, editorial, luxury.
- Our pairing sits cleanly between these two recognized patterns. Inter is a neutral geometric sans (functionally substitutable for Roboto on UI), while Newsreader brings the editorial-publication serif weight.

Both already loaded in `app/_layout.tsx` (Inter 300/400/500/600/700 + Newsreader 300/300i/400/400i/500/600/600i).

## Saturation discipline (Brandbook §6 · enforced)

**One saturated accent per screen.** No exceptions outside the Rosetón.

Allowed accent placements: kickers (8–10pt uppercase labels), hairline rules, hero gradient overlays (≤10% alpha tint), section serials (`01 / 07`), the Pasaporte rosetón petals (the *only* place where multiple saturated colors meet), the active state of editorial primitives, the StampNotification top accent rule.

Forbidden accent placements: body text, saturated button fills (use accent on border/text + neutral fill), saturated dividers (use `borderLight`), tab bar fill, chrome surfaces, nav bars, two competing accents on the same surface.

## Critical UX rules enforced (top 7, ui-ux-pro-max validated)

| # | Rule | Severity | Applies to |
|---|---|---|---|
| 1 | **Reduced Motion** — respect `useReducedMotion()`; replace tick-by-tick draws with single fade when set. | HIGH | Roseton mount, ring fill, sello drop, RevealOnMount |
| 2 | **Excessive Motion** — animate max 2 elements per view simultaneously; sequence the rest. | HIGH | Stop screen state 3 (sello drop ceremony) |
| 3 | **Easing curves** — `editorial = cubic-bezier(0.22,1,0.36,1)` for entrances; `exit = cubic-bezier(0.5,0,0.75,0)` for dismissals. Never `linear`. | LOW | All transitions |
| 4 | **Haptic discipline** — `selectionAsync × 3, 80ms apart` for sello earn. No haptics on routine taps. | LOW | Stop screen state 3, tier-up overlay |
| 5 | **Empty states** — Roseton with 0 sellos shows atmospheric line "Tu rosetón se llenará al caminar tu primera Ruta." Never a blank shape. | MEDIUM | Roseton, Sellos del Lector grid |
| 6 | **Active state visibility** — current tier highlighted at Roseton center via Newsreader 500 weight. Tab indicator pip 2px accent stripe. | MEDIUM | Mi Lectura, tab bar |
| 7 | **UI thread for animations** — use `useSharedValue` + `useAnimatedStyle` + worklets. Never `Animated` API for rosetón / ring / state transitions. | HIGH | All animated components |

## Stack-specific (React Native · Expo SDK 54)

- Gesture: **react-native-gesture-handler** (already installed) for petal taps and stop card press
- Animation: **react-native-reanimated** worklets (`useSharedValue`, `useAnimatedStyle`, `withTiming`, `withSequence`, `withDelay`)
- SVG: **react-native-svg** for Roseton paths, glyph overlay, GrainOverlay noise pattern
- Geolocation: **expo-location** for stop arrival detection
- Haptics: **expo-haptics** (`Haptics.selectionAsync` × 3 for sello earn)

## Pattern-level guidance for the Pasaporte / Rosetón

The Rosetón is a rare commercial-UI artifact — closest documented references are heraldry/rose-windows, Aztec codex calendar wheels (e.g., Codex Fejérváry-Mayer plate 1, which informs our cosmology), and museum exhibit visualization. The ui-ux-pro-max database has no direct match, so the pattern is synthesized from these constraints:

- **Print/codex aesthetic** — large display SVG with 3% grain overlay (`<GrainOverlay />`) to mimic engraved/printed surface
- **Four-petal Q-curve almond paths** — each petal a closed bezier shape (`M cx cy Q ... Q ... Z`) anchored at the centre, rendered at increasing radii
- **Per-petal ticks** — each earned sello becomes a 1px radial tick within its petal at increasing radii (max 13 per petal). Mount with 25ms stagger (`stagger.tight`).
- **Center disc** — small circle with tier name in `Newsreader 500Medium` and total sello count in `Inter 500Medium` (small, secondary). Tap → tier detail screen.
- **Tap-to-expand petals** — tap a petal → bottom sheet with the sellos in that rumbo (place, date, link to re-read despacho). Use `react-native-bottom-sheet` or React Native's `Modal` with custom slide-up.
- **Empty ghost petals** — petals with zero sellos rendered as hairline outline only (`rumbosLight[slug]` at 0.4 alpha). Never hide the petal.

**Anti-patterns explicitly avoided:**

- No progress bars, XP meters, leaderboards, streaks — the Rosetón replaces all of these
- No gradient fills inside petals (each petal is a flat saturated hex per brandbook §6)
- No glow effects (the AI-dark-UI tell)
- No drop shadows on the SVG (hairline borders only; brandbook §2)

## Files this design system applies to

```
constants/
├── colors.ts                              base tokens + pillars
├── rumbos.ts                              rumbo cosmology + colors (NEW · Week 2 Task 8)
└── editorial.ts                           Space / TypeSize / Tracking / LineHeight / Fonts / Hairline / Radius / lh()

components/
├── editorial/                             Phase 0 primitives (shipped)
├── pasaporte/                             Roseton + TierStatusBlock + GrainOverlay + ReEntryWelcome (Week 2 + 4)
└── ruta/                                  StopCard + StopVeil + ProgressRing (Week 3)

app/
├── (tabs)/
│   ├── index.tsx                          Índice + Ruta hero (Week 3)
│   └── mi-xico.tsx                        Mi Lectura restructure (Week 2)
└── ruta/
    ├── index.tsx                          La Ruta de la semana (Week 3)
    └── stop/[id].tsx                      Una parada · 5 states (Week 3)
```

## Lint command

```bash
npx @google/design.md lint DESIGN.md
```

Run before any UI commit. (Note Windows quirk: alias as `designmd` in package.json if needed — the `.md` suffix confuses Windows command resolution.)

## Source

This file was generated 2026-05-14 by synthesizing:

- `/ui-ux-pro-max --design-system` (recommender)
- ui-ux-pro-max domain searches: style × typography × ux × stack:react-native
- XICO manifesto + brandbook (manifesto + brandbook win on any conflict)
- Phase 0 primitives already shipped in `components/editorial/`

Next regeneration: when manifesto / brandbook materially change, or when adding a new product surface (admin panel, web companion, print collateral) that needs its own DESIGN.md.
