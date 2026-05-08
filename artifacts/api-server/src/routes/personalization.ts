import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

// GET /api/personalization/contexts
// Returns { [interest]: { [style]: text } } — cached-friendly, changes rarely
router.get("/contexts", async (_req, res) => {
  const { data, error } = await supabase
    .from("personalization_contexts")
    .select("interest, narration_style, text");

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const map: Record<string, Record<string, string>> = {};
  for (const row of data ?? []) {
    if (!map[row.interest]) map[row.interest] = {};
    map[row.interest][row.narration_style] = row.text;
  }

  res.json(map);
});

// GET /api/personalization/nota-editor
// Returns today's editor note based on day of week (rotation_key 0–6)
router.get("/nota-editor", async (_req, res) => {
  const rotationKey = new Date().getDay(); // 0 = Sunday, 6 = Saturday

  const { data, error } = await supabase
    .from("notas_editor")
    .select("lugar, texto")
    .eq("rotation_key", rotationKey)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "No nota available for today" });
    return;
  }

  res.json(data);
});

export default router;
