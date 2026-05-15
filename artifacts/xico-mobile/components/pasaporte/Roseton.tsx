import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";

import { Colors } from "@/constants/colors";
import { Rumbos, RUMBO_ORDER, TIER_LABELS, type RumboSlug, type TierKey } from "@/constants/rumbos";
import { Fonts, Hairline, Tracking, TypeSize } from "@/constants/editorial";
import { GrainOverlay } from "./GrainOverlay";
import { Shadow } from "@/constants/shadows";

/**
 * Pasaporte de los Cuatro Rumbos · SVG rosetón.
 *
 * Design intelligence: vault/projects/xico/ui-recommendations-ruta-v1.md
 * Brandbook reference: vault/projects/xico/brandbook.md §5 (rumbo colors)
 *
 * Two modes:
 *
 *   mode='lifetime' (legacy default) · aggregates ALL sellos a user has ever
 *     earned. Ticks accumulate up to MAX_TICKS_PER_PETAL=13 per rumbo. Center
 *     disc shows current tier (Iniciado → Cronista). NOTE: this mode has the
 *     empty-state psychology issue flagged in the 2026-05-14 design-critique
 *     audit — at 0 sellos the rosetón signals "1/52 done" which the manifesto
 *     forbids. Kept for backward compat; prefer mode='week' for new screens.
 *
 * Optional · `withDropShadows` (Phase 3 Task 3.3 · spec §7.4 pt 8):
 *   When true, filled petals render an offset-duplicate "shadow" path under
 *   their fill. Sanctioned exception to the brandbook "hairline > shadow"
 *   default · used for the Tu Códice hero rosetón (220pt) where the larger
 *   scale + dark backdrop demand visible depth. Defaults false so smaller
 *   call sites (Ruta listing, Stop screen) are unchanged.
 *
 *   mode='week' (PREFERRED · added 2026-05-14 post-critique reframe) · shows
 *     ONLY this week's Ruta. Petals reflect rumbos PRESENT in this Ruta;
 *     rumbos not in this Ruta render as extra-dim "absent" outlines. Ticks
 *     scale to this Ruta's stop count per rumbo (e.g. 2 ticks max if Norte
 *     has 2 stops). When earnedStops === totalStops, center disc gets a
 *     subtle Tlalxicco-green ring to mark "Ruta completa" for the week.
 *     Empty state never signals lifetime incompleteness — it always means
 *     "walk this week's route and the rosetón fills." Per-week archive
 *     (Tu Códice) is v2.
 *
 * Common to both modes:
 * - Four Q-curve almond petals arranged at N/E/S/O (per RUMBO_ORDER).
 * - Each sello = 1 short radial tick line within its petal at increasing radii.
 * - Grain overlay at 3% opacity for tactile print texture.
 *
 * Animation (all worklets on UI thread):
 * - Mount: rosetón scales 0.85→1.0 (600ms cubic-out)
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

type LifetimeProps = {
  mode?: "lifetime";
  size?: number;
  tier?: TierKey;
  totalSellos?: number;
  byRumbo?: Record<RumboSlug, number>;
  // For mapping sello.rumbo_id back to slug, we accept the rumbos list from the API.
  rumboMeta?: RumboMeta[];
  sellos?: Sello[];
  onPetalPress?: (slug: RumboSlug) => void;
  onCenterPress?: () => void;
  /** Phase 3 Task 3.3 · per-petal drop shadow for hero rosetón (220pt+ scale).
   *  Defaults false — small call sites stay shadow-free. See module JSDoc. */
  withDropShadows?: boolean;
};

type WeekProps = {
  mode: "week";
  size?: number;
  // Stops in this Ruta tagged to each rumbo (e.g. inaugural: 2/1/1/1)
  rutaStopsByRumbo: Record<RumboSlug, number>;
  // Earned this week per rumbo (e.g. mid-walk: 1/0/0/0)
  earnedByRumbo: Record<RumboSlug, number>;
  totalStops: number;
  earnedStops: number;
  isComplete: boolean;
  weekLabel?: string | null; // e.g. "Semana 19"
  // Lifetime tier shown as a small secondary label in the center disc, since
  // the week-mode center can't sensibly display "Iniciado · 0" anymore.
  tier?: TierKey;
  onPetalPress?: (slug: RumboSlug) => void;
  onCenterPress?: () => void;
  /** Phase 3 Task 3.3 · per-petal drop shadow for hero rosetón (220pt+ scale).
   *  Defaults false — small call sites stay shadow-free. See module JSDoc. */
  withDropShadows?: boolean;
};

type Props = LifetimeProps | WeekProps;

export function Roseton(props: Props) {
  const win = useWindowDimensions();
  const size = props.size ?? Math.min(win.width - 48, 320);
  const cx = size / 2;
  const cy = size / 2;
  const petalLength = size * 0.42;
  const petalWidth = size * 0.16;
  const centerR = size * 0.13;
  const tickStart = centerR + 8;
  const tickEnd = petalLength - 6;
  const tickLen = 6;

  const isWeek = props.mode === "week";

  // Earned count per rumbo + cap (max ticks visible) per rumbo + presence
  // (whether this rumbo participates in the current view at all).
  // week mode · cap = this Ruta's stop count in that rumbo; present iff > 0
  // lifetime mode · cap = MAX_TICKS_PER_PETAL (13); present = always true
  const distribution = useMemo<Record<RumboSlug, number>>(() => {
    if (isWeek) return (props as WeekProps).earnedByRumbo;
    const lp = props as LifetimeProps;
    if (lp.byRumbo) return lp.byRumbo;
    const result: Record<RumboSlug, number> = { norte: 0, este: 0, sur: 0, oeste: 0 };
    if ((lp.rumboMeta ?? []).length === 0) return result;
    const slugById = Object.fromEntries((lp.rumboMeta ?? []).map((r) => [r.id, r.slug]));
    for (const s of lp.sellos ?? []) {
      const slug = slugById[s.rumbo_id] as RumboSlug | undefined;
      if (slug && slug in result) result[slug]++;
    }
    return result;
  }, [props, isWeek]);

  const caps: Record<RumboSlug, number> = useMemo(() => {
    if (isWeek) return (props as WeekProps).rutaStopsByRumbo;
    return { norte: MAX_TICKS_PER_PETAL, este: MAX_TICKS_PER_PETAL, sur: MAX_TICKS_PER_PETAL, oeste: MAX_TICKS_PER_PETAL };
  }, [props, isWeek]);

  // Petal opacity scales with earned-ratio in week mode for a sense of fill.
  const fillRatio = (slug: RumboSlug): number => {
    const cap = caps[slug] ?? 0;
    if (cap === 0) return 0;
    return Math.min(1, (distribution[slug] ?? 0) / cap);
  };

  const isPresent = (slug: RumboSlug): boolean => (caps[slug] ?? 0) > 0;

  // === Phase 9 (Task 9.3) · VoiceOver summary label ===
  //
  // Raw SVGs are invisible to assistive tech — by default VoiceOver users
  // either skip the rosetón entirely or hear "Image" with no context. The
  // petals and center disc already have their own labels (still useful for
  // focused interaction), but the user also needs to hear an at-a-glance
  // summary of the whole pasaporte when they first land on the component.
  //
  // The summary covers totals + rumbo coverage + state-aware framing:
  //   lifetime → "Tu pasaporte: 2 de 13 sellos · 2 rumbos cubiertos · Iniciado"
  //   week     → "Semana 19: 1 de 5 sellos · 1 rumbo cubierto" (or "Ruta
  //              completa" when isComplete). Spanish copy per brand voice.
  const summaryLabel = useMemo<string>(() => {
    const rumbosCovered = RUMBO_ORDER.reduce(
      (n, slug) => n + ((distribution[slug] ?? 0) > 0 ? 1 : 0),
      0,
    );
    const rumboWord = rumbosCovered === 1 ? "rumbo cubierto" : "rumbos cubiertos";
    if (isWeek) {
      const wp = props as WeekProps;
      const weekPrefix = wp.weekLabel ?? "Esta semana";
      if (wp.isComplete) {
        return `${weekPrefix}: ruta completa · ${wp.earnedStops} de ${wp.totalStops} sellos · ${rumbosCovered} ${rumboWord}`;
      }
      return `${weekPrefix}: ${wp.earnedStops} de ${wp.totalStops} sellos · ${rumbosCovered} ${rumboWord}`;
    }
    const lp = props as LifetimeProps;
    const total = lp.totalSellos ?? 0;
    const cap = RUMBO_ORDER.length * MAX_TICKS_PER_PETAL; // lifetime max ticks visible
    const tier = TIER_LABELS[lp.tier ?? "iniciado"];
    return `Tu pasaporte: ${total} de ${cap} sellos · ${rumbosCovered} ${rumboWord} · ${tier}`;
  }, [props, isWeek, distribution]);

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
    <View
      style={[styles.root, { width: size, height: size }]}
      // Phase 9 (Task 9.3) · container label so VoiceOver users get a summary
      // of the rosetón as a whole when they enter it. The petal + center
      // Pressables below remain individually focusable for granular nav.
      accessibilityRole="image"
      accessibilityLabel={summaryLabel}
    >
      <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
        {/* Petal glow layer · Apple-patterns §1.5 color-themed shadow.
            One absolutely-positioned View per FILLED rumbo, casting an iOS
            native colored shadow in that rumbo's hex. Sits UNDER the SVG so
            the petal fill paints over the source View but the cast shadow
            spreads outward, reading as a subtle color halo emerging from the
            petal · the user's earned rumbo "glows quietly with its color."
            iOS-only · Android's `elevation` doesn't tint, so the glow
            disappears on Android (acceptable · XICO is iOS-first).
            Reduced-motion respects: static peak glow, no pulse cycle. */}
        {RUMBO_ORDER.filter((slug) => (distribution[slug] ?? 0) > 0).map((slug) => (
          <PetalGlow
            key={`glow-${slug}`}
            slug={slug}
            cx={cx}
            cy={cy}
            length={petalLength}
            width={petalWidth}
            rotation={PETAL_ROTATIONS[slug]}
            reducedMotion={reducedMotion}
          />
        ))}
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          // The SVG itself is decorative once the parent View carries the
          // summary label — petal hit-areas + center disc handle interactive
          // focus separately.
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {/* Petals · drawn first so ticks render above. Three visual states:
              absent (not in this view) · ghost (in view, not yet earned) ·
              filled (earned, opacity scales with earned-ratio in week mode). */}
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
              fillRatio={fillRatio(slug)}
              present={isPresent(slug)}
              withDropShadow={!!props.withDropShadows && distribution[slug] > 0}
            />
          ))}

          {/* Per-rumbo ticks · 1 per earned sello, evenly distributed across
              the petal length using the per-mode cap (week: ruta stop count,
              lifetime: MAX_TICKS_PER_PETAL=13). */}
          {RUMBO_ORDER.map((slug) => {
            const cap = caps[slug] ?? 0;
            const count = Math.min(distribution[slug] ?? 0, cap);
            if (count === 0 || cap === 0) return null;
            return (
              <G key={`ticks-${slug}`}>
                {Array.from({ length: count }).map((_, i) => {
                  // Distribute ticks evenly across the petal interior. When
                  // cap=1 (single-stop rumbo this week), tick sits at petal
                  // midpoint. When cap>1, ticks space evenly along the axis.
                  const t = cap <= 1 ? 0.5 : i / (cap - 1);
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

          {/* Center disc · in week mode, the Tlalxicco-green ring appears
              when the week's Ruta is COMPLETE (not just on Cronista). This
              becomes a per-week ritual marker: "ruta completa · Semana 19". */}
          <Circle cx={cx} cy={cy} r={centerR} fill={Colors.background} />
          <Circle
            cx={cx}
            cy={cy}
            r={centerR}
            fill="transparent"
            stroke={
              isWeek
                ? ((props as WeekProps).isComplete ? Rumbos.center.hex : Colors.textQuaternary)
                : (((props as LifetimeProps).tier ?? "iniciado") === "cronista" ? Rumbos.center.hex : Colors.textQuaternary)
            }
            strokeWidth={
              isWeek
                ? ((props as WeekProps).isComplete ? 1.8 : 1)
                : (((props as LifetimeProps).tier ?? "iniciado") === "cronista" ? 1.5 : 1)
            }
          />
        </Svg>

        {/* Grain overlay · brandbook §7.6 */}
        <GrainOverlay opacity={0.03} />

        {/* Center text — sits above SVG via absolute positioning.
            week mode: shows the week label + "X / Y" walked. Complete state
            replaces the count line with the lifetime tier (so the user still
            knows their long-term level, just not as the primary message).
            lifetime mode: traditional tier + total sellos display. */}
        <Pressable
          onPress={props.onCenterPress}
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
          accessibilityLabel={
            isWeek
              ? `${(props as WeekProps).weekLabel ?? "Esta semana"} · ${(props as WeekProps).earnedStops} de ${(props as WeekProps).totalStops} sellos`
              : `${TIER_LABELS[((props as LifetimeProps).tier ?? "iniciado")]} · ${(props as LifetimeProps).totalSellos ?? 0} sellos`
          }
          accessibilityRole="button"
        >
          {isWeek ? (
            (props as WeekProps).isComplete ? (
              <>
                <Text style={styles.tierLabel}>Ruta completa</Text>
                <Text style={styles.tierCount}>
                  {(props as WeekProps).weekLabel ?? ""}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.tierLabel} numberOfLines={1} adjustsFontSizeToFit>
                  {(props as WeekProps).weekLabel ?? "Esta semana"}
                </Text>
                <Text style={styles.tierCount}>
                  {(props as WeekProps).earnedStops} / {(props as WeekProps).totalStops}
                </Text>
              </>
            )
          ) : (
            <>
              <Text style={styles.tierLabel}>{TIER_LABELS[((props as LifetimeProps).tier ?? "iniciado")]}</Text>
              <Text style={styles.tierCount}>{(props as LifetimeProps).totalSellos ?? 0}</Text>
            </>
          )}
        </Pressable>

        {/* Petal hit areas · only render for petals that participate in the
            current view (absent rumbos in week mode get no tap target). */}
        {RUMBO_ORDER.filter((slug) => isPresent(slug)).map((slug) => {
          const angle = (PETAL_ROTATIONS[slug] - 90) * (Math.PI / 180);
          // Hit area centered on petal midpoint
          const midR = (centerR + petalLength) / 2;
          const hitX = cx + Math.cos(angle) * midR;
          const hitY = cy + Math.sin(angle) * midR;
          const hitSize = Math.max(petalWidth * 1.4, 44);
          const earned = distribution[slug] ?? 0;
          const cap = caps[slug] ?? 0;
          const label = isWeek
            ? `Pétalo ${slug} · ${Rumbos[slug].mexica} · ${earned} de ${cap} sellos esta semana`
            : `Pétalo ${slug} · ${Rumbos[slug].mexica} · ${earned} sello${earned === 1 ? "" : "s"}`;
          return (
            <Pressable
              key={`hit-${slug}`}
              onPress={() => props.onPetalPress?.(slug)}
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
              accessibilityLabel={label}
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
  fillRatio = 0,
  present = true,
  withDropShadow = false,
}: {
  slug: RumboSlug;
  cx: number;
  cy: number;
  length: number;
  width: number;
  rotation: number;
  hasFill: boolean;
  /** Earned/cap ratio (0..1). Scales fill opacity in week mode for a sense
   *  of filling. Defaults to 0 in lifetime mode where the binary
   *  hasFill→0.86 opacity remains the legacy behavior. */
  fillRatio?: number;
  /** Whether this rumbo participates in the current view. In week mode, a
   *  rumbo with 0 stops in this Ruta gets a much dimmer ghost outline.
   *  Default true (lifetime mode — all 4 cardinals always present). */
  present?: boolean;
  /** Render an offset-duplicate "shadow" path under the fill. Only takes
   *  effect when hasFill=true (no shadow on ghost/absent outlines). The
   *  shadow is a black path at 0.4 opacity, offset +3pt along the petal
   *  axis (positive Y in petal-local coords, which points away from the
   *  petal tip toward the center — i.e. "downward" relative to the rumbo
   *  direction). Sanctioned exception to "hairline > shadow" per spec
   *  §7.4 pt 8, only enabled for the hero rosetón. */
  withDropShadow?: boolean;
}) {
  // Local coords: petal extends from (0,0) center up to (0,-length) tip
  // Control points at (±width/2, -length/2) shape the almond's belly.
  const tipY = -length;
  const ctlOffsetY = -length / 2;
  const half = width / 2;

  // Path: M 0,0  Q  half,ctlOffsetY   0,tipY   Q  -half,ctlOffsetY   0,0
  const d = `M 0 0 Q ${half} ${ctlOffsetY} 0 ${tipY} Q ${-half} ${ctlOffsetY} 0 0 Z`;

  const color = Rumbos[slug].hex;

  // Three visual states:
  //   1. absent  (present=false · this rumbo isn't part of the current view) →
  //      extra-dim outline 0.18 alpha so the petal silhouette is just barely
  //      visible. Distinguishes "not earnable" from "earnable but empty."
  //   2. ghost   (present=true, hasFill=false) → hairline outline 0.4 alpha
  //      using the rumbo's light variant. The shape the user can fill.
  //   3. filled  (present=true, hasFill=true) → solid color at opacity scaled
  //      by fillRatio (0.55 base + 0.31 × ratio) so a 1/2-earned petal feels
  //      different from a 2/2-earned petal.
  const filledOpacity = 0.55 + 0.31 * Math.max(0, Math.min(1, fillRatio));
  return (
    <G transform={`translate(${cx}, ${cy}) rotate(${rotation})`}>
      {/* Path B drop shadow · offset-duplicate path beneath the main fill.
          Rendered first so the colored fill paints over it. Offset +3pt on
          the petal-local Y axis (post-rotation this becomes a drop shadow
          in the rumbo's outward direction). Pure black at 0.4 opacity reads
          as depth against the warm-dark backdrop without going video-game-y.
          react-native-svg 15.x has inconsistent <Filter>+<FeGaussianBlur>
          coverage across platforms, so we use the reliable offset-duplicate
          technique. Hard-edged shadow is acceptable for v1 per spec §7.4 pt 8
          guidance ("tasteful, subtle Gaussian-feel, not video-game-y" — the
          hard edge at low opacity reads tasteful at 220pt scale). */}
      {withDropShadow && hasFill ? (
        <Path
          d={d}
          fill="#000"
          opacity={0.4}
          transform="translate(0, 3)"
        />
      ) : null}
      {/*
       * Path opacity ⚠️ bug-fix · 2026-05-15 (Agent D · diagnostic-visual.md #2):
       * the unfilled (ghost) case used to set the WHOLE path's opacity to 0,
       * which multiplies through strokeOpacity → the hairline outline was
       * invisible. Zero-state /tu-codice rendered the rosetón as a faint disc
       * with "Iniciado 0" pasted on, the biggest single visual loss in the
       * app per the visual diagnostic.
       *
       * Fix: keep path opacity at 1 for unfilled petals. The stroke now reads
       * via its own strokeOpacity (0.4 for ghost rumbos that participate in
       * the current view, 0.18 for "absent" rumbos that don't). The filled
       * case still uses `filledOpacity` (0.55 + 0.31 × fillRatio) so a
       * partially-earned petal stays visually distinct from a fully-earned one.
       *
       * Net effect: empty rosetón now reads as a four-petal cosmogram outline
       * (~32% effective opacity from the stroke at hairline width) — quiet
       * identity, present even before any sello. Brandbook §5 vibe restored.
       */}
      <Path
        d={d}
        fill={hasFill ? color : "transparent"}
        opacity={hasFill ? filledOpacity : 1}
        stroke={hasFill ? color : Rumbos[slug].light}
        strokeWidth={hasFill ? 0 : Hairline.thin}
        strokeOpacity={hasFill ? 0 : (present ? 0.4 : 0.18)}
      />
    </G>
  );
}

/**
 * PetalGlow · color-themed halo emitted by a FILLED petal · Apple-patterns §1.5.
 *
 * One absolutely-positioned View per filled rumbo, sized roughly to the petal's
 * almond shape and rotated to its cardinal direction. The View carries a native
 * iOS `shadowColor: <rumbo hex>` with `Shadow.glow` opacity (55% at 16pt radius,
 * zero offset = symmetric halo). The View itself is transparent; only its cast
 * shadow is visible, painted in the rumbo's color. When the SVG petal Path
 * paints over it, the user sees the rumbo's color radiating outward from the
 * petal's footprint — the "your earned rumbo glows quietly" beat.
 *
 * Pulse: scale 0.94 → 1.06 over 4s, infinite reverse · subtle "alive" cadence
 * that piggy-backs on the same 4s phrasing as HaloPulse. Under useReducedMotion
 * the View renders at the peak scale (1.0) with no animation · same brightness,
 * no movement.
 *
 * iOS-only · Android's `elevation` doesn't tint, so the glow is iOS-exclusive.
 * That's acceptable since XICO is iOS-first and the rosetón is the emotional
 * centerpiece of Tu Códice (iOS users get the full ceremony; Android users get
 * an honest petal fill without the halo).
 */
function PetalGlow({
  slug,
  cx,
  cy,
  length,
  width,
  rotation,
  reducedMotion,
}: {
  slug: RumboSlug;
  cx: number;
  cy: number;
  length: number;
  width: number;
  rotation: number;
  reducedMotion: boolean;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      pulse.value = 1;
      return;
    }
    // 4s pulse · slow enough that it reads as breathing, not as flicker.
    // Reverses smoothly via Reanimated's withRepeat(reverse=true).
    pulse.value = withRepeat(
      withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [reducedMotion, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  // The glow View sits at the petal's midpoint (radially out from center),
  // sized smaller than the petal itself · the shadow does the chromatic
  // spread, the View is just the source.
  const midR = length * 0.55;
  const angle = (rotation - 90) * (Math.PI / 180);
  const px = cx + Math.cos(angle) * midR;
  const py = cy + Math.sin(angle) * midR;
  const glowSize = Math.max(width * 0.7, 12);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: px - glowSize / 2,
          top: py - glowSize / 2,
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
          // The View itself is invisible · only its cast shadow renders, in
          // the rumbo's accent color.
          backgroundColor: Rumbos[slug].hex,
          opacity: 0.18,
          ...Shadow.glow,
          shadowColor: Rumbos[slug].hex,
        },
        style,
      ]}
    />
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
