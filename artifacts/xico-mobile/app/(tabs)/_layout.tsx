import { Tabs, useRouter } from "expo-router";
import React from "react";

import { GlassTabBar, type TabItem } from "@/components/liquid-glass";
import { Pillars } from "@/constants/colors";

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>>[0];

function LiquidGlassTabBar({ state }: TabBarProps) {
  const router = useRouter();
  const currentName = state.routes[state.index]?.name;
  const items: TabItem[] = [
    {
      key: "hoy",
      label: "Hoy",
      accentColor: Pillars.indice,
      onPress: () => router.push("/hoy"),
      isActive: currentName === "hoy",
      accessibilityLabel: "Hoy · El Despacho del día",
    },
    {
      key: "ruta",
      label: "La Ruta",
      accentColor: Pillars.indice,
      onPress: () => router.push("/ruta"),
      isActive: currentName === "ruta",
      accessibilityLabel: "La Ruta · paseo semanal",
    },
    {
      key: "tu-codice",
      label: "Tu Códice",
      accentColor: Pillars.archivo,
      onPress: () => router.push("/tu-codice"),
      isActive: currentName === "tu-codice",
      accessibilityLabel: "Tu Códice · tu pasaporte personal",
    },
    {
      key: "mapa",
      label: "Mapa",
      accentColor: Pillars.indice,
      onPress: () => router.push("/mapa"),
      isActive: currentName === "mapa",
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
      <Tabs.Screen name="ruta" options={{ title: "La Ruta", href: "/ruta" }} />
      <Tabs.Screen name="tu-codice" options={{ title: "Tu Códice" }} />
      <Tabs.Screen name="mapa" options={{ title: "Mapa" }} />
      {/* mi-xico stays hidden until Phase 3 Task 3.1 renames it to tu-codice. */}
      <Tabs.Screen name="mi-xico" options={{ href: null }} />
    </Tabs>
  );
}
