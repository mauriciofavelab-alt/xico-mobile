import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

router.get("/", async (_req, res) => {
  const { data: rutas, error: rutaError } = await supabase
    .from("ruta")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .single();

  if (rutaError || !rutas) {
    res.status(404).json({ error: "No active ruta found" });
    return;
  }

  const { data: stops, error: stopsError } = await supabase
    .from("ruta_stops")
    .select("*")
    .eq("ruta_id", rutas.id)
    .order("order_num", { ascending: true });

  if (stopsError) {
    res.status(500).json({ error: stopsError.message });
    return;
  }

  res.json({
    id: rutas.id,
    title: rutas.title,
    subtitle: rutas.subtitle,
    month: rutas.month,
    stops: stops.map(s => ({
      order: s.order_num,
      name: s.name,
      address: s.address,
      description: s.description,
      category: s.category,
      accentColor: s.accent_color,
      imageKey: "food",
      time: s.time_suggestion,
      distanceToNext: s.distance_to_next,
    })),
  });
});

export default router;