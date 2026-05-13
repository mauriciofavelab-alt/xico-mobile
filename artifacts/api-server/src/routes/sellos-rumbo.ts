import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { resolveProfileId } from "../lib/profileLookup.js";
import { verifyVisitToken } from "../lib/visitToken.js";

const router = Router();

async function getTier(profileId: string) {
  const { data, error } = await supabase.rpc("profile_tier", { p_profile_id: profileId });
  if (error) throw error;
  return data as { tier: string; total: number; by_rumbo: Record<string, number>; distinct_rumbos: number; min_per_rumbo: number };
}

// GET /api/sellos-rumbo · auth
// Returns the user's full tier state plus the list of sellos they hold.
router.get("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  try {
    const profileId = await resolveProfileId(userId);
    const tier = await getTier(profileId);

    const { data: sellos, error: sellosErr } = await supabase
      .from("sellos_rumbo")
      .select("id, ruta_stop_id, rumbo_id, earned_at, photo_url")
      .eq("profile_id", profileId)
      .order("earned_at", { ascending: false });

    if (sellosErr) {
      res.status(500).json({ error: sellosErr.message });
      return;
    }

    res.json({ ...tier, sellos: sellos ?? [] });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Unknown error" });
  }
});

// POST /api/sellos-rumbo · auth
// Body: { visit_token: string, photo_url?: string }
// Verifies JWT (signature, expiry, earliest_claim_ts), enforces uniqueness on
// (profile, stop), inserts the sello, returns the updated tier + tier_changed flag.
router.post("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { visit_token, photo_url } = req.body as { visit_token?: string; photo_url?: string };

  if (typeof visit_token !== "string") {
    res.status(400).json({ error: "visit_token (string) required" });
    return;
  }

  try {
    const profileId = await resolveProfileId(userId);

    // Tier BEFORE — needed to detect tier change.
    const tierBefore = await getTier(profileId);

    // Decode token loosely to extract expected stop_id (we'll verify with strict match).
    // jsonwebtoken doesn't expose decode-without-verify on our verifyVisitToken contract,
    // so the client sends back the stop_id implicitly via the token. We accept stop_id
    // from the body as a defense-in-depth alternative, but rely on token verification.
    const { stop_id: bodyStopId } = req.body as { stop_id?: string };
    if (typeof bodyStopId !== "string") {
      res.status(400).json({ error: "stop_id (string) required in body" });
      return;
    }

    const result = verifyVisitToken(visit_token, {
      expectedProfileId: profileId,
      expectedStopId: bodyStopId,
    });

    if (result.ok === false) {
      const reason = result.reason;
      const status =
        reason === "expired" ? 410 :
        reason === "too_soon" ? 425 :
        403;
      res.status(status).json({ ok: false, reason });
      return;
    }

    // Look up rumbo_id from the stop (the source of truth — token doesn't carry it).
    const { data: stop, error: stopErr } = await supabase
      .from("ruta_stops")
      .select("rumbo_id")
      .eq("id", bodyStopId)
      .maybeSingle();

    if (stopErr || !stop) {
      res.status(404).json({ error: "Stop not found" });
      return;
    }
    if (!stop.rumbo_id) {
      res.status(409).json({ error: "Stop has no rumbo assigned" });
      return;
    }

    // 30s threshold already enforced by verifyVisitToken (earliest_claim_ts).
    // The DB UNIQUE (profile_id, ruta_stop_id) constraint enforces no-double-sello.
    const timeVerifiedSeconds = Math.floor((Date.now() - (result.payload.earliest_claim_ts - 30_000)) / 1000);

    const { data: sello, error: insertErr } = await supabase
      .from("sellos_rumbo")
      .insert({
        profile_id: profileId,
        ruta_stop_id: bodyStopId,
        rumbo_id: stop.rumbo_id,
        geo_verified: true,
        time_verified_seconds: Math.max(30, timeVerifiedSeconds),
        photo_url: photo_url ?? null,
      })
      .select("id, ruta_stop_id, rumbo_id, earned_at, photo_url")
      .single();

    if (insertErr) {
      // Postgres unique violation code: 23505
      if ((insertErr as any).code === "23505") {
        res.status(409).json({ ok: false, reason: "already_earned" });
        return;
      }
      res.status(500).json({ error: insertErr.message });
      return;
    }

    const tierAfter = await getTier(profileId);
    const tierChanged = tierBefore.tier !== tierAfter.tier;

    res.json({
      ok: true,
      sello,
      tier: tierAfter,
      tier_changed: tierChanged,
      previous_tier: tierBefore.tier,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Unknown error" });
  }
});

export default router;
