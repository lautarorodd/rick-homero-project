import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, lerp, pop, pulse, ramp } from "../anim";
import { FitSign } from "../objects/R3";
import { TokenPill, layoutPills } from "../objects/R5";
import { mix } from "../objects/R6";
import { ANSWER, AMBER, CYAN, FlashPulse, LightOrb, Q_TOKENS } from "../objects/R8";
import { headToWorld } from "../rig/Homero";
import { SceneCam } from "../stage";
import { SC, exitFade, pw } from "../timeline";
import { SANS } from "../tokens";
import { textWidth } from "../ui/fit";
import { Backdrop } from "../world/Backdrop";
import { HomeroB, Tag } from "./common";
import { FACES, MOUTHS, homeroPose } from "./homeroPose";

const EYES_LOCAL = [
  { x: -62, y: -38 },
  { x: 58, y: -44 },
];

// ---------------------------------------------------------------- E · tokens (frases 9–10)
// Adentro de la computadora: la pregunta llega brillando, se corta en sus 13 fichas reales (TOKENS) y
// Homero las lee todas a la vez.
const E = { primero: pw(9, "primero"), corto: pw(9, "corto"), pedacitos: pw(9, "pedacitos"), leo: pw(10, "leo"), entera: pw(10, "entera"), vez: pw(10, "vez") };
const HE = { x: 540, y: 1840, scale: 0.86 };
const PILL = 46;
const LAYOUT = layoutPills(Q_TOKENS, PILL, 900, 14);
const QY = 880;
/** La pregunta como texto corrido (las fichas pegadas, sin espacio), en dos renglones. */
const START = layoutPills(Q_TOKENS, PILL, 700, -PILL * 0.84);

export const SceneE: React.FC = () => {
  const frame = useCurrentFrame();
  const arrive = ramp(frame, SC.E, SC.E + 14, EASE.out);
  const cut = ramp(frame, E.corto - 2, E.corto + 10, EASE.inOut);
  const read = ramp(frame, E.leo - 3, E.leo + 3) * (1 - ramp(frame, E.vez + 6, E.vez + 16));
  const pose = homeroPose(frame, {
    face: [
      [0, { ...FACES.feliz, lidTop: 0.3, gazeX: 0, gazeY: -0.7 }],
      [E.leo - 3, { ...FACES.sorprendido, lidTop: 0.1, gazeX: 0, gazeY: -0.8 }, 5],
      [E.vez + 6, { ...FACES.feliz, lidTop: 0.32, gazeX: 0, gazeY: -0.6 }, 8],
    ],
    mouth: [[0, MOUTHS.sonrisa]],
    emotion: [[0, "neutro"]],
  });
  // texto entero (antes del corte) → fichas en su lugar (después)
  const startX = START.map((p) => p.x);
  const startY = START.map((p) => p.y);
  const tagK = frame < E.pedacitos - 2 ? 0 : pop(frame, E.pedacitos - 2, { damping: 14 });
  return (
    <g>
      <Backdrop id="e" bg="nocheCiruela" texture="dots" seed={11} />
      <SceneCam
        keys={[
          [SC.E, 540, 1080, 1.08],
          [E.corto, 540, 1060, 1.0],
          [E.leo, 540, 1120, 0.96],
          [SC.F, 540, 1100, 1.0],
        ]}
      >
        {/* rayos de lectura: de los ojos a todas las fichas a la vez */}
        {read > 0.01
          ? EYES_LOCAL.map((e, j) => {
              const w = headToWorld(HE, pose, e);
              return LAYOUT.map((p) => (
                <line key={`${j}-${p.i}`} x1={w.x} y1={w.y} x2={540 + p.x} y2={QY + p.y} stroke={CYAN} strokeWidth={3} opacity={0.35 * read} />
              ));
            })
          : null}
        <HomeroB id="e-homero" place={HE} pose={pose} badgeGlow={0.5 * read} />
        {/* la luz que llega y se vuelve texto */}
        {arrive < 1 ? (
          <g transform={`translate(540 ${lerp(300, QY, arrive)}) scale(${1 - arrive * 0.6})`} opacity={1 - arrive}>
            <LightOrb frame={frame} r={30} />
          </g>
        ) : null}
        <g transform={`translate(540 ${QY})`} opacity={arrive}>
          {cut < 0.01 ? <rect x={-410} y={-90} width={820} height={190} rx={60} fill={CYAN} opacity={0.18 + 0.08 * Math.sin(frame / 5)} /> : null}
          {Q_TOKENS.map((t, i) => {
            const p = LAYOUT[i];
            const x = lerp(startX[i], p.x, cut);
            const y = lerp(startY[i], p.y, cut) - Math.sin(cut * Math.PI) * 30 * ((i % 3) - 1);
            const glow = Math.max(read, 0.3 * pulse(frame, E.corto + i, 2, 10));
            return (
              <g key={i} transform={`translate(${x} ${y})`} opacity={clamp01(cut * 5)}>
                <TokenPill text={t} ci={i} size={PILL} k={cut} glow={glow} textColor={cut < 0.5 ? "#FFFFFF" : undefined} />
              </g>
            );
          })}
          {/* antes del corte: la pregunta entera, como texto (se apaga cuando aparecen las fichas) */}
          {cut < 0.2
            ? ["¿Qué le cocino a mi novio,", "que es vegetariano?"].map((l, i) => (
                <text key={l} x={0} y={-14 + i * 66} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52} fill="#FFFFFF" opacity={1 - clamp01(cut * 5)}>
                  {l}
                </text>
              ))
            : null}
        </g>
        <FlashPulse frame={frame} hits={[E.pedacitos, E.entera, E.vez]} y={QY} />
        <Tag text="TOKENS" x={860} y={690} tx={540 + LAYOUT[11].x} ty={QY + LAYOUT[11].y - 30} k={tagK * exitFade(frame, SC.F + 1)} color={CYAN} />
      </SceneCam>
      {read > 0.01 ? (
        <g transform={`translate(540 600) scale(${pop(frame, E.leo - 3, { damping: 14 }) * exitFade(frame, SC.F + 1)})`}>
          <FitSign lines={["LA LEE ENTERA, DE UNA VEZ"]} size={64} maxW={860} />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- F · una palabra a la vez (frases 11–14)
const F = { elijo: pw(11, "elijo"), palabra: pw(11, "palabra"), agrego: pw(12, "agrego"), vuelvo: pw(13, "vuelvo"), todo: pw(13, "todo"), elijo2: pw(14, "elijo"), siguiente: pw(14, "siguiente") };
const HF = { x: 540, y: 1880, scale: 0.8 };
const CARD = { x: 540, y: 960, w: 920 };
const ANS_SIZE = 50;
/** Cuándo entra cada palabra de la respuesta a la tarjeta (las dos primeras, en sus palabras del audio). */
const ADD = [F.agrego, F.siguiente + 8, F.siguiente + 18, F.siguiente + 26];
/** Barridos de relectura: la relectura dicha ("vuelvo a leer todo") y uno después de cada palabra nueva. */
const SWEEPS = [F.vuelvo, ...ADD.map((f) => f + 3)];
const CANDIDATES = [
  { at: F.elijo, words: ["¡Probá", "¡Hacé", "¡Cociná"], pick: 0 },
  { at: F.elijo2, words: ["una", "un", "algo"], pick: 1 },
];

/** Renglones de la tarjeta (palabras con su x, y). */
const cardLayout = (n: number) => {
  const out: { w: string; x: number; y: number }[] = [];
  let x = 0;
  let y = 0;
  const maxW = CARD.w - 100;
  ANSWER.slice(0, n).forEach((w) => {
    const ww = textWidth(w, ANS_SIZE, 800);
    if (x + ww > maxW && x > 0) {
      x = 0;
      y += ANS_SIZE * 1.35;
    }
    out.push({ w, x, y });
    x += ww + ANS_SIZE * 0.32;
  });
  return out;
};

export const SceneF: React.FC = () => {
  const frame = useCurrentFrame();
  const shown = ADD.filter((f) => frame >= f).length;
  const lay = cardLayout(shown);
  const glowOf = (i: number) => Math.max(0, ...SWEEPS.map((s) => (frame >= s ? pulse(frame, s + i * 2, 2, 10) : 0)));
  const pose = homeroPose(frame, {
    face: [
      [0, { ...FACES.feliz, lidTop: 0.3, gazeX: 0, gazeY: -0.6 }],
      [F.vuelvo - 2, { ...FACES.neutral, lidTop: 0.2, gazeX: -0.6, gazeY: -0.8 }, 5],
      [F.todo + 4, { ...FACES.neutral, lidTop: 0.2, gazeX: 0.6, gazeY: -0.8 }, 8],
      [F.siguiente, { ...FACES.feliz, lidTop: 0.3, gazeX: 0, gazeY: -0.6 }, 8],
    ],
    mouth: [[0, MOUTHS.sonrisa]],
    emotion: [[0, "neutro"]],
  });
  const sign = frame < SC.F + 4 ? 0 : pop(frame, SC.F + 4, { damping: 14 });
  const cardH = 220;
  return (
    <g>
      <Backdrop id="f" bg="nocheIndigo" texture="dots" seed={13} />
      {frame >= F.vuelvo - 6 ? (
        <g opacity={ramp(frame, F.vuelvo - 6, F.vuelvo + 6)}>
          <Backdrop id="f2" bg="nocheCiruela" texture="rays" seed={13} />
        </g>
      ) : null}
      <SceneCam
        keys={[
          [SC.F, 540, 1100, 1.0],
          [F.agrego, 540, 1080, 1.04],
          [F.vuelvo, 540, 1000, 1.1],
          [F.todo + 8, 540, 1010, 1.09],
          [F.siguiente, 540, 1080, 1.0],
          [SC.H, 540, 1100, 1.0],
        ]}
      >
        {/* la tarjeta de la respuesta */}
        <g transform={`translate(${CARD.x} ${CARD.y})`}>
          <rect x={-CARD.w / 2} y={-cardH / 2} width={CARD.w} height={cardH} rx={34} fill="rgba(20,24,51,0.92)" stroke={AMBER} strokeWidth={4} />
          <text x={-CARD.w / 2 + 40} y={-cardH / 2 + 46} fontFamily={SANS} fontWeight={800} fontSize={26} fill={AMBER} letterSpacing={3}>
            RESPUESTA
          </text>
          {lay.map((p, i) => {
            const g = glowOf(i);
            const enter = pop(frame, ADD[i], { damping: 13 });
            return (
              <g key={i} transform={`translate(${-CARD.w / 2 + 50 + p.x} ${-cardH / 2 + 120 + p.y})`}>
                {g > 0.01 ? <rect x={-8} y={-ANS_SIZE + 4} width={textWidth(p.w, ANS_SIZE, 800) + 16} height={ANS_SIZE + 16} rx={12} fill={AMBER} opacity={0.45 * g} /> : null}
                <text x={0} y={0} fontFamily={SANS} fontWeight={800} fontSize={ANS_SIZE * (0.7 + 0.3 * enter)} fill={mix("#FFFFFF", "#FFE2A8", g)}>
                  {p.w}
                </text>
              </g>
            );
          })}
          {Math.floor(frame / 8) % 2 ? <rect x={-CARD.w / 2 + 50 + (lay.length ? lay[lay.length - 1].x + textWidth(lay[lay.length - 1].w, ANS_SIZE, 800) + 12 : 0)} y={-cardH / 2 + 80 + (lay.length ? lay[lay.length - 1].y : 0)} width={6} height={50} fill={AMBER} /> : null}
        </g>
        {/* las palabras candidatas: una se enciende y vuela a la tarjeta */}
        {CANDIDATES.map((cnd, ci) => {
          const next = ci === 0 ? F.agrego : ADD[1];
          if (frame < cnd.at - 4 || frame > next + 10) return null;
          const k = pop(frame, cnd.at - 4, { damping: 13 });
          const chosen = ramp(frame, cnd.at + 6, cnd.at + 12);
          const fly = ramp(frame, next - 6, next, EASE.in);
          return cnd.words.map((w, wi) => {
            const isPick = wi === cnd.pick;
            const x = (wi - 1) * 290;
            const target = cardLayout(ci + 1)[ci];
            const tx = -CARD.w / 2 + 50 + target.x + textWidth(w, ANS_SIZE, 800) / 2;
            const ty = CARD.y - cardH / 2 + 120 + target.y - 16 - 1340;
            const fade = isPick ? 1 : 1 - chosen;
            const px = isPick ? lerp(x, tx, fly) : x;
            const py = isPick ? lerp(0, ty, fly) : 0;
            if (isPick && fly >= 1) return null;
            const fs = 54;
            const ww = textWidth(w, fs, 800) + 50;
            return (
              <g key={`${ci}-${wi}`} transform={`translate(${540 + px} ${1340 + py}) scale(${k * (isPick ? 1 + 0.15 * chosen : 1)})`} opacity={fade}>
                <rect x={-ww / 2} y={-46} width={ww} height={84} rx={42} fill={isPick ? mix("#2A2F6B", "#FFB23D", chosen) : "#2A2F6B"} stroke={isPick && chosen > 0.5 ? "#FFFFFF" : "#5A66C8"} strokeWidth={4} />
                <text x={0} y={12} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fs} fill="#FFFFFF">
                  {w}
                </text>
              </g>
            );
          });
        })}
        <HomeroB id="f-homero" place={HF} pose={pose} badgeGlow={0.3} />
      </SceneCam>
      {sign > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign * exitFade(frame, SC.H + 1)})`}>
          <FitSign lines={["UNA PALABRA A LA VEZ"]} size={80} maxW={860} color={AMBER} />
        </g>
      ) : null}
    </g>
  );
};
