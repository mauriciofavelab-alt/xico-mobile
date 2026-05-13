import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";
import { Rumbos, TIER_LABELS, type RumboSlug, type TierKey } from "@/constants/rumbos";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";
import { Kicker, Rule } from "@/components/editorial";
import type { TierState } from "@/hooks/useTier";

/**
 * TierStatusBlock · Tu progreso
 *
 * Sits below the Roseton in the Mi Lectura tab. Three responsibilities:
 *   1. Current tier (large, Newsreader 500Medium) with the count
 *   2. Next-tier requirements (precisely what gates the user to the next tier)
 *   3. Eligible perks list (empty in v1; v2 populates `partners` table)
 *
 * The copy here is NON-COERCIVE per the manifesto: "X más por rumbo" instead
 * of "5 to go!"; "puedes" instead of "must"; no countdown clocks; no streaks.
 */

type Props = {
  tier?: TierState;
  loading?: boolean;
};

const TIER_ORDER: TierKey[] = ["iniciado", "conocedor", "curador", "cronista"];

function describeRequirements(tier: TierKey, by: Record<RumboSlug, number>, total: number): string[] {
  const distinctActive = (Object.values(by) as number[]).filter((n) => n > 0).length;
  const min = Math.min(...(Object.values(by) as number[]));

  switch (tier) {
    case "iniciado": {
      // Need: ≥6 sellos in ≥2 rumbos to reach Conocedor
      const missingTotal = Math.max(0, 6 - total);
      const missingDistinct = Math.max(0, 2 - distinctActive);
      const lines: string[] = [];
      if (missingTotal > 0) lines.push(`${missingTotal} sello${missingTotal === 1 ? "" : "s"} más para Conocedor`);
      if (missingDistinct > 0) lines.push(`Necesitas presencia en al menos ${2 - missingDistinct + missingDistinct} rumbos · llevas ${distinctActive}`);
      if (lines.length === 0) lines.push("Casi Conocedor · sigue caminando");
      return lines;
    }
    case "conocedor": {
      // Need: ≥16 sellos in ≥3 rumbos
      const missingTotal = Math.max(0, 16 - total);
      const missingDistinct = Math.max(0, 3 - distinctActive);
      const lines: string[] = [];
      if (missingTotal > 0) lines.push(`${missingTotal} sello${missingTotal === 1 ? "" : "s"} más para Curador`);
      if (missingDistinct > 0) lines.push(`Curador pide presencia en ${3} rumbos · llevas ${distinctActive}`);
      if (lines.length === 0) lines.push("Casi Curador · una pieza más");
      return lines;
    }
    case "curador": {
      // Need: ≥36 total, all 4 rumbos, ≥5 per rumbo
      const missingTotal = Math.max(0, 36 - total);
      const missingDistinct = 4 - distinctActive;
      const missingMin = Math.max(0, 5 - min);
      const lines: string[] = [];
      if (missingTotal > 0) lines.push(`${missingTotal} sello${missingTotal === 1 ? "" : "s"} más para Cronista`);
      if (missingDistinct > 0) lines.push(`Cronista pide los cuatro rumbos · llevas ${distinctActive}`);
      if (missingMin > 0) lines.push(`Al menos 5 sellos en cada rumbo · el más bajo lleva ${min}`);
      if (lines.length === 0) lines.push("Casi Cronista · cualquier rumbo te lleva ahí");
      return lines;
    }
    case "cronista":
      return ["Cronista · estás en la última capa. Diciembre 2026: reunión presencial."];
  }
}

export function TierStatusBlock({ tier, loading }: Props) {
  if (loading || !tier) {
    return (
      <View style={s.skeleton}>
        <View style={s.skeletonLine} />
        <View style={[s.skeletonLine, { width: "60%" }]} />
      </View>
    );
  }

  const tierLabel = TIER_LABELS[tier.tier];
  const reqs = describeRequirements(tier.tier, tier.by_rumbo, tier.total);
  const perks = tier.eligible_perks ?? [];

  return (
    <View style={s.root}>
      <Kicker>Tu progreso</Kicker>

      {/* Current tier · large display */}
      <View style={s.tierRow}>
        <View style={s.tierLeft}>
          <Text style={s.tierName}>{tierLabel}</Text>
          <Text style={s.tierTotal}>
            {tier.total} sello{tier.total === 1 ? "" : "s"} · {tier.distinct_rumbos} rumbo
            {tier.distinct_rumbos === 1 ? "" : "s"}
          </Text>
        </View>
      </View>

      {/* Next-tier requirements */}
      <View style={s.requirements}>
        {reqs.map((line, i) => (
          <Text key={i} style={s.requirementLine}>
            · {line}
          </Text>
        ))}
      </View>

      <Rule />

      {/* Eligible perks */}
      <View style={s.perksHeader}>
        <Text style={s.perksLabel}>Lo que tu nivel te da</Text>
        <Text style={s.perksCount}>{perks.length}</Text>
      </View>
      {perks.length === 0 ? (
        <Text style={s.perksEmpty}>
          {tier.tier === "iniciado" || tier.tier === "conocedor"
            ? "Los beneficios materiales aparecen a partir de Curador. La Ruta sigue siendo tuya antes de eso."
            : "Próximamente · Sello Copil priority booking, acceso ampliado en museos socios."}
        </Text>
      ) : (
        <View style={{ gap: Space.sm, marginTop: Space.sm }}>
          {perks.map((p) => (
            <View key={p.id} style={s.perkRow}>
              <View style={[s.perkSwatch, { backgroundColor: p.accent_color ?? Colors.textTertiary }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.perkName}>{p.name}</Text>
                {p.notes ? <Text style={s.perkNotes}>{p.notes}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.lg,
    gap: Space.md,
  },
  tierRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: Space.sm,
  },
  tierLeft: { flex: 1 },
  tierName: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.display,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
    lineHeight: TypeSize.display * 1.05,
  },
  tierTotal: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.meta,
    color: Colors.textTertiary,
    letterSpacing: Tracking.wider,
    textTransform: "uppercase",
    marginTop: Space.xs,
  },
  requirements: {
    gap: Space.xs,
    marginTop: Space.sm,
  },
  requirementLine: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    lineHeight: TypeSize.body * 1.55,
  },
  perksHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Space.sm,
  },
  perksLabel: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.small,
    color: Colors.textTertiary,
    letterSpacing: Tracking.widest,
    textTransform: "uppercase",
  },
  perksCount: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.body,
    color: Colors.textPrimary,
  },
  perksEmpty: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.body,
    color: Colors.textSecondary,
    lineHeight: TypeSize.body * 1.55,
    marginTop: Space.sm,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Space.md,
    paddingVertical: Space.sm,
    borderBottomWidth: Hairline.thin,
    borderBottomColor: Colors.borderLight,
  },
  perkSwatch: {
    width: 18,
    height: 18,
    borderWidth: Hairline.thin,
    borderColor: Colors.borderMedium,
  },
  perkName: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.body,
    color: Colors.textPrimary,
  },
  perkNotes: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.meta,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  skeleton: {
    paddingHorizontal: Space.lg,
    paddingVertical: Space.xl,
    gap: Space.md,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: Colors.surfaceHigh,
    width: "80%",
  },
});
