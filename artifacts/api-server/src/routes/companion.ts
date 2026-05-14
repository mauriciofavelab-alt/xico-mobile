import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

type TimeMode = "madrugada" | "dia" | "atardecer";

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

function parseTimeMode(value: unknown): TimeMode {
  if (value === "madrugada" || value === "atardecer" || value === "dia") return value;
  return "dia";
}

/**
 * Fetch a phrase for (level, narration_style, time_mode). Falls back to the
 * 'dia' row when a time-mode-specific row isn't seeded for that cell.
 *
 * v1 schema (after migration 2026-05-14) has:
 *   - full 'dia' coverage (4 levels × 5 styles = 20 rows)
 *   - 4 'madrugada' rows + 4 'atardecer' rows (curated cells)
 * Fallback keeps the API consistent until the full time-mode matrix is seeded.
 */
async function fetchPhrase(level: string, style: string, timeMode: TimeMode): Promise<{ phrase: string; effective_time_mode: TimeMode } | null> {
  // Try the requested mode first
  if (timeMode !== "dia") {
    const { data } = await supabase
      .from("companion_phrases")
      .select("phrases")
      .eq("level", level)
      .eq("narration_style", style)
      .eq("time_mode", timeMode)
      .maybeSingle();
    if (data?.phrases?.length) {
      const idx = getDayIndex() % data.phrases.length;
      return { phrase: data.phrases[idx], effective_time_mode: timeMode };
    }
  }

  // Fall back to 'dia' (always seeded)
  const { data } = await supabase
    .from("companion_phrases")
    .select("phrases")
    .eq("level", level)
    .eq("narration_style", style)
    .eq("time_mode", "dia")
    .maybeSingle();

  if (!data?.phrases?.length) return null;
  const idx = getDayIndex() % data.phrases.length;
  return { phrase: data.phrases[idx], effective_time_mode: "dia" };
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const timeMode = parseTimeMode(req.query["time_mode"]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("points, narration_style")
    .eq("auth_user_id", userId)
    .maybeSingle();

  const style = (profile?.narration_style as string) ?? "intellectual";
  const level = levelFromPoints(profile?.points ?? 0);

  const result = await fetchPhrase(level, style, timeMode);
  if (!result) {
    res.status(404).json({ error: "No companion phrases available" });
    return;
  }

  res.json({
    phrase: result.phrase,
    level,
    narration_style: style,
    time_mode_requested: timeMode,
    time_mode_effective: result.effective_time_mode,
  });
});

router.get("/public", async (req, res) => {
  const timeMode = parseTimeMode(req.query["time_mode"]);
  const result = await fetchPhrase("Iniciado", "intellectual", timeMode);
  if (!result) {
    res.status(404).json({ error: "No companion phrases available" });
    return;
  }
  res.json({
    phrase: result.phrase,
    level: "Iniciado",
    narration_style: "intellectual",
    time_mode_requested: timeMode,
    time_mode_effective: result.effective_time_mode,
  });
});

export default router;
