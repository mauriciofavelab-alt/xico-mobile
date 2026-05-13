import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * useLastOpen · tracks the user's previous session timestamp via AsyncStorage.
 *
 * On mount, reads `xico_last_open_ts`. Returns:
 *   - lastOpenAt: ISO string of previous session (or null on first launch)
 *   - daysSinceLastOpen: integer (null on first launch)
 *   - touch(): writes Date.now() to AsyncStorage (call after re-entrada handled)
 *
 * Used by the re-entrada emocional gate in _layout.tsx and the
 * emotional_events fire-and-forget helper.
 */

const KEY = "xico_last_open_ts";

export function useLastOpen() {
  const [lastOpenAt, setLastOpenAt] = useState<string | null>(null);
  const [daysSinceLastOpen, setDaysSinceLastOpen] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const touchedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) {
          setLastOpenAt(null);
          setDaysSinceLastOpen(null);
        } else {
          const prev = parseInt(raw, 10);
          const now = Date.now();
          const days = Math.floor((now - prev) / (24 * 60 * 60 * 1000));
          setLastOpenAt(new Date(prev).toISOString());
          setDaysSinceLastOpen(Number.isFinite(days) ? days : null);
        }
      })
      .catch(() => {
        setLastOpenAt(null);
        setDaysSinceLastOpen(null);
      })
      .finally(() => setReady(true));
  }, []);

  const touch = useCallback(async () => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    try {
      await AsyncStorage.setItem(KEY, String(Date.now()));
    } catch {
      // swallow — non-critical
    }
  }, []);

  return { lastOpenAt, daysSinceLastOpen, ready, touch };
}
