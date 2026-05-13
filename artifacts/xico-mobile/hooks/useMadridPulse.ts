import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/constants/api";

export type MadridPulse = {
  date_key: string;
  text: string;
  editor_name: string | null;
};

/**
 * Reads today's atmospheric Madrid line from GET /api/madrid-pulse/today.
 * Used by ReEntryWelcome when days_since_last_open ≥ 7.
 */
export function useMadridPulse() {
  return useQuery<MadridPulse>({
    queryKey: ["madrid-pulse", "today"],
    staleTime: 60_000 * 60 * 6, // 6 hours
    queryFn: () => fetchJson<MadridPulse>("/api/madrid-pulse/today"),
  });
}
