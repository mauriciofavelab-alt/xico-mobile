import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts, Hairline, Space, Tracking, TypeSize } from "@/constants/editorial";

type Props = {
  variant?: "solid" | "labeled" | "accent" | "double";
  label?: string;
  color?: string;
  thickness?: "thin" | "rule" | "bold";
  style?: ViewStyle;
};

export function Rule({ variant = "solid", label, color = Colors.borderLight, thickness = "thin", style }: Props) {
  const h = Hairline[thickness];

  if (variant === "double") {
    return (
      <View style={[r.double, style]}>
        <View style={[r.line, { backgroundColor: color, height: h }]} />
        <View style={[r.line, { backgroundColor: color, height: h, marginTop: 3 }]} />
      </View>
    );
  }

  if (variant === "labeled" && label) {
    return (
      <View style={[r.labeledRow, style]}>
        <View style={[r.line, { flex: 1, backgroundColor: color, height: h }]} />
        <Text style={[r.label, { color }]}>{label.toUpperCase()}</Text>
        <View style={[r.line, { flex: 1, backgroundColor: color, height: h }]} />
      </View>
    );
  }

  if (variant === "accent") {
    return (
      <View style={[r.accentRow, style]}>
        <View style={[r.accentBlock, { backgroundColor: color }]} />
        <View style={[r.line, { flex: 1, backgroundColor: color, height: h, opacity: 0.4 }]} />
      </View>
    );
  }

  return <View style={[r.line, { backgroundColor: color, height: h }, style]} />;
}

const r = StyleSheet.create({
  line: { width: "100%" },
  double: { width: "100%" },
  labeledRow: { flexDirection: "row", alignItems: "center", gap: Space.md },
  label: {
    fontFamily: Fonts.sansSemibold,
    fontSize: TypeSize.micro,
    letterSpacing: Tracking.widest,
  },
  accentRow: { flexDirection: "row", alignItems: "center", gap: Space.sm },
  accentBlock: { width: 28, height: Hairline.bold },
});
