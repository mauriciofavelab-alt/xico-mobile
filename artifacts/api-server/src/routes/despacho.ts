import { Router, type Request } from "express";
import { supabase } from "../supabase.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import type { NarrationStyle } from "../utils/narrationStyle.js";
import { getRotationIndex } from "./despacho-data.js";

const router = Router();

function formatSupabase(
  despacho: Record<string, any>,
  variant: Record<string, any> | null,
  style: NarrationStyle,
) {
  return {
    rotation_key: despacho.rotation_key,
    subtitulo: despacho.subtitulo,
    color: { nombre: despacho.color_nombre, hex: despacho.color_hex },
    nahuatl: {
      word: despacho.nahuatl_word,
      meaning: despacho.nahuatl_meaning,
      nota: despacho.nahuatl_nota,
    },
    lugar: {
      nombre: despacho.lugar_nombre,
      barrio: despacho.lugar_barrio,
      nota: despacho.lugar_nota,
    },
    hecho: despacho.hecho,
    pensamiento: variant?.pensamiento_variant ?? despacho.pensamiento,
    pregunta: variant?.pregunta_variant ?? despacho.pregunta,
    teaser: variant?.teaser_variant ?? despacho.teaser,
    narration_style: style,
  };
}

router.get("/", requireAuth, async (req, res) => {
  const userId = (req as Request & { userId: string }).userId;

  // Get user's narration style from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("narration_style")
    .eq("auth_user_id", userId)
    .maybeSingle();

  const style: NarrationStyle = (profile?.narration_style as NarrationStyle) ?? "intellectual";
  const rotationIndex = getRotationIndex();

  // Try Supabase first
  const { data: despacho } = await supabase
    .from("despacho")
    .select("*")
    .eq("rotation_key", rotationIndex)
    .maybeSingle();

  if (!despacho) {
    res.status(404).json({ error: "No despacho available for today" });
    return;
  }

  const { data: variant } = await supabase
    .from("despacho_variants")
    .select("*")
    .eq("despacho_id", despacho.id)
    .eq("narration_style", style)
    .maybeSingle();

  res.json(formatSupabase(despacho, variant, style));
});

// Public endpoint (no auth) returns intellectual style
router.get("/public", async (_req, res) => {
  const rotationIndex = getRotationIndex();

  const { data: despacho } = await supabase
    .from("despacho")
    .select("*")
    .eq("rotation_key", rotationIndex)
    .maybeSingle();

  if (!despacho) {
    res.status(404).json({ error: "No despacho available for today" });
    return;
  }

  res.json(formatSupabase(despacho, null, "intellectual"));
});

export default router;
