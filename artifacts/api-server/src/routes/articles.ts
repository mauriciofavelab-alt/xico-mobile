import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;