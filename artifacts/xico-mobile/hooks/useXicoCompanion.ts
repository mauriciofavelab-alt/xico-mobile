import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { getXicoLevel } from "./usePassport";
import { fetchJson } from "@/constants/api";

const COMPANION_NAME_KEY = "xico_companion_name";
const COMPANION_CACHE_KEY = `xico_companion_${new Date().toISOString().slice(0, 10)}`;

const NOMBRES_MAYAS = [
  "Ixchel", "Kukulcán", "Itzamná", "Chaac", "Hunahpú", "Xbalanqué",
  "Ek Balam", "Hunab", "Bacab", "Xoc", "Camazotz", "Tepeu",
  "Ixmucané", "Ixpiyacoc", "Vucub", "Bolon", "Zipacná", "Cabrakan",
];

type CompanionResponse = {
  phrase: string;
  level: string;
  narration_style: string;
};

export function useXicoCompanion(pts: number, streak: number) {
  const [companionName, setCompanionName] = useState<string | null>(null);
  const [dailyFrase, setDailyFrase] = useState<string>("");

  useEffect(() => {
    (async () => {
      // Companion name — assigned once, persisted forever
      let name = await AsyncStorage.getItem(COMPANION_NAME_KEY);
      if (!name) {
        const idx = Math.floor(Math.random() * NOMBRES_MAYAS.length);
        name = NOMBRES_MAYAS[idx];
        await AsyncStorage.setItem(COMPANION_NAME_KEY, name);
      }
      setCompanionName(name);

      // Daily phrase — cached per day, fetched from API
      const cached = await AsyncStorage.getItem(COMPANION_CACHE_KEY);
      if (cached) {
        setDailyFrase(JSON.parse(cached).phrase ?? "");
        return;
      }

      try {
        const data = await fetchJson<CompanionResponse>("/api/companion");
        setDailyFrase(data.phrase);
        await AsyncStorage.setItem(COMPANION_CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem("xico_narration_style", data.narration_style);
      } catch {
        try {
          const data = await fetchJson<CompanionResponse>("/api/companion/public");
          setDailyFrase(data.phrase);
          await AsyncStorage.setItem(COMPANION_CACHE_KEY, JSON.stringify(data));
        } catch {
          // Stay empty — no hardcoded fallback
        }
      }
    })();
  }, []);

  const level = getXicoLevel(pts);

  return { companionName, level, dailyFrase };
}
