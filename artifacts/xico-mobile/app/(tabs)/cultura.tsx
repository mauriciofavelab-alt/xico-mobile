import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
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

import { Colors, getAccentColor } from "@/constants/colors";
import { Fonts, lh, Space, Tracking, TypeSize } from "@/constants/editorial";
import { getImage } from "@/constants/imageMap";
import { fetchJson } from "@/constants/api";
import { XicoLoader } from "@/components/XicoLoader";
import { FolioNumber, Kicker, Masthead, RevealOnMount, Rule } from "@/components/editorial";

type Article = {
  id: string;
  pillar: string;
  type: string;
  subcategory: string;
  title: string;
  subtitle: string;
  author: string;
  institution: string;
  imageKey: string;
  readTime: string;
  accentColor: string;
  date: string;
  featured: boolean;
  hero_image_url?: string;
  read_time_minutes?: number;
};

function getArticleImage(article: Article) {
  if (article.hero_image_url) return { uri: article.hero_image_url };
  return getImage(article.hero_image_url ?? article.imageKey);
}

function HeroCard({
  article,
  saved,
  onToggleSave,
}: {
  article: Article;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const img = getArticleImage(article);
  const accent = getAccentColor(article.subcategory ?? article.accentColor);

  return (
    <Pressable
      onPress={() => router.push(`/article/${article.id}` as any)}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir artículo · ${article.title}`}
    >
      <View style={{ overflow: "hidden", marginBottom: 2, backgroundColor: `${Colors.cobalt}08` }}>
        <ImageBackground source={img} style={{ height: 420 }} resizeMode="cover">
          <LinearGradient
            colors={["transparent", `${accent}10`, "rgba(0,0,0,0.95)"]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={{ position: "absolute", top: Space.lg, left: Space.lg }}>
            <Kicker color={accent} withRule>
              {article.subcategory ?? article.type ?? ""}
            </Kicker>
          </View>
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); onToggleSave(article.id); }}
            style={{ position: "absolute", top: Space.base, right: Space.base, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Quitar artículo de guardados" : "Guardar este artículo para leer luego"}
            accessibilityState={{ selected: saved }}
          >
            <Feather name="bookmark" size={18} color={saved ? accent : "rgba(255,255,255,0.45)"} />
          </Pressable>
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: Space.lg, gap: Space.md }}>
            <View style={{ width: 32, height: 2, backgroundColor: accent }} />
            <Text style={{ fontFamily: Fonts.serifSemibold, fontSize: TypeSize.display, lineHeight: lh(TypeSize.display, 1.1), color: "#fff", letterSpacing: Tracking.tight }} numberOfLines={3}>
              {article.title}
            </Text>
            <Text style={{ fontFamily: Fonts.serifLightItalic, fontStyle: "italic", fontSize: TypeSize.body - 1, lineHeight: lh(TypeSize.body - 1, 1.5), color: "rgba(255,255,255,0.7)" }} numberOfLines={2}>
              {article.subtitle}
            </Text>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );
}

function rowVariantForReadTime(min?: number): "brief" | "standard" | "essay" {
  if (!min) return "standard";
  if (min <= 4) return "brief";
  if (min >= 8) return "essay";
  return "standard";
}

function ArticleRow({
  article,
  index,
  total,
  saved,
  onToggleSave,
}: {
  article: Article;
  index: number;
  total: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const img = getArticleImage(article);
  const accent = getAccentColor(article.subcategory ?? article.accentColor);
  const variant = rowVariantForReadTime(article.read_time_minutes);
  const readLabel = article.read_time_minutes ? `${article.read_time_minutes} min` : article.readTime;

  if (variant === "essay") {
    return (
      <Pressable
        onPress={() => router.push(`/article/${article.id}` as any)}
        style={({ pressed }) => [s.essayRow, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={`Ensayo · ${article.title}`}
      >
        <Image source={img} style={s.essayImg} resizeMode="cover" />
        <View style={s.essayBody}>
          <View style={s.essayHeadRow}>
            <Kicker color={accent}>{article.subcategory ?? article.type ?? ""}</Kicker>
            <FolioNumber number={index} total={total} align="right" />
          </View>
          <Text style={s.essayTitle} numberOfLines={3}>{article.title}</Text>
          {!!article.subtitle && (
            <Text style={s.essaySub} numberOfLines={3}>{article.subtitle}</Text>
          )}
          <View style={s.essayFoot}>
            <Text style={s.rowReadEmph}>Ensayo · {readLabel}</Text>
            <Pressable
              onPress={(e) => { e.stopPropagation?.(); onToggleSave(article.id); }}
              hitSlop={8}
              style={{ padding: 4 }}
              accessibilityRole="button"
              accessibilityLabel={saved ? "Quitar ensayo de guardados" : "Guardar este ensayo"}
              accessibilityState={{ selected: saved }}
            >
              <Feather name="bookmark" size={15} color={saved ? accent : "rgba(240,236,230,0.3)"} />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  }

  if (variant === "brief") {
    return (
      <Pressable
        onPress={() => router.push(`/article/${article.id}` as any)}
        style={({ pressed }) => [s.briefRow, pressed && { opacity: 0.82 }]}
        accessibilityRole="button"
        accessibilityLabel={`Pieza breve · ${article.title}`}
      >
        <View style={s.briefBody}>
          <View style={s.briefHeadRow}>
            <Kicker color={accent} size="small">{article.subcategory ?? article.type ?? ""}</Kicker>
            <Text style={s.briefRead}>{readLabel}</Text>
          </View>
          <Text style={s.briefTitle} numberOfLines={2}>{article.title}</Text>
        </View>
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); onToggleSave(article.id); }}
          hitSlop={8}
          style={{ padding: 4 }}
          accessibilityRole="button"
          accessibilityLabel={saved ? "Quitar de guardados" : "Guardar para leer luego"}
          accessibilityState={{ selected: saved }}
        >
          <Feather name="bookmark" size={13} color={saved ? accent : "rgba(240,236,230,0.22)"} />
        </Pressable>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => router.push(`/article/${article.id}` as any)}
      style={({ pressed }) => [s.row, pressed && { opacity: 0.82 }]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir artículo · ${article.title}`}
    >
      <View style={s.rowBody}>
        <View style={s.rowHeadRow}>
          <Kicker color={accent} size="small">{article.subcategory ?? article.type ?? ""}</Kicker>
          <FolioNumber number={index + 1} total={total} align="right" />
        </View>
        <Text style={s.rowTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{article.subtitle}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
          <Text style={s.rowRead}>{readLabel}</Text>
          <Pressable
            onPress={(e) => { e.stopPropagation?.(); onToggleSave(article.id); }}
            hitSlop={8}
            style={{ padding: 4 }}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Quitar de guardados" : "Guardar para leer luego"}
            accessibilityState={{ selected: saved }}
          >
            <Feather name="bookmark" size={14} color={saved ? accent : "rgba(240,236,230,0.25)"} />
          </Pressable>
        </View>
      </View>
      <Image source={img} style={s.rowImg} resizeMode="cover" />
    </Pressable>
  );
}

function SelloCopilBlock() {
  return (
    <View style={s.copilBlock}>
      <Text style={s.copilLabel}>SELLO COPIL</Text>
      <Text style={s.copilTitle}>La guía de la cocina mexicana en Madrid</Text>
      <Text style={s.copilSub}>
        Cerca de cien restaurantes certificados. Un estándar de excelencia. La referencia definitiva para comer bien mexicano en España.
      </Text>
      <Pressable
        onPress={() => router.push("/article/art-003" as any)}
        style={({ pressed }) => [s.copilBtn, pressed && { opacity: 0.7 }]}
      >
        <Text style={s.copilBtnText}>Ver guía →</Text>
      </Pressable>
    </View>
  );
}

export default function CulturaScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJson<any[]>("/api/saved")
      .then((saved) => setSavedIds(new Set(saved.map((a: any) => a.articleId ?? a.id))))
      .catch(() => {});
  }, []);

  const toggleSave = useCallback(
    async (id: string) => {
      const wasSaved = savedIds.has(id);
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(id); else next.add(id);
        return next;
      });
      try {
        await fetchJson(`/api/saved/${id}`, { method: wasSaved ? "DELETE" : "POST" });
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(id); else next.delete(id);
          return next;
        });
      }
    },
    [savedIds]
  );

  const { data: rawArticles = [], isLoading, refetch } = useQuery<Article[]>({
    queryKey: ["articles", "cultura"],
    queryFn: () => fetchJson<Article[]>("/api/articles"),
  });

  const culturaArticles = rawArticles.filter(a => a.pillar === "cultura");

  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[ _]/g, "-");

  const availableFilters = ["Todos", ...Array.from(new Set(culturaArticles.map(a => a.subcategory).filter(Boolean)))];

  const articles = culturaArticles.filter(a => {
    if (activeFilter === "Todos") return true;
    return norm(a.subcategory) === norm(activeFilter);
  });

  const hero = articles[0];
  const rest = articles.slice(1);

  type Item =
    | { kind: "header" }
    | { kind: "filter" }
    | { kind: "hero"; article: Article }
    | { kind: "divider"; label: string; count: number }
    | { kind: "article"; article: Article; index: number }
    | { kind: "sello-copil" };

  const items: Item[] = [{ kind: "header" }, { kind: "filter" }];
  if (hero) items.push({ kind: "hero", article: hero });
  if (rest.length > 0) {
    items.push({ kind: "divider", label: activeFilter, count: rest.length });
    rest.forEach((a, i) => items.push({ kind: "article", article: a, index: i + 1 }));
  }
  if (activeFilter === "Todos" || norm(activeFilter) === "gastronomia") {
    items.push({ kind: "sello-copil" });
  }

  const renderItem = ({ item }: { item: Item }) => {
    if (item.kind === "header") {
      const hoy = new Date();
      const mes = hoy.toLocaleDateString("es-ES", { month: "long" });
      return (
        <View style={[s.masthead, { paddingTop: topPad + Space.sm }]}>
          <Masthead
            title="Cultura"
            status="Selección"
            location={mes.charAt(0).toUpperCase() + mes.slice(1)}
            date={`${culturaArticles.length} piezas`}
            accent={Colors.cobalt}
          />
        </View>
      );
    }
    if (item.kind === "filter") {
      return (
        <View style={s.filterWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: Space.base, alignItems: "baseline" }}
          >
            {availableFilters.map((sub, i) => {
              const isActive = activeFilter === sub;
              const accent = sub === "Todos" ? Colors.cobalt : getAccentColor(sub);
              return (
                <Pressable
                  key={sub}
                  onPress={() => setActiveFilter(sub)}
                  style={[s.filterTab, isActive && { borderBottomColor: accent }]}
                  hitSlop={6}
                >
                  <Text
                    style={[
                      isActive ? s.filterTextActive : s.filterText,
                      isActive && { color: accent },
                    ]}
                  >
                    {sub}
                  </Text>
                  {i < availableFilters.length - 1 && (
                    <Text style={s.filterSep}>·</Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      );
    }
    if (item.kind === "hero") return <HeroCard article={item.article} saved={savedIds.has(item.article.id)} onToggleSave={toggleSave} />;
    if (item.kind === "divider") {
      const accent = item.label === "Todos" ? Colors.cobalt : getAccentColor(item.label);
      return (
        <View style={s.sectionRow}>
          <Rule variant="labeled" label={item.label} color={accent} />
        </View>
      );
    }
    if (item.kind === "article") return <ArticleRow article={item.article} index={item.index} total={rest.length} saved={savedIds.has(item.article.id)} onToggleSave={toggleSave} />;
    if (item.kind === "sello-copil") return <SelloCopilBlock />;
    return null;
  };

  return (
    <View style={s.container}>
      {isLoading ? (
        <XicoLoader color={Colors.cobalt} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it, idx) => `${it.kind}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: bottomPad + 90 }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={Colors.cobalt} />}
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
    paddingBottom: Space.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  filterWrap: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Space.sm,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingVertical: Space.sm,
    paddingHorizontal: Space.sm,
    borderBottomWidth: 1.5,
    borderBottomColor: "transparent",
  },
  filterText: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body - 1,
    color: Colors.textTertiary,
    letterSpacing: Tracking.tight,
  },
  filterTextActive: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.body - 1,
    letterSpacing: Tracking.tight,
  },
  filterSep: {
    fontFamily: Fonts.serifLight,
    fontSize: TypeSize.body - 1,
    color: Colors.textTertiary,
    marginLeft: Space.sm,
  },

  // STANDARD row (image right, accent kicker + folio)
  row: {
    flexDirection: "row",
    marginHorizontal: Space.base,
    marginTop: Space.sm,
    marginBottom: Space.base,
    gap: Space.base,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Space.base,
  },
  rowImg: { width: 80, height: 108, backgroundColor: Colors.surfaceHigh },
  rowBody: { flex: 1, gap: Space.xs },
  rowHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Space.xs,
  },
  rowTitle: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.subhead - 3,
    lineHeight: lh(TypeSize.subhead - 3, 1.2),
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  rowSub: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta + 1,
    lineHeight: lh(TypeSize.meta + 1, 1.4),
    color: Colors.textSecondary,
  },
  rowRead: {
    fontFamily: Fonts.sansRegular,
    fontSize: TypeSize.small,
    color: Colors.textTertiary,
    marginTop: 2,
    letterSpacing: Tracking.wide,
  },
  rowReadEmph: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.small,
    color: Colors.textSecondary,
    letterSpacing: Tracking.wide,
  },

  // BRIEF row (≤ 4 min): tighter, no image
  briefRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginHorizontal: Space.base,
    marginTop: Space.xs,
    marginBottom: Space.md,
    paddingBottom: Space.md,
    paddingTop: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
    gap: Space.md,
  },
  briefBody: { flex: 1, gap: Space.xs },
  briefHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  briefRead: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.small - 1,
    color: Colors.textTertiary,
    letterSpacing: Tracking.wide,
  },
  briefTitle: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.body,
    lineHeight: lh(TypeSize.body, 1.3),
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },

  // ESSAY row (≥ 8 min): image left, bigger
  essayRow: {
    marginHorizontal: Space.base,
    marginTop: Space.lg,
    marginBottom: Space.xl,
    paddingBottom: Space.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Space.md,
  },
  essayImg: {
    width: "100%",
    height: 220,
    backgroundColor: Colors.surfaceHigh,
  },
  essayBody: { gap: Space.sm },
  essayHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  essayTitle: {
    fontFamily: Fonts.serifSemibold,
    fontSize: TypeSize.title - 2,
    lineHeight: lh(TypeSize.title - 2, 1.12),
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  essaySub: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    fontSize: TypeSize.lede - 1,
    lineHeight: lh(TypeSize.lede - 1, 1.5),
    color: Colors.textSecondary,
    letterSpacing: Tracking.tight,
  },
  essayFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Space.xs,
  },

  sectionRow: {
    paddingHorizontal: Space.base,
    marginTop: Space.lg,
    marginBottom: Space.md,
  },

  copilBlock: {
    marginHorizontal: Space.base,
    marginVertical: Space.xl,
    backgroundColor: "#0a0f1f",
    borderWidth: 1,
    borderColor: "rgba(26,63,160,0.4)",
    borderTopWidth: 2,
    borderTopColor: Colors.cobalt,
    padding: Space.lg,
  },
  copilLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
    color: Colors.cobalt,
    textTransform: "uppercase",
    marginBottom: Space.md,
  },
  copilTitle: {
    fontFamily: Fonts.serifLight,
    fontSize: TypeSize.title,
    lineHeight: lh(TypeSize.title, 1.15),
    color: "#fff",
    marginBottom: Space.sm,
  },
  copilSub: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta + 1,
    lineHeight: lh(TypeSize.meta + 1, 1.55),
    color: "rgba(255,255,255,0.55)",
    marginBottom: Space.lg,
  },
  copilBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
    borderWidth: 1,
    borderColor: "rgba(26,63,160,0.4)",
    paddingHorizontal: Space.base,
    paddingVertical: Space.sm,
    alignSelf: "flex-start",
  },
  copilBtnText: {
    fontFamily: Fonts.sansBold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
    color: Colors.cobalt,
    textTransform: "uppercase",
  },
});