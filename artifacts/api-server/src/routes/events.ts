import { Router, type IRouter } from "express";
import { supabase } from "../supabase.js";

const router: IRouter = Router();

const rsvpSet = new Set<string>();

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const mapped = data.map(e => ({
    id: e.id,
    title: e.title,
    date: e.starts_at ? new Date(e.starts_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "",
    time: e.starts_at ? new Date(e.starts_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "",
    venue: e.venue_name,
    description: e.description,
    category: e.category,
    price: e.price ?? "Gratuito",
    accentColor: e.category === "gastronomia" ? "ochre" : e.category === "artes-visuales" ? "cobalt" : "magenta",
    voy: rsvpSet.has(e.id),
  }));

  res.json(mapped);
});

router.post("/:eventId/voy", (req, res) => {
  rsvpSet.add(req.params.eventId);
  res.json({ voy: true });
});

router.delete("/:eventId/voy", (req, res) => {
  rsvpSet.delete(req.params.eventId);
  res.json({ voy: false });
});

export default router;