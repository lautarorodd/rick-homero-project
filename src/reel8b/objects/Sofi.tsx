import React from "react";
import { random, useCurrentFrame } from "remotion";
import { clamp01, lerp } from "../anim";
import { HOMERO as K } from "../tokens";
import { FPS } from "../words";

// Sofi, en el estilo de la serie (piel amarilla, ojos grandes que se tocan, contorno negro):
// personaje original, sentada (de la cintura para arriba). Origen en la base del cuello.
// Vida en reposo propia: parpadeo, respiración y la cola de pelo que se balancea.

export type SofiMood = "neutral" | "nervous" | "wow" | "happy" | "determined";
export type SofiArm = { shoulder: number; elbow: number }; // grados, como los brazos de Homero

export const SOFI_ARMS = {
  abajo: { shoulder: 6, elbow: -60 }, // manos sobre el escritorio
  celular: { shoulder: 14, elbow: 150 }, // sostiene el celular adelante, a la altura del pecho
  festejo: { shoulder: 160, elbow: 18 }, // brazos arriba
  pensar: { shoulder: -10, elbow: -140 }, // mano en el mentón
};

const HAIR = "#6B3E26";
const HAIR_DARK = "#4E2B19";
const SHIRT = "#8EC9F0";
const SHIRT_DARK = "#6AAAD6";
const ST = { stroke: K.contorno, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const blinkAt = (frame: number, seed: string) => {
  let t = Math.round((0.8 + random(`${seed}-b0`) * 1.5) * FPS);
  for (let i = 1; t <= frame + 6; i++) {
    const d = frame - t;
    if (d >= 0 && d < 5) return [0.55, 1, 1, 0.6, 0.2][d];
    t += Math.round((2.2 + random(`${seed}-b${i}`) * 2.8) * FPS);
  }
  return 0;
};

const Eye: React.FC<{ cx: number; cy: number; lid: number; px: number; py: number; pupil: number; side: 1 | -1; lashes?: boolean }> = ({
  cx,
  cy,
  lid,
  px,
  py,
  pupil,
  side,
  lashes = true,
}) => {
  const r = 46;
  const top = cy - r + 2 * r * clamp01(lid);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" />
      <clipPath id={`sofi-eye-${side}`}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <g clipPath={`url(#sofi-eye-${side})`}>
        <circle cx={cx + px} cy={cy + py} r={8 * pupil} fill={K.pupila} />
        {lid > 0.02 ? <rect x={cx - r - 2} y={cy - r - 2} width={2 * r + 4} height={top - (cy - r) + 2} fill={K.piel} /> : null}
        {lid > 0.02 ? <line x1={cx - r} y1={top} x2={cx + r} y2={top} {...ST} /> : null}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" {...ST} />
      {/* pestañas, hacia afuera */}
      {(lashes ? [0, 1, 2] : []).map((i) => {
        const a = (-120 + side * 0 - i * 18) * (Math.PI / 180);
        const ax = side === 1 ? -Math.cos(a) : Math.cos(a);
        const x0 = cx + ax * r * 0.92;
        const y0 = cy + Math.sin(a) * r * 0.92;
        return <line key={i} x1={x0} y1={y0} x2={x0 + ax * 22} y2={y0 + Math.sin(a) * 22} {...ST} strokeWidth={5} />;
      })}
    </g>
  );
};

const Mouth: React.FC<{ mood: SofiMood; talk: number }> = ({ mood, talk }) => {
  const y = -196;
  if (mood === "wow") {
    return <ellipse cx={0} cy={y + 6} rx={16} ry={22 + 6 * talk} fill="#7A2230" {...ST} />;
  }
  if (mood === "happy") {
    return (
      <g>
        <path d={`M -48 ${y - 8} Q 0 ${y + 52} 48 ${y - 8} Z`} fill="#7A2230" {...ST} />
        <path d={`M -36 ${y - 2} Q 0 ${y + 10} 36 ${y - 2}`} fill="#FFFFFF" stroke="none" />
      </g>
    );
  }
  if (mood === "nervous") {
    return <path d={`M -40 ${y} q 10 -10 20 0 t 20 0 t 20 0 t 20 0`} fill="none" {...ST} />;
  }
  const curve = mood === "determined" ? 6 : 16;
  return <path d={`M -36 ${y - 4} Q 0 ${y + curve} 36 ${y - 4}`} fill="none" {...ST} />;
};

const ArmShape: React.FC<{ a: SofiArm; prop?: React.ReactNode }> = ({ a, prop }) => (
  <g transform={`translate(-150 40) rotate(${a.shoulder})`}>
    <path d="M -34 -20 C -40 40 -38 100 -32 130 L 32 130 C 38 100 40 40 34 -20 Z" fill={SHIRT} {...ST} />
    <g transform={`translate(0 120) rotate(${a.elbow})`}>
      <path d="M -26 -10 C -28 50 -26 100 -22 130 L 22 130 C 26 100 28 50 26 -10 Z" fill={K.piel} {...ST} />
      <g transform="translate(0 140)">
        <circle cx={0} cy={0} r={30} fill={K.piel} {...ST} />
        <path d="M -14 22 L -14 34 M 0 26 L 0 38 M 14 22 L 14 34" {...ST} strokeWidth={5} />
        {prop}
      </g>
    </g>
  </g>
);

export const Sofi: React.FC<{
  id: string;
  x: number;
  y: number;
  scale: number;
  mood: SofiMood;
  gazeX?: number;
  gazeY?: number;
  armL?: SofiArm;
  armR?: SofiArm;
  propR?: React.ReactNode;
  tilt?: number;
  jump?: number; // 0 … 1, salto de festejo
  sweat?: number; // gota de nervios
  /** reel 7: 0 … 1, despeinada (mechones parados) y con ojeras (párpados caídos) */
  messy?: number;
  tired?: number;
  /** reel 8: el novio de Sofi (mismo estilo: pelo corto, sin cola ni aros, camisa verde, barba de pocos días) */
  novio?: boolean;
}> = ({ id, x, y, scale, mood, gazeX = 0, gazeY = 0, armL = SOFI_ARMS.abajo, armR = SOFI_ARMS.abajo, propR, tilt = 0, jump = 0, sweat = 0, messy = 0, tired = 0, novio = false }) => {
  const frame = useCurrentFrame();
  const breath = 0.5 + 0.5 * Math.sin((frame / (3 * FPS)) * Math.PI * 2);
  const blink = mood === "happy" ? 0 : blinkAt(frame, id);
  const lid = lerp(Math.max(mood === "determined" ? 0.3 : mood === "happy" ? 0.38 : 0.08, 0.42 * tired), 1, blink);
  const pupil = mood === "wow" ? 0.75 : mood === "nervous" ? 0.8 : 1;
  const px = gazeX * 18;
  const py = gazeY * 16;
  const sway = Math.sin(frame / 14) * 6;
  const talk = Math.abs(Math.sin(frame / 3));
  return (
    <g transform={`translate(${x} ${y - jump * 60}) scale(${scale}) rotate(${tilt})`}>
      {/* cola de pelo, atrás */}
      <g transform={`translate(0 70) rotate(${sway} 120 -430)`} opacity={novio ? 0 : 1}>
        <path d="M 110 -440 C 210 -430 240 -330 210 -230 C 196 -190 170 -180 160 -210 C 190 -280 170 -370 100 -400 Z" fill={HAIR} {...ST} />
        <circle cx={118} cy={-428} r={18} fill="#FF7AB6" {...ST} strokeWidth={5} />
      </g>
      {/* torso */}
      <g transform={`translate(0 400) scale(1 ${1 + 0.015 * breath}) translate(0 -400)`}>
        <path d="M -36 -130 L -40 10 L 40 10 L 36 -130 Z" fill={K.piel} {...ST} />
        <path d="M -60 0 C -140 4 -186 30 -196 90 L -214 420 L 214 420 L 196 90 C 186 30 140 4 60 0 Z" fill={novio ? "#5FBF7A" : SHIRT} {...ST} />
        <path d="M 150 60 C 190 140 200 260 206 420 L 214 420 L 196 90 Z" fill={SHIRT_DARK} opacity={0.6} />
        <path d="M -60 0 L 0 70 L -30 84 L -84 20 Z" fill="#FFFFFF" {...ST} strokeWidth={5} />
        <path d="M 60 0 L 0 70 L 30 84 L 84 20 Z" fill="#FFFFFF" {...ST} strokeWidth={5} />
      </g>
      {/* cabeza (baja 70: el cuello queda corto) */}
      <g transform={`translate(0 70) rotate(${tilt * 0.5} 0 -190)`}>
        <path d="M -112 -390 C -120 -300 -112 -224 -82 -186 C -50 -146 50 -146 82 -186 C 112 -224 120 -300 112 -390 Z" fill={K.piel} {...ST} />
        <circle cx={-118} cy={-260} r={16} fill={K.piel} {...ST} strokeWidth={5} />
        <circle cx={118} cy={-260} r={16} fill={K.piel} {...ST} strokeWidth={5} />
        {novio ? null : <circle cx={-120} cy={-232} r={8} fill="#38D6E8" {...ST} strokeWidth={3} />}
        {novio ? null : <circle cx={120} cy={-232} r={8} fill="#38D6E8" {...ST} strokeWidth={3} />}
        {novio ? <path d="M -84 -214 C -60 -150 60 -150 84 -214 C 60 -176 -60 -176 -84 -214 Z" fill="#8A6A4A" opacity={0.45} /> : null}
        {/* pelo de adelante: volumen arriba y flequillo */}
        {novio ? (
          <path d="M -118 -360 C -130 -440 -70 -480 0 -478 C 70 -480 130 -440 118 -360 L 96 -394 L 70 -372 L 40 -400 L 6 -376 L -28 -402 L -60 -374 L -92 -398 Z" fill="#2E1E14" {...ST} />
        ) : (
          <path
            d="M -128 -330 C -150 -440 -90 -520 0 -520 C 90 -520 150 -440 128 -330 C 116 -360 100 -380 80 -390 C 60 -360 20 -350 -10 -356 C -40 -352 -80 -360 -100 -384 C -112 -368 -122 -352 -128 -330 Z"
            fill={HAIR}
            {...ST}
          />
        )}
        {novio ? null : <path d="M -60 -480 C -30 -500 30 -500 60 -480" fill="none" stroke={HAIR_DARK} strokeWidth={6} strokeLinecap="round" />}
        {messy > 0.01 ? (
          <g opacity={clamp01(messy * 2)} transform={`translate(0 ${-10 * (1 - messy)})`}>
            {[
              "M -70 -500 C -90 -560 -60 -590 -40 -560",
              "M -10 -516 C -20 -580 20 -600 30 -566",
              "M 50 -500 C 70 -556 110 -560 104 -520",
              "M -110 -440 C -160 -470 -170 -430 -150 -410",
              "M 112 -430 C 150 -470 176 -440 150 -404",
            ].map((d, i) => (
              <path key={i} d={d} fill="none" stroke={HAIR} strokeWidth={16} strokeLinecap="round" transform={`rotate(${4 * Math.sin(frame / 7 + i)} 0 -500)`} />
            ))}
          </g>
        ) : null}
        <Eye cx={-46} cy={-300} lid={lid} px={px} py={py} pupil={pupil} side={1} lashes={!novio} />
        <Eye cx={46} cy={-300} lid={lid} px={px} py={py} pupil={pupil} side={-1} lashes={!novio} />
        {tired > 0.01 ? (
          <g opacity={clamp01(tired * 1.5)} fill="none" stroke="#8A5A9E" strokeWidth={6} strokeLinecap="round">
            <path d="M -82 -244 Q -46 -228 -12 -244" />
            <path d="M 12 -244 Q 46 -228 82 -244" />
            <path d="M -74 -232 Q -46 -220 -20 -232" opacity={0.6} />
            <path d="M 20 -232 Q 46 -220 74 -232" opacity={0.6} />
          </g>
        ) : null}
        <path d="M -4 -262 C 14 -256 18 -238 2 -230" fill="none" {...ST} />
        <Mouth mood={mood} talk={talk} />
        {sweat > 0.01 ? (
          <path
            d={`M 104 ${-330 + 40 * sweat} C 94 ${-310 + 40 * sweat} 98 ${-292 + 40 * sweat} 110 ${-292 + 40 * sweat} C 122 ${-292 + 40 * sweat} 124 ${-310 + 40 * sweat} 104 ${-330 + 40 * sweat} Z`}
            fill="#9FD8FF"
            {...ST}
            strokeWidth={4}
            opacity={clamp01(sweat * 3)}
          />
        ) : null}
      </g>
      {/* brazos adelante */}
      <ArmShape a={armL} />
      <g transform="scale(-1 1)">
        <ArmShape a={armR} prop={propR ? <g transform="scale(-1 1)">{propR}</g> : null} />
      </g>
    </g>
  );
};
