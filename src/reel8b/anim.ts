import { noise2D } from "@remotion/noise";
import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./words";

const CLAMP = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const EASE = {
  inOut: Easing.inOut(Easing.cubic),
  out: Easing.out(Easing.cubic),
  in: Easing.in(Easing.cubic),
  back: Easing.out(Easing.back(1.7)),
  linear: (t: number) => t,
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 0 → 1 entre f0 y f1. */
export const ramp = (frame: number, f0: number, f1: number, ease = EASE.inOut) =>
  interpolate(frame, [f0, f1], [0, 1], { ...CLAMP, easing: ease });

/** Resorte que arranca en el cuadro f (0 antes). Por defecto, poco rebote (overshoot ≤ 6 %). */
export const pop = (
  frame: number,
  f: number,
  config: { damping?: number; mass?: number; stiffness?: number } = {
    damping: 16,
    mass: 0.7,
  },
) => spring({ frame: frame - f, fps: FPS, config });

/** Golpe: sube en `rise` cuadros y baja en `fall`. */
export const pulse = (frame: number, f: number, rise = 3, fall = 14) => {
  if (frame < f) return 0;
  if (frame < f + rise) return EASE.out((frame - f) / rise);
  return 1 - EASE.out(clamp01((frame - f - rise) / fall));
};

/** Ruido suave determinista en [-1, 1]. */
export const wobble = (seed: string, frame: number, speed = 0.04, lane = 0) =>
  noise2D(seed, frame * speed, lane);

/** Tramos [cuadro, valor] con easing entre cada par. */
export const track = (
  frame: number,
  keys: ReadonlyArray<readonly [number, number]>,
  ease = EASE.inOut,
) => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    if (frame <= f1) {
      const [f0, v0] = keys[i - 1];
      if (f1 === f0) return v1;
      return lerp(v0, v1, ease((frame - f0) / (f1 - f0)));
    }
  }
  return keys[keys.length - 1][1];
};

type Numeric = Record<string, number>;

const mix = <T extends Numeric>(a: T, b: T, t: number): T => {
  const out = { ...a };
  for (const k in b) {
    (out as Numeric)[k] = lerp(a[k], b[k], t);
  }
  return out;
};

/**
 * Estados que se suceden: cada uno empieza en su cuadro y tarda `dur` cuadros en llegar
 * (6–10 para expresiones). Si un cambio llega antes de terminar el anterior, parte del
 * valor intermedio, así nunca salta.
 */
export const blend = <T extends Numeric>(
  frame: number,
  states: ReadonlyArray<readonly [number, T, number?]>,
  dur = 8,
  ease = EASE.inOut,
): T => {
  const at = (i: number, f: number): T => {
    if (i === 0) return states[0][1];
    const [start, target, d = dur] = states[i];
    const from = at(i - 1, start);
    return mix(from, target, ease(clamp01((f - start) / d)));
  };
  let i = 0;
  while (i + 1 < states.length && states[i + 1][0] <= frame) i++;
  return at(i, frame);
};

/** Valor discreto vigente en el cuadro (el último que ya empezó). */
export const step = <T>(frame: number, keys: ReadonlyArray<readonly [number, T]>): T => {
  let v = keys[0][1];
  for (const [f, k] of keys) {
    if (frame >= f) v = k;
  }
  return v;
};
