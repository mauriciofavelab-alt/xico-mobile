import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

// GET /api/editor-letters?interest=<interest-label>
// Returns the editor letter (name, role, message_template, accent_color) that
// matches the given interest. 404 if none — no client fallback should kick in.
router.get("/", async (req, res) => {
  const interest = (req.query["interest"] as string | undefined)?.trim();
  if (!interest) {
    res.status(400).json({ error: "interest query parameter is required" });
    return;
  }

  const { data, error } = await supabase
    .from("editor_letters")
    .select("editor_name, editor_role, interest_match, message_template, accent_color")
    .eq("interest_match", interest)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "No editor letter for this interest" });
    return;
  }

  res.json(data);
});

export default router;
