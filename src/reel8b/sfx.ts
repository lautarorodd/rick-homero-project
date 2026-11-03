import { SC, pw, pwEnd } from "./timeline";
import { FPS, WORDS } from "./words";

// Efectos de sonido del reel 8b (suaves y "satisfactorios": clics, whoosh de luz, zumbido de servidores; nada de golpes) (columna SFX del beat sheet), anclados a las mismas palabras que los
// eventos. Los archivos salen de build/make_sfx.py. Debajo de la voz bajan 3 dB (ducking).
export type SfxName =
  | "whoosh" | "swish" | "pop" | "tick" | "click" | "thump" | "sparkle" | "alarm" | "confetti"
  | "rattle" | "page" | "bip" | "gavel" | "poof" | "kaching" | "gulp" | "error" | "marker" | "shutter"
  | "shatter" | "servo" | "ring" | "hum" | "chime" | "glow" | "drip";

const GAIN: Record<SfxName, number> = {
  whoosh: 0.1, swish: 0.08, pop: 0.1, tick: 0.07, click: 0.06, thump: 0.15, sparkle: 0.07, alarm: 0.07,
  confetti: 0.14, rattle: 0.12, page: 0.08, bip: 0.06, gavel: 0.2, poof: 0.12, kaching: 0.09, gulp: 0.12,
  error: 0.07, marker: 0.08, shutter: 0.08, shatter: 0.14, servo: 0.09, ring: 0.08, hum: 0.05, chime: 0.05, glow: 0.07, drip: 0.08,
};

type Hit = { f: number; s: SfxName; v?: number };
const h = (f: number, s: SfxName, v = 1): Hit => ({ f, s, v });
const every = (from: number, to: number, step: number, s: SfxName, v = 1) =>
  Array.from({ length: Math.max(0, Math.floor((to - from) / step)) }, (_, i) => h(from + i * step, s, v));

/** ¿Está hablando Homero en este cuadro? */
export const speaking = (f: number) => WORDS.some((w) => f >= w.start * FPS - 2 && f <= w.end * FPS + 2);

const RAW: Hit[] = [
  // A — hook: asoma del celular, se aleja a miles de kilómetros y "Mira": picada al cuarto
  h(0, "glow", 0.7),
  h(4, "pop", 0.5),
  h(pw(1, "chatgpt"), "sparkle", 0.5),
  h(pw(1, "no") - 2, "whoosh", 0.8),
  h(pw(1, "no") + 6, "glow"),
  h(pw(1, "celular") + 6, "glow", 0.8),
  h(pw(2, "miles") - 4, "chime", 0.6),
  h(pw(2, "kilómetros"), "sparkle", 0.5),
  h(pw(2, "mira") - 2, "swish"),
  h(pw(2, "mira") + 12, "pop", 0.5),
  // B — las 23:00
  h(pw(3, "once") - 2, "chime", 0.6),
  h(pw(4, "sofi") - 4, "pop", 0.4),
  ...every(pw(4, "qué") - 4, pwEnd(4, "vegetariano") - 2, 4, "tick", 0.3),
  h(pw(5, "enviar"), "click", 0.9),
  h(pw(6, "sale") - 2, "glow"),
  h(pw(6, "convertida"), "sparkle", 0.5),
  // C — el viaje
  h(SC.C, "glow", 0.8),
  h(pw(7, "cables") - 4, "glow", 0.6),
  h(pw(7, "fondo") - 2, "glow", 0.7),
  h(pw(7, "mar"), "drip", 0.6),
  h(pw(8, "edificio") - 2, "chime", 0.6),
  // D — pasillos
  h(SC.D, "hum"),
  h(SC.D + 40, "hum", 0.8),
  h(SC.E - 6, "glow", 0.7),
  // E — tokens
  h(pw(9, "corto") - 2, "click", 0.8),
  ...every(pw(9, "corto"), pw(9, "corto") + 13 * 2, 2, "tick", 0.35),
  h(pw(10, "leo") - 2, "sparkle", 0.7),
  // F — una palabra a la vez
  h(SC.F, "glow", 0.6),
  h(pw(11, "elijo") - 4, "pop", 0.4),
  h(pw(12, "agrego") - 2, "click", 0.8),
  h(pw(13, "vuelvo"), "sparkle", 0.5),
  h(pw(14, "siguiente") + 6, "click", 0.8),
  h(pw(14, "siguiente") + 18, "click", 0.6),
  // H — horno
  h(SC.H, "glow", 0.6),
  h(pw(15, "electricidad") - 2, "sparkle", 0.6),
  h(pw(15, "horno") - 2, "click", 0.7),
  h(pw(15, "un", 1) - 2, "chime", 0.6),
  // I — gotita
  h(SC.I, "glow", 0.6),
  h(pw(16, "agua") - 1, "drip"),
  h(pw(16, "computadoras"), "hum", 0.7),
  // J — la vuelta
  h(SC.J, "glow"),
  h(pw(17, "vuelta") - 4, "glow", 0.7),
  // K — aparece en su pantalla
  h(SC.K + 8, "chime", 0.7),
  ...every(pw(18, "aparece") - 4, SC.L - 4, 4, "tick", 0.25),
  // L — cocina
  h(SC.L, "glow", 0.5),
  h(pw(20, "novio") - 8, "pop", 0.4),
  h(pw(20, "receta") - 4, "pop", 0.5),
  // M — millones
  h(SC.M, "glow"),
  h(pw(21, "millones") - 2, "sparkle", 0.6),
  // N — CTA
  h(SC.N, "glow", 0.6),
  h(pw(22, "amigo") - 6, "click", 0.6),
  h(pw(22, "impacienta") - 2, "click", 0.6),
  h(pw(22, "impacienta") + 6, "pop", 0.4),
  h(pw(22, "segundos"), "click", 0.7),
  h(pwEnd(22, "segundos") + 4, "click", 0.7),
  h(pwEnd(22, "segundos") + 6, "glow"),
  h(pwEnd(22, "segundos") + 16, "chime", 0.7),
];

export const SFX: Hit[] = RAW.map((x) => ({ ...x, v: (x.v ?? 1) * GAIN[x.s] * (speaking(x.f) ? 0.7 : 1) }));
