import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Space, Tracking, TypeSize } from "@/constants/editorial";

type Credit = {
  role?: string;
  name: string;
};

type Props = {
  author?: string;
  photographer?: string;
  translator?: string;
  credits?: Credit[];
  date?: string;
  readTime?: string;
  accent?: string;
  style?: ViewStyle;
};

export function ByLine({ author, photographer, translator, credits, date, readTime, accent = Colors.textPrimary, style }: Props) {
  const list: Credit[] = [];
  if (author) list.push({ role: "Texto", name: author });
  if (photographer) list.push({ role: "Fotografía", name: photographer });
  if (translator) list.push({ role: "Traducción", name: translator });
  if (credits) list.push(...credits);

  return (
    <View style={[b.container, style]}>
      <View style={b.credits}>
        {list.map((c, i) => (
          <View key={i} style={b.creditRow}>
            {c.role && <Text style={[b.role, { color: accent }]}>{c.role.toUpperCase()}</Text>}
            <Text style={b.name}>{c.name}</Text>
          </View>
        ))}
      </View>
      {(date || readTime) && (
        <Text style={b.meta}>
          {[date, readTime && `${readTime} de lectura`].filter(Boolean).join("  ·  ")}
        </Text>
      )}
    </View>
  );
}

const b = StyleSheet.create({
  container: { gap: Space.sm },
  credits: { gap: Space.xs },
  creditRow: { flexDirection: "row", alignItems: "baseline", gap: Space.md },
  role: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
    width: 76,
  },
  name: {
    fontFamily: Fonts.serifMedium,
    fontSize: TypeSize.body - 1,
    color: Colors.textPrimary,
    letterSpacing: Tracking.tight,
  },
  meta: {
    fontFamily: Fonts.serifItalic,
    fontStyle: "italic",
    fontSize: TypeSize.caption,
    color: Colors.textTertiary,
    letterSpacing: Tracking.tight,
    marginTop: Space.xs,
  },
});
