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

import { GlassTabBar, type TabItem } from "@/components/liquid-glass";
import { Pillars } from "@/constants/colors";

export function ChromeTabBar() {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const items: TabItem[] = [
    {
      key: "hoy",
      label: "Hoy",
      accentColor: Pillars.indice,
      onPress: () => router.push("/hoy"),
      isActive: pathname === "/hoy" || pathname === "/",
      accessibilityLabel: "Hoy · El Despacho del día",
    },
    {
      key: "ruta",
      label: "La Ruta",
      accentColor: Pillars.indice,
      onPress: () => router.push("/ruta"),
      isActive: pathname.startsWith("/ruta"),
      accessibilityLabel: "La Ruta · paseo semanal",
    },
    {
      key: "tu-codice",
      label: "Tu Códice",
      accentColor: Pillars.archivo,
      onPress: () => router.push("/tu-codice"),
      isActive: pathname === "/tu-codice",
      accessibilityLabel: "Tu Códice · tu pasaporte personal",
    },
    {
      key: "mapa",
      label: "Mapa",
      accentColor: Pillars.indice,
      onPress: () => router.push("/mapa"),
      isActive: pathname === "/mapa",
      accessibilityLabel: "Mapa · paradas en Madrid",
    },
  ];

  return <GlassTabBar items={items} />;
}
