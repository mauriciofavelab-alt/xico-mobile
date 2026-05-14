import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Hairline, lh, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  serial?: string | number;
  label: string;
  title?: string;
  curatorNote?: string;
  curatorName?: string;
  accent?: string;
  style?: ViewStyle;
};

export function SectionOpener({ serial, label, title, curatorNote, curatorName, accent = Colors.textPrimary, style }: Props) {
  return (
    <View style={[so.container, style]}>
      <View style={so.topRow}>
        {serial !== undefined && (
          <Text style={[so.serial, { color: accent }]}>{pad(serial)}</Text>
        )}
        <View style={[so.accentRule, { backgroundColor: accent }]} />
        <Text style={[so.label, { color: accent }]}>{label.toUpperCase()}</Text>
      </View>
      {title && <Text style={so.title}>{title}</Text>}
      {curatorNote && (
        <View style={so.noteBlock}>
          <Text style={so.curatorNote}>{curatorNote}</Text>
          {curatorName && (
            <Text style={[so.byline, { color: accent }]}>— {curatorName}</Text>
          )}
        </View>
      )}
    </View>
  );
}

function pad(v: string | number): string {
  const s = String(v);
  return s.length === 1 ? `0${s}` : s;
}

const so = StyleSheet.create({
  container: { gap: Space.md, paddingVertical: Space.lg },
  topRow: { flexDirection: "row", alignItems: "center", gap: Space.md },
  serial: {
    fontFamily: Fonts.serifLight,
    fontSize: TypeSize.title,
    lineHeight: TypeSize.title,
    letterSpacing: Tracking.tight,
  },
  accentRule: { width: 32, height: Hairline.bold },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro + 1,
    letterSpacing: Tracking.widest,
  },
  title: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.title,
    lineHeight: lh(TypeSize.title, 1.1),
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  noteBlock: { gap: Space.sm, marginTop: Space.xs },
  curatorNote: {
    fontFamily: Fonts.serifLightItalic,
    fontStyle: "italic",
    fontSize: TypeSize.lede,
    lineHeight: lh(TypeSize.lede, 1.55),
    color: Colors.textPrimary,
    opacity: 0.72,
    letterSpacing: Tracking.tight,
  },
  byline: {
    fontFamily: Fonts.sansMedium,
    fontSize: TypeSize.small,
    letterSpacing: Tracking.wide,
  },
});
