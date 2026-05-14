import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Colors, getAccentColor } from "@/constants/colors";
import { Fonts, Hairline, lh, Space, Tracking, TypeSize } from "@/constants/editorial";
import { fetchJson, API_BASE } from "@/constants/api";
import { getImage } from "@/constants/imageMap";
import { usePassport, trackArticleRead, trackSaved } from "@/hooks/usePassport";
import { trackReadContext } from "@/hooks/useUserCriterion";
import { AudioPlayer } from "@/components/AudioPlayer";
import { StampNotification } from "@/components/StampNotification";
import { XicoLoader } from "@/components/XicoLoader";
import {
  ByLine,
  Caption,
  DropCap,
  FolioNumber,
  Kicker,
  PullQuote,
  RevealOnMount,
  Rule,
  Standfirst,
} from "@/components/editorial";

type ApiArticle = {
  id: string; slug?: string; title?: string; subtitle?: string;
  excerpt?: string; body?: string; pillar?: string; subcategory?: string;
  author_name?: string; read_time_minutes?: number; is_featured?: boolean;
  created_at?: string | null; published_at?: string | null; hero_image_url?: string;
  hero_caption?: string; photographer_credit?: string; translator_name?: string;
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
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
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

function isShortQuote(para: string): boolean {
  return para.startsWith('"') || para.startsWith("“") || para.startsWith("—") || para.startsWith("«");
}

type BodyBlock =
  | { kind: "para"; text: string }
  | { kind: "subhead"; text: string }
  | { kind: "pullquote"; text: string; attribution?: string }
  | { kind: "caption"; text: string; credit?: string }
  | { kind: "quote"; text: string };

function parseBody(body: string): BodyBlock[] {
  const clean = stripHtml(body);
  const normalized = clean.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const paragraphs = normalized.includes("\n\n")
    ? normalized.split("\n\n").map(p => p.replace(/\n/g, " ").trim()).filter(Boolean)
    : [normalized.replace(/\n/g, " ").trim()].filter(Boolean);

  return paragraphs.map<BodyBlock>((para) => {
    if (para.startsWith("## ")) {
      return { kind: "subhead", text: para.slice(3).trim() };
    }
    if (para.startsWith(">> ")) {
      const rest = para.slice(3).trim();
      const dashIdx = rest.lastIndexOf(" — ");
      if (dashIdx > 0) {
        return {
          kind: "pullquote",
          text: rest.slice(0, dashIdx).trim(),
          attribution: rest.slice(dashIdx + 3).trim(),
        };
      }
      return { kind: "pullquote", text: rest };
    }
    if (para.startsWith("[caption:") && para.endsWith("]")) {
      const inner = para.slice(9, -1).trim();
      const pipeIdx = inner.lastIndexOf(" | ");
      if (pipeIdx > 0) {
        return {
          kind: "caption",
          text: inner.slice(0, pipeIdx).trim(),
          credit: inner.slice(pipeIdx + 3).trim(),
        };
      }
      return { kind: "caption", text: inner };
    }
    if (isShortQuote(para)) {
      return { kind: "quote", text: para };
    }
    return { kind: "para", text: para };
  });
}

function ArticleBody({ body, accent, subcategory }: { body: string; accent: string; subcategory?: string }) {
  if (!body) return null;
  const blocks = parseBody(body);
  let dropCapUsed = false;

  return (
    <View>
      {blocks.map((block, i) => {
        if (block.kind === "para" && !dropCapUsed) {
          dropCapUsed = true;
          return <DropCap key={i} paragraph={block.text} accent={accent} />;
        }
        if (block.kind === "para") {
          return <Text key={i} style={body_s.para}>{block.text}</Text>;
        }
        if (block.kind === "subhead") {
          return (
            <View key={i} style={body_s.subheadBlock}>
              <Kicker color={accent} size="small">{subcategory ?? "Sección"}</Kicker>
              <Text style={body_s.subhead}>{block.text}</Text>
            </View>
          );
        }
        if (block.kind === "pullquote") {
          return (
            <PullQuote key={i} accent={accent} attribution={block.attribution}>
              {block.text}
            </PullQuote>
          );
        }
        if (block.kind === "caption") {
          return <Caption key={i} text={block.text} credit={block.credit} />;
        }
        return (
          <View key={i} style={[body_s.quoteBlock, { borderLeftColor: accent }]}>
            <Text style={body_s.quoteText}>{block.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

const body_s = StyleSheet.create({
  para: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.lede,
    lineHeight: lh(TypeSize.lede, 1.65),
    color: Colors.textPrimary,
    opacity: 0.88,
    letterSpacing: Tracking.body,
    marginBottom: Space.lg,
  },
  subheadBlock: {
    gap: Space.sm,
    marginTop: Space.xl,
    marginBottom: Space.md,
  },
  subhead: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.subhead,
    lineHeight: lh(TypeSize.subhead, 1.25),
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  quoteBlock: {
    borderLeftWidth: Hairline.bold,
    paddingLeft: Space.base,
    marginVertical: Space.sm,
    marginBottom: Space.lg,
  },
  quoteText: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.subhead - 1,
    lineHeight: lh(TypeSize.subhead - 1, 1.5),
    color: Colors.textPrimary,
    opacity: 0.85,
    letterSpacing: Tracking.tight,
  },
});

export default function ArticleScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [scrollPercent, setScrollPercent] = useState(0);
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
    return articles.find((a: ApiArticle) => a.id === routeId || a.slug === routeId || legacyIdMatches(a, routeId));
  }, [articles, routeId]);

  useEffect(() => {
    if (!article) return;
    trackArticleRead(earn);
    trackReadContext(article.pillar, article.subcategory);
    fetchJson<{ saved: boolean }>(`/api/saved/${article.id}/status`)
      .then(d => setSaved(d.saved))
      .catch(() => {});
  }, [article]);

  const toggleSave = async () => {
    if (!article) return;
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      await fetchJson(`/api/saved/${article.id}`, { method: wasSaved ? "DELETE" : "POST" });
      if (!wasSaved) await trackSaved(earn);
    } catch {
      setSaved(wasSaved);
    }
  };

  const handleShare = async () => {
    if (!article) return;
    try { await Share.share({ message: `${article.title} — XICO`, title: article.title }); } catch (_) {}
  };

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      "worklet";
      scrollY.value = e.contentOffset.y;
      const total = e.contentSize.height - e.layoutMeasurement.height;
      if (total > 0) {
        const pct = Math.min(100, Math.max(0, (e.contentOffset.y / total) * 100));
        runOnJS(setScrollPercent)(pct);
      }
    },
  });

  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.35 }],
  }));

  if (isLoading) {
    return (
      <View style={s.center}>
        <XicoLoader />
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

  const accent = getAccentColor(article.subcategory ?? article.pillar ?? "");
  const img = getImageForArticle(article);
  const section = (article.subcategory || article.pillar || "Artículo").replace(/-/g, " ");
  const dateLabel = getDateLabel(article);
  const readTime = article.read_time_minutes || 4;
  const body = article.body || article.excerpt || "";

  const sectionRoute = article.pillar === "cultura" ? "/(tabs)/cultura"
    : article.pillar === "mexico-ahora" ? "/(tabs)/mexico-ahora"
    : "/(tabs)";
  const sectionName = article.pillar === "cultura" ? "Cultura"
    : article.pillar === "mexico-ahora" ? "México Ahora"
    : "Índice";

  const articleIndex = articles.findIndex((a: ApiArticle) => a.id === article.id);
  const folioNumber = articleIndex >= 0 ? articleIndex + 1 : undefined;

  const nextArticle = articles.find(
    (a: ApiArticle) => a.pillar === article.pillar && a.id !== article.id && a.slug !== routeId
  ) ?? null;

  return (
    <View style={s.root}>
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${scrollPercent}%` as any, backgroundColor: accent }]} />
      </View>

      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        {/* HERO + caption */}
        <View>
          <View style={s.heroWrap}>
            <Animated.View style={[s.heroParallaxWrap, heroParallax]}>
              <Image source={img} style={s.heroImg} resizeMode="cover" />
            </Animated.View>
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.1)", "rgba(8,5,8,0.98)"]}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
            <Pressable onPress={() => router.back()} style={[s.backBtn, { top: topPad + 8 }]}>
              <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFill} />
              <Feather name="arrow-left" size={18} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          {(article.hero_caption || article.photographer_credit) && (
            <Caption text={article.hero_caption} credit={article.photographer_credit} />
          )}
        </View>

        {/* HEADER */}
        <View style={s.headerWrap}>
          <RevealOnMount index={0}>
            <View style={s.folioRow}>
              <Kicker color={accent}>{section}</Kicker>
              {folioNumber !== undefined && (
                <FolioNumber number={folioNumber} total={articles.length} align="right" />
              )}
            </View>
          </RevealOnMount>

          <RevealOnMount index={1}>
            <Text style={s.title}>{article.title}</Text>
          </RevealOnMount>

          {!!article.subtitle && (
            <RevealOnMount index={2}>
              <View style={{ marginTop: Space.md }}>
                <Standfirst>{article.subtitle}</Standfirst>
              </View>
            </RevealOnMount>
          )}

          <RevealOnMount index={3}>
            <Rule style={{ marginVertical: Space.lg }} />
          </RevealOnMount>

          <RevealOnMount index={4}>
            <ByLine
              author={article.author_name || "Equipo XICO"}
              photographer={article.photographer_credit}
              translator={article.translator_name}
              date={dateLabel}
              readTime={`${readTime} min`}
              accent={accent}
            />
          </RevealOnMount>

          <RevealOnMount index={5}>
            <Rule style={{ marginVertical: Space.lg }} />
          </RevealOnMount>

          <RevealOnMount index={6}>
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
          </RevealOnMount>

          {!!(article.body || article.excerpt) && (
            <RevealOnMount index={7}>
              <AudioPlayer
                ttsUri={`${API_BASE}/api/tts?text=${encodeURIComponent((article.body || article.excerpt || "").slice(0, 2000))}`}
                accent={accent}
              />
            </RevealOnMount>
          )}
        </View>

        {/* BODY */}
        <View style={s.bodyWrap}>
          {body ? <ArticleBody body={body} accent={accent} subcategory={article.subcategory} /> : <Text style={s.noBody}>Contenido no disponible.</Text>}
          <View style={s.endMarker}>
            <View style={[s.endLine, { backgroundColor: accent }]} />
            <Text style={[s.endText, { color: accent }]}>XICO</Text>
            <View style={[s.endLine, { backgroundColor: accent }]} />
          </View>

          {nextArticle && (
            <Pressable
              onPress={() => router.push(`/article/${nextArticle.id}` as any)}
              style={({ pressed }) => [s.nextCard, pressed && { opacity: 0.85 }]}
            >
              <Text style={s.nextEye}>CONTINÚA LEYENDO</Text>
              <View style={s.nextInner}>
                <Image source={getImageForArticle(nextArticle)} style={s.nextImg} resizeMode="cover" />
                <View style={s.nextBody}>
                  <View style={[s.nextAccent, { backgroundColor: accent }]} />
                  <Text style={[s.nextTag, { color: accent }]}>
                    {(nextArticle.subcategory ?? nextArticle.pillar ?? "").replace(/-/g, " ").toUpperCase()}
                  </Text>
                  <Text style={s.nextTitle} numberOfLines={3}>{nextArticle.title}</Text>
                  {!!nextArticle.read_time_minutes && (
                    <Text style={s.nextRead}>{nextArticle.read_time_minutes} min</Text>
                  )}
                </View>
              </View>
            </Pressable>
          )}

          <Pressable
            onPress={() => router.push(sectionRoute as any)}
            style={({ pressed }) => [s.sectionLink, pressed && { opacity: 0.5 }]}
          >
            <Text style={[s.sectionLinkText, { color: accent }]}>
              Seguir en {sectionName} →
            </Text>
          </Pressable>
        </View>
      </Animated.ScrollView>

      <StampNotification stamp={newStamp} onDismiss={dismissStamp} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  progressBg: {
    height: Hairline.bold, backgroundColor: "rgba(255,255,255,0.05)",
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
  },
  progressFill: { height: Hairline.bold },
  center: {
    flex: 1, backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center", paddingHorizontal: Space.lg,
  },
  errorTitle: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.subhead, color: Colors.textPrimary, marginBottom: Space.lg, textAlign: "center",
  },
  btn: { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Space.lg, paddingVertical: 10 },
  btnText: { fontFamily: Fonts.sansRegular, color: Colors.textPrimary, fontSize: TypeSize.meta, letterSpacing: Tracking.wide },
  heroWrap: { width: "100%", height: 480, backgroundColor: "#000", overflow: "hidden" },
  heroParallaxWrap: { width: "100%", height: "115%" },
  heroImg: { width: "100%", height: "100%" },
  backBtn: {
    position: "absolute", left: 14, zIndex: 10,
    width: 44, height: 44, alignItems: "center", justifyContent: "center",
    borderRadius: 22, overflow: "hidden",
  },
  headerWrap: { paddingHorizontal: Space.lg, paddingTop: Space.xl, paddingBottom: Space.xs },
  folioRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: Space.base,
  },
  title: {
    fontFamily: Fonts.serifSemibold, fontSize: TypeSize.display - 2,
    lineHeight: lh(TypeSize.display - 2, 1.12), color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  actionsRow: { flexDirection: "row", gap: Space.lg, paddingVertical: Space.xs },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 7 },
  actionLabel: {
    fontFamily: Fonts.sansRegular, fontSize: TypeSize.caption,
    color: Colors.textTertiary, letterSpacing: 0.5,
  },
  bodyWrap: { paddingHorizontal: Space.lg + 2, paddingTop: Space.xl, paddingBottom: 60 },
  noBody: {
    fontFamily: Fonts.serifLightItalic, fontStyle: "italic",
    fontSize: TypeSize.lede, color: Colors.textTertiary,
  },
  endMarker: { flexDirection: "row", alignItems: "center", gap: Space.md, marginTop: Space.xxl, marginBottom: Space.lg },
  endLine: { flex: 1, height: 1, opacity: 0.35 },
  endText: { fontFamily: Fonts.sansBold, fontSize: TypeSize.micro, letterSpacing: 4, opacity: 0.55 },
  sectionLink: { alignItems: "center", paddingVertical: Space.lg },
  sectionLinkText: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
    opacity: 0.6,
  },
  nextCard: {
    marginTop: Space.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: Space.lg,
    backgroundColor: Colors.surface,
  },
  nextEye: {
    fontFamily: Fonts.sansBold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
    color: Colors.textTertiary,
    textTransform: "uppercase",
    marginBottom: Space.base,
  },
  nextInner: { flexDirection: "row", gap: Space.base, alignItems: "flex-start" },
  nextImg: { width: 72, height: 96, backgroundColor: Colors.surfaceHigh },
  nextBody: { flex: 1, gap: 4 },
  nextAccent: { width: 20, height: Hairline.bold, marginBottom: 4 },
  nextTag: { fontFamily: Fonts.sansSemibold, fontSize: TypeSize.micro, letterSpacing: Tracking.wider },
  nextTitle: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.subhead - 2, lineHeight: 25,
    color: Colors.textPrimary,
  },
  nextRead: {
    fontFamily: Fonts.sansRegular,
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
});
