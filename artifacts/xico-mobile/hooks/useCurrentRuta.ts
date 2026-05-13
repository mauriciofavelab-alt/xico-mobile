import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";
import type { RumboSlug } from "@/constants/rumbos";

export type RutaStopLite = {
  id: string;
  order: number;
  name: string;
  address: string;
  description: string;
  category: string;
  accentColor: string | null;
  time: string | null;
  distanceToNext: string | null;
  lat: number | null;
  lng: number | null;
  despacho_text: string | null;
  rumbo: {
    id: string;
    slug: RumboSlug;
    nahuatl_name: string;
    color_hex: string;
  } | null;
};

export type CurrentRuta = {
  id: string;
  title: string;
  subtitle: string;
  month: string;
  week_key: string | null;
  editor_name: string | null;
  published_at: string | null;
  stops: RutaStopLite[];
};

/**
 * Reads the active Ruta from GET /api/ruta/current.
 * Never returns apunte_in_situ — that's geo-locked and requires a separate
 * visit-token request from the Stop screen.
 */
export function useCurrentRuta() {
  return useQuery<CurrentRuta>({
    queryKey: ["ruta", "current"],
    staleTime: 60_000 * 30, // 30 min — Ruta updates Sundays at 9am
    queryFn: () => fetchJson<CurrentRuta>("/api/ruta/current"),
  });
}
