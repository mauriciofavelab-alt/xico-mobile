import React, { createContext, useContext, type ReactNode } from "react";
import { useTimeMode, type TimeMode } from "@/hooks/useTimeMode";

/**
 * App-level TimeMode provider. Wrap once in _layout.tsx; consumers use the
 * `useTimeModeCtx()` hook to read the current mode.
 *
 * The actual computation lives in useTimeMode (recomputes on AppState resume).
 * This wrapper just makes the value available app-wide without prop-drilling.
 */

const TimeModeCtx = createContext<TimeMode>("dia");

export function TimeModeProvider({ children }: { children: ReactNode }) {
  const mode = useTimeMode();
  return <TimeModeCtx.Provider value={mode}>{children}</TimeModeCtx.Provider>;
}

export function useTimeModeCtx(): TimeMode {
  return useContext(TimeModeCtx);
}
