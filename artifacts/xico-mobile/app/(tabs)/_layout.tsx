import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

import { Colors } from "@/constants/colors";

function IconIndice({ active }: { active: boolean }) {
  const color = active ? "hsl(335, 85%, 45%)" : Colors.textTertiary;
  const sw = active ? 1.75 : 1.4;
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="square" strokeLinejoin="miter">
      <Rect x="2" y="2" width="8" height="13" />
      <Rect x="12" y="2" width="8" height="5" />
      <Rect x="12" y="9" width="8" height="6" />
      <Line x1="2" y1="18.5" x2="20" y2="18.5" />
    </Svg>
  );
}

function IconCultura({ active }: { active: boolean }) {
  const color = active ? "hsl(220, 100%, 30%)" : Colors.textTertiary;
  const sw = active ? 1.75 : 1.4;
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth={sw}>
      <Path d="M1.5 11 C4.5 5.5 7.5 3 11 3 C14.5 3 17.5 5.5 20.5 11 C17.5 16.5 14.5 19 11 19 C7.5 19 4.5 16.5 1.5 11Z" />
      <Circle cx="11" cy="11" r="2.8" />
    </Svg>
  );
}

function IconAhora({ active }: { active: boolean }) {
  const color = active ? "hsl(25, 80%, 45%)" : Colors.textTertiary;
  const sw = active ? 1.75 : 1.4;
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <Circle cx="11" cy="11" r="1.5" fill={color} stroke="none" />
      <Path d="M7.5 7.2 A5.3 5.3 0 0 0 7.5 14.8" />
      <Path d="M14.5 7.2 A5.3 5.3 0 0 1 14.5 14.8" />
      <Path d="M4 3.8 A10 10 0 0 0 4 18.2" />
      <Path d="M18 3.8 A10 10 0 0 1 18 18.2" />
    </Svg>
  );
}

function IconArchivo({ active }: { active: boolean }) {
  const color = active ? "hsl(160, 100%, 20%)" : Colors.textTertiary;
  const sw = active ? 1.75 : 1.4;
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <Circle cx="11" cy="7.5" r="3.5" />
      <Path d="M3 20 C3 15.5 6.5 13 11 13 C15.5 13 19 15.5 19 20" />
    </Svg>
  );
}

export default function TabLayout() {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : Colors.background,
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.08)",
          elevation: 0,
          height: isWeb ? 68 : 60,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 9,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          marginBottom: 4,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }]}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Índice",
          tabBarActiveTintColor: "hsl(335, 85%, 45%)",
          tabBarIcon: ({ focused }) => <IconIndice active={focused} />,
        }}
      />
      <Tabs.Screen
        name="cultura"
        options={{
          title: "Cultura",
          tabBarActiveTintColor: "hsl(220, 100%, 30%)",
          tabBarIcon: ({ focused }) => <IconCultura active={focused} />,
        }}
      />
      <Tabs.Screen
        name="mexico-ahora"
        options={{
          title: "Ahora",
          tabBarActiveTintColor: "hsl(25, 80%, 45%)",
          tabBarIcon: ({ focused }) => <IconAhora active={focused} />,
        }}
      />
      <Tabs.Screen
        name="mi-xico"
        options={{
          title: "Archivo",
          tabBarActiveTintColor: "hsl(160, 100%, 20%)",
          tabBarIcon: ({ focused }) => <IconArchivo active={focused} />,
        }}
      />
    </Tabs>
  );
}
