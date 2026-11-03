import React from "react";
import { random } from "remotion";
import { clamp01 } from "../anim";
import { SANS } from "../tokens";
import { textWidth } from "../ui/fit";
import { mix } from "./R6";

// Reel 6b: las cifras como "X de cada 100". Una grilla de 10 × 10 ojitos de la IA (la misma prueba, 100
// veces): los que chantajearon se ponen rojos con el párpado bajo (el código de amenaza), los demás quedan
// celestes. El número va siempre en una sola pieza con "de 100" y "CHANTAJEÓ" (`CountPlate`): nunca solo.
const INK = "#1C1A24";
export const EYE = { rx: 30, ry: 20 };

/** Rango de cada ojito en la cascada (orden mezclado y fijo por `seed`: cada empresa, su propio dibujo). */
const RANKS = new Map<string, number[]>();
export const ranks = (seed: string) => {
  const hit = RANKS.get(seed);
  if (hit) return hit;
  const key = Array.from({ length: 100 }, (_, i) => random(`r6b-${seed}-${i}`));
  const order = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => key[a] - key[b]);
  const r = new Array<number>(100);
  order.forEach((cell, k) => (r[cell] = k));
  RANKS.set(seed, r);
  return r;
};

/** Duración de la cascada (cuadros). El usuario pidió ≤ 0,8 s; la cifra entra cuando termina. */
export const CASCADE = 20;

/**
 * Cuánto de rojo tiene cada ojito en el cuadro: los primeros `n` (por rango) se encienden uno tras otro
 * entre `from` y `from + span`.
 */
export const cascade = (frame: number, from: number, n: number, seed: string, span = CASCADE) =>
  ranks(seed).map((rk) => (rk >= n ? 0 : clamp01((frame - (from + (rk / Math.max(1, n - 1)) * span)) / 3)));

/** Un ojito: `red` 0 … 1 (rojo + párpado a media asta), `look` mueve la pupila, `blink` cierra. */
const Eye: React.FC<{ red: number; look: number; blink: number; clip: string }> = ({ red, look, blink, clip }) => {
  const lid = Math.max(0.42 * red, blink);
  return (
    <g>
      <ellipse rx={EYE.rx} ry={EYE.ry} fill={mix("#F2F6FF", "#FFD6DC", red)} />
      <g clipPath={`url(#${clip})`}>
        <circle cx={look * 11} cy={1} r={12.5} fill={mix("#38D6E8", "#FF2D45", red)} />
        <circle cx={look * 11} cy={1} r={red > 0.5 ? 4 : 6} fill={INK} />
        {lid > 0.01 ? <rect x={-EYE.rx - 2} y={-EYE.ry - 2} width={EYE.rx * 2 + 4} height={(EYE.ry * 2 + 4) * lid} fill={mix("#163B5C", "#4A0710", red)} /> : null}
      </g>
      <ellipse rx={EYE.rx} ry={EYE.ry} fill="none" stroke={mix("#9FE3FF", "#FF5A6E", red)} strokeWidth={4} />
    </g>
  );
};

/**
 * La grilla de 100 ojitos, centrada en el origen; `pitch` entre centros. `reds[i]` 0 … 1 por ojito (de
 * `cascade`), `appear[i]` 0 … 1 su escala de entrada.
 */
export const EyeGrid: React.FC<{ id: string; reds: number[]; appear?: (i: number) => number; pitch?: number; frame: number; look?: number }> = ({
  id,
  reds,
  appear,
  pitch = 80,
  frame,
  look = 0,
}) => (
  <g>
    <clipPath id={`${id}-eye`}>
      <ellipse rx={EYE.rx} ry={EYE.ry} />
    </clipPath>
    {Array.from({ length: 100 }, (_, i) => {
      const r = Math.floor(i / 10);
      const c = i % 10;
      const s = appear ? appear(i) : 1;
      if (s < 0.01) return null;
      const red = reds[i] ?? 0;
      const blink = red < 0.5 && (frame + i * 17) % 110 < 4 ? 0.9 : 0;
      const hop = red > 0 && red < 1 ? 1 + 0.35 * Math.sin(red * Math.PI) : 1; // salta al ponerse rojo
      return (
        <g key={i} transform={`translate(${(c - 4.5) * pitch} ${(r - 4.5) * pitch}) scale(${s * hop * (pitch / 80)})`}>
          <Eye red={red} look={red > 0.5 ? 0 : look + 0.3 * Math.sin(frame / 14 + i)} blink={blink} clip={`${id}-eye`} />
        </g>
      );
    })}
  </g>
);

/**
 * La cifra, siempre entera: "EMPRESA · 96 de 100 · CHANTAJEÓ". Centrada en el origen; `k` es la escala
 * del pop (todo entra junto: nunca hay un cuadro con el número sin "de 100" ni sin "CHANTAJEÓ").
 */
export const CountPlate: React.FC<{ company: string; n: number; k: number; glow?: number }> = ({ company, n, k, glow = 0 }) => {
  if (k < 0.01) return null;
  const big = 104;
  // (sin espacios al principio del texto: el SVG los colapsa; el espacio va en `pre`)
  const parts = [
    { t: `${n}`, size: big, pre: 0 },
    { t: "de 100", size: 58, pre: 18 },
  ];
  const wNum = parts.reduce((a, p) => a + p.pre + textWidth(p.t, p.size, 900), 0);
  const tag = "CHANTAJEÓ";
  const wTag = textWidth(tag, 58, 900) + 44;
  const gap = 28;
  const w = Math.max(wNum + gap + wTag, textWidth(company, 34, 800)) + 70;
  const h = 196;
  let x = -(wNum + gap + wTag) / 2;
  return (
    <g transform={`scale(${k})`}>
      {glow > 0.01 ? <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={44} fill="#FF2D45" opacity={0.35 * glow} /> : null}
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={34} fill="#000000" opacity={0.35} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="rgba(14,8,16,0.96)" stroke="#FF2D45" strokeWidth={5} />
      <text x={0} y={-h / 2 + 46} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} letterSpacing={4} fill="#FFD6DC">
        {company}
      </text>
      {parts.map((p) => {
        x += p.pre;
        const el = (
          <text key={p.t} x={x} y={62} fontFamily={SANS} fontWeight={900} fontSize={p.size} fill="#FFFFFF">
            {p.t}
          </text>
        );
        x += textWidth(p.t, p.size, 900);
        return el;
      })}
      <g transform={`translate(${x + gap} 0)`}>
        <rect x={0} y={4} width={wTag} height={74} rx={18} fill="#FF2D45" />
        <text x={wTag / 2} y={62} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={58} fill="#FFFFFF">
          {tag}
        </text>
      </g>
    </g>
  );
};
