import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback, useEffect } from "react";

type PillarCount = { cultura: number; "mexico-ahora": number; indice: number; archivo: number };
type SubCount = Record<string, number>;
type HourCount = Record<string, number>;

const PILLAR_KEY = "xico_pillar_reads";
const SUB_KEY = "xico_sub_reads";
const HOUR_KEY = "xico_hour_reads";

async function loadPillar(): Promise<PillarCount> {
  try {
    const raw = await AsyncStorage.getItem(PILLAR_KEY);
    if (!raw) return { cultura: 0, "mexico-ahora": 0, indice: 0, archivo: 0 };
    return JSON.parse(raw);
  } catch { return { cultura: 0, "mexico-ahora": 0, indice: 0, archivo: 0 }; }
}

async function loadSub(): Promise<SubCount> {
  try {
    const raw = await AsyncStorage.getItem(SUB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

async function loadHour(): Promise<HourCount> {
  try {
    const raw = await AsyncStorage.getItem(HOUR_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export async function trackReadContext(pillar?: string, subcategory?: string) {
  try {
    const pilCounts = await loadPillar();
    if (pillar && pillar in pilCounts) {
      (pilCounts as any)[pillar]++;
      await AsyncStorage.setItem(PILLAR_KEY, JSON.stringify(pilCounts));
    }
    if (subcategory) {
      const subCounts = await loadSub();
      subCounts[subcategory] = (subCounts[subcategory] || 0) + 1;
      await AsyncStorage.setItem(SUB_KEY, JSON.stringify(subCounts));
    }
    const hour = new Date().getHours();
    const bucket = hour < 9 ? "antes-9" : hour < 13 ? "manana" : hour < 18 ? "tarde" : hour < 22 ? "noche" : "madrugada";
    const hourCounts = await loadHour();
    hourCounts[bucket] = (hourCounts[bucket] || 0) + 1;
    await AsyncStorage.setItem(HOUR_KEY, JSON.stringify(hourCounts));
  } catch {}
}

export type Criterion = {
  headline: string;
  detail: string;
};

export function useUserCriterion(): Criterion[] {
  const [criteria, setCriteria] = useState<Criterion[]>([]);

  const compute = useCallback(async () => {
    const pillar = await loadPillar();
    const sub = await loadSub();
    const hour = await loadHour();

    const totalReads = pillar.cultura + pillar["mexico-ahora"] + pillar.indice + pillar.archivo;

    if (totalReads < 2) {
      setCriteria([
        { headline: "Aún estamos conociéndote", detail: "Lee algunos artículos para empezar a dibujar tu criterio cultural." },
      ]);
      return;
    }

    const out: Criterion[] = [];

    // 1. Pilar dominante
    const topPillar = Object.entries(pillar).sort((a, b) => b[1] - a[1])[0];
    if (topPillar && topPillar[1] > 0) {
      const pct = Math.round((topPillar[1] / totalReads) * 100);
      const pillarName: Record<string, string> = {
        cultura: "Cultura",
        "mexico-ahora": "México Ahora",
        indice: "Índice",
        archivo: "Archivo",
      };
      out.push({
        headline: `${pct}% ${pillarName[topPillar[0]] ?? topPillar[0]}`,
        detail: `De cada 10 lecturas, ${Math.round(pct / 10)} son de ${pillarName[topPillar[0]]?.toLowerCase()}.`,
      });
    }

    // 2. Subcategoría favorita
    const topSub = Object.entries(sub).sort((a, b) => b[1] - a[1])[0];
    if (topSub && topSub[1] >= 2) {
      const name = topSub[0].replace(/-/g, " ");
      out.push({
        headline: `Te fascina ${name}`,
        detail: `${topSub[1]} artículos leídos en esta categoría.`,
      });
    }

    // 3. Hora preferida
    const topHour = Object.entries(hour).sort((a, b) => b[1] - a[1])[0];
    if (topHour && topHour[1] > 0) {
      const hourLabels: Record<string, { h: string; d: string }> = {
        "antes-9": { h: "Lees antes del mundo",       d: `El ${Math.round((topHour[1] / totalReads) * 100)}% de tus lecturas son antes de las 9 AM.` },
        "manana": { h: "Lector de mañana",             d: `Prefieres leer entre las 9 y las 13 h.` },
        "tarde":  { h: "Lector de tarde",              d: `Tu hora XICO es entre las 13 y las 18 h.` },
        "noche":  { h: "Lector nocturno",              d: `Tu mejor momento es entre las 18 y las 22 h.` },
        "madrugada": { h: "Lector de madrugada",       d: `Lees cuando la ciudad duerme.` },
      };
      const lbl = hourLabels[topHour[0]];
      if (lbl) out.push({ headline: lbl.h, detail: lbl.d });
    }

    setCriteria(out);
  }, []);

  useEffect(() => { compute(); }, [compute]);

  return criteria;
}
