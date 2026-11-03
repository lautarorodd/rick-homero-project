import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, lerp, pop, ramp } from "../anim";
import { EjemploTag, WordCard } from "../objects/Cards";
import { SceneCam } from "../stage";
import { BgName, MONO, SANS } from "../tokens";
import { fitSize, textWidth } from "../ui/fit";
import { Backdrop } from "../world/Backdrop";
import { HomeroB } from "./common";
import { ARMS, FACES, MOUTHS, homeroPose } from "./homeroPose";

// La frase con un hueco y tres cartas con barras de probabilidad (del reel 3b): la carta más probable
// vuela al hueco. Reel 4: E (poco contexto, gana lo genérico) y K1 (con contexto, gana lo de Sofi).
export type Cand = { w: string; p: number; e?: string };

const LINE_Y = 610;
/** Cámara de la escena de cartas en el cuadro `at.end` (para ubicar el portal que sale del hueco). */
export const FAN_END_CAM = { x: 540, y: 930, s: 1.04 };

/** Geometría de la frase con hueco: tamaño de letra, ancho del último renglón y del hueco. */
export const gapGeom = (lines: string[], fill?: string) => {
  const last = lines[lines.length - 1];
  // la letra baja hasta que el último renglón + el hueco (ya lleno) entran en 820 px
  const measure = (s: number) => {
    const lw = textWidth(last, s, 900);
    const gapW = fill ? Math.max(220, textWidth(fill, s * 0.9, 700) + 40) : 260;
    return { lw, gapW, total: lw + 24 + gapW };
  };
  let size = Math.min(...lines.map((l) => fitSize([l], 84, 820, 900)));
  while (size > 30 && measure(size).total > 820) size -= 2;
  const m = measure(size);
  const x0 = 540 - m.total / 2;
  const y = LINE_Y + (lines.length - 1) * size * 1.15;
  return { size, last, ...m, x0, y, gapX: x0 + m.lw + 24 + m.gapW / 2 };
};

/** Frase con un hueco que parpadea (o ya lleno), centrada. */
const GapLine: React.FC<{ lines: string[]; fill?: string; filled: number; frame: number }> = ({ lines, fill, filled, frame }) => {
  const { size, last, lw, gapW, x0, y } = gapGeom(lines, fill);
  const blink = Math.floor(frame / 8) % 2 === 0;
  return (
    <g>
      {lines.slice(0, -1).map((l, i) => (
        <text key={l} x={540} y={LINE_Y + i * size * 1.15} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill="#FFFFFF" stroke="#1C1A24" strokeWidth={10} paintOrder="stroke">
          {l}
        </text>
      ))}
      <text x={x0} y={y} fontFamily={SANS} fontWeight={900} fontSize={size} fill="#FFFFFF" stroke="#1C1A24" strokeWidth={10} paintOrder="stroke">
        {last}
      </text>
      <g transform={`translate(${x0 + lw + 24} ${y})`}>
        {filled > 0.5 && fill ? (
          <g transform={`scale(${lerp(1.3, 1, clamp01((filled - 0.5) * 2))})`}>
            <rect x={-10} y={-size * 0.9} width={gapW + 20} height={size * 1.15} rx={16} fill="#FFE27A" stroke="#1C1A24" strokeWidth={6} />
            <text x={gapW / 2} y={-size * 0.08} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={fitSize([fill], size * 0.9, gapW, 700)} fill="#1C1A24">
              {fill}
            </text>
          </g>
        ) : (
          <rect x={0} y={-size * 0.82} width={gapW} height={size} rx={12} fill="#FFFFFF" opacity={blink ? 0.9 : 0.35} />
        )}
      </g>
    </g>
  );
};

export const FanScene: React.FC<{
  id: string;
  bg: BgName;
  lines: string[];
  fillText: string;
  cands: Cand[];
  at: { start: number; bars: number; pick: number; land: number; end: number };
  homeroFace: "feliz" | "desden";
  /** algo más en la escena (reel 4: las piezas de contexto de Sofi arriba de la frase) */
  extra?: React.ReactNode;
}> = ({ id, bg, lines, fillText, cands, at, homeroFace, extra }) => {
  const frame = useCurrentFrame();
  const H = { x: 920, y: 1930, scale: 0.74 };
  const pose = homeroPose(frame, {
    face: [
      [0, { ...FACES.neutral, gazeX: -0.9, gazeY: -0.7 }],
      [at.bars, { ...FACES.sorprendido, gazeX: -0.9, gazeY: -0.6 }, 6],
      [at.pick, homeroFace === "feliz" ? { ...FACES.feliz, gazeX: -0.9, gazeY: -0.9 } : { ...FACES.desden, gazeX: -0.6, gazeY: -0.4 }, 6],
    ],
    mouth: [
      [0, MOUTHS.reposo],
      [at.pick, homeroFace === "feliz" ? MOUTHS.sonrisaAbierta : MOUTHS.desden, 6],
    ],
    armL: [
      [0, ARMS.reposo],
      [at.pick - 6, ARMS.dedo, 8],
    ],
    gestL: [
      [0, "open"],
      [at.pick - 4, "index"],
    ],
    emotion: [
      [0, "curioso"],
      [at.pick, "ok"],
    ],
  });
  const fly = EASE.inOut(ramp(frame, at.pick, at.land));
  const pos = (i: number) => ({ x: 540 + (i - 1) * 255, y: 1150 + Math.abs(i - 1) * 30, r: (i - 1) * 10 });
  const g = gapGeom(lines, fillText);
  const target = { x: g.gapX, y: g.y - g.size * 0.35 };
  return (
    <g>
      <Backdrop id={id} bg={bg} texture="dots" seed={id.length} />
      <SceneCam
        keys={[
          [at.start, 540, 960, 1.0],
          [at.pick - 4, 540, 1000, 1.04],
          [at.land, 540, 900, 1.08],
          [at.end, 540, 930, 1.04],
        ]}
      >
        <GapLine lines={lines} fill={fillText} filled={ramp(frame, at.land - 2, at.land + 6)} frame={frame} />
        <EjemploTag x={540} y={880} opacity={ramp(frame, at.start + 4, at.start + 12)} />
        {cands.map((c, i) => {
          const k = frame < at.start + 2 + i * 3 ? 0 : pop(frame, at.start + 2 + i * 3, { damping: 13 });
          const p = pos(i);
          let x = p.x;
          let y = p.y + 8 * Math.sin(frame / 10 + i);
          let sc = 1.25 * k;
          let r = p.r;
          if (i === 0 && fly > 0) {
            if (fly >= 1) return null;
            x = lerp(p.x, target.x, fly);
            y = lerp(p.y, target.y, fly) - Math.sin(fly * Math.PI) * 200;
            sc = lerp(1.25, 0.5, fly);
            r = lerp(p.r, 0, fly);
          }
          return k > 0.01 ? (
            <g key={c.w} transform={`translate(${x} ${y}) rotate(${r}) scale(${sc})`}>
              <WordCard word={c.w} p={c.p} fill={ramp(frame, at.bars - 2, at.bars + 16, EASE.out)} emoji={c.e} glow={i === 0 ? ramp(frame, at.pick - 8, at.pick) : 0} dim={i > 0 && frame > at.pick ? 0.6 : 0} />
            </g>
          ) : null;
        })}
        {extra}
        <HomeroB id={`${id}-homero`} place={H} pose={pose} />
      </SceneCam>
    </g>
  );
};
