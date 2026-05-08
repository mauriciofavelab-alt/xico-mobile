import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

function getDayIndex(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return dayOfYear % 7;
}

function levelFromPoints(pts: number): string {
  if (pts >= 500) return "Cronista";
  if (pts >= 200) return "Curador";
  if (pts >= 50)  return "Conocedor";
  return "Iniciado";
}

async function fetchPhrase(level: string, style: string): Promise<string | null> {
  const { data } = await supabase
    .from("companion_phrases")
    .select("phrases")
    .eq("level", level)
    .eq("narration_style", style)
    .maybeSingle();

  if (!data?.phrases?.length) return null;
  const idx = getDayIndex() % data.phrases.length;
  return data.phrases[idx];
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;

  const { data: profile } = await supabase
    .from("profiles")
    .select("points, narration_style")
    .eq("auth_user_id", userId)
    .maybeSingle();

  const style = (profile?.narration_style as string) ?? "intellectual";
  const level = levelFromPoints(profile?.points ?? 0);

  const phrase = await fetchPhrase(level, style);
  if (!phrase) {
    res.status(404).json({ error: "No companion phrases available" });
    return;
  }

  res.json({ phrase, level, narration_style: style });
});

router.get("/public", async (_req, res) => {
  const phrase = await fetchPhrase("Iniciado", "intellectual");
  if (!phrase) {
    res.status(404).json({ error: "No companion phrases available" });
    return;
  }
  res.json({ phrase, level: "Iniciado", narration_style: "intellectual" });
});

export default router;
