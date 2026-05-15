import React, { useCallback, useEffect } from "react";
import Animated, {
  cancelAnimation,
  runOnJS,
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

  // Stabilize the JS-thread callback so the worklet captures one reference
  // for the lifetime of this effect. If the parent re-renders and passes a
  // new `onComplete`, the effect re-runs and `cancelAnimation` clears any
  // in-flight timing so a stale callback can never fire. The sello-earn
  // pipeline depends on this callback firing exactly once per 30s ring
  // completion — fragile-by-default before this refactor.
  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      // Cancel any in-flight timing if the ring is disabled mid-animation
      // so a pending completion callback never lands on a torn-down state.
      cancelAnimation(progress);
      return;
    }
    if (reducedMotion) {
      progress.value = 1;
      handleComplete();
      return;
    }
    // Cancel any previous timing before kicking off a new one. Without this,
    // a re-mount or onComplete reference change could leave two timings
    // racing on the same shared value — the older one would fire its (now
    // stale) callback after the new one already completed.
    cancelAnimation(progress);
    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: durationMs, easing: Easing.linear },
      (finished) => {
        "worklet";
        if (finished) {
          runOnJS(handleComplete)();
        }
      },
    );
    return () => {
      // Cleanup on unmount or before the next effect run: cancel the timing
      // so any pending completion callback never fires on an unmounted
      // component.
      cancelAnimation(progress);
    };
  }, [active, durationMs, handleComplete, progress, reducedMotion]);

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
