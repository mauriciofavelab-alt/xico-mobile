import { useQuery } from "@tanstack/react-query";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { fetchJson, API_BASE } from "@/constants/api";
import { getImage } from "@/constants/imageMap";
import { usePassport, trackArticleRead, trackSaved } from "@/hooks/usePassport";
import { trackReadContext } from "@/hooks/useUserCriterion";
import { StampNotification } from "@/components/StampNotification";

type ApiArticle = {
  id: string; slug?: string; title?: string; subtitle?: string;
  excerpt?: string; body?: string; pillar?: string; subcategory?: string;
  author_name?: string; read_time_minutes?: number; is_featured?: boolean;
  created_at?: string | null; published_at?: string | null; hero_image_url?: string;
};

function getImageForArticle(a: ApiArticle) {
  if (a.hero_image_url) return { uri: a.hero_image_url };
  if (a.pillar === "mexico-ahora") return getImage("arte-mesoamerica");
  if (a.pillar === "cultura") return getImage("arte-contemporaneo");
  return getImage("artesania-mexicana");
}

function getDateLabel(a: ApiArticle): string {
  const raw = a.published_at || a.created_at;
  if (!raw) return "2026";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "2026";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

function legacyIdMatches(a: ApiArticle, routeId: string): boolean {
  if (!routeId.startsWith("art-")) return false;
  const map: Record<string, string> = {
    "art-001": "bienvenida-xico", "art-002": "mexico-ahora-madrid",
    "art-003": "la-nueva-ola-gastronomica", "art-004": "arte-contemporaneo-mexicano",
    "art-005": "historias-migrantes",
  };
  return a.slug === map[routeId];
}

const ACCENT: Record<string, string> = {
  cultura: "hsl(220, 100%, 55%)",
  "mexico-ahora": "hsl(25, 90%, 55%)",
  "mi-xico": "hsl(160, 80%, 45%)",
  indice: "hsl(335, 85%, 60%)",
  portada: "hsl(335, 85%, 60%)",
};

function getAccent(pillar?: string) {
  return ACCENT[pillar ?? ""] ?? "hsl(335, 85%, 60%)";
}

function stripHtml(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function isQuote(para: string): boolean {
  return para.startsWith('"') || para.startsWith('“') || para.startsWith('—') || para.startsWith('—') || para.startsWith('«');
}

function ArticleBody({ body, accent }: { body: string; accent: string }) {
  if (!body) return null;
  const clean = stripHtml(body);
  const normalized = clean.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const paragraphs = normalized.includes("\n\n")
    ? normalized.split("\n\n").map(p => p.replace(/\n/g, " ").trim()).filter(Boolean)
    : [normalized.replace(/\n/g, " ").trim()];

  return (
    <View>
      {paragraphs.map((para, i) => {
        if (i === 0 && para.length > 0) {
          const dropLetter = para.charAt(0);
          const rest = para.slice(1);
          return (
            <View key={i} style={body_s.dropCapRow}>
              <View style={body_s.dropCapBox}>
                <Text style={[body_s.dropCap, { color: accent }]}>{dropLetter}</Text>
              </View>
              <View style={body_s.dropCapRest}>
                <Text style={body_s.firstParaRest}>{rest}</Text>
              </View>
            </View>
          );
        }
        if (isQuote(para)) {
          return (
            <View key={i} style={[body_s.quoteBlock, { borderLeftColor: accent }]}>
              <Text style={body_s.quoteText}>{para}</Text>
            </View>
          );
        }
        return <Text key={i} style={body_s.para}>{para}</Text>;
      })}
    </View>
  );
}

const body_s = StyleSheet.create({
  dropCapRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 22,
    gap: 8,
  },
  dropCapBox: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  dropCap: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 72,
    lineHeight: 60,
  },
  dropCapRest: {
    flex: 1,
    paddingTop: 4,
  },
  firstParaRest: {
    fontFamily: "CormorantGaramond_400Regular",
    fontSize: 20,
    lineHeight: 32,
    color: "rgba(240,236,230,0.95)",
    letterSpacing: 0.1,
  },
  quoteBlock: {
    borderLeftWidth: 2,
    paddingLeft: 16,
    marginVertical: 8,
    marginBottom: 22,
  },
  quoteText: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontStyle: "italic",
    fontSize: 21,
    lineHeight: 31,
    color: "rgba(240,236,230,0.88)",
    letterSpacing: -0.1,
  },
  para: {
    fontFamily: "CormorantGaramond_400Regular",
    fontSize: 18,
    lineHeight: 30,
    color: "rgba(220,215,208,0.88)",
    letterSpacing: 0.1,
    marginBottom: 22,
  },
});

export default function ArticleScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [scrollPercent, setScrollPercent] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const [sound, setSound] = useState<any>(null);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const { earn, newStamp, dismissStamp } = usePassport();

  const params = useLocalSearchParams<{ id: string | string[] }>();
  const rawId = params.id;
  const routeId = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data: articles = [], isLoading, error, refetch } = useQuery<ApiArticle[]>({
    queryKey: ["articles", "detail"],
    queryFn: () => fetchJson<ApiArticle[]>("/api/articles"),
  });

  const article = useMemo(() => {
    if (!routeId) return null;
    return articles.find(a => a.id === routeId || a.slug === routeId || legacyIdMatches(a, routeId));
  }, [articles, routeId]);

  useEffect(() => {
    if (!article) return;
    trackArticleRead(earn);
    trackReadContext(article.pillar, article.subcategory);
    fetch(`${API_BASE}/api/saved/${article.id}/status`)
      .then(r => r.json()).then(d => setSaved(d.saved)).catch(() => {});
  }, [article]);

  const toggleSave = async () => {
    if (!article) return;
    const method = saved ? "DELETE" : "POST";
    await fetch(`${API_BASE}/api/saved/${article.id}`, { method });
    if (!saved) await trackSaved(earn);
    setSaved(!saved);
  };

  const handleShare = async () => {
    if (!article) return;
    try { await Share.share({ message: `${article.title} — XICO`, title: article.title }); } catch (_) {}
  };

  const handleAudio = async () => {
    if (playing) {
      if (sound) {
        try { await sound.stopAsync(); await sound.unloadAsync(); } catch (_) {}
        setSound(null);
      }
      setPlaying(false);
      return;
    }
    if (!article) return;
    const text = (article.body || article.excerpt || "").slice(0, 2000);
    if (!text) return;

    if (Platform.OS === "web") {
      try {
        setAudioLoading(true);
        const uri = `${API_BASE}/api/tts?text=${encodeURIComponent(text)}`;
        const audio = new (window as any).Audio();
        audio.src = uri;
        audio.oncanplay = () => { setAudioLoading(false); setPlaying(true); audio.play(); };
        audio.onended = () => setPlaying(false);
        audio.onerror = () => { setPlaying(false); setAudioLoading(false); };
        audio.load();
      } catch (e) { setPlaying(false); setAudioLoading(false); }
      return;
    }

    try {
      setAudioLoading(true);
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const uri = `${API_BASE}/api/tts?text=${encodeURIComponent(text)}`;
      const response = await fetch(uri);
      if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${base64}` }
      );
      setSound(newSound);
      setPlaying(true);
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setPlaying(false); setSound(null);
          newSound.unloadAsync().catch(() => {});
        }
      });
    } catch (e) {
      console.error("TTS error", e);
      setPlaying(false); setSound(null);
    } finally { setAudioLoading(false); }
  };

  if (isLoading) {
    return (
      <View style={s.center}>
        <Text style={s.loadingLogo}>XICO</Text>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={s.center}>
        <Text style={s.errorTitle}>No pudimos cargar este artículo</Text>
        <Pressable onPress={() => router.back()} style={s.btn}><Text style={s.btnText}>← Volver</Text></Pressable>
        <Pressable onPress={() => refetch()} style={[s.btn, { marginTop: 10 }]}><Text style={s.btnText}>Reintentar</Text></Pressable>
      </View>
    );
  }

  const accent = getAccent(article.pillar);
  const img = getImageForArticle(article);
  const section = (article.subcategory || article.pillar || "Artículo").replace(/-/g, " ").toUpperCase();
  const dateLabel = getDateLabel(article);
  const readTime = article.read_time_minutes || 4;
  const body = article.body || article.excerpt || "";

  const sectionRoute = article.pillar === "cultura" ? "/(tabs)/cultura"
    : article.pillar === "mexico-ahora" ? "/(tabs)/mexico-ahora"
    : "/(tabs)";
  const sectionName = article.pillar === "cultura" ? "Cultura"
    : article.pillar === "mexico-ahora" ? "México Ahora"
    : "Índice";

  return (
    <View style={s.root}>
      {/* Barra de progreso de lectura */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${scrollPercent}%` as any, backgroundColor: accent }]} />
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const total = contentSize.height - layoutMeasurement.height;
          if (total > 0) setScrollPercent(Math.min(100, (contentOffset.y / total) * 100));
        }}
      >
        {/* HERO */}
        <View style={s.heroWrap}>
          <Image source={img} style={s.heroImg} resizeMode="cover" />
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)", "rgba(8,5,8,0.98)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <Pressable onPress={() => router.back()} style={[s.backBtn, { top: topPad + 8 }]}>
            <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.85)" />
          </Pressable>
        </View>

        {/* HEADER */}
        <View style={s.headerWrap}>
          <Text style={[s.sectionLabel, { color: accent }]}>{section}</Text>
          <Text style={s.title}>{article.title}</Text>
          {!!article.subtitle && <Text style={s.subtitle}>{article.subtitle}</Text>}

          <View style={s.divider} />

          <View style={s.metaRow}>
            <View style={s.metaLeft}>
              <Text style={s.authorLabel}>Por</Text>
              <Text style={s.authorName}>{article.author_name || "Equipo XICO"}</Text>
              <Text style={s.dateMeta}>{dateLabel}</Text>
            </View>
            <Pressable
              onPress={handleAudio}
              disabled={audioLoading}
              style={({ pressed }) => [
                s.audioPill,
                { borderColor: accent, backgroundColor: "transparent" },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Feather name={playing ? "pause" : "headphones"} size={13} color="#fff" />
              <Text style={s.audioPillText}>
                {playing ? "Pausar" : `${readTime} min`}
              </Text>
            </Pressable>
          </View>

          <View style={s.divider} />

          <View style={s.actionsRow}>
            <Pressable onPress={toggleSave} style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.6 }]}>
              <Feather name="bookmark" size={16} color={saved ? accent : "rgba(255,255,255,0.3)"} />
              <Text style={[s.actionLabel, saved && { color: accent }]}>{saved ? "Guardado" : "Guardar"}</Text>
            </Pressable>
            <Pressable onPress={handleShare} style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.6 }]}>
              <Feather name="share" size={16} color="rgba(255,255,255,0.3)" />
              <Text style={s.actionLabel}>Compartir</Text>
            </Pressable>
          </View>
        </View>

        {/* BODY */}
        <View style={s.bodyWrap}>
          {body ? <ArticleBody body={body} accent={accent} /> : <Text style={s.noBody}>Contenido no disponible.</Text>}
          <View style={s.endMarker}>
            <View style={[s.endLine, { backgroundColor: accent }]} />
            <Text style={[s.endText, { color: accent }]}>XICO</Text>
            <View style={[s.endLine, { backgroundColor: accent }]} />
          </View>

          <Pressable
            onPress={() => router.push(sectionRoute as any)}
            style={({ pressed }) => [s.sectionLink, pressed && { opacity: 0.5 }]}
          >
            <Text style={[s.sectionLinkText, { color: accent }]}>
              Seguir en {sectionName} →
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <StampNotification stamp={newStamp} onDismiss={dismissStamp} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#080508" },
  scroll: { flex: 1 },
  progressBg: {
    height: 2, backgroundColor: "rgba(255,255,255,0.05)",
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
  },
  progressFill: { height: 2 },
  center: {
    flex: 1, backgroundColor: "#080508",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 24,
  },
  loadingLogo: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 42, letterSpacing: 14, color: "rgba(255,255,255,0.15)",
  },
  errorTitle: {
    fontFamily: "CormorantGaramond_600SemiBold",
    fontSize: 22, color: Colors.textPrimary, marginBottom: 20, textAlign: "center",
  },
  btn: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 20, paddingVertical: 10 },
  btnText: { fontFamily: "Inter_400Regular", color: Colors.textPrimary, fontSize: 13, letterSpacing: 1 },
  heroWrap: { width: "100%", height: 420, backgroundColor: "#000", overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute", left: 18, zIndex: 10,
    width: 36, height: 36, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 18,
  },
  headerWrap: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 4 },
  sectionLabel: {
    fontFamily: "Inter_700Bold", fontSize: 9,
    letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 14,
  },
  title: {
    fontFamily: "CormorantGaramond_600SemiBold", fontSize: 34,
    lineHeight: 40, color: "#f8f4ee", letterSpacing: -0.4, marginBottom: 14,
  },
  subtitle: {
    fontFamily: "CormorantGaramond_300Light_Italic", fontStyle: "italic",
    fontSize: 18, lineHeight: 27, color: "rgba(220,215,205,0.58)", marginBottom: 20,
  },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.07)", marginVertical: 16 },
  metaRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  metaLeft: { gap: 3 },
  authorLabel: {
    fontFamily: "Inter_400Regular", fontSize: 9,
    color: "rgba(255,255,255,0.22)", letterSpacing: 1, textTransform: "uppercase",
  },
  authorName: {
    fontFamily: "Inter_600SemiBold", fontSize: 11,
    color: "rgba(255,255,255,0.55)", letterSpacing: 1.5, textTransform: "uppercase",
  },
  dateMeta: {
    fontFamily: "Inter_400Regular", fontSize: 9,
    color: "rgba(255,255,255,0.22)", letterSpacing: 0.5, marginTop: 2,
  },
  audioPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: "transparent",
  },
  audioPillText: { fontFamily: "Inter_500Medium", fontSize: 11, letterSpacing: 0.3, color: "#fff" },
  actionsRow: { flexDirection: "row", gap: 24, paddingVertical: 4 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 7 },
  actionLabel: {
    fontFamily: "Inter_400Regular", fontSize: 11,
    color: "rgba(255,255,255,0.28)", letterSpacing: 0.5,
  },
  bodyWrap: { paddingHorizontal: 26, paddingTop: 32, paddingBottom: 60 },
  noBody: {
    fontFamily: "CormorantGaramond_300Light_Italic", fontStyle: "italic",
    fontSize: 18, color: "rgba(255,255,255,0.35)",
  },
  endMarker: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 40, marginBottom: 20 },
  endLine: { flex: 1, height: 1, opacity: 0.35 },
  endText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 4, opacity: 0.55 },
  sectionLink: { alignItems: "center", paddingVertical: 20 },
  sectionLinkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    opacity: 0.6,
  },
});