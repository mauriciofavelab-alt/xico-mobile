import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { getImage } from "@/constants/imageMap";
import { fetchJson } from "@/constants/api";

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

function HeroCard({ article }: { article: Article }) {
  const img = getArticleImage(article);
  const accent = getAccentColor(article.subcategory ?? article.accentColor);

  return (
    <Pressable onPress={() => router.push(`/article/${article.id}` as any)} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
      <View style={{ overflow: "hidden", marginBottom: 2 }}>
        <ImageBackground source={img} style={{ height: 400 }} resizeMode="cover">
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.92)"]} style={StyleSheet.absoluteFill} />
          <View style={{ position: "absolute", top: 20, left: 20 }}>
            <View style={{ backgroundColor: accent, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 2, color: "#fff" }}>
                {(article.subcategory ?? article.type ?? "").toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, gap: 10 }}>
            <View style={{ width: 28, height: 2, backgroundColor: accent }} />
            <Text style={{ fontFamily: "CormorantGaramond_600SemiBold", fontSize: 36, lineHeight: 40, color: "#fff" }} numberOfLines={3}>
              {article.title}
            </Text>
            <Text style={{ fontFamily: "CormorantGaramond_300Light_Italic", fontStyle: "italic", fontSize: 15, lineHeight: 22, color: "rgba(255,255,255,0.6)" }} numberOfLines={2}>
              {article.subtitle}
            </Text>
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 2, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
              Leer →
            </Text>
          </View>
        </ImageBackground>
      </View>
    </Pressable>
  );
}

function ArticleRow({ article, index }: { article: Article; index: number }) {
  const img = getArticleImage(article);
  const accent = getAccentColor(article.subcategory ?? article.accentColor);

  return (
    <Pressable onPress={() => router.push(`/article/${article.id}` as any)} style={({ pressed }) => [s.row, pressed && { opacity: 0.82 }]}>
      <View style={s.rowBody}>
        <View style={[s.accentBar, { backgroundColor: accent }]} />
        <Text style={[s.rowType, { color: accent }]}>{(article.subcategory ?? article.type ?? "").toUpperCase()}</Text>
        <Text style={s.rowTitle} numberOfLines={2}>{article.title}</Text>
        <Text style={s.rowSub} numberOfLines={1}>{article.subtitle}</Text>
        <Text style={s.rowRead}>{article.read_time_minutes ? `${article.read_time_minutes} min` : article.readTime}</Text>
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
      return (
        <View style={[s.masthead, { paddingTop: topPad + 10 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <View style={s.cobaltDot} />
            <Text style={s.mastheadEye}>SELECCIÓN CULTURAL</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
            <Text style={s.mastheadTitle}>Cultura</Text>
            <Text style={s.mastheadCount}>{culturaArticles.length} piezas</Text>
          </View>
        </View>
      );
    }
    if (item.kind === "filter") {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterScroll}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 0 }}
        >
          {availableFilters.map(sub => {
            const isActive = activeFilter === sub;
            const accent = sub === "Todos" ? Colors.cobalt : getAccentColor(sub);
            return (
              <Pressable
                key={sub}
                onPress={() => setActiveFilter(sub)}
                style={[s.filterTab, isActive && { borderBottomColor: accent }]}
              >
                <Text style={[s.filterText, isActive && { color: accent, fontFamily: "Inter_600SemiBold" }]}>
                  {sub.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      );
    }
    if (item.kind === "hero") return <HeroCard article={item.article} />;
    if (item.kind === "divider") {
      const accent = item.label === "Todos" ? Colors.cobalt : getAccentColor(item.label);
      return (
        <View style={s.sectionRow}>
          <Text style={[s.sectionLabel, { color: accent }]}>{item.label.toUpperCase()}</Text>
          <View style={[s.sectionLine, { backgroundColor: `${accent}40` }]} />
          <Text style={s.sectionCount}>{item.count}</Text>
        </View>
      );
    }
    if (item.kind === "article") return <ArticleRow article={item.article} index={item.index} />;
    if (item.kind === "sello-copil") return <SelloCopilBlock />;
    return null;
  };

  return (
    <View style={s.container}>
      {isLoading ? (
        <View style={s.loading}><ActivityIndicator color={Colors.cobalt} /></View>
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
  masthead: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  cobaltDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cobalt },
  mastheadEye: { fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 2.5, color: Colors.cobalt },
  mastheadTitle: { fontFamily: "CormorantGaramond_300Light", fontSize: 48, lineHeight: 50, color: Colors.textPrimary, letterSpacing: -1 },
  mastheadCount: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary, letterSpacing: 0.5, paddingBottom: 8 },
  filterScroll: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterTab: { paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1.5, borderBottomColor: "transparent" },
  filterText: { fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 1.5, color: Colors.textTertiary, textTransform: "uppercase" },
  row: { flexDirection: "row", marginHorizontal: 16, marginVertical: 6, marginBottom: 16, gap: 14, alignItems: "flex-start", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 16 },
  rowImg: { width: 72, height: 72, backgroundColor: Colors.surfaceHigh },
  rowBody: { flex: 1, gap: 3 },
  accentBar: { width: 22, height: 2, borderRadius: 1, marginBottom: 3 },
  rowType: { fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 2 },
  rowTitle: { fontFamily: "CormorantGaramond_600SemiBold", fontSize: 19, lineHeight: 23, color: Colors.textPrimary },
  rowSub: { fontFamily: "CormorantGaramond_300Light_Italic", fontStyle: "italic", fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  rowRead: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textTertiary, marginTop: 2 },
  sectionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 24, marginBottom: 12, gap: 12 },
  sectionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 3 },
  sectionLine: { flex: 1, height: 1 },
  sectionCount: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.textTertiary },
  copilBlock: { marginHorizontal: 16, marginVertical: 32, backgroundColor: "#0a0f1f", borderWidth: 1, borderColor: "rgba(26,63,160,0.4)", borderTopWidth: 2, borderTopColor: Colors.cobalt, padding: 24 },
  copilLabel: { fontFamily: "Inter_600SemiBold", fontSize: 8, letterSpacing: 3, color: Colors.cobalt, textTransform: "uppercase", marginBottom: 12 },
  copilTitle: { fontFamily: "CormorantGaramond_300Light", fontSize: 28, lineHeight: 32, color: "#fff", marginBottom: 8 },
  copilSub: { fontFamily: "CormorantGaramond_300Light_Italic", fontStyle: "italic", fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.55)", marginBottom: 20 },
  copilBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "rgba(26,63,160,0.4)", paddingHorizontal: 16, paddingVertical: 8, alignSelf: "flex-start" },
  copilBtnText: { fontFamily: "Inter_700Bold", fontSize: 8, letterSpacing: 2.5, color: Colors.cobalt, textTransform: "uppercase" },
});
