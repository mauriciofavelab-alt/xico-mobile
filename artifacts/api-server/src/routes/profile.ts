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

// GET /api/profile/tier · auth
// Returns the computed tier state (iniciado / conocedor / curador / cronista)
// plus per-rumbo distribution and the list of eligible_perks the user has
// unlocked from the partners table. Tier is computed via profile_tier() SQL
// function — never stored. sellos_rumbo rows are the source of truth.
router.get("/tier", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;

  const { profile, error: profileErr } = await getOrCreateProfile(userId);
  if (profileErr || !profile) {
    res.status(500).json({ error: profileErr ?? "Unknown error" });
    return;
  }

  const { data: tierData, error: tierErr } = await supabase.rpc("profile_tier", {
    p_profile_id: (profile as any).id,
  });
  if (tierErr) {
    res.status(500).json({ error: tierErr.message });
    return;
  }

  const tier = tierData as {
    tier: string;
    total: number;
    by_rumbo: Record<string, number>;
    distinct_rumbos: number;
    min_per_rumbo: number;
  };

  // Eligible perks: partners whose min_tier_required is met by current tier.
  // Tier ordering: iniciado < conocedor < curador < cronista
  const TIER_ORDER: Record<string, number> = {
    iniciado: 0, conocedor: 1, curador: 2, cronista: 3,
  };
  const currentRank = TIER_ORDER[tier.tier] ?? 0;

  const { data: allPartners, error: partnersErr } = await supabase
    .from("partners")
    .select("id, partner_type, name, redemption_method, min_tier_required, accent_color, notes");
  if (partnersErr) {
    res.status(500).json({ error: partnersErr.message });
    return;
  }

  const eligiblePerks = (allPartners ?? []).filter(
    (p: any) => (TIER_ORDER[p.min_tier_required] ?? 99) <= currentRank,
  );

  res.json({ ...tier, eligible_perks: eligiblePerks });
});

export default router;
