import { Tabs, useRouter, usePathname } from "expo-router";
import React from "react";

import { GlassTabBar } from "@/components/liquid-glass";
import { useTabItems, type TabDescriptor } from "@/components/nav/tabItems";

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

/**
 * DRY · 2026-05-15 (Agent D · diagnostic-code.md §G-3): tab items used to be
 * defined inline here AND in `components/nav/ChromeTabBar.tsx`. Both now
 * consume `useTabItems()` from `components/nav/tabItems.ts`. Active-state
 * strategy is the only thing each wrapper customizes · here, we combine the
 * (tabs) navigator's state with the pathname because /ruta lives OUTSIDE the
 * (tabs) group · the navigator's state never reports `ruta` so we fall back
 * to pathname for that one tab.
 */
function LiquidGlassTabBar({ state }: TabBarProps) {
  const router = useRouter();
  // The /ruta listing screen lives OUTSIDE the (tabs) group at app/ruta/index.tsx
  // (because /ruta/stop/[id] is a non-tabbed full-screen route). When the user
  // is on /ruta, the (tabs) navigator's state doesn't include it, so we use
  // the full pathname to compute active state for that tab.
  const pathname = usePathname();
  const currentName = state.routes[state.index]?.name;
  const isOnRutaTree = pathname?.startsWith("/ruta") ?? false;

  // Compute the single active key from the (tabs) navigator + pathname.
  const activeKey: TabDescriptor["key"] | null = isOnRutaTree
    ? "ruta"
    : currentName === "hoy"
      ? "hoy"
      : currentName === "tu-codice"
        ? "tu-codice"
        : currentName === "mapa"
          ? "mapa"
          : null;

  const items = useTabItems(router, activeKey);
  return <GlassTabBar items={items} />;
}

export default function TabLayout() {
  // A11y · 2026-05-15 (Agent D · diagnostic-code.md §D-2):
  // The visual tab bar shows 4 items (Hoy · La Ruta · Tu Códice · Mapa), but
  // the (tabs) navigator only registers 3 of them — `ruta` lives OUTSIDE the
  // (tabs) group at app/ruta/index.tsx because /ruta/stop/[id] is a non-tabbed
  // full-screen route. The diagnostic flagged a mismatch ("3 vs 4").
  //
  // Resolution: the screen-reader contract is owned by the manual
  // `LiquidGlassTabBar` + the underlying `GlassTabBar` component, which
  // declares its own `accessibilityRole="tablist"` and emits 4 individual
  // `accessibilityRole="tab"` items (one per visible label). VoiceOver
  // linear traversal of the bar reports 4 tabs in the correct visual order
  // with correct selected-state. The `<Tabs>` navigator's internal route
  // table only needs the 3 routes that physically render inside the group.
  //
  // Adding `<Tabs.Screen name="ruta" href={null} />` would point at a file
  // that doesn't exist inside (tabs)/ and triggers expo-router warnings · so
  // we leave the navigator at 3 routes and rely on the tab bar's own a11y
  // surface. The manual router.push("/ruta") inside LiquidGlassTabBar handles
  // navigation; expo-router's internal Tabs state simply doesn't track it.
  //
  // If/when /ruta moves INSIDE (tabs) (e.g. if Stop becomes a modal sheet),
  // register it here with the matching file in (tabs)/ruta.tsx.
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="hoy" options={{ title: "Hoy" }} />
      <Tabs.Screen name="tu-codice" options={{ title: "Tu Códice" }} />
      <Tabs.Screen name="mapa" options={{ title: "Mapa" }} />
    </Tabs>
  );
}
