import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, lerp, pulse, ramp, track, wobble } from "./anim";
import { PUNCHES, SHAKES } from "./timeline";

// Puesta en escena del reel 3. Cada escena dibuja su mundo (1080 × 1920) con su propia cámara, y
// el paso de una a otra es una transición en la que se ven las dos a la vez: nunca un cuadro vacío
// ni un velo de color plano (el problema del reel 2 cerca de los 41 s).

export type Transition =
  /** la cámara entra en un objeto (x, y, radio r) y adentro está la escena nueva */
  | { kind: "portal"; x: number; y: number; r: number; dur: number }
  /** la escena vieja se encoge hasta ser un objeto (rectángulo x, y, w × h) de la nueva */
  | { kind: "unportal"; x: number; y: number; w: number; h: number; dur: number }
  /** barrido de cámara horizontal (dir 1: la nueva entra por la derecha) o vertical */
  | { kind: "whip"; dir: 1 | -1; dur: number }
  | { kind: "pan"; dir: 1 | -1; dur: number };

export type SceneDef = { id: string; from: number; C: React.FC; tr?: Transition };

const W = 1080;
const H = 1920;

const about = (x: number, y: number, s: number) => `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`;

const Layer: React.FC<{ id: string; t?: string; clip?: React.ReactNode; blur?: number; opacity?: number; children: React.ReactNode }> = ({
  id,
  t,
  clip,
  blur = 0,
  opacity = 1,
  children,
}) => (
  <g clipPath={clip ? `url(#clip-${id})` : undefined} opacity={opacity}>
    {clip ? <clipPath id={`clip-${id}`}>{clip}</clipPath> : null}
    {blur > 0.3 ? (
      <filter id={`mb-${id}`} x="-10%" y="-10%" width="120%" height="120%">
        <feGaussianBlur stdDeviation={blur} />
      </filter>
    ) : null}
    <g transform={t} filter={blur > 0.3 ? `url(#mb-${id})` : undefined}>
      {children}
    </g>
  </g>
);

/** Dibuja la escena vigente y, durante una transición, también la anterior. */
export const Stage: React.FC<{ scenes: SceneDef[] }> = ({ scenes }) => {
  const frame = useCurrentFrame();
  let i = 0;
  while (i + 1 < scenes.length && scenes[i + 1].from <= frame) i++;
  const cur = scenes[i];
  const tr = cur.tr;
  const Cur = cur.C;
  if (!tr || i === 0 || frame >= cur.from + tr.dur) {
    return (
      <Layer id={cur.id}>
        <Cur />
      </Layer>
    );
  }
  const prev = scenes[i - 1];
  const Prev = prev.C;
  const u = clamp01((frame - cur.from) / tr.dur);
  if (tr.kind === "portal") {
    const e = EASE.in(u);
    const sOut = Math.exp(lerp(0, Math.log(5), e));
    const r = tr.r * sOut + lerp(0, 2300, EASE.in(u) ** 1.6);
    return (
      <>
        <Layer id={prev.id} t={about(tr.x, tr.y, sOut)}>
          <Prev />
        </Layer>
        <Layer id={cur.id} t={about(tr.x, tr.y, lerp(0.45, 1, EASE.out(u)))} clip={<circle cx={tr.x} cy={tr.y} r={r} />}>
          <Cur />
        </Layer>
        <circle cx={tr.x} cy={tr.y} r={r} fill="none" stroke="#FFFFFF" strokeWidth={10 * (1 - u)} opacity={0.6 * (1 - u)} />
      </>
    );
  }
  if (tr.kind === "unportal") {
    const e = EASE.inOut(u);
    const k = lerp(1, tr.w / W, e);
    const tx = lerp(0, tr.x - (W / 2) * k, e);
    const ty = lerp(0, tr.y - (H / 2) * k, e);
    const sIn = Math.exp(lerp(Math.log(W / tr.w), 0, e));
    return (
      <>
        <Layer id={cur.id} t={about(tr.x, tr.y, sIn)}>
          <Cur />
        </Layer>
        <Layer
          id={prev.id}
          t={`translate(${tx} ${ty}) scale(${k})`}
          clip={(() => {
            const hh = Math.min(H * k, lerp(H, tr.h, e));
            return <rect x={tx} y={ty + (H * k - hh) / 2} width={W * k} height={hh} rx={lerp(0, 30, e)} />;
          })()}
          opacity={1 - ramp(frame, cur.from + tr.dur * 0.7, cur.from + tr.dur)}
        >
          <Prev />
        </Layer>
      </>
    );
  }
  // whip / pan: las dos escenas pegadas, con desenfoque de movimiento solo en el tramo central
  // (reel 3b: como mucho ~3 cuadros ilegibles; en el reel 3 eran 7 a los 27 s y 10 a los 34 s)
  const e = EASE.inOut(u);
  const blur = u > 0.3 && u < 0.7 ? 10 * Math.sin(Math.PI * u) : 0;
  const horiz = tr.kind === "whip";
  const len = horiz ? W : H;
  const off = -tr.dir * len * e;
  const tOut = horiz ? `translate(${off} 0)` : `translate(0 ${off})`;
  const tIn = horiz ? `translate(${off + tr.dir * len} 0)` : `translate(0 ${off + tr.dir * len})`;
  // cada escena queda recortada a su cuadro: los fondos (que sobran por los golpes de cámara) no se pisan
  const seam = tr.dir > 0 ? off + len : off;
  const box = (before: boolean) => {
    const a = before ? -4000 : seam;
    const b = before ? seam : 4000;
    return horiz ? <rect x={a} y={-400} width={b - a} height={H + 800} /> : <rect x={-400} y={a} width={W + 800} height={b - a} />;
  };
  return (
    <>
      <Layer id={prev.id} t={tOut} blur={blur} clip={box(tr.dir > 0)}>
        <Prev />
      </Layer>
      <Layer id={cur.id} t={tIn} blur={blur} clip={box(tr.dir < 0)}>
        <Cur />
      </Layer>
    </>
  );
};

export type CamKey = readonly [number, number, number, number]; // cuadro, x, y, escala

/** Cámara de una escena: encuadra el punto (x, y) con escala s; entre llaves, ease in-out. */
export const SceneCam: React.FC<{ keys: ReadonlyArray<CamKey>; children: React.ReactNode }> = ({ keys, children }) => {
  const frame = useCurrentFrame();
  const x = track(frame, keys.map((k) => [k[0], k[1]] as const)) + Math.sin(frame / 47) * 4;
  const y = track(frame, keys.map((k) => [k[0], k[2]] as const)) + Math.cos(frame / 53) * 3;
  const s = Math.exp(track(frame, keys.map((k) => [k[0], Math.log(k[3])] as const)));
  return <g transform={`translate(540 960) scale(${s}) translate(${-x} ${-y})`}>{children}</g>;
};

/** Cámara global: golpes de escala y sacudidas sobre toda la imagen. */
export const GlobalCam: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  let s = 1;
  for (const p of PUNCHES) s *= 1 + p.amount * pulse(frame, p.f - 2, 3, 14);
  let x = 0;
  let y = 0;
  for (const sh of SHAKES) {
    const d = frame - sh.f;
    if (d >= 0 && d < sh.dur) {
      const k = sh.amp * (1 - d / sh.dur);
      x += k * wobble("shake-x", frame, 0.9);
      y += k * wobble("shake-y", frame, 0.9);
    }
  }
  // el golpe escala desde el centro de la escena; un poco de margen para que no se vean los bordes
  return <g transform={`translate(${x} ${y}) ${about(540, 960, s)}`}>{children}</g>;
};
