# XICO · Liquid Glass redesign + Apple-native integrations · v1.1

> Spec date: 2026-05-15
> Builds on: `2026-05-13-ruta-semanal-rumbos-design.md` (Ruta + Pasaporte system spec)
> Brainstorm artifacts: `.superpowers/brainstorm/49221-1778797505/content/` (12 visual screens captured the decision chain)
> Manifesto + brandbook (vault): `vault/projects/xico/manifesto.md`, `brandbook.md`, `design-rules.md`
> Status: brainstorm complete · awaiting user spec review · then writing-plans

---

## 1 · Context

Build #10 just landed on TestFlight with the gamification + Ruta system functional. The user opened the app, confirmed every feature works, then critiqued the visual surface as **"prison / PPT 2010 / vibe coding / AI-generated dark UI."** The visual system that exists (`constants/editorial.ts` + 11 primitives in `components/editorial/`) is solid as tokens but applied unevenly — most screens fall back to default dark-mode card-on-warm-black patterns that read as generic.

Two simultaneous concept shifts make this redesign load-bearing for v1.1:

1. **Manifesto-shift from content-app to publication+ritual product.** The legacy tabs (Índice / Cultura / Ahora / Archivo) date from the ALUX content-app era. The current product is a daily editorial nota (Despacho) + a weekly walking ritual (Ruta) + a personal codex (Pasaporte + rosetón + anotaciones). Nav needs to mirror that.

2. **iOS 26 Liquid Glass as primary surface treatment.** Apple shipped Liquid Glass as the iOS 26 system-wide material at WWDC 25. XICO's previous brandbook §2 explicitly banned glassmorphism as "the AI-generated-dark-UI tell" because in 2024 it WAS the AI-tell. In 2026, with Apple itself using Liquid Glass across Apple Music, Apple Sports, Apple News, and every native app, the inverse is now true: not using Liquid Glass on iOS is the dated tell. **User explicitly overrode brandbook §2 in this session.** Liquid Glass is now the system, applied with discipline (only on chrome, not on every card).

This spec captures every locked decision from the 12-screen brainstorm and the canonical reference set: Apartamento, Gatopardo, La Tempestad, MUBI, The New Yorker, Apple Music, Apple Sports, Vision Pro.

**Intended outcome:** Build #11 ships with the full Liquid Glass redesign, the new nav, the 4-tier dynamic icon, 6 widget families, and the Live Activity for active Ruta. After Build #11 lands, the public-launch path unblocks at icon + widget level.

---

## 2 · Design language locked

### 2.1 Surface system

Three families, never mixed:

**A · Glass chrome** (iOS 26 Liquid Glass material variants):

| Variant | Specs | Use for |
|---|---|---|
| `.ultraThinMaterial` | rgba(20,14,16,0.18) · blur 40pt · sat 180% | floating masthead bar at top of every screen |
| `.thinMaterial` | rgba(20,14,16,0.35) · blur 20pt · sat 180% | kicker chips on photo cards, info chips over hero, lock chip on Stop screen |
| `.regularMaterial` | rgba(20,14,16,0.55) · blur 36pt · sat 220% | floating tab bar capsule, bottom sheets at medium detent |
| `.thickMaterial` | rgba(20,14,16,0.75) · blur 40pt · sat 220% | sello-earn ceremony overlay, full-screen modal sheets at large detent |
| `.chromeMaterial` | rgba(20,14,16,0.55) · blur 40pt · sat 220% · 0.5px inset highlight 25% | Cronista tier-up overlay — the moment of status transformation |
| `glass-vibrant` (custom) | rgba(20,14,16,0.32) · blur 60pt · sat 280% · brightness 1.1 | the Carta del Equipo card on Tu Códice — vibrancy effect over media |
| Tinted glass | any variant + accent overlay 30-40% | day's color band, active tab indicator background, rumbo-tinted glass on Stop screen kicker |

**B · Luminance elevation surfaces** (warm-dark, hairline-bordered) — used for in-flow card content where text must remain perfectly legible without competing photography:
- `L0` background `#080508` — root canvas
- `L1` surface `#13101A` — primary elevated cards (article previews, Despacho body card)
- `L2` surface `#1C1822` — secondary nested cards (chips inside cards)
- `L3` surface `#26212C` — overlay surfaces before modals

**C · Full-bleed photography** — every primary screen has a Ken Burns-animated hero photograph behind every glass surface. Photo selection per screen:
- **Hoy**: today's Despacho lugar photograph
- **La Ruta**: editorial Madrid street/architecture
- **Stop**: the stop's verified venue photograph (or curated alternative)
- **Tu Códice**: Madrid golden-hour skyline (rotates seasonally)
- **Mapa**: not applicable (MapKit owns this)

Photography is the visual richness. Glass is the structural chrome. L1 surfaces are the reading rooms where text legibility wins over composition.

### 2.2 Color bleed system

Every full-bleed photograph gets three radial gradients layered on top, providing ambient color lighting that matches the user's pasaporte state:

```
codice-bleed (and equivalents per screen) {
  layer 1: radial-gradient(ellipse at 50% 35%, rgba({pillar},0.18) 0%, transparent 50%)
  layer 2: radial-gradient(ellipse at 20% 80%, rgba({tier-color},0.12) 0%, transparent 55%)
  layer 3: radial-gradient(ellipse at 80% 70%, rgba({next-rumbo},0.10) 0%, transparent 50%)
}
```

Where:
- `{pillar}` = current screen's pillar color (Indice magenta, Cultura cobalt, etc.)
- `{tier-color}` = Mictlampa for Iniciado, Tlapallan for Conocedor at 2 rumbos, etc. — driven by user state
- `{next-rumbo}` = the rumbo color the user needs most to advance tier

Result: the photograph receives ambient color lighting tied to the user's progression. As they earn sellos and advance tiers, the ambient bleed shifts. The same Madrid photograph at golden hour looks subtly different at Iniciado (cool magenta bleed) vs. Cronista (full warm gold + green Tlalxicco).

### 2.3 Shadow stack

Brandbook §2 sanctioned shadow recipes, plus new vibrancy-aware layered approach:

- `shadow.hairline-rise`: `0 1px 2px rgba(0,0,0,0.4)` — subtle lift for tags
- `shadow.elevated`: `0 4px 16px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.4)` — Ruta hero cards, bottom sheets
- `shadow.floating`: `0 16px 48px rgba(0,0,0,0.65), 0 4px 12px rgba(0,0,0,0.45)` — tier-up overlay, full-screen modals
- `shadow.glass-stack`: `0 12px 36px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.3)` plus `inset 0 0.5px 0 rgba(255,255,255,0.24), inset 0 -0.5px 0 rgba(0,0,0,0.4)` — every glass surface

Multi-layer stacks across the system create Vision Pro / Apple Music 2025-era depth perception without crossing into skeuomorphism.

### 2.4 Typography hierarchy

Three families, locked:

**Fraunces** (variable, optical-size aware) — `opsz 144` for monumental, `120` for hero, `96` for subhead, `48` for caption. Always paired with explicit `wght 500` (regular display) or `400` (italic). Used for every headline ≥18pt, drop caps, display numerals (sello counts, folio numbers, tier counts, stats rows). Italic family used for accent words within headlines (e.g., *Favela* in italic Tlapallan on Tu Códice; *en el sitio* in italic on the Stop apunte).

**Newsreader** — body, standfirst, captions, byline. Italic version for editor attributions (*— María Vázquez · editora cultural*), meaning glosses (*— el espacio entre dos mundos*), and lugar names. Body sizes 13-17pt with line-height 1.45-1.55.

**Inter** — all caps labels, meta, kicker, tab labels. Sizes 9-11pt with letter-spacing 1.5-2.5px. Forbidden weight: 700 (competes with Fraunces).

**Minimum size**: 11pt (HIG floor) for any persistent text. No `fontSize: 8` anywhere.

### 2.5 Motion

Brandbook §7 timings unchanged:
- `easing.editorial`: cubic-bezier(0.22, 1, 0.36, 1) — every entrance
- `easing.exit`: cubic-bezier(0.5, 0, 0.75, 0) — every dismissal
- `duration.short`: 240ms (most reveals)
- `duration.medium`: 480ms (entrance staggers)
- `duration.long`: 800ms (sello earn ceremony)
- `stagger.normal`: 60ms (between sibling items)
- `stagger.tight`: 25ms (tick marks)

New additions:
- **Ken Burns drift**: 24-32s scale-and-translate on hero photographs (1.0 → 1.08, gentle translate). Disabled when `useReducedMotion()` returns true.
- **Halo pulse**: 4s cycle alternating between 50% and 65% opacity, scale 1.0 → 1.08, on focal SVG elements (rosetón, despacho word at large display, stop name at monumental size).
- **Glass entrance**: 0.7s fade+slide-down on masthead, 0.8s fade+slide-up on tab bar, 1.0s scale+fade on focal photograph.

Every motion has a `useReducedMotion()` short-circuit that returns final state immediately.

---

## 3 · Navigation concept shift

**Old (legacy from ALUX):** Índice · Cultura · México Ahora · Archivo

**New (ritual cadence per manifesto):**

| Tab | Pillar color | Purpose | Primary content |
|---|---|---|---|
| **Hoy** | Indice magenta `#9C1A47` | Daily landing | El Despacho del día + Carta del Equipo XICO + featured articles |
| **La Ruta** | Cycles through current Ruta's rumbo colors | Weekly walking ritual | List of this week's 5-7 stops + Sunday drop preview |
| **Tu Códice** | Archivo verde `#1A4A1A` (Coyoacán garden) | Personal pasaporte | Rosetón at hero scale + tier + Carta del Equipo + sellos archive + guardados |
| **Mapa** | Indice magenta (transitions per stop) | Spatial representation | MapKit native with rumbo-colored pins per stop |

The Cultura tab from the old structure folds into Hoy's "El equipo te propone" section. The México Ahora tab disappears entirely (the dual clock, currency, agenda all migrate to Hoy as widgets within Hoy's scroll, or get cut as legacy v1 features that didn't fit the manifesto). The Archivo tab becomes Tu Códice with the rosetón at the visual center.

Tab bar implementation:
- Floating capsule glass at bottom (22pt margin left/right, 14pt margin bottom + 34pt home indicator safe area)
- `.regularMaterial` with inset highlights
- 4 tabs · pillar-colored active dot with `box-shadow` glow + scale 1.3 transform
- Tab label always visible (Inter 9pt, letter-spacing 1.5px, uppercase)
- 44×44pt minimum touch target per HIG

---

## 4 · Icon system

### 4.1 Default app icon

4-tier dynamic ladder using iOS alternate icons API. Each variant reflects the user's actual pasaporte state. iOS prompts once for permission to swap automatically; user can decline (icon stays at Iniciado).

| Tier | Threshold | Icon design |
|---|---|---|
| **Iniciado** | <6 sellos | Cream background `#EDE6D8` · 4 outlined rosetón petals in magenta `#9C1A47` outline only, no fills |
| **Conocedor** | ≥6 sellos in ≥2 rumbos | 2 of 4 petals filled with their respective rumbo colors (typically Norte Mictlampa `#0E1018` + Este Tlapallan `#D9357B`), 2 still outlined |
| **Curador** | ≥16 sellos in ≥3 rumbos | 3 of 4 petals filled with rumbo colors, 1 still outlined |
| **Cronista** | ≥36 sellos in all 4 rumbos + ≥5 per rumbo | All 4 petals filled with their rumbo colors + Tlalxicco green `#3F5A3A` center dot at 11pt diameter |

**Critical rendering rule from brandbook §5:** Oeste petal renders in pillar magenta `#9C1A47` instead of the rumbo's bone-white because bone-on-cream would disappear. The cosmological reading is preserved (Cihuatlampa = west = the editor's hand), but the canvas needs visible contrast.

All 4 icons rendered at 1024×1024 PNG-32, exported with transparent edges so iOS's 22% corner mask shows the burgundy/cream edge-to-edge without visible margin.

### 4.2 Implementation

`expo-router` + `expo-alternate-icons` (or vanilla iOS API via a native module). Variants registered in `app.json`:

```json
"ios": {
  "infoPlist": {
    "CFBundleIcons": {
      "CFBundleAlternateIcons": {
        "AppIcon-Iniciado": { "CFBundleIconFiles": ["icon-iniciado"] },
        "AppIcon-Conocedor": { "CFBundleIconFiles": ["icon-conocedor"] },
        "AppIcon-Curador":   { "CFBundleIconFiles": ["icon-curador"] },
        "AppIcon-Cronista":  { "CFBundleIconFiles": ["icon-cronista"] }
      }
    }
  }
}
```

Tier-up event (POST `/api/sellos-rumbo` returns `tier_changed: true`) triggers iOS-native permission prompt to swap. First-time only — subsequent tier-ups swap silently per user preference set during first prompt.

### 4.3 Splash icon

Splash icon already corrected in commit `bcae2ad` (transparent edge). Reuses Iniciado design (4-outlined-petal). Splash backgroundColor `#080508` (warm black) shows through.

---

## 5 · Widget system

Seven widget surfaces across three families (Home Screen / Lock Screen / StandBy). All implemented via `WidgetKit` with `App Intents` for interactivity (iOS 17+ supports interactive widgets).

### 5.1 Home Screen widgets

| Family | Size | Content |
|---|---|---|
| **Small (2×2)** | 170×170pt | Nahuatl word + 4pt color band + meaning gloss (italic) + lugar name |
| **Medium (4×2)** | 364×170pt | All Small contents + editor byline + day-of-week + color swatch top-right |
| **Large (4×4)** | 364×382pt | Full Despacho: kicker, word at 56pt Fraunces, meaning, hecho (3-line summary), lugar + barrio, editor signature |

Background: cream `#EDE6D8` to maximize contrast against most iPhone wallpapers. Day's `color_hex` as 4pt × 36pt sliver below the word.

### 5.2 Lock Screen widgets

| Family | Size | Content |
|---|---|---|
| **Inline** | full width × 28pt | "XICO · NEPANTLA · LAVAPIÉS" — single tracked-caps sentence with day's color glyph dot |
| **Circular** | 76pt diameter | Mini rosetón at current fill state · readable at watch-face scale |
| **Rectangular** | full width × 76pt | Mini rosetón + "2/5 sellos" Fraunces + next stop italic |

Glass material for all three (`.thinMaterial` on lock screen wallpaper).

### 5.3 StandBy mode widget

Landscape, 350×200pt approximately. Full Despacho takeover when iPhone is docked horizontally. Matches the Mary Cassatt DailyArt model the user referenced — full painting takeover but with editorial text. Two-up rotation supported (Despacho widget + Ruta progress widget pair).

### 5.4 Data fetch

All widgets pull from a single `/api/widget/today` endpoint that returns:

```json
{
  "despacho": { "word", "meaning", "color_hex", "lugar_nombre", "lugar_barrio", "hecho_summary", "editor_name" },
  "ruta": { "week_key", "stops_completed", "stops_total", "next_stop": { "name", "barrio", "distance_m" } },
  "tier": { "name", "sellos_total", "distinct_rumbos" }
}
```

Cached for 30 minutes on the server side. Widget refresh budget: iOS default (5-10 refreshes per hour). Day boundary at midnight Madrid time triggers a forced refresh via push.

---

## 6 · Live Activity (Dynamic Island)

Active when user has started a Ruta (tapped "Empezar La Ruta" on `/ruta` index) and not yet completed all stops.

### 6.1 Three states

**Compact (always-on display compatible):** 220pt × 38pt approximately
- Left: 20pt mini rosetón at current fill state
- Right: "2/5" in Fraunces opsz 96 weight 500 colored with current ruta's leading rumbo

**Expanded (long-press the Dynamic Island):** 320pt × ~140pt
- Top row: "La Ruta · Semana 19" label · large progress "2/5" Fraunces
- Bottom row: 56pt next-stop photo · "PRÓXIMA · 850m" label · stop name in Fraunces 96 + barrio italic Newsreader + walking time meta

**Lock Screen (when device is locked):** full-width card
- Same expanded content but with a wider photo and larger type

### 6.2 Updates

ActivityKit token-based. Update events:
- User enters geofence (50m haversine) → state changes from "approaching" to "arrived"
- User earns sello → progress count increments, mini rosetón petal fills
- User completes Ruta → activity dismisses
- User explicitly stops Ruta → activity dismisses

Within iOS budget (50 updates/hour) — geofence enter + sello earn × 5 stops = ~10 updates per Ruta. Well within budget.

### 6.3 Data model

```typescript
struct RutaActivityAttributes: ActivityAttributes {
  struct ContentState: Codable, Hashable {
    var stopsCompleted: Int          // 0-5
    var stopsTotal: Int              // 5
    var nextStopName: String
    var nextStopBarrio: String
    var nextStopDistanceM: Int
    var nextStopPhotoURL: String?
    var rosetonState: [Int]          // 4-element array, sello count per rumbo
  }
  var weekKey: String                // "2026-W19"
  var editorName: String             // "María Vázquez"
}
```

8 KB Live Activity state ceiling easily met.

---

## 7 · Per-screen specifications

### 7.1 Hoy (formerly Índice)

Hero structure:
1. Floating glass masthead at 60pt from top (clears Dynamic Island 81pt safe zone) — "XICO · HOY" + pulsing dot + day-of-week
2. Full-bleed Despacho photograph 540pt tall · Ken Burns drift · color bleed overlay · 3% film grain
3. Hero kicker in day's accent color
4. Hero title (Despacho nahuatl word) Fraunces opsz 144 weight 500 at 56pt
5. Day's color band 4×72pt below title · animated slide-from-left
6. Meaning italic Newsreader 17pt
7. Glass info chip with lugar + barrio + puesto
8. Transition to L1 surface for body
9. Drop cap Fraunces 600 at 48pt in pillar magenta opening the despacho body
10. Tapered hairline separator (Rule primitive)
11. Elevated Ruta hero card (`shadow.elevated` recipe) with magenta left border + inline mini rosetón state
12. Section opener "EL EQUIPO TE PROPONE" with magenta accent line
13. Featured article card with full-bleed cultura-cobalt-tinted hero photo + glass kicker chip + Fraunces 100 headline + italic standfirst + italic editor byline
14. Floating glass tab bar at bottom

Motion: page-mount stagger sequence. Masthead 600ms (delay 100ms), hero kicker 700ms (delay 300ms), title 800ms (delay 450ms), color band slide 600ms (delay 600ms), meaning 800ms (delay 700ms), info chip 700ms (delay 850ms), Ruta card lift 700ms (delay 1000ms), tab bar 800ms (delay 200ms). All cubic-bezier(0.22, 1, 0.36, 1).

### 7.2 La Ruta listing

Hero structure:
1. Floating glass masthead "XICO · LA RUTA · SEMANA 19"
2. Full-bleed photograph from week's editor (María's Madrid for week 19)
3. Hero title "Cinco paradas *en cinco barrios*" Fraunces 144 with italic accent on "en cinco barrios"
4. Italic byline "— de María Vázquez · editora cultural"
5. Inline rosetón state with "Tu pasaporte · 2 / 5 sellos"
6. Transition to L1 surface · stop list
7. Stops as alternating featured/compact cards:
   - Featured (stops 1, 3, 5): full-bleed stop photo + glass kicker chip with rumbo name + Fraunces 100 stop name + barrio italic + accent rumbo color border
   - Compact (stops 2, 4): 56pt thumb + 2-line stop name + rumbo + distance
8. Earned-sello pip on the right margin of completed stops (rumbo-colored disc)
9. Floating glass tab bar (La Ruta tab active in current rumbo color)

### 7.3 Stop screen (the showpiece)

Hero structure:
1. Full-bleed stop photograph top 480pt with Ken Burns
2. Floating glass masthead "XICO · LA RUTA · PARADA · 02/05"
3. Glass lock chip top-right (`.thinMaterial` + 7×12pt padding) showing distance "Apunte cerrado · 850m" — only visible when user is outside 50m geofence
4. Stop folio number (address + barrio in tracked-caps Inter)
5. Glass-tinted rumbo tag pill "Tlapallan · Este · renovación" with rumbo-colored swatch + rumbo-color text
6. Monumental stop name Fraunces 144 at 44pt with italic punctuation in rumbo color
7. Italic Newsreader address line
8. Despacho card (L1 + rumbo-colored 3pt left border + `shadow.elevated`) with rumbo-colored kicker "EL DESPACHO" + body with rumbo-colored drop cap
9. (After arrival) Apunte card — same structure but with rumbo-colored "EL APUNTE · IN SITU" kicker, slide-up animation reveals it
10. (After arrival) 30-second progress ring (existing ProgressRing component) anchored top-right where lock chip was
11. (After sello earn) Stamp ceremony — wax-seal medallion at 96pt floating over content using `.chromeMaterial` with extra reflective inner highlight, springs from center to top-right corner over 800ms
12. (After tier change) Tier-up overlay using `.chromeMaterial` full-screen sheet

Five-state choreography (existing from spec 2026-05-13) preserved · `idle → en_camino → arrival → earning → earned`.

### 7.4 Tu Códice (formerly Archivo · final visual treatment)

Hero structure:
1. Full-bleed Madrid golden-hour photograph behind everything
2. Three-radial color bleed overlay (pillar magenta + tier-color Tlalxicco green + next-rumbo Tlapallan pink)
3. 3% SVG film grain
4. Floating glass masthead "XICO · TU CÓDICE · FOLIO #1"
5. "El códice de" italic Newsreader pre-line
6. User name in Fraunces 144 at 42pt with italic family name in current rumbo color (e.g., "Mauricio *Favela*" with Favela in Tlapallan pink)
7. Glass-deep tier badge pill "INICIADO · MAYO 2026" with rumbo glyph dot
8. Hero rosetón 220pt wrapped in halo (animated radial pulse 4s cycle) with per-petal drop shadow filter
9. Glass-deep stats row: "2 sellos · 5 guardados · 11 leídos" in Fraunces 96 numerals + Inter 9pt labels
10. Glass-vibrant Carta del Equipo card (60pt blur · 280% sat) with gold-accented drop cap opening María's editor letter
11. Italic byline "— María Vázquez · editora cultural"
12. (Scrolling reveals) Sellos archive — chronological list of earned stops with photos
13. (Scrolling reveals) Guardados archive — saved articles
14. Floating glass tab bar (Tu Códice tab active in pillar archivo verde)

### 7.5 Mapa

MapKit native (replace Leaflet WebView per Apple integration P1):
- Native iOS map with custom tile style (warm dark map style matching app aesthetic — Mapbox or Apple's Dark Map style with subtle saturation reduction)
- Rumbo-colored pins for each Ruta stop — disc shape with rumbo color and number (1-5)
- Walking directions to next stop on tap
- Look Around (3D street view) for stops that have it available
- Floating glass masthead "XICO · MAPA"
- Glass-deep stop preview card slides up from bottom on pin tap

---

## 8 · Apple-native integrations · P1 (Build #11)

### 8.1 Live Activities (`ActivityKit`)
- Implementation per §6 above
- iOS 16.1+ for Dynamic Island, iOS 16.2+ for Lock Screen card

### 8.2 WidgetKit (Home + Lock Screen + StandBy)
- 6 widget families per §5 above
- iOS 14.0+ for Home, iOS 16.0+ for Lock Screen, iOS 17.0+ for StandBy
- Single `/api/widget/today` endpoint feeding all variants

### 8.3 MapKit native
- Replaces `LeafletMap.tsx` (currently WebView-based) for the Mapa tab
- `MKMapView` + `MKPointAnnotation` with custom marker views in rumbo colors
- Walking directions via `MKDirections`
- Look Around via `MKLookAroundViewController` when available

### 8.4 Haptic feedback
- Already implemented for sello earn (`Haptics.selectionAsync` × 3)
- Add: `Haptics.notificationAsync(Heavy)` on tier change
- Add: `Haptics.selectionAsync(Light)` on pull-to-refresh
- Add: `Haptics.selectionAsync(Soft)` on tab navigation

### 8.5 Custom Focus mode
- Native iOS Focus Filter via `FocusKit`
- Suggest activation when user taps "Empezar La Ruta"
- Suppresses non-essential app notifications during active Ruta

---

## 9 · Apple integrations · P2 (Build #12 · within 6 weeks of Build #11)

| Feature | Framework | Use case |
|---|---|---|
| App Intents + Siri Shortcuts | `AppIntents` | "Hey Siri, show me today's despacho" · "Start La Ruta" · "What's my next stop?" |
| Spotlight indexing | `CoreSpotlight` | Articles + lugares searchable from system search |
| Sign in with Apple | `AuthenticationServices` | Alternative to magic link · simpler onboarding |
| Apple Wallet pass | `PassKit` | Cronista tier as a Wallet identity card |

## 10 · Apple integrations · DEFER (v2+)

- HealthKit (steps during Ruta)
- SharePlay (co-walk a Ruta with a friend)
- App Clips (share single stop as App Clip)

---

## 11 · HIG compliance · fixes required from current audit

Items flagged in `.superpowers/brainstorm/49221-1778797505/content/10-apple-native-audit.html`:

| Severity | Issue | Fix |
|---|---|---|
| GAP | Dynamic Island clearance | Masthead glass must start ≥81pt from top on every screen (currently 60pt — shift down) |
| GAP | Back gesture preservation | Audit Stop screen and Ruta listing — no custom horizontal swipe gestures should override iOS system back |
| PARTIAL | Dynamic Type support | Wrap every TypeSize.* font size with `UIFontMetrics.scaledFont(for:)` (React Native equivalent: `useFontScale()` + manual scaling) |
| PARTIAL | Reduce Motion fallback | Every animation in this spec uses `useReducedMotion()` short-circuit — final state shown immediately when set |
| PARTIAL | VoiceOver labels | Rosetón SVG gets dynamic `accessibilityLabel="Tu pasaporte: 2 de 5 sellos completados · 2 rumbos cubiertos"` that updates with state |

---

## 12 · Data model deltas

No breaking schema changes. Additive only:

```sql
-- Existing rumbos, ruta_stops, sellos_rumbo, ruta_stop_notes preserved.

-- Add: widget_state cache for fast widget fetches
CREATE TABLE IF NOT EXISTS user_widget_state (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  state JSONB NOT NULL,  -- denormalized {despacho, ruta, tier}
  ttl_seconds INT DEFAULT 1800
);

-- Add: active_ruta_activities for Live Activity tracking
CREATE TABLE IF NOT EXISTS active_ruta_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ruta_id TEXT REFERENCES ruta(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  activity_token TEXT,  -- ActivityKit push token for server-pushed updates
  state JSONB,
  CONSTRAINT one_active_per_user EXCLUDE USING gist (profile_id WITH =) WHERE (ended_at IS NULL)
);
```

---

## 13 · File deltas

```
artifacts/xico-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx               [MODIFY: rename tabs to Hoy/La Ruta/Tu Códice/Mapa]
│   │   ├── index.tsx → hoy.tsx        [RENAME + REBUILD with §7.1 spec]
│   │   ├── cultura.tsx                [DELETE — folds into Hoy]
│   │   ├── mexico-ahora.tsx           [DELETE — fold relevant pieces into Hoy if any]
│   │   ├── mi-xico.tsx → tu-codice.tsx [RENAME + REBUILD with §7.4 spec]
│   │   └── mapa.tsx                   [NEW — MapKit-backed §7.5 spec]
│   ├── ruta/
│   │   ├── index.tsx                  [REBUILD with §7.2 spec]
│   │   └── stop/[id].tsx              [REBUILD with §7.3 spec]
├── components/
│   ├── editorial/
│   │   └── (existing primitives preserved · used by new screens)
│   ├── liquid-glass/
│   │   ├── GlassMasthead.tsx          [NEW]
│   │   ├── GlassTabBar.tsx            [NEW]
│   │   ├── GlassChip.tsx              [NEW]
│   │   ├── GlassCard.tsx              [NEW]
│   │   ├── GlassVibrant.tsx           [NEW · for Carta del Equipo]
│   │   ├── ColorBleedBackdrop.tsx     [NEW · triple-radial overlay]
│   │   └── HaloPulse.tsx              [NEW · animated focal halo]
│   ├── icons/
│   │   ├── iniciado.png               [NEW · 1024×1024 alternate icon]
│   │   ├── conocedor.png              [NEW]
│   │   ├── curador.png                [NEW]
│   │   └── cronista.png               [NEW]
├── widgets/                           [NEW directory · WidgetKit native]
│   ├── DespachoWidget.swift
│   ├── RutaProgressWidget.swift
│   ├── LockScreenInline.swift
│   ├── LockScreenCircular.swift
│   ├── LockScreenRectangular.swift
│   └── StandByWidget.swift
├── live-activity/                     [NEW directory · ActivityKit native]
│   └── RutaActivity.swift
├── app.json                            [MODIFY: CFBundleAlternateIcons]
├── package.json                        [MODIFY: + expo-alternate-icons, expo-haptics (already), MapKit native module]
```

API server:
```
artifacts/api-server/src/
├── routes/
│   ├── widget.ts                       [NEW · GET /api/widget/today]
│   ├── live-activity.ts                [NEW · POST /api/live-activity/start, /update, /end]
│   └── ruta-stops.ts                   [MODIFY: emit Live Activity update on geofence enter]
├── migrations/
│   └── 2026-05-15-widget-and-activity.sql [NEW · §12 schema]
```

---

## 14 · Implementation phases

**Phase 1 · Foundation (Week 1, ~3 days)**
- DESIGN.md updates: add Liquid Glass material variants, photography-forward rule, navigation concept shift
- New `components/liquid-glass/` directory with 7 primitives
- `Fraunces` font added to expo-fonts loaded set (alongside existing Newsreader + Inter)
- Color bleed backdrop primitive
- Halo pulse animation hook

**Phase 2 · Navigation + Hoy rebuild (Week 1-2, ~3 days)**
- Rename tabs in `(tabs)/_layout.tsx`
- Build Hoy from index.tsx baseline with §7.1 spec
- Delete cultura.tsx, mexico-ahora.tsx; migrate any salvageable content to Hoy
- Apply backdrop+bleed+halo+glass to Hoy

**Phase 3 · Tu Códice rebuild (Week 2, ~2 days)**
- Rebuild mi-xico.tsx as tu-codice.tsx with §7.4 spec
- Hero rosetón with halo + drop shadows
- Glass-vibrant Carta del Equipo card with golden drop cap
- Stats row, tier badge

**Phase 4 · Stop screen + La Ruta listing (Week 2-3, ~3 days)**
- Apply backdrop+bleed+halo+glass to existing Stop screen
- Rebuild La Ruta listing with rumbo color anchoring per stop
- 5-state choreography preserved from spec 2026-05-13

**Phase 5 · Mapa (Week 3, ~3 days)**
- Use `react-native-maps` with `provider="apple"` to access Apple MapKit (no custom Expo module needed — keeps build simple)
- Rumbo-colored pin markers via custom `Marker` views with rumbo SVG glyph + numbered disc
- Walking directions to next stop via `MKDirections` (bridged through `react-native-maps` directions API)
- Look Around: drop in for now (requires UIKit `MKLookAroundViewController` · separate native module · defer to P2 if `react-native-maps` doesn't expose it)

**Phase 6 · Widgets (Week 3-4, ~4 days)**
- 7 widget surfaces per §5 (Home S/M/L + Lock Inline/Circular/Rectangular + StandBy)
- `/api/widget/today` endpoint + user_widget_state table
- Test on real devices (Lock Screen + StandBy)

**Phase 7 · Live Activity (Week 4, ~3 days)**
- ActivityKit setup
- 3 states (compact, expanded, lock)
- Server-side push updates on geofence + sello earn
- active_ruta_activities table

**Phase 8 · Dynamic icon system (Week 4, ~1 day)**
- Export 4 icon variants as 1024×1024 PNGs
- `app.json` CFBundleAlternateIcons setup
- Tier-up hook to call iOS swap API
- First-time permission prompt copy

**Phase 9 · HIG compliance (Week 4, ~1 day)**
- Dynamic Island clearance audit + fixes
- Dynamic Type wrapping
- Reduce Motion guards
- VoiceOver labels

**Phase 10 · Real-device QA + EAS Build #11 (Week 4-5)**
- Internal TestFlight install on physical iPhone
- Walk through every surface, every state
- Capture 5 App Store screenshots from real device
- Submit Build #11 to TestFlight + Apple Beta App Review

**Total estimated effort:** ~4 weeks for one engineer. Compressible to 2-2.5 weeks with focused execution.

---

## 15 · Out of scope (deferred)

- xico.app domain registration + Vercel landing page deploy (blocked on name decision — separate gate)
- Spec rename if "XICO" → other name lands before Build #11 ships (10-file rename per v1.1-backlog)
- ElevenLabs Starter tier (audio narrator unblocked — separate billing decision)
- Push notifications on Sunday Ruta drop (v1.1.1 · separate APN setup)
- Editor rotation infrastructure (Sofía Niño de Rivera Week 20 content gate — separate brainstorm complete · drafts in `docs/brand/week-20-drafts-sofia.md`)
- App Privacy questionnaire submission (forms drafted in `docs/brand/app-store-connect-forms.md` · awaiting Privacy Policy URL resolve via `artifacts/xico-privacy-standalone/`)

---

## 16 · Success criteria (manifesto cross-check)

Per design-rules.md standing critique loop · after Build #11 lands, the user opens the app at 5 scenarios:

1. **First-time install** — Hoy screen with Madrid backdrop, Despacho hero, Ruta hero card, "El equipo te propone." Does this make the user feel oriented and held, or does it feel like another content app?
2. **Second day, late morning** — color band has shifted to today's despacho color. Backdrop photo has changed. Stats reflect any progress. Does the daily change feel like a real publication, or like an algorithmic refresh?
3. **After 7-day absence** — Re-entrada welcome screen (existing) precedes Hoy. Does the rosetón state feel like coming back to a self-portrait?
4. **At 1am** — Modo hora applies (madrugada). Backdrop dims. Color saturation drops. Companion phrases shift. Does this feel different from Instagram at 1am, or does it just feel like another dark mode?
5. **At 5pm Sunday before next Ruta drop** — Hoy shows "La Ruta de mañana" preview. Stats highlight what user accumulated this past week. Does this build anticipation, or does it feel like a notification?

For each: **does opening this make me feel held, oriented, recognized — or does it merely engage me?**

Any "merely engage" hit → redesign that surface before TestFlight Build #11 submission.

---

*End of spec. Next step: user reviews this document, requests changes (if any), then writing-plans skill turns it into a step-by-step implementation plan.*
