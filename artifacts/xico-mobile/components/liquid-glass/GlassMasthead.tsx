import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlass } from "@/constants/liquidGlass";
import { Colors } from "@/constants/colors";
import { TypeSize, Tracking, Fonts } from "@/constants/editorial";
import { Shadow, InsetRim } from "@/constants/shadows";

interface GlassMastheadProps {
  /** Caps label, left side (e.g. "XICO · HOY") */
  label: string;
  /** Caps label, right side (e.g. "VIERNES 15 MAY") */
  meta?: string;
  /** Show a pulsing colored dot before the label (today's despacho accent color hex) */
  liveDotColor?: string;
  /**
   * Optional scroll position shared value · drives blur intensity + bg opacity
   * so the masthead "thickens" as the user scrolls content underneath it.
   * Range: 0 → 120pt of scroll. At 0 we render the resting blur (24);
   * at ≥120pt we render the dense blur (60) + heavier bg tint.
   *
   * Per Apple-patterns diagnostic §4.7: every Apple top bar (Music, Photos,
   * News, Mail) thickens its blur on scroll. The signal: "content is
   * passing UNDER me" rather than "content is sliding next to me."
   *
   * Omit on screens without a ScrollView · the masthead renders at the
   * resting state and never animates.
   */
  scrollY?: SharedValue<number>;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export function GlassMasthead({ label, meta, liveDotColor, scrollY }: GlassMastheadProps) {
  const insets = useSafeAreaInsets();
  // Spec §18.3 · top: 81pt from top to clear Dynamic Island (59pt status + 22pt DI clearance)
  const topOffset = Math.max(insets.top + 22, 81);

  // Scroll-driven blur intensity. The resting state is ultraThin (24) and
  // the dense state lands at 60 over the first 120pt of scroll. Background
  // opacity also lifts from the ultraThin 0.18 to a denser 0.40 — same
  // window. iOS-only · web ignores Reanimated <-> BlurView intensity binding.
  const blurStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const intensity = interpolate(scrollY.value, [0, 120], [24, 60], "clamp");
    return { intensity } as any; // BlurView's intensity is treated as a style prop on iOS
  });

  // Background tint also intensifies on scroll · drives the "thicken" feel
  // even on platforms where the blur intensity binding doesn't take.
  const tintStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const opacity = interpolate(scrollY.value, [0, 120], [0.18, 0.4], "clamp");
    return { backgroundColor: `rgba(20, 14, 16, ${opacity})` };
  });

  return (
    <Animated.View
      entering={
        Platform.OS === "web"
          ? undefined
          : FadeInDown.duration(600).delay(100).easing(Easing.bezier(0.22, 1, 0.36, 1))
      }
      style={[styles.container, { top: topOffset, marginHorizontal: 16 }, tintStyle]}
      accessibilityRole="header"
      accessibilityLabel={`${label}${meta ? ` · ${meta}` : ""}`}
    >
      {scrollY ? (
        <AnimatedBlurView
          intensity={24}
          tint="dark"
          style={[StyleSheet.absoluteFill, styles.blur, blurStyle]}
        />
      ) : (
        <BlurView
          intensity={LiquidGlass.ultraThin.blurAmount}
          tint="dark"
          style={[StyleSheet.absoluteFill, styles.blur]}
        />
      )}
      <View style={styles.contentRow}>
        <View style={styles.leftRow}>
          {liveDotColor && (
            <View style={[styles.dot, { backgroundColor: liveDotColor, shadowColor: liveDotColor }]} />
          )}
          <Text style={styles.labelText}>{label}</Text>
        </View>
        {meta && <Text style={styles.metaText}>{meta}</Text>}
      </View>
    </Animated.View>
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
    // Apple-grade chrome float shadow · per Apple-patterns diagnostic §1.2.
    // Subtle 8pt lift, wide 24pt halo, 32% opacity. The wider blur is the
    // signal "content scrolls UNDER me," not "I'm sitting next to content."
    ...Shadow.chromeFloat,
    // Inset top hairline · fakes Apple's "inset highlight" trick that
    // catches ambient light on the chrome's top edge. Per the diagnostic
    // §1.6 this is the difference between fake glass and real glass.
    ...InsetRim,
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
