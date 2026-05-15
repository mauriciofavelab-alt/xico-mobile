import React, { useEffect } from "react";
import { Image, StyleSheet, View, type ImageSourcePropType, type ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { GrainOverlay } from "@/components/pasaporte/GrainOverlay";

/**
 * StopVeil · veiled hero region for the Stop screen.
 *
 * State 1 (en camino): veiled — translucent layer with rumbo accent tint covers
 *   the hero content. Implies "there's something behind this, but you can't
 *   read it from here yet."
 * State 2 (llegada): veil lifts in 600ms cubic-out (brandbook §7.6 editorial
 *   easing). Reduced motion → instant fade.
 *
 * v1.1 (2026-05-14 evening · post ui-ux-pro-max P2 audit): grew from 280pt
 * to 340pt default, expanded the layer stack to support a textual hero
 * (display-type stop name + rumbo Kicker) instead of a flat surface. Layer
 * order back→front:
 *
 *   1. Solid surface base                 (Colors.surface)
 *   2. Rumbo accent wash                  (LinearGradient · top 14% → bottom 4%)
 *   3. Grain texture                      (<GrainOverlay opacity={0.04} />)
 *   4. Hero content (children)            (display name, rumbo, etc.)
 *   5. Veil overlay                       (lifts on `lifted=true`)
 *   6. Atmosphere wash                    (optional · atardecer warm gold)
 *
 * The Stop screen wraps this in an Animated.ScrollView and applies a parallax
 * translateY to this whole region — see app/ruta/stop/[id].tsx.
 */

type Props = ViewProps & {
  accent: string;
  lifted: boolean;
  height?: number;
  /** Optional time-mode atmosphere wash (e.g. atardecer warm gold).
   *  Painted on top of the veil so it persists even after `lifted=true`. */
  atmosphereOverlay?: string | null;
  /** Optional lugar photograph · sourced via despacho match. When present it
   *  becomes the BASE layer below the rumbo wash + grain; a bottom-to-top
   *  black gradient (60% at the foot, transparent at the top) ensures the
   *  body composition below the hero still reads on warm-dark. */
  photoSource?: ImageSourcePropType;
};

export function StopVeil({
  accent,
  lifted,
  height = 340,
  atmosphereOverlay,
  photoSource,
  children,
  style,
  ...rest
}: Props) {
  const opacity = useSharedValue(1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = lifted ? 0 : 1;
      return;
    }
    opacity.value = withTiming(lifted ? 0 : 1, {
      duration: 600,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
  }, [lifted, opacity, reducedMotion]);

  const veilStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[{ height, position: "relative", overflow: "hidden", backgroundColor: Colors.surface }, style]} {...rest}>
      {/* Layer 1 · lugar photograph (optional) — sourced via Build #11 photo
          program. Becomes the BASE; rumbo wash + grain + bottom black fade
          stack on top so the rumbo identity reads through the image and the
          body text below the hero stays legible. */}
      {photoSource ? (
        <Image
          source={photoSource}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessible={false}
          accessibilityIgnoresInvertColors
        />
      ) : null}
      {/* Layer 2 · rumbo accent wash — sets the place's color identity even
          before the veil lifts. Top 14% alpha fading to 4% at bottom gives a
          subtle vertical light source feel without using shadow. Stack
          opacity drops by half when a photo is present so the picture reads,
          not a flat color block. */}
      <LinearGradient
        colors={
          photoSource
            ? [`${accent}14`, `${accent}0A`, "transparent"]
            : [`${accent}24`, `${accent}14`, `${accent}0A`]
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Layer 3 · grain texture · brandbook §7.6 tactile print feel */}
      <GrainOverlay opacity={0.04} />
      {/* Bottom-to-top black gradient — only when a photo is present.
          Ensures the body text below the hero reads on warm-dark instead of
          on top of an image edge. 60% at the foot per brief. */}
      {photoSource ? (
        <LinearGradient
          colors={["transparent", "rgba(8,5,8,0.6)"]}
          start={{ x: 0.5, y: 0.4 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}

      {/* Layer 4 · hero content (passed in by Stop screen) */}
      {children}

      {/* Layer 5 · the veil itself · lifts on llegada */}
      <Animated.View style={[StyleSheet.absoluteFill, veilStyle]} pointerEvents="none">
        {/* Near-black layer for legibility while the content is hidden */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.background, opacity: 0.55 }]} />
        {/* Extra accent tint, diagonal direction for movement */}
        <LinearGradient
          colors={[`${accent}1A`, "transparent", `${accent}10`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Bottom shadow gradient to ground the despacho text below */}
        <LinearGradient
          colors={["transparent", "rgba(8,5,8,0.85)"]}
          start={{ x: 0.5, y: 0.55 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Layer 6 · Modo hora atmosphere overlay · atardecer warm wash etc. */}
      {atmosphereOverlay ? (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: atmosphereOverlay }]}
          pointerEvents="none"
        />
      ) : null}
    </View>
  );
}
