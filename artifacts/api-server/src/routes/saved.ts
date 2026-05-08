import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

async function getProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();
  return data?.id ?? null;
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const profileId = await getProfileId(userId);
  if (!profileId) { res.json([]); return; }

  const { data: savedRows, error } = await supabase
    .from("saved_articles")
    .select("article_id")
    .eq("profile_id", profileId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!savedRows?.length) { res.json([]); return; }

  const ids = savedRows.map(r => r.article_id);
  const { data: articles, error: artError } = await supabase
    .from("articles")
    .select("*")
    .in("id", ids);

  if (artError) { res.status(500).json({ error: artError.message }); return; }
  res.json(articles ?? []);
});

router.post("/:articleId", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const { error } = await supabase
    .from("saved_articles")
    .upsert({ profile_id: profileId, article_id: req.params.articleId }, { onConflict: "profile_id,article_id" });

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ saved: true });
});

router.delete("/:articleId", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const profileId = await getProfileId(userId);
  if (!profileId) { res.status(404).json({ error: "Profile not found" }); return; }

  const { error } = await supabase
    .from("saved_articles")
    .delete()
    .eq("profile_id", profileId)
    .eq("article_id", req.params.articleId);

  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ saved: false });
});

router.get("/:articleId/status", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const profileId = await getProfileId(userId);
  if (!profileId) { res.json({ saved: false }); return; }

  const { data } = await supabase
    .from("saved_articles")
    .select("article_id")
    .eq("profile_id", profileId)
    .eq("article_id", req.params.articleId)
    .maybeSingle();

  res.json({ saved: !!data });
});

export default router;
