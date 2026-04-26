import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("momentos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const mapped = data.map(m => ({
    id: m.id,
    headline: m.headline,
    caption: m.caption,
    category: m.category,
    accentColor: m.accent_color,
    imageKey: "food",
    image_url: m.image_url,
  }));

  res.json(mapped);
});

export default router;