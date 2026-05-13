import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { resolveProfileId } from "../lib/profileLookup.js";

const router = Router();

const VALID_EVENT_TYPES = new Set([
  "session_open",
  "re_entry",
  "despacho_reread",
  "sello_earned",
  "annotation_left",
  "late_night_open",
  "quiet_return",
  "ruta_complete",
]);

// POST /api/emotional-events · auth
// Body: { event_type, hour_of_day, days_since_last_open?, context? }
// Fire-and-forget. Returns 202 Accepted immediately; never blocks UI.
// No dashboard in v1 — rows accumulate for editor review in v2+.
router.post("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { event_type, hour_of_day, days_since_last_open, context } = req.body as {
    event_type?: string;
    hour_of_day?: number;
    days_since_last_open?: number;
    context?: Record<string, unknown>;
  };

  if (typeof event_type !== "string" || !VALID_EVENT_TYPES.has(event_type)) {
    res.status(400).json({ error: `event_type must be one of: ${[...VALID_EVENT_TYPES].join(", ")}` });
    return;
  }
  if (typeof hour_of_day !== "number" || hour_of_day < 0 || hour_of_day > 23) {
    res.status(400).json({ error: "hour_of_day must be 0-23" });
    return;
  }

  // Resolve profile then accept-and-async. Returning 202 immediately keeps the
  // client UI snappy; failures are logged server-side but never propagated.
  res.status(202).json({ accepted: true });

  void (async () => {
    try {
      const profileId = await resolveProfileId(userId);
      await supabase.from("emotional_events").insert({
        profile_id: profileId,
        event_type,
        hour_of_day,
        days_since_last_open: typeof days_since_last_open === "number" ? days_since_last_open : null,
        context: context ?? null,
      });
    } catch (e) {
      // Intentionally swallow — fire-and-forget. Surface via pino logger if needed.
      console.error("[emotional-events] insert failed:", (e as Error).message);
    }
  })();
});

export default router;
