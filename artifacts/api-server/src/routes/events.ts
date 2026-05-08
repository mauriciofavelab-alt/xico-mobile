import { Router, type IRouter, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router: IRouter = Router();

function accentForCategory(category: string) {
  if (category === "gastronomia") return "ochre";
  if (category === "artes-visuales") return "cobalt";
  if (category === "literatura") return "emerald";
  return "magenta";
}

function mapEvent(e: any, rsvpIds: Set<string>) {
  return {
    id: e.id,
    title: e.title,
    date: e.starts_at
      ? new Date(e.starts_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
      : "",
    time: e.starts_at
      ? new Date(e.starts_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : "",
    venue: e.venue_name,
    description: e.description,
    category: e.category,
    price: e.price ?? "Gratuito",
    accentColor: accentForCategory(e.category),
    voy: rsvpIds.has(e.id),
  };
}

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const { data: { user } } = await supabase.auth.getUser(auth.slice(7));
  return user?.id ?? null;
}

router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  const rsvpIds = new Set<string>();
  const userId = await getUserId(req);
  if (userId) {
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("user_id", userId);
    (rsvps ?? []).forEach((r) => rsvpIds.add(r.event_id));
  }

  res.json((data ?? []).map((e) => mapEvent(e, rsvpIds)));
});

router.post("/:eventId/voy", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { eventId } = req.params;

  const { error } = await supabase
    .from("event_rsvps")
    .upsert({ event_id: eventId, user_id: userId }, { onConflict: "event_id,user_id" });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ voy: true });
});

router.delete("/:eventId/voy", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;
  const { eventId } = req.params;

  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ voy: false });
});

export default router;
