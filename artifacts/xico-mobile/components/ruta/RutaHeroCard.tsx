import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

import { Colors } from "@/constants/colors";
import { Rumbos, RUMBO_ORDER, type RumboSlug } from "@/constants/rumbos";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";
import { Kicker } from "@/components/editorial";
import { useCurrentRuta } from "@/hooks/useCurrentRuta";
import { useTier } from "@/hooks/useTier";

/**
 * RutaHeroCard · "La Ruta de esta semana" hero on the Índice tab at position 2.
 *
 * Editorial framing per spec §Modified screens:
 *   - Editor byline (María Vázquez, Semana N)
 *   - "5 paradas en Madrid"
 *   - Current user progress (e.g. "2 / 5 sellos") when authenticated
 *   - 4 small rumbo accent pips showing the cardinal-direction footprint of the
 *     current week's ruta (visual continuity with the Roseton)
 *
 * One saturated accent on the card — the rumbo pip row. Hairline border
 * separates the card from chrome. Tap → /ruta.
 */

function weekLabel(weekKey: string | null | undefined): string {
  if (!weekKey) return "Esta semana";
  const m = weekKey.match(/^\d{4}-W(\d{1,2})$/i);
  return m ? `Semana ${m[1]}` : weekKey;
}

export function RutaHeroCard() {
  const ruta = useCurrentRuta();
  const tier = useTier();

  if (ruta.isLoading || !ruta.data) return null;

  const data = ruta.data;
  const totalStops = data.stops.length;

  // Distinct rumbos covered by this week's ruta (for the pip row)
  const rumbosInRuta = new Set<RumboSlug>();
  for (const s of data.stops) {
    if (s.rumbo?.slug) rumbosInRuta.add(s.rumbo.slug);
  }

  // Earned sellos count — approximated from tier.by_rumbo total when present.
  // Stop-level precision arrives when we wire useSellosRumbo (deferred).
  const earned = tier.data?.total ?? 0;

  return (
    <Pressable
      onPress={() => router.push("/ruta" as any)}
      style={({ pressed }) => [s.root, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={`La Ruta de esta semana, ${data.editor_name ?? "Equipo XICO"}, ${totalStops} paradas`}
    >
      <View style={s.header}>
        <Kicker color={Colors.textPrimary}>La Ruta · {weekLabel(data.week_key)}</Kicker>
        <Feather name="arrow-up-right" size={14} color={Colors.textTertiary} />
      </View>

      <Text style={s.title}>{data.title}</Text>
      <Text style={s.subtitle} numberOfLines={2}>{data.subtitle}</Text>

      <View style={s.meta}>
        <Text style={s.editor}>
          <Text style={s.editorRole}>EDITORA · </Text>
          {data.editor_name ?? "Equipo XICO"}
        </Text>
        <Text style={s.meta_sep}>·</Text>
        <Text style={s.editor}>{totalStops} paradas en Madrid</Text>
      </View>

      <View style={s.bottomRow}>
        {/* Rumbo footprint pips · one per cardinal direction present in the ruta */}
        <View style={s.pipRow}>
          {RUMBO_ORDER.map((slug) => {
            const active = rumbosInRuta.has(slug);
            return (
              <View
                key={slug}
                style={[
                  s.pip,
                  active
                    ? { backgroundColor: Rumbos[slug].hex }
                    : { borderWidth: Hairline.thin, borderColor: Colors.borderMedium },
                ]}
                accessibilityLabel={`Rumbo ${Rumbos[slug].mexica}${active ? ", presente" : ", no presente"}`}
              />
            );
          })}
        </View>

        {earned > 0 ? (
          <Text style={s.progress}>
            {earned} sello{earned === 1 ? "" : "s"} ganados
          </Text>
        ) : (
          <Text style={s.progress}>Domingos 09:00</Text>
        )}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root: {
    marginHorizontal: Space.lg,
    marginVertical: Space.md,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.lg,
    backgroundColor: Colors.surface,
    borderWidth: Hairline.thin,
    borderColor: Colors.borderLight,
    gap: Space.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.subhead,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
    lineHeight: TypeSize.subhead * 1.15,
    marginTop: Space.sm,
  },
  subtitle: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    lineHeight: TypeSize.body * 1.55,
    marginTop: Space.xs,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.sm,
    marginTop: Space.sm,
    flexWrap: "wrap",
  },
  editor: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.caption,
    color: Colors.textTertiary,
    letterSpacing: Tracking.tight,
  },
  editorRole: {
    fontFamily: Fonts.sansSemibold,
    color: Colors.textTertiary,
    letterSpacing: Tracking.wider,
  },
  meta_sep: {
    color: Colors.textQuaternary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Space.md,
    paddingTop: Space.md,
    borderTopWidth: Hairline.thin,
    borderTopColor: Colors.borderLight,
  },
  pipRow: { flexDirection: "row", gap: 5 },
  pip: { width: 8, height: 8 },
  progress: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro + 1,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
});
