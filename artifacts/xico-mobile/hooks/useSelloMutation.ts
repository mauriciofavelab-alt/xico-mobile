import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { API_BASE } from "@/constants/api";
import { supabase } from "@/constants/supabase";
import { Pillars } from "@/constants/colors";
import { LiveActivity } from "@/modules/live-activity/src";
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

// ─── Zod schemas ────────────────────────────────────────────────────────
// The sello-earn pipeline is the emotional peak of the app. Shape drift
// between the server response and `(await res.json()) as any` used to fall
// through silently; we now validate explicitly and route any mismatch to
// the mutation's onError handler so the UI can surface a soft notice.

const TierKeySchema = z.enum(["iniciado", "conocedor", "curador", "cronista"]);
const RumboSlugSchema = z.enum(["norte", "sur", "este", "oeste"]);

const TierStateSchema = z.object({
  tier: TierKeySchema,
  total: z.number(),
  by_rumbo: z.record(RumboSlugSchema, z.number()),
  distinct_rumbos: z.number(),
  min_per_rumbo: z.number(),
  eligible_perks: z.array(
    z.object({
      id: z.string(),
      partner_type: z.enum([
        "restaurant_sello_copil",
        "museum",
        "gallery",
        "bookstore",
      ]),
      name: z.string(),
      redemption_method: z.enum([
        "manual_show_id",
        "voucher_code",
        "partner_api",
      ]),
      min_tier_required: TierKeySchema,
      accent_color: z.string().nullable(),
      notes: z.string().nullable(),
    }),
  ),
});

const SelloEarnSuccessSchema = z.object({
  ok: z.literal(true),
  sello: z.object({
    id: z.string(),
    ruta_stop_id: z.string(),
    rumbo_id: z.string(),
    earned_at: z.string(),
    photo_url: z.string().nullable(),
  }),
  tier: TierStateSchema,
  tier_changed: z.boolean(),
  previous_tier: TierKeySchema,
});

// Server error shape on 403/410/425/409. `reason` enumerates the spec-known
// failure modes (see `api-server/src/routes/sellos-rumbo.ts`). We keep this
// schema permissive (optional fields, no enum on `reason`) so a brand-new
// reason value the server adds doesn't crash the parse — the consuming UI
// branches only on documented values.
const SelloEarnErrorSchema = z.object({
  ok: z.literal(false).optional(),
  reason: z.string().optional(),
  error: z.string().optional(),
});

export type SelloEarnInput = {
  visit_token: string;
  stop_id: string;
  photo_url?: string;
};

export type SelloEarnResult = z.infer<typeof SelloEarnSuccessSchema>;

/**
 * Spec-known reason values returned by `verifyVisitToken` + the route
 * handler. Adding a member only affects typing — the runtime tolerates
 * unknown reasons (SelloEarnErrorSchema · loose string).
 */
export type SelloEarnFailureReason =
  | "expired"
  | "invalid"
  | "too_soon"
  | "too_far"
  | "already_earned";

/**
 * Error thrown by postSello on a non-2xx or malformed response. Carries
 * the server's `reason` (when present) so the UI layer in
 * `app/ruta/stop/[id].tsx` can render a reason-specific soft notice
 * (e.g. `too_far` → "Acércate más al lugar para abrir el apunte.").
 */
export class SelloEarnError extends Error {
  reason: string | null;
  status: number;
  constructor(message: string, opts: { reason: string | null; status: number }) {
    super(message);
    this.name = "SelloEarnError";
    this.reason = opts.reason;
    this.status = opts.status;
  }
}

async function postSello(input: SelloEarnInput): Promise<SelloEarnResult> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

  const res = await fetch(`${API_BASE}/api/sellos-rumbo`, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  // Parse JSON unconditionally · the server returns JSON on success AND on
  // every documented failure path. Wrapped so a malformed body doesn't throw
  // a context-free SyntaxError.
  let rawBody: unknown;
  try {
    rawBody = await res.json();
  } catch {
    throw new SelloEarnError("Sello claim failed: malformed response", {
      reason: null,
      status: res.status,
    });
  }

  if (!res.ok) {
    const parsed = SelloEarnErrorSchema.safeParse(rawBody);
    const reason = parsed.success
      ? parsed.data.reason ?? parsed.data.error ?? null
      : null;
    throw new SelloEarnError(
      `Sello claim failed: ${reason ?? `HTTP ${res.status}`}`,
      { reason, status: res.status },
    );
  }

  // Strict parse on success · any shape drift throws into the mutation's
  // onError. The UI on app/ruta/stop/[id].tsx renders a soft notice.
  const parsed = SelloEarnSuccessSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new SelloEarnError("Sello claim failed: invalid response shape", {
      reason: null,
      status: res.status,
    });
  }
  return parsed.data;
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
