import { Tabs, useRouter, usePathname } from "expo-router";
import React from "react";

import { GlassTabBar, type TabItem } from "@/components/liquid-glass";
import { Pillars } from "@/constants/colors";

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

function LiquidGlassTabBar({ state }: TabBarProps) {
  const router = useRouter();
  // The /ruta listing screen lives OUTSIDE the (tabs) group at app/ruta/index.tsx
  // (because /ruta/stop/[id] is a non-tabbed full-screen route). When the user
  // is on /ruta, the (tabs) navigator's state doesn't include it, so we use
  // the full pathname to compute active state for the tab bar.
  const pathname = usePathname();
  const currentName = state.routes[state.index]?.name;
  const isOnRutaTree = pathname?.startsWith("/ruta") ?? false;

  const items: TabItem[] = [
    {
      key: "hoy",
      label: "Hoy",
      accentColor: Pillars.indice,
      onPress: () => router.push("/hoy"),
      isActive: currentName === "hoy" && !isOnRutaTree,
      accessibilityLabel: "Hoy · El Despacho del día",
    },
    {
      key: "ruta",
      label: "La Ruta",
      accentColor: Pillars.indice,
      onPress: () => router.push("/ruta"),
      isActive: isOnRutaTree,
      accessibilityLabel: "La Ruta · paseo semanal",
    },
    {
      key: "tu-codice",
      label: "Tu Códice",
      accentColor: Pillars.archivo,
      onPress: () => router.push("/tu-codice"),
      isActive: currentName === "tu-codice" && !isOnRutaTree,
      accessibilityLabel: "Tu Códice · tu pasaporte personal",
    },
    {
      key: "mapa",
      label: "Mapa",
      accentColor: Pillars.indice,
      onPress: () => router.push("/mapa"),
      isActive: currentName === "mapa" && !isOnRutaTree,
      accessibilityLabel: "Mapa · paradas en Madrid",
    },
  ];
  return <GlassTabBar items={items} />;
}

export default function TabLayout() {
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
