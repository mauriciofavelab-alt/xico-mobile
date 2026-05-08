import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

function mapSpot(s: any) {
  return {
    id: s.id,
    name: s.name,
    type: s.type,
    description: s.description,
    address: s.address,
    neighborhood: s.neighborhood,
    lat: s.lat,
    lng: s.lng,
    copil: s.is_copil ?? false,
    accentColor: s.accent_color ?? "ochre",
    tags: s.tags ?? [],
  };
}

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json((data ?? []).map(mapSpot));
});

export default router;
