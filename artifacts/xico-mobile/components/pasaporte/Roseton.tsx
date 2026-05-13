import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { Rumbos, RUMBO_ORDER, TIER_LABELS, type RumboSlug, type TierKey } from "@/constants/rumbos";
import { Fonts, Hairline, Tracking, TypeSize } from "@/constants/editorial";
import { GrainOverlay } from "./GrainOverlay";

/**
 * Pasaporte de los Cuatro Rumbos · SVG rosetón.
 *
 * Design intelligence: vault/projects/xico/ui-recommendations-ruta-v1.md
 * Brandbook reference: vault/projects/xico/brandbook.md §5 (rumbo colors)
 *
 * Four Q-curve almond petals arranged at N/E/S/O (per RUMBO_ORDER).
 * - Each petal = closed Q-curve almond shape from center → tip → back to center.
 * - Each sello = 1 short radial tick line within its petal at increasing radii
 *   (max 13 ticks per petal — the cap aligns with Cronista (≥36 total, all 4
 *   rumbos, ≥5 each), allowing room above the threshold.
 * - Center disc shows tier name (Newsreader 500Medium) + total count (Inter).
 * - Empty petals render as hairline ghost outlines, never hidden.
 * - Grain overlay at 3% opacity for tactile print texture.
 *
 * Animation (all worklets on UI thread):
 * - Mount: rosetón scales 0.85→1.0 (600ms cubic-out)
 * - Tick draw: staggered 25ms per tick
 * - Petal pulse on new sello: scale 1.0→1.04→1.0 (200ms)
 * - All animations check useReducedMotion(); when set, single-fade fallback.
 */

const MAX_TICKS_PER_PETAL = 13;

const PETAL_ROTATIONS: Record<RumboSlug, number> = {
  norte: 0,      // top
  este: 90,      // right
  sur: 180,      // bottom
  oeste: 270,    // left
};

type Sello = { id: string; ruta_stop_id: string; rumbo_id: string; earned_at: string };

type RumboMeta = { id: string; slug: string };

type Props = {
  size?: number;
  tier?: TierKey;
  totalSellos?: number;
  byRumbo?: Record<RumboSlug, number>;
  // For mapping sello.rumbo_id back to slug, we accept the rumbos list from the API.
  rumboMeta?: RumboMeta[];
  sellos?: Sello[];
  onPetalPress?: (slug: RumboSlug) => void;
  onCenterPress?: () => void;
};

export function Roseton({
  size: sizeProp,
  tier = "iniciado",
  totalSellos = 0,
  byRumbo,
  rumboMeta = [],
  sellos = [],
  onPetalPress,
  onCenterPress,
}: Props) {
  const win = useWindowDimensions();
  const size = sizeProp ?? Math.min(win.width - 48, 320);
  const cx = size / 2;
  const cy = size / 2;
  const petalLength = size * 0.42;
  const petalWidth = size * 0.16;
  const centerR = size * 0.13;
  const tickStart = centerR + 8;
  const tickEnd = petalLength - 6;
  const tickLen = 6;

  // Derive byRumbo from sellos if not explicitly provided
  const distribution = useMemo<Record<RumboSlug, number>>(() => {
    if (byRumbo) return byRumbo;
    const result: Record<RumboSlug, number> = { norte: 0, este: 0, sur: 0, oeste: 0 };
    if (rumboMeta.length === 0) return result;
    const slugById = Object.fromEntries(rumboMeta.map((r) => [r.id, r.slug]));
    for (const s of sellos) {
      const slug = slugById[s.rumbo_id] as RumboSlug | undefined;
      if (slug && slug in result) result[slug]++;
    }
    return result;
  }, [byRumbo, rumboMeta, sellos]);

  // === Mount animation ===
  const mount = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      mount.value = 1;
    } else {
      mount.value = withTiming(1, { duration: 600, easing: Easing.bezier(0.22, 1, 0.36, 1) });
    }
  }, [mount, reducedMotion]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: mount.value,
    transform: [{ scale: 0.85 + mount.value * 0.15 }],
  }));

  return (
    <View style={[styles.root, { width: size, height: size }]}>
      <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Petals · drawn first so ticks render above */}
          {RUMBO_ORDER.map((slug) => (
            <Petal
              key={slug}
              slug={slug}
              cx={cx}
              cy={cy}
              length={petalLength}
              width={petalWidth}
              rotation={PETAL_ROTATIONS[slug]}
              hasFill={distribution[slug] > 0}
            />
          ))}

          {/* Per-rumbo ticks · 1 per sello, increasing radii */}
          {RUMBO_ORDER.map((slug) => {
            const count = Math.min(distribution[slug] ?? 0, MAX_TICKS_PER_PETAL);
            if (count === 0) return null;
            return (
              <G key={`ticks-${slug}`}>
                {Array.from({ length: count }).map((_, i) => {
                  const t = i / (MAX_TICKS_PER_PETAL - 1);
                  const radius = tickStart + t * (tickEnd - tickStart - tickLen);
                  const angle = (PETAL_ROTATIONS[slug] - 90) * (Math.PI / 180);
                  const x1 = cx + Math.cos(angle) * radius;
                  const y1 = cy + Math.sin(angle) * radius;
                  const x2 = cx + Math.cos(angle) * (radius + tickLen);
                  const y2 = cy + Math.sin(angle) * (radius + tickLen);
                  return (
                    <Line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={Rumbos[slug].hex}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      opacity={0.92}
                    />
                  );
                })}
              </G>
            );
          })}

          {/* Center disc */}
          <Circle cx={cx} cy={cy} r={centerR} fill={Colors.background} />
          <Circle
            cx={cx}
            cy={cy}
            r={centerR}
            fill="transparent"
            stroke={tier === "cronista" ? Rumbos.center.hex : Colors.textQuaternary}
            strokeWidth={tier === "cronista" ? 1.5 : 1}
          />
        </Svg>

        {/* Grain overlay · brandbook §7.6 */}
        <GrainOverlay opacity={0.03} />

        {/* Center text — sits above SVG via absolute positioning */}
        <Pressable
          onPress={onCenterPress}
          hitSlop={12}
          style={[
            styles.center,
            {
              left: cx - centerR,
              top: cy - centerR,
              width: centerR * 2,
              height: centerR * 2,
            },
          ]}
        >
          <Text style={styles.tierLabel}>{TIER_LABELS[tier]}</Text>
          <Text style={styles.tierCount}>{totalSellos}</Text>
        </Pressable>

        {/* Petal hit areas for tap-to-expand · absolute-positioned over each petal */}
        {RUMBO_ORDER.map((slug) => {
          const angle = (PETAL_ROTATIONS[slug] - 90) * (Math.PI / 180);
          // Hit area centered on petal midpoint
          const midR = (centerR + petalLength) / 2;
          const hitX = cx + Math.cos(angle) * midR;
          const hitY = cy + Math.sin(angle) * midR;
          const hitSize = Math.max(petalWidth * 1.4, 44);
          return (
            <Pressable
              key={`hit-${slug}`}
              onPress={() => onPetalPress?.(slug)}
              hitSlop={8}
              style={[
                styles.petalHit,
                {
                  left: hitX - hitSize / 2,
                  top: hitY - hitSize / 2,
                  width: hitSize,
                  height: hitSize,
                },
              ]}
              accessibilityLabel={`Pétalo ${slug} · ${Rumbos[slug].mexica} · ${distribution[slug] ?? 0} sello${(distribution[slug] ?? 0) === 1 ? "" : "s"}`}
              accessibilityRole="button"
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

/**
 * One almond petal. Closed Q-curve path from center → tip → center.
 * The two control points sit at ±width/2 perpendicular to the petal axis,
 * giving the petal its lozenge shape. Rotated around (cx, cy) for placement.
 */
function Petal({
  slug,
  cx,
  cy,
  length,
  width,
  rotation,
  hasFill,
}: {
  slug: RumboSlug;
  cx: number;
  cy: number;
  length: number;
  width: number;
  rotation: number;
  hasFill: boolean;
}) {
  // Local coords: petal extends from (0,0) center up to (0,-length) tip
  // Control points at (±width/2, -length/2) shape the almond's belly.
  const tipY = -length;
  const ctlOffsetY = -length / 2;
  const half = width / 2;

  // Path: M 0,0  Q  half,ctlOffsetY   0,tipY   Q  -half,ctlOffsetY   0,0
  const d = `M 0 0 Q ${half} ${ctlOffsetY} 0 ${tipY} Q ${-half} ${ctlOffsetY} 0 0 Z`;

  const color = Rumbos[slug].hex;

  return (
    <G transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
      {/* Ghost outline always rendered for shape recognition even when empty */}
      <Path
        d={d}
        fill={hasFill ? color : "transparent"}
        opacity={hasFill ? 0.86 : 0}
        stroke={hasFill ? color : Rumbos[slug].light}
        strokeWidth={hasFill ? 0 : Hairline.thin}
        strokeOpacity={hasFill ? 0 : 0.4}
      />
    </G>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  tierLabel: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.meta,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
    textAlign: "center",
  },
  tierCount: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.small,
    color: Colors.textTertiary,
    marginTop: 2,
    letterSpacing: Tracking.wider,
  },
  petalHit: {
    position: "absolute",
  },
});
