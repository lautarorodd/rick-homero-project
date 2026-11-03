import { clamp01, lerp } from "../anim";
import { ENVELOPE } from "../envelope";
import { WORDS } from "../words";
import type { Mouth } from "./Homero";

// Visemas mínimos (personaje.md): reposo, A, E, O, M/B/P, F/V, más I, U y una consonante genérica.
const V: Record<string, Mouth> = {
  rest: { open: 0, wide: 0.5, round: 0, smile: 0, teeth: 0 },
  a: { open: 0.8, wide: 0.62, round: 0, smile: 0.05, teeth: 0.4 },
  e: { open: 0.42, wide: 0.92, round: 0, smile: 0.15, teeth: 1 },
  i: { open: 0.28, wide: 1, round: 0, smile: 0.3, teeth: 1 },
  o: { open: 0.62, wide: 0.35, round: 1, smile: 0, teeth: 0 },
  u: { open: 0.3, wide: 0.2, round: 1, smile: 0, teeth: 0 },
  mbp: { open: 0, wide: 0.42, round: 0, smile: -0.05, teeth: 0 },
  fv: { open: 0.12, wide: 0.62, round: 0, smile: 0, teeth: 1 },
  c: { open: 0.24, wide: 0.6, round: 0, smile: 0, teeth: 0.6 },
};

// cómo suena la palabra (no cómo se escribe)
const SOUNDS: Record<string, string> = {
  "woo-hoo": "uuujuuu",
  chatgpt: "chatyipiti",
  yo: "sho",
};

const viseme = (ch: string) => {
  if ("aeiou".indexOf(ch) >= 0) return ch;
  if ("mbp".indexOf(ch) >= 0) return "mbp";
  if ("fv".indexOf(ch) >= 0) return "fv";
  return "c";
};

type Key = { t: number; m: Mouth };

const buildKeys = (): Key[] => {
  const keys: Key[] = [];
  const homero = WORDS.filter((w) => w.speaker === "homero");
  homero.forEach((w, idx) => {
    const raw = (SOUNDS[w.w.toLowerCase()] ?? w.w.toLowerCase())
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/([^c])h/g, "$1")
      .replace(/^h/, "")
      .replace(/[^a-z]/g, "");
    const vis = raw.split("").map(viseme);
    const weights = vis.map((v) => ("aeiou".indexOf(v) >= 0 ? 2 : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = 0;
    vis.forEach((v, i) => {
      const t = w.start + ((acc + weights[i] / 2) / total) * (w.end - w.start);
      acc += weights[i];
      keys.push({ t, m: V[v] });
    });
    const next = homero[idx + 1];
    if (!next || next.start - w.end > 0.12) {
      keys.push({ t: w.end + 0.06, m: V.rest });
    }
  });
  return keys;
};

const KEYS = buildKeys();

const mixMouth = (a: Mouth, b: Mouth, t: number): Mouth => ({
  open: lerp(a.open, b.open, t),
  wide: lerp(a.wide, b.wide, t),
  round: lerp(a.round, b.round, t),
  smile: lerp(a.smile, b.smile, t),
  teeth: lerp(a.teeth, b.teeth, t),
});

/** Volumen de la voz en el segundo t (0 … 1), interpolado entre cuadros. */
const loudness = (t: number) => {
  const f = t * 30;
  const i = Math.floor(f);
  if (i < 0 || i >= ENVELOPE.length - 1) return 0;
  return lerp(ENVELOPE[i], ENVELOPE[i + 1], f - i);
};

/** Boca de Homero hablando en el segundo t, y cuánto está hablando (0 … 1). La forma sale de las
 * letras (visemas) y la apertura se escala con el volumen real de la voz. */
export const homeroSpeech = (t: number): { mouth: Mouth; talking: number } => {
  const talking = WORDS.some((w) => w.speaker === "homero" && t >= w.start - 0.05 && t <= w.end + 0.08)
    ? 1
    : 0;
  const withVolume = (m: Mouth): Mouth => ({ ...m, open: m.open * (0.25 + 0.95 * loudness(t + 0.03)) });
  if (!KEYS.length || t <= KEYS[0].t) return { mouth: V.rest, talking };
  for (let i = 1; i < KEYS.length; i++) {
    if (t <= KEYS[i].t) {
      const a = KEYS[i - 1];
      const b = KEYS[i];
      const k = clamp01((t - a.t) / (b.t - a.t));
      return { mouth: withVolume(mixMouth(a.m, b.m, k * k * (3 - 2 * k))), talking };
    }
  }
  return { mouth: V.rest, talking };
};

export { mixMouth };
