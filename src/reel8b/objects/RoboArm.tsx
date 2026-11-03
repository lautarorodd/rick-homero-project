import React from "react";
import { clamp01, lerp } from "../anim";
import { C, HOMERO as K } from "../tokens";

// Reel 7: las manos de Homero. Dos brazos robóticos que le brotan de los hombros ("un agente es una IA con
// manos"): metálicos, articulados (hombro, codo, muñeca y dedos de dos falanges), con la paleta de la
// cuenta (acero claro, uniones azul noche, luces cian y una franja amarilla Homero). Tienen vida propia:
// en reposo los dedos tamborilean, las luces laten y el pistón del antebrazo acompaña al codo.
//
// Se ubican en coordenadas de escena: `base` (el hombro) y `target` (la muñeca); la cinemática inversa de
// dos tramos decide el codo. Medidas locales (antes de `s`): brazo 230, antebrazo 214, mano ~150.

export type Pt = { x: number; y: number };

export const ROBO = { upper: 230, fore: 214, palm: 74, prox: 36, dist: 30 };
/** La mano se dibuja más grande que el tramo (se lee mejor en el celular). */
export const HAND_SCALE = 1.35;
const INK = K.contorno;
const ST = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const STEEL = { hi: "#F2F5FB", mid: "#C3CCDF", lo: "#8591AE" };
const JOINT = "#22284A";
const LED = C.neutro;
const STRIPE = K.piel; // amarillo Homero

/** Curvatura de cada dedo (índice, medio, anular, meñique) y del pulgar, 0 estirado … 1 cerrado. */
export type HandShape = { curl: [number, number, number, number]; thumb: number };

export const HANDS = {
  abierta: { curl: [0.08, 0.05, 0.08, 0.12], thumb: 0.1 },
  relajada: { curl: [0.3, 0.35, 0.4, 0.45], thumb: 0.3 },
  senalar: { curl: [0, 0.95, 0.95, 0.95], thumb: 0.7 },
  agarrar: { curl: [0.62, 0.62, 0.62, 0.62], thumb: 0.62 },
  puno: { curl: [1, 1, 1, 1], thumb: 0.9 },
} satisfies Record<string, HandShape>;

export const mixHand = (a: HandShape, b: HandShape, t: number): HandShape => ({
  curl: a.curl.map((v, i) => lerp(v, b.curl[i], t)) as HandShape["curl"],
  thumb: lerp(a.thumb, b.thumb, t),
});

/** Tamborileo: cada dedo baja y sube en secuencia (índice → meñique), como quien espera. */
export const drumming = (frame: number, base: HandShape = HANDS.relajada, amount = 1): HandShape => ({
  curl: base.curl.map((v, i) => clamp01(v + amount * 0.42 * Math.max(0, Math.sin(frame * 0.55 - i * 0.95)) ** 2)) as HandShape["curl"],
  thumb: base.thumb + amount * 0.08 * Math.sin(frame * 0.2),
});

const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** Codo por cinemática inversa (coordenadas locales: base en el origen). */
const solve = (t: Pt, l1: number, l2: number, bend: number) => {
  const d = Math.min(l1 + l2 - 0.5, Math.max(Math.abs(l1 - l2) + 0.5, Math.hypot(t.x, t.y)));
  const a = Math.atan2(t.y, t.x);
  const alpha = Math.acos(clamp01((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
  const sh = a - bend * alpha;
  const elbow = { x: Math.cos(sh) * l1, y: Math.sin(sh) * l1 };
  const fa = Math.atan2(t.y - elbow.y, t.x - elbow.x);
  return { sh: deg(sh), fa: deg(fa), elbow, wrist: { x: elbow.x + Math.cos(fa) * l2, y: elbow.y + Math.sin(fa) * l2 } };
};

/** Dónde poner la muñeca para que la punta del índice toque `p` con la mano apuntando a `handDeg`. */
export const wristFor = (p: Pt, handDeg: number, s: number, flip = false): Pt => {
  const tip = { x: (ROBO.palm + ROBO.prox + ROBO.dist + 6) * HAND_SCALE, y: (flip ? 1 : -1) * 27 * HAND_SCALE };
  const a = rad(handDeg);
  return { x: p.x - s * (tip.x * Math.cos(a) - tip.y * Math.sin(a)), y: p.y - s * (tip.x * Math.sin(a) + tip.y * Math.cos(a)) };
};

/** Punto de agarre (centro de la mano cerrada) en escena, para colgarle objetos. */
export const gripPoint = (wrist: Pt, handDeg: number, s: number): Pt => {
  const a = rad(handDeg);
  const r = (ROBO.palm + 22) * HAND_SCALE * s;
  return { x: wrist.x + Math.cos(a) * r, y: wrist.y + Math.sin(a) * r };
};

// ---------- piezas (en coordenadas locales del tramo: va de x = 0 a x = len, centrado en y = 0) ----------
const Grad: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={STEEL.hi} />
    <stop offset="38%" stopColor={STEEL.mid} />
    <stop offset="100%" stopColor={STEEL.lo} />
  </linearGradient>
);

/** Un tramo del brazo: tubo que se afina, con panel, tornillos, franja amarilla y canal de luz cian. */
const Segment: React.FC<{ id: string; len: number; w0: number; w1: number; glow: number; stripe?: boolean; piston?: number }> = ({ id, len, w0, w1, glow, stripe = true, piston }) => {
  const h0 = w0 / 2;
  const h1 = w1 / 2;
  const body = `M 0 ${-h0} L ${len} ${-h1} L ${len} ${h1} L 0 ${h0} Z`;
  return (
    <g>
      {piston !== undefined ? (
        // pistón hidráulico por debajo del tramo: la barra entra y sale con el codo
        <g>
          <rect x={18} y={h0 - 4} width={len * 0.52} height={16} rx={8} fill={JOINT} {...ST} strokeWidth={4} />
          <rect x={18 + len * 0.5} y={h0} width={len * (0.22 + 0.14 * piston)} height={9} rx={4.5} fill={STEEL.hi} stroke={INK} strokeWidth={3.5} />
        </g>
      ) : null}
      <path d={body} fill={`url(#${id})`} {...ST} />
      {/* brillo de arriba y sombra de abajo */}
      <path d={`M 10 ${-h0 + 9} L ${len - 10} ${-h1 + 9}`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      {stripe ? <path d={`M ${len * 0.18} ${-h0 * 0.55} L ${len * 0.34} ${-h0 * 0.55} L ${len * 0.3} ${h0 * 0.3} L ${len * 0.14} ${h0 * 0.3} Z`} fill={STRIPE} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
      {/* canal de luz */}
      <rect x={len * 0.44} y={-4} width={len * 0.4} height={8} rx={4} fill={JOINT} />
      <rect x={len * 0.44} y={-4} width={len * 0.4 * (0.35 + 0.65 * glow)} height={8} rx={4} fill={LED} opacity={0.6 + 0.4 * glow} />
      {/* tornillos */}
      {[0.1, 0.9].map((u) => (
        <circle key={u} cx={len * u} cy={lerp(h0, h1, u) * 0.55} r={4.5} fill={STEEL.lo} stroke={INK} strokeWidth={2.5} />
      ))}
    </g>
  );
};

/** Articulación: disco azul noche con aro de acero y una luz cian en el centro. */
const Joint: React.FC<{ r: number; glow: number }> = ({ r, glow }) => (
  <g>
    <circle r={r} fill={STEEL.mid} {...ST} />
    <circle r={r * 0.72} fill={JOINT} stroke={INK} strokeWidth={3} />
    {[0, 90, 180, 270].map((a) => (
      <circle key={a} cx={Math.cos(rad(a + 45)) * r * 0.86} cy={Math.sin(rad(a + 45)) * r * 0.86} r={2.8} fill={INK} />
    ))}
    <circle r={r * 0.34} fill={LED} opacity={0.35 + 0.65 * glow} />
    <circle r={r * 0.62} fill={LED} opacity={0.18 * glow} />
    <circle cx={-r * 0.12} cy={-r * 0.14} r={r * 0.11} fill="#FFFFFF" opacity={0.9} />
  </g>
);

/** Un dedo: falange de base y punta, con nudillos; `curl` dobla las dos hacia la palma (+y). */
const Finger: React.FC<{ curl: number; len: number; w: number; tipGlow: number }> = ({ curl, len, w, tipGlow }) => {
  const k = clamp01(curl);
  const a1 = 62 * k;
  const a2 = 78 * k;
  const p = len;
  const d = len * 0.84;
  return (
    <g transform={`rotate(${a1})`}>
      <rect x={-4} y={-w / 2} width={p + 8} height={w} rx={w / 2} fill={STEEL.mid} {...ST} strokeWidth={5} />
      <path d={`M 4 ${-w / 2 + 5} L ${p - 4} ${-w / 2 + 5}`} stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" opacity={0.7} />
      <g transform={`translate(${p} 0) rotate(${a2})`}>
        <rect x={-2} y={-w / 2 + 1} width={d + 4} height={w - 2} rx={(w - 2) / 2} fill={STEEL.mid} {...ST} strokeWidth={5} />
        {/* yema con luz (se prende al hacer clic) */}
        <rect x={d - 10} y={-w / 2 + 4} width={12} height={w - 8} rx={5} fill={LED} opacity={0.45 + 0.55 * tipGlow} />
        <circle r={w * 0.42} fill={JOINT} stroke={INK} strokeWidth={3.5} />
      </g>
      <circle r={w * 0.48} fill={JOINT} stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** La mano (muñeca en el origen, dedos hacia +x, palma hacia +y). `flip` la espeja (mano del otro lado). */
export const RoboHand: React.FC<{ hand: HandShape; glow: number; tap?: number; prop?: React.ReactNode }> = ({ hand, glow, tap = 0, prop }) => {
  const P = ROBO.palm;
  const ys = [-27, -9, 9, 27];
  const lens = [ROBO.prox, ROBO.prox + 4, ROBO.prox + 1, ROBO.prox - 6];
  return (
    <g>
      {/* muñeca */}
      <rect x={-14} y={-26} width={28} height={52} rx={10} fill={JOINT} {...ST} strokeWidth={5} />
      {/* dedos de atrás (anular y meñique) debajo de la palma */}
      {[3, 2].map((i) => (
        <g key={i} transform={`translate(${P - 6} ${ys[i]})`}>
          <Finger curl={hand.curl[i]} len={lens[i]} w={17} tipGlow={glow * 0.4} />
        </g>
      ))}
      {/* palma: placa con nudillos y una luz */}
      <path d={`M 4 -30 C 4 -40 14 -42 24 -42 L ${P - 4} -38 C ${P + 6} -36 ${P + 8} -30 ${P + 8} -20 L ${P + 8} 22 C ${P + 8} 34 ${P + 2} 40 ${P - 8} 40 L 22 40 C 10 40 4 34 4 24 Z`} fill={`url(#robo-steel)`} {...ST} />
      <path d={`M 14 -30 L ${P - 6} -28`} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      <circle cx={P * 0.44} cy={2} r={9} fill={JOINT} stroke={INK} strokeWidth={3} />
      <circle cx={P * 0.44} cy={2} r={5} fill={LED} opacity={0.5 + 0.5 * glow} />
      {prop}
      {/* índice y medio, arriba de la palma */}
      {[1, 0].map((i) => (
        <g key={i} transform={`translate(${P - 6} ${ys[i]})`}>
          <Finger curl={hand.curl[i]} len={lens[i]} w={18} tipGlow={i === 0 ? Math.max(glow * 0.4, tap) : glow * 0.4} />
        </g>
      ))}
      {/* pulgar, del lado del índice */}
      <g transform={`translate(18 -36) rotate(${-38 + 70 * hand.thumb})`}>
        <Finger curl={hand.thumb * 0.6} len={28} w={19} tipGlow={glow * 0.4} />
      </g>
      {tap > 0.01 ? (
        <circle cx={P + ROBO.prox + ROBO.dist} cy={ys[0]} r={14 + 34 * tap} fill="none" stroke={LED} strokeWidth={5} opacity={1 - tap} />
      ) : null}
    </g>
  );
};

export type RoboArmProps = {
  id: string;
  base: Pt;
  target: Pt;
  /** escala de dibujo (1 = medidas locales) */
  s?: number;
  /** de qué lado dobla el codo: 1 o −1 */
  bend?: 1 | -1;
  /** ángulo absoluto de la mano en grados (0 = hacia la derecha); por defecto sigue al antebrazo */
  handDeg?: number;
  hand?: HandShape;
  /** espeja la mano (pulgar del otro lado): para el brazo izquierdo de la pantalla */
  flip?: boolean;
  /** 0 … 1: el brazo brota (crece desde el hombro, con la mano que se abre al final) */
  grow?: number;
  /** 0 … 1: pulso de luz (actividad) */
  glow?: number;
  /** 0 … 1: onda del clic en la punta del índice */
  tap?: number;
  frame: number;
  prop?: React.ReactNode;
  /** sin el disco del hombro (cuando el brazo entra desde afuera de cuadro) */
  hub?: boolean;
};

/** Un brazo robótico completo (hombro, brazo, codo, antebrazo con pistón, muñeca y mano). */
export const RoboArm: React.FC<RoboArmProps> = ({ id, base, target, s = 1, bend = 1, handDeg, hand = HANDS.relajada, flip = false, grow = 1, glow = 0, tap = 0, frame, prop, hub = true }) => {
  if (grow < 0.01) return null;
  const g = grow;
  const loc = { x: ((target.x - base.x) / s) * 1, y: (target.y - base.y) / s };
  const ik = solve(loc, ROBO.upper, ROBO.fore, bend);
  const fa = ik.fa;
  const hd = handDeg ?? fa;
  const elbowBend = ((fa - ik.sh + 540) % 360) - 180;
  const pulseGlow = clamp01(0.45 + 0.25 * Math.sin(frame / 6) + glow);
  const handK = clamp01((g - 0.6) / 0.4);
  const hs = mixHand(HANDS.puno, hand, handK);
  return (
    <g transform={`translate(${base.x} ${base.y}) scale(${s * g})`}>
      <Grad id="robo-steel" />
      <Grad id={`${id}-steel`} />
      {/* brazo */}
      <g transform={`rotate(${ik.sh})`}>
        <Segment id={`${id}-steel`} len={ROBO.upper} w0={60} w1={50} glow={pulseGlow} />
      </g>
      {/* antebrazo con pistón */}
      <g transform={`translate(${ik.elbow.x} ${ik.elbow.y}) rotate(${fa})`}>
        <Segment id={`${id}-steel`} len={ROBO.fore} w0={50} w1={42} glow={pulseGlow} stripe={false} piston={clamp01(Math.abs(elbowBend) / 120)} />
      </g>
      <g transform={`translate(${ik.elbow.x} ${ik.elbow.y})`}>
        <Joint r={32} glow={pulseGlow} />
      </g>
      {/* mano */}
      <g transform={`translate(${ik.wrist.x} ${ik.wrist.y}) rotate(${hd}) scale(${HAND_SCALE * (0.4 + 0.6 * handK)} ${(flip ? -1 : 1) * HAND_SCALE * (0.4 + 0.6 * handK)})`}>
        <RoboHand hand={hs} glow={pulseGlow} tap={tap} prop={prop} />
      </g>
      {hub ? (
        <g>
          <circle r={46} fill={STEEL.lo} {...ST} />
          <Joint r={38} glow={pulseGlow} />
        </g>
      ) : null}
    </g>
  );
};

/** Muñeca de un RoboArm en escena (igual a `target`, salvo que esté fuera de alcance). */
export const roboWrist = (base: Pt, target: Pt, s = 1, bend: 1 | -1 = 1): Pt => {
  const ik = solve({ x: (target.x - base.x) / s, y: (target.y - base.y) / s }, ROBO.upper, ROBO.fore, bend);
  return { x: base.x + ik.wrist.x * s, y: base.y + ik.wrist.y * s };
};
