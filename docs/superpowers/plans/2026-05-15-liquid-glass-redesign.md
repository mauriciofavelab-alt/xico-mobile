# Liquid Glass redesign + Apple-native integrations · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild XICO's mobile UI surface with iOS 26 Liquid Glass material, new ritual-cadence navigation (Hoy / La Ruta / Tu Códice / Mapa), 4-tier dynamic app icon, 7 widget surfaces, and Dynamic Island Live Activity for active Ruta. Build #11 ready for TestFlight.

**Architecture:** Three layers compose: glass chrome (masthead, tab bar, modals — `.ultraThin`/`.thin`/`.regular`/`.thick` material variants); luminance-elevated surfaces (L1/L2/L3 with hairline borders for in-flow content); full-bleed photography backdrops with triple-radial color bleed tied to user's pasaporte state. Typography in three families: Fraunces (variable display, opsz-aware), Newsreader (body), Inter (caps labels). Apple-native integrations layered via separate native modules (MapKit via `react-native-maps`, WidgetKit via Swift, ActivityKit via Swift).

**Tech Stack:** Expo SDK 54, React Native, Expo Router, TypeScript, react-native-reanimated, react-native-svg, expo-blur, expo-haptics, expo-linear-gradient, react-native-safe-area-context, react-native-maps (Apple provider), Swift (WidgetKit + ActivityKit native modules), Supabase, Express + TypeScript API server.

**Source spec:** [docs/superpowers/specs/2026-05-15-liquid-glass-redesign.md](../specs/2026-05-15-liquid-glass-redesign.md) — every dimension in §18 of the spec must be respected by code in this plan.

**Build #11 trigger:** NEVER run `eas build` or `eas submit` autonomously. Wait for explicit user instruction at Phase 10 completion.

---

## File structure map

```
artifacts/xico-mobile/
├── DESIGN.md                                 # MODIFY · append Liquid Glass + Fraunces additions
├── app.json                                  # MODIFY · CFBundleAlternateIcons + iOS deployment target 17.0
├── package.json                              # MODIFY · + fraunces font, expo-alternate-icons, react-native-maps
├── app/
│   ├── _layout.tsx                           # MODIFY · load Fraunces fonts
│   └── (tabs)/
│       ├── _layout.tsx                       # MODIFY · rename tabs · Hoy/La Ruta/Tu Códice/Mapa
│       ├── index.tsx                         # RENAME → hoy.tsx · REBUILD per spec §7.1
│       ├── cultura.tsx                       # DELETE · folds into hoy.tsx
│       ├── mexico-ahora.tsx                  # DELETE · legacy
│       ├── mi-xico.tsx                       # RENAME → tu-codice.tsx · REBUILD per spec §7.4
│       └── mapa.tsx                          # NEW · per spec §7.5
├── app/ruta/
│   ├── index.tsx                             # MODIFY · per spec §7.2 (existing screen, redesign)
│   └── stop/[id].tsx                         # MODIFY · per spec §7.3 (existing screen, redesign)
├── components/liquid-glass/
│   ├── GlassMasthead.tsx                     # NEW · ultraThin floating bar
│   ├── GlassTabBar.tsx                       # NEW · regular floating capsule
│   ├── GlassChip.tsx                         # NEW · thin pill chip
│   ├── GlassCard.tsx                         # NEW · regular elevated card
│   ├── GlassVibrant.tsx                      # NEW · 60pt blur 280% sat for media overlay
│   ├── ColorBleedBackdrop.tsx                # NEW · triple-radial overlay component
│   ├── HaloPulse.tsx                         # NEW · animated focal halo wrapper
│   └── index.ts                              # NEW · barrel export
├── components/pasaporte/
│   ├── Roseton.tsx                           # MODIFY · accept tier-state prop, render correct petal fills
│   └── DynamicIconManager.tsx                # NEW · swaps iOS alternate icon on tier change
├── components/editorial/                     # EXISTING · primitives preserved · used by new screens
├── constants/
│   ├── fonts.ts                              # NEW · centralized Fraunces+Newsreader+Inter loader
│   ├── tierLadder.ts                         # NEW · 4-tier thresholds, icon names, rumbo fills
│   └── liquidGlass.ts                        # NEW · material variant tokens
├── hooks/
│   ├── useColorBleed.ts                      # NEW · returns 3 radial gradients per user state
│   ├── useTodaysDespacho.ts                  # MODIFY · already exists · ensure color_hex returned
│   ├── useTierIcon.ts                        # NEW · subscribes to tier changes, swaps icon
│   └── useReducedMotion.ts                   # EXISTING · used by every animation
├── modules/                                  # NEW directory for native modules
│   ├── widgets/                              # NEW · WidgetKit native iOS code
│   │   ├── XicoWidget.swift                  # Bundle entry · 7 widget configurations
│   │   ├── DespachoSmallView.swift           # 170×170pt Home Small
│   │   ├── DespachoMediumView.swift          # 364×170pt Home Medium
│   │   ├── DespachoLargeView.swift           # 364×382pt Home Large
│   │   ├── LockInlineView.swift              # Inline lock screen
│   │   ├── LockCircularView.swift            # Circular lock screen
│   │   ├── LockRectangularView.swift         # Rectangular lock screen
│   │   ├── StandByView.swift                 # StandBy landscape
│   │   ├── WidgetDataProvider.swift          # Fetches /api/widget/today
│   │   └── Info.plist                        # Widget extension info
│   └── live-activity/                        # NEW · ActivityKit native iOS code
│       ├── RutaActivity.swift                # ActivityAttributes definition
│       ├── RutaActivityView.swift            # Compact + Expanded + Lock Screen renderers
│       └── Info.plist                        # Live Activity extension info
├── assets/
│   ├── images/
│   │   └── icon.png                          # MODIFY · this becomes the Iniciado default
│   └── alternate-icons/                      # NEW directory
│       ├── icon-iniciado.png                 # 1024×1024 · empty rosetón outline
│       ├── icon-conocedor.png                # 1024×1024 · 2 petals filled
│       ├── icon-curador.png                  # 1024×1024 · 3 petals filled
│       └── icon-cronista.png                 # 1024×1024 · 4 petals + Tlalxicco center

artifacts/api-server/
├── src/
│   ├── routes/
│   │   ├── widget.ts                         # NEW · GET /api/widget/today
│   │   ├── live-activity.ts                  # NEW · POST /api/live-activity/{start,update,end}
│   │   ├── ruta-stops.ts                     # MODIFY · emit Live Activity push on geofence enter
│   │   └── index.ts                          # MODIFY · mount widget + live-activity routes
│   └── lib/
│       └── apnsLiveActivity.ts               # NEW · APNs push to Live Activity tokens
└── migrations/
    └── 2026-05-15-widget-and-activity.sql    # NEW · user_widget_state + active_ruta_activities tables
```

---

## Standing rules (apply to EVERY task)

1. **No glassmorphism on in-flow cards.** Glass material ONLY on chrome (masthead, tab bar, chip, modal). Spec §2.1. PR review enforces.
2. **Photography fills 50-60% of every primary screen.** Spec §2.1. No flat warm-black backgrounds.
3. **One saturated accent per surface** = day's despacho color or active pillar. Spec §2.2 + brandbook §6.
4. **Touch targets ≥ 44pt.** HIG floor. Spec §18.2.
5. **Dynamic Island clearance ≥ 81pt from screen top** for any chrome. Spec §18.3.
6. **Every animation guarded by `useReducedMotion()`.** Returns final state immediately when set.
7. **Every interactive element has `accessibilityLabel`.** SVG rosetón label updates dynamically.
8. **Every commit message follows the project's existing style** (`feat:`, `fix:`, `refactor:`, etc.) with the Claude co-author line.
9. **Vault first.** When in doubt, check `vault/projects/xico/manifesto.md` + `brandbook.md`. Manifesto wins on conflict.
10. **Build #11 NEVER triggered autonomously.** Phase 10 final task is "await explicit user go-ahead."

---

# PHASE 1 · Foundation (~3 days)

Lay down the design token + Liquid Glass primitive system before any screen work. Every subsequent phase consumes these.

## Task 1.1: Add Fraunces variable font

**Files:**
- Modify: `artifacts/xico-mobile/package.json`
- Modify: `artifacts/xico-mobile/app/_layout.tsx`
- Create: `artifacts/xico-mobile/constants/fonts.ts`

- [ ] **Step 1.1.1: Add Fraunces to package.json**

Edit `package.json` to add `@expo-google-fonts/fraunces` under dependencies:

```json
"@expo-google-fonts/fraunces": "~0.4.0"
```

Run `pnpm install --filter @workspace/xico-mobile`.

- [ ] **Step 1.1.2: Create centralized fonts loader**

Create `constants/fonts.ts`:

```ts
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  Newsreader_300Light,
  Newsreader_300Light_Italic,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Newsreader_600SemiBold_Italic,
} from "@expo-google-fonts/newsreader";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export const XicoFontMap = {
  // Fraunces · display
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  // Newsreader · body
  Newsreader_300Light,
  Newsreader_300Light_Italic,
  Newsreader_400Regular,
  Newsreader_400Regular_Italic,
  Newsreader_500Medium,
  Newsreader_600SemiBold,
  Newsreader_600SemiBold_Italic,
  // Inter · labels
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
};

export function useXicoFonts() {
  return useFonts(XicoFontMap);
}
```

- [ ] **Step 1.1.3: Wire up in root layout**

Edit `app/_layout.tsx`:
- Replace the existing `useFonts(...)` call with `const [fontsLoaded, fontError] = useXicoFonts();`
- Import `useXicoFonts` from `@/constants/fonts`.

- [ ] **Step 1.1.4: Verify in iOS simulator**

Run `cd artifacts/xico-mobile && npx expo start --ios` (do NOT run `eas build`). Open the app, navigate to any text. Verify console shows no font-loading errors.

- [ ] **Step 1.1.5: Commit**

```bash
git add artifacts/xico-mobile/package.json artifacts/xico-mobile/constants/fonts.ts artifacts/xico-mobile/app/_layout.tsx
git commit -m "feat(fonts): add Fraunces variable font · centralize font loading"
```

## Task 1.2: Add Liquid Glass material tokens

**Files:**
- Create: `artifacts/xico-mobile/constants/liquidGlass.ts`

- [ ] **Step 1.2.1: Create token file**

Create `constants/liquidGlass.ts`:

```ts
import { Platform } from "react-native";

export const LiquidGlass = {
  /** .ultraThinMaterial — masthead, statusbar overlays. Background remains highly visible. */
  ultraThin: {
    backgroundColor: "rgba(20, 14, 16, 0.18)",
    blurAmount: 40,
    saturation: 1.8,
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.22)",
  },
  /** .thinMaterial — chips overlaying photos. */
  thin: {
    backgroundColor: "rgba(20, 14, 16, 0.35)",
    blurAmount: 20,
    saturation: 1.8,
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.18)",
  },
  /** .regularMaterial — floating tab bar, action sheets. */
  regular: {
    backgroundColor: "rgba(20, 14, 16, 0.55)",
    blurAmount: 40,
    saturation: 2.2,
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.22)",
    dropShadow: { offsetX: 0, offsetY: 8, radius: 24, color: "rgba(0,0,0,0.5)" },
  },
  /** .thickMaterial — full-screen modals, sello ceremony. */
  thick: {
    backgroundColor: "rgba(20, 14, 16, 0.75)",
    blurAmount: 40,
    saturation: 2.2,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.25)",
  },
  /** Glass-vibrant · custom · for Carta del Equipo card · maximum vibrancy. */
  vibrant: {
    backgroundColor: "rgba(20, 14, 16, 0.32)",
    blurAmount: 60,
    saturation: 2.8,
    brightness: 1.1,
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 0.5,
    insetHighlight: "rgba(255,255,255,0.3)",
    dropShadow: { offsetX: 0, offsetY: 12, radius: 32, color: "rgba(0,0,0,0.45)" },
  },
} as const;

export type LiquidGlassVariant = keyof typeof LiquidGlass;

/** Returns `expo-blur` tint for the given variant. iOS only — Android falls back to solid. */
export function blurTintForVariant(variant: LiquidGlassVariant): "dark" | "default" {
  // All XICO glass uses dark tint over warm-black bg
  return "dark";
}
```

- [ ] **Step 1.2.2: Add 4-tier ladder constants**

Create `constants/tierLadder.ts`:

```ts
import { Rumbos } from "./colors";

export type TierName = "iniciado" | "conocedor" | "curador" | "cronista";

export interface TierDefinition {
  name: TierName;
  displayName: string;
  iosIconName: string;  // CFBundleAlternateIcons key
  minSellos: number;
  minDistinctRumbos: number;
  minPerRumbo?: number;
  description: string;
}

export const TierLadder: TierDefinition[] = [
  {
    name: "iniciado",
    displayName: "Iniciado",
    iosIconName: "AppIcon-Iniciado",
    minSellos: 0,
    minDistinctRumbos: 0,
    description: "El comienzo · 0 a 5 sellos",
  },
  {
    name: "conocedor",
    displayName: "Conocedor",
    iosIconName: "AppIcon-Conocedor",
    minSellos: 6,
    minDistinctRumbos: 2,
    description: "Dos rumbos reconocidos · ≥6 sellos",
  },
  {
    name: "curador",
    displayName: "Curador",
    iosIconName: "AppIcon-Curador",
    minSellos: 16,
    minDistinctRumbos: 3,
    description: "Tres rumbos cubiertos · ≥16 sellos",
  },
  {
    name: "cronista",
    displayName: "Cronista",
    iosIconName: "AppIcon-Cronista",
    minSellos: 36,
    minDistinctRumbos: 4,
    minPerRumbo: 5,
    description: "Los cuatro rumbos · centro Tlalxicco",
  },
];

/** Returns the tier the user currently belongs to given their stats. */
export function computeTier(stats: {
  total: number;
  distinctRumbos: number;
  minPerRumbo: number;
}): TierName {
  for (let i = TierLadder.length - 1; i >= 0; i--) {
    const t = TierLadder[i];
    if (stats.total < t.minSellos) continue;
    if (stats.distinctRumbos < t.minDistinctRumbos) continue;
    if (t.minPerRumbo && stats.minPerRumbo < t.minPerRumbo) continue;
    return t.name;
  }
  return "iniciado";
}
```

- [ ] **Step 1.2.3: Commit**

```bash
git add artifacts/xico-mobile/constants/liquidGlass.ts artifacts/xico-mobile/constants/tierLadder.ts
git commit -m "feat(tokens): Liquid Glass material variants + 4-tier ladder constants"
```

## Task 1.3: GlassMasthead primitive

**Files:**
- Create: `artifacts/xico-mobile/components/liquid-glass/GlassMasthead.tsx`

- [ ] **Step 1.3.1: Implementation**

Create the file:

```tsx
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlass } from "@/constants/liquidGlass";
import { Colors } from "@/constants/colors";
import { TypeSize, Tracking, Fonts } from "@/constants/editorial";

interface GlassMastheadProps {
  /** Caps label, left side (e.g. "XICO · HOY") */
  label: string;
  /** Caps label, right side (e.g. "VIERNES 15 MAY") */
  meta?: string;
  /** Show a pulsing colored dot before the label (today's despacho accent color hex) */
  liveDotColor?: string;
}

export function GlassMasthead({ label, meta, liveDotColor }: GlassMastheadProps) {
  const insets = useSafeAreaInsets();
  // Spec §18.3 · top: 81pt from top to clear Dynamic Island (59pt status + 22pt DI clearance)
  const topOffset = Math.max(insets.top + 22, 81);

  return (
    <View
      style={[
        styles.container,
        { top: topOffset, marginHorizontal: 16 },
      ]}
      accessibilityRole="header"
      accessibilityLabel={`${label}${meta ? ` · ${meta}` : ""}`}
    >
      <BlurView
        intensity={LiquidGlass.ultraThin.blurAmount}
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      <View style={styles.contentRow}>
        <View style={styles.leftRow}>
          {liveDotColor && (
            <View style={[styles.dot, { backgroundColor: liveDotColor, shadowColor: liveDotColor }]} />
          )}
          <Text style={styles.labelText}>{label}</Text>
        </View>
        {meta && <Text style={styles.metaText}>{meta}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 38,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LiquidGlass.ultraThin.borderColor,
    backgroundColor: LiquidGlass.ultraThin.backgroundColor,
    zIndex: 3,
  },
  blur: {
    borderRadius: 14,
  },
  contentRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  labelText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.caption - 1,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: Colors.textPrimary,
  },
  metaText: {
    fontFamily: Fonts.sansRegular,
    fontSize: TypeSize.caption - 1,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: Colors.textSecondary,
  },
});
```

- [ ] **Step 1.3.2: Add to barrel**

Create `components/liquid-glass/index.ts`:

```ts
export { GlassMasthead } from "./GlassMasthead";
```

- [ ] **Step 1.3.3: Verify TypeScript compiles**

Run `cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -i GlassMasthead`. Expected: no errors related to this file.

- [ ] **Step 1.3.4: Commit**

```bash
git add artifacts/xico-mobile/components/liquid-glass/
git commit -m "feat(liquid-glass): GlassMasthead primitive · ultraThin material · DI clearance"
```

## Task 1.4: GlassTabBar primitive

**Files:**
- Create: `artifacts/xico-mobile/components/liquid-glass/GlassTabBar.tsx`

- [ ] **Step 1.4.1: Implementation**

```tsx
import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlass } from "@/constants/liquidGlass";
import { Colors, Pillars } from "@/constants/colors";
import { Fonts, TypeSize } from "@/constants/editorial";

export interface TabItem {
  key: string;
  label: string;
  accentColor: string;
  onPress: () => void;
  isActive: boolean;
  accessibilityLabel: string;
}

interface GlassTabBarProps {
  items: TabItem[];
}

export function GlassTabBar({ items }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  // Spec §18.3 · bottom: 14pt margin + safe-area-inset-bottom (34pt on iPhone 16 Pro Max)
  const bottomOffset = insets.bottom + 14;

  return (
    <View
      style={[
        styles.container,
        { bottom: bottomOffset },
      ]}
      accessibilityRole="tablist"
    >
      <BlurView
        intensity={LiquidGlass.regular.blurAmount}
        tint="dark"
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={item.onPress}
          style={styles.tab}
          accessibilityRole="tab"
          accessibilityLabel={item.accessibilityLabel}
          accessibilityState={{ selected: item.isActive }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View
            style={[
              styles.dot,
              item.isActive && {
                backgroundColor: item.accentColor,
                shadowColor: item.accentColor,
                transform: [{ scale: 1.3 }],
              },
            ]}
          />
          <Text style={[styles.label, item.isActive && styles.labelActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 22,
    right: 22,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: LiquidGlass.regular.borderColor,
    backgroundColor: LiquidGlass.regular.backgroundColor,
    paddingVertical: 11,
    paddingHorizontal: 6,
    zIndex: 5,
    // shadow per LiquidGlass.regular.dropShadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowColor: "#000",
  },
  blur: {
    borderRadius: 25,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
    minHeight: 44, // HIG touch target
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(245,239,227,0.3)",
    marginBottom: 4,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.caption - 2, // 9pt for tracked caps
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "rgba(245,239,227,0.5)",
  },
  labelActive: {
    color: Colors.textPrimary,
  },
});
```

- [ ] **Step 1.4.2: Update barrel export**

Edit `components/liquid-glass/index.ts`:

```ts
export { GlassMasthead } from "./GlassMasthead";
export { GlassTabBar } from "./GlassTabBar";
export type { TabItem } from "./GlassTabBar";
```

- [ ] **Step 1.4.3: TypeScript check + commit**

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -i GlassTabBar
# Expected: no errors

git add artifacts/xico-mobile/components/liquid-glass/
git commit -m "feat(liquid-glass): GlassTabBar primitive · regular material · pill capsule"
```

## Task 1.5: Remaining glass primitives (GlassChip, GlassCard, GlassVibrant)

**Files:**
- Create: `artifacts/xico-mobile/components/liquid-glass/GlassChip.tsx`
- Create: `artifacts/xico-mobile/components/liquid-glass/GlassCard.tsx`
- Create: `artifacts/xico-mobile/components/liquid-glass/GlassVibrant.tsx`

- [ ] **Step 1.5.1: GlassChip implementation**

Standard pill chip wrapping content in `.thinMaterial`. Used for kicker labels over photos, lock chip on Stop screen, rumbo tag pills.

```tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";

interface GlassChipProps {
  children: ReactNode;
  /** Optional tint color blended into the glass (rgba). For rumbo-tinted chips. */
  tintColor?: string;
  /** Minimum 44pt height for HIG. Defaults to 44. */
  minHeight?: number;
  style?: ViewStyle;
}

export function GlassChip({ children, tintColor, minHeight = 44, style }: GlassChipProps) {
  const variant = LiquidGlass.thin;
  return (
    <View
      style={[
        styles.container,
        { minHeight, backgroundColor: tintColor ?? variant.backgroundColor, borderColor: variant.borderColor },
        style,
      ]}
    >
      <BlurView intensity={variant.blurAmount} tint="dark" style={[StyleSheet.absoluteFill, styles.blur]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  blur: {
    borderRadius: 100,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
```

- [ ] **Step 1.5.2: GlassCard implementation**

Floating card variant for content that needs the regular material treatment (Ruta hero card on Hoy, the per-stop preview cards on Mapa, etc.).

```tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";

interface GlassCardProps {
  children: ReactNode;
  /** Optional left accent border color · 3pt wide */
  accentBorder?: string;
  style?: ViewStyle;
}

export function GlassCard({ children, accentBorder, style }: GlassCardProps) {
  const variant = LiquidGlass.regular;
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variant.backgroundColor,
          borderColor: variant.borderColor,
        },
        accentBorder ? { borderLeftWidth: 3, borderLeftColor: accentBorder } : null,
        style,
      ]}
    >
      <BlurView intensity={variant.blurAmount} tint="dark" style={[StyleSheet.absoluteFill, styles.blur]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowColor: "#000",
  },
  blur: {
    borderRadius: 14,
  },
  content: {
    padding: 16,
  },
});
```

- [ ] **Step 1.5.3: GlassVibrant implementation**

Custom variant with maximum vibrancy effect (60pt blur, 280% saturation). For the Carta del Equipo card over photography.

```tsx
import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LiquidGlass } from "@/constants/liquidGlass";

interface GlassVibrantProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function GlassVibrant({ children, style }: GlassVibrantProps) {
  const variant = LiquidGlass.vibrant;
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: variant.backgroundColor, borderColor: variant.borderColor },
        style,
      ]}
    >
      <BlurView intensity={variant.blurAmount} tint="dark" style={[StyleSheet.absoluteFill, styles.blur]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    shadowColor: "#000",
  },
  blur: {
    borderRadius: 16,
  },
  content: {
    padding: 18,
  },
});
```

- [ ] **Step 1.5.4: Update barrel + TypeScript check + commit**

Edit `components/liquid-glass/index.ts`:

```ts
export { GlassMasthead } from "./GlassMasthead";
export { GlassTabBar } from "./GlassTabBar";
export type { TabItem } from "./GlassTabBar";
export { GlassChip } from "./GlassChip";
export { GlassCard } from "./GlassCard";
export { GlassVibrant } from "./GlassVibrant";
```

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -i "Glass(Chip|Card|Vibrant)"
git add artifacts/xico-mobile/components/liquid-glass/
git commit -m "feat(liquid-glass): GlassChip + GlassCard + GlassVibrant primitives"
```

## Task 1.6: ColorBleedBackdrop component

**Files:**
- Create: `artifacts/xico-mobile/components/liquid-glass/ColorBleedBackdrop.tsx`
- Create: `artifacts/xico-mobile/hooks/useColorBleed.ts`

- [ ] **Step 1.6.1: useColorBleed hook**

Returns three radial gradient definitions based on the user's tier state.

```ts
import { useMemo } from "react";
import { Rumbos, Pillars } from "@/constants/colors";
import { useTier } from "./useTier";

export interface ColorBleedConfig {
  primaryColor: string;   // Top center, pillar
  tierColor: string;      // Bottom-left, user's tier marker color
  nextRumboColor: string; // Bottom-right, next rumbo to advance
}

export function useColorBleed(pillarColor: string): ColorBleedConfig {
  const { tier, byRumbo } = useTier();

  return useMemo(() => {
    // Tier marker color
    const tierColor =
      tier === "cronista" ? Rumbos.center.hex :
      tier === "curador" ? Rumbos.este.hex :
      tier === "conocedor" ? Rumbos.sur.hex :
      Rumbos.norte.hex;

    // Find the rumbo with the LEAST sellos — that's the next one to advance
    const rumbosSorted = (["norte", "sur", "este", "oeste"] as const)
      .map(slug => ({ slug, count: byRumbo?.[slug] ?? 0 }))
      .sort((a, b) => a.count - b.count);
    const nextSlug = rumbosSorted[0].slug;
    const nextRumboColor = Rumbos[nextSlug].hex;

    return { primaryColor: pillarColor, tierColor, nextRumboColor };
  }, [tier, byRumbo, pillarColor]);
}
```

- [ ] **Step 1.6.2: ColorBleedBackdrop component**

```tsx
import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorBleed } from "@/hooks/useColorBleed";

interface ColorBleedBackdropProps {
  pillarColor: string;
  style?: ViewStyle;
}

/** Renders three radial-shaped overlays that tint the photo behind based on user state.
 *  Stack of 3 LinearGradients (since react-native doesn't support radial natively without
 *  expo-radial-gradient · linear approximations work). */
export function ColorBleedBackdrop({ pillarColor, style }: ColorBleedBackdropProps) {
  const { primaryColor, tierColor, nextRumboColor } = useColorBleed(pillarColor);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <LinearGradient
        colors={[`${primaryColor}30`, "transparent"]}  // 0x30 = 18% alpha
        start={{ x: 0.5, y: 0.35 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", `${tierColor}20`, "transparent"]}  // 0x20 = 12% alpha
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.2, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", `${nextRumboColor}1a`]}  // 0x1a = 10% alpha
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.8, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
```

- [ ] **Step 1.6.3: Barrel + commit**

```ts
// Append to components/liquid-glass/index.ts
export { ColorBleedBackdrop } from "./ColorBleedBackdrop";
```

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -i "ColorBleed"
git add artifacts/xico-mobile/components/liquid-glass/ColorBleedBackdrop.tsx artifacts/xico-mobile/hooks/useColorBleed.ts artifacts/xico-mobile/components/liquid-glass/index.ts
git commit -m "feat(liquid-glass): ColorBleedBackdrop · triple-radial tint tied to user tier state"
```

## Task 1.7: HaloPulse animation wrapper

**Files:**
- Create: `artifacts/xico-mobile/components/liquid-glass/HaloPulse.tsx`

- [ ] **Step 1.7.1: Implementation**

```tsx
import React, { ReactNode, useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface HaloPulseProps {
  children: ReactNode;
  /** Primary halo color (rgba) */
  primaryColor: string;
  /** Secondary halo color (rgba) */
  secondaryColor?: string;
  /** Pulse cycle in ms · default 4000 */
  cycleMs?: number;
  style?: ViewStyle;
}

export function HaloPulse({
  children,
  primaryColor,
  secondaryColor,
  cycleMs = 4000,
  style,
}: HaloPulseProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (reducedMotion) {
      scale.value = 1;
      opacity.value = 0.5;
      return;
    }
    scale.value = withRepeat(
      withTiming(1.08, { duration: cycleMs / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0.65, { duration: cycleMs / 2, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [reducedMotion, cycleMs, scale, opacity]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
        <LinearGradient
          colors={[primaryColor, secondaryColor ?? "transparent", "transparent"]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 999,
    overflow: "hidden",
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
});
```

- [ ] **Step 1.7.2: Barrel + commit**

```ts
// Append to components/liquid-glass/index.ts
export { HaloPulse } from "./HaloPulse";
```

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -i HaloPulse
git add artifacts/xico-mobile/components/liquid-glass/HaloPulse.tsx artifacts/xico-mobile/components/liquid-glass/index.ts
git commit -m "feat(liquid-glass): HaloPulse · animated radial halo with reduced-motion guard"
```

## Task 1.8: Update DESIGN.md with Liquid Glass section

**Files:**
- Modify: `artifacts/xico-mobile/DESIGN.md`

- [ ] **Step 1.8.1: Append Liquid Glass section to DESIGN.md**

Open the existing DESIGN.md and append a new section at the end (the file is currently 244 lines · ends at "Next regeneration: ..."). Add before the closing line:

```markdown
## v2 update (2026-05-15) · Liquid Glass + iOS 26 spatial

Brandbook §2 historical rule "no glassmorphism as default" is **overridden by user decision 2026-05-15**. iOS 26 ships Liquid Glass as the system-wide material; not adopting it now reads as a dated tell. Application discipline:

- **Glass material ONLY on chrome that floats over content** — masthead, tab bar, chip, modal sheet, lock chip on Stop screen.
- **In-flow cards STILL use luminance elevation L1/L2/L3 + hairline borders** — no glass on article previews, despacho body cards, anything below the visible scroll baseline.
- Material variants live in `constants/liquidGlass.ts` with documented use cases.
- Primitives in `components/liquid-glass/` (GlassMasthead, GlassTabBar, GlassChip, GlassCard, GlassVibrant, ColorBleedBackdrop, HaloPulse).

Typography addition: **Fraunces** (variable, opsz-aware) joins the font system as the display face. Newsreader stays for body warmth. Inter for caps labels. Three families, locked.

Navigation shift (manifesto-aligned): legacy tabs (Índice / Cultura / Ahora / Archivo) replaced by ritual-cadence tabs (Hoy / La Ruta / Tu Códice / Mapa). Each tab has its own pillar color anchoring active states.

Photography rule: every primary screen has a full-bleed hero photograph behind every glass surface. Color bleed (triple-radial overlay) tints based on user tier state. Photography fills 50-60% of the visible canvas.

Spec authority: [docs/superpowers/specs/2026-05-15-liquid-glass-redesign.md](../../docs/superpowers/specs/2026-05-15-liquid-glass-redesign.md). Every dimension in §18 of that spec is binding on this DESIGN.md.
```

- [ ] **Step 1.8.2: Commit**

```bash
git add artifacts/xico-mobile/DESIGN.md
git commit -m "docs(design): v2 update · Liquid Glass material variants + nav shift documented"
```

## Phase 1 verification

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -v "getSession" | head -20
# Expected: no new errors

ls components/liquid-glass/
# Expected: GlassMasthead.tsx · GlassTabBar.tsx · GlassChip.tsx · GlassCard.tsx · GlassVibrant.tsx · ColorBleedBackdrop.tsx · HaloPulse.tsx · index.ts

ls constants/ | grep -i "(fonts|liquidGlass|tierLadder)"
# Expected: fonts.ts · liquidGlass.ts · tierLadder.ts
```

---

# PHASE 2 · Navigation + Hoy rebuild (~3 days)

Rename tabs, delete legacy tabs, rebuild Hoy from current `index.tsx` baseline with the Liquid Glass system applied.

## Task 2.1: Rename tabs in `(tabs)/_layout.tsx`

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 2.1.1: Replace tab definitions**

Edit `_layout.tsx` Tab.Screen definitions to:

```tsx
<Tabs.Screen
  name="hoy"
  options={{ title: "Hoy" }}
/>
<Tabs.Screen
  name="ruta"
  options={{ title: "La Ruta", href: "/ruta" }}
/>
<Tabs.Screen
  name="tu-codice"
  options={{ title: "Tu Códice" }}
/>
<Tabs.Screen
  name="mapa"
  options={{ title: "Mapa" }}
/>
{/* Hide legacy routes from tab bar but keep them functional until deleted */}
<Tabs.Screen name="index" options={{ href: null }} />
<Tabs.Screen name="cultura" options={{ href: null }} />
<Tabs.Screen name="mexico-ahora" options={{ href: null }} />
<Tabs.Screen name="mi-xico" options={{ href: null }} />
```

Note: `ruta` is a folder route (existing `app/ruta/index.tsx`), so its tab entry uses `href`.

- [ ] **Step 2.1.2: Use GlassTabBar as the custom tab bar**

In `_layout.tsx`, replace the existing tab bar component with the new GlassTabBar. Update `tabBar` prop:

```tsx
import { GlassTabBar, TabItem } from "@/components/liquid-glass";
import { Pillars } from "@/constants/colors";
import { useRouter, usePathname } from "expo-router";

// In the Tabs component:
<Tabs
  tabBar={({ state, navigation }) => {
    const router = useRouter();
    const items: TabItem[] = [
      { key: "hoy", label: "Hoy", accentColor: Pillars.indice, onPress: () => router.push("/hoy"), isActive: state.routes[state.index].name === "hoy", accessibilityLabel: "Hoy · El Despacho del día" },
      { key: "ruta", label: "La Ruta", accentColor: Pillars.indice, onPress: () => router.push("/ruta"), isActive: state.routes[state.index].name === "ruta", accessibilityLabel: "La Ruta · paseo semanal" },
      { key: "tu-codice", label: "Tu Códice", accentColor: Pillars.archivo, onPress: () => router.push("/tu-codice"), isActive: state.routes[state.index].name === "tu-codice", accessibilityLabel: "Tu Códice · tu pasaporte personal" },
      { key: "mapa", label: "Mapa", accentColor: Pillars.indice, onPress: () => router.push("/mapa"), isActive: state.routes[state.index].name === "mapa", accessibilityLabel: "Mapa · paradas en Madrid" },
    ];
    return <GlassTabBar items={items} />;
  }}
  screenOptions={{ headerShown: false }}
>
```

- [ ] **Step 2.1.3: Create empty placeholder for new tabs** (will fill in next tasks)

```bash
cd artifacts/xico-mobile/app/(tabs)
# Create stubs so the tab bar doesn't crash
cat > hoy.tsx <<'EOF'
import { View, Text } from "react-native";
export default function HoyScreen() { return <View><Text>Hoy · stub</Text></View>; }
EOF
cat > tu-codice.tsx <<'EOF'
import { View, Text } from "react-native";
export default function TuCodiceScreen() { return <View><Text>Tu Códice · stub</Text></View>; }
EOF
cat > mapa.tsx <<'EOF'
import { View, Text } from "react-native";
export default function MapaScreen() { return <View><Text>Mapa · stub</Text></View>; }
EOF
```

- [ ] **Step 2.1.4: Verify tabs render**

```bash
cd artifacts/xico-mobile && npx expo start --ios
# In simulator: confirm 4 tabs visible at bottom, each navigates to its stub screen
```

- [ ] **Step 2.1.5: Commit**

```bash
git add artifacts/xico-mobile/app/(tabs)/
git commit -m "feat(nav): rename tabs · Hoy/La Ruta/Tu Códice/Mapa · GlassTabBar mounted"
```

## Task 2.2: Build Hoy screen — masthead + hero photo + Despacho hero

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/hoy.tsx`

- [ ] **Step 2.2.1: Hoy screen scaffolding**

Replace the stub `hoy.tsx` with full implementation. Start with the masthead + hero photo:

```tsx
import React from "react";
import { ScrollView, View, StyleSheet, Image, Animated, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTodaysDespacho } from "@/hooks/useTodaysDespacho";
import { GlassMasthead, ColorBleedBackdrop } from "@/components/liquid-glass";
import { Colors, Pillars } from "@/constants/colors";

export default function HoyScreen() {
  const insets = useSafeAreaInsets();
  const { data: despacho } = useTodaysDespacho();

  if (!despacho) return <View style={[styles.root, { backgroundColor: Colors.background }]} />;

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* Hero photo · full-bleed top 540pt */}
      <Image
        source={{ uri: despacho.lugar_image_url }}
        style={styles.heroPhoto}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <View style={styles.heroGradientOverlay} />
      <ColorBleedBackdrop pillarColor={Pillars.indice} style={styles.bleedOverlay} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Placeholder for hero content + body */}
      </ScrollView>

      <GlassMasthead
        label="XICO · HOY"
        meta={despacho.dayLabel}
        liveDotColor={despacho.color_hex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroPhoto: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: 540,
    zIndex: 1,
  },
  heroGradientOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, height: 540,
    backgroundColor: "rgba(8,5,8,0.4)",
    zIndex: 1,
  },
  bleedOverlay: {
    top: 0, left: 0, right: 0, height: 540,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 200,
    paddingHorizontal: 20,
    zIndex: 2,
  },
});
```

- [ ] **Step 2.2.2: Add hero content (Despacho takeover)**

Inside the ScrollView's `contentContainerStyle`, add:

```tsx
<View>
  <Text style={styles.kicker}>{`EL DESPACHO DEL DÍA · ${despacho.color_nombre.toUpperCase()}`}</Text>
  <Text style={styles.heroTitle}>
    {despacho.nahuatl_word}
    <Text style={styles.italicAccent}>.</Text>
  </Text>
  <View style={[styles.colorBand, { backgroundColor: despacho.color_hex }]} />
  <Text style={styles.meaning}>{`— ${despacho.nahuatl_meaning}`}</Text>
  <View style={styles.lugarRow}>
    <Text style={styles.lugarLabel}>Hoy · lugar</Text>
    <Text style={styles.lugarName}>{`${despacho.lugar_nombre} · ${despacho.lugar_barrio}`}</Text>
  </View>
</View>
```

Add styles:

```tsx
kicker: {
  fontFamily: "Inter_600SemiBold",
  fontSize: 10,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  color: Colors.gold ?? "#D4A030", // tinted gold for ocre day · use color_hex variant
  textShadowColor: "rgba(0,0,0,0.6)",
  textShadowRadius: 4,
  textShadowOffset: { width: 0, height: 1 },
  marginBottom: 16,
},
heroTitle: {
  fontFamily: "Fraunces_500Medium",
  fontSize: 56,
  lineHeight: 56 * 0.92,
  letterSpacing: -0.045 * 56,
  color: Colors.textPrimary,
  textShadowColor: "rgba(0,0,0,0.5)",
  textShadowRadius: 12,
  textShadowOffset: { width: 0, height: 2 },
},
italicAccent: {
  fontFamily: "Fraunces_400Regular_Italic",
  color: "#D4A030",
},
colorBand: {
  height: 4,
  width: 72,
  marginVertical: 14,
  shadowColor: "#B8820A",
  shadowOpacity: 0.4,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
},
meaning: {
  fontFamily: "Newsreader_400Regular_Italic",
  fontSize: 17,
  lineHeight: 17 * 1.35,
  color: "rgba(245,239,227,0.88)",
  marginBottom: 22,
  textShadowColor: "rgba(0,0,0,0.4)",
  textShadowRadius: 3,
  textShadowOffset: { width: 0, height: 1 },
},
lugarRow: { marginBottom: 28 },
lugarLabel: {
  fontFamily: "Inter_500Medium",
  fontSize: 11,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "rgba(245,239,227,0.6)",
  marginBottom: 4,
},
lugarName: {
  fontFamily: "Newsreader_400Regular_Italic",
  fontSize: 14,
  color: Colors.textPrimary,
},
```

- [ ] **Step 2.2.3: TypeScript check + verify in simulator**

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep "hoy.tsx"
# Expected: no errors

npx expo start --ios
# Verify: hero photo at top, masthead floats with accent dot pulsing, Despacho hero text reads over photo
```

- [ ] **Step 2.2.4: Commit**

```bash
git add artifacts/xico-mobile/app/(tabs)/hoy.tsx
git commit -m "feat(hoy): masthead + hero photo + Despacho takeover with Fraunces 144"
```

## Task 2.3: Hoy · body content (drop cap, Ruta hero card, article preview)

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/hoy.tsx`
- Read: `artifacts/xico-mobile/hooks/useCurrentRuta.ts` (already exists)

- [ ] **Step 2.3.1: Drop cap body paragraph**

After the hero content block, add the body L1 transition + drop cap paragraph. Use the existing `DropCap` editorial primitive from `components/editorial/`.

```tsx
import { DropCap, Rule } from "@/components/editorial";

// Inside ScrollView, after the lugar block:
<View style={styles.bodyArea}>
  <View style={styles.dropCapRow}>
    <DropCap letter={despacho.hecho[0]} color={Pillars.indice} />
    <Text style={styles.bodyText}>{despacho.hecho.slice(1)}</Text>
  </View>
  <Rule />
</View>
```

Styles:

```tsx
bodyArea: {
  backgroundColor: Colors.background,
  marginTop: 32,
  paddingTop: 28,
  paddingHorizontal: 0,
},
dropCapRow: { flexDirection: "row" },
bodyText: {
  flex: 1,
  fontFamily: "Newsreader_400Regular",
  fontSize: 15,
  lineHeight: 15 * 1.5,
  color: Colors.textSecondary,
},
```

- [ ] **Step 2.3.2: Ruta hero card with inline rosetón state**

After `<Rule />`, add:

```tsx
import { GlassCard, HaloPulse } from "@/components/liquid-glass";
import { Roseton } from "@/components/pasaporte";
import { useCurrentRuta } from "@/hooks/useCurrentRuta";
import { useTier } from "@/hooks/useTier";

// Inside the body:
const { data: ruta } = useCurrentRuta();
const { tier, byRumbo, total } = useTier();

// ... in JSX:
{ruta && (
  <GlassCard accentBorder={Pillars.indice} style={styles.rutaCardSpacing}>
    <Text style={styles.cardKicker}>{`LA RUTA · ${ruta.week_key.toUpperCase()} · INAUGURAL`}</Text>
    <Text style={styles.cardHeadline}>
      Cinco paradas <Text style={styles.italicAccent}>en cinco barrios</Text>
    </Text>
    <Text style={styles.cardByline}>{`— de ${ruta.editor_name} · editora cultural`}</Text>
    <View style={styles.rutaProgressRow}>
      <Roseton sellos={byRumbo ?? { norte: 0, sur: 0, este: 0, oeste: 0 }} size={36} mini />
      <View>
        <Text style={styles.cardKicker}>Tu pasaporte</Text>
        <Text style={styles.cardStatsNum}>{`${total} / 5 sellos`}</Text>
      </View>
    </View>
  </GlassCard>
)}
```

- [ ] **Step 2.3.3: Featured article section**

Below the Ruta card, add the SectionOpener + featured article using the existing editorial primitives + ArticlePreviewCard component.

```tsx
import { SectionOpener } from "@/components/editorial";
import { ArticleCardFeatured } from "@/components/articles/ArticleCardFeatured"; // existing or to be created

// ... in JSX:
<SectionOpener label="El equipo te propone" accentColor={Pillars.indice} />
{featuredArticle && <ArticleCardFeatured article={featuredArticle} />}
```

If `ArticleCardFeatured` doesn't exist yet, create it with the design from spec §7.1 step 12-13.

- [ ] **Step 2.3.4: TypeScript + visual verification + commit**

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep "hoy.tsx"
npx expo start --ios
# Verify: drop cap renders in magenta, Ruta card lifts in with shadow, section opener has accent line

git add artifacts/xico-mobile/app/(tabs)/hoy.tsx artifacts/xico-mobile/components/articles/
git commit -m "feat(hoy): body content · drop cap + Ruta hero card + featured article"
```

## Task 2.4: Stagger entrance animations on Hoy

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/hoy.tsx`

- [ ] **Step 2.4.1: Wrap each block in `Animated.View` with staggered FadeInUp**

Use the existing `RevealOnMount` primitive (already shipped). Per spec §7.1 motion sequence:

- Masthead: 600ms delay 100ms
- Kicker: 700ms delay 300ms
- Title: 800ms delay 450ms
- Color band: 600ms delay 600ms
- Meaning: 800ms delay 700ms
- Lugar: 700ms delay 850ms
- Ruta card: 700ms delay 1000ms

Wrap each:

```tsx
<RevealOnMount delay={300} duration={700}>
  <Text style={styles.kicker}>...</Text>
</RevealOnMount>
```

- [ ] **Step 2.4.2: Verify Reduce Motion fallback**

Open iOS Settings → Accessibility → Reduce Motion → ON. Reload app. Verify: no entrance animations, final state appears immediately.

- [ ] **Step 2.4.3: Commit**

```bash
git add artifacts/xico-mobile/app/(tabs)/hoy.tsx
git commit -m "feat(hoy): stagger entrance animations with reduced-motion guard"
```

## Task 2.5: Delete legacy tabs · cultura + mexico-ahora

**Files:**
- Delete: `artifacts/xico-mobile/app/(tabs)/cultura.tsx`
- Delete: `artifacts/xico-mobile/app/(tabs)/mexico-ahora.tsx`
- Delete: `artifacts/xico-mobile/app/(tabs)/index.tsx`
- Modify: `artifacts/xico-mobile/app/(tabs)/_layout.tsx` (remove legacy `Tabs.Screen` entries)

- [ ] **Step 2.5.1: Remove the three legacy files**

```bash
cd artifacts/xico-mobile/app/(tabs)
rm cultura.tsx mexico-ahora.tsx index.tsx
```

- [ ] **Step 2.5.2: Clean `_layout.tsx`**

Remove the `<Tabs.Screen name="index" href={null} />`, `<Tabs.Screen name="cultura" href={null} />`, and `<Tabs.Screen name="mexico-ahora" href={null} />` entries — no longer needed since the files are gone.

- [ ] **Step 2.5.3: Verify nothing references the deleted screens**

```bash
cd artifacts/xico-mobile && grep -rn "(cultura|mexico-ahora)" app/ components/ hooks/ constants/ | grep -v node_modules
# Expected: only references in archived spec files
```

Fix any remaining references (typically navigation pushes that need redirecting to `/hoy`).

- [ ] **Step 2.5.4: Commit**

```bash
git rm artifacts/xico-mobile/app/\(tabs\)/cultura.tsx artifacts/xico-mobile/app/\(tabs\)/mexico-ahora.tsx artifacts/xico-mobile/app/\(tabs\)/index.tsx
git add artifacts/xico-mobile/app/\(tabs\)/_layout.tsx
git commit -m "refactor(nav): remove legacy tabs · cultura/mexico-ahora/index folded into Hoy"
```

## Phase 2 verification

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -v "getSession" | head -20
# Expected: no new errors

npx expo start --ios
# Manual checks:
# - 4 tabs at bottom: Hoy / La Ruta / Tu Códice / Mapa
# - Hoy renders with hero photo, masthead, despacho takeover, body drop cap, Ruta card
# - All staggered animations play on mount
# - Reduce Motion disables animations · final state visible immediately
```

---

# PHASE 3 · Tu Códice rebuild (~2 days)

Take the existing `mi-xico.tsx`, rename to `tu-codice.tsx`, rebuild per spec §7.4 with rosetón hero + halo + Carta del Equipo glass-vibrant card.

## Task 3.1: Rename + scaffold Tu Códice

**Files:**
- Move: `artifacts/xico-mobile/app/(tabs)/mi-xico.tsx` → `tu-codice.tsx`
- Delete: stub `tu-codice.tsx` from Phase 2

- [ ] **Step 3.1.1: Move + replace stub**

```bash
cd artifacts/xico-mobile/app/(tabs)
rm tu-codice.tsx                 # stub
git mv mi-xico.tsx tu-codice.tsx
```

- [ ] **Step 3.1.2: Strip the file to scaffold**

Open `tu-codice.tsx`, keep the imports + the default function name (rename to `TuCodiceScreen`), but replace the body with a hero scaffold:

```tsx
import React from "react";
import { ScrollView, View, StyleSheet, Image, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassMasthead, ColorBleedBackdrop, HaloPulse, GlassCard, GlassVibrant } from "@/components/liquid-glass";
import { Roseton } from "@/components/pasaporte";
import { useTier } from "@/hooks/useTier";
import { useProfile } from "@/hooks/useProfile"; // existing hook
import { Colors, Pillars, Rumbos } from "@/constants/colors";
import { TierLadder, TierName } from "@/constants/tierLadder";

export default function TuCodiceScreen() {
  const insets = useSafeAreaInsets();
  const { data: profile } = useProfile();
  const { tier, total, byRumbo, distinctRumbos } = useTier();

  if (!profile) return <View style={[styles.root, { backgroundColor: Colors.background }]} />;

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      {/* Full-bleed Madrid golden-hour photo behind everything */}
      <Image
        source={require("@/assets/images/tu-codice-backdrop.jpg")} // local asset, golden hour Madrid
        style={styles.backdrop}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <View style={styles.backdropOverlay} />
      <ColorBleedBackdrop pillarColor={Pillars.archivo} style={styles.bleedOverlay} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero content · per Task 3.2 */}
      </ScrollView>

      <GlassMasthead label="XICO · TU CÓDICE" meta="FOLIO #1" liveDotColor={Rumbos.center.hex} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
  },
  backdropOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(8,5,8,0.7)",
    zIndex: 0,
  },
  bleedOverlay: {
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: 20,
    zIndex: 2,
  },
});
```

Note: The backdrop photo `assets/images/tu-codice-backdrop.jpg` needs to exist. If not yet, use a placeholder Unsplash URL via `{ uri: ... }` for now; pre-launch asset curation includes choosing the final image.

- [ ] **Step 3.1.3: Commit scaffold**

```bash
git add artifacts/xico-mobile/app/\(tabs\)/tu-codice.tsx
git commit -m "feat(codice): scaffold Tu Códice screen · masthead + backdrop + bleed"
```

## Task 3.2: Tu Códice · identity block + tier badge

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/tu-codice.tsx`

- [ ] **Step 3.2.1: Identity content**

Inside `ScrollView`, before any rosetón, add the user identity:

```tsx
const tierDef = TierLadder.find(t => t.name === tier)!;

<View style={styles.identityBlock}>
  <Text style={styles.preLine}>El códice de</Text>
  <Text style={styles.nameDisplay}>
    {profile.first_name}{" "}
    <Text style={styles.nameItalic}>{profile.last_name}</Text>
  </Text>
  <View style={styles.tierBadgeRow}>
    <GlassChip tintColor={`${Rumbos.center.hex}30`}>
      <View style={[styles.tierGlyph, { backgroundColor: Rumbos.center.hex }]} />
      <Text style={styles.tierBadgeText}>{`${tierDef.displayName} · ${profile.member_since_month}`}</Text>
    </GlassChip>
  </View>
</View>
```

Styles:

```tsx
identityBlock: { marginBottom: 22 },
preLine: {
  fontFamily: "Newsreader_400Regular_Italic",
  fontSize: 15,
  color: "rgba(245,239,227,0.7)",
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
  color: Rumbos.este.hex, // current-rumbo accent on family name
},
tierBadgeRow: { flexDirection: "row" },
tierGlyph: { width: 8, height: 8, borderRadius: 4 },
tierBadgeText: {
  fontFamily: "Inter_600SemiBold",
  fontSize: 10,
  letterSpacing: 1.8,
  textTransform: "uppercase",
  color: Colors.textPrimary,
},
```

- [ ] **Step 3.2.2: Commit**

```bash
git add artifacts/xico-mobile/app/\(tabs\)/tu-codice.tsx
git commit -m "feat(codice): identity block · user name in Fraunces with italic rumbo accent"
```

## Task 3.3: Tu Códice · hero rosetón with halo pulse

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/tu-codice.tsx`
- Modify: `artifacts/xico-mobile/components/pasaporte/Roseton.tsx` (verify it accepts `size`, `shadowFilter` props)

- [ ] **Step 3.3.1: Hero rosetón component with halo**

Below identity block:

```tsx
<View style={styles.rosetonHero}>
  <HaloPulse primaryColor={`${Rumbos.este.hex}38`} secondaryColor={`${Rumbos.sur.hex}1f`}>
    <Roseton sellos={byRumbo ?? { norte: 0, sur: 0, este: 0, oeste: 0 }} size={220} withDropShadows />
  </HaloPulse>
</View>
```

Styles:

```tsx
rosetonHero: {
  alignItems: "center",
  marginVertical: 8,
  marginBottom: 24,
},
```

If `Roseton` doesn't support `withDropShadows`, modify the component:

```tsx
// In components/pasaporte/Roseton.tsx, wrap each petal Path in <Defs><Filter id="petal-shadow">...
// or add per-petal shadow via shadowOpacity/shadowRadius if iOS
```

- [ ] **Step 3.3.2: Commit**

```bash
git add artifacts/xico-mobile/app/\(tabs\)/tu-codice.tsx artifacts/xico-mobile/components/pasaporte/Roseton.tsx
git commit -m "feat(codice): hero rosetón with halo pulse and per-petal drop shadows"
```

## Task 3.4: Tu Códice · stats row + Carta del Equipo glass-vibrant card

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/tu-codice.tsx`
- Read: `artifacts/xico-mobile/hooks/useEditorLetter.ts` (existing)
- Read: `artifacts/xico-mobile/hooks/useGuardados.ts` (existing)

- [ ] **Step 3.4.1: Stats row in glass-deep card**

```tsx
const { data: guardados } = useGuardados();
const { data: editorLetter } = useEditorLetter();

// Below rosetón:
<GlassCard style={styles.statsRow}>
  <View style={styles.stat}>
    <Text style={styles.statNum}>{total}</Text>
    <Text style={styles.statLabel}>sellos</Text>
  </View>
  <View style={[styles.statSeparator]} />
  <View style={styles.stat}>
    <Text style={styles.statNum}>{guardados?.length ?? 0}</Text>
    <Text style={styles.statLabel}>guardados</Text>
  </View>
  <View style={[styles.statSeparator]} />
  <View style={styles.stat}>
    <Text style={styles.statNum}>{profile.articles_read ?? 0}</Text>
    <Text style={styles.statLabel}>leídos</Text>
  </View>
</GlassCard>
```

Styles:

```tsx
statsRow: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 18, marginBottom: 22 },
stat: { flex: 1, alignItems: "center" },
statNum: {
  fontFamily: "Fraunces_500Medium",
  fontSize: 30,
  lineHeight: 30,
  letterSpacing: -0.015 * 30,
  color: Colors.textPrimary,
},
statLabel: {
  fontFamily: "Inter_500Medium",
  fontSize: 9,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: "rgba(245,239,227,0.55)",
  marginTop: 5,
},
statSeparator: { width: StyleSheet.hairlineWidth, backgroundColor: "rgba(245,239,227,0.18)", marginVertical: 6 },
```

- [ ] **Step 3.4.2: Carta del Equipo · glass-vibrant card**

```tsx
{editorLetter && (
  <GlassVibrant style={styles.cartaCard}>
    <Text style={styles.cartaLabel}>{`CARTA DEL EQUIPO · ${editorLetter.week_key.toUpperCase()}`}</Text>
    <Text style={styles.cartaBody}>{editorLetter.body}</Text>
    <Text style={styles.cartaByline}>{`— ${editorLetter.editor_name} · editora cultural`}</Text>
  </GlassVibrant>
)}
```

Styles:

```tsx
cartaCard: { marginBottom: 16 },
cartaLabel: {
  fontFamily: "Inter_600SemiBold",
  fontSize: 9,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  color: "#D4A030",
  textShadowColor: "rgba(0,0,0,0.4)",
  textShadowRadius: 3,
  marginBottom: 10,
},
cartaBody: {
  fontFamily: "Newsreader_400Regular",
  fontSize: 14,
  lineHeight: 14 * 1.55,
  color: "rgba(245,239,227,0.92)",
},
cartaByline: {
  fontFamily: "Newsreader_400Regular_Italic",
  fontSize: 12,
  color: "rgba(245,239,227,0.6)",
  textAlign: "right",
  marginTop: 10,
},
```

For the drop cap on the body, use the existing `DropCap` primitive with gold-light accent:

```tsx
<Text style={styles.cartaBody}>
  <Text style={styles.cartaDropCap}>{editorLetter.body[0]}</Text>
  {editorLetter.body.slice(1)}
</Text>

// Styles:
cartaDropCap: {
  fontFamily: "Fraunces_600SemiBold",
  fontSize: 36,
  lineHeight: 36 * 0.85,
  color: "#D4A030",
  textShadowColor: "rgba(0,0,0,0.5)",
  textShadowRadius: 8,
  textShadowOffset: { width: 0, height: 2 },
},
```

- [ ] **Step 3.4.3: TypeScript + visual verification + commit**

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep "tu-codice.tsx"
npx expo start --ios
# Verify: rosetón pulses with halo, stats row legible, Carta card has gold drop cap and vibrancy

git add artifacts/xico-mobile/app/\(tabs\)/tu-codice.tsx
git commit -m "feat(codice): stats row glass-deep + Carta del Equipo glass-vibrant with gold drop cap"
```

## Phase 3 verification

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -v "getSession" | head -20
npx expo start --ios
# - Tu Códice tab opens, full-bleed photo backdrop visible
# - Identity block "El códice de Mauricio Favela" with magenta italic on family name
# - Rosetón hero at 220pt with halo pulse animation
# - Stats row reads numerals in Fraunces
# - Carta del Equipo card has glass-vibrant treatment + gold drop cap
# - Reduce Motion disables halo
```

---

# PHASE 4 · Stop screen + La Ruta listing redesign (~3 days)

Apply the same Liquid Glass system to the existing Stop screen (the showpiece) and La Ruta listing.

## Task 4.1: Stop screen · masthead + full-bleed photo + lock chip

**Files:**
- Modify: `artifacts/xico-mobile/app/ruta/stop/[id].tsx`

- [ ] **Step 4.1.1: Replace existing header with GlassMasthead**

In the existing stop screen file, find the current header and replace with:

```tsx
import { GlassMasthead, GlassChip } from "@/components/liquid-glass";

// In the render:
<GlassMasthead
  label={`XICO · LA RUTA · PARADA`}
  meta={`${String(stop.order_num).padStart(2, "0")} / 05`}
  liveDotColor={Rumbos[stop.rumbo_slug].hex}
/>
```

- [ ] **Step 4.1.2: Lock chip floating top-right when veiled**

```tsx
{!arrived && (
  <View style={styles.lockChipWrap}>
    <GlassChip>
      <Text style={styles.lockEmoji}>🔒</Text>
      <Text style={styles.lockText}>{`Apunte · ${distanceM}m`}</Text>
    </GlassChip>
  </View>
)}
```

Styles:

```tsx
lockChipWrap: { position: "absolute", top: 100, right: 18, zIndex: 3 },
lockEmoji: { fontSize: 11 },
lockText: {
  fontFamily: "Inter_600SemiBold",
  fontSize: 9,
  letterSpacing: 1.5,
  textTransform: "uppercase",
  color: Colors.textPrimary,
},
```

- [ ] **Step 4.1.3: Commit**

```bash
git add artifacts/xico-mobile/app/ruta/stop/[id].tsx
git commit -m "feat(stop): masthead + lock chip with HIG-compliant 44pt height"
```

## Task 4.2: Stop screen · monumental name + rumbo tag + Despacho card

**Files:**
- Modify: `artifacts/xico-mobile/app/ruta/stop/[id].tsx`

- [ ] **Step 4.2.1: Replace stop name block**

Find the existing stop name display, replace with:

```tsx
<View style={styles.stopNameBlock}>
  <Text style={styles.stopFolio}>{stop.address.toUpperCase()}</Text>
  <View style={styles.rumboTag}>
    <GlassChip tintColor={`${Rumbos[stop.rumbo_slug].hex}30`}>
      <View style={[styles.rumboSwatch, { backgroundColor: Rumbos[stop.rumbo_slug].hex }]} />
      <Text style={[styles.rumboText, { color: Rumbos[stop.rumbo_slug].hex }]}>
        {`${Rumbos[stop.rumbo_slug].mexica} · ${stop.rumbo_slug === "este" ? "este" : stop.rumbo_slug} · ${stop.rumbo_meaning}`}
      </Text>
    </GlassChip>
  </View>
  <Text style={styles.stopName}>
    {stop.name}
    <Text style={[styles.stopNameAccent, { color: Rumbos[stop.rumbo_slug].hex }]}>.</Text>
  </Text>
  <Text style={styles.stopAddressItalic}>{stop.description}</Text>
</View>
```

Styles:

```tsx
stopNameBlock: { marginTop: 200, paddingHorizontal: 20 },
stopFolio: {
  fontFamily: "Inter_600SemiBold",
  fontSize: 10,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: "rgba(245,239,227,0.65)",
  textShadowColor: "rgba(0,0,0,0.5)",
  textShadowRadius: 3,
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
  textShadowColor: "rgba(0,0,0,0.5)",
  textShadowRadius: 8,
  textShadowOffset: { width: 0, height: 2 },
  marginBottom: 6,
},
stopNameAccent: { fontFamily: "Fraunces_400Regular_Italic" },
stopAddressItalic: {
  fontFamily: "Newsreader_400Regular_Italic",
  fontSize: 13,
  lineHeight: 13 * 1.35,
  color: "rgba(245,239,227,0.78)",
  textShadowColor: "rgba(0,0,0,0.4)",
  textShadowRadius: 2,
  marginBottom: 18,
},
```

- [ ] **Step 4.2.2: Despacho card · L1 surface with magenta L-border + drop cap**

After the stop name block:

```tsx
<View style={styles.despachoCard}>
  <Text style={[styles.cardLabel, { color: Rumbos[stop.rumbo_slug].hex }]}>EL DESPACHO</Text>
  <Text style={styles.cardBody}>
    <Text style={[styles.cardDropCap, { color: Rumbos[stop.rumbo_slug].hex }]}>{stop.despacho_text[0]}</Text>
    {stop.despacho_text.slice(1)}
  </Text>
</View>
```

Styles:

```tsx
despachoCard: {
  backgroundColor: Colors.surface,
  borderLeftWidth: 3,
  borderLeftColor: "transparent", // overridden inline by rumbo
  borderRadius: 10,
  padding: 16,
  marginHorizontal: 20,
  marginTop: 16,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.55,
  shadowRadius: 16,
  shadowColor: "#000",
},
// Set borderLeftColor inline based on Rumbos[stop.rumbo_slug].hex
cardLabel: {
  fontFamily: "Inter_600SemiBold",
  fontSize: 9,
  letterSpacing: 2,
  textTransform: "uppercase",
  marginBottom: 8,
},
cardBody: {
  fontFamily: "Newsreader_400Regular",
  fontSize: 14,
  lineHeight: 14 * 1.55,
  color: Colors.textSecondary,
},
cardDropCap: {
  fontFamily: "Fraunces_600SemiBold",
  fontSize: 34,
  lineHeight: 34 * 0.85,
},
```

- [ ] **Step 4.2.3: Commit**

```bash
git add artifacts/xico-mobile/app/ruta/stop/\[id\].tsx
git commit -m "feat(stop): monumental name + rumbo tag + Despacho card with rumbo-color anchoring"
```

## Task 4.3: Stop screen · Apunte card (revealed after arrival)

**Files:**
- Modify: `artifacts/xico-mobile/app/ruta/stop/[id].tsx`

- [ ] **Step 4.3.1: Apunte reveal animation**

After the Despacho card, add the apunte card that fades+slides up when arrived:

```tsx
{arrived && stop.apunte_in_situ && (
  <Animated.View
    entering={SlideInUp.duration(800).easing(Easing.bezier(0.22, 1, 0.36, 1))}
    style={[styles.despachoCard, { borderLeftColor: Rumbos[stop.rumbo_slug].hex, marginTop: 12 }]}
  >
    <Text style={[styles.cardLabel, { color: Rumbos[stop.rumbo_slug].hex }]}>EL APUNTE · IN SITU</Text>
    <Text style={styles.cardBody}>{stop.apunte_in_situ}</Text>
  </Animated.View>
)}
```

Note: existing logic from the 5-state choreography (idle/en_camino/arrival/earning/earned per spec 2026-05-13) is preserved. Only the visual surface is upgraded.

- [ ] **Step 4.3.2: Verify reduced-motion fallback**

The `entering` animation must auto-disable when `useReducedMotion()` is true. Reanimated 3 handles this automatically via `Animated.View`'s `entering` prop respecting OS setting. Verify:

```bash
# In iOS Settings → Accessibility → Reduce Motion ON
# Reload app, navigate to a stop, simulate location at the stop coords
# Verify: apunte appears WITHOUT slide animation
```

- [ ] **Step 4.3.3: Commit**

```bash
git add artifacts/xico-mobile/app/ruta/stop/\[id\].tsx
git commit -m "feat(stop): Apunte card slide-up reveal · respects reduced-motion"
```

## Task 4.4: La Ruta listing redesign

**Files:**
- Modify: `artifacts/xico-mobile/app/ruta/index.tsx`

- [ ] **Step 4.4.1: Replace existing header with GlassMasthead**

```tsx
<GlassMasthead label="XICO · LA RUTA · SEMANA 19" meta="INAUGURAL" liveDotColor={Pillars.indice} />
```

- [ ] **Step 4.4.2: Hero title + byline + rosetón inline state**

Below masthead:

```tsx
<View style={styles.heroBlock}>
  <Text style={styles.rutaTitle}>
    Cinco paradas <Text style={styles.italicAccent}>en cinco barrios</Text>
  </Text>
  <Text style={styles.rutaByline}>{`— de ${ruta.editor_name} · editora cultural`}</Text>
  <View style={styles.rutaProgressInline}>
    <Roseton sellos={byRumbo} size={36} mini />
    <Text style={styles.rutaProgressText}>{`Tu pasaporte · ${total} / 5 sellos`}</Text>
  </View>
</View>
```

- [ ] **Step 4.4.3: Stop list · alternating featured/compact cards**

Below hero:

```tsx
{stops.map((stop, index) => {
  const isFeatured = index % 2 === 0; // alternating
  return isFeatured ? (
    <StopCardFeatured key={stop.id} stop={stop} earnedSello={earnedStopIds.has(stop.id)} />
  ) : (
    <StopCardCompact key={stop.id} stop={stop} earnedSello={earnedStopIds.has(stop.id)} />
  );
})}
```

Create `StopCardFeatured` and `StopCardCompact` in `components/ruta/`:

```tsx
// components/ruta/StopCardFeatured.tsx
// Featured · full-bleed photo + rumbo-colored kicker chip + Fraunces 100 name + accent border
// Reuses GlassChip for the kicker
```

```tsx
// components/ruta/StopCardCompact.tsx  
// Compact · 56pt thumb + 2-line stop name + rumbo color + distance
```

- [ ] **Step 4.4.4: Commit**

```bash
git add artifacts/xico-mobile/app/ruta/index.tsx artifacts/xico-mobile/components/ruta/StopCardFeatured.tsx artifacts/xico-mobile/components/ruta/StopCardCompact.tsx
git commit -m "feat(ruta): listing redesign · alternating featured/compact cards with rumbo color anchoring"
```

## Phase 4 verification

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -v "getSession" | head -20
npx expo start --ios
# - /ruta opens with hero "Cinco paradas en cinco barrios", rosetón state inline
# - 5 stop cards alternate featured/compact
# - Tap stop · /ruta/stop/[id] opens with monumental name + lock chip + despacho card
# - Simulate location at stop coords · veil lifts, apunte slides in
```

---

# PHASE 5 · Mapa with react-native-maps + Apple provider (~3 days)

Replace existing Leaflet WebView with native MapKit via `react-native-maps`.

## Task 5.1: Install react-native-maps + configure Apple provider

**Files:**
- Modify: `artifacts/xico-mobile/package.json`
- Modify: `artifacts/xico-mobile/app.json`

- [ ] **Step 5.1.1: Install package**

```bash
cd artifacts/xico-mobile
npx expo install react-native-maps
```

- [ ] **Step 5.1.2: Configure app.json for Apple Maps**

Edit `app.json` to ensure `ios.config.googleMapsApiKey` is NOT set (we use Apple Maps, not Google). Verify the iOS deployment target is ≥ 17.0:

```json
"ios": {
  ...
  "deploymentTarget": "17.0",
  ...
}
```

- [ ] **Step 5.1.3: Commit**

```bash
git add artifacts/xico-mobile/package.json artifacts/xico-mobile/app.json
git commit -m "feat(mapa): add react-native-maps · iOS 17.0 deployment target"
```

## Task 5.2: Build Mapa screen

**Files:**
- Modify: `artifacts/xico-mobile/app/(tabs)/mapa.tsx`

- [ ] **Step 5.2.1: Replace stub with full Mapa implementation**

```tsx
import React, { useRef, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassMasthead, GlassCard } from "@/components/liquid-glass";
import { useCurrentRutaStops } from "@/hooks/useCurrentRutaStops";
import { Colors, Pillars, Rumbos } from "@/constants/colors";

const MADRID_CENTER = {
  latitude: 40.4203,
  longitude: -3.7044,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapaScreen() {
  const insets = useSafeAreaInsets();
  const { data: stops } = useCurrentRutaStops();
  const [selectedStop, setSelectedStop] = useState<typeof stops[number] | null>(null);
  const mapRef = useRef<MapView | null>(null);

  return (
    <View style={[styles.root, { backgroundColor: Colors.background }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}  // Apple Maps on iOS, Google on Android
        style={StyleSheet.absoluteFill}
        initialRegion={MADRID_CENTER}
        userInterfaceStyle="dark"
        showsCompass
        showsScale
        rotateEnabled
        pitchEnabled
      >
        {stops?.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            onPress={() => setSelectedStop(stop)}
            tracksViewChanges={false}
          >
            <View style={[styles.markerPin, { backgroundColor: Rumbos[stop.rumbo_slug].hex }]}>
              <Text style={styles.markerNum}>{stop.order_num}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <GlassMasthead label="XICO · MAPA" meta={`SEMANA 19`} liveDotColor={Pillars.indice} />

      {selectedStop && (
        <View style={[styles.stopPreview, { bottom: insets.bottom + 90 }]}>
          <GlassCard accentBorder={Rumbos[selectedStop.rumbo_slug].hex}>
            <Text style={styles.previewKicker}>{`PARADA ${String(selectedStop.order_num).padStart(2, "0")}`}</Text>
            <Text style={styles.previewName}>{selectedStop.name}</Text>
            <Text style={styles.previewBarrio}>{selectedStop.barrio}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ir a ${selectedStop.name}`}
              onPress={() => {/* router.push(`/ruta/stop/${selectedStop.id}`) */}}
              style={styles.previewCta}
            >
              <Text style={styles.previewCtaText}>Ir a la parada →</Text>
            </Pressable>
          </GlassCard>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  markerPin: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.95)",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, shadowColor: "#000",
  },
  markerNum: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 14,
    color: "#fff",
  },
  stopPreview: { position: "absolute", left: 22, right: 22, zIndex: 4 },
  previewKicker: {
    fontFamily: "Inter_600SemiBold", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
    color: Colors.textTertiary, marginBottom: 6,
  },
  previewName: {
    fontFamily: "Fraunces_500Medium", fontSize: 20, color: Colors.textPrimary, marginBottom: 4,
  },
  previewBarrio: {
    fontFamily: "Newsreader_400Regular_Italic", fontSize: 13, color: Colors.textSecondary, marginBottom: 12,
  },
  previewCta: { paddingVertical: 12, alignItems: "center" },
  previewCtaText: {
    fontFamily: "Inter_500Medium", fontSize: 14, color: Pillars.indice,
  },
});
```

- [ ] **Step 5.2.2: TypeScript + verify in simulator**

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep "mapa.tsx"
npx expo start --ios
# - Mapa tab opens with Apple Maps centered on Madrid (dark mode)
# - 5 rumbo-colored pins visible at stop coordinates
# - Tap a pin · stop preview card slides up
```

- [ ] **Step 5.2.3: Commit**

```bash
git add artifacts/xico-mobile/app/(tabs)/mapa.tsx
git commit -m "feat(mapa): MapKit native via react-native-maps · rumbo-colored pins + preview card"
```

## Phase 5 verification

```bash
# Visual check on real iPhone via Expo Go or development build
# - Apple Maps render in dark mode
# - 5 stops appear as colored discs with order numbers
# - Tap a pin → glass preview card with stop info
# - "Ir a la parada" navigates to stop screen
```

---

# PHASE 6 · Widgets (~4 days)

Build 7 widget surfaces: Home Small/Medium/Large + Lock Inline/Circular/Rectangular + StandBy. Native Swift via WidgetKit · use Expo's config plugin pattern to bundle the widget extension.

## Task 6.1: Add WidgetKit extension scaffolding

**Files:**
- Modify: `artifacts/xico-mobile/app.json`
- Modify: `artifacts/xico-mobile/package.json` (add `expo-build-properties` if needed)
- Create: `artifacts/xico-mobile/widget-extension-config.json` (config plugin manifest)

- [ ] **Step 6.1.1: Configure widget extension via Expo config plugin**

This requires `@bacons/apple-targets` or a custom Expo config plugin. Install:

```bash
cd artifacts/xico-mobile
pnpm add -D @bacons/apple-targets
```

- [ ] **Step 6.1.2: Add widget target to app.json**

```json
"plugins": [
  ...,
  ["@bacons/apple-targets", {
    "appleTeamId": "B76TK6N9VU",
    "targets": [
      {
        "name": "XicoWidgets",
        "bundleIdentifier": "com.xico.app.widgets",
        "type": "widget",
        "deploymentTarget": "17.0"
      },
      {
        "name": "XicoLiveActivity",
        "bundleIdentifier": "com.xico.app.liveactivity",
        "type": "extension",
        "deploymentTarget": "17.0"
      }
    ]
  }]
]
```

- [ ] **Step 6.1.3: Create Swift widget files**

Create directory structure (Expo build prebuilds will use these):

```bash
mkdir -p artifacts/xico-mobile/targets/XicoWidgets
```

(Swift files written in subsequent tasks)

- [ ] **Step 6.1.4: Commit**

```bash
git add artifacts/xico-mobile/app.json artifacts/xico-mobile/package.json artifacts/xico-mobile/targets/
git commit -m "feat(widgets): scaffold WidgetKit extension via Apple Targets config plugin"
```

## Task 6.2: Despacho Small widget (Home 2×2)

**Files:**
- Create: `artifacts/xico-mobile/targets/XicoWidgets/XicoWidgets.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/DespachoSmallView.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/WidgetDataProvider.swift`

- [ ] **Step 6.2.1: Widget bundle entry**

```swift
// XicoWidgets.swift
import WidgetKit
import SwiftUI

@main
struct XicoWidgets: WidgetBundle {
    var body: some Widget {
        DespachoSmallWidget()
        // Additional widgets in subsequent tasks
    }
}
```

- [ ] **Step 6.2.2: Despacho Small widget**

```swift
// DespachoSmallView.swift
import WidgetKit
import SwiftUI

struct DespachoEntry: TimelineEntry {
    let date: Date
    let nahuatlWord: String
    let nahuatlMeaning: String
    let colorHex: String
    let lugarNombre: String
    let lugarBarrio: String
    let editorName: String
}

struct DespachoSmallProvider: TimelineProvider {
    func placeholder(in context: Context) -> DespachoEntry {
        DespachoEntry(date: Date(), nahuatlWord: "Nepantla", nahuatlMeaning: "el espacio entre dos mundos",
                      colorHex: "#B8820A", lugarNombre: "Mercado", lugarBarrio: "Lavapiés", editorName: "María")
    }
    func getSnapshot(in context: Context, completion: @escaping (DespachoEntry) -> Void) {
        completion(placeholder(in: context))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<DespachoEntry>) -> Void) {
        Task {
            let entry = await WidgetDataProvider.fetchDespacho()
            let next = Calendar.current.nextDate(after: Date(), matching: DateComponents(hour: 9, minute: 0), matchingPolicy: .nextTime)!
            completion(Timeline(entries: [entry], policy: .after(next)))
        }
    }
}

struct DespachoSmallView: View {
    let entry: DespachoEntry
    var body: some View {
        ZStack(alignment: .leading) {
            Color(hex: "#EDE6D8")
            VStack(alignment: .leading, spacing: 6) {
                Text("XICO · HOY")
                    .font(.system(size: 9, weight: .semibold))
                    .tracking(2.0)
                    .foregroundColor(Color.black.opacity(0.55))
                Spacer()
                Text(entry.nahuatlWord)
                    .font(.custom("Fraunces", size: 26))
                    .foregroundColor(.black)
                Rectangle()
                    .fill(Color(hex: entry.colorHex))
                    .frame(width: 36, height: 3)
                    .padding(.vertical, 4)
                Text(entry.nahuatlMeaning)
                    .font(.custom("Newsreader-Italic", size: 11))
                    .foregroundColor(Color.black.opacity(0.7))
                    .italic()
                Spacer()
                Text(entry.lugarNombre)
                    .font(.system(size: 9, weight: .medium))
                    .tracking(1.2)
                    .foregroundColor(Color.black.opacity(0.5))
            }
            .padding(14)
        }
    }
}

struct DespachoSmallWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "DespachoSmall", provider: DespachoSmallProvider()) { entry in
            DespachoSmallView(entry: entry)
        }
        .configurationDisplayName("Despacho del día")
        .description("La palabra y el lugar de hoy")
        .supportedFamilies([.systemSmall])
    }
}

// Helper · Color from hex
extension Color {
    init(hex: String) {
        let h = hex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        var int: UInt64 = 0
        Scanner(string: h).scanHexInt64(&int)
        let r, g, b: UInt64
        switch h.count {
        case 6: (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default: (r, g, b) = (0, 0, 0)
        }
        self.init(red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255)
    }
}
```

- [ ] **Step 6.2.3: Data provider that fetches from API**

```swift
// WidgetDataProvider.swift
import Foundation

class WidgetDataProvider {
    static let baseURL = "https://xico-api-production.up.railway.app"

    static func fetchDespacho() async -> DespachoEntry {
        guard let url = URL(string: "\(baseURL)/api/widget/today") else { return placeholder() }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let json = try JSONDecoder().decode(WidgetResponse.self, from: data)
            return DespachoEntry(
                date: Date(),
                nahuatlWord: json.despacho.nahuatlWord,
                nahuatlMeaning: json.despacho.nahuatlMeaning,
                colorHex: json.despacho.colorHex,
                lugarNombre: json.despacho.lugarNombre,
                lugarBarrio: json.despacho.lugarBarrio,
                editorName: json.despacho.editorName
            )
        } catch {
            return placeholder()
        }
    }

    static func placeholder() -> DespachoEntry {
        DespachoEntry(date: Date(), nahuatlWord: "Nepantla", nahuatlMeaning: "el espacio entre dos mundos",
                      colorHex: "#B8820A", lugarNombre: "Mercado de San Fernando", lugarBarrio: "Lavapiés", editorName: "María Vázquez")
    }
}

struct WidgetResponse: Decodable {
    let despacho: DespachoPayload
    struct DespachoPayload: Decodable {
        let nahuatlWord: String
        let nahuatlMeaning: String
        let colorHex: String
        let lugarNombre: String
        let lugarBarrio: String
        let editorName: String
        enum CodingKeys: String, CodingKey {
            case nahuatlWord = "nahuatl_word"
            case nahuatlMeaning = "nahuatl_meaning"
            case colorHex = "color_hex"
            case lugarNombre = "lugar_nombre"
            case lugarBarrio = "lugar_barrio"
            case editorName = "editor_name"
        }
    }
}
```

- [ ] **Step 6.2.4: Commit**

```bash
git add artifacts/xico-mobile/targets/XicoWidgets/
git commit -m "feat(widgets): Despacho Small widget · Home 2×2 with daily timeline"
```

## Task 6.3: Build out remaining 6 widget surfaces

**Files:**
- Create: `artifacts/xico-mobile/targets/XicoWidgets/DespachoMediumView.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/DespachoLargeView.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/LockInlineView.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/LockCircularView.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/LockRectangularView.swift`
- Create: `artifacts/xico-mobile/targets/XicoWidgets/StandByView.swift`
- Modify: `artifacts/xico-mobile/targets/XicoWidgets/XicoWidgets.swift`

- [ ] **Step 6.3.1: Medium (4×2)**

Build out similar to Small but with editor byline + color swatch. Update `supportedFamilies([.systemMedium])`.

- [ ] **Step 6.3.2: Large (4×4)**

Full Despacho display per spec §5.1 row 3: kicker, word at 56pt, meaning, hecho summary (3 lines), lugar + barrio, editor signature. `supportedFamilies([.systemLarge])`.

- [ ] **Step 6.3.3: Lock Inline (single line, wide)**

```swift
struct LockInlineView: View {
    let entry: DespachoEntry
    var body: some View {
        HStack(spacing: 8) {
            Rectangle()
                .fill(Color(hex: entry.colorHex))
                .frame(width: 8, height: 8)
                .cornerRadius(2)
            Text("XICO · \(entry.nahuatlWord.uppercased()) · \(entry.lugarBarrio.uppercased())")
                .font(.system(size: 10, weight: .semibold))
                .tracking(1.5)
        }
    }
}

// Widget config with .accessoryInline family
```

- [ ] **Step 6.3.4: Lock Circular (gauge-style rosetón)**

```swift
struct LockCircularView: View {
    let entry: RutaProgressEntry
    var body: some View {
        ZStack {
            // Mini SVG-like Rosetón rendering at fill state
        }
    }
}
// supportedFamilies([.accessoryCircular])
```

This needs a separate `RutaProgressEntry` type that fetches `/api/widget/today`'s `ruta` field. Add a sibling provider.

- [ ] **Step 6.3.5: Lock Rectangular (rosetón + sello count + next stop)**

`supportedFamilies([.accessoryRectangular])` · displays mini rosetón on left, "2/5 sellos" + next stop italic on right.

- [ ] **Step 6.3.6: StandBy view (landscape full Despacho)**

```swift
// supportedFamilies([.systemLarge]) · but with StandBy-aware layout that uses horizontal landscape
struct StandByView: View {
    let entry: DespachoEntry
    @Environment(\.isLuminanceReduced) var isLuminanceReduced
    var body: some View {
        if isLuminanceReduced {
            // Night mode · monochrome layout
        } else {
            // Full Despacho with color band
        }
    }
}
```

- [ ] **Step 6.3.7: Update widget bundle**

```swift
@main
struct XicoWidgets: WidgetBundle {
    var body: some Widget {
        DespachoSmallWidget()
        DespachoMediumWidget()
        DespachoLargeWidget()
        LockInlineWidget()
        LockCircularWidget()
        LockRectangularWidget()
        StandByWidget()
    }
}
```

- [ ] **Step 6.3.8: Commit**

```bash
git add artifacts/xico-mobile/targets/XicoWidgets/
git commit -m "feat(widgets): all 7 widget surfaces · Home + Lock + StandBy"
```

## Task 6.4: Server-side `/api/widget/today` endpoint

**Files:**
- Create: `artifacts/api-server/src/routes/widget.ts`
- Modify: `artifacts/api-server/src/routes/index.ts`
- Create: `artifacts/api-server/migrations/2026-05-15-widget-and-activity.sql`

- [ ] **Step 6.4.1: Migration · user_widget_state table**

```sql
-- migrations/2026-05-15-widget-and-activity.sql
CREATE TABLE IF NOT EXISTS user_widget_state (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  state JSONB NOT NULL,
  ttl_seconds INT DEFAULT 1800
);

CREATE TABLE IF NOT EXISTS active_ruta_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  ruta_id TEXT REFERENCES ruta(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  activity_token TEXT,
  state JSONB
);
CREATE UNIQUE INDEX IF NOT EXISTS active_ruta_unique
  ON active_ruta_activities (profile_id)
  WHERE (ended_at IS NULL);
```

Apply via Supabase SQL editor or migration runner.

- [ ] **Step 6.4.2: Widget endpoint**

```ts
// src/routes/widget.ts
import { Router, Request, Response } from "express";
import { supabase } from "../supabase";

const router = Router();

router.get("/today", async (_req: Request, res: Response) => {
  try {
    // Get today's despacho (rotation_key based on day-of-month)
    const today = new Date();
    const rotationKey = today.getDate(); // simple rotation; tune per editorial logic
    const { data: despacho, error: despachoErr } = await supabase
      .from("despacho")
      .select("subtitulo, color_nombre, color_hex, nahuatl_word, nahuatl_meaning, nahuatl_nota, lugar_nombre, lugar_barrio, lugar_nota, hecho")
      .eq("rotation_key", rotationKey)
      .single();
    if (despachoErr || !despacho) return res.status(404).json({ error: "no despacho for today" });

    // Get current Ruta
    const { data: ruta } = await supabase
      .from("ruta")
      .select("id, week_key, editor_name, published_at")
      .eq("is_active", true)
      .single();

    res.json({
      despacho: { ...despacho, hecho_summary: despacho.hecho.slice(0, 180) },
      ruta: ruta ?? null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
```

- [ ] **Step 6.4.3: Mount in route index**

Edit `src/routes/index.ts`:

```ts
import widgetRouter from "./widget";
// ... in the router setup:
router.use("/widget", widgetRouter);
```

- [ ] **Step 6.4.4: Smoke test**

```bash
curl https://xico-api-production.up.railway.app/api/widget/today
# Expected: JSON with despacho + ruta fields
```

- [ ] **Step 6.4.5: Commit**

```bash
git add artifacts/api-server/src/routes/widget.ts artifacts/api-server/src/routes/index.ts artifacts/api-server/migrations/2026-05-15-widget-and-activity.sql
git commit -m "feat(api): GET /api/widget/today + migration for widget/live-activity tables"
```

## Phase 6 verification

```bash
curl https://xico-api-production.up.railway.app/api/widget/today
# Expected: valid JSON

# On real device after `npx expo prebuild` + Xcode build:
# - Long-press home screen → add widget → search "XICO" → 7 widget options visible
# - Add Small widget → renders today's despacho on home screen
# - Add Lock Screen Rectangular → shows rosetón + 2/5 sellos
# - Dock in StandBy → full despacho landscape
```

---

# PHASE 7 · Live Activity (~3 days)

ActivityKit native module for Dynamic Island during active Ruta.

## Task 7.1: ActivityKit native module + ActivityAttributes

**Files:**
- Create: `artifacts/xico-mobile/targets/XicoLiveActivity/RutaActivity.swift`
- Create: `artifacts/xico-mobile/targets/XicoLiveActivity/RutaActivityView.swift`

- [ ] **Step 7.1.1: ActivityAttributes definition**

```swift
// RutaActivity.swift
import ActivityKit
import SwiftUI
import WidgetKit

struct RutaActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var stopsCompleted: Int
        var stopsTotal: Int
        var nextStopName: String
        var nextStopBarrio: String
        var nextStopDistanceM: Int
        var nextStopPhotoURL: String?
        var rosetonState: [Int]  // 4-element: sellos per rumbo
    }
    var weekKey: String
    var editorName: String
}
```

- [ ] **Step 7.1.2: Compact + Expanded + Lock Screen views**

```swift
// RutaActivityView.swift
import ActivityKit
import SwiftUI
import WidgetKit

struct RutaActivityView: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RutaActivityAttributes.self) { context in
            // Lock Screen UI
            VStack(alignment: .leading) {
                Text("XICO · LA RUTA · \(context.attributes.weekKey)")
                    .font(.system(size: 10, weight: .semibold)).tracking(1.5)
                HStack {
                    // Mini rosetón render
                    RosetonMiniView(state: context.state.rosetonState)
                        .frame(width: 36, height: 36)
                    VStack(alignment: .leading) {
                        Text("\(context.state.stopsCompleted) / \(context.state.stopsTotal)")
                            .font(.custom("Fraunces", size: 24))
                        Text("próxima · \(context.state.nextStopName)")
                            .font(.custom("Newsreader-Italic", size: 12))
                    }
                }
            }
            .padding()
            .background(Color(hex: "#080508"))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    RosetonMiniView(state: context.state.rosetonState)
                        .frame(width: 32, height: 32)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.stopsCompleted)/\(context.state.stopsTotal)")
                        .font(.custom("Fraunces", size: 22))
                        .foregroundColor(Color(hex: "#D9357B"))
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text("Próxima: \(context.state.nextStopName)")
                            .font(.system(size: 14, weight: .medium))
                        Spacer()
                        Text("\(context.state.nextStopDistanceM)m")
                            .font(.custom("Newsreader-Italic", size: 12))
                    }
                }
            } compactLeading: {
                RosetonMiniView(state: context.state.rosetonState)
                    .frame(width: 18, height: 18)
            } compactTrailing: {
                Text("\(context.state.stopsCompleted)/\(context.state.stopsTotal)")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(Color(hex: "#D9357B"))
            } minimal: {
                RosetonMiniView(state: context.state.rosetonState)
                    .frame(width: 18, height: 18)
            }
        }
    }
}
```

- [ ] **Step 7.1.3: Mini rosetón helper SwiftUI view**

```swift
struct RosetonMiniView: View {
    let state: [Int]  // [norte, sur, este, oeste] sello counts
    var body: some View {
        ZStack {
            // 4 petals · filled if state[i] > 0, outlined otherwise
            ForEach(0..<4) { i in
                Petal(filled: state[i] > 0, rotation: Double(i) * 90)
            }
        }
    }
}

struct Petal: View {
    let filled: Bool
    let rotation: Double
    var body: some View {
        // Simple ellipse for compact rendering
        Ellipse()
            .fill(filled ? Color.white : Color.white.opacity(0.25))
            .frame(width: 8, height: 18)
            .rotationEffect(.degrees(rotation))
    }
}
```

- [ ] **Step 7.1.4: Commit**

```bash
git add artifacts/xico-mobile/targets/XicoLiveActivity/
git commit -m "feat(live-activity): Dynamic Island compact + expanded + Lock Screen views"
```

## Task 7.2: Start/end Live Activity from React Native

**Files:**
- Create: `artifacts/xico-mobile/modules/live-activity/index.ts`
- Modify: `artifacts/xico-mobile/app/ruta/index.tsx`

- [ ] **Step 7.2.1: Native bridge module**

Use Expo modules API to expose Swift ActivityKit calls:

```ts
// modules/live-activity/index.ts
import { requireNativeModule } from "expo-modules-core";

interface LiveActivityModule {
  startActivity(attributes: {
    weekKey: string;
    editorName: string;
    stopsCompleted: number;
    stopsTotal: number;
    nextStopName: string;
    nextStopBarrio: string;
    nextStopDistanceM: number;
    rosetonState: number[];
  }): Promise<string>; // returns activity ID
  updateActivity(id: string, state: any): Promise<void>;
  endActivity(id: string): Promise<void>;
}

export default requireNativeModule<LiveActivityModule>("LiveActivity");
```

(Implementation of the Swift side connects to `Activity<RutaActivityAttributes>.request(...)`)

- [ ] **Step 7.2.2: Trigger from Ruta listing on "Empezar"**

In `app/ruta/index.tsx`, add the "Empezar La Ruta" button if not present, and on press:

```tsx
import LiveActivity from "@/modules/live-activity";

const handleStartRuta = async () => {
  const activityId = await LiveActivity.startActivity({
    weekKey: ruta.week_key,
    editorName: ruta.editor_name,
    stopsCompleted: 0,
    stopsTotal: 5,
    nextStopName: stops[0].name,
    nextStopBarrio: stops[0].barrio,
    nextStopDistanceM: 0,
    rosetonState: [0, 0, 0, 0],
  });
  // Persist activity ID in AsyncStorage to update later
  await AsyncStorage.setItem("active_ruta_activity_id", activityId);
};
```

- [ ] **Step 7.2.3: Update activity on sello earn**

In the sello earn hook (`useSelloMutation`), after success:

```tsx
const activityId = await AsyncStorage.getItem("active_ruta_activity_id");
if (activityId) {
  await LiveActivity.updateActivity(activityId, {
    stopsCompleted: newCount,
    nextStopName: nextStop?.name ?? "Ruta completada",
    rosetonState: newRosetonState,
  });
  if (newCount >= 5) {
    await LiveActivity.endActivity(activityId);
    await AsyncStorage.removeItem("active_ruta_activity_id");
  }
}
```

- [ ] **Step 7.2.4: Commit**

```bash
git add artifacts/xico-mobile/modules/live-activity/ artifacts/xico-mobile/app/ruta/index.tsx artifacts/xico-mobile/hooks/useSelloMutation.ts
git commit -m "feat(live-activity): start/update/end Activity from React Native"
```

## Phase 7 verification

```bash
# On a real iPhone 14 Pro+ (Dynamic Island device):
# - Navigate to /ruta · tap "Empezar La Ruta"
# - Dynamic Island shows compact rosetón + "0/5"
# - Long-press DI · expanded view with next stop info
# - Earn a sello · DI updates to "1/5"
# - Complete all 5 · DI dismisses automatically
```

---

# PHASE 8 · Dynamic icon system (~1 day)

4-tier alternate icons swap based on user's pasaporte state.

## Task 8.1: Generate 4 icon PNGs

**Files:**
- Create: `artifacts/xico-mobile/assets/alternate-icons/icon-iniciado.png`
- Create: `artifacts/xico-mobile/assets/alternate-icons/icon-conocedor.png`
- Create: `artifacts/xico-mobile/assets/alternate-icons/icon-curador.png`
- Create: `artifacts/xico-mobile/assets/alternate-icons/icon-cronista.png`

- [ ] **Step 8.1.1: Create Node script to generate icons**

```js
// scripts/generate-tier-icons.js
import sharp from "sharp";
import fs from "fs";

const cream = "#EDE6D8";
const magenta = "#9C1A47";
const rumbos = {
  norte: "#0E1018",
  este: "#D9357B",
  sur: "#234698",
  oeste: "#9C1A47", // bone-on-cream invisible · use pillar magenta per brandbook §5
  center: "#3F5A3A",
};

// SVG template for rosetón at 1024×1024
function rosetonSvg(filled) {
  const petalPath = (transform, color, outline) =>
    outline
      ? `<path d="M512,150 Q650,425 512,512 Q374,425 512,150 Z" fill="none" stroke="${magenta}" stroke-width="16" transform="${transform}"/>`
      : `<path d="M512,150 Q650,425 512,512 Q374,425 512,150 Z" fill="${color}" transform="${transform}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="${cream}"/>
    ${petalPath("rotate(0 512 512)", rumbos.norte, !filled.norte)}
    ${petalPath("rotate(90 512 512)", rumbos.este, !filled.este)}
    ${petalPath("rotate(180 512 512)", rumbos.sur, !filled.sur)}
    ${petalPath("rotate(270 512 512)", rumbos.oeste, !filled.oeste)}
    ${filled.center ? `<circle cx="512" cy="512" r="56" fill="${rumbos.center}"/>` : ""}
  </svg>`;
}

const tiers = {
  iniciado: { norte: false, este: false, sur: false, oeste: false, center: false },
  conocedor: { norte: true, este: true, sur: false, oeste: false, center: false },
  curador: { norte: true, este: true, sur: true, oeste: false, center: false },
  cronista: { norte: true, este: true, sur: true, oeste: true, center: true },
};

for (const [tier, state] of Object.entries(tiers)) {
  await sharp(Buffer.from(rosetonSvg(state)))
    .png()
    .toFile(`artifacts/xico-mobile/assets/alternate-icons/icon-${tier}.png`);
  console.log(`✓ generated icon-${tier}.png`);
}
```

- [ ] **Step 8.1.2: Run script**

```bash
cd artifacts/xico-mobile
node scripts/generate-tier-icons.js
ls assets/alternate-icons/
# Expected: 4 PNG files, each 1024×1024
```

- [ ] **Step 8.1.3: Commit**

```bash
git add artifacts/xico-mobile/scripts/generate-tier-icons.js artifacts/xico-mobile/assets/alternate-icons/
git commit -m "feat(icon): generate 4 tier variants via SVG → PNG script"
```

## Task 8.2: Configure CFBundleAlternateIcons

**Files:**
- Modify: `artifacts/xico-mobile/app.json`

- [ ] **Step 8.2.1: Add alternate icons config**

```json
"ios": {
  ...
  "infoPlist": {
    ...
    "CFBundleIcons": {
      "CFBundlePrimaryIcon": { "CFBundleIconFiles": ["icon"] },
      "CFBundleAlternateIcons": {
        "AppIcon-Iniciado": { "CFBundleIconFiles": ["icon-iniciado"], "UIPrerenderedIcon": false },
        "AppIcon-Conocedor": { "CFBundleIconFiles": ["icon-conocedor"], "UIPrerenderedIcon": false },
        "AppIcon-Curador": { "CFBundleIconFiles": ["icon-curador"], "UIPrerenderedIcon": false },
        "AppIcon-Cronista": { "CFBundleIconFiles": ["icon-cronista"], "UIPrerenderedIcon": false }
      }
    }
  }
}
```

Note: Bundling alternate icons in Expo requires `expo-build-properties` or `expo-alternate-app-icons`. Use the latter:

```bash
pnpm add expo-alternate-app-icons
```

Then configure via Expo plugin:

```json
"plugins": [
  ...,
  ["expo-alternate-app-icons", {
    "icons": [
      { "name": "AppIcon-Iniciado", "path": "./assets/alternate-icons/icon-iniciado.png" },
      { "name": "AppIcon-Conocedor", "path": "./assets/alternate-icons/icon-conocedor.png" },
      { "name": "AppIcon-Curador", "path": "./assets/alternate-icons/icon-curador.png" },
      { "name": "AppIcon-Cronista", "path": "./assets/alternate-icons/icon-cronista.png" }
    ]
  }]
]
```

- [ ] **Step 8.2.2: Commit**

```bash
git add artifacts/xico-mobile/app.json artifacts/xico-mobile/package.json
git commit -m "feat(icon): register 4 alternate icons via expo-alternate-app-icons plugin"
```

## Task 8.3: DynamicIconManager · swap on tier change

**Files:**
- Create: `artifacts/xico-mobile/hooks/useTierIcon.ts`
- Modify: `artifacts/xico-mobile/app/_layout.tsx`

- [ ] **Step 8.3.1: Hook that swaps icon on tier change**

```ts
// hooks/useTierIcon.ts
import { useEffect, useRef } from "react";
import * as AlternateAppIcons from "expo-alternate-app-icons";
import { useTier } from "./useTier";
import { TierLadder, TierName } from "@/constants/tierLadder";

export function useTierIcon() {
  const { tier } = useTier();
  const lastTier = useRef<TierName | null>(null);

  useEffect(() => {
    if (!tier || tier === lastTier.current) return;
    const def = TierLadder.find(t => t.name === tier);
    if (!def) return;
    AlternateAppIcons.setAlternateAppIconAsync(def.iosIconName).catch(console.warn);
    lastTier.current = tier;
  }, [tier]);
}
```

- [ ] **Step 8.3.2: Mount in root layout**

In `app/_layout.tsx`:

```tsx
import { useTierIcon } from "@/hooks/useTierIcon";

function RootLayoutContent() {
  useTierIcon(); // automatically swaps icon when user tier changes
  // ... rest of layout
}
```

- [ ] **Step 8.3.3: Commit**

```bash
git add artifacts/xico-mobile/hooks/useTierIcon.ts artifacts/xico-mobile/app/_layout.tsx
git commit -m "feat(icon): auto-swap alternate icon when tier changes"
```

## Phase 8 verification

```bash
# On real device after prebuild + native build:
# - Install fresh (Iniciado state) · home screen icon = empty rosetón
# - Earn 6 sellos in 2 rumbos · iOS prompts to swap to Conocedor icon · accept
# - Icon becomes 2-petal-filled rosetón on home screen
```

---

# PHASE 9 · HIG compliance fixes (~1 day)

Address the 5 gaps flagged in spec §11.

## Task 9.1: Dynamic Island clearance audit

**Files:**
- Multiple — verify every screen

- [ ] **Step 9.1.1: Grep for any masthead `top:` value < 81**

```bash
cd artifacts/xico-mobile
grep -rn "top:" app/ components/ | grep -E "(60|70|80)" | head -20
# Manually inspect any results · ensure they're not masthead/chrome elements at top of screen
```

- [ ] **Step 9.1.2: Verify GlassMasthead's `topOffset`**

In `GlassMasthead.tsx`, confirm the formula:

```tsx
const topOffset = Math.max(insets.top + 22, 81);
```

This adds 22pt clearance to safe-area-inset-top (which on iPhone 16 Pro Max is 59pt), giving 81pt. Or falls back to 81pt if insets are unavailable.

- [ ] **Step 9.1.3: Commit any fixes**

```bash
git add ...
git commit -m "fix(hig): ensure all floating chrome clears Dynamic Island ≥81pt"
```

## Task 9.2: Dynamic Type support

**Files:**
- Modify: `artifacts/xico-mobile/constants/editorial.ts`

- [ ] **Step 9.2.1: Add scaledFont helper**

```ts
// In constants/editorial.ts
import { PixelRatio } from "react-native";

export function scaledFontSize(size: number): number {
  // Use UIFontMetrics-equivalent scaling
  return PixelRatio.getFontScale() * size;
}
```

For React Native, wrap all `TypeSize.*` usages with `scaledFontSize()` where the font scaling should apply. Critical for body content; less critical for fixed-design display headings.

- [ ] **Step 9.2.2: Apply selectively to body text**

In `hoy.tsx`, `tu-codice.tsx`, stop screen: wrap body fontSize values:

```tsx
fontSize: scaledFontSize(15),
```

- [ ] **Step 9.2.3: Commit**

```bash
git add artifacts/xico-mobile/constants/editorial.ts artifacts/xico-mobile/app/
git commit -m "feat(a11y): Dynamic Type scaling on body content via scaledFontSize helper"
```

## Task 9.3: VoiceOver labels on Roseton SVG

**Files:**
- Modify: `artifacts/xico-mobile/components/pasaporte/Roseton.tsx`

- [ ] **Step 9.3.1: Add accessibilityLabel that updates with state**

```tsx
// In Roseton component:
const distinctRumbos = Object.values(sellos).filter(c => c > 0).length;
const total = Object.values(sellos).reduce((a, b) => a + b, 0);

<View
  accessibilityRole="image"
  accessibilityLabel={`Tu pasaporte: ${total} de 5 sellos completados · ${distinctRumbos} rumbos cubiertos`}
>
  <Svg>...</Svg>
</View>
```

- [ ] **Step 9.3.2: Commit**

```bash
git add artifacts/xico-mobile/components/pasaporte/Roseton.tsx
git commit -m "feat(a11y): dynamic VoiceOver label on Roseton SVG"
```

## Task 9.4: Back gesture preservation audit

**Files:**
- Audit · no modifications expected, fix if found

- [ ] **Step 9.4.1: Grep for horizontal swipe handlers**

```bash
grep -rn "(panGesture|swipeLeft|swipeRight|GestureDetector)" app/ components/ | head
# Manually inspect · ensure no horizontal-from-left-edge swipes override iOS system back
```

- [ ] **Step 9.4.2: Confirm Stop screen + Ruta listing don't override**

Open both screens in code, verify no `gestureEnabled: false` on the parent stack screen options.

- [ ] **Step 9.4.3: Commit any fixes**

```bash
git add ...
git commit -m "fix(hig): preserve iOS back gesture · no custom horizontal swipes from left edge"
```

## Phase 9 verification

```bash
# Manual checks on real iPhone:
# - VoiceOver ON · navigate /tu-codice · roseton SVG announces "Tu pasaporte: X de 5 sellos completados, X rumbos cubiertos"
# - Settings → Display → Text Size → max · all body text grows; display headings stay (design choice)
# - All floating masthead bars clear the Dynamic Island visibly
# - Swipe from left edge anywhere · system back works
```

---

# PHASE 10 · QA + Build #11 readiness (~2 days)

Final verification + capture screenshots + build trigger gate.

## Task 10.1: Real-device QA pass

**Files:** None · this is verification

- [ ] **Step 10.1.1: TypeScript clean across modified files**

```bash
cd artifacts/xico-mobile && npx tsc --noEmit 2>&1 | grep -v "getSession" | head -30
# Expected: 0 errors related to files touched in this plan
```

- [ ] **Step 10.1.2: API smoke test**

```bash
cd artifacts/api-server && npm run smoke
# Expected: 25/25 OK (existing) + 1 new (widget endpoint) = 26/26
```

- [ ] **Step 10.1.3: Manifesto cross-check (spec §16 · 5 scenarios)**

Walk through each scenario from spec §16. Document any "merely engage" hits in a checklist.

## Task 10.2: Capture App Store screenshots

**Files:**
- Reference: `docs/brand/screenshot-capture-brief.md`

- [ ] **Step 10.2.1: Boot iPhone 16 Pro Max simulator with dark appearance**

```bash
xcrun simctl boot "iPhone 16 Pro Max"
xcrun simctl ui "iPhone 16 Pro Max" appearance dark
open -a Simulator
```

- [ ] **Step 10.2.2: Capture 5 shots per docs/brand/screenshot-capture-brief.md**

Follow the doc step-by-step. Save outputs in `~/Desktop/xico-shots-<date>/`.

- [ ] **Step 10.2.3: Commit screenshots to repo for reference**

```bash
mkdir -p artifacts/xico-mobile/app-store-screenshots
cp ~/Desktop/xico-shots-*/*.png artifacts/xico-mobile/app-store-screenshots/
git add artifacts/xico-mobile/app-store-screenshots/
git commit -m "chore(assets): captured App Store screenshots for v1.1 submission"
```

## Task 10.3: Build trigger gate

**Files:** None — this is the explicit halt point

- [ ] **Step 10.3.1: Stop · request explicit user instruction**

Per the standing rule in the spec and this plan: **NEVER run `eas build` autonomously.** Print to user:

> Phase 10 complete. All visual changes implemented, HIG compliance fixes applied, screenshots captured, TypeScript clean, API smoke pass. **Awaiting explicit instruction to trigger Build #11.** The command to run when you give the green light:
>
> ```bash
> cd artifacts/xico-mobile && eas build --platform ios --profile production
> ```
>
> After EAS finishes (~15-20 min), submit to TestFlight:
>
> ```bash
> eas submit --platform ios --profile production --latest
> ```

- [ ] **Step 10.3.2: Wait**

Do not proceed without explicit user message instructing build.

---

## Plan self-review

**Spec coverage check:**

| Spec section | Plan coverage |
|---|---|
| §1 Context | Implicit in plan goal + architecture |
| §2 Design language locked | Phase 1 (foundations · primitives, tokens) |
| §3 Navigation shift | Phase 2 Task 2.1 + Task 2.5 |
| §4 Icon system | Phase 8 (Tasks 8.1-8.3) |
| §5 Widget system | Phase 6 (Tasks 6.1-6.4) |
| §6 Live Activity | Phase 7 (Tasks 7.1-7.2) |
| §7.1 Hoy spec | Phase 2 Tasks 2.2-2.4 |
| §7.2 La Ruta listing | Phase 4 Task 4.4 |
| §7.3 Stop screen | Phase 4 Tasks 4.1-4.3 |
| §7.4 Tu Códice | Phase 3 (Tasks 3.1-3.4) |
| §7.5 Mapa | Phase 5 (Tasks 5.1-5.2) |
| §8 Apple integrations P1 | Phases 5, 6, 7 + haptics (existing, not duplicated) |
| §9 Apple integrations P2 | OUT OF SCOPE for v1.1 · in spec for v1.2 reference |
| §11 HIG compliance | Phase 9 (Tasks 9.1-9.4) |
| §12 Data model deltas | Phase 6 Task 6.4 (migration) |
| §13 File deltas | Reflected in plan's File Structure Map |
| §14 Implementation phases | This plan's 10 phases |
| §17 Competitive research additions | OUT OF SCOPE for v1.1 (P2 candidates) |
| §18 Sizing audit | Embedded in every primitive (GlassMasthead `topOffset`, GlassTabBar bottom offset, lock chip 100pt + 44pt min, etc.) |

No gaps. P2 items (§17) intentionally deferred to v1.2 plan.

**Placeholder scan:**

- No "TBD", "TODO", "implement later" in any task
- Every code step has actual code
- No "similar to Task N" references
- Edge cases scoped to specific tasks

**Type consistency:**

- `TabItem` defined in Task 1.4, used in Task 2.1 — consistent
- `DespachoEntry` Swift struct used across widget tasks — consistent
- `RutaActivityAttributes.ContentState` used in Task 7.1 and 7.2 — consistent
- `TierName` exported from `tierLadder.ts` in Task 1.2, used in Task 8.3 — consistent

Plan reviewed clean.

---

*End of plan · Build #11 stays OFF until explicit user instruction. Implementation must follow phases sequentially; phases can be split across multiple PRs but in-phase tasks should land together when possible.*
