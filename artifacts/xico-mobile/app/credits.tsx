// /credits · CC BY-SA + photographer attribution surface per ADR-003.
//
// Sourced lugares photography (`assets/lugares/*.jpg`) is licensed under
// CC BY-SA / CC BY / CC0 / public domain · Unsplash / Pexels mixed. The
// CC BY-SA license REQUIRES visible attribution for the photographer + a
// link to the license. This screen renders every entry in
// `assets/lugares/_credits.json` so the app stays compliant.
//
// Editorial register: tracked-caps kicker, Fraunces 28pt title, Newsreader
// italic body — matches the rest of the warm-dark surface system. The
// route lives at /credits (top-level, not under tabs) so we can link to
// it from Tu Códice footer without claiming a tab slot.

import React, { useMemo } from "react";
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors, Pillars } from "@/constants/colors";
import { GlassMasthead } from "@/components/liquid-glass";
import { Fonts, Space, Tracking, TypeSize, scaledFontSize } from "@/constants/editorial";
import creditsRaw from "@/assets/lugares/_credits.json";

type CreditEntry = {
  file: string;
  lugar: string;
  photographer: string;
  license: string;
  source_url: string;
  /** Optional notes (e.g. "barrio context · not the specific venue"). */
  note?: string;
};

export default function CreditsScreen() {
  const insets = useSafeAreaInsets();
  const credits = useMemo<CreditEntry[]>(() => {
    // Type-safe handoff from a runtime JSON import. Defensive: tolerate the
    // file being an empty array (Phase B in flight).
    return Array.isArray(creditsRaw) ? (creditsRaw as CreditEntry[]) : [];
  }, []);

  const topPad = Platform.OS === "web" ? Space.md : insets.top + 12;

  return (
    <View style={[s.root, { paddingTop: topPad }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/tu-codice" as any))}
        style={s.closeBtn}
        hitSlop={12}
        accessibilityLabel="Volver"
        accessibilityRole="button"
      >
        <Feather name="chevron-left" size={22} color={Colors.textSecondary} />
      </Pressable>

      <ScrollView
        contentContainerStyle={{
          paddingTop: 140,
          paddingHorizontal: Space.lg,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.kicker}>XICO · CRÉDITOS</Text>
        <Text style={s.title}>
          Las imágenes <Text style={s.titleItalic}>tienen nombre</Text>.
        </Text>
        <Text style={s.lede}>
          Cada fotografía de los lugares que XICO te propone vino de alguien que estuvo ahí
          antes que tú. Las licencias Creative Commons piden lo mínimo: nombrar a quien miró.
        </Text>

        {credits.length === 0 ? (
          <Text style={s.empty}>
            (Los créditos se publican aquí cuando las primeras fotografías de los lugares
            entran al códice. Espera la próxima edición.)
          </Text>
        ) : (
          credits.map((c) => (
            <Pressable
              key={c.file}
              onPress={() => Linking.openURL(c.source_url).catch(() => {})}
              style={({ pressed }) => [s.row, pressed && { opacity: 0.7 }]}
              accessibilityRole="link"
              accessibilityLabel={`Abrir página de origen de la fotografía de ${c.lugar}`}
            >
              <Text style={s.lugar}>{c.lugar}</Text>
              <Text style={s.meta}>
                <Text style={s.metaLabel}>Fotografía · </Text>
                {c.photographer}
              </Text>
              <Text style={s.meta}>
                <Text style={s.metaLabel}>Licencia · </Text>
                {c.license}
              </Text>
              {c.note ? <Text style={s.note}>{c.note}</Text> : null}
            </Pressable>
          ))
        )}

        <Text style={s.footer}>
          Cualquier corrección o atribución faltante: escribe a XICO. El crédito es la
          forma básica de respeto a quien hace.
        </Text>
      </ScrollView>

      <GlassMasthead
        label="XICO · CRÉDITOS"
        meta="FOTOGRAFÍAS"
        liveDotColor={Pillars.indice}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  closeBtn: {
    position: "absolute",
    left: Space.md,
    top: Platform.OS === "web" ? Space.md : 60,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: {
    fontFamily: Fonts.sansSemibold,
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: Pillars.indice,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Fraunces_500Medium",
    fontSize: 28,
    lineHeight: 28 * 1.05,
    letterSpacing: -0.035 * 28,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  titleItalic: {
    fontFamily: "Fraunces_400Regular_Italic",
    color: Pillars.indice,
  },
  lede: {
    fontFamily: "Newsreader_400Regular_Italic",
    fontStyle: "italic",
    fontSize: scaledFontSize(15),
    lineHeight: scaledFontSize(15) * 1.55,
    color: Colors.textSecondary,
    marginBottom: Space.xl,
  },
  empty: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textTertiary,
    lineHeight: TypeSize.body * 1.55,
    marginTop: Space.lg,
    marginBottom: Space.xl,
  },
  row: {
    paddingVertical: Space.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
  },
  lugar: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.title,
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: Tracking.tight,
  },
  meta: {
    fontFamily: Fonts.serifRegular,
    fontSize: TypeSize.meta,
    color: Colors.textSecondary,
    lineHeight: TypeSize.meta * 1.5,
  },
  metaLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
    color: Colors.textTertiary,
  },
  note: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  footer: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textTertiary,
    lineHeight: TypeSize.meta * 1.6,
    marginTop: Space.xl,
    marginBottom: Space.lg,
  },
});
