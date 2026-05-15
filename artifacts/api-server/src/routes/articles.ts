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

// GET /api/articles/featured/today · public
// Returns the most recent published article with featured=true. Powers the
// Hoy screen's "Featured" card. Anonymous · same curated content for everyone.
// When no featured article exists, returns 404 so the client renders the
// "no featured today" state (manifesto-honest · never invent content).
router.get("/featured/today", async (_req, res) => {
  const { data, error } = await supabase
    .from("articles")
    .select("id, slug, pillar, subcategory, category, tag, title, subtitle, author_name, institution, image_key, read_time_minutes, accent_color, published_at")
    .eq("is_published", true)
    .eq("featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  if (!data) {
    res.status(404).json({ error: "No featured article available" });
    return;
  }
  res.json(normalize(data));
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
