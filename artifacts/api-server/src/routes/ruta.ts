import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

function formatRuta(ruta: any, stops: any[]) {
  return {
    id: ruta.id,
    title: ruta.title,
    subtitle: ruta.subtitle,
    month: ruta.month,
    stops: stops.map((s: any) => ({
      order: s.order_num,
      name: s.name,
      address: s.address,
      description: s.description,
      category: s.category,
      accentColor: s.accent_color,
      time: s.time_suggestion,
      distanceToNext: s.distance_to_next ?? null,
    })),
  };
}

router.get("/", async (_req, res) => {
  const { data: ruta, error: rutaError } = await supabase
    .from("ruta")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (rutaError) {
    res.status(500).json({ error: rutaError.message });
    return;
  }
  if (!ruta) {
    res.status(404).json({ error: "No active ruta" });
    return;
  }

  const { data: stops, error: stopsError } = await supabase
    .from("ruta_stops")
    .select("*")
    .eq("ruta_id", ruta.id)
    .order("order_num", { ascending: true });

  if (stopsError) {
    res.status(500).json({ error: stopsError.message });
    return;
  }

  res.json(formatRuta(ruta, stops ?? []));
});

export default router;
