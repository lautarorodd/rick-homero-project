import { FPS, WORDS } from "./words";

// Anclas del reel 8b. Todo se ata a palabras del guion (docs/reel8b/guion.md): si cambia el audio,
// el video se reacomoda solo.

/** Cuadro en que empieza `word` dentro de la frase `phrase` (nth = ocurrencia en esa frase). */
export const pw = (phrase: number, word: string, nth = 0) => {
  const hits = WORDS.filter((w) => w.phrase === phrase && w.w.toLowerCase() === word.toLowerCase());
  if (!hits[nth]) throw new Error(`pw(): no existe "${word}" #${nth} en la frase ${phrase}`);
  return Math.round(hits[nth].start * FPS);
};

/** Cuadro en que termina `word` dentro de la frase `phrase`. */
export const pwEnd = (phrase: number, word: string, nth = 0) => {
  const hits = WORDS.filter((w) => w.phrase === phrase && w.w.toLowerCase() === word.toLowerCase());
  if (!hits[nth]) throw new Error(`pwEnd(): no existe "${word}" #${nth} en la frase ${phrase}`);
  return Math.round(hits[nth].end * FPS);
};

/** Primer y último cuadro de una frase. */
export const ph = (n: number) => {
  const ws = WORDS.filter((w) => w.phrase === n);
  return { start: Math.round(ws[0].start * FPS), end: Math.round(ws[ws.length - 1].end * FPS) };
};

// Escenas (docs/reel8/beat-sheet.md). Cada una empieza cuando arranca la transición que la trae; todas
// entran por portal, unportal o paneo (un solo viaje continuo, sin cortes duros).
export const SC = {
  A: 0, // hook: Homero asoma del celular de Sofi y se aleja a miles de kilómetros; "Mira": picada al cuarto
  B: pw(3, "son") - 4, // las 23:00: Sofi escribe y aprieta enviar; la pregunta se vuelve luz
  C: pw(6, "luz") - 4, // el viaje: calle, mar, centro de datos
  D: pw(8, "lleno") - 4, // pasillos de servidores
  E: pw(9, "ahí") - 4, // tokens: la corta y la lee entera
  F: pw(11, "después") - 4, // una palabra a la vez
  H: pw(15, "cada") - 4, // el horno
  I: pw(16, "y") - 4, // la gotita
  J: pw(17, "la") - 4, // la vuelta (luz cálida)
  K: pw(18, "y") - 4, // aparece en su pantalla
  L: pw(19, "sofi") - 4, // la cocina
  M: pw(21, "y") - 4, // millones de personas
  N: pw(22, "mándaselo") - 5, // CTA
};

/** 1 → 0 en los cuadros previos a `next`: los textos grandes se van antes de que la cámara los atraviese. */
export const exitFade = (frame: number, next: number, frames = 5) =>
  Math.min(1, Math.max(0, (next - frame) / frames));

/**
 * Golpes de escala de toda la imagen (cámara global). Reel 8: calmo, así que son cambios de escala suaves
 * (0,02–0,04) y sin sacudidas; los "golpes" grandes son la cámara entrando en las cosas (portales).
 */
export const PUNCHES = [
  { f: pw(1, "chatgpt"), amount: 0.03 },
  { f: pw(1, "celular"), amount: 0.04 },
  { f: pw(2, "miles"), amount: 0.03 },
  { f: pw(2, "mira"), amount: 0.05 },
  { f: pw(3, "once"), amount: 0.03 },
  { f: pw(4, "sofi"), amount: 0.02 },
  { f: pw(5, "enviar"), amount: 0.04 },
  { f: pw(6, "sale"), amount: 0.03 },
  { f: pw(7, "cables"), amount: 0.02 },
  { f: pw(7, "mar"), amount: 0.03 },
  { f: pw(8, "edificio"), amount: 0.03 },
  { f: pw(8, "computadoras"), amount: 0.02 },
  { f: pw(9, "corto"), amount: 0.04 },
  { f: pw(10, "leo"), amount: 0.03 },
  { f: pw(11, "elijo"), amount: 0.02 },
  { f: pw(12, "agrego"), amount: 0.03 },
  { f: pw(13, "leer"), amount: 0.02 },
  { f: pw(14, "siguiente"), amount: 0.03 },
  { f: pw(15, "horno"), amount: 0.03 },
  { f: pw(15, "segundo"), amount: 0.03 },
  { f: pw(16, "gotita"), amount: 0.03 },
  { f: pw(17, "vuelta"), amount: 0.03 },
  { f: pw(18, "pantalla"), amount: 0.03 },
  { f: pw(19, "cocina"), amount: 0.02 },
  { f: pw(20, "receta"), amount: 0.03 },
  { f: pw(21, "millones"), amount: 0.04 },
  { f: pw(22, "amigo"), amount: 0.02 },
  { f: pw(22, "segundos"), amount: 0.03 },
];

/** Reel 8: sin sacudidas (tono calmo). */
export const SHAKES: Array<{ f: number; amp: number; dur: number }> = [];
