import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, getAccentColor } from "@/constants/colors";
import { Fonts, lh, Space, Tracking, TypeSize } from "@/constants/editorial";
import { getImage } from "@/constants/imageMap";
import { fetchJson } from "@/constants/api";
import { XicoLoader } from "@/components/XicoLoader";
import { Kicker, Masthead, RevealOnMount, Rule, SectionOpener, Standfirst } from "@/components/editorial";

type Article = {
  id: string; pillar: string; type: string; subcategory: string;
  title: string; subtitle: string; author: string; institution: string;
  imageKey: string; readTime: string; accentColor: string; date: string; featured: boolean;
  hero_image_url?: string | null; read_time_minutes?: number;
};

type NotaEditor = { lugar: string; texto: string };
function PulseDot({ color = Colors.ochre, size = 8 }: { color?: string; size?: number }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 2.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: size * 2.5, height: size * 2.5, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ scale: pulse }], opacity }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, zIndex: 1 }} />
    </View>
  );
}
function DualClock() {
  const fmt = (tz: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-MX", { timeZone: tz, ...opts });

  const getClockState = () => {
    const now = new Date();
    const madridH = parseInt(fmt("Europe/Madrid", { hour: "numeric", hour12: false }).format(now), 10);
    const cdmxH = parseInt(fmt("America/Mexico_City", { hour: "numeric", hour12: false }).format(now), 10);
    let diff = madridH - cdmxH;
    if (diff < 0) diff += 24;
    return {
      madridHM: fmt("Europe/Madrid", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now),
      cdmxHM: fmt("America/Mexico_City", { hour: "2-digit", minute: "2-digit", hour12: false }).format(now),
      madridSec: fmt("Europe/Madrid", { second: "2-digit", hour12: false }).format(now),
      cdmxSec: fmt("America/Mexico_City", { second: "2-digit", hour12: false }).format(now),
      madridDay: fmt("Europe/Madrid", { weekday: "long" }).format(now),
      cdmxDay: fmt("America/Mexico_City", { weekday: "long" }).format(now),
      hourDiff: diff,
    };
  };

  const [clock, setClock] = useState(getClockState);

  useEffect(() => {
    const id = setInterval(() => setClock(getClockState()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={dc.wrap}>
      <View style={dc.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <PulseDot color={Colors.ochre} size={6} />
          <Text style={dc.headerLabel}>Hora local · Tiempo real</Text>
        </View>
        <View style={dc.gmtBox}>
          <Text style={dc.gmtText}>GMT · CET · CST</Text>
        </View>
      </View>
      <View style={dc.body}>
        <View style={dc.col}>
          <View style={dc.colInner}>
            <Text style={dc.cityLabel}>Madrid</Text>
            <View style={dc.timeLine}>
              <Text style={dc.timeDigits}>{clock.madridHM}</Text>
              <Text style={dc.timeSec}>:{clock.madridSec}</Text>
            </View>
            <Text style={dc.dayText}>{clock.madridDay}</Text>
          </View>
        </View>
        <View style={dc.sep}>
          <View style={dc.sepLine} />
          <Text style={dc.sepDiff}>+{clock.hourDiff}h</Text>
          <View style={dc.sepLine} />
        </View>
        <View style={dc.col}>
          <View style={dc.colInner}>
            <Text style={dc.cityLabel}>CDMX</Text>
            <View style={dc.timeLine}>
              <Text style={dc.timeDigits}>{clock.cdmxHM}</Text>
              <Text style={dc.timeSec}>:{clock.cdmxSec}</Text>
            </View>
            <Text style={dc.dayText}>{clock.cdmxDay}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: "#141210",
    borderWidth: 1,
    borderColor: "rgba(140,74,13,0.4)",
    borderTopWidth: 2,
    borderTopColor: Colors.ochre,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140,74,13,0.15)",
  },
  dot: { width: 7, height: 7, backgroundColor: Colors.ochre },
  headerLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  gmtBox: {
    borderWidth: 1,
    borderColor: "rgba(140,74,13,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  gmtText: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 1,
  },
  body: { flexDirection: "row", alignItems: "stretch" },
  col: { flex: 1 },
  colInner: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 8,
  },
  cityLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.ochre,
    textTransform: "uppercase",
  },
  timeLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  timeDigits: {
    fontFamily: "Inter_300Light",
    fontSize: 50,
    color: "#fff",
    letterSpacing: -2,
    lineHeight: 54,
  },
  timeSec: {
    fontFamily: "Inter_300Light",
    fontSize: 20,
    color: "rgba(255,255,255,0.2)",
    lineHeight: 24,
  },
  dayText: {
    fontFamily: "Newsreader_300Light_Italic",
    fontStyle: "italic",
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textTransform: "capitalize",
  },
  sep: {
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 22,
    gap: 0,
  },
  sepLine: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(140,74,13,0.2)",
  },
  sepDiff: {
    fontFamily: "Newsreader_300Light",
    fontSize: 14,
    color: "rgba(140,74,13,0.7)",
    letterSpacing: 0.5,
    paddingVertical: 10,
  },
});

const RATE_MXN_EUR = 21.2;
const RATE_DATE = "may 2026";
function ConvertidorMXN() {
  const [mode, setMode] = useState<"mxn" | "eur">("mxn");
  const [value, setValue] = useState("");
  const numericVal = parseFloat(value.replace(",", ".")) || 0;
  const converted = mode === "mxn"
    ? (numericVal / RATE_MXN_EUR).toFixed(2)
    : (numericVal * RATE_MXN_EUR).toFixed(2);
  const fromLabel = mode === "mxn" ? "MXN" : "EUR";
  const toLabel   = mode === "mxn" ? "EUR" : "MXN";
  const fromSym   = mode === "mxn" ? "$" : "€";
  const toSym     = mode === "mxn" ? "€" : "$";
  return (
    <View style={cx.wrap}>
      <View style={cx.header}>
        <View>
          <Text style={cx.eyebrow}>Conversor de divisas</Text>
          <Text style={cx.rate}>aprox. 1 EUR = {RATE_MXN_EUR} MXN · {RATE_DATE}</Text>
        </View>
        <Pressable
          onPress={() => { setMode(m => m === "mxn" ? "eur" : "mxn"); setValue(""); }}
          style={({ pressed }) => [cx.toggleBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={cx.toggleText}>⇄ {fromLabel} → {toLabel}</Text>
        </Pressable>
      </View>
      <View style={cx.body}>
        <View style={cx.col}>
          <Text style={cx.colLabel}>{fromLabel}</Text>
          <View style={cx.inputRow}>
            <Text style={cx.sym}>{fromSym}</Text>
            <TextInput
              style={cx.input}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.15)"
            />
          </View>
        </View>
        <View style={cx.divider} />
        <View style={[cx.col, { alignItems: "flex-end" }]}>
          <Text style={[cx.colLabel, { textAlign: "right" }]}>{toLabel}</Text>
          <View style={[cx.inputRow, { justifyContent: "flex-end" }]}>
            <Text style={[cx.resultNum, { color: numericVal > 0 ? Colors.ochre : "rgba(255,255,255,0.15)" }]}>
              {numericVal > 0 ? converted : "0"}
            </Text>
            <Text style={[cx.sym, { color: numericVal > 0 ? "rgba(140,74,13,0.6)" : "rgba(255,255,255,0.15)" }]}>
              {toSym}
            </Text>
          </View>
        </View>
      </View>
      <View style={cx.presets}>
        {(mode === "mxn" ? [100, 500, 1000] : [5, 20, 50]).map(q => (
          <Pressable
            key={q}
            onPress={() => setValue(String(q))}
            style={({ pressed }) => [cx.preset, value === String(q) && cx.presetActive, pressed && { opacity: 0.7 }]}
          >
            <Text style={[cx.presetText, value === String(q) && cx.presetTextActive]}>{fromSym}{q}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const cx = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: "rgba(140,74,13,0.4)", borderTopWidth: 2, borderTopColor: Colors.ochre, backgroundColor: "#141210" },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(140,74,13,0.12)" },
  eyebrow: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 2, color: Colors.ochre, textTransform: "uppercase", marginBottom: 2 },
  rate: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textTertiary, letterSpacing: 0.5 },
  toggleBtn: { borderWidth: 1, borderColor: "rgba(140,74,13,0.3)", paddingHorizontal: 10, paddingVertical: 6 },
  toggleText: { fontFamily: "Inter_400Regular", fontSize: 11, letterSpacing: 1, color: Colors.ochre, textTransform: "uppercase" },
  body: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 20, gap: 16, alignItems: "flex-end" },
  col: { flex: 1 },
  colLabel: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 2, color: Colors.textTertiary, textTransform: "uppercase", marginBottom: 8 },
  inputRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  sym: { fontFamily: "Inter_400Regular", fontSize: 20, color: "rgba(255,255,255,0.2)" },
  input: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 26, color: Colors.textPrimary, borderBottomWidth: 1, borderBottomColor: "rgba(140,74,13,0.35)", paddingBottom: 4, minWidth: 80 },
  resultNum: { fontFamily: "Inter_400Regular", fontSize: 26, letterSpacing: -0.5 },
  divider: { width: 1, height: 40, backgroundColor: "rgba(140,74,13,0.15)", alignSelf: "flex-end", marginBottom: 8 },
  presets: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingBottom: 16 },
  preset: { borderWidth: 1, borderColor: "rgba(140,74,13,0.2)", paddingHorizontal: 12, paddingVertical: 6 },
  presetActive: { backgroundColor: Colors.ochre, borderColor: Colors.ochre },
  presetText: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary },
  presetTextActive: { color: "#fff", fontFamily: "Inter_600SemiBold" },
});

function ArticleRow({ article }: { article: Article }) {
  const img = getImage(article.hero_image_url ?? article.imageKey);
  const accent = getAccentColor(article.accentColor);
  return (
    <Pressable onPress={() => router.push(`/article/${article.id}` as any)} style={({ pressed }) => [s.row, pressed && { opacity: 0.82 }]}>
      <Image source={img} style={s.rowImg} resizeMode="cover" />
      <View style={s.rowBody}>
        <View style={[s.accentBar, { backgroundColor: accent }]} />
        <Text style={s.rowType}>{(article.subcategory ?? article.type ?? "").toUpperCase()}</Text>
        <Text style={s.rowTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{article.subtitle}</Text>
        <Text style={s.rowRead}>{article.read_time_minutes ? `${article.read_time_minutes} min` : article.readTime}</Text>
      </View>
    </Pressable>
  );
}

function AgendaHighlight({ article }: { article: Article }) {
  const img = article.hero_image_url ? { uri: article.hero_image_url } : getImage(article.imageKey);
  return (
    <Pressable
      onPress={() => router.push(`/article/${article.id}` as any)}
      style={({ pressed }) => [s.agendaWrap, pressed && { opacity: 0.85 }]}
    >
      <ImageBackground source={img} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <LinearGradient
        colors={["rgba(20,18,16,0.18)", "rgba(20,18,16,0.88)", "rgba(20,18,16,0.98)"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.agendaContent}>
        <View style={s.agendaLabelRow}>
          <Text style={s.agendaTag}>AGENDA</Text>
          <Text style={s.agendaTagSep}>·</Text>
          <Text style={s.agendaTagRight}>ESTE MES</Text>
        </View>
        <Text style={s.agendaTitle}>{article.title}</Text>
        <Text style={s.agendaSub} numberOfLines={2}>{article.subtitle}</Text>
        <Text style={s.agendaCta}>Ver agenda completa →</Text>
      </View>
    </Pressable>
  );
}

function FeaturedLongRead({ article }: { article: Article }) {
  const img = article.hero_image_url ? { uri: article.hero_image_url } : getImage(article.hero_image_url ?? article.imageKey);
  return (
    <Pressable
      onPress={() => router.push(`/article/${article.id}` as any)}
      style={({ pressed }) => [s.featuredWrap, pressed && { opacity: 0.85 }]}
    >
      <View style={s.featuredImgWrap}>
        <Image source={img} style={s.featuredImg} resizeMode="cover" />
        <LinearGradient
          colors={["transparent", "rgba(10,10,10,0.7)", "rgba(10,10,10,0.98)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ position: "absolute", top: 16, left: 20 }}>
          <Text style={s.featuredTag}>Para leer sin prisa</Text>
        </View>
      </View>
      <View style={s.featuredBody}>
        <Text style={s.featuredMeta}>{article.subcategory ?? article.type} · {article.read_time_minutes ? `${article.read_time_minutes} min` : article.readTime}</Text>
        <Text style={s.featuredTitle}>{article.title}</Text>
        <Text style={s.featuredSub} numberOfLines={3}>{article.subtitle}</Text>
        <Text style={s.featuredCta}>Leer ahora →</Text>
      </View>
    </Pressable>
  );
}

export default function MexicoAhoraScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [notaEditor, setNotaEditor] = useState<NotaEditor | null>(null);

  useEffect(() => {
    fetchJson<NotaEditor>("/api/personalization/nota-editor")
      .then(setNotaEditor)
      .catch(() => {});
  }, []);

  const { data: articles = [], isLoading, refetch } = useQuery<Article[]>({
    queryKey: ["articles", "mexico-ahora"],
    queryFn: () => fetchJson<Article[]>("/api/articles"),
  });

  const mexicoAhoraArticles = articles.filter((a: Article) => a.pillar === "mexico-ahora");
  const featured = mexicoAhoraArticles[0];
  const agenda = mexicoAhoraArticles.find((a: Article) => a.subcategory === "agenda");
  const rest = mexicoAhoraArticles.filter((a: Article) => a.id !== featured?.id && a.id !== agenda?.id);

  const hoy = new Date();
  const dateLabel = hoy.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

  type Item =
    | { kind: "header" }
    | { kind: "editor-note" }
    | { kind: "section-agenda" }
    | { kind: "agenda"; article: Article }
    | { kind: "section-importa" }
    | { kind: "article"; article: Article; index: number; total: number }
    | { kind: "section-reloj" }
    | { kind: "clock" }
    | { kind: "conversor" }
    | { kind: "section-fondo" }
    | { kind: "featured"; article: Article }
    | { kind: "footer" };

  const items: Item[] = [{ kind: "header" }];
  if (notaEditor) items.push({ kind: "editor-note" });
  if (agenda) {
    items.push({ kind: "section-agenda" });
    items.push({ kind: "agenda", article: agenda });
  }
  if (rest.length > 0) {
    items.push({ kind: "section-importa" });
    rest.forEach((a: Article, i: number) => items.push({ kind: "article", article: a, index: i + 1, total: rest.length }));
  }
  items.push({ kind: "section-reloj" });
  items.push({ kind: "clock" });
  items.push({ kind: "conversor" });
  if (featured) {
    items.push({ kind: "section-fondo" });
    items.push({ kind: "featured", article: featured });
  }
  items.push({ kind: "footer" });

  const renderItem = ({ item }: { item: Item }) => {
    if (item.kind === "header") {
      return (
        <View style={[s.masthead, { paddingTop: topPad + Space.sm }]}>
          <View style={s.statusRow}>
            <PulseDot color={Colors.ochre} size={7} />
            <Text style={s.statusText}>En vivo · Madrid · {dateLabel}</Text>
          </View>
          <Masthead title="México Ahora" accent={Colors.ochre} />
        </View>
      );
    }
    if (item.kind === "editor-note") {
      if (!notaEditor) return null;
      return (
        <View style={s.editorNote}>
          <Kicker color={Colors.ochre} withRule>Carta desde {notaEditor.lugar}</Kicker>
          <View style={{ height: Space.md }} />
          <Standfirst size="large">{notaEditor.texto}</Standfirst>
          <Text style={s.editorSig}>— La redacción · {dateLabel}</Text>
        </View>
      );
    }
    if (item.kind === "section-agenda") {
      return (
        <View style={s.sectionOpenerWrap}>
          <SectionOpener serial={1} label="Agenda" accent={Colors.ochre} />
        </View>
      );
    }
    if (item.kind === "agenda") return <AgendaHighlight article={item.article} />;
    if (item.kind === "section-importa") {
      return (
        <View style={s.sectionOpenerWrap}>
          <SectionOpener serial={2} label="Lo que importa ahora" accent={Colors.ochre} />
        </View>
      );
    }
    if (item.kind === "article") return <ArticleRow article={item.article} />;
    if (item.kind === "section-reloj") {
      return (
        <View style={s.sectionOpenerWrap}>
          <SectionOpener serial={3} label="Reloj de redacción" accent={Colors.ochre} />
        </View>
      );
    }
    if (item.kind === "clock") return <DualClock />;
    if (item.kind === "conversor") return <ConvertidorMXN />;
    if (item.kind === "section-fondo") {
      return (
        <View style={s.sectionOpenerWrap}>
          <SectionOpener serial={4} label="A fondo" accent={Colors.ochre} />
        </View>
      );
    }
    if (item.kind === "featured") return <FeaturedLongRead article={item.article} />;
    if (item.kind === "footer") {
      return (
        <View style={s.footer}>
          <Rule color={Colors.ochre} thickness="rule" style={{ opacity: 0.4, marginBottom: Space.md }} />
          <Text style={s.footerText}>México Ahora · XICO Madrid · {new Date().getFullYear()}</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={s.container}>
      {isLoading ? (
        <XicoLoader color={Colors.ochre} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => `${it.kind}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.ochre} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  masthead: {
    paddingHorizontal: Space.lg,
    paddingBottom: Space.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140,74,13,0.2)",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
    marginBottom: Space.sm,
  },
  statusText: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro + 1,
    color: Colors.ochre,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
  editorNote: {
    paddingHorizontal: Space.lg,
    paddingTop: Space.xl,
    paddingBottom: Space.xl,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(140,74,13,0.18)",
    gap: 0,
  },
  editorSig: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.caption,
    color: Colors.textTertiary,
    letterSpacing: Tracking.tight,
    marginTop: Space.lg,
  },
  sectionOpenerWrap: {
    paddingHorizontal: Space.lg,
    marginTop: Space.md,
  },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.ochre },
  row: { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, gap: 14, alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 16 },
  rowImg: { width: 80, height: 108, backgroundColor: Colors.surfaceHigh },
  rowBody: { flex: 1, gap: 3 },
  accentBar: { width: 22, height: 2, borderRadius: 1, marginBottom: 3 },
  rowType: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 2, color: Colors.textTertiary },
  rowTitle: { fontFamily: "Newsreader_600SemiBold", fontSize: 19, lineHeight: 23, color: Colors.textPrimary },
  rowSub: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  rowRead: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  agendaWrap: { marginHorizontal: 16, marginBottom: 8, height: 200, overflow: "hidden", position: "relative", borderLeftWidth: 3, borderLeftColor: Colors.ochre },
  agendaContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 },
  agendaLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  agendaTag: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 2.5, color: Colors.ochre, textTransform: "uppercase" },
  agendaTagSep: { color: "rgba(255,255,255,0.2)", fontSize: 10 },
  agendaTagRight: { fontFamily: "Inter_400Regular", fontSize: 11, letterSpacing: 2, color: Colors.textTertiary, textTransform: "uppercase" },
  agendaTitle: { fontFamily: "Newsreader_300Light", fontSize: 26, lineHeight: 30, color: "#fff", marginBottom: 14 },
  agendaSub: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 15, lineHeight: 22, color: Colors.textSecondary, marginBottom: 18 },
  agendaCta: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 2.5, color: Colors.ochre, textTransform: "uppercase" },
  featuredWrap: { marginTop: 24, backgroundColor: "#0a0a0a", borderTopWidth: 1, borderTopColor: "rgba(140,74,13,0.15)" },
  featuredImgWrap: { width: "100%", aspectRatio: 16/9, position: "relative", overflow: "hidden" },
  featuredImg: { width: "100%", height: "100%" },
  featuredTag: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 2, color: Colors.ochre, textTransform: "uppercase" },
  featuredBody: { padding: 24 },
  featuredMeta: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textTertiary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 },
  featuredTitle: { fontFamily: "Newsreader_300Light", fontSize: 34, lineHeight: 38, color: "#fff", letterSpacing: -0.5, marginBottom: 12 },
  featuredSub: { fontFamily: "Newsreader_300Light_Italic", fontStyle: "italic", fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.5)", marginBottom: 20 },
  featuredCta: { fontFamily: "Inter_700Bold", fontSize: 11, letterSpacing: 2.5, color: Colors.ochre, textTransform: "uppercase" },
  footer: { paddingHorizontal: 24, paddingVertical: 24, borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 16, alignItems: "center" },
  footerText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textTertiary, letterSpacing: 2, textTransform: "uppercase" },
});