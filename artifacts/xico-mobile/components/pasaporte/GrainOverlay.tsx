import React, { useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Svg, { Defs, Filter, FeTurbulence, FeColorMatrix, Rect } from "react-native-svg";

/**
 * 3% opacity SVG grain noise. Brandbook §7.6.
 *
 * Single reusable component — wrap any surface to add tactile print texture.
 * The `feTurbulence` filter generates fractal noise; `feColorMatrix` desaturates
 * + caps alpha at 3%. No bitmap; renders at any size without pixelation.
 *
 * Usage:
 *   <View style={{ width: 220, height: 220 }}>
 *     <Roseton />
 *     <GrainOverlay />
 *   </View>
 */
export function GrainOverlay({ style, opacity = 0.03 }: { style?: ViewStyle; opacity?: number }) {
  // Same filter ID per instance is fine — SVG defs are local.
  const filterId = useMemo(() => `grain-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" style={{ opacity }}>
        <Defs>
          <Filter id={filterId} x="0" y="0" width="100%" height="100%">
            <FeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} />
            <FeColorMatrix type="matrix" values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.6 0" />
          </Filter>
        </Defs>
        <Rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </Svg>
    </View>
  );
}
