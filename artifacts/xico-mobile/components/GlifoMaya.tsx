import React from "react";
import Svg, { Path, Circle, Rect, G, Line } from "react-native-svg";

type GlifoProps = {
  id: string;
  size?: number;
  color?: string;
  opacity?: number;
};

// 8 glifos mayas estilizados — cada uno conecta con el significado del sello
// Inspirados en códices mayas: trazos gruesos, geometría orgánica, simetría imperfecta

export function GlifoMaya({ id, size = 36, color = "#ffffff", opacity = 1 }: GlifoProps) {
  const s = size;
  const c = s / 2;
  const stroke = color;
  const strokeWidth = 2;

  const common = { stroke, strokeWidth, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (id) {
    case "primera-lectura":
      // OJO — inspirado en el glifo maya del ojo (ahau)
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Path d="M 4 18 Q 18 6 32 18 Q 18 30 4 18 Z" {...common} />
          <Circle cx="18" cy="18" r="5" {...common} />
          <Circle cx="18" cy="18" r="2" fill={color} />
        </Svg>
      );

    case "explorador":
      // CAMINO — trazo de viaje, huellas
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Path d="M 6 28 Q 10 22 14 22 Q 18 22 18 16 Q 18 10 22 10 Q 26 10 30 6" {...common} />
          <Circle cx="6" cy="28" r="2" fill={color} />
          <Circle cx="30" cy="6" r="2" fill={color} />
          <Circle cx="14" cy="22" r="1.5" fill={color} />
          <Circle cx="22" cy="10" r="1.5" fill={color} />
        </Svg>
      );

    case "conocedor":
      // RAÍZ — árbol sagrado ceiba, ejes del universo maya
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Line x1="18" y1="4" x2="18" y2="32" {...common} />
          <Path d="M 18 12 L 10 8" {...common} />
          <Path d="M 18 12 L 26 8" {...common} />
          <Path d="M 18 20 L 8 16" {...common} />
          <Path d="M 18 20 L 28 16" {...common} />
          <Path d="M 18 32 L 12 28" {...common} />
          <Path d="M 18 32 L 24 28" {...common} />
          <Circle cx="18" cy="4" r="2" fill={color} />
        </Svg>
      );

    case "momentos":
      // DESTELLO — rayo / energía capturada
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Path d="M 22 4 L 10 20 L 16 20 L 14 32 L 26 14 L 20 14 L 22 4 Z" {...common} fill={color} fillOpacity={0.15} />
        </Svg>
      );

    case "agenda":
      // PRESENCIA — glifo maya del cuerpo presente (kin)
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Rect x="6" y="6" width="24" height="24" {...common} />
          <Circle cx="18" cy="18" r="6" {...common} />
          <Line x1="18" y1="12" x2="18" y2="6" {...common} />
          <Line x1="18" y1="30" x2="18" y2="24" {...common} />
          <Line x1="12" y1="18" x2="6" y2="18" {...common} />
          <Line x1="30" y1="18" x2="24" y2="18" {...common} />
        </Svg>
      );

    case "ruta":
      // PEREGRINO — espiral / viaje sagrado
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Path d="M 18 18 m -2 0 a 2 2 0 1 1 4 0 a 2 2 0 1 1 -4 0 M 18 18 m -6 0 a 6 6 0 1 1 12 0 M 18 18 m -10 0 a 10 10 0 0 1 20 0 a 10 10 0 0 1 -15 8.5" {...common} />
          <Circle cx="18" cy="18" r="1.5" fill={color} />
        </Svg>
      );

    case "guardado":
      // ARCHIVO — códice / libro plegado maya
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Rect x="6" y="8" width="6" height="20" {...common} />
          <Rect x="15" y="8" width="6" height="20" {...common} />
          <Rect x="24" y="8" width="6" height="20" {...common} />
          <Line x1="8" y1="14" x2="10" y2="14" {...common} />
          <Line x1="8" y1="18" x2="10" y2="18" {...common} />
          <Line x1="17" y1="14" x2="19" y2="14" {...common} />
          <Line x1="17" y1="18" x2="19" y2="18" {...common} />
          <Line x1="26" y1="14" x2="28" y2="14" {...common} />
          <Line x1="26" y1="18" x2="28" y2="18" {...common} />
        </Svg>
      );

    case "madrugador":
      // ALBA — sol maya naciendo (kin)
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Line x1="4" y1="26" x2="32" y2="26" {...common} />
          <Path d="M 10 26 Q 18 12 26 26" {...common} />
          <Circle cx="18" cy="20" r="3" fill={color} />
          <Line x1="18" y1="14" x2="18" y2="10" {...common} />
          <Line x1="12" y1="18" x2="9" y2="16" {...common} />
          <Line x1="24" y1="18" x2="27" y2="16" {...common} />
        </Svg>
      );

    default:
      return (
        <Svg width={s} height={s} viewBox="0 0 36 36" opacity={opacity}>
          <Circle cx={c} cy={c} r={c - 4} {...common} />
        </Svg>
      );
  }
}
