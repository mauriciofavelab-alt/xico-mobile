import React, { useEffect } from "react";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * ProgressRing · 30-second circular fill, worklet-driven on UI thread.
 *
 * Visible to the user as a calm rim filling in the rumbo's accent color —
 * NEVER displays a countdown number (per spec). The server enforces the
 * actual claim threshold via earliest_claim_ts in the visit-token JWT;
 * this ring is purely UX confirmation of "stay here a moment".
 *
 * Props:
 *   - size: diameter in px (default 36)
 *   - strokeWidth: ring thickness
 *   - color: accent hex (the stop's rumbo color)
 *   - durationMs: how long to fill (default 30_000)
 *   - onComplete: fired when fill reaches 100%
 *   - active: pass true to start the fill; false leaves it at 0
 */

type Props = {
  size?: number;
  strokeWidth?: number;
  color: string;
  durationMs?: number;
  onComplete?: () => void;
  active: boolean;
};

export function ProgressRing({
  size = 36,
  strokeWidth = 2.5,
  color,
  durationMs = 30_000,
  onComplete,
  active,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      progress.value = 1;
      onComplete?.();
      return;
    }
    progress.value = withTiming(
      1,
      { duration: durationMs, easing: Easing.linear },
      (finished) => {
        if (finished && onComplete) {
          // Worklet → JS thread
          // @ts-ignore — runOnJS is available in Reanimated worklets
          (require("react-native-reanimated") as any).runOnJS(onComplete)();
        }
      },
    );
  }, [active, durationMs, onComplete, progress, reducedMotion]);

  const animatedProps = useAnimatedProps(() => {
    const offset = circumference * (1 - progress.value);
    return {
      strokeDashoffset: offset,
    } as any;
  });

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(240,236,230,0.10)"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Fill */}
      <AnimatedCircle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        // Rotate so fill starts from 12 o'clock
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}
