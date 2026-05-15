import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";
import { Pillars } from "@/constants/colors";
import { LiveActivity } from "@/modules/live-activity/src";
import type { TierState } from "@/hooks/useTier";
import type { CurrentRuta, RutaStopLite } from "@/hooks/useCurrentRuta";
import type { SellosResponse } from "@/hooks/useSellos";

/**
 * useSelloMutation · POST /api/sellos-rumbo
 *
 * Body: { visit_token, stop_id, photo_url? }
 * Returns: { sello, tier (new state), tier_changed, previous_tier }
 *
 * On success, invalidates ["tier"] and ["sellos-rumbo"] so all consumers
 * (rosetón, Mi Lectura, /ruta progress strip) refetch.
 *
 * Phase 7.2: also pushes the new state to the active Ruta Live Activity
 * (if one is running · checked via AsyncStorage). Ends the activity when
 * the user earns the last stop's sello. All Live Activity calls are
 * try/catch-wrapped · sello is still saved server-side even if the
 * activity bridge throws.
 */

/** AsyncStorage key for the active Ruta Live Activity id · Phase 7.2. */
const ACTIVE_RUTA_ACTIVITY_KEY = "active_ruta_activity_id";

export type SelloEarnInput = {
  visit_token: string;
  stop_id: string;
  photo_url?: string;
};

export type SelloEarnResult = {
  ok: boolean;
  sello: {
    id: string;
    ruta_stop_id: string;
    rumbo_id: string;
    earned_at: string;
    photo_url: string | null;
  };
  tier: TierState;
  tier_changed: boolean;
  previous_tier: TierState["tier"];
};

async function postSello(input: SelloEarnInput): Promise<SelloEarnResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

  const res = await fetch(`${API_BASE}/api/sellos-rumbo`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as any;
  if (!res.ok || !data?.ok) {
    const reason = data?.reason ?? data?.error ?? `HTTP ${res.status}`;
    throw new Error(`Sello claim failed: ${reason}`);
  }
  return data as SelloEarnResult;
}

/**
 * Push the latest tier state to the active Ruta Live Activity (if any).
 * No-op when no activity is running, when iOS Live Activities are
 * unavailable, or when the native call fails for any reason · we never
 * let a Live Activity error disrupt sello earning. Phase 7.2.
 */
async function pushLiveActivityUpdate(args: {
  qc: ReturnType<typeof useQueryClient>;
  result: SelloEarnResult;
  justEarnedStopId: string;
}): Promise<void> {
  const { qc, result, justEarnedStopId } = args;
  try {
    const id = await AsyncStorage.getItem(ACTIVE_RUTA_ACTIVITY_KEY);
    if (!id) return; // No active Live Activity · nothing to update.

    // Pull the active Ruta from the cache · the queries are already
    // populated whenever the user can earn a sello, but we defensive-skip
    // if for some reason it isn't.
    const ruta = qc.getQueryData<CurrentRuta>(["ruta", "current"]);
    if (!ruta || !ruta.stops || ruta.stops.length === 0) return;

    // Build the earned-stop set from the server's authoritative sello list.
    // `sellos-rumbo` was just invalidated above · but the mutation's tier
    // result is the canonical "after-this-earn" snapshot, so we'd rather
    // compute from cached sellos + the just-earned stop than wait for
    // the refetch to settle. Fall back to "just this one earned" if
    // the cache is empty.
    const sellosCache = qc.getQueryData<SellosResponse>(["sellos-rumbo"]);
    const earnedIds = new Set<string>(
      (sellosCache?.sellos ?? []).map((s) => s.ruta_stop_id),
    );
    earnedIds.add(justEarnedStopId);

    const totalStops = ruta.stops.length;
    const stopsCompleted = Math.min(earnedIds.size, totalStops);

    // Roseton state · canonical order [norte, este, sur, oeste]. Use the
    // server's tier.by_rumbo since it's the source of truth post-earn.
    const byRumbo = result.tier.by_rumbo;
    const rosetonState: number[] = [
      byRumbo.norte ?? 0,
      byRumbo.este ?? 0,
      byRumbo.sur ?? 0,
      byRumbo.oeste ?? 0,
    ];

    // If Ruta is complete · end the activity and clear the key.
    if (stopsCompleted >= totalStops) {
      try {
        await LiveActivity.end(id);
      } finally {
        await AsyncStorage.removeItem(ACTIVE_RUTA_ACTIVITY_KEY);
      }
      return;
    }

    // Otherwise · find the next unearned stop (by `order`, ascending).
    const sortedStops = [...ruta.stops].sort(
      (a: RutaStopLite, b: RutaStopLite) => (a.order ?? 0) - (b.order ?? 0),
    );
    const nextStop = sortedStops.find((s) => !earnedIds.has(s.id));
    if (!nextStop) {
      // Edge: count says incomplete but no stop is unearned. End to be safe.
      try {
        await LiveActivity.end(id);
      } finally {
        await AsyncStorage.removeItem(ACTIVE_RUTA_ACTIVITY_KEY);
      }
      return;
    }

    await LiveActivity.update({
      id,
      contentState: {
        stopsCompleted,
        stopsTotal: totalStops,
        nextStopName: nextStop.name,
        // We don't have live distance here · the user is on /stop/[id] when
        // earning, not on a map. 0 is the agreed sentinel · the widget
        // hides the distance row when `nextStopDistanceM == 0`.
        nextStopDistanceM: 0,
        nextStopRumboHex: nextStop.rumbo?.color_hex ?? Pillars.indice,
        rosetonState,
      },
    });
  } catch (e) {
    // Bridge errors are non-fatal · sello already saved on the server.
    console.warn("[LiveActivity] update on sello earn failed", e);
  }
}

export function useSelloMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postSello,
    onSuccess: (result, variables) => {
      // Force the Roseton + TierStatusBlock + Mi Lectura progress to refetch.
      qc.invalidateQueries({ queryKey: ["tier"] });
      qc.invalidateQueries({ queryKey: ["sellos-rumbo"] });
      qc.invalidateQueries({ queryKey: ["ruta", "current"] });

      // Phase 7.2 · fire-and-forget Live Activity update. Non-blocking ·
      // the mutation already resolved server-side before we get here. If
      // this fails the user still sees the rosetón refill in-app.
      void pushLiveActivityUpdate({
        qc,
        result,
        justEarnedStopId: variables.stop_id,
      });
    },
  });
}
