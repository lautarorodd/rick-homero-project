import React from "react";
import { random, useCurrentFrame } from "remotion";
import { clamp01, lerp } from "../anim";
import { C, Emotion, HOMERO as K } from "../tokens";
import { FPS } from "../words";

// Rig de Homero clásico, como en la serie: cabeza de tres cuartos mirando a la izquierda de la
// pantalla (hocico y nariz salen para ese lado, la oreja y la "M" de pelo quedan atrás) sobre un
// cuerpo casi de frente. Misma interfaz que el rig del v2 (Face, Mouth, brazos, headTurn…), así las
// escenas no cambian. Coordenadas del cuerpo: origen en la base del cuello, y hacia abajo. La cabeza
// tiene su propio origen entre los ojos, corrido HEAD_X a la izquierda del cuerpo (el cuello queda
// centrado y la cara adelante).

export type Mouth = {
  open: number; // 0 cerrada … 1 bien abierta
  wide: number; // 0 angosta … 1 ancha
  round: number; // 0 … 1 (O, U)
  smile: number; // -1 mueca … 1 sonrisa
  teeth: number; // 0 … 1 dientes de arriba
};

export type Face = {
  lidTop: number; // 0 bien abierto … 0,9 cerrado
  lidSkew: number; // cuánto más cerrado está el ojo derecho (asimetría)
  lidAngle: number; // grados; + enojo (bajan las puntas internas), − tristeza
  lidBottom: number; // 0 … 0,5 (ojos que sonríen)
  pupil: number; // escala de pupila
  gazeX: number; // -1 … 1
  gazeY: number; // -1 … 1
  papada: number; // 0 … 1
  wrinkles: number; // arrugas de la frente
  sniff: number; // olfateo
};

export type Gesture = "open" | "fist" | "index" | "grip";

export type Arm = {
  shoulder: number; // grados; 0 cuelga, + hacia afuera
  elbow: number; // grados, relativo al brazo
  hand: number; // grados, relativo al antebrazo
  gesture: Gesture;
};

export type HomeroPose = {
  face: Face;
  mouth: Mouth;
  armL: Arm; // brazo del lado izquierdo de la pantalla
  armR: Arm;
  headTilt: number;
  headTurn: number; // -1 … 1: corre los rasgos para girar la cara
  headDy: number;
  bodyTilt: number;
  squash: number; // + aplasta, − estira
  emotion: Emotion | null;
  halo: number; // 0 … 1
  /** reel 6: código de amenaza, 0 … 1: el blanco del ojo se pone rojo y la pupila brilla */
  redEye?: number;
};

export type Placement = { x: number; y: number; scale: number };

const NECK_PIVOT = -40;
const NECK_X = 26; // centro del cuello
const HEAD_X = -60;
/** Centro de la cara (entre los ojos) respecto del centro del cuerpo: para centrar la cara en cuadro. */
export const FACE_X = HEAD_X - 2;
const HEAD_Y = -306;
const BODY_PIVOT = 520;
const SHOULDER = { x: 214, y: 70 };
const UPPER = 168;
const FORE = 156;
export const CLOSED = 0.9;

// ---------- vida en reposo ----------
const blinkAt = (frame: number, seed: string) => {
  // parpadeos cada 2,5–5 s, irregulares, de 5 cuadros
  let t = Math.round((0.6 + random(`${seed}-b0`) * 2) * FPS);
  for (let i = 1; t <= frame + 6; i++) {
    const d = frame - t;
    if (d >= 0 && d < 5) return [0.55, 1, 1, 0.6, 0.2][d];
    t += Math.round((2.5 + random(`${seed}-b${i}`) * 2.5) * FPS);
  }
  return 0;
};

const saccadeAt = (frame: number, seed: string) => {
  // la pupila salta a un punto nuevo cada 0,8–2 s
  let t = 0;
  let prev = { x: 0, y: 0 };
  let cur = { x: 0, y: 0 };
  for (let i = 0; t <= frame; i++) {
    prev = cur;
    cur = {
      x: (random(`${seed}-sx${i}`) - 0.5) * 0.5,
      y: (random(`${seed}-sy${i}`) - 0.5) * 0.3,
    };
    const next = t + Math.round((0.8 + random(`${seed}-st${i}`) * 1.2) * FPS);
    if (frame < next) {
      const k = clamp01((frame - t) / 2);
      return { x: lerp(prev.x, cur.x, k), y: lerp(prev.y, cur.y, k) };
    }
    t = next;
  }
  return cur;
};

// ---------- cinemática: dónde cae un punto del rig en el mundo ----------
type Pt = { x: number; y: number };

const rot = (p: Pt, deg: number, c: Pt): Pt => {
  const a = (deg * Math.PI) / 180;
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return {
    x: c.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: c.y + dx * Math.sin(a) + dy * Math.cos(a),
  };
};

/** Punto de la cabeza (coordenadas locales de la cabeza) en el mundo. */
export const headToWorld = (place: Placement, pose: HomeroPose, p: Pt): Pt => {
  let q = rot({ x: p.x + HEAD_X, y: p.y + HEAD_Y }, pose.headTilt, { x: NECK_X, y: NECK_PIVOT });
  q = { x: q.x, y: q.y + pose.headDy };
  q = rot(q, pose.bodyTilt, { x: 0, y: BODY_PIVOT });
  return { x: place.x + q.x * place.scale, y: place.y + q.y * place.scale };
};

/** Muñeca de un brazo en el mundo (para que un objeto siga a la mano). */
export const wristToWorld = (place: Placement, pose: HomeroPose, side: "L" | "R"): Pt => {
  const arm = side === "L" ? pose.armL : pose.armR;
  const sx = side === "L" ? 1 : -1; // el brazo derecho es el izquierdo espejado
  const toWorldDir = (deg: number, len: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: -Math.sin(a) * len * sx, y: Math.cos(a) * len };
  };
  const sh = { x: -SHOULDER.x * sx, y: SHOULDER.y };
  const e = toWorldDir(arm.shoulder, UPPER);
  const f = toWorldDir(arm.shoulder + arm.elbow, FORE);
  let q = { x: sh.x + e.x + f.x, y: sh.y + e.y + f.y };
  q = rot(q, pose.bodyTilt, { x: 0, y: BODY_PIVOT });
  return { x: place.x + q.x * place.scale, y: place.y + q.y * place.scale };
};

// ---------- piezas ----------
const ST = {
  stroke: K.contorno,
  strokeWidth: 6,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};
const RIM = "rgba(170,185,255,0.28)";

// cabeza (coordenadas de la cabeza): frente, cúpula y nuca; abajo se funde con el cuello
const HEAD =
  "M -98 -24 C -114 -116 -88 -212 2 -244 C 100 -276 214 -226 228 -110 C 240 -20 232 66 210 150 L 202 250 L -20 256 L -102 130 Z";
const HEAD_LINE =
  "M -101 40 L -98 -24 C -114 -116 -88 -212 2 -244 C 100 -276 214 -226 228 -110 C 240 -20 232 66 210 150 L 204 230";
const EAR = "M 176 50 C 202 20 246 48 236 92 C 228 126 194 132 176 110 Z";
const EAR_IN = "M 194 64 C 216 60 222 90 204 102";
const M_HAIR = "M 136 12 L 146 -30 L 162 -2 L 176 -36 L 192 4";
const HAIRS = [
  { d: "M 30 -250 C 18 -306 78 -326 98 -290", pivot: "30 -250", k: 1 },
  { d: "M 66 -256 C 64 -314 126 -326 140 -286", pivot: "66 -256", k: 1.25 },
];
// nariz: salchicha desde entre los ojos hacia abajo a la izquierda, con la punta redonda
const NOSE = "M -38 -10 L -110 66 A 34 34 0 0 0 -59 111 L 6 30 Z";

// hocico (la barba de siempre): desde abajo de la nariz hasta cerca de la oreja, sale hacia la
// izquierda y baja con la mandíbula
const muzzlePath = (drop: number) =>
  `M -30 52 C 40 70 112 84 156 104 C 176 144 170 190 150 ${216 + drop * 0.3} C 120 ${256 + drop} 76 ${272 + drop} 30 ${274 + drop} C -40 ${276 + drop} -104 ${256 + drop} -128 ${214 + drop * 0.6} C -150 186 -150 150 -132 132 C -112 112 -70 78 -30 52 Z`;

// ojo lejano (izquierda de la pantalla) y ojo cercano, que lo pisa un poco
const EYES = [
  { cx: -62, cy: -38, r: 62, side: 1 },
  { cx: 58, cy: -44, r: 66, side: -1 },
];

const Eye: React.FC<{
  id: string;
  cx: number;
  cy: number;
  r: number;
  lidTop: number;
  lidBottom: number;
  angle: number;
  px: number;
  py: number;
  pupil: number;
  red?: number;
}> = ({ id, cx, cy, r, lidTop, lidBottom, angle, px, py, pupil, red = 0 }) => {
  const top = cy - r + 2 * r * clamp01(lidTop);
  const bottom = cy + r - 2 * r * clamp01(lidBottom);
  const wide = r * 1.8;
  if (lidTop >= CLOSED - 0.03) {
    // cerrado: el párpado tapa todo el ojo y queda la línea de las pestañas
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={K.piel} {...ST} />
        <path
          d={`M ${cx - r * 0.82} ${cy + r * 0.3} Q ${cx} ${cy + r * 0.66} ${cx + r * 0.82} ${cy + r * 0.3}`}
          fill="none"
          {...ST}
        />
      </g>
    );
  }
  return (
    <g>
      <clipPath id={id}>
        <circle cx={cx} cy={cy} r={r} />
      </clipPath>
      <circle cx={cx} cy={cy} r={r} fill={K.ojo} />
      {red > 0.01 ? <circle cx={cx} cy={cy} r={r} fill="#E0213A" opacity={0.85 * red} /> : null}
      <g clipPath={`url(#${id})`}>
        {/* pupila de punto, sin brillo, como en la serie (con amenaza: un punto que brilla) */}
        {red > 0.01 ? <circle cx={cx + px} cy={cy + py} r={22 * red} fill="#FFB3BE" opacity={0.7 * red} /> : null}
        <circle cx={cx + px} cy={cy + py} r={8.5 * pupil} fill={red > 0.5 ? "#FFFFFF" : K.pupila} />
        <g transform={`rotate(${angle} ${cx} ${top})`}>
          <path
            d={`M ${cx - wide} ${cy - r * 2.4} L ${cx + wide} ${cy - r * 2.4} L ${cx + wide} ${top} Q ${cx} ${top + r * 0.16} ${cx - wide} ${top} Z`}
            fill={K.piel}
          />
          <path d={`M ${cx - wide} ${top} Q ${cx} ${top + r * 0.16} ${cx + wide} ${top}`} fill="none" {...ST} />
        </g>
        {lidBottom > 0.01 ? (
          <g>
            <path
              d={`M ${cx - wide} ${cy + r * 2.4} L ${cx + wide} ${cy + r * 2.4} L ${cx + wide} ${bottom} Q ${cx} ${bottom - r * 0.2} ${cx - wide} ${bottom} Z`}
              fill={K.piel}
            />
            <path d={`M ${cx - wide} ${bottom} Q ${cx} ${bottom - r * 0.2} ${cx + wide} ${bottom}`} fill="none" {...ST} />
          </g>
        ) : null}
      </g>
      <circle cx={cx} cy={cy} r={r} fill="none" {...ST} />
    </g>
  );
};

// boca sobre el hocico: centrada en (0, 172) y después corrida y girada a su lugar
const MOUTH_AT = "translate(-36 34) rotate(7) scale(0.92)";
const MouthShape: React.FC<{ id: string; m: Mouth }> = ({ id, m }) => {
  const cy = 172;
  const hw = lerp(lerp(46, 86, m.wide), 28, m.round);
  const open = clamp01(m.open);
  const corner = cy - m.smile * 14;
  if (open < 0.05) {
    const mid = cy + 4 + m.smile * 16;
    return (
      <g>
        <path d={`M ${-hw} ${corner} C ${-hw * 0.4} ${mid} ${hw * 0.4} ${mid} ${hw} ${corner}`} fill="none" {...ST} />
        {m.smile > 0.3 ? (
          <g opacity={clamp01((m.smile - 0.3) * 2)}>
            <path d={`M ${-hw - 8} ${corner - 10} Q ${-hw - 2} ${corner} ${-hw - 8} ${corner + 8}`} fill="none" {...ST} strokeWidth={5} />
            <path d={`M ${hw + 8} ${corner - 10} Q ${hw + 2} ${corner} ${hw + 8} ${corner + 8}`} fill="none" {...ST} strokeWidth={5} />
          </g>
        ) : null}
      </g>
    );
  }
  const top = cy - 4 - m.round * open * 26 + m.smile * 4;
  const bot = cy + 8 + open * 84 * (1 - 0.2 * m.round) + m.smile * 4;
  const d = `M ${-hw} ${corner} C ${-hw * 0.5} ${top} ${hw * 0.5} ${top} ${hw} ${corner} C ${hw * 0.8} ${bot} ${-hw * 0.8} ${bot} ${-hw} ${corner} Z`;
  const inner = corner + 0.75 * (bot - corner);
  return (
    <g>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={K.boca} />
      <g clipPath={`url(#${id})`}>
        <ellipse cx={0} cy={inner - 4} rx={hw * 0.62} ry={18} fill={K.lengua} />
        <rect x={-hw} y={top - 20} width={hw * 2} height={30} fill={K.dientes} opacity={m.teeth} />
      </g>
      <path d={d} fill="none" {...ST} />
    </g>
  );
};

// manos: muñeca en el origen, el antebrazo apunta hacia +y (cuatro dedos, como en la serie)
const PALM = "M -34 -4 C -48 16 -46 52 -28 66 C -10 78 22 76 36 60 C 48 46 46 12 34 -4 Z";
const finger = (x: number, y: number, len: number) =>
  `M ${x - 11} ${y} L ${x - 11} ${y + len} A 11 11 0 0 0 ${x + 11} ${y + len} L ${x + 11} ${y} Z`;
const THUMB = "M -30 10 C -54 12 -70 32 -62 48 C -54 62 -36 52 -26 38 Z";

const Hand: React.FC<{ g: Gesture; prop?: React.ReactNode }> = ({ g, prop }) => {
  const skin = { fill: K.piel, ...ST, strokeWidth: 6 };
  if (g === "open") {
    return (
      <g>
        <path d={finger(-21, 48, 30)} {...skin} />
        <path d={finger(1, 52, 34)} {...skin} />
        <path d={finger(23, 46, 28)} {...skin} />
        <path d={PALM} {...skin} />
        <path d={THUMB} {...skin} />
      </g>
    );
  }
  if (g === "index") {
    return (
      <g>
        <path d={finger(-6, 52, 66)} {...skin} />
        <path d={PALM} {...skin} />
        <path d="M -24 50 Q -14 58 -4 52 M 6 54 Q 16 60 26 50" fill="none" {...ST} strokeWidth={5} />
        <path d={THUMB} {...skin} transform="translate(14 8) scale(0.9)" />
      </g>
    );
  }
  // puño o mano que agarra: el objeto va entre la palma y el pulgar
  return (
    <g>
      <path d={PALM} {...skin} />
      <path d="M -28 50 Q -16 60 -6 52 M -2 54 Q 10 62 22 52" fill="none" {...ST} strokeWidth={5} />
      {prop}
      <path d={THUMB} {...skin} transform={g === "grip" ? "translate(26 -8) rotate(-30)" : "translate(16 6) scale(0.9)"} />
    </g>
  );
};

const UPPER_SKIN = "M -46 70 C -48 116 -46 160 -42 186 L 42 186 C 46 160 48 116 46 70 Z";
// la manga no tiene contorno arriba: así se funde con el hombro de la camisa
const SLEEVE = "M -60 -50 C -68 20 -68 84 -62 124 C -20 136 20 136 62 124 C 68 84 68 20 60 -50 Z";
const SLEEVE_EDGES = "M -60 -10 C -68 40 -68 90 -62 124 C -20 136 20 136 62 124 C 68 90 68 40 60 -10";
const FOREARM = "M -42 -16 C -45 50 -40 118 -33 160 L 33 160 C 40 118 45 50 42 -16 Z";

const ArmShape: React.FC<{ arm: Arm; dy: number; prop?: React.ReactNode }> = ({ arm, dy, prop }) => (
  <g transform={`translate(${-SHOULDER.x} ${SHOULDER.y - dy}) rotate(${arm.shoulder})`}>
    <path d={UPPER_SKIN} fill={K.piel} {...ST} />
    <path d={SLEEVE} fill={K.camisa} />
    <path d={SLEEVE_EDGES} fill="none" {...ST} />
    <path d="M -56 104 C -20 116 20 116 56 104" fill="none" stroke={K.camisaSombra} strokeWidth={5} />
    <g transform={`translate(0 ${UPPER}) rotate(${arm.elbow})`}>
      <path d={FOREARM} fill={K.piel} {...ST} />
      <g transform={`translate(0 ${FORE}) rotate(${arm.hand}) scale(1.5)`}>
        <Hand g={arm.gesture} prop={prop} />
      </g>
    </g>
  </g>
);

// cuello ancho (coordenadas de la cabeza): gira con la cabeza; arriba lo tapa la cabeza y abajo
// la camisa, que se dibuja encima
const NECK = "M -34 150 C -38 220 -40 300 -42 380 L 212 380 C 212 300 212 220 210 140 Z";
const NECK_EDGES = "M -36 220 C -38 280 -40 330 -42 380 M 211 220 C 211 280 212 330 212 380";
const TORSO =
  "M -92 -14 C -150 -8 -205 12 -238 52 C -272 92 -292 160 -300 260 L -318 600 L 318 600 L 300 260 C 292 160 272 92 238 52 C 205 12 150 -8 92 -14 Z";
// cuello de la camisa abierto, centrado en el cuello
const COLLAR_L = "M -104 -16 C -84 14 -50 44 -8 62 L -50 70 C -84 56 -116 30 -134 6 Z";
const COLLAR_R = "M 104 -16 C 84 14 50 44 8 62 L 50 70 C 84 56 116 30 134 6 Z";

const HALO: Record<Emotion, string> = {
  neutro: C.neutro,
  peligro: C.peligro,
  curioso: C.curioso,
  ok: C.ok,
};

export const Homero: React.FC<{
  id: string;
  place: Placement;
  pose: HomeroPose;
  layer?: "all" | "back" | "front";
  life?: boolean;
  headOverlay?: React.ReactNode;
  propL?: React.ReactNode;
  propR?: React.ReactNode;
}> = ({ id, place, pose, layer = "all", life = true, headOverlay, propL, propR }) => {
  const frame = useCurrentFrame();
  const f = pose.face;

  // vida en reposo
  const period = (2.8 + random(`${id}-breath`) * 0.7) * FPS;
  const breath = life ? 0.5 + 0.5 * Math.sin((frame / period) * Math.PI * 2) : 0;
  const blink = life && f.lidTop < 0.75 ? blinkAt(frame, id) : 0;
  const sac = life ? saccadeAt(frame, id) : { x: 0, y: 0 };
  const sway = life ? Math.sin((frame / (2.3 * FPS)) * Math.PI * 2) * 3 + pose.headTilt * -0.3 : 0;

  const lid = (v: number) => lerp(v, CLOSED, blink);
  const gx = clamp01((f.gazeX + sac.x + 1) / 2) * 2 - 1;
  const gy = clamp01((f.gazeY + sac.y + 1) / 2) * 2 - 1;
  const px = gx * 24;
  const py = gy * 20;
  const turn = pose.headTurn * 22;
  const dropJaw = clamp01(pose.mouth.open) * 22;
  const sq = pose.squash;
  const headLift = 0.015 * breath * (BODY_PIVOT - NECK_PIVOT);
  const shoulderLift = 0.015 * breath * (BODY_PIVOT - SHOULDER.y);
  const pap = clamp01(f.papada);
  const headT = `translate(0 ${pose.headDy - headLift}) rotate(${pose.headTilt} ${NECK_X} ${NECK_PIVOT}) translate(${HEAD_X} ${HEAD_Y})`;

  const back = (
    <>
      <g transform={headT}>
        <path d={NECK} fill={K.piel} />
        <path d={NECK_EDGES} fill="none" {...ST} />
      </g>
      {/* torso, con respiración */}
      <g transform={`translate(0 ${BODY_PIVOT}) scale(1 ${1 + 0.015 * breath}) translate(0 ${-BODY_PIVOT})`}>
        <path d={TORSO} fill="none" stroke={RIM} strokeWidth={22} />
        <path d={TORSO} fill={K.camisa} {...ST} />
        <path
          d="M 186 70 C 250 150 280 330 292 600 L 318 600 L 300 260 C 292 160 272 92 238 52 Z"
          fill={K.camisaSombra}
          opacity={0.55}
        />
        <g transform={`translate(${NECK_X} 0)`}>
          <path d="M -62 -14 L 0 58 L 62 -14 Z" fill={K.piel} {...ST} strokeWidth={5} />
          <path d={COLLAR_L} fill={K.camisa} {...ST} />
          <path d={COLLAR_R} fill={K.camisa} {...ST} />
          <path d="M 0 70 L 0 600" stroke={K.camisaSombra} strokeWidth={5} />
          {[160, 290, 420].map((y) => (
            <circle key={y} cx={10} cy={y} r={7} fill={K.camisaSombra} />
          ))}
        </g>
      </g>
      {/* cabeza */}
      <g transform={headT}>
        <g>
          <path d={HEAD_LINE} fill="none" stroke={RIM} strokeWidth={22} />
          <path d={HEAD} fill={K.piel} />
          <path d={HEAD_LINE} fill="none" {...ST} />
          {/* dos pelos arriba, con oscilación secundaria (y luz de borde para que se lean sobre el fondo) */}
          {HAIRS.map((h) => (
            <g key={h.pivot} transform={`rotate(${sway * h.k} ${h.pivot})`}>
              <path d={h.d} fill="none" stroke={RIM} strokeWidth={16} strokeLinecap="round" />
              <path d={h.d} fill="none" {...ST} />
            </g>
          ))}
          <g transform={`translate(${-turn * 0.4} 0)`}>
            <path d={EAR} fill={K.piel} {...ST} />
            <path d={EAR_IN} fill="none" {...ST} strokeWidth={5} />
            <path d={M_HAIR} fill="none" {...ST} />
          </g>
          <g transform={`translate(${turn} 0)`}>
            {/* papada: piel debajo del hocico, solo con la línea de abajo */}
            <path
              d={`M -96 240 C -80 ${292 + 34 * pap + dropJaw} 110 ${282 + 34 * pap + dropJaw} 132 210 Z`}
              fill={K.piel}
            />
            <path
              d={`M -70 ${262 + dropJaw * 0.5} C -50 ${292 + 34 * pap + dropJaw} 90 ${284 + 34 * pap + dropJaw} 114 ${240 + dropJaw * 0.5}`}
              fill="none"
              {...ST}
              opacity={0.4 + 0.6 * pap}
            />
            <path d={muzzlePath(dropJaw)} fill={K.barba} {...ST} />
            <g transform={MOUTH_AT}>
              <MouthShape id={`${id}-mouth`} m={pose.mouth} />
            </g>
            <g transform={`translate(-60 50) scale(${1 + 0.04 * f.sniff} ${1 - 0.07 * f.sniff}) translate(60 -50)`}>
              <path d={NOSE} fill={K.piel} {...ST} />
            </g>
            {EYES.map((e) => (
              <Eye
                key={e.side}
                id={`${id}-eye${e.side}`}
                cx={e.cx}
                cy={e.cy}
                r={e.r}
                lidTop={lid(e.side === 1 ? f.lidTop : f.lidTop + f.lidSkew)}
                lidBottom={f.lidBottom}
                angle={f.lidAngle * e.side}
                px={px}
                py={py}
                pupil={f.pupil}
                red={pose.redEye ?? 0}
              />
            ))}
            <g opacity={clamp01(f.wrinkles)}>
              <path d="M -96 -128 C -76 -142 -50 -144 -28 -136" fill="none" {...ST} strokeWidth={5} />
              <path d="M 24 -140 C 52 -152 88 -150 116 -136" fill="none" {...ST} strokeWidth={5} />
              <path d="M -52 -164 C -12 -178 40 -180 80 -168" fill="none" {...ST} strokeWidth={5} />
            </g>
            {headOverlay}
          </g>
        </g>
      </g>
    </>
  );

  const front = (
    <>
      <ArmShape arm={pose.armL} dy={shoulderLift} prop={propL} />
      <g transform="scale(-1 1)">
        <ArmShape arm={pose.armR} dy={shoulderLift} prop={propR} />
      </g>
    </>
  );

  const haloColor = pose.emotion ? HALO[pose.emotion] : C.neutro;
  return (
    <g transform={`translate(${place.x} ${place.y}) scale(${place.scale})`}>
      {layer !== "front" && pose.halo > 0.01 ? (
        <g>
          <radialGradient id={`${id}-halo`}>
            <stop offset="0%" stopColor={haloColor} stopOpacity={0.7} />
            <stop offset="55%" stopColor={haloColor} stopOpacity={0.24} />
            <stop offset="100%" stopColor={haloColor} stopOpacity={0} />
          </radialGradient>
          <circle cx={NECK_X} cy={HEAD_Y + pose.headDy} r={360} fill={`url(#${id}-halo)`} opacity={pose.halo} />
        </g>
      ) : null}
      <g
        transform={`rotate(${pose.bodyTilt} 0 ${BODY_PIVOT}) translate(0 ${BODY_PIVOT}) scale(${1 + 0.05 * sq} ${1 - 0.07 * sq}) translate(0 ${-BODY_PIVOT})`}
      >
        {layer !== "front" ? back : null}
        {layer !== "back" ? front : null}
      </g>
    </g>
  );
};
