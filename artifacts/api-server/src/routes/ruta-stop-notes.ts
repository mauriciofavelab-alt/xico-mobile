import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { resolveProfileId } from "../lib/profileLookup.js";

const router = Router();

// POST /api/ruta-stop-notes · auth
// Body: { ruta_stop_id: string, text: string (1-280 chars) }
// Stores an optional 1-line annotation. is_published_anonymized defaults false;
// editors flip the column manually when re-using a note in next week's despacho.
router.post("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { ruta_stop_id, text } = req.body as { ruta_stop_id?: string; text?: string };

  if (typeof ruta_stop_id !== "string") {
    res.status(400).json({ error: "ruta_stop_id (string) required" });
    return;
  }
  if (typeof text !== "string" || text.length < 1 || text.length > 280) {
    res.status(400).json({ error: "text must be 1-280 characters" });
    return;
  }

  try {
    const profileId = await resolveProfileId(userId);
    const { data, error } = await supabase
      .from("ruta_stop_notes")
      .insert({ profile_id: profileId, ruta_stop_id, text })
      .select("id, ruta_stop_id, text, created_at")
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Unknown error" });
  }
});

export default router;
