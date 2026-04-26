import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const mapped = data.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type,
    description: s.description,
    address: s.address,
    neighborhood: s.neighborhood,
    lat: s.lat,
    lng: s.lng,
    copil: s.is_copil,
    accentColor: s.accent_color,
    tags: s.tags ?? [],
    imageKey: "food",
  }));

  res.json(mapped);
});

export default router;