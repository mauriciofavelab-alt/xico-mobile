// Shared tab-items source · 2026-05-15 (Agent D · diagnostic-code.md §G-3 DRY pass).
//
// Both `LiquidGlassTabBar` (in `app/(tabs)/_layout.tsx`) and `ChromeTabBar`
// (in `components/nav/ChromeTabBar.tsx`) used to define the same 4-tab
// array inline with subtly different active-state logic. A new tab would
// have to be added in two places · brittle.
//
// `useTabItems()` is now the single source of truth. Both wrappers consume
// the hook with their own preferred active-state strategy passed as input:
//   - `LiquidGlassTabBar` knows the navigator state (`state.routes[state.index].name`)
//     plus the pathname (because /ruta lives outside the (tabs) group).
//   - `ChromeTabBar` only knows the pathname (it's used on routes OUTSIDE
//     (tabs) where the navigator state isn't available).
//
// The hook takes the active-state predicate as a callback and returns the
// fully shaped TabItem[] for the GlassTabBar consumer. This keeps the
// editorial data (labels, accent colors, a11y labels) in one place while
// preserving each wrapper's natural way to compute "is this tab active."

import { useMemo } from "react";
import type { Router } from "expo-router";

import type { TabItem } from "@/components/liquid-glass";
import { Pillars } from "@/constants/colors";

/**
 * Static description of a tab's editorial identity · pre-active-state.
 * Active-state is decided per-wrapper via the `isActive` predicate passed
 * to `useTabItems()`.
 */
export type TabDescriptor = {
  key: "hoy" | "ruta" | "tu-codice" | "mapa";
  label: string;
  accentColor: string;
  path: "/hoy" | "/ruta" | "/tu-codice" | "/mapa";
  accessibilityLabel: string;
};

/**
 * The canonical four tabs. Order matters · this is the visual left-to-right
 * order in the bar. Changing order here changes both wrappers immediately.
 */
export const TAB_DESCRIPTORS: ReadonlyArray<TabDescriptor> = [
  {
    key: "hoy",
    label: "Hoy",
    accentColor: Pillars.indice,
    path: "/hoy",
    accessibilityLabel: "Hoy · El Despacho del día",
  },
  {
    key: "ruta",
    label: "La Ruta",
    accentColor: Pillars.indice,
    path: "/ruta",
    accessibilityLabel: "La Ruta · paseo semanal",
  },
  {
    key: "tu-codice",
    label: "Tu Códice",
    accentColor: Pillars.archivo,
    path: "/tu-codice",
    accessibilityLabel: "Tu Códice · tu pasaporte personal",
  },
  {
    key: "mapa",
    label: "Mapa",
    accentColor: Pillars.indice,
    path: "/mapa",
    accessibilityLabel: "Mapa · paradas en Madrid",
  },
];

/**
 * Hook that returns the four TabItems with their `isActive` resolved by the
 * caller's predicate and `onPress` wired to `router.push` of the descriptor's
 * path. Memoizes on the descriptor identities + the active-key string so
 * re-renders of the parent don't reshape every tab object.
 */
export function useTabItems(
  router: Router,
  activeKey: TabDescriptor["key"] | null,
): TabItem[] {
  return useMemo<TabItem[]>(
    () =>
      TAB_DESCRIPTORS.map((d) => ({
        key: d.key,
        label: d.label,
        accentColor: d.accentColor,
        accessibilityLabel: d.accessibilityLabel,
        // expo-router's typed-routes have a known mismatch with bare string
        // paths; the `as any` here is the same workaround used in the
        // pre-refactor wrappers. Replace with a typed router cast when
        // expo-router's types catch up.
        onPress: () => router.push(d.path as never),
        isActive: activeKey === d.key,
      })),
    [router, activeKey],
  );
}
