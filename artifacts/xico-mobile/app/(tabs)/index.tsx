import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { XicoAvatar } from "@/components/XicoAvatar";
import { XicoLoader } from "@/components/XicoLoader";
import { StampNotification } from "@/components/StampNotification";
import { ElDespacho } from "@/components/ElDespacho";
import { Colors } from "@/constants/colors";
import { getImage } from "@/constants/imageMap";
import { fetchJson, API_BASE } from "@/constants/api";
import {
  calculatePoints,
  getXicoLevel,
  usePassport,
} from "@/hooks/usePassport";
import { useXicoCompanion } from "@/hooks/useXicoCompanion";
import { useStreak } from "@/hooks/useStreak";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const ACCENT_BAR: Record<string, string> = {
  magenta: "#8B1E45",
  cobalt: "#001E99",
  ochre: "#8C4A0D",
  emerald: "#004D2A",
  primary: "#141414",
};

const APERTURA_MES: Record<number, string> = {
  0: "Arranque de año",
  1: "La espera",
  2: "Primavera anticipada",
  3: "Después del frío",
  4: "Mayo en forma",
  5: "Verano en Madrid",
  6: "El mejor julio",
  7: "Las vacaciones terminan",
  8: "La vuelta",
  9: "Lo que queda de octubre",
  10: "Hacia el cierre",
  11: "Fin de año",
};

const INTEREST_TO_SUBCATEGORY: Record<string, string[]> = {
  "Arte Contemporáneo": ["arte-contemporaneo", "artes-visuales", "arte-urbano", "Artes Visuales"],
  "Arte Mesoamericano": ["tradicion", "Tradición"],
  "Fotografía y Memoria": ["fotografia", "Fotografía"],
  "Gastronomía": ["gastronomia", "Gastronomía"],
  "Arte Popular y Artesanía": ["arte-popular", "Arte Popular"],
  "Cine y Literatura": ["cine", "literatura", "Cine", "Literatura"],
  "Artes Escénicas": ["artes-escenicas", "Artes Escénicas"],
  "Diseño e Identidad": ["moda", "Moda"],
};

type NarrationStyle = "intellectual" | "visual" | "material" | "kinesthetic" | "conceptual";


type ApiArticle = {
  id: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  excerpt?: string;
  body?: string;
  pillar?: string;
  subcategory?: string;
  author_name?: string;
  read_time_minutes?: number;
  is_featured?: boolean;
  created_at?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  hero_image_url?: string | null;
};

type Article = {
  id: string;
  slug?: string;
  pillar: string;
  tag: string;
  subcategory?: string;
  title: string;
  subtitle: string;
  body: string;
  author: string;
  imageKey: string;
  hero_image_url?: string | null;
  readTime: string;
  accentColor: string;
  date: string;
  featured?: boolean;
};

function getAccentForPillar(pillar?: string): string {
  switch (pillar) {
    case "cultura":
      return "cobalt";
    case "mexico-ahora":
      return "ochre";
    case "mi-xico":
      return "emerald";
    default:
      return "magenta";
  }
}

function getImageKeyForArticle(a: ApiArticle): string {
  if (a.pillar === "mexico-ahora") return "arte-mesoamerica";
  if (a.pillar === "cultura") return "arte-contemporaneo";
  return "artesania-mexicana";
}

function getDateLabel(a: ApiArticle): string {
  const raw = a.published_at || a.created_at || a.updated_at;
  if (!raw) return "2026";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "2026";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function normalizeArticle(a: ApiArticle): Article {
  const pillar = a.pillar || "indice";
  return {
    id: a.id,
    slug: a.slug,
    pillar,
    tag: (a.subcategory || pillar).replace(/-/g, " "),
    subcategory: a.subcategory?.replace(/-/g, " "),
    title: a.title || "Sin título",
    subtitle: a.subtitle || a.excerpt || "",
    body: a.body || a.excerpt || "",
    author: a.author_name || "Equipo XICO",
    imageKey: getImageKeyForArticle(a),
    hero_image_url: a.hero_image_url ?? null,
    readTime: `${a.read_time_minutes || 4} min`,
    accentColor: getAccentForPillar(pillar),
    date: getDateLabel(a),
    featured: !!a.is_featured,
  };
}

function IndexBox({ index, dark = false }: { index: number; dark?: boolean }) {
  return (
    <View style={[ib.box, dark ? ib.boxDark : ib.boxLight]}>
      <Text style={[ib.text, dark ? ib.textDark : ib.textLight]}>
        {String(index).padStart(2, "0")}
      </Text>
    </View>
  );
}

const ib = StyleSheet.create({
  box: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  boxLight: { borderColor: "rgba(255,255,255,0.18)" },
  boxDark: { borderColor: "rgba(255,255,255,0.18)" },
  text: { fontFamily: "Inter_400Regular", fontSize: 8, lineHeight: 10 },
  textLight: { color: "rgba(255,255,255,0.35)" },
  textDark: { color: "rgba(255,255,255,0.35)" },
});

function ArticleCard({
  article,
  index,
  dark = false,
  onPress,
}: {
  article: Article;
  index: number;
  dark?: boolean;
  onPress: () => void;
}) {
  const accentBg = ACCENT_BAR[article.accentColor] ?? "#141414";
  const tagColor = dark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.4)";
  const titleColor = dark ? "#fff" : "#fff";
  const borderColor = dark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.10)";
  const img = getImage(article.hero_image_url ?? article.imageKey);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        ac.row,
        { borderBottomColor: borderColor, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <IndexBox index={index} dark={dark} />
      <View style={[ac.bar, { backgroundColor: accentBg }]} />
      <View style={ac.content}>
        <Text style={[ac.tag, { color: tagColor }]} numberOfLines={1}>
          {article.subcategory ?? article.tag}
        </Text>
        <Text style={[ac.title, { color: titleColor }]} numberOfLines={2}>
          {article.title}
        </Text>
      </View>
      <View style={ac.thumb}>
        <Image source={img} style={ac.thumbImg} resizeMode="cover" />
      </View>
    </Pressable>
  );
}

const ac = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  bar: { width: 3, height: 56, flexShrink: 0 },
  content: { flex: 1, minWidth: 0, gap: 4 },
  tag: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 15,
    lineHeight: 19,
  },
  thumb: {
    width: 70,
    height: 92,
    flexShrink: 0,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  thumbImg: { width: "100%", height: "100%" },
});

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

function Masthead({ topPad }: { topPad: number }) {
  const hoy = new Date();
  const mes = hoy.toLocaleDateString("es-ES", { month: "long" });
  const aperturaMes = APERTURA_MES[hoy.getMonth()] ?? "";
  const aperturaCaps = aperturaMes.toUpperCase();
  const mesCaps = mes.charAt(0).toUpperCase() + mes.slice(1);

  const vol = hoy.getFullYear() - 2023;
  const volStr = ROMAN[vol - 1] ?? String(vol);
  const issueStr = String(hoy.getMonth() + 1).padStart(2, "0");

  return (
    <View style={[mh.wrap, { paddingTop: topPad }]}>
      <View style={mh.strip}>
        <View style={mh.stripLeft}>
          <View style={mh.dot} />
          <Text style={mh.stripText}>
            {aperturaCaps} · {mes.toUpperCase()} {hoy.getFullYear()}
          </Text>
        </View>
      </View>

      <View style={mh.bottom}>
        <Text style={mh.logo}>XICO</Text>
        <View style={mh.meta}>
          <View style={mh.tag}>
            <Text style={mh.tagText}>Vol. {volStr} · Nº {issueStr}</Text>
          </View>
          <Text style={mh.edicion}>Edición {mesCaps}</Text>
        </View>
      </View>
    </View>
  );
}

const mh = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.background,
    borderBottomWidth: 2,
    borderBottomColor: Colors.textPrimary,
  },
  strip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  stripLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 5, height: 5, backgroundColor: "hsl(335, 85%, 45%)" },
  stripText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 2.5,
    color: "hsl(335, 85%, 45%)",
    textTransform: "uppercase",
  },
  tag: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  tagText: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.35)",
  },
  bottom: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  logo: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 42,
    letterSpacing: 8,
    color: Colors.textPrimary,
    lineHeight: 46,
  },
  meta: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    paddingBottom: 4,
  },
  edicion: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
  },
});

function TuXicoWidget({
  companionName,
  levelNombre,
  levelColor,
  dailyFrase,
  level,
  streak,
}: {
  companionName: string | null;
  levelNombre: string;
  levelColor: string;
  dailyFrase: string;
  level: ReturnType<typeof getXicoLevel>;
  streak: number;
}) {
  const today = new Date();
  const dia = today.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const diaCaps = dia.charAt(0).toUpperCase() + dia.slice(1);

  return (
    <View style={aw.wrap}>
      <LinearGradient
        colors={[`${levelColor}20`, `${levelColor}08`, "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={aw.topRule} />
      <View style={aw.inner}>
        <View style={aw.left}>
          <View style={aw.eyebrowRow}>
            <Text style={aw.eyebrow}>TU XICO HOY</Text>
            {streak > 1 && (
              <View style={[aw.streakBadge, { borderColor: `${levelColor}55` }]}>
                <Text style={[aw.streakNum, { color: levelColor }]}>{streak}</Text>
                <Text style={aw.streakLabel}>días</Text>
              </View>
            )}
          </View>
          <View style={aw.nameLine}>
            <Text style={[aw.companionName, { color: levelColor }]}>
              {companionName || "XICO"}
            </Text>
            <Text style={aw.levelTag}>{levelNombre.toUpperCase()}</Text>
          </View>
          <View style={[aw.colorBar, { backgroundColor: levelColor }]} />
          <Text style={aw.frase}>{dailyFrase}</Text>
          <Text style={aw.fecha}>{diaCaps}</Text>
        </View>

        <View style={aw.right}>
          <XicoAvatar level={level} size={96} />
        </View>
      </View>

      <View style={[aw.geomAccent, { borderColor: `${levelColor}22` }]} />
      <View style={[aw.bottomRule, { backgroundColor: levelColor }]} />
    </View>
  );
}

const aw = StyleSheet.create({
  wrap: {
    backgroundColor: "#16090f",
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  topRule: { height: 1, backgroundColor: "rgba(255,255,255,0.07)" },
  inner: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
    alignItems: "center",
  },
  left: { flex: 1 },
  right: { width: 96, alignItems: "center", justifyContent: "center" },
  eyebrowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 7,
    letterSpacing: 3.5,
    color: "rgba(255,255,255,0.28)",
    textTransform: "uppercase",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  streakNum: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 14,
    lineHeight: 16,
  },
  streakLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },
  nameLine: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 10 },
  companionName: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 22,
    lineHeight: 24,
  },
  levelTag: {
    fontFamily: "Inter_700Bold",
    fontSize: 7,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.25)",
  },
  colorBar: { width: 24, height: 1.5, marginBottom: 12 },
  frase: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.72)",
    marginBottom: 14,
  },
  fecha: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    color: "rgba(255,255,255,0.22)",
    letterSpacing: 1.5,
  },
  geomAccent: {
    position: "absolute",
    top: -32,
    right: -32,
    width: 96,
    height: 96,
    borderWidth: 1,
    transform: [{ rotate: "45deg" }],
  },
  bottomRule: { height: 2 },
});

function NotaDelEditor({ nota }: { nota: { lugar: string; texto: string } | null }) {
  const hoy = new Date();
  const h = hoy.getHours();
  const saludo = h < 12 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches";
  const fechaStr = hoy.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!nota) return null;

  return (
    <View style={nd.wrap}>
      <View style={nd.topRow}>
        <Text style={nd.saludoLugar} numberOfLines={1}>
          {saludo} · {nota.lugar}
        </Text>
        <Text style={nd.fecha}>{fechaStr}</Text>
      </View>
      <View style={nd.labelRow}>
        <View style={nd.magentaLine} />
        <Text style={nd.eyebrow}>Nota del editor</Text>
      </View>
      <Text style={nd.texto}>{nota.texto}</Text>
      <View style={nd.separator} />
    </View>
  );
}

const nd = StyleSheet.create({
  wrap: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },
  saludoLugar: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    flex: 1,
  },
  fecha: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 1,
    color: "rgba(255,255,255,0.18)",
    textTransform: "uppercase",
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  magentaLine: { width: 16, height: 1.5, backgroundColor: "hsl(335, 85%, 45%)" },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 7,
    letterSpacing: 3,
    color: "hsl(335, 85%, 45%)",
    textTransform: "uppercase",
  },
  texto: {
    fontFamily: "Newsreader_300Light",
    fontSize: 22,
    lineHeight: 31,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  separator: { marginTop: 28, height: 0.5, backgroundColor: "rgba(255,255,255,0.08)" },
});

function TablaContenidos() {
  const hoy = new Date();
  const mes = hoy.toLocaleDateString("es-ES", { month: "long" });

  const PILLARS = [
    {
      label: "Índice",
      intent: "Portada hecha con criterio",
      accentColor: "hsl(335, 85%, 45%)",
      count: "Editorial",
      route: "/",
    },
    {
      label: "Cultura",
      intent: "Arte que no pide permiso",
      accentColor: "hsl(220, 100%, 30%)",
      count: "Cultura viva",
      route: "/cultura",
    },
    {
      label: "Ahora",
      intent: "Lo urgente, sin rodeos",
      accentColor: "hsl(25, 80%, 45%)",
      count: "Madrid",
      route: "/mexico-ahora",
    },
    {
      label: "Archivo",
      intent: "Tu lectura, tu recorrido",
      accentColor: "hsl(160, 100%, 20%)",
      count: "Mi XICO",
      route: "/mi-xico",
    },
  ];

  return (
    <View style={tc.wrap}>
      <View style={tc.header}>
        <Text style={tc.headerLabel}>La edición de {mes}</Text>
      </View>
      <View style={tc.grid}>
        {PILLARS.map((p, i) => (
          <Pressable
            key={p.label}
            onPress={() => router.push(p.route as any)}
            style={({ pressed }) => [
              tc.cell,
              i % 2 === 0 ? tc.cellLeft : tc.cellRight,
              i >= 2 ? tc.cellBottom : tc.cellTop,
              pressed && { opacity: 0.6 },
            ]}
          >
            <View style={[tc.accentLine, { backgroundColor: p.accentColor }]} />
            <View style={tc.cellInner}>
              <View style={tc.cellHeader}>
                <Text style={[tc.cellLabel, { color: p.accentColor }]}>{p.label}</Text>
                <Text style={tc.cellCount}>{p.count}</Text>
              </View>
              <Text style={tc.cellIntent} numberOfLines={2}>
                {p.intent}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const tc = StyleSheet.create({
  wrap: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)" },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "50%", position: "relative" },
  cellLeft: { borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" },
  cellRight: {},
  cellTop: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.1)" },
  cellBottom: {},
  accentLine: { height: 2, position: "absolute", top: 0, left: 0, right: 0 },
  cellInner: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16, gap: 6 },
  cellHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  cellLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  cellCount: { fontFamily: "Inter_400Regular", fontSize: 7, color: "rgba(255,255,255,0.25)" },
  cellIntent: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.5)",
  },
});

function HeroSection({
  article,
  savedIds,
  onToggleSave,
}: {
  article: Article;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}) {
  const img = getImage(article.hero_image_url ?? article.imageKey);
  const accentBg = ACCENT_BAR[article.accentColor] ?? "#8B1E45";
  const saved = savedIds.has(article.id);
  const heroH = Math.round(SCREEN_H * 0.58);

  return (
    <Pressable
      onPress={() => router.push(`/article/${article.id}` as any)}
      style={({ pressed }) => [pressed && { opacity: 0.92 }]}
    >
      <View style={{ width: "100%", height: heroH, backgroundColor: "#000", overflow: "hidden" }}>
        <Image source={img} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.22)", "rgba(0,0,0,0.88)"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={hh.topRow}>
          <View style={[hh.badge, { backgroundColor: accentBg }]}>
            <Text style={hh.badgeText}>{article.tag}</Text>
          </View>
          <Text style={hh.numText}>01</Text>
        </View>

        <View style={hh.bottom}>
          <View style={hh.accentRow}>
            <View style={[hh.accentBar, { backgroundColor: accentBg }]} />
            <View style={hh.accentLine} />
          </View>

          <Text style={hh.title} numberOfLines={3}>
            {article.title}
          </Text>

          {!!article.subtitle && (
            <Text style={hh.subtitle} numberOfLines={2}>
              {article.subtitle}
            </Text>
          )}

          <View style={hh.meta}>
            <Text style={hh.metaText} numberOfLines={1}>
              {(article.subcategory ?? article.tag) + " · " + article.readTime + " · " + article.date}
            </Text>

            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onToggleSave(article.id);
              }}
              style={hh.bookmarkBtn}
            >
              <Feather
                name="bookmark"
                size={17}
                color={saved ? accentBg : "rgba(255,255,255,0.3)"}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const hh = StyleSheet.create({
  topRow: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: { paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 2.5,
    color: "#fff",
    textTransform: "uppercase",
  },
  numText: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
  },
  bottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  accentRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  accentBar: { width: 32, height: 2 },
  accentLine: { flex: 1, height: 0.5, backgroundColor: "rgba(255,255,255,0.2)" },
  title: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 36,
    lineHeight: 42,
    color: "#fff",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },
  meta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metaText: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    flex: 1,
  },
  bookmarkBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
});

function MexicoAhoraPreview({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <View style={ma.wrap}>
      <View style={ma.header}>
        <View style={ma.pingWrap}>
          <View style={ma.pingOuter} />
          <View style={ma.pingDot} />
        </View>
        <Text style={ma.eyebrow}>México Ahora</Text>
      </View>

      <View style={ma.titleRow}>
        <Text style={ma.titleMain}>México le habla</Text>
        <Text style={ma.titleItalic}> a Madrid</Text>
      </View>

      <Text style={ma.sub}>Lo urgente, sin rodeos</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ma.carouselContent}
      >
        {articles.slice(0, 5).map((art) => {
          const img = getImage(art.hero_image_url ?? art.imageKey);
          const accentBg = ACCENT_BAR[art.accentColor] ?? "#141414";
          return (
            <Pressable
              key={art.id}
              onPress={() => router.push(`/article/${art.id}` as any)}
              style={({ pressed }) => [ma.carouselCard, pressed && { opacity: 0.82 }]}
            >
              <Image source={img} style={ma.carouselImg} resizeMode="cover" />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.92)"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={ma.carouselOverlay}>
                <View style={[ma.carouselAccentBar, { backgroundColor: accentBg }]} />
                <Text style={ma.carouselTag} numberOfLines={1}>
                  {art.subcategory ?? art.tag}
                </Text>
                <Text style={ma.carouselTitle} numberOfLines={3}>
                  {art.title}
                </Text>
                <Text style={ma.carouselMeta}>{art.readTime}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => router.push("/mexico-ahora" as any)}
        style={({ pressed }) => [ma.link, pressed && { opacity: 0.6 }]}
      >
        <Text style={ma.linkText}>Toda la cobertura de este mes →</Text>
      </Pressable>
    </View>
  );
}

const ma = StyleSheet.create({
  wrap: { backgroundColor: "#141414", paddingBottom: 28 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  pingWrap: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pingOuter: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "rgba(140,74,13,0.3)",
  },
  pingDot: { width: 6, height: 6, backgroundColor: "hsl(25, 80%, 45%)" },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 2.5,
    color: "hsl(25, 80%, 45%)",
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 4,
  },
  titleMain: {
    fontFamily: "Newsreader_300Light",
    fontSize: 34,
    lineHeight: 36,
    letterSpacing: -0.5,
    color: "#fff",
  },
  titleItalic: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 34,
    lineHeight: 36,
    color: "#fff",
  },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.3)",
    paddingHorizontal: 24,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  carouselContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 10 },
  carouselCard: {
    width: SCREEN_W * 0.68,
    height: 210,
    overflow: "hidden",
    backgroundColor: "#141414",
  },
  carouselImg: { width: "100%", height: "100%" },
  carouselOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  carouselAccentBar: { width: 20, height: 2, marginBottom: 10 },
  carouselTag: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  carouselTitle: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 18,
    lineHeight: 22,
    color: "#fff",
    letterSpacing: -0.2,
  },
  carouselMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 1.5,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    marginTop: 10,
  },
  link: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    marginTop: 8,
  },
  linkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "hsl(25, 80%, 45%)",
    textTransform: "uppercase",
  },
});

function PiezaProfunda({ article }: { article: Article }) {
  const img = getImage(article.hero_image_url ?? article.imageKey);

  return (
    <View style={pp.wrap}>
      <View style={pp.labelRow}>
        <View style={pp.dot} />
        <Text style={pp.label}>Para cuando tengas tiempo</Text>
        <Text style={pp.readTime}>{article.readTime}</Text>
      </View>

      <Pressable
        onPress={() => router.push(`/article/${article.id}` as any)}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      >
        <View style={pp.imageWrap}>
          <Image source={img} style={pp.image} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)"]} style={StyleSheet.absoluteFill} />
          <View style={pp.cornerLabel}>
            <Text style={pp.cornerText}>Para leer sin prisa</Text>
          </View>
        </View>

        <View style={pp.content}>
          <Text style={pp.subcategory}>{article.subcategory ?? article.tag}</Text>
          <Text style={pp.title}>{article.title}</Text>
          {!!article.subtitle && (
            <Text style={pp.subtitle} numberOfLines={3}>
              {article.subtitle}
            </Text>
          )}
          <View style={pp.footer}>
            <Text style={pp.author}>{article.author}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const pp = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  dot: { width: 6, height: 6, backgroundColor: "hsl(220, 100%, 30%)" },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 8,
    letterSpacing: 2,
    color: "hsl(220, 100%, 30%)",
    textTransform: "uppercase",
    flex: 1,
  },
  readTime: { fontFamily: "Inter_400Regular", fontSize: 7, color: "rgba(255,255,255,0.3)" },
  imageWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    position: "relative",
    backgroundColor: Colors.surface,
  },
  image: { width: "100%", height: "100%" },
  cornerLabel: { position: "absolute", bottom: 12, right: 12 },
  cornerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  content: { paddingHorizontal: 24, paddingVertical: 20, gap: 10 },
  subcategory: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 25,
    lineHeight: 30,
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.5)",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 12,
  },
  author: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

function ModuloPersonalizado({
  articles,
  interests,
  narrationStyle,
  contexts,
}: {
  articles: Article[];
  interests: string[];
  narrationStyle: NarrationStyle;
  contexts: Record<string, Record<string, string>>;
}) {
  if (articles.length === 0) return null;

  const contexto =
    interests.length > 0
      ? (contexts[interests[0]]?.[narrationStyle] ?? contexts[interests[0]]?.intellectual ?? "")
      : "";

  return (
    <View style={mp.wrap}>
      <View style={mp.header}>
        <View style={mp.dot} />
        <Text style={mp.eyebrow}>Según tu criterio</Text>
      </View>
      <Text style={mp.contexto}>{contexto}</Text>

      {articles.slice(0, 2).map((art) => {
        const accentBg = ACCENT_BAR[art.accentColor] ?? "#141414";
        return (
          <Pressable
            key={art.id}
            onPress={() => router.push(`/article/${art.id}` as any)}
            style={({ pressed }) => [mp.row, pressed && { opacity: 0.6 }]}
          >
            <View style={[mp.bar, { backgroundColor: accentBg }]} />
            <View style={mp.content}>
              <Text style={mp.sub}>{art.subcategory ?? art.tag}</Text>
              <Text style={mp.title} numberOfLines={2}>
                {art.title}
              </Text>
              <Text style={mp.read}>{art.readTime}</Text>
            </View>
            <Image source={getImage(art.hero_image_url ?? art.imageKey)} style={mp.thumb} resizeMode="cover" />
          </Pressable>
        );
      })}
    </View>
  );
}

const mp = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 6,
  },
  dot: { width: 6, height: 6, backgroundColor: "hsl(160, 100%, 20%)" },
  eyebrow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 8,
    letterSpacing: 2,
    color: "hsl(160, 100%, 20%)",
    textTransform: "uppercase",
  },
  contexto: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.5)",
    paddingHorizontal: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  bar: { width: 3, height: 64, flexShrink: 0 },
  content: { flex: 1, gap: 4 },
  sub: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  read: { fontFamily: "Inter_400Regular", fontSize: 7, color: "rgba(255,255,255,0.25)" },
  thumb: { width: 64, height: 88, flexShrink: 0 },
});

function EstaSemana({
  gridPair,
  listaArticulos,
}: {
  gridPair: Article[];
  listaArticulos: Article[];
}) {
  return (
    <View style={es.wrap}>
      <View style={es.sectionHeader}>
        <View style={es.sectionDot} />
        <Text style={es.sectionLabel}>Lo que se llevó esta semana</Text>
        <Text style={es.sectionRight}>Portada</Text>
      </View>

      {gridPair.length >= 2 && (
        <View style={es.grid}>
          {gridPair.map((art, i) => {
            const accentBg = ACCENT_BAR[art.accentColor] ?? "#141414";
            const img = getImage(art.hero_image_url ?? art.imageKey);

            return (
              <Pressable
                key={art.id}
                onPress={() => router.push(`/article/${art.id}` as any)}
                style={({ pressed }) => [es.gridCell, pressed && { opacity: 0.7 }]}
              >
                <View
                  style={[
                    i === 0 ? es.gridImgLeft : es.gridImgRight,
                    {
                      position: "relative",
                      overflow: "hidden",
                      backgroundColor: Colors.surface,
                    },
                  ]}
                >
                  <Image source={img} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  <LinearGradient
                    colors={["rgba(0,0,0,0.0)", "rgba(0,0,0,0.38)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[es.gridAccentLine, { backgroundColor: accentBg }]} />
                </View>

                <View style={[es.gridContent, i === 1 && es.gridContentSmall]}>
                  <Text style={es.gridTag} numberOfLines={1}>
                    {art.subcategory ?? art.tag}
                  </Text>
                  <Text
                    style={[es.gridTitle, i === 1 && es.gridTitleSmall]}
                    numberOfLines={i === 0 ? 4 : 2}
                  >
                    {art.title}
                  </Text>

                  {i === 0 && !!art.subtitle && (
                    <Text style={es.gridSubtitle} numberOfLines={2}>
                      {art.subtitle}
                    </Text>
                  )}

                  {i === 0 && (
                    <View style={es.gridFooter}>
                      <Text style={es.gridRead}>{art.readTime}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {listaArticulos.map((art, i) => {
        const accentBg = ACCENT_BAR[art.accentColor] ?? "#141414";

        return (
          <Pressable
            key={art.id}
            onPress={() => router.push(`/article/${art.id}` as any)}
            style={({ pressed }) => [es.listRow, pressed && { opacity: 0.6 }]}
          >
            <IndexBox index={i + 4} />
            <View style={[es.listBar, { backgroundColor: accentBg }]} />
            <View style={es.listContent}>
              <Text style={es.listTag} numberOfLines={1}>
                {art.subcategory ?? art.tag}
              </Text>
              <Text style={es.listTitle} numberOfLines={2}>
                {art.title}
              </Text>
            </View>
            <Image source={getImage(art.hero_image_url ?? art.imageKey)} style={es.listThumb} resizeMode="cover" />
          </Pressable>
        );
      })}
    </View>
  );
}

const es = StyleSheet.create({
  wrap: { backgroundColor: Colors.background },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  sectionDot: { width: 6, height: 6, backgroundColor: "hsl(335, 85%, 45%)" },
  sectionLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    flex: 1,
  },
  sectionRight: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  grid: {
    flexDirection: "row",
    gap: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  gridCell: { flex: 1, backgroundColor: Colors.background },
  gridImgLeft: { aspectRatio: 3 / 2 },
  gridImgRight: { aspectRatio: 1 },
  gridAccentLine: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  gridContent: { padding: 12, gap: 6 },
  gridContentSmall: { padding: 10 },
  gridTag: {
    fontFamily: "Inter_400Regular",
    fontSize: 7,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  },
  gridTitle: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  gridTitleSmall: { fontSize: 13, lineHeight: 17 },
  gridSubtitle: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.5)",
  },
  gridFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridRead: { fontFamily: "Inter_400Regular", fontSize: 7, color: "rgba(255,255,255,0.3)" },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  listBar: { width: 3, height: 56, flexShrink: 0 },
  listContent: { flex: 1, gap: 4 },
  listTag: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
  },
  listTitle: {
    fontFamily: "Newsreader_600SemiBold",
    fontSize: 15,
    lineHeight: 19,
    color: Colors.textPrimary,
  },
  listThumb: { width: 70, height: 88, flexShrink: 0 },
});

export default function IndexScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { stamps, newStamp, earn, dismissStamp } = usePassport();
  const { streak } = useStreak();
  const earnedSet = new Set(stamps.filter((s) => s.earned).map((s) => s.id));
  const pts = calculatePoints(earnedSet as any, streak);
  const level = getXicoLevel(pts);
  const { companionName, dailyFrase } = useXicoCompanion(pts, streak);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [interests, setInterests] = useState<string[]>([]);
  const [narrationStyle, setNarrationStyle] = useState<NarrationStyle>("intellectual");
  const [personalizationContexts, setPersonalizationContexts] = useState<Record<string, Record<string, string>>>({});
  const [notaEditor, setNotaEditor] = useState<{ lugar: string; texto: string } | null>(null);

  const {
    data: apiArticles = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ApiArticle[]>({
    queryKey: ["articles", "home"],
    queryFn: () => fetchJson<ApiArticle[]>("/api/articles"),
  });

  const allArticles = useMemo(() => apiArticles.map(normalizeArticle), [apiArticles]);

  const portadaArticles = useMemo(
    () =>
      allArticles.filter((a) => a.pillar === "indice" || a.pillar === "portada"),
    [allArticles]
  );

  const mexicoAhoraArticles = useMemo(
    () => allArticles.filter((a) => a.pillar === "mexico-ahora"),
    [allArticles]
  );

  const culturaArticles = useMemo(
    () => allArticles.filter((a) => a.pillar === "cultura"),
    [allArticles]
  );

  useEffect(() => {
    AsyncStorage.getItem("xico_interests").then((raw) => {
      if (raw) { try { setInterests(JSON.parse(raw)); } catch {} }
    });
    AsyncStorage.getItem("xico_narration_style").then((style) => {
      if (style) setNarrationStyle(style as NarrationStyle);
    });
    fetchJson<any[]>("/api/saved")
      .then((saved) => {
        setSavedIds(new Set(saved.map((a: any) => a.articleId ?? a.id)));
      })
      .catch(() => {});
    fetchJson<Record<string, Record<string, string>>>("/api/personalization/contexts")
      .then(setPersonalizationContexts)
      .catch(() => {});
    fetchJson<{ lugar: string; texto: string }>("/api/personalization/nota-editor")
      .then(setNotaEditor)
      .catch(() => {});
  }, []);

  const toggleSave = useCallback(
    async (id: string) => {
      const next = new Set(savedIds);

      if (next.has(id)) {
        await fetch(`${API_BASE}/api/saved/${id}`, { method: "DELETE" });
        next.delete(id);
      } else {
        await fetch(`${API_BASE}/api/saved/${id}`, { method: "POST" });
        next.add(id);
      }

      setSavedIds(next);
    },
    [savedIds]
  );

  const hero = portadaArticles[0] || allArticles[0];
  const gridPair = portadaArticles.slice(1, 3);
  const listaArticulos = portadaArticles.slice(3, 7);

  const piezaProfunda =
    culturaArticles.find((a) => parseInt(a.readTime, 10) >= 6) || culturaArticles[0];

  const matchedSubcats = interests.flatMap((i) => INTEREST_TO_SUBCATEGORY[i] ?? []);

  const personalizados =
    matchedSubcats.length > 0
      ? [...culturaArticles, ...mexicoAhoraArticles]
          .filter((a) => matchedSubcats.includes(a.subcategory ?? "") && a.id !== piezaProfunda?.id)
          .slice(0, 2)
      : [];

  if (isLoading) {
    return (
      <View style={sc.center}>
        <XicoLoader />
      </View>
    );
  }

  if (error) {
    return (
      <View style={sc.center}>
        <Text style={sc.errorTitle}>Error cargando el índice</Text>
        <Text style={sc.errorText}>
          La API existe, pero el frontend no pudo procesar la respuesta.
        </Text>
        <Pressable onPress={() => refetch()} style={sc.retryBtn}>
          <Text style={sc.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={sc.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
      >
        <Masthead topPad={topPad} />

        <ElDespacho onOpen={() => earn("despacho")} />

        {hero && (
          <HeroSection article={hero} savedIds={savedIds} onToggleSave={toggleSave} />
        )}

        <TuXicoWidget
          companionName={companionName}
          levelNombre={level.nombre}
          levelColor={level.color}
          dailyFrase={dailyFrase}
          level={level}
          streak={streak}
        />

        <NotaDelEditor nota={notaEditor} />
        <TablaContenidos />

        {mexicoAhoraArticles.length > 0 && (
          <MexicoAhoraPreview articles={mexicoAhoraArticles} />
        )}

        {piezaProfunda && <PiezaProfunda article={piezaProfunda} />}

        {interests.length > 0 && personalizados.length > 0 && (
          <ModuloPersonalizado articles={personalizados} interests={interests} narrationStyle={narrationStyle} contexts={personalizationContexts} />
        )}

        {(gridPair.length > 0 || listaArticulos.length > 0) && (
          <EstaSemana gridPair={gridPair} listaArticulos={listaArticulos} />
        )}
      </ScrollView>

      <StampNotification stamp={newStamp} onDismiss={dismissStamp} />
    </View>
  );
}

const sc = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    marginBottom: 10,
  },
  errorText: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 18,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: Colors.textPrimary,
  },
});