import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback, useEffect } from "react";

export type StampId =
  | "primera-lectura"
  | "explorador"
  | "conocedor"
  | "momentos"
  | "agenda"
  | "ruta"
  | "guardado"
  | "madrugador"
  | "despacho";

export type StampCategory = "lectura" | "presencia" | "coleccion";

export interface Stamp {
  id: StampId;
  titulo: string;
  descripcion: string;
  color: string;
  category: StampCategory;
  pts: number;
  earned: boolean;
}

export interface XicoLevel {
  nombre: string;
  minPts: number;
  maxPts: number | null;
  color: string;
  descripcion: string;
  folio: string;
}

export const XICO_LEVELS: XicoLevel[] = [
  { nombre: "Iniciado",  minPts: 0,   maxPts: 49,   color: "#1a4a1a", descripcion: "El archivo comienza",        folio: "I"   },
  { nombre: "Conocedor", minPts: 50,  maxPts: 199,  color: "#1a3d8a", descripcion: "La mirada se afina",         folio: "II"  },
  { nombre: "Curador",   minPts: 200, maxPts: 499,  color: "#b8820a", descripcion: "El criterio toma forma",     folio: "III" },
  { nombre: "Cronista",  minPts: 500, maxPts: null, color: "#9c1a47", descripcion: "Memoria viva de la cultura", folio: "IV"  },
];

// Colores por categoría — paleta Barragán semántica
const COLOR_LECTURA   = "#1a3d8a"; // Cobalto — sellos de lectura (cultura profunda)
const COLOR_PRESENCIA = "#9c1a47"; // Magenta — sellos de presencia (vida cultural)
const COLOR_COLECCION = "#b8820a"; // Ocre — sellos de colección (archivo personal)

export const DEFINITIONS: Omit<Stamp, "earned">[] = [
  { id: "primera-lectura", titulo: "Ojo",       descripcion: "Tu mirada empieza a entrenarse", color: COLOR_LECTURA,   category: "lectura",   pts: 15 },
  { id: "explorador",      titulo: "Camino",    descripcion: "Vas más allá de la superficie",  color: COLOR_LECTURA,   category: "lectura",   pts: 35 },
  { id: "conocedor",       titulo: "Raíz",      descripcion: "Profundizas en un tema",         color: COLOR_LECTURA,   category: "lectura",   pts: 80 },
  { id: "momentos",        titulo: "Destello",  descripcion: "Atrapaste el instante",          color: COLOR_PRESENCIA, category: "presencia", pts: 20 },
  { id: "agenda",          titulo: "Presencia", descripcion: "Estuviste ahí",                  color: COLOR_PRESENCIA, category: "presencia", pts: 30 },
  { id: "ruta",            titulo: "Peregrino", descripcion: "Recorriste la ruta",             color: COLOR_PRESENCIA, category: "presencia", pts: 25 },
  { id: "guardado",        titulo: "Archivo",   descripcion: "Construyes tu memoria",          color: COLOR_COLECCION, category: "coleccion", pts: 25 },
  { id: "madrugador",      titulo: "Alba",      descripcion: "Lees antes del mundo",           color: COLOR_COLECCION, category: "coleccion", pts: 20 },
  { id: "despacho",        titulo: "Despacho",  descripcion: "Abriste el despacho del día",    color: COLOR_PRESENCIA, category: "presencia", pts: 25 },
];

const STAMP_KEY    = "xico_passport";
const READS_KEY    = "xico_article_reads";
const JOIN_DATE_KEY = "xico_join_date";

export function calculatePoints(earnedStamps: Set<StampId>, streak: number): number {
  const stampPts = DEFINITIONS
    .filter(d => earnedStamps.has(d.id))
    .reduce((acc, d) => acc + d.pts, 0);
  const streakBonus = Math.max(0, (streak - 1) * 5);
  return stampPts + streakBonus;
}

export function getXicoLevel(pts: number): XicoLevel {
  for (let i = XICO_LEVELS.length - 1; i >= 0; i--) {
    if (pts >= XICO_LEVELS[i].minPts) return XICO_LEVELS[i];
  }
  return XICO_LEVELS[0];
}

// Días desde el registro — edad cultural
export async function getXicoAge(): Promise<number> {
  try {
    let raw = await AsyncStorage.getItem(JOIN_DATE_KEY);
    if (!raw) {
      raw = new Date().toISOString();
      await AsyncStorage.setItem(JOIN_DATE_KEY, raw);
    }
    const joinDate = new Date(raw);
    const now = new Date();
    const diffMs = now.getTime() - joinDate.getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  } catch {
    return 1;
  }
}

async function loadEarned(): Promise<Set<StampId>> {
  try {
    const raw = await AsyncStorage.getItem(STAMP_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as StampId[]);
  } catch {
    return new Set();
  }
}

async function saveEarned(set: Set<StampId>) {
  await AsyncStorage.setItem(STAMP_KEY, JSON.stringify([...set]));
}

async function getReadCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(READS_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

async function incrementReadCount(): Promise<number> {
  const count = (await getReadCount()) + 1;
  await AsyncStorage.setItem(READS_KEY, String(count));
  return count;
}

// Dev utility — call once to clear all passport data
export async function resetPassport() {
  await AsyncStorage.multiRemove([STAMP_KEY, READS_KEY, JOIN_DATE_KEY]);
}

export function usePassport() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [newStamp, setNewStamp] = useState<Stamp | null>(null);

  const load = useCallback(async () => {
    const earned = await loadEarned();
    setStamps(DEFINITIONS.map(d => ({ ...d, earned: earned.has(d.id) })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const earn = useCallback(async (id: StampId) => {
    const earned = await loadEarned();
    if (earned.has(id)) return;
    earned.add(id);
    await saveEarned(earned);
    const def = DEFINITIONS.find(d => d.id === id)!;
    const s: Stamp = { ...def, earned: true };
    setStamps(DEFINITIONS.map(d => ({ ...d, earned: earned.has(d.id) })));
    setNewStamp(s);
    setTimeout(() => setNewStamp(null), 3500);
  }, []);

  const dismissStamp = useCallback(() => setNewStamp(null), []);

  return { stamps, newStamp, earn, dismissStamp, reload: load };
}

export async function trackArticleRead(earn: (id: StampId) => Promise<void>) {
  const count = await incrementReadCount();
  if (count >= 1) await earn("primera-lectura");
  if (count >= 3) await earn("explorador");
  if (count >= 7) await earn("conocedor");
  const hour = new Date().getHours();
  if (hour < 9) await earn("madrugador");
}

export async function trackSaved(earn: (id: StampId) => Promise<void>) {
  await earn("guardado");
}

export async function trackMomentoViewed(earn: (id: StampId) => Promise<void>) {
  await earn("momentos");
}

export async function trackRsvp(earn: (id: StampId) => Promise<void>) {
  await earn("agenda");
}

export async function trackRuta(earn: (id: StampId) => Promise<void>) {
  await earn("ruta");
}