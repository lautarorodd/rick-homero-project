import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, ramp } from "../anim";
import { C, SANS } from "../tokens";

// Piezas de interfaz del mundo (SVG, en coordenadas de escena): planas y limpias, como pide
// sistema-visual.md para lo secundario. El detalle va en los assets protagonistas.

/** Panel de vidrio: relleno translúcido, borde de luz arriba a la izquierda. */
export const Glass: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  fill?: string;
  rim?: string;
  opacity?: number;
}> = ({ id, x, y, w, h, r = 36, fill = "rgba(24,28,58,0.82)", rim = "#FFFFFF", opacity = 1 }) => (
  <g opacity={opacity}>
    <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor={rim} stopOpacity={0.55} />
      <stop offset="50%" stopColor={rim} stopOpacity={0.08} />
      <stop offset="100%" stopColor={rim} stopOpacity={0.25} />
    </linearGradient>
    <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} />
    <rect x={x + 1} y={y + 1} width={w - 2} height={h - 2} rx={r - 1} fill="none" stroke={`url(#${id}-rim)`} strokeWidth={2.5} />
  </g>
);

/** Etiqueta técnica en mayúsculas con línea guía de 1,5 px hacia el objeto. */
export const Callout: React.FC<{
  x: number;
  y: number;
  to: { x: number; y: number };
  text: string;
  appear: number;
  hide?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  size?: number;
  k?: number; // escala de la cámara en ese momento: mantiene el tamaño en pantalla
}> = ({ x, y, to, text, appear, hide = 1e9, color = C.ia, anchor = "start", size = 26, k = 1 }) => {
  const frame = useCurrentFrame();
  const line = ramp(frame, appear, appear + 8, EASE.out);
  const show = clamp01((frame - appear - 3) / 5) * (1 - ramp(frame, hide, hide + 6));
  if (frame < appear || show + line <= 0) return null;
  const fs = size / k;
  const ly = y - fs * 0.35;
  return (
    <g opacity={1 - ramp(frame, hide, hide + 6)}>
      <line
        x1={to.x}
        y1={to.y}
        x2={to.x + (x - to.x) * line}
        y2={to.y + (ly - to.y) * line}
        stroke={color}
        strokeOpacity={0.75}
        strokeWidth={1.5 / k}
      />
      <circle cx={to.x} cy={to.y} r={5 / k} fill={color} opacity={line} />
      <text
        x={x + (anchor === "start" ? 10 : anchor === "end" ? -10 : 0) / k}
        y={y}
        textAnchor={anchor}
        fontFamily={SANS}
        fontWeight={600}
        fontSize={fs}
        letterSpacing={fs * 0.08}
        fill={color}
        opacity={show}
      >
        {text}
      </text>
    </g>
  );
};

/** Texto de interfaz. */
export const T: React.FC<{
  x: number;
  y: number;
  size: number;
  weight?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  children: React.ReactNode;
  opacity?: number;
  family?: string;
}> = ({ x, y, size, weight = 600, color = C.texto, anchor = "start", children, opacity = 1, family = SANS }) => (
  <text x={x} y={y} fontFamily={family} fontWeight={weight} fontSize={size} fill={color} textAnchor={anchor} opacity={opacity}>
    {children}
  </text>
);
