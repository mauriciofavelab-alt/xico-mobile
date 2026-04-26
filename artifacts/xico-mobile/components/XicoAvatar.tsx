import React from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, Path, Rect, Line, Polygon, G, Defs, RadialGradient, Stop } from "react-native-svg";
import { type XicoLevel } from "@/hooks/usePassport";

export function XicoAvatar({ level, size = 72 }: { level: XicoLevel; size?: number }) {
  const n = level.nombre;
  if (n === "Iniciado") return <SemillaAvatar color={level.color} size={size} />;
  if (n === "Conocedor") return <GuardianAvatar color={level.color} size={size} />;
  if (n === "Curador") return <AncianoAvatar color={level.color} size={size} />;
  return <SupremoAvatar color={level.color} size={size} />;
}

// ── Semilla: Criatura tierra-semilla (espíritu infantil) ──────────────────────
function SemillaAvatar({ color, size }: { color: string; size: number }) {
  const s = size;
  const cx = s / 2;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Brote izquierdo */}
      <Path d="M44 28 Q34 16 28 22 Q26 34 40 36" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
      {/* Brote derecho */}
      <Path d="M56 28 Q66 16 72 22 Q74 34 60 36" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
      {/* Tallo */}
      <Line x1="50" y1="38" x2="50" y2="44" stroke={color} strokeWidth="2" />
      {/* Cuerpo ovalado */}
      <Ellipse cx="50" cy="65" rx="22" ry="26" fill={`${color}18`} stroke={color} strokeWidth="2" />
      {/* Cara: ojos */}
      <Circle cx="43" cy="60" r="3" fill={color} />
      <Circle cx="57" cy="60" r="3" fill={color} />
      {/* Brillo ojo */}
      <Circle cx="44.5" cy="58.5" r="1.2" fill="#fff" opacity={0.7} />
      <Circle cx="58.5" cy="58.5" r="1.2" fill="#fff" opacity={0.7} />
      {/* Nariz */}
      <Circle cx="50" cy="66" r="1.5" fill={`${color}80`} />
      {/* Boca sonriente */}
      <Path d="M44 72 Q50 77 56 72" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Brazo izquierdo */}
      <Path d="M28 63 Q22 66 24 73" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Brazo derecho */}
      <Path d="M72 63 Q78 66 76 73" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Tierra / base */}
      <Path d="M28 88 Q50 83 72 88" stroke={`${color}55`} strokeWidth="1.5" fill="none" />
      <Path d="M34 91 Q50 86 66 91" stroke={`${color}30`} strokeWidth="1" fill="none" />
    </Svg>
  );
}

// ── Guardián: Guerrero espiritual Maya ────────────────────────────────────────
function GuardianAvatar({ color, size }: { color: string; size: number }) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Tocado / penacho angular */}
      <Path d="M50 8 L42 20 L50 16 L58 20 Z" fill={color} opacity={0.9} />
      <Path d="M43 18 L36 14 L38 24" fill={`${color}66`} stroke={color} strokeWidth="1" />
      <Path d="M57 18 L64 14 L62 24" fill={`${color}66`} stroke={color} strokeWidth="1" />
      {/* Cabeza */}
      <Rect x="38" y="20" width="24" height="22" rx="4" fill={`${color}22`} stroke={color} strokeWidth="2" />
      {/* Ojos angulares */}
      <Path d="M41 28 L47 28 M41 31 L47 31" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M53 28 L59 28 M53 31 L59 31" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Nariz geométrica */}
      <Path d="M48 34 L50 37 L52 34" stroke={color} strokeWidth="1.5" fill="none" />
      {/* Escudo / pecho */}
      <Path d="M32 44 L68 44 L72 58 L50 70 L28 58 Z" fill={`${color}20`} stroke={color} strokeWidth="2" />
      {/* Símbolo en escudo */}
      <Path d="M50 50 L44 60 L50 56 L56 60 Z" fill={color} opacity={0.8} />
      {/* Brazos */}
      <Path d="M32 46 L18 52 L20 62 L28 58" fill={`${color}30`} stroke={color} strokeWidth="1.8" />
      <Path d="M68 46 L82 52 L80 62 L72 58" fill={`${color}30`} stroke={color} strokeWidth="1.8" />
      {/* Lanza izquierda */}
      <Line x1="18" y1="50" x2="10" y2="35" stroke={color} strokeWidth="1.5" />
      <Polygon points="10,35 7,30 14,34" fill={color} />
      {/* Piernas */}
      <Rect x="38" y="70" width="10" height="22" rx="2" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
      <Rect x="52" y="70" width="10" height="22" rx="2" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ── Anciano: Espíritu ancestral con corona cósmica ────────────────────────────
function AncianoAvatar({ color, size }: { color: string; size: number }) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Aura exterior */}
      <Circle cx="50" cy="50" r="46" stroke={`${color}15`} strokeWidth="1" fill="none" />
      <Circle cx="50" cy="50" r="42" stroke={`${color}25`} strokeWidth="1" fill="none" />
      {/* Rayos corona (8 rayos) */}
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x1 = 50 + Math.sin(r) * 20;
        const y1 = 50 - Math.cos(r) * 20;
        const x2 = 50 + Math.sin(r) * 35;
        const y2 = 50 - Math.cos(r) * 35;
        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i % 2 === 0 ? "2" : "1"} opacity={i % 2 === 0 ? 0.9 : 0.5} />;
      })}
      {/* Cuerpo / túnica */}
      <Path d="M35 60 Q32 80 36 95 L64 95 Q68 80 65 60 Q55 65 45 65 Z" fill={`${color}20`} stroke={color} strokeWidth="1.5" />
      {/* Cara circular */}
      <Circle cx="50" cy="42" r="16" fill={`${color}18`} stroke={color} strokeWidth="2" />
      {/* Ojo único de sabiduría */}
      <Ellipse cx="50" cy="42" rx="8" ry="5" fill={`${color}30`} stroke={color} strokeWidth="1.5" />
      <Circle cx="50" cy="42" r="3" fill={color} />
      <Circle cx="51.5" cy="40.5" r="1.2" fill="#fff" opacity={0.8} />
      {/* Cejas de sabio */}
      <Path d="M38 34 Q42 31 46 33" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <Path d="M54 33 Q58 31 62 34" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Barba */}
      <Path d="M40 54 Q50 62 60 54" stroke={`${color}66`} strokeWidth="1.5" fill="none" />
      <Path d="M44 57 Q50 65 56 57" stroke={`${color}44`} strokeWidth="1" fill="none" />
      {/* Brazos extendidos */}
      <Path d="M35 68 Q22 62 16 68" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M65 68 Q78 62 84 68" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Manos con símbolo */}
      <Circle cx="15" cy="70" r="4" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
      <Circle cx="85" cy="70" r="4" fill={`${color}40`} stroke={color} strokeWidth="1.5" />
    </Svg>
  );
}

// ── Supremo: Entidad cósmica suprema ─────────────────────────────────────────
function SupremoAvatar({ color, size }: { color: string; size: number }) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      {/* Anillos de energía */}
      <Circle cx="50" cy="50" r="47" stroke={`${color}12`} strokeWidth="1" fill="none" />
      <Circle cx="50" cy="50" r="43" stroke={`${color}20`} strokeWidth="1" fill="none" />
      <Circle cx="50" cy="50" r="39" stroke={`${color}30`} strokeWidth="1" fill="none" />
      {/* 16 rayos de energía */}
      {Array.from({length: 16}, (_, i) => {
        const deg = i * 22.5;
        const r = (deg * Math.PI) / 180;
        const inner = i % 2 === 0 ? 18 : 22;
        const outer = i % 2 === 0 ? 36 : 30;
        const x1 = 50 + Math.sin(r) * inner;
        const y1 = 50 - Math.cos(r) * inner;
        const x2 = 50 + Math.sin(r) * outer;
        const y2 = 50 - Math.cos(r) * outer;
        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={i % 2 === 0 ? "2.5" : "1.5"} opacity={i % 2 === 0 ? 1 : 0.6} />;
      })}
      {/* Corona de diamantes */}
      {[0,72,144,216,288].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const cx = 50 + Math.sin(r) * 36;
        const cy = 50 - Math.cos(r) * 36;
        return (
          <G key={i} transform={`translate(${cx},${cy}) rotate(${deg})`}>
            <Polygon points="0,-4 3,0 0,4 -3,0" fill={color} opacity={0.9} />
          </G>
        );
      })}
      {/* Núcleo central */}
      <Circle cx="50" cy="50" r="15" fill={`${color}25`} stroke={color} strokeWidth="2" />
      {/* Cara: ojos radiales */}
      <Circle cx="44" cy="47" r="3.5" fill={`${color}50`} stroke={color} strokeWidth="1.5" />
      <Circle cx="56" cy="47" r="3.5" fill={`${color}50`} stroke={color} strokeWidth="1.5" />
      <Circle cx="44" cy="47" r="2" fill={color} />
      <Circle cx="56" cy="47" r="2" fill={color} />
      <Circle cx="45" cy="46" r="0.8" fill="#fff" />
      <Circle cx="57" cy="46" r="0.8" fill="#fff" />
      {/* Marca de la frente */}
      <Polygon points="50,38 53,43 50,41 47,43" fill={color} />
      {/* Boca de poder */}
      <Path d="M43 55 Q50 59 57 55" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Path d="M46 55 L50 58 L54 55" stroke={color} strokeWidth="1.2" fill={`${color}40`} />
    </Svg>
  );
}
