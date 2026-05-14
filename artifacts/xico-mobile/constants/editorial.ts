import { StyleSheet } from "react-native";

export const Space = {
  hairline: StyleSheet.hairlineWidth,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
  giant: 96,
} as const;

export const TypeSize = {
  micro: 8,
  small: 10,
  caption: 11,
  meta: 13,
  body: 16,
  lede: 18,
  standfirst: 19,
  subhead: 22,
  title: 28,
  display: 36,
  hero: 48,
  monumental: 64,
} as const;

export const Tracking = {
  tight: -0.3,
  body: 0.1,
  wide: 1.5,
  wider: 2.5,
  widest: 3,
} as const;

export const LineHeight = {
  tight: 1.05,
  snug: 1.2,
  normal: 1.45,
  relaxed: 1.6,
  loose: 1.75,
} as const;

export const Fonts = {
  serifLight: "Newsreader_300Light",
  serifLightItalic: "Newsreader_300Light_Italic",
  serifRegular: "Newsreader_400Regular",
  serifItalic: "Newsreader_400Regular_Italic",
  serifMedium: "Newsreader_500Medium",
  serifSemibold: "Newsreader_600SemiBold",
  serifSemiboldItalic: "Newsreader_600SemiBold_Italic",
  sansLight: "Inter_300Light",
  sansRegular: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemibold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
} as const;

export const Hairline = {
  thin: StyleSheet.hairlineWidth,
  rule: 1,
  bold: 2,
} as const;

export const Radius = {
  none: 0,
  hairline: 1,
  small: 3,
  full: 999,
} as const;

export function lh(size: number, ratio: number = LineHeight.normal): number {
  return Math.round(size * ratio);
}
