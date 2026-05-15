import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { getImage } from "@/constants/imageMap";
import { INTERESTS } from "@/constants/interests";

const INTEREST_IMAGE: Record<string, string> = {
  "Arte Contemporáneo": "arte-contemporaneo",
  "Arte Mesoamericano": "arte-mesoamerica",
  "Fotografía y Memoria": "photo-editorial",
  "Gastronomía": "gastronomia-fina",
  "Arte Popular y Artesanía": "artesania-mexicana",
  "Cine y Literatura": "cine-film",
  "Artes Escénicas": "teatro-luces",
  "Diseño e Identidad": "tela-colores",
};

const MAX_SELECT = 4;

function InterestButton({
  id,
  colorHex,
  isSelected,
  isDisabled,
  onPress,
}: {
  id: string;
  colorHex: string;
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(anim, { toValue: isSelected ? 1 : 0, duration: 280, useNativeDriver: false }).start();
  }, [isSelected]);

  const img = getImage(INTEREST_IMAGE[id] ?? "gastronomia-fina");

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled && !isSelected}
      style={({ pressed }) => [{ opacity: isDisabled && !isSelected ? 0.22 : pressed ? 0.78 : 1 }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isDisabled && !isSelected }}
      accessibilityLabel={`${id}${isSelected ? ", seleccionado" : isDisabled ? ", máximo alcanzado" : ""}`}
      accessibilityHint={isSelected ? "Toca para quitar este interés" : "Toca para añadir este interés"}
    >
      <Animated.View style={[ob.btn, {
        borderColor: anim.interpolate({ inputRange: [0, 1], outputRange: ["rgba(255,255,255,0.08)", colorHex] }),
        borderWidth: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) as any,
      }]}>
        <ImageBackground source={img} style={StyleSheet.absoluteFill} resizeMode="cover">
          <LinearGradient
            colors={["rgba(8,5,8,0.75)", "rgba(8,5,8,0.30)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {isSelected && (
            <Animated.View style={[StyleSheet.absoluteFill, {
              backgroundColor: colorHex,
              opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
            }]} />
          )}
        </ImageBackground>
        <View style={ob.btnInner}>
          <View style={[ob.dot, {
            backgroundColor: isSelected ? colorHex : "transparent",
            borderColor: isSelected ? colorHex : "rgba(255,255,255,0.35)",
          }]} />
          <Text style={[ob.btnLabel, isSelected && { color: "#fff" }]}>{id}</Text>
          {isSelected && <Text style={[ob.checkMark, { color: colorHex }]}>✓</Text>}
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < MAX_SELECT) {
      setSelected([...selected, id]);
    }
  };

  const isReady = selected.length >= 2;

  const handleContinue = async () => {
    if (!isReady) return;
    await AsyncStorage.setItem("xico_onboarding_done", "1");
    await AsyncStorage.setItem("xico_interests", JSON.stringify(selected));
    // Sync interests to Supabase profile.
    // DRY · 2026-05-15 (Agent D · diagnostic-code.md §G-4): the inline
    // "fetch session, conditionally attach bearer" used to live here too ·
    // now hits the shared `getAuthHeaders()` helper. When the user is
    // anonymous, `getAuthHeaders()` returns `{}` and the fetch goes out
    // without an Authorization header · the api-server's `/api/profile`
    // PATCH 401s in that case, which the outer try/catch swallows (consistent
    // with the previous behavior where the `if (session?.access_token)`
    // guard simply skipped the call).
    try {
      const { API_BASE, getAuthHeaders } = await import("@/constants/api");
      const authHeaders = await getAuthHeaders();
      if (authHeaders.Authorization) {
        await fetch(`${API_BASE}/api/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ interests: selected }),
        });
      }
    } catch (_) {}
    router.replace("/(tabs)");
  };

  return (
    <View style={[ob.container, { paddingTop: topPad }]}>
      <ScrollView
        contentContainerStyle={[ob.scroll, { paddingBottom: bottomPad + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={ob.header}>
          <Text style={ob.eyebrow}>XICO · MADRID</Text>
          <Text style={ob.title}>Tu lectura,{"\n"}<Text style={ob.titleItalic}>tu criterio.</Text></Text>
          <View style={ob.divider} />
          <Text style={ob.subtitle}>Elige de dos a cuatro áreas. Tu catálogo se construye alrededor de lo que te importa.</Text>
        </View>

        <View style={ob.list}>
          {INTERESTS.map((item) => {
            const isOn = selected.includes(item.id);
            const isDisabled = !isOn && selected.length >= MAX_SELECT;
            return (
              <InterestButton
                key={item.id}
                id={item.id}
                colorHex={item.colorHex}
                isSelected={isOn}
                isDisabled={isDisabled}
                onPress={() => toggle(item.id)}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={[ob.footer, { paddingBottom: Math.max(bottomPad + 16, 32) }]}>
        <View style={ob.footerTop}>
          <Text style={ob.counter}>
            {selected.length} de {MAX_SELECT}
          </Text>
          <View style={ob.dots}>
            {Array.from({ length: MAX_SELECT }).map((_, i) => (
              <View key={i} style={[ob.dotIndicator, i < selected.length && ob.dotIndicatorActive]} />
            ))}
          </View>
        </View>
        <Pressable
          onPress={handleContinue}
          disabled={!isReady}
          style={({ pressed }) => [ob.cta, !isReady && ob.ctaDisabled, pressed && isReady && { opacity: 0.8 }]}
        >
          <Text style={[ob.ctaText, !isReady && ob.ctaTextDisabled]}>
            {isReady ? "Abrir la edición →" : `Elige ${Math.max(0, 2 - selected.length)} más`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const ob = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingTop: 8 },
  header: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 32 },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    // 8pt → 11pt (Apple HIG floor for persistent labels)
    fontSize: 11,
    letterSpacing: 2.5,
    color: Colors.primary,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  title: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 46,
    lineHeight: 52,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  titleItalic: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    color: "rgba(255,255,255,0.45)",
  },
  divider: { width: 32, height: 1.5, backgroundColor: Colors.primary, marginBottom: 20 },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 21,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.1,
  },
  list: { gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  btn: {
    height: 84,
    overflow: "hidden",
    justifyContent: "center",
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, flexShrink: 0 },
  btnLabel: {
    fontFamily: "Newsreader_500Medium",
    fontSize: 21,
    color: "rgba(255,255,255,0.82)",
    flex: 1,
  },
  checkMark: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  footerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  counter: {
    fontFamily: "Inter_400Regular",
    // 9pt → 11pt (Apple HIG floor)
    fontSize: 11,
    letterSpacing: 1.5,
    color: Colors.textTertiary,
  },
  dots: { flexDirection: "row", gap: 6 },
  dotIndicator: { width: 16, height: 2, backgroundColor: "rgba(255,255,255,0.12)" },
  dotIndicatorActive: { backgroundColor: Colors.primary },
  cta: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  ctaDisabled: { backgroundColor: "rgba(255,255,255,0.04)" },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 2.5,
    color: "#fff",
    textTransform: "uppercase",
  },
  ctaTextDisabled: { color: "rgba(255,255,255,0.2)" },
});