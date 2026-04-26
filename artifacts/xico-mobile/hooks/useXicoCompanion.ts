import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { XICO_LEVELS, getXicoLevel, calculatePoints } from "./usePassport";

const COMPANION_NAME_KEY = "xico_companion_name";

const NOMBRES_MAYAS = [
  "Ixchel", "Kukulcán", "Itzamná", "Chaac", "Hunahpú", "Xbalanqué",
  "Ek Balam", "Hunab", "Bacab", "Xoc", "Camazotz", "Tepeu",
  "Ixmucané", "Ixpiyacoc", "Vucub", "Bolon", "Zipacná", "Cabrakan",
];

const FRASES_DIARIAS: Record<string, string[]> = {
  Semilla: [
    "Hoy, lo que buscas ya empezó a buscarte.",
    "La raíz no se ve, pero es lo que sostiene.",
    "Todo comienzo guarda en sí el final.",
    "El silencio antes de la música también es música.",
    "No hace falta estar listo. Solo presente.",
    "Hay saberes que vienen antes del lenguaje.",
    "Una semilla no sabe que será árbol. Y eso está bien.",
  ],
  Guardián: [
    "Lo que proteges te define tanto como lo que persigues.",
    "El cuidado también es una forma de poder.",
    "Hoy cuida algo que vale la pena cuidar.",
    "No todo lo que se pierde, se olvida.",
    "La memoria más honda es la del cuerpo.",
    "Guardar es un acto de amor disfrazado de orden.",
    "Tu criterio es la mejor brújula que tienes.",
  ],
  Anciano: [
    "Caminar es una forma de pensar.",
    "Lo que escondes de ti mismo, el arte lo nombra.",
    "Este día es un texto que solo tú escribes.",
    "La experiencia no pesa. Ilumina.",
    "Saber esperar es también un talento.",
    "Lo que guardas dentro es lo que das afuera.",
    "El tiempo que diste a algo, te lo devuelve distinto.",
  ],
  Supremo: [
    "Eres la suma de todo lo que elegiste atender.",
    "El supremo no llega: reconoce que ya estuvo aquí.",
    "Lo extraordinario vive en la precisión de lo cotidiano.",
    "Hoy, tu presencia es suficiente argumento.",
    "La grandeza no grita. Permanece.",
    "Desde aquí la vista es otra. Úsala.",
    "El mundo necesita personas que ya saben quiénes son.",
  ],
};

function seedFromDate(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getDailyFrase(levelName: string, seed: number): string {
  const phrases = FRASES_DIARIAS[levelName] ?? FRASES_DIARIAS.Semilla;
  const idx = Math.floor(seededRandom(seed) * phrases.length);
  return phrases[idx];
}

export function useXicoCompanion(pts: number, streak: number) {
  const [companionName, setCompanionName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let name = await AsyncStorage.getItem(COMPANION_NAME_KEY);
      if (!name) {
        const idx = Math.floor(Math.random() * NOMBRES_MAYAS.length);
        name = NOMBRES_MAYAS[idx];
        await AsyncStorage.setItem(COMPANION_NAME_KEY, name);
      }
      setCompanionName(name);
    })();
  }, []);

  const level = getXicoLevel(pts);
  const today = new Date();
  const seed = seedFromDate(today);
  const dailyFrase = getDailyFrase(level.nombre, seed);

  return { companionName, level, dailyFrase };
}

