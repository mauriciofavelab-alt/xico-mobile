import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

const KEY_LAST = "xico_last_visit";
const KEY_STREAK = "xico_streak";
const KEY_TOTAL = "xico_total_days";

export function useStreak() {
  const [streak, setStreak] = useState(1);
  const [totalDays, setTotalDays] = useState(1);

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const last = await AsyncStorage.getItem(KEY_LAST);
      const savedStr = await AsyncStorage.getItem(KEY_STREAK);
      const totalStr = await AsyncStorage.getItem(KEY_TOTAL);
      const saved = parseInt(savedStr ?? "0", 10);
      const total = parseInt(totalStr ?? "0", 10);

      if (!last) {
        await AsyncStorage.setItem(KEY_LAST, today);
        await AsyncStorage.setItem(KEY_STREAK, "1");
        await AsyncStorage.setItem(KEY_TOTAL, "1");
        setStreak(1);
        setTotalDays(1);
        return;
      }

      const lastDate = new Date(last);
      const todayDate = new Date(today);
      const diff = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);

      if (diff === 0) {
        setStreak(saved || 1);
        setTotalDays(total || 1);
      } else if (diff === 1) {
        const newStreak = (saved || 1) + 1;
        const newTotal = (total || 1) + 1;
        await AsyncStorage.setItem(KEY_LAST, today);
        await AsyncStorage.setItem(KEY_STREAK, String(newStreak));
        await AsyncStorage.setItem(KEY_TOTAL, String(newTotal));
        setStreak(newStreak);
        setTotalDays(newTotal);
      } else {
        const newTotal = (total || 1) + 1;
        await AsyncStorage.setItem(KEY_LAST, today);
        await AsyncStorage.setItem(KEY_STREAK, "1");
        await AsyncStorage.setItem(KEY_TOTAL, String(newTotal));
        setStreak(1);
        setTotalDays(newTotal);
      }
    })();
  }, []);

  return { streak, totalDays };
}

