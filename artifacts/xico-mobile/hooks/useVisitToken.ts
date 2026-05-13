import { useCallback, useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { Platform } from "react-native";

import { fetchJson, API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";

/**
 * useVisitToken · polls geo, requests POST /api/ruta-stops/:id/visit-token
 * when within 50m of the stop. The server enforces the 50m radius and the
 * 30s earliest_claim_ts; we just deliver position.
 *
 * UX contract from the spec:
 *   - Never expose the countdown number — only the ring filling
 *   - Permission denied: show a tap-to-permission link (no silent failure)
 *   - "Far": live distance like "te faltan ~120m", no error tone
 *
 * Returns: { permission, distance_m, apunte_in_situ, earliest_claim_ts,
 *           visit_token, error, requestPermission }
 */

const POLL_INTERVAL_MS = 4_000;

export type VisitTokenState = {
  permission: "unknown" | "granted" | "denied";
  distance_m: number | null;
  apunte_in_situ: string | null;
  earliest_claim_ts: number | null;
  visit_token: string | null;
  error: string | null;
  position: { lat: number; lng: number } | null;
};

const initial: VisitTokenState = {
  permission: "unknown",
  distance_m: null,
  apunte_in_situ: null,
  earliest_claim_ts: null,
  visit_token: null,
  error: null,
  position: null,
};

async function authHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export function useVisitToken(stopId: string | null | undefined) {
  const [state, setState] = useState<VisitTokenState>(initial);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRequestedRef = useRef(false);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") {
      // Web: rely on browser geolocation in a future iteration
      setState((p) => ({ ...p, permission: "denied", error: "Web geo no implementado en v1" }));
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    setState((p) => ({ ...p, permission: status === "granted" ? "granted" : "denied" }));
  }, []);

  const requestVisitToken = useCallback(
    async (lat: number, lng: number) => {
      if (!stopId || tokenRequestedRef.current) return;
      tokenRequestedRef.current = true;
      try {
        const headers = await authHeader();
        const res = await fetch(`${API_BASE}/api/ruta-stops/${stopId}/visit-token`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
        const data = (await res.json()) as any;
        if (res.ok && data?.ok && data?.visit_token) {
          setState((p) => ({
            ...p,
            apunte_in_situ: data.apunte_in_situ ?? null,
            earliest_claim_ts: data.earliest_claim_ts ?? null,
            visit_token: data.visit_token,
            error: null,
          }));
          // Stop polling — we've crossed the threshold and have what we need.
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } else if (res.status === 403 && data?.reason === "too_far") {
          tokenRequestedRef.current = false; // allow retry as user walks closer
          setState((p) => ({ ...p, distance_m: data.distance_m ?? p.distance_m }));
        } else {
          tokenRequestedRef.current = false;
          setState((p) => ({ ...p, error: data?.error ?? "No se pudo emitir el visit-token" }));
        }
      } catch (e: any) {
        tokenRequestedRef.current = false;
        setState((p) => ({ ...p, error: e?.message ?? "Error de red" }));
      }
    },
    [stopId],
  );

  // Permission request on mount
  useEffect(() => {
    if (!stopId) return;
    requestPermission();
  }, [stopId, requestPermission]);

  // Start polling once permission is granted
  useEffect(() => {
    if (state.permission !== "granted" || !stopId || state.visit_token) return;

    let cancelled = false;
    const tick = async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (cancelled) return;
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setState((p) => ({ ...p, position: { lat, lng } }));
        // Optimistically try visit-token; server will reject if too far and return distance.
        requestVisitToken(lat, lng);
      } catch (e: any) {
        if (cancelled) return;
        setState((p) => ({ ...p, error: e?.message ?? "Error de geolocalización" }));
      }
    };
    tick(); // immediate
    pollingRef.current = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [stopId, state.permission, state.visit_token, requestVisitToken]);

  return { ...state, requestPermission };
}
