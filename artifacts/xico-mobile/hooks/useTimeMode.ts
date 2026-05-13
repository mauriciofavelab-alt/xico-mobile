import { useEffect, useState, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Modo hora · time-mode hook (manifesto requirement).
 *
 *   madrugada · 00:00–05:59 — Newsreader 300 Light + lower contrast + TTS off
 *   dia       · 06:00–17:59 — default
 *   atardecer · 18:00–20:59 — warm overlay + slight saturation drop
 *
 * Computed once at mount, refreshed on AppState resume so a user reopening at
 * 1am after closing in the morning gets the correct mode without restart.
 */

export type TimeMode = "madrugada" | "dia" | "atardecer";

export function computeTimeMode(date: Date = new Date()): TimeMode {
  const h = date.getHours();
  if (h >= 0 && h <= 5) return "madrugada";
  if (h >= 18 && h <= 20) return "atardecer";
  return "dia";
}

export function useTimeMode(): TimeMode {
  const [mode, setMode] = useState<TimeMode>(() => computeTimeMode());

  const recompute = useCallback(() => {
    setMode(computeTimeMode());
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") recompute();
    });
    return () => sub.remove();
  }, [recompute]);

  return mode;
}
