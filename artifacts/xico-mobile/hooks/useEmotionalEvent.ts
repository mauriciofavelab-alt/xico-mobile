import { useCallback, useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";
import { useAuth } from "@/context/AuthContext";
import { useLastOpen } from "@/hooks/useLastOpen";

/**
 * useEmotionalEvent · fire-and-forget POST /api/emotional-events
 *
 * Accumulates pattern data for editor review. No dashboard in v1; data sits
 * in Supabase until v2+ surface visualizations.
 *
 * Event types (per spec):
 *   - session_open       · app launched
 *   - re_entry           · session_open AND days_since_last_open ≥ 7
 *   - despacho_reread    · entering an article that's been opened before
 *   - sello_earned       · server already knows; we fire for symmetry
 *   - annotation_left
 *   - late_night_open    · session_open AND hour_of_day in [0,5]
 *   - quiet_return       · session opened then closed within 60s
 *   - ruta_complete      · all stops in a week's Ruta have sellos
 *
 * The hook exposes a `fire(type, context?)` function. The provider also
 * auto-fires session_open + re_entry + late_night_open + quiet_return based
 * on AppState transitions — those don't need manual calls.
 */

type EventType =
  | "session_open"
  | "re_entry"
  | "despacho_reread"
  | "sello_earned"
  | "annotation_left"
  | "late_night_open"
  | "quiet_return"
  | "ruta_complete";

async function postEvent(payload: {
  event_type: EventType;
  hour_of_day: number;
  days_since_last_open?: number;
  context?: Record<string, unknown>;
}) {
  try {
    const { data: { session } } = await (supabase as any).auth.getSession();
    if (!session?.access_token) return;
    await fetch(`${API_BASE}/api/emotional-events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fire-and-forget · never throw, never block UI
  }
}

/**
 * Hook for individual call sites (e.g. firing despacho_reread when an article
 * is opened that the user has read before).
 */
export function useEmotionalEvent() {
  const { daysSinceLastOpen } = useLastOpen();

  return useCallback(
    (event_type: EventType, context?: Record<string, unknown>) => {
      const now = new Date();
      void postEvent({
        event_type,
        hour_of_day: now.getHours(),
        days_since_last_open:
          typeof daysSinceLastOpen === "number" ? daysSinceLastOpen : undefined,
        context,
      });
    },
    [daysSinceLastOpen],
  );
}

/**
 * App-level driver: hooks into AppState transitions to auto-fire:
 *   - session_open on mount + on background→active resume
 *   - re_entry if days_since_last_open ≥ 7 on first mount
 *   - late_night_open if hour 0-5 on first mount
 *   - quiet_return on active→background within 60s of session_open
 *
 * Call ONCE near the top of the tree (in _layout.tsx) after auth is ready.
 */
export function useSessionLifecycleEvents() {
  const { session } = useAuth();
  const { daysSinceLastOpen, ready: lastOpenReady, touch } = useLastOpen();

  const lastOpenedAtRef = useRef<number | null>(null);
  const sessionOpenFiredRef = useRef(false);

  // Fire session_open + re_entry + late_night_open on first mount
  useEffect(() => {
    if (!session || !lastOpenReady || sessionOpenFiredRef.current) return;
    sessionOpenFiredRef.current = true;

    const now = new Date();
    const hour = now.getHours();
    lastOpenedAtRef.current = now.getTime();

    void postEvent({
      event_type: "session_open",
      hour_of_day: hour,
      days_since_last_open: daysSinceLastOpen ?? undefined,
    });

    if (typeof daysSinceLastOpen === "number" && daysSinceLastOpen >= 7) {
      void postEvent({
        event_type: "re_entry",
        hour_of_day: hour,
        days_since_last_open: daysSinceLastOpen,
      });
    }

    if (hour >= 0 && hour <= 5) {
      void postEvent({
        event_type: "late_night_open",
        hour_of_day: hour,
        days_since_last_open: daysSinceLastOpen ?? undefined,
      });
    }

    // Mark this session as "open" — the ReEntryWelcome calls touch() once
    // dismissed. If user is in the normal flow (no welcome), still touch.
    void touch();
  }, [session, lastOpenReady, daysSinceLastOpen, touch]);

  // Quiet return + re-fire session_open on resume
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      const now = Date.now();
      const lastOpened = lastOpenedAtRef.current;

      if (state === "background" || state === "inactive") {
        if (lastOpened && now - lastOpened < 60_000) {
          const hr = new Date().getHours();
          void postEvent({ event_type: "quiet_return", hour_of_day: hr });
        }
      }

      if (state === "active") {
        lastOpenedAtRef.current = now;
        const hr = new Date().getHours();
        // Re-fire session_open on resume (not the very first mount)
        if (sessionOpenFiredRef.current) {
          void postEvent({ event_type: "session_open", hour_of_day: hr });
          if (hr >= 0 && hr <= 5) {
            void postEvent({ event_type: "late_night_open", hour_of_day: hr });
          }
        }
      }
    });
    return () => sub.remove();
  }, []);
}
