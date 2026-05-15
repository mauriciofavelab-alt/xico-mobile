import { useEffect, useRef } from "react";
import {
  setAlternateAppIcon,
  supportsAlternateIcons,
} from "expo-alternate-app-icons";
import { Platform } from "react-native";
import { useTier } from "./useTier";
import { TierLadder, type TierName } from "@/constants/tierLadder";

/**
 * useTierIcon — auto-swaps the iOS alternate app icon to match the user's
 * current tier in the pasaporte ladder.
 *
 * Behavior:
 *   - Reads tier from `useTier()` (which queries `/api/profile/tier`).
 *   - Tracks the last-applied tier via a ref so the swap only fires on an
 *     actual transition. iOS shows a system alert ("Icon Changed") on every
 *     call to `setAlternateAppIcon`, so deduplicating is essential.
 *   - Skips on Android (alternate icons supported but XICO ships iOS-first)
 *     and on devices where `supportsAlternateIcons` is false.
 *   - Errors are swallowed via .catch — icon swap failure is non-fatal and
 *     a failed swap should never break the app. Logged to console for debug.
 *
 * Mount once at the root level (`app/_layout.tsx`) inside the auth/query
 * provider tree so `useTier` has access to the session.
 *
 * Maps `TierName → CFBundleAlternateIcons` name via `TierLadder[i].iosIconName`.
 * The four registered keys ("AppIcon-Iniciado" / "Conocedor" / "Curador" /
 * "Cronista") are declared in app.json's expo-alternate-app-icons plugin
 * config.
 */
export function useTierIcon() {
  const { data: tierState } = useTier();
  const tier = tierState?.tier ?? null;
  const lastTier = useRef<TierName | null>(null);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    if (!supportsAlternateIcons) return;
    if (!tier) return;
    if (tier === lastTier.current) return;

    const def = TierLadder.find(t => t.name === tier);
    if (!def) return;

    setAlternateAppIcon(def.iosIconName).catch(err => {
      // Non-fatal: device may have declined the iOS prompt the first time,
      // or alternate icons could be disabled. Log + move on so we don't
      // retry-spam on every render.
      console.warn("[useTierIcon] setAlternateAppIcon failed:", err);
    });
    lastTier.current = tier;
  }, [tier]);
}
