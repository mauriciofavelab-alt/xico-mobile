import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { computeNarrationStyle } from "../utils/narrationStyle.js";

const router = Router();

async function getOrCreateProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };

  if (data) return { profile: data, error: null };

  // First login — create profile
  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert({ auth_user_id: userId, interests: [] })
    .select()
    .single();

  if (createError) return { profile: null, error: createError.message };
  return { profile: created, error: null };
}

function toApiProfile(row: Record<string, unknown>) {
  return {
    id: row.id,
    auth_user_id: row.auth_user_id,
    name: row.display_name ?? "",
    email: row.email ?? "",
    interests: row.interests ?? [],
    narration_style: row.narration_style ?? "intellectual",
    memberType: row.membership_tier ?? "Lector",
    memberSince: row.created_at
      ? String(new Date(row.created_at as string).getFullYear())
      : "2026",
    city: row.city ?? "Madrid",
    country: row.country ?? "España",
    points: row.points ?? 0,
    streakDays: row.streak_days ?? 0,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { profile, error } = await getOrCreateProfile(userId);
  if (error || !profile) {
    res.status(500).json({ error: error ?? "Unknown error" });
    return;
  }
  res.json(toApiProfile(profile));
});

router.patch("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { name, interests } = req.body as { name?: string; interests?: string[] };

  const { profile: existing } = await getOrCreateProfile(userId);
  if (!existing) {
    res.status(500).json({ error: "Profile not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.display_name = name;
  if (interests !== undefined) {
    updates.interests = interests;
    updates.narration_style = computeNarrationStyle(interests);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(toApiProfile(data));
});

export default router;
