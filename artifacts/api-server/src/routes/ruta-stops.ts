import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { resolveProfileId } from "../lib/profileLookup.js";
import { haversineMeters } from "../lib/haversine.js";
import { issueVisitToken } from "../lib/visitToken.js";

const router = Router();

const GEOFENCE_RADIUS_M = 50;

// GET /api/ruta-stops/:id · public
// Returns the public layer of a stop. NEVER returns apunte_in_situ —
// that requires presence verification via POST /:id/visit-token.
router.get("/:id", async (req, res) => {
  const stopId = req.params.id;
  const { data, error } = await supabase
    .from("ruta_stops")
    .select("id, ruta_id, order_num, name, address, description, category, accent_color, time_suggestion, distance_to_next, lat, lng, rumbo_id, despacho_text")
    .eq("id", stopId)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  res.json(data);
});

// POST /api/ruta-stops/:id/visit-token · auth
// Body: { lat: number, lng: number, accuracy_m?: number }
// Verifies the user is within 50m haversine of the stop. On success, issues
// a signed JWT and returns the apunte_in_situ text. The client polls geo
// silently and calls this endpoint when within range; the user never sees
// distance to the stop or a countdown — only the veil lifting + ring filling.
router.post("/:id/visit-token", requireAuth, async (req, res) => {
  const stopId = req.params.id;
  const userId = (req as Request & { userId: string }).userId;

  const { lat, lng } = req.body as { lat?: number; lng?: number };
  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400).json({ error: "lat and lng (numbers) are required in body" });
    return;
  }

  // Fetch the stop with its lat/lng + apunte_in_situ (the geo-locked layer)
  const { data: stop, error: stopErr } = await supabase
    .from("ruta_stops")
    .select("id, lat, lng, apunte_in_situ, rumbo_id")
    .eq("id", stopId)
    .maybeSingle();

  if (stopErr) {
    res.status(500).json({ error: stopErr.message });
    return;
  }
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  if (stop.lat == null || stop.lng == null) {
    res.status(409).json({ error: "Stop has no geo data; this should never happen in production" });
    return;
  }

  const distance = haversineMeters({ lat, lng }, { lat: stop.lat, lng: stop.lng });

  if (distance > GEOFENCE_RADIUS_M) {
    // Live distance returned for UX — client renders "te faltan ~120m", no error language.
    res.status(403).json({
      ok: false,
      reason: "too_far",
      distance_m: Math.round(distance),
      threshold_m: GEOFENCE_RADIUS_M,
    });
    return;
  }

  const profileId = await resolveProfileId(userId);
  const { token, earliest_claim_ts } = issueVisitToken({
    profileId,
    stopId: stop.id as string,
  });

  res.json({
    ok: true,
    visit_token: token,
    earliest_claim_ts,
    apunte_in_situ: stop.apunte_in_situ,
  });
});

export default router;
