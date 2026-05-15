// Standalone variant of the (tabs) layout's GlassTabBar · use this on any
// route OUTSIDE the (tabs) group that still needs the tab bar chrome (e.g.
// /ruta listing per spec §7.2 pt 9). The (tabs) routes already get the
// tab bar via the navigator's `tabBar` prop in `app/(tabs)/_layout.tsx` ·
// they should NOT render this component (duplicate bar).
//
// Items + active-state detection mirror the (tabs) implementation so the
// chrome feels identical no matter which level of the route tree the user
// is on. Tap routes via `router.push` to absolute paths; no group-relative
// navigation since this component lives outside (tabs).

import React from "react";
import { useRouter, usePathname } from "expo-router";

import { GlassTabBar } from "@/components/liquid-glass";
import { useTabItems, type TabDescriptor } from "@/components/nav/tabItems";

/**
 * DRY · 2026-05-15 (Agent D · diagnostic-code.md §G-3): tab items used to be
 * a 50-line inline array here AND another 33-line inline array in
 * `app/(tabs)/_layout.tsx`. Both now consume `useTabItems()` from
 * `components/nav/tabItems.ts`. Active-state strategy is the only thing
 * each wrapper customizes · here, we use pathname-only (since this component
 * renders on routes OUTSIDE the (tabs) group where the navigator state
 * isn't available).
 */
function pathnameToActiveKey(pathname: string): TabDescriptor["key"] | null {
  if (pathname.startsWith("/ruta")) return "ruta";
  if (pathname === "/hoy" || pathname === "/") return "hoy";
  if (pathname === "/tu-codice") return "tu-codice";
  if (pathname === "/mapa") return "mapa";
  return null;
}

export function ChromeTabBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const items = useTabItems(router, pathnameToActiveKey(pathname));
  return <GlassTabBar items={items} />;
}
