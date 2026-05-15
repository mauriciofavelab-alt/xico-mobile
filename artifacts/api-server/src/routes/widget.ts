import { Router, type IRouter, type Request, type Response } from "express";
import { supabase } from "../supabase.js";
import { getRotationIndex } from "./despacho-data.js";

const router: IRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/widget/today
//
// Anonymous endpoint serving today's editorial data for iOS widgets.
// Returns BOTH `despacho` and `ruta` in a single payload — widgets pull once
// per timeline refresh and the two Swift providers (WidgetDataProvider and
// RutaProgressProvider) each decode the slice they need.
//
// Why anonymous (5-axis trade-off · ADR-001/ADR-007 lineage):
//   · Adding auth to widgets requires an App Group UserDefaults bridge so the
//     native app can hand the JWT to the widget process. That's a Swift +
//     TypeScript dual-side change · ~6 hrs effort · v1.2 follow-up.
//   · The widget surfaces that NEED per-user data (Lock Circular + Rectangular
//     showing earned sellos) gracefully fall back to placeholder zeros · the
//     rosetón still renders with 0/N progress.
//   · Editorial-honest for an iniciado who hasn't walked yet, and the despacho
//     itself (the primary widget content) is the SAME for every user — it's
//     curated, not personalized.
//
// Contract is verified against:
//   · targets/XicoWidgets/WidgetDataProvider.swift  (DespachoPayload CodingKeys)
//   · targets/XicoWidgets/RutaProgressProvider.swift (RutaPayload CodingKeys)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/today", async (_req: Request, res: Response) => {
  try {
    // ── Despacho ────────────────────────────────────────────────────────────
    // Use the SAME rotation function the in-app despacho route uses (mirrors
    // the local TS constants logic too) so widget + in-app show the same
    // despacho on the same day. No drift.
    const rotationIndex = getRotationIndex();
    const { data: despacho, error: despachoErr } = await supabase
      .from("despacho")
      .select("nahuatl_word, nahuatl_meaning, color_hex, lugar_nombre, lugar_barrio")
      .eq("rotation_key", rotationIndex)
      .maybeSingle();

    if (despachoErr) {
      res.status(500).json({ error: despachoErr.message });
      return;
    }
    if (!despacho) {
      res.status(404).json({ error: "No despacho for today" });
      return;
    }

    // ── Active Ruta ─────────────────────────────────────────────────────────
    // `is_active` IS a column on `ruta` (added by migrations/2026-05-14-ruta-
    // rumbos.sql · referenced by src/routes/ruta.ts:getActiveRuta()).
    const { data: ruta } = await supabase
      .from("ruta")
      .select("id, week_key, editor_name")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    // ── Stops + first-stop rumbo (for next_stop_name / next_stop_rumbo_hex) ─
    let totalStops = 0;
    let nextStopName: string | null = null;
    let nextStopRumboHex: string | null = null;

    if (ruta?.id) {
      const { data: stops } = await supabase
        .from("ruta_stops")
        .select("order_num, name, rumbo_id")
        .eq("ruta_id", ruta.id)
        .order("order_num", { ascending: true });

      if (stops && stops.length > 0) {
        totalStops = stops.length;
        const firstStop = stops[0] as { order_num: number; name: string; rumbo_id: string | null };

        // Anonymous endpoint can't know which stop the user already walked,
        // so "next" defaults to the FIRST in order_num order. The App Group
        // bridge (v1.2) will replace this with the actual user's next stop.
        nextStopName = firstStop.name;

        if (firstStop.rumbo_id) {
          const { data: rumbo } = await supabase
            .from("rumbos")
            .select("color_hex")
            .eq("id", firstStop.rumbo_id)
            .maybeSingle();
          nextStopRumboHex = (rumbo?.color_hex as string | undefined) ?? null;
        }
      }
    }

    // ── week_label derivation ───────────────────────────────────────────────
    // Convert "2026-W19" → "SEMANA 19". If the ruta has no week_key (legacy
    // rows), fall back to a neutral editorial label.
    const weekLabel = ruta?.week_key
      ? String(ruta.week_key).replace(/^\d{4}-W/, "SEMANA ")
      : "ESTA SEMANA";

    // ── Compose response ────────────────────────────────────────────────────
    // Keys are snake_case to match the Swift CodingKeys exactly.
    res.json({
      despacho: {
        nahuatl_word: despacho.nahuatl_word,
        nahuatl_meaning: despacho.nahuatl_meaning,
        color_hex: despacho.color_hex,
        lugar_nombre: despacho.lugar_nombre,
        lugar_barrio: despacho.lugar_barrio,
        // The `despacho` table has no editor_name column. We attribute to the
        // current Ruta's editor (one editor curates a week's editorial slate),
        // and if there's no active Ruta we attribute to the team. This is
        // editorial-honest · the despacho IS curated by the same team.
        editor_name: ruta?.editor_name ?? "El equipo de XICO",
      },
      ruta: {
        week_label: weekLabel,
        // Per-user progress is NOT served here · widget falls back to zeros
        // until the v1.2 App Group bridge populates real values.
        earned_stops: 0,
        total_stops: totalStops,
        next_stop_name: nextStopName,
        next_stop_rumbo_hex: nextStopRumboHex,
        earned_by_rumbo: { norte: 0, este: 0, sur: 0, oeste: 0 },
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
});

export default router;
