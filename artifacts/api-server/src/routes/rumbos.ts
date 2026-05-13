import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

// GET /api/rumbos · public, cacheable
// Returns the 4 cardinal rumbos with nahuatl_name, meaning, color_hex, description.
router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("rumbos")
    .select("id, slug, nahuatl_name, meaning, color_hex, description")
    .order("slug");

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  res.json(data ?? []);
});

export default router;
