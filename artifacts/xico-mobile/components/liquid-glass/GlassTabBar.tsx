import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlass } from "@/constants/liquidGlass";
import { Colors } from "@/constants/colors";
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
