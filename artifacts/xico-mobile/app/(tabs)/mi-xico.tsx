import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XicoAvatar } from "@/components/XicoAvatar";
import { GlifoMaya } from "@/components/GlifoMaya";
import { LeafletMap } from "@/components/LeafletMap";
import { StampNotification } from "@/components/StampNotification";
import { Colors, getAccentColor } from "@/constants/colors";
import { getImage } from "@/constants/imageMap";
import { INTERESTS } from "@/constants/interests";
import { fetchJson, API_BASE } from "@/constants/api";
import { usePassport, XICO_LEVELS, DEFINITIONS, calculatePoints, trackMomentoViewed, trackRsvp, trackRuta, getXicoLevel, getXicoAge, type XicoLevel } from "@/hooks/usePassport";
import { useXicoCompanion } from "@/hooks/useXicoCompanion";
import { useStreak } from "@/hooks/useStreak";
import { useUserCriterion } from "@/hooks/useUserCriterion";
import { useAuth } from "@/context/AuthContext";

type TabKey = "mi-lectura" | "mapa" | "agenda" | "guardados";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "mi-lectura", label: "Mi lectura" },
  { key: "mapa",       label: "Mapa" },
  { key: "agenda",     label: "Agenda" },
  { key: "guardados",  label: "Guardados" },
];

const INTEREST_LABELS: Record<string, string> = Object.fromEntries(
  INTERESTS.map(i => [i.id, i.id])
);

const SELLO_NUM: Record<string, string> = {
  "primera-lectura": "I",
  "explorador":      "II",
  "conocedor":       "III",
  "momentos":        "IV",
  "agenda":          "V",
  "ruta":            "VI",
  "guardado":        "VII",
  "madrugador":      "VIII",
  "despacho":        "IX",
};

type SelloDef = { id: string; titulo: string; descripcion: string; color: string; pts: number };

// SELLO BLOQUEADO — papel antiguo, grises, textura
// SELLO DESBLOQUEADO — color saturado del brandbook
function LoteriaSello({ def, earned }: { def: SelloDef; earned: boolean }) {
  const color = def.color;
  const num = SELLO_NUM[def.id] ?? "·";
  const W = 118;

  if (!earned) {
    return (
      <View style={{ width: W, borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", backgroundColor: "#0b080a" }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 11, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.04)" }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 5.5, letterSpacing: 2.5, color: "rgba(255,255,255,0.18)", textTransform: "uppercase" }}>XICO</Text>
          <Text style={{ fontFamily: "Newsreader_600SemiBold", fontSize: 10, color: "rgba(255,255,255,0.12)" }}>{num}</Text>
        </View>
        <View style={{ height: 104, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}>
            <GlifoMaya id={def.id} size={32} color="#ffffff" opacity={0.12} />
          </View>
        </View>
        <View style={{ paddingVertical: 9, paddingHorizontal: 9, alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.04)" }}>
          <Text numberOfLines={1} style={{ fontFamily: "Inter_700Bold", fontSize: 6.5, letterSpacing: 2, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", textAlign: "center" }}>{def.titulo}</Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 5, color: "rgba(255,255,255,0.12)", marginTop: 2, letterSpacing: 0.5 }}>+{def.pts} pts</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{
      width: W,
      shadowColor: color,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.55,
      shadowRadius: 20,
      elevation: 14,
    }}>
      <LinearGradient
        colors={[color, `${color}DD`, `${color}55`, "#060106"]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ borderWidth: 1.5, borderColor: color, overflow: "hidden" }}
      >
        <View style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" }} pointerEvents="none" />
        <View style={{ position: "absolute", top: 3, left: 3, width: 10, height: 10, borderTopWidth: 2, borderLeftWidth: 2, borderColor: "rgba(255,255,255,0.55)" }} pointerEvents="none" />
        <View style={{ position: "absolute", top: 3, right: 3, width: 10, height: 10, borderTopWidth: 2, borderRightWidth: 2, borderColor: "rgba(255,255,255,0.55)" }} pointerEvents="none" />
        <View style={{ position: "absolute", bottom: 3, left: 3, width: 10, height: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: "rgba(255,255,255,0.55)" }} pointerEvents="none" />
        <View style={{ position: "absolute", bottom: 3, right: 3, width: 10, height: 10, borderBottomWidth: 2, borderRightWidth: 2, borderColor: "rgba(255,255,255,0.55)" }} pointerEvents="none" />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 13, paddingVertical: 9 }}>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: 5.5, letterSpacing: 3, color: "rgba(255,255,255,0.85)", textTransform: "uppercase" }}>XICO</Text>
          <Text style={{ fontFamily: "Newsreader_600SemiBold", fontSize: 13, color: "rgba(255,255,255,0.95)" }}>{num}</Text>
        </View>

        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.28)", marginHorizontal: 13 }} />

        <View style={{ height: 108, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: 74, height: 74, borderRadius: 37, borderWidth: 1, borderColor: "rgba(255,255,255,0.28)", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.22)" }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" }}>
              <GlifoMaya id={def.id} size={34} color="#ffffff" />
            </View>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.28)", marginHorizontal: 13 }} />

        <View style={{ paddingVertical: 10, paddingHorizontal: 10, alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <Text numberOfLines={1} style={{ fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 2.5, color: "#fff", textTransform: "uppercase", textAlign: "center" }}>{def.titulo}</Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: 5.5, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5, marginTop: 3 }}>+{def.pts} pts</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

type Article = {
  id: string; pillar: string; type: string; subcategory: string;
  title: string; subtitle: string; author: string; institution: string;
  imageKey: string; readTime: string; accentColor: string; date: string; featured: boolean;
  hero_image_url?: string; read_time_minutes?: number;
};

type Momento = {
  id: string; imageKey: string; category: string; headline: string; caption: string; accentColor: string; image_url?: string;
};

type RutaStop = { order: number; name: string; address: string; description: string; category: string; accentColor: string; imageKey?: string };
type Ruta = { title: string; subtitle: string; month: string; stops: RutaStop[] };

type Spot = {
  id: string; name: string; type: string; description: string;
  address: string; lat: number; lng: number; copil: boolean; accentColor: string;
};

type EventItem = {
  id: string; title: string; date: string; time: string; venue: string;
  description: string; category: string; price: string; accentColor: string; voy: boolean;
};

const STOP_COLOR: Record<string, string> = {
  comida: Colors.magenta, cultura: Colors.cobalt, paseo: "#1a4a1a",
  mezcal: Colors.ochre, evento: Colors.magenta,
};

// ─── PASAPORTE — estampa oficial sin sellos ───────────────────────────────────
function PassportSection({ stamps, streak, companionName }: {
  stamps: ReturnType<typeof usePassport>["stamps"];
  streak: number;
  companionName: string | null;
}) {
  const [xicoAge, setXicoAge] = useState(1);
  useEffect(() => { getXicoAge().then(setXicoAge); }, []);

  const earned = new Set(stamps.filter(s => s.earned).map(s => s.id));
  const pts = calculatePoints(earned as any, streak);
  const level = [...XICO_LEVELS].reverse().find(l => pts >= l.minPts) ?? XICO_LEVELS[0];
  const nextLevel = XICO_LEVELS.find(l => l.minPts > pts);
  const progress = nextLevel ? ((pts - level.minPts) / (nextLevel.minPts - level.minPts)) * 100 : 100;

  return (
    <View style={pp.wrap}>
      <View style={pp.passport}>
        <View style={pp.passportLeft}>
          <Text style={pp.passportEye}>PASAPORTE · VOLUMEN {level.folio}</Text>
          <Text style={[pp.levelName, { color: level.color }]}>{level.nombre}</Text>
          <Text style={pp.levelDesc}>{level.descripcion}</Text>

          <View style={pp.ageRow}>
            <View style={pp.ageItem}>
              <Text style={pp.ageNum}>{xicoAge}</Text>
              <Text style={pp.ageLabel}>día{xicoAge === 1 ? "" : "s"} con XICO</Text>
            </View>
            <View style={pp.ageDivider} />
            <View style={pp.ageItem}>
              <Text style={pp.ageNum}>{streak}</Text>
              <Text style={pp.ageLabel}>racha actual</Text>
            </View>
            <View style={pp.ageDivider} />
            <View style={pp.ageItem}>
              <Text style={pp.ageNum}>{earned.size}</Text>
              <Text style={pp.ageLabel}>sellos</Text>
            </View>
          </View>

          <View style={pp.progressWrap}>
            <View style={pp.progressBg}>
              <View style={[pp.progressFill, { width: `${Math.min(progress, 100)}%` as any, backgroundColor: level.color }]} />
            </View>
            {nextLevel && <Text style={pp.progressLabel}>{nextLevel.minPts - pts} pts para {nextLevel.nombre}</Text>}
          </View>
        </View>

        <View style={pp.passportRight}>
          <XicoAvatar level={getXicoLevel(pts)} size={64} />
          <View style={[pp.ptsStamp, { borderColor: level.color, marginTop: 12 }]}>
            <Text style={pp.ptsStampLabel}>PTS</Text>
            <Text style={[pp.ptsStampNum, { color: level.color }]}>{pts}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── CRITERIO — Spotify Wrapped permanente ────────────────────────────────────
function CriterionSection() {
  const criteria = useUserCriterion();

  return (
    <View style={cr.wrap}>
      <View style={cr.labelRow}>
        <View style={cr.line} />
        <Text style={cr.labelText}>TU CRITERIO</Text>
        <View style={cr.line} />
      </View>
      {criteria.length === 0 ? (
        <View style={cr.emptyCard}>
          <Text style={cr.emptyTitle}>Tu criterio se forma leyendo.</Text>
          <Text style={cr.emptyDetail}>Cada artículo construye tu perfil editorial.</Text>
        </View>
      ) : (
        <View style={cr.cards}>
          {criteria.map((c, i) => (
            <View key={i} style={[cr.card, i > 0 && { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)" }]}>
              <Text style={cr.headline}>{c.headline}</Text>
              <Text style={cr.detail}>{c.detail}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const cr = StyleSheet.create({
  wrap: { marginBottom: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  labelText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.3)" },
  cards: {
    marginHorizontal: 16,
    backgroundColor: "#0e0a0c",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  card: { paddingHorizontal: 20, paddingVertical: 18 },
  headline: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 22, lineHeight: 26,
    color: "#f0ece6", marginBottom: 4,
  },
  detail: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic", fontSize: 14, lineHeight: 20,
    color: "rgba(255,255,255,0.5)",
  },
  emptyCard: {
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "#0e0a0c",
  },
  emptyTitle: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 20, lineHeight: 24,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 6,
  },
  emptyDetail: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 13, lineHeight: 19,
    color: "rgba(255,255,255,0.22)",
  },
});

// ─── SELLOS — bloque independiente ────────────────────────────────────────────
function SellosSection({ stamps }: { stamps: ReturnType<typeof usePassport>["stamps"] }) {
  const earned = new Set(stamps.filter(s => s.earned).map(s => s.id));
  return (
    <View style={{ marginBottom: 4 }}>
      <View style={pp.sellosLabel}>
        <View style={pp.sellosLine} />
        <Text style={pp.sellosEye}>SELLOS · COLECCIÓN</Text>
        <View style={pp.sellosLine} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={pp.stampsScroll}
      >
        {DEFINITIONS.map(def => {
          const e = earned.has(def.id as any);
          return <LoteriaSello key={def.id} def={def} earned={e} />;
        })}
      </ScrollView>
    </View>
  );
}

const pp = StyleSheet.create({
  wrap: { marginBottom: 4 },
  passport: {
    flexDirection: "row",
    backgroundColor: "#0e0a0c",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    padding: 20,
    gap: 16,
  },
  passportLeft: { flex: 1 },
  passportRight: { alignItems: "center", justifyContent: "flex-start" },
  passportEye: {
    fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 3,
    color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 10,
  },
  levelName: {
    fontFamily: "Newsreader_600SemiBold", fontSize: 34,
    lineHeight: 38, marginBottom: 2,
  },
  levelDesc: {
    fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic",
    fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 18,
  },
  ageRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
    borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  ageItem: { flex: 1, alignItems: "flex-start" },
  ageDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.08)", marginHorizontal: 10 },
  ageNum: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 24, color: "#f0ece6", lineHeight: 26,
  },
  ageLabel: {
    fontFamily: "Inter_400Regular", fontSize: 8,
    color: "rgba(255,255,255,0.3)", letterSpacing: 1,
    textTransform: "uppercase", marginTop: 2,
  },
  progressWrap: {},
  progressBg: { height: 2, backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 6 },
  progressFill: { height: 2 },
  progressLabel: { fontFamily: "Inter_400Regular", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5 },
  ptsStamp: {
    width: 78, height: 78, borderRadius: 39,
    borderWidth: 2, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  ptsStampLabel: {
    fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 2,
    color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
  },
  ptsStampNum: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 28, lineHeight: 32,
  },
  sellosLabel: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 16, gap: 12,
  },
  sellosLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  sellosEye: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.3)" },
  stampsScroll: { paddingHorizontal: 16, gap: 10, paddingBottom: 24, paddingTop: 4 },
});

// ─── MOMENTOS ─────────────────────────────────────────────────────────────────
function MomentosInTab({ earn }: { earn: (id: any) => Promise<void> }) {
  const { data: momentos = [] } = useQuery<Momento[]>({
    queryKey: ["momentos"],
    queryFn: () => fetchJson<Momento[]>("/api/momentos"),
  });
  const [storyIndex, setStoryIndex] = useState<number | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (storyIndex === null) return;
    progress.setValue(0);
    Animated.timing(progress, { toValue: 1, duration: 5000, useNativeDriver: false }).start(({ finished }) => {
      if (!finished) return;
      if (storyIndex < momentos.length - 1) setStoryIndex(i => i! + 1);
      else setStoryIndex(null);
    });
    return () => progress.stopAnimation();
  }, [storyIndex]);

  if (momentos.length === 0) return null;

  const openStory = async (i: number) => {
    await trackMomentoViewed(earn);
    setStoryIndex(i);
  };

  const m = storyIndex !== null ? momentos[storyIndex] : null;
  const accent = m ? getAccentColor(m.accentColor) : Colors.magenta;

  const getMomentoImg = (momento: Momento) => {
    if (momento.image_url) return { uri: momento.image_url };
    return getImage(momento.imageKey);
  };

  return (
    <View style={{ marginBottom: 4 }}>
      <View style={ms.labelRow}>
        <View style={ms.line} />
        <Text style={ms.labelText}>MOMENTOS</Text>
        <View style={ms.line} />
        <Text style={ms.labelRight}>Flash cultural</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 20 }}>
        {momentos.map((m, i) => {
          const img = getMomentoImg(m);
          const ac = getAccentColor(m.accentColor);
          return (
            <Pressable key={m.id} onPress={() => openStory(i)} style={({ pressed }) => [ms.bubble, pressed && { opacity: 0.82 }]}>
              <View style={[ms.bubbleCard, { borderColor: `${ac}55` }]}>
                <Image source={img} style={StyleSheet.absoluteFill as any} resizeMode="cover" />
                <LinearGradient colors={["transparent", "rgba(0,0,0,0.78)"]} style={StyleSheet.absoluteFill} />
                <View style={ms.bubbleBottom}>
                  <View style={[ms.bubbleLine, { backgroundColor: ac }]} />
                </View>
              </View>
              <Text style={ms.bubbleCat} numberOfLines={1}>{m.category}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Modal visible={storyIndex !== null} animationType="fade" statusBarTranslucent onRequestClose={() => setStoryIndex(null)}>
        {m && (
          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <ImageBackground source={getMomentoImg(m)} style={{ flex: 1 }} resizeMode="cover">
              <LinearGradient colors={["rgba(0,0,0,0.5)", "transparent", "transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
              <View style={[ms.storyTop, { paddingTop: insets.top + 8 }]}>
                <View style={ms.bars}>
                  {momentos.map((_, i) => (
                    <View key={i} style={ms.barBg}>
                      <Animated.View style={[ms.barFill, { backgroundColor: accent, width: i === storyIndex ? progress.interpolate({ inputRange: [0,1], outputRange: ["0%","100%"] }) : i < storyIndex! ? "100%" : "0%" }]} />
                    </View>
                  ))}
                </View>
                <Pressable onPress={() => setStoryIndex(null)} style={ms.closeBtn}>
                  <Text style={ms.closeX}>✕</Text>
                </Pressable>
              </View>
              <View style={ms.tapArea}>
                <Pressable style={{ flex: 1 }} onPress={() => storyIndex! > 0 ? setStoryIndex(i => i! - 1) : setStoryIndex(null)} />
                <Pressable style={{ flex: 1 }} onPress={() => storyIndex! < momentos.length - 1 ? setStoryIndex(i => i! + 1) : setStoryIndex(null)} />
              </View>
              <View style={[ms.storyBottom, { paddingBottom: insets.bottom + 24 }]}>
                <View style={[ms.accentLine, { backgroundColor: accent }]} />
                <Text style={[ms.storyCat, { color: accent }]}>{m.category.toUpperCase()}</Text>
                <Text style={ms.storyHeadline}>{m.headline}</Text>
                <Text style={ms.storyCaption}>{m.caption}</Text>
              </View>
            </ImageBackground>
          </View>
        )}
      </Modal>
    </View>
  );
}

const ms = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  labelText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: Colors.textTertiary },
  labelRight: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.textTertiary },
  bubble: { width: 82 },
  bubbleCard: { width: 82, height: 116, overflow: "hidden", borderWidth: 1, marginBottom: 8, position: "relative" },
  bubbleBottom: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 },
  bubbleLine: { width: 18, height: 2 },
  bubbleCat: { fontFamily: "Inter_500Medium", fontSize: 8, letterSpacing: 1, color: Colors.textTertiary, textTransform: "uppercase" },
  storyTop: { paddingHorizontal: 16, paddingBottom: 8 },
  bars: { flexDirection: "row", gap: 4, marginBottom: 8 },
  barBg: { flex: 1, height: 2, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" },
  barFill: { height: 2 },
  closeBtn: { position: "absolute", top: 0, right: 16, padding: 8 },
  closeX: { fontSize: 18, color: "#fff" },
  tapArea: { flex: 1, flexDirection: "row" },
  storyBottom: { paddingHorizontal: 20 },
  accentLine: { width: 28, height: 2, marginBottom: 12 },
  storyCat: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 },
  storyHeadline: { fontFamily: "Newsreader_600SemiBold", fontSize: 32, lineHeight: 36, color: "#fff", marginBottom: 8 },
  storyCaption: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 16, lineHeight: 24, color: "rgba(255,255,255,0.8)" },
});

// ─── RUTA ─────────────────────────────────────────────────────────────────────
function RutaSection({ earn }: { earn: (id: any) => Promise<void> }) {
  const { data: ruta } = useQuery<Ruta>({
    queryKey: ["ruta"],
    queryFn: () => fetchJson<Ruta>("/api/ruta"),
  });
  const [expanded, setExpanded] = useState(false);

  if (!ruta) return null;

  const stops = expanded ? ruta.stops : ruta.stops.slice(0, 2);

  return (
    <View style={{ marginBottom: 4 }}>
      <View style={ru.labelRow}>
        <View style={ru.line} />
        <Text style={ru.labelText}>RUTA DEL FIN DE SEMANA</Text>
        <View style={ru.line} />
      </View>
      <View style={ru.card}>
        <View style={ru.top}>
          <Text style={ru.date}>{ruta.month?.toUpperCase()}</Text>
          <Text style={ru.title}>{ruta.title}</Text>
          <Text style={ru.sub}>{ruta.subtitle}</Text>
        </View>
        <View style={ru.timeline}>
          {stops.map((stop, i) => {
            const color = STOP_COLOR[stop.category?.toLowerCase() ?? ""] ?? getAccentColor(stop.accentColor);
            const isLast = i === stops.length - 1;
            const img = stop.imageKey ? getImage(stop.imageKey) : null;
            return (
              <View key={i} style={ru.stopRow}>
                <View style={ru.timelineLeft}>
                  {(stop as any).time && (
                    <Text style={[ru.stopTime, { color }]}>{(stop as any).time}</Text>
                  )}
                  <View style={ru.dotWrap}>
                    <View style={[ru.dot, { backgroundColor: color }]} />
                    {!isLast && <View style={[ru.connector, { backgroundColor: `${color}40` }]} />}
                  </View>
                </View>
                <View style={[ru.stopContent, !isLast && { paddingBottom: 24 }]}>
                  {img && <Image source={img} style={[ru.stopImg, { borderLeftColor: color }]} resizeMode="cover" />}
                  <View style={ru.stopBody}>
                    <Text style={[ru.stopCat, { color }]}>{stop.category?.toUpperCase()}</Text>
                    <Text style={ru.stopTitle}>{stop.name}</Text>
                    <Text style={ru.stopAddr}>{stop.address}</Text>
                    <Text style={ru.stopDesc} numberOfLines={2}>{stop.description}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        {ruta.stops.length > 2 && (
          <Pressable
            onPress={() => {
              if (!expanded) trackRuta(earn);
              setExpanded(!expanded);
            }}
            style={ru.expandBtn}
          >
            <Text style={ru.expandText}>{expanded ? "Ver menos ↑" : `Ver las ${ruta.stops.length - 2} paradas restantes →`}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const ru = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  labelText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: Colors.textTertiary },
  card: { marginHorizontal: 16, backgroundColor: "#0e0a0c", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 8, overflow: "hidden" },
  top: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  date: { fontFamily: "Inter_400Regular", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 2, marginBottom: 4 },
  title: { fontFamily: "Newsreader_600SemiBold", fontSize: 24, lineHeight: 28, color: "#fff", marginBottom: 4 },
  sub: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.4)" },
  timeline: { paddingTop: 20, paddingLeft: 16, paddingRight: 16 },
  stopRow: { flexDirection: "row", gap: 12 },
  timelineLeft: { alignItems: "center", width: 48 },
  stopTime: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 0.5, marginBottom: 8 },
  dotWrap: { alignItems: "center", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  connector: { width: 2, flex: 1, minHeight: 20, marginTop: 4 },
  stopContent: { flex: 1, paddingBottom: 8 },
  stopImg: { width: "100%", height: 100, borderLeftWidth: 3, marginBottom: 10 },
  stopBody: { gap: 2 },
  stopCat: { fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 2, marginBottom: 2 },
  stopTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#fff", lineHeight: 19, marginBottom: 2 },
  stopAddr: { fontFamily: "Inter_400Regular", fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 0.3, marginBottom: 4 },
  stopDesc: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.5)" },
  expandBtn: { alignItems: "center", padding: 14, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  expandText: { fontFamily: "Inter_400Regular", fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" },
});

// ─── RECOMENDACIONES ──────────────────────────────────────────────────────────
function RecomendacionesSection({ interests }: { interests: string[] }) {
  const INTEREST_TO_SUB: Record<string, string | string[]> = {
    "Arte Contemporáneo": ["Artes Visuales", "artes-visuales"],
    "Arte Mesoamericano": ["Artes Visuales", "artes-visuales"],
    "Fotografía y Memoria": ["Fotografía", "fotografia"],
    "Gastronomía": ["Gastronomía", "gastronomia"],
    "Arte Popular y Artesanía": ["Arte Popular", "arte-popular"],
    "Cine y Literatura": ["Cine", "Literatura", "cine", "literatura"],
    "Artes Escénicas": ["Artes Escénicas", "artes-escenicas"],
    "Diseño e Identidad": ["Moda", "moda"],
  };

  const { data: allArticles = [] } = useQuery<Article[]>({
    queryKey: ["articles", "all"],
    queryFn: () => fetchJson<Article[]>("/api/articles"),
  });

  const subcats = interests.flatMap(i => {
    const m = INTEREST_TO_SUB[i];
    if (!m) return [];
    return Array.isArray(m) ? m : [m];
  });

  const recommended = subcats.length > 0
    ? allArticles.filter(a => subcats.includes(a.subcategory ?? "")).slice(0, 4)
    : [];

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={rc.labelRow}>
        <View style={rc.line} />
        <Text style={rc.labelText}>SEGÚN TU CRITERIO</Text>
        <View style={rc.line} />
      </View>
      {recommended.length === 0 ? (
        <View style={rc.empty}>
          <Text style={rc.emptyTitle}>Personaliza tus intereses</Text>
          <Text style={rc.emptySub}>Tus recomendaciones curadas aparecerán aquí.</Text>
        </View>
      ) : (
        recommended.map(art => {
          const img = getImage(art.hero_image_url ?? art.imageKey);
          const accent = getAccentColor(art.accentColor);
          return (
            <Pressable
              key={art.id}
              onPress={() => router.push(`/article/${art.id}` as any)}
              style={({ pressed }) => [rc.row, pressed && { opacity: 0.82 }]}
            >
              <Image source={img} style={rc.img} resizeMode="cover" />
              <View style={rc.body}>
                <View style={[rc.bar, { backgroundColor: accent }]} />
                <Text style={rc.type}>{(art.subcategory ?? art.type ?? "").toUpperCase()}</Text>
                <Text style={rc.title} numberOfLines={2}>{art.title}</Text>
                <Text style={rc.read}>{art.read_time_minutes ? `${art.read_time_minutes} min` : art.readTime}</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const rc = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  labelText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: Colors.textTertiary },
  empty: { paddingHorizontal: 16, paddingVertical: 24, borderWidth: 1, borderColor: Colors.border, marginHorizontal: 16 },
  emptyTitle: { fontFamily: "Newsreader_400Regular", fontSize: 20, color: Colors.textSecondary, marginBottom: 8 },
  emptySub: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textTertiary, fontStyle: "italic" },
  row: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, gap: 14, alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 16 },
  img: { width: 80, height: 108, backgroundColor: Colors.surfaceHigh },
  body: { flex: 1, gap: 3 },
  bar: { width: 22, height: 2, borderRadius: 1, marginBottom: 3 },
  type: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 2, color: Colors.textTertiary },
  title: { fontFamily: "Newsreader_600SemiBold", fontSize: 19, lineHeight: 23, color: Colors.textPrimary },
  read: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
});

// ─── MAPA ─────────────────────────────────────────────────────────────────────
type SpotFilter = "todos" | "restaurante" | "cultural" | "mezcal" | "galeria";
const FILTER_LABELS: Array<{ key: SpotFilter; label: string }> = [
  { key: "todos", label: "Todos" },
  { key: "restaurante", label: "Cocina" },
  { key: "cultural", label: "Cultural" },
  { key: "mezcal", label: "Mezcal" },
  { key: "galeria", label: "Galerías" },
];
const SPOT_COLOR: Record<string, string> = {
  restaurante: Colors.magenta, mezcal: Colors.ochre, cultural: Colors.cobalt,
  galeria: Colors.cobalt, tienda: "#1a4a1a",
};
const SPOT_TYPE_LABEL: Record<string, string> = {
  restaurante: "Restaurante", mezcal: "Mezcalería", cultural: "Espacio Cultural",
  galeria: "Galería", tienda: "Tienda",
};

function buildLeafletHTML(spots: Spot[]) {
  const colorMap: Record<string, string> = {
    restaurante: Colors.magenta, mezcal: Colors.ochre, cultural: Colors.cobalt,
    galeria: Colors.cobalt, tienda: "#1a4a1a",
  };
  const spotsJson = JSON.stringify(spots);
  const colorMapJson = JSON.stringify(colorMap);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{height:100%;background:#0a0a0a;overflow:hidden}
    #map{height:100vh}
    .leaflet-popup-content-wrapper{background:#141414;border:1px solid rgba(255,255,255,0.12);border-radius:0;box-shadow:none;color:#fff}
    .leaflet-popup-tip{background:#141414}
    .leaflet-popup-content{margin:10px 14px;font-family:sans-serif}
    .leaflet-popup-content b{font-size:12px;color:#fff;display:block;margin-bottom:4px}
    .leaflet-popup-content small{font-size:10px;color:rgba(255,255,255,0.4)}
    .leaflet-popup-content .badge{display:inline-block;font-size:9px;color:#CA8A04;letter-spacing:1px;margin-top:4px}
    .leaflet-control-attribution{display:none!important}
    .leaflet-control-zoom a{background:#141414!important;color:#fff!important;border-color:rgba(255,255,255,0.15)!important}
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var spots=${spotsJson};
    var colorMap=${colorMapJson};
    var map=L.map('map',{center:[40.416,-3.703],zoom:13,zoomControl:true,attributionControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{subdomains:'abcd',maxZoom:20}).addTo(map);
    spots.forEach(function(spot){
      if(!spot.lat||!spot.lng)return;
      var color=colorMap[spot.type]||'#9c1a47';
      var m=L.circleMarker([spot.lat,spot.lng],{
        radius:spot.copil?11:8,
        fillColor:color,
        color:spot.copil?'#FDE047':'rgba(255,255,255,0.7)',
        weight:spot.copil?2:1,
        opacity:1,
        fillOpacity:0.88
      }).addTo(map);
      var badge=spot.copil?'<span class="badge">✦ SELLO COPIL</span>':'';
      m.bindPopup('<b>'+spot.name+'</b><small>'+spot.address+'</small>'+badge);
    });
  </script>
</body>
</html>`;
}

function MapaTab() {
  const { data: spots = [] } = useQuery<Spot[]>({
    queryKey: ["spots"],
    queryFn: () => fetchJson<Spot[]>("/api/spots"),
  });
  const [filter, setFilter] = useState<SpotFilter>("todos");
  const filtered = filter === "todos" ? spots : spots.filter(s => s.type === filter);
  const leafletHTML = buildLeafletHTML(filtered);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={mp.mapWrap}>
        {spots.length > 0 ? (
          <LeafletMap html={leafletHTML} filterKey={filter} />
        ) : (
          <View style={[mp.map, mp.mapPlaceholder]}>
            <Text style={mp.mapPlaceholderText}>Cargando mapa…</Text>
          </View>
        )}
        <View style={mp.mapOverlayLabel}>
          <Text style={mp.mapOverlayText}>MADRID · MAPA CULTURAL</Text>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 8 }}>
        {FILTER_LABELS.map(({ key, label }) => (
          <Pressable key={key} onPress={() => setFilter(key)} style={[mp.chip, filter === key && mp.chipActive]}>
            <Text style={[mp.chipText, filter === key && mp.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={mp.countRow}>
        <Text style={mp.countText}>{filtered.length} {filtered.length === 1 ? "lugar" : "lugares"} en Madrid</Text>
        <View style={mp.copilLegend}>
          <View style={mp.copilDot} />
          <Text style={mp.countText}>Sello Copil</Text>
        </View>
      </View>
      {filtered.map(spot => {
        const color = SPOT_COLOR[spot.type] ?? Colors.primary;
        return (
          <View key={spot.id} style={mp.card}>
            <View style={[mp.cardAccent, { backgroundColor: color }]} />
            <View style={mp.body}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={[mp.type, { color }]}>{(SPOT_TYPE_LABEL[spot.type] ?? spot.type ?? "").toUpperCase()}</Text>
                {spot.copil && (
                  <View style={[mp.copilBadge, { borderColor: `${color}55` }]}>
                    <Text style={[mp.copilBadgeText, { color }]}>✦ SELLO COPIL</Text>
                  </View>
                )}
              </View>
              <Text style={mp.name}>{spot.name}</Text>
              <Text style={mp.address}>{spot.address}</Text>
              {!!spot.description && (
                <Text style={mp.desc} numberOfLines={3}>{spot.description}</Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const mp = StyleSheet.create({
  mapWrap: { height: 280, position: "relative", marginBottom: 0 },
  map: { flex: 1, backgroundColor: "#0a0a0a" },
  mapPlaceholder: { alignItems: "center", justifyContent: "center" },
  mapPlaceholderText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textTertiary, letterSpacing: 2 },
  mapOverlayLabel: { position: "absolute", bottom: 10, left: 12, backgroundColor: "rgba(10,10,10,0.75)", paddingHorizontal: 10, paddingVertical: 4 },
  mapOverlayText: { fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 2.5, color: "rgba(255,255,255,0.55)" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 2, color: Colors.textTertiary, textTransform: "uppercase" },
  chipTextActive: { color: "#fff" },
  countRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 12 },
  countText: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.textTertiary },
  copilLegend: { flexDirection: "row", alignItems: "center", gap: 6 },
  copilDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CA8A04", borderWidth: 1, borderColor: "#FDE047" },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.surface, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)" },
  cardAccent: { height: 3 },
  body: { padding: 16 },
  type: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 2 },
  copilBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  copilBadgeText: { fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.5 },
  name: { fontFamily: "Newsreader_500Medium", fontSize: 20, lineHeight: 25, color: Colors.textPrimary, marginBottom: 4 },
  address: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary, marginBottom: 6 },
  desc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, color: Colors.textSecondary },
});

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function AgendaTab({ earn }: { earn: (id: any) => Promise<void> }) {
  const qc = useQueryClient();
  const { data: events = [] } = useQuery<EventItem[]>({
    queryKey: ["events"],
    queryFn: () => fetchJson<EventItem[]>("/api/events"),
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, going }: { eventId: string; going: boolean }) => {
      const method = going ? "POST" : "DELETE";
      const r = await fetch(`${API_BASE}/api/events/${eventId}/voy`, { method });
      if (!r.ok) throw new Error("RSVP failed");
      if (going) await trackRsvp(earn);
    },
    onMutate: async ({ eventId, going }) => {
      await qc.cancelQueries({ queryKey: ["events"] });
      const prev = qc.getQueryData<EventItem[]>(["events"]);
      qc.setQueryData<EventItem[]>(["events"], old =>
        old?.map(e => e.id === eventId ? { ...e, voy: going } : e) ?? []
      );
      return { prev };
    },
    onError: (_e, _v, ctx: any) => {
      if (ctx?.prev) qc.setQueryData(["events"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["events"] }),
  });

  const myCount = events.filter(e => e.voy).length;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={ag.labelRow}>
        <View style={ag.line} />
        <Text style={ag.labelText}>AGENDA CULTURAL</Text>
        <View style={ag.line} />
        {myCount > 0 && (
          <View style={ag.countBadge}>
            <Text style={ag.countText}>{myCount} evento{myCount > 1 ? "s" : ""}</Text>
          </View>
        )}
      </View>
      {events.map(event => {
        const accent = getAccentColor(event.accentColor);
        return (
          <View key={event.id} style={ag.card}>
            <View style={[ag.stripe, { backgroundColor: accent }]} />
            <View style={ag.body}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Text style={[ag.cat, { color: accent }]}>{event.category.toUpperCase()}</Text>
                {event.price === "Gratuito" && (
                  <View style={ag.freeBadge}><Text style={ag.freeText}>GRATIS</Text></View>
                )}
                {event.price && event.price !== "Gratuito" && (
                  <View style={ag.priceBadge}><Text style={ag.priceText}>{event.price}</Text></View>
                )}
              </View>
              <Text style={ag.title}>{event.title}</Text>
              <View style={{ flexDirection: "column", gap: 4, marginBottom: 12, marginTop: 4 }}>
                <Text style={ag.meta}>{event.date} · {event.time}</Text>
                <Text style={ag.meta}>{event.venue}</Text>
              </View>
              <Text style={ag.desc} numberOfLines={2}>{event.description}</Text>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                <Pressable
                  onPress={() => rsvpMutation.mutate({ eventId: event.id, going: !event.voy })}
                  style={({ pressed }) => [ag.voyBtn, event.voy && ag.voyBtnActive, pressed && { opacity: 0.7 }]}
                >
                  <Text style={[ag.voyText, event.voy && ag.voyTextActive]}>{event.voy ? "✓ Voy" : "Voy →"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const ag = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  labelText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: Colors.textTertiary },
  countBadge: { borderWidth: 1, borderColor: "rgba(26,74,26,0.4)", paddingHorizontal: 8, paddingVertical: 3 },
  countText: { fontFamily: "Inter_400Regular", fontSize: 9, color: "#1a4a1a" },
  card: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, overflow: "hidden", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 16 },
  stripe: { width: 3, marginRight: 16 },
  body: { flex: 1 },
  cat: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 2 },
  freeBadge: { borderWidth: 1, borderColor: "rgba(26,74,26,0.4)", paddingHorizontal: 8, paddingVertical: 3 },
  freeText: { fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.5, color: "#1a4a1a" },
  priceBadge: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 3 },
  priceText: { fontFamily: "Inter_700Bold", fontSize: 7, letterSpacing: 1.5, color: Colors.textTertiary },
  title: { fontFamily: "Newsreader_500Medium", fontSize: 20, lineHeight: 24, color: Colors.textPrimary, marginBottom: 4 },
  meta: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textSecondary },
  desc: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 14, lineHeight: 20, color: Colors.textTertiary },
  voyBtn: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 8 },
  voyBtnActive: { backgroundColor: "#1a4a1a", borderColor: "#1a4a1a" },
  voyText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 2, color: Colors.textPrimary, textTransform: "uppercase" },
  voyTextActive: { color: "#fff" },
});

// ─── GUARDADOS ────────────────────────────────────────────────────────────────
function GuardadosTab() {
  const { data: saved = [] } = useQuery<Article[]>({
    queryKey: ["saved"],
    queryFn: () => fetchJson<Article[]>("/api/saved"),
  });

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={gu.labelRow}>
        <View style={gu.line} />
        <Text style={gu.labelText}>GUARDADOS</Text>
        <View style={gu.line} />
        <View style={gu.countBadge}><Text style={gu.countText}>{saved.length}</Text></View>
      </View>
      {saved.length === 0 ? (
        <View style={gu.empty}>
          <View style={gu.emptyLine} />
          <Text style={gu.emptyTitle}>Nada guardado todavía.</Text>
          <Text style={gu.emptySub}>Las mejores lecturas son las que guardas cuando no tienes tiempo y encuentras cuando más las necesitas.</Text>
          <Text style={gu.emptyMono}>Marca el ícono ○ en cualquier artículo</Text>
        </View>
      ) : (
        saved.map(art => {
          const img = getImage(art.hero_image_url ?? art.imageKey);
          const accent = getAccentColor(art.accentColor);
          return (
            <Pressable
              key={art.id}
              onPress={() => router.push(`/article/${art.id}` as any)}
              style={({ pressed }) => [gu.row, pressed && { opacity: 0.82 }]}
            >
              <Image source={img} style={gu.img} resizeMode="cover" />
              <View style={gu.body}>
                <View style={[gu.bar, { backgroundColor: accent }]} />
                <Text style={gu.type}>{(art.subcategory ?? art.type ?? "").toUpperCase()}</Text>
                <Text style={gu.title} numberOfLines={2}>{art.title}</Text>
                <Text style={gu.read}>{art.read_time_minutes ? `${art.read_time_minutes} min` : art.readTime}</Text>
              </View>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}

const gu = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  labelText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 3, color: Colors.textTertiary },
  countBadge: { backgroundColor: Colors.surface, paddingHorizontal: 8, paddingVertical: 3 },
  countText: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.textTertiary },
  empty: { marginHorizontal: 16, padding: 24, borderWidth: 1, borderColor: Colors.border },
  emptyLine: { width: 20, height: 1.5, backgroundColor: Colors.magenta, marginBottom: 16 },
  emptyTitle: { fontFamily: "Newsreader_400Regular", fontSize: 18, color: Colors.textSecondary, lineHeight: 22, marginBottom: 8 },
  emptySub: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 14, lineHeight: 22, color: Colors.textTertiary, marginBottom: 16 },
  emptyMono: { fontFamily: "Inter_400Regular", fontSize: 8, color: Colors.textTertiary, letterSpacing: 1.5, textTransform: "uppercase" },
  row: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, gap: 14, alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 16 },
  img: { width: 80, height: 108, backgroundColor: Colors.surfaceHigh },
  body: { flex: 1, gap: 3 },
  bar: { width: 22, height: 2, borderRadius: 1, marginBottom: 3 },
  type: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 2, color: Colors.textTertiary },
  title: { fontFamily: "Newsreader_600SemiBold", fontSize: 19, lineHeight: 23, color: Colors.textPrimary },
  read: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
});

// ─── SCREEN PRINCIPAL ─────────────────────────────────────────────────────────
export default function MiXicoScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [interests, setInterests] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("mi-lectura");
  const scrollRef = useRef<any>(null);

  const switchTab = useCallback((key: TabKey) => {
    setActiveTab(key);
    scrollRef.current?.scrollTo?.({ y: 0, animated: false });
  }, []);

  const { stamps, newStamp, earn, dismissStamp } = usePassport();
  const { streak } = useStreak();

  useEffect(() => {
    AsyncStorage.getItem("xico_interests").then(val => {
      if (val) { try { setInterests(JSON.parse(val)); } catch {} }
    });
  }, []);

  const earned = new Set(stamps.filter(s => s.earned).map(s => s.id));
  const pts = calculatePoints(earned as any, streak);
  const level = getXicoLevel(pts);
  const { companionName } = useXicoCompanion(pts, streak);
  const { user } = useAuth();

  const displayName = (() => {
    const meta = user?.user_metadata;
    if (meta?.full_name) return meta.full_name as string;
    if (meta?.name) return meta.name as string;
    if (user?.email) {
      const prefix = user.email.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return "Mi Cuenta";
  })();

  const { signOut } = useAuth();

  const handleSettings = () => {
    Alert.alert(
      "Configuración",
      user?.email ?? "Mi cuenta",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cambiar intereses",
          onPress: async () => {
            await AsyncStorage.removeItem("xico_onboarding_done");
            router.replace("/onboarding");
          },
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      {/* HEADER — sobrio, editorial, sin bloque magenta sólido */}
      <View style={[s.header, { paddingTop: topPad + 8 }]}>
        <View style={s.headerTop}>
          <Text style={s.headerEye}>XICO · ARCHIVO PERSONAL</Text>
          <Pressable onPress={handleSettings} style={({ pressed }) => [s.settingsBtn, pressed && { opacity: 0.5 }]}>
            <Feather name="settings" size={16} color="rgba(255,255,255,0.4)" />
          </Pressable>
        </View>

        <View style={s.nameRow}>
          <View style={s.nameLeft}>
            <Text style={s.accountLabel}>Cuenta de</Text>
            <Text style={s.profileName}>{displayName}</Text>
            <View style={s.magentaLine} />
          </View>
          <View style={s.nameRight}>
            <XicoAvatar level={level} size={68} />
          </View>
        </View>

        <View style={s.badgeRow}>
          <View style={s.levelBadge}>
            <Text style={s.levelBadgeXico}>NIVEL</Text>
            <View style={[s.levelBadgeDot, { backgroundColor: level.color }]} />
            <Text style={[s.levelBadgeName, { color: level.color }]}>{level.nombre}</Text>
          </View>
        </View>

        {interests.length > 0 && (
          <View style={s.tagsRow}>
            {interests.slice(0, 4).map(tag => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagText}>{INTEREST_LABELS[tag] ?? tag}</Text>
              </View>
            ))}
            {interests.length > 4 && (
              <View style={s.tag}>
                <Text style={s.tagText}>+{interests.length - 4}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={s.tabNav}>
        {TABS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => switchTab(key)}
            style={({ pressed }) => [s.tabBtn, activeTab === key && s.tabBtnActive, pressed && { opacity: 0.7 }]}
          >
            <Text style={[s.tabText, activeTab === key && s.tabTextActive]}>{label}</Text>
            <View style={[s.tabIndicator, activeTab === key && s.tabIndicatorActive]} />
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "mi-lectura" && (
          <>
            <PassportSection stamps={stamps} streak={streak} companionName={companionName} />
            <CriterionSection />
            <SellosSection stamps={stamps} />
            <MomentosInTab earn={earn} />
            <RutaSection earn={earn} />
            <RecomendacionesSection interests={interests} />
          </>
        )}
        {activeTab === "mapa" && <MapaTab />}
        {activeTab === "agenda" && <AgendaTab earn={earn} />}
        {activeTab === "guardados" && <GuardadosTab />}
      </ScrollView>

      <StampNotification stamp={newStamp} onDismiss={dismissStamp} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerEye: {
    fontFamily: "Inter_700Bold",
    fontSize: 9, letterSpacing: 3,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
  },
  settingsBtn: { padding: 6 },

  nameRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 16 },
  nameLeft: { flex: 1 },
  nameRight: { paddingTop: 20, alignItems: "center" },
  accountLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9, color: "rgba(255,255,255,0.3)",
    letterSpacing: 2, textTransform: "uppercase",
    marginBottom: 6,
  },
  profileName: {
    fontFamily: "Newsreader_300Light",
    fontSize: 36, lineHeight: 40,
    color: Colors.textPrimary, letterSpacing: -0.8,
    marginBottom: 12,
  },
  magentaLine: {
    width: 40, height: 2,
    backgroundColor: Colors.magenta,
  },

  badgeRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  circleBadge: {
    flex: 1, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12, paddingVertical: 10,
  },
  circleLabel: {
    fontFamily: "Inter_400Regular", fontSize: 8, letterSpacing: 2,
    color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 2,
  },
  circleValue: {
    fontFamily: "Newsreader_500Medium", fontSize: 14, lineHeight: 16, color: Colors.textPrimary,
  },
  levelBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12, paddingVertical: 10,
  },
  levelBadgeXico: {
    fontFamily: "Inter_400Regular", fontSize: 8, letterSpacing: 2,
    color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
  },
  levelBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  levelBadgeName: { fontFamily: "Inter_700Bold", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase" },

  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", paddingHorizontal: 9, paddingVertical: 4 },
  tagText: {
    fontFamily: "Inter_400Regular", fontSize: 8,
    color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, textTransform: "uppercase",
  },

  tabNav: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  tabBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 2, alignItems: "center", position: "relative" },
  tabBtnActive: {},
  tabText: { fontFamily: "Inter_700Bold", fontSize: 9, letterSpacing: 1.8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" },
  tabTextActive: { color: Colors.magenta },
  tabIndicator: { position: "absolute", bottom: 0, left: 0, right: 0, height: 2, backgroundColor: "transparent" },
  tabIndicatorActive: { backgroundColor: Colors.magenta },
});