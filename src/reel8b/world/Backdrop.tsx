import React from "react";
import { random, useCurrentFrame } from "remotion";
import { BG, BgName } from "../tokens";
import { FPS } from "../words";

// Fondo de color de cada escena (reel 3), siempre en movimiento: textura que se mueve (rayos que
// giran, puntos que derivan, nubes, vetas, corazones), partículas claras y una viñeta que respira.
// Coordenadas de pantalla; sobra de cada lado para los golpes y sacudidas de cámara.
export type Texture = "rays" | "dots" | "clouds" | "wood" | "hearts" | "stripes" | "sunset";

const X0 = -260;
const Y0 = -260;
const WW = 1600;
const HH = 2440;

const SPECKS = Array.from({ length: 46 }, (_, i) => ({
  x: random(`bd-x-${i}`) * 1080,
  y: random(`bd-y-${i}`) * 1920,
  r: 2 + random(`bd-r-${i}`) * 3.5,
  vy: -(6 + random(`bd-v-${i}`) * 14),
  vx: (random(`bd-vx-${i}`) - 0.5) * 8,
  a: 0.18 + random(`bd-a-${i}`) * 0.3,
}));
const CLOUDS = Array.from({ length: 9 }, (_, i) => ({
  x: random(`cl-x-${i}`) * 1300 - 100,
  y: 200 + i * 200 + random(`cl-y-${i}`) * 80,
  s: 0.7 + random(`cl-s-${i}`) * 0.9,
  v: 6 + random(`cl-v-${i}`) * 10,
}));

const wrap = (v: number, lo: number, hi: number) => lo + ((((v - lo) % (hi - lo)) + (hi - lo)) % (hi - lo));

const Cloud: React.FC<{ x: number; y: number; s: number; o?: number }> = ({ x, y, s, o = 0.75 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o} fill="#FFFFFF">
    <ellipse cx={0} cy={0} rx={130} ry={56} />
    <circle cx={-60} cy={-24} r={54} />
    <circle cx={30} cy={-46} r={70} />
    <circle cx={96} cy={-12} r={46} />
  </g>
);

const Heart: React.FC<{ x: number; y: number; s: number; c: string; o: number }> = ({ x, y, s, c, o }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M 0 30 C -60 -10 -50 -60 -20 -60 C -5 -60 0 -46 0 -40 C 0 -46 5 -60 20 -60 C 50 -60 60 -10 0 30 Z"
    fill={c}
    opacity={o}
  />
);

export const Backdrop: React.FC<{ id: string; bg: BgName; texture?: Texture; seed?: number }> = ({ id, bg, texture = "dots", seed = 0 }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const [c0, c1] = BG[bg];
  const breathe = 0.03 * Math.sin((t / 4) * Math.PI * 2);
  return (
    <g>
      <radialGradient id={`${id}-bg`} cx="50%" cy="46%" r="70%">
        <stop offset="0%" stopColor={c0} />
        <stop offset="100%" stopColor={c1} />
      </radialGradient>
      <rect x={X0} y={Y0} width={WW} height={HH} fill={`url(#${id}-bg)`} />
      {texture === "rays" ? (
        <g transform={`translate(540 900) rotate(${t * 6 + seed})`} opacity={0.22}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d="M 0 0 L -150 -2000 L 150 -2000 Z" fill="#FFFFFF" transform={`rotate(${i * 22.5})`} />
          ))}
        </g>
      ) : null}
      {texture === "dots" ? (
        <g opacity={0.2}>
          {Array.from({ length: 13 }, (_, row) =>
            Array.from({ length: 9 }, (_, col) => {
              const x = wrap(col * 150 + (row % 2) * 75 + t * 14, -150, 1230);
              const y = wrap(row * 170 - t * 10, -170, 2040);
              return <circle key={`${row}-${col}`} cx={x} cy={y} r={14 + 6 * Math.sin(t * 1.4 + row + col)} fill="#FFFFFF" />;
            }),
          )}
        </g>
      ) : null}
      {texture === "stripes" ? (
        <g opacity={0.14} transform={`translate(${(t * 40) % 160} 0) skewX(-24)`}>
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={-900 + i * 160} y={Y0} width={70} height={HH} fill="#FFFFFF" />
          ))}
        </g>
      ) : null}
      {texture === "wood" ? (
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <rect x={-120 + i * 140} y={Y0} width={136} height={HH} fill={i % 2 ? c1 : c0} opacity={0.55} />
              <path
                d={`M ${-60 + i * 140} ${Y0} C ${-40 + i * 140} 400 ${-80 + i * 140} 900 ${-56 + i * 140} 2200`}
                stroke="#000000"
                strokeOpacity={0.12}
                strokeWidth={4}
                fill="none"
              />
            </g>
          ))}
          <rect x={X0} y={1560} width={WW} height={40} fill="#000000" opacity={0.18} />
        </g>
      ) : null}
      {texture === "sunset" ? (
        <g>
          <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B1E78" />
            <stop offset="55%" stopColor="#C2347A" />
            <stop offset="100%" stopColor="#FF9A4D" />
          </linearGradient>
          <rect x={X0} y={Y0} width={WW} height={HH} fill={`url(#${id}-sun)`} />
          <circle cx={540} cy={1180 + 10 * Math.sin(t)} r={260} fill="#FFD36E" opacity={0.9} />
        </g>
      ) : null}
      {texture === "clouds"
        ? CLOUDS.map((c, i) => <Cloud key={i} x={wrap(c.x + t * c.v, -300, 1380)} y={c.y} s={c.s} o={0.55} />)
        : null}
      {texture === "hearts"
        ? Array.from({ length: 18 }, (_, i) => (
            <Heart
              key={i}
              x={wrap(random(`ht-x-${i}`) * 1080 + Math.sin(t + i) * 30, -60, 1140)}
              y={wrap(random(`ht-y-${i}`) * 1920 - t * (40 + i * 3), -80, 2000)}
              s={0.6 + random(`ht-s-${i}`) * 0.8}
              c="#FFFFFF"
              o={0.28}
            />
          ))
        : null}
      {/* partículas claras que suben */}
      {SPECKS.map((p, i) => (
        <circle
          key={i}
          cx={wrap(p.x + p.vx * t, -20, 1100)}
          cy={wrap(p.y + p.vy * t, -20, 1940)}
          r={p.r}
          fill="#FFFFFF"
          opacity={p.a * (0.6 + 0.4 * Math.sin(t * 2 + i))}
        />
      ))}
      {/* viñeta que respira */}
      <radialGradient id={`${id}-vig`} cx="50%" cy="48%" r="75%">
        <stop offset="60%" stopColor="#000000" stopOpacity={0} />
        <stop offset="100%" stopColor="#000000" stopOpacity={0.32 + breathe} />
      </radialGradient>
      <rect x={X0} y={Y0} width={WW} height={HH} fill={`url(#${id}-vig)`} />
    </g>
  );
};
