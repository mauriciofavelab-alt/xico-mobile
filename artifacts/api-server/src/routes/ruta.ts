import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

type RumboLite = { id: string; slug: string; nahuatl_name: string; color_hex: string };

function formatRuta(ruta: any, stops: any[], rumboById: Record<string, RumboLite>) {
  return {
    id: ruta.id,
    title: ruta.title,
    subtitle: ruta.subtitle,
    month: ruta.month,
    week_key: ruta.week_key,
    editor_name: ruta.editor_name,
    published_at: ruta.published_at,
    stops: stops.map((s: any) => ({
      id: s.id,
      order: s.order_num,
      name: s.name,
      address: s.address,
      description: s.description,
      category: s.category,
      accentColor: s.accent_color,
      time: s.time_suggestion,
      distanceToNext: s.distance_to_next ?? null,
      lat: s.lat,
      lng: s.lng,
      // The dual-layer text contract:
      //   - despacho_text is the public layer — always returned
      //   - apunte_in_situ is the geo-locked layer — NEVER returned here;
      //     issued only via POST /api/ruta-stops/:id/visit-token after geo check
      despacho_text: s.despacho_text,
      rumbo: s.rumbo_id && rumboById[s.rumbo_id]
        ? {
            id: rumboById[s.rumbo_id].id,
            slug: rumboById[s.rumbo_id].slug,
            nahuatl_name: rumboById[s.rumbo_id].nahuatl_name,
            color_hex: rumboById[s.rumbo_id].color_hex,
          }
        : null,
    })),
  };
}

async function getActiveRuta() {
  const { data, error } = await supabase
    .from("ruta")
    .select("*")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getStopsWithRumbos(rutaId: string) {
  const [stopsRes, rumbosRes] = await Promise.all([
    supabase
      .from("ruta_stops")
      .select("id, ruta_id, order_num, name, address, description, category, accent_color, time_suggestion, distance_to_next, lat, lng, rumbo_id, despacho_text")
      .eq("ruta_id", rutaId)
      .order("order_num", { ascending: true }),
    supabase
      .from("rumbos")
      .select("id, slug, nahuatl_name, color_hex"),
  ]);

  if (stopsRes.error) throw stopsRes.error;
  if (rumbosRes.error) throw rumbosRes.error;

  const rumboById: Record<string, RumboLite> = Object.fromEntries(
    (rumbosRes.data ?? []).map((r: any) => [r.id, r as RumboLite]),
  );
  return { stops: stopsRes.data ?? [], rumboById };
}

// GET /api/ruta · existing endpoint, preserved for back-compat with current mobile build
router.get("/", async (_req, res) => {
  try {
    const ruta = await getActiveRuta();
    if (!ruta) {
      res.status(404).json({ error: "No active ruta" });
      return;
    }
    const { stops, rumboById } = await getStopsWithRumbos(ruta.id);
    res.json(formatRuta(ruta, stops, rumboById));
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Unknown error" });
  }
});

// GET /api/ruta/current · new in Week 2 of ruta-rumbos plan
// Returns active ruta + stops with rumbo joined. Never returns apunte_in_situ
// (that's geo-locked and issued via POST /api/ruta-stops/:id/visit-token).
router.get("/current", async (_req, res) => {
  try {
    const ruta = await getActiveRuta();
    if (!ruta) {
      res.status(404).json({ error: "No active ruta" });
      return;
    }
    const { stops, rumboById } = await getStopsWithRumbos(ruta.id);
    res.json(formatRuta(ruta, stops, rumboById));
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? "Unknown error" });
  }
});

export default router;
