import { Router } from "express";
import { supabase } from "../supabase.js";

const router = Router();

function normalize(a: any) {
  const readMins = a.read_time_minutes ?? 5;
  return {
    ...a,
    author_name: a.author_name ?? null,
    read_time_minutes: readMins,
    readTime: `${String(readMins).padStart(2, "0")} MIN`,
    is_featured: a.featured ?? a.is_featured ?? false,
    featured: a.featured ?? a.is_featured ?? false,
    is_published: true,
  };
}

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json((data ?? []).map(normalize));
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", req.params.id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "Article not found" });
    return;
  }

  res.json(normalize(data));
});

export default router;
