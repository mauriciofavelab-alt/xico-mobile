# Screenshot capture brief · App Store + TestFlight

Apple requires at least 3 device screenshots per submission, up to 10. The brief in `app-store-listing.md` names 5 specific shots. This doc tells you how to produce each one as a 1320×2868 PNG ready to drop into App Store Connect, in roughly 30-60 minutes total (the slow part is reproducing the app states, not the capture).

For 2026 App Store submissions, the **only required device size is 6.9" (iPhone 16 Pro Max · 1320×2868)**. Apple auto-scales the smaller sizes from this single set.

---

## One-time setup

```bash
# Launch the iOS Simulator with the iPhone 16 Pro Max profile
xcrun simctl boot "iPhone 16 Pro Max"
xcrun simctl ui "iPhone 16 Pro Max" appearance dark   # XICO is dark-only

# (alternative: launch Simulator.app and pick the device from the menu)
open -a Simulator
```

Build XICO into the simulator (from a fresh expo run):

```bash
cd artifacts/xico-mobile
npx expo run:ios --device "iPhone 16 Pro Max"
# wait ~2-3 min for the JS bundle + native install
```

Sign in via magic link using a real Supabase-registered email (e.g. `maufavela@hotmail.com`). The magic-link email arrives in your inbox; tap it on your Mac and it deep-links into the running simulator.

## Capture helper

```bash
# Captures the simulator's current screen state to your Desktop as PNG
# Filename includes timestamp so each capture is unique
function shot() {
  xcrun simctl io booted screenshot "$HOME/Desktop/xico-shot-$(date +%H%M%S).png"
}

# Usage from any terminal once the function is defined:
shot   # → ~/Desktop/xico-shot-145532.png
```

For repeatable runs add the function to your `~/.zshrc`.

---

## The 5 shots · in capture order

### Shot 1 · Índice / Mi Lectura · Rosetón partial state

**Screen**: `/(tabs)/mi-xico` · Mi Lectura subtab
**Required state**: at least 2 earned sellos across at least 2 different rumbos (so the Rosetón shows visible filling)

**How to reach the state**:
1. Sign in.
2. Go to `/ruta`. Tap stop 1 (Casa de México).
3. In the simulator menu: **Features → Location → Custom Location...** → enter `40.4301, -3.7095`.
4. Wait for the veil to lift (~2s) + the 30-second progress ring to fill. The sello drops into the Rosetón.
5. Hit the back button. Tap stop 3 (Barracuda MX). Simulate location to `40.4190, -3.6893`. Wait for the sello.
6. Navigate to Mi XICO tab → Mi Lectura subtab.

**Capture moment**: hero is the Rosetón with 2 filled ticks (one Mictlampa norte, one Huitzlampa sur). Carta del Equipo visible above. Scroll position: top.

**Caption overlay text**: *Tu pasaporte se llena al caminar.* (small caps, Newsreader italic, magenta accent on "pasaporte")

**File name**: `01-mi-lectura-roseton-2-sellos.png`

---

### Shot 2 · La Ruta listing · Semana 19

**Screen**: `/ruta`
**Required state**: at least 2 stops marked as completed (sellos earned visible in the right margin of those stop cards), the other 3 untouched.

**How to reach the state**: continues from Shot 1. After capturing Shot 1, navigate back to the Ruta tab. The /ruta listing shows 5 stops; stops 1 and 3 should have the rumbo-colored sello pip on the right.

**Capture moment**: Masthead "Semana 19 · María Vázquez" at top. Five stop cards visible (may need to scroll slightly — capture at the position where all 5 are visible OR where the first 3 + part of 4 are visible to imply scroll).

**Caption overlay text**: *Cinco paradas en Madrid, cada domingo.* (no italic; same accent color as the editor name)

**File name**: `02-ruta-listing-semana-19.png`

---

### Shot 3 · Stop screen · en_camino (locked apunte)

**Screen**: `/ruta/stop/stop-002` (Punto MX) — pick a stop the user hasn't yet visited so the apunte is locked
**Required state**: a stop where the user is geographically far enough to keep the veil up. To set this state: simulator → **Features → Location → None**, then navigate to the stop screen.

**How to reach the state**:
1. From `/ruta` listing, tap stop 2 (Punto MX) — assume user hasn't visited.
2. Simulator location is `None` → the haversine check fails → veil stays up → lock chip visible top-right.

**Capture moment**: monumental "Punto MX" name in hero (parallax not visible in a static screenshot — capture at scroll position 0 where the hero is fully visible). Lock chip top-right. Despacho text below.

**Caption overlay text**: *Apunte cerrado · ábrelo en el sitio.* (lock-icon glyph small, before "Apunte"; rumbo color on the chip background visible)

**File name**: `03-stop-locked-apunte.png`

---

### Shot 4 · Stop screen · llegada (apunte revealed)

**Screen**: `/ruta/stop/stop-002` (Punto MX) · same screen as Shot 3, but with location override active
**Required state**: simulator location set to `40.4277, -3.6783` (Punto MX coords). Veil lifts. Apunte text is visible below the despacho.

**How to reach the state**: from Shot 3's setup, simulator → **Features → Location → Custom Location...** → `40.4277, -3.6783`. Wait for veil-lift animation (~2s).

**Capture moment**: same hero, no lock chip, ProgressRing visible top-right (or sello disc if the 30s already elapsed). Despacho + apunte both visible — scroll to a position where the boundary between them is in the middle of the screen.

**Caption overlay text**: *Lo que solo puedes leer estando ahí.* (italic; rumbo accent on "estando")

**File name**: `04-stop-arrival-apunte-revealed.png`

---

### Shot 5 · Re-entrada Welcome (returning user after ≥7 days)

**Screen**: `/_layout` re-entrada gate (renders before the tabs when `days_since_last_open ≥ 7`)
**Required state**: AsyncStorage value `last_open_ts` set to a timestamp ≥7 days in the past.

**How to reach the state** · two paths:

**Path A (the legit way)**: 
1. Cold-launch the app and stop. Wait 7+ real days. Re-launch.
2. Not feasible for screenshot work.

**Path B (override via dev menu)**:
1. In the simulator, open the dev menu (`⌘D`).
2. Run JS from the debugger console: `AsyncStorage.setItem('last_open_ts', String(Date.now() - 9 * 24 * 60 * 60 * 1000))` (9 days ago).
3. Cold-relaunch the simulator app.
4. The re-entrada welcome screen renders.

**Path C (faster)**: temporarily edit `_layout.tsx` to short-circuit the `days_since_last_open` check to return `9`. Rebuild. Capture. Revert.

**Capture moment**: the full re-entrada screen. "Hace 8 días que no te leíamos. — María" headline visible. Continue button below. No tab bar.

**Caption overlay text**: *Una app que te recibe sin pedirte explicaciones.* (no italic; secondary text color)

**File name**: `05-re-entrada-welcome.png`

---

## Caption overlay style guide

For all 5 shots, the caption sits at the top or bottom 15% of the canvas as an overlay band. Use the existing editorial tokens — these are not new visual decisions.

| Token | Value | Source |
|---|---|---|
| Caption background | `rgba(8, 5, 8, 0.92)` (warm-black, 92% opacity) | matches `Colors.background` |
| Caption text color | `#F5EFE3` (cream) | matches `Colors.textPrimary` |
| Caption font | Newsreader 400 Regular | matches `Fonts.serif` |
| Caption font size | 32pt at 1320×2868 canvas | scaled for ASC viewing distance |
| Accent on highlighted word | rumbo or magenta per shot | matches `Colors.accent.magenta` |
| Caption padding | 64pt vertical, 96pt horizontal | leaves device chrome breathable |
| Caption letter spacing | tight (Tracking.tight) | editorial discipline |

In Figma, mock the 1320×2868 frame once, place the captured PNG inside, and apply the caption overlay. Export each as PNG-24 (no transparency).

---

## App Store Connect upload

For each version of the listing (1.0 first submission):

1. App Store Connect → My Apps → XICO → 1.0 record → **Screenshots** section.
2. Select the 6.9" iPhone Display tab.
3. Drag the 5 PNGs in order. ASC auto-numbers them 1-5; the order you upload is the order users see.
4. Apple's preview will show how the App Store search result page looks with your 5 shots — verify the captions are legible in that scaled preview.
5. **Save** the version. (No need to publish until you're ready to submit.)

If ASC complains about resolution, the source PNG is the wrong size. Use `xcrun simctl io booted screenshot` with the iPhone 16 Pro Max profile — that produces native 1320×2868. Do not downscale or upscale; ASC rejects mismatched dimensions.

---

## Reduce-motion variants (optional but recommended)

Apple HIG asks that screenshot content be readable at standard text size + at largest Dynamic Type. If you have time, capture Shot 3 + Shot 4 in two flavors:

- Standard text size (default · what you'll capture above)
- Largest accessibility size: **Settings → Accessibility → Display & Text Size → Larger Text → Slider to max**

Submit only the standard version to ASC. Keep the large-text variant on file in case Apple Reviewer rejects citing Dynamic Type concerns.

---

## What's NOT in this brief

- Marketing video / App Preview — Apple optional, skip for v1
- iPad screenshots — XICO is iPhone-only for v1 (`app.json:supportsTablet` is false)
- Android / Play Store screenshots — XICO is iOS-only for v1
- Localized English screenshots — Spanish-first listing, English deferred

---

## Cost of getting this wrong

If you submit screenshots and Apple rejects, the rejection blocks the entire 1.0 submission. Typical rejection reasons:
- **Mismatched dimensions**: Apple requires exactly 1320×2868 (6.9") or one of the other named sizes. Off-by-one pixel rejects.
- **Misleading content**: screenshots show features or content not in the app (e.g., a faked rosetón with all 5 petals filled when the app doesn't actually fill them that way). Stick to real app states.
- **Privacy violations**: screenshots show personal data (email addresses, names, account IDs). Mask any real-looking data before uploading.
- **Text-only screenshots**: Apple rejects pure-text marketing slides as not representative of the app. Each screenshot must be an actual app screen with the caption as an overlay, not a full-frame caption with no app screen behind it.

Each rejection adds 24-48h to the launch timeline.

---

## Checklist to verify before clicking Save in ASC

- [ ] All 5 PNGs are exactly 1320×2868
- [ ] All 5 show real app states (not Photoshopped fake states)
- [ ] No personally-identifying information visible
- [ ] Captions are legible at App Store search-result scale
- [ ] Order matches the narrative arc: Rosetón → Ruta listing → Stop locked → Stop arrival → Re-entrada
- [ ] Status bar visible in all 5 (don't crop or hide it — Apple requires the real device chrome)
- [ ] No simulator-only artifacts visible (e.g., the location-services notification banner)
- [ ] Each file ≤ 2 MB (well within ASC's 10 MB per-shot ceiling)
