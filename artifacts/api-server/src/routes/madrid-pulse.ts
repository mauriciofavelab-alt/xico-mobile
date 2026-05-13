import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

// GET /api/madrid-pulse/today · public
// Returns today's pulse line (atmospheric Madrid context for the re-entrada
// emocional welcome screen). Falls back to the most recent past entry if
// today's row doesn't exist.
router.get("/today", async (_req, res) => {
  const todayKey = new Date().toISOString().slice(0, 10);

  // Try today
  const { data: today, error: todayErr } = await supabase
    .from("madrid_pulse")
    .select("date_key, text, editor_name")
    .eq("date_key", todayKey)
    .maybeSingle();

  if (todayErr) {
    res.status(500).json({ error: todayErr.message });
    return;
  }
  if (today) {
    res.json(today);
    return;
  }

  // Fall back to most recent past
  const { data: fallback, error: fbErr } = await supabase
    .from("madrid_pulse")
    .select("date_key, text, editor_name")
    .lte("date_key", todayKey)
    .order("date_key", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fbErr) {
    res.status(500).json({ error: fbErr.message });
    return;
  }
  if (!fallback) {
    res.status(404).json({ error: "No madrid_pulse rows available" });
    return;
  }
  res.json(fallback);
});

export default router;
