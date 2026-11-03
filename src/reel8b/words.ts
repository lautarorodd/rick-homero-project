// Generado por build/make_audio_reel8b.py — no editar a mano.
// Tiempos en segundos sobre public/audio/reel8b/voz.wav (alineación forzada MMS_FA con el guion).

export const FPS = 30;
export const AUDIO_SRC = 'audio/reel8b/voz.wav';
export const AUDIO_DURATION = 61.425;

export type Word = {
  w: string;
  start: number;
  end: number;
  phrase: number;
  key?: true;
  /** La palabra clave sigue en la próxima (negrita de varias palabras: van en un mismo recuadro). */
  kc?: true;
  /** Cierra una unidad de sentido (había puntuación en el guion). */
  brk?: true;
  speaker?: 'homero';
  emoji?: string;
};

export const WORDS: Word[] = [
  {w: "Yo", start: 0.010, end: 0.220, phrase: 1, brk: true, speaker: 'homero'},
  {w: "ChatGPT", start: 0.630, end: 1.280, phrase: 1, key: true, brk: true, speaker: 'homero'},
  {w: "no", start: 1.330, end: 1.420, phrase: 1, speaker: 'homero'},
  {w: "estoy", start: 1.440, end: 1.681, phrase: 1, speaker: 'homero'},
  {w: "en", start: 1.681, end: 1.781, phrase: 1, speaker: 'homero'},
  {w: "tu", start: 1.820, end: 1.881, phrase: 1, speaker: 'homero'},
  {w: "celular", start: 1.930, end: 2.341, phrase: 1, key: true, brk: true, speaker: 'homero'},
  {w: "Estoy", start: 2.490, end: 2.761, phrase: 2, speaker: 'homero'},
  {w: "a", start: 2.790, end: 2.821, phrase: 2, speaker: 'homero'},
  {w: "miles", start: 2.840, end: 3.161, phrase: 2, key: true, kc: true, speaker: 'homero'},
  {w: "de", start: 3.190, end: 3.261, phrase: 2, key: true, kc: true, speaker: 'homero'},
  {w: "kilómetros", start: 3.300, end: 4.001, phrase: 2, key: true, brk: true, speaker: 'homero'},
  {w: "Mira", start: 4.001, end: 4.321, phrase: 2, key: true, brk: true, speaker: 'homero'},
  {w: "Son", start: 4.690, end: 4.841, phrase: 3, speaker: 'homero'},
  {w: "las", start: 4.850, end: 5.021, phrase: 3, speaker: 'homero'},
  {w: "once", start: 5.021, end: 5.302, phrase: 3, key: true, kc: true, speaker: 'homero'},
  {w: "de", start: 5.330, end: 5.402, phrase: 3, key: true, kc: true, speaker: 'homero'},
  {w: "la", start: 5.430, end: 5.522, phrase: 3, key: true, kc: true, speaker: 'homero'},
  {w: "noche", start: 5.550, end: 5.942, phrase: 3, key: true, brk: true, speaker: 'homero'},
  {w: "Sofi", start: 6.130, end: 6.402, phrase: 4, key: true, speaker: 'homero'},
  {w: "me", start: 6.420, end: 6.522, phrase: 4, speaker: 'homero'},
  {w: "escribe", start: 6.560, end: 6.962, phrase: 4, brk: true, speaker: 'homero'},
  {w: "Qué", start: 7.060, end: 7.142, phrase: 4, speaker: 'homero'},
  {w: "le", start: 7.170, end: 7.282, phrase: 4, speaker: 'homero'},
  {w: "cocino", start: 7.330, end: 7.702, phrase: 4, key: true, speaker: 'homero'},
  {w: "a", start: 7.740, end: 7.762, phrase: 4, speaker: 'homero'},
  {w: "mi", start: 7.790, end: 7.882, phrase: 4, speaker: 'homero'},
  {w: "novio", start: 7.940, end: 8.302, phrase: 4, brk: true, speaker: 'homero'},
  {w: "que", start: 8.360, end: 8.443, phrase: 4, speaker: 'homero'},
  {w: "es", start: 8.443, end: 8.583, phrase: 4, speaker: 'homero'},
  {w: "vegetariano", start: 8.590, end: 9.503, phrase: 4, key: true, brk: true, speaker: 'homero', emoji: '🥦'},
  {w: "Y", start: 9.730, end: 9.763, phrase: 5, speaker: 'homero'},
  {w: "aprieta", start: 9.763, end: 10.263, phrase: 5, speaker: 'homero'},
  {w: "enviar", start: 10.263, end: 10.983, phrase: 5, key: true, brk: true, speaker: 'homero'},
  {w: "Su", start: 11.290, end: 11.423, phrase: 6, speaker: 'homero'},
  {w: "pregunta", start: 11.520, end: 12.104, phrase: 6, speaker: 'homero'},
  {w: "sale", start: 12.190, end: 12.424, phrase: 6, speaker: 'homero'},
  {w: "del", start: 12.460, end: 12.624, phrase: 6, speaker: 'homero'},
  {w: "celular", start: 12.660, end: 13.144, phrase: 6, speaker: 'homero'},
  {w: "convertida", start: 13.210, end: 13.904, phrase: 6, speaker: 'homero'},
  {w: "en", start: 13.950, end: 14.044, phrase: 6, speaker: 'homero'},
  {w: "luz", start: 14.080, end: 14.524, phrase: 6, key: true, brk: true, speaker: 'homero'},
  {w: "Viaja", start: 14.734, end: 15.110, phrase: 7, speaker: 'homero'},
  {w: "por", start: 15.204, end: 15.370, phrase: 7, speaker: 'homero'},
  {w: "cables", start: 15.470, end: 15.970, phrase: 7, key: true, brk: true, speaker: 'homero'},
  {w: "a", start: 16.144, end: 16.250, phrase: 7, speaker: 'homero'},
  {w: "veces", start: 16.294, end: 16.650, phrase: 7, speaker: 'homero'},
  {w: "por", start: 16.710, end: 16.830, phrase: 7, speaker: 'homero'},
  {w: "el", start: 16.830, end: 16.950, phrase: 7, speaker: 'homero'},
  {w: "fondo", start: 16.984, end: 17.310, phrase: 7, key: true, kc: true, speaker: 'homero'},
  {w: "del", start: 17.364, end: 17.530, phrase: 7, key: true, kc: true, speaker: 'homero'},
  {w: "mar", start: 17.530, end: 17.970, phrase: 7, key: true, brk: true, speaker: 'homero'},
  {w: "Hasta", start: 18.184, end: 18.481, phrase: 8, speaker: 'homero'},
  {w: "un", start: 18.544, end: 18.641, phrase: 8, speaker: 'homero'},
  {w: "edificio", start: 18.641, end: 19.261, phrase: 8, key: true, kc: true, speaker: 'homero'},
  {w: "enorme", start: 19.304, end: 19.821, phrase: 8, key: true, brk: true, speaker: 'homero'},
  {w: "lleno", start: 20.084, end: 20.381, phrase: 8, speaker: 'homero'},
  {w: "de", start: 20.424, end: 20.501, phrase: 8, speaker: 'homero'},
  {w: "computadoras", start: 20.564, end: 21.402, phrase: 8, key: true, speaker: 'homero'},
  {w: "que", start: 21.414, end: 21.522, phrase: 8, speaker: 'homero'},
  {w: "nunca", start: 21.534, end: 21.902, phrase: 8, speaker: 'homero'},
  {w: "se", start: 21.974, end: 22.062, phrase: 8, speaker: 'homero'},
  {w: "apagan", start: 22.114, end: 22.662, phrase: 8, key: true, brk: true, speaker: 'homero'},
  {w: "Ahí", start: 23.034, end: 23.452, phrase: 9, brk: true, speaker: 'homero'},
  {w: "primero", start: 23.852, end: 24.452, phrase: 9, brk: true, speaker: 'homero'},
  {w: "corto", start: 24.554, end: 24.873, phrase: 9, key: true, speaker: 'homero'},
  {w: "su", start: 24.924, end: 25.033, phrase: 9, speaker: 'homero'},
  {w: "pregunta", start: 25.084, end: 25.573, phrase: 9, speaker: 'homero'},
  {w: "en", start: 25.604, end: 25.653, phrase: 9, speaker: 'homero'},
  {w: "pedacitos", start: 25.704, end: 26.613, phrase: 9, key: true, brk: true, speaker: 'homero'},
  {w: "Y", start: 26.794, end: 26.873, phrase: 10, speaker: 'homero'},
  {w: "la", start: 26.934, end: 27.033, phrase: 10, speaker: 'homero'},
  {w: "leo", start: 27.124, end: 27.353, phrase: 10, key: true, kc: true, speaker: 'homero'},
  {w: "entera", start: 27.384, end: 28.013, phrase: 10, key: true, brk: true, speaker: 'homero'},
  {w: "de", start: 28.084, end: 28.194, phrase: 10, speaker: 'homero'},
  {w: "una", start: 28.284, end: 28.494, phrase: 10, speaker: 'homero'},
  {w: "vez", start: 28.554, end: 28.854, phrase: 10, brk: true, speaker: 'homero'},
  {w: "Después", start: 29.004, end: 29.534, phrase: 11, speaker: 'homero'},
  {w: "elijo", start: 29.544, end: 29.894, phrase: 11, key: true, speaker: 'homero'},
  {w: "una", start: 29.954, end: 30.114, phrase: 11, speaker: 'homero'},
  {w: "palabra", start: 30.204, end: 30.754, phrase: 11, brk: true, speaker: 'homero'},
  {w: "La", start: 30.944, end: 31.034, phrase: 12, speaker: 'homero'},
  {w: "agrego", start: 31.054, end: 31.575, phrase: 12, key: true, brk: true, speaker: 'homero'},
  {w: "Vuelvo", start: 31.794, end: 32.145, phrase: 13, speaker: 'homero'},
  {w: "a", start: 32.184, end: 32.205, phrase: 13, speaker: 'homero'},
  {w: "leer", start: 32.205, end: 32.505, phrase: 13, key: true, kc: true, speaker: 'homero'},
  {w: "todo", start: 32.614, end: 32.905, phrase: 13, key: true, brk: true, speaker: 'homero'},
  {w: "Y", start: 33.104, end: 33.165, phrase: 14, speaker: 'homero'},
  {w: "elijo", start: 33.165, end: 33.585, phrase: 14, speaker: 'homero'},
  {w: "la", start: 33.624, end: 33.745, phrase: 14, speaker: 'homero'},
  {w: "siguiente", start: 33.814, end: 34.565, phrase: 14, key: true, brk: true, speaker: 'homero'},
  {w: "Cada", start: 34.923, end: 35.195, phrase: 15, speaker: 'homero'},
  {w: "pregunta", start: 35.243, end: 35.776, phrase: 15, speaker: 'homero'},
  {w: "gasta", start: 35.823, end: 36.116, phrase: 15, speaker: 'homero'},
  {w: "la", start: 36.133, end: 36.216, phrase: 15, speaker: 'homero'},
  {w: "electricidad", start: 36.243, end: 36.976, phrase: 15, key: true, speaker: 'homero'},
  {w: "de", start: 36.993, end: 37.076, phrase: 15, speaker: 'homero'},
  {w: "un", start: 37.083, end: 37.236, phrase: 15, speaker: 'homero'},
  {w: "horno", start: 37.243, end: 37.496, phrase: 15, key: true, speaker: 'homero'},
  {w: "prendido", start: 37.573, end: 38.016, phrase: 15, speaker: 'homero'},
  {w: "un", start: 38.023, end: 38.116, phrase: 15, key: true, kc: true, speaker: 'homero'},
  {w: "segundo", start: 38.163, end: 38.837, phrase: 15, key: true, brk: true, speaker: 'homero'},
  {w: "Y", start: 39.027, end: 39.120, phrase: 16, speaker: 'homero'},
  {w: "una", start: 39.120, end: 39.320, phrase: 16, speaker: 'homero'},
  {w: "gotita", start: 39.357, end: 39.880, phrase: 16, key: true, kc: true, speaker: 'homero'},
  {w: "de", start: 39.937, end: 40.040, phrase: 16, key: true, kc: true, speaker: 'homero'},
  {w: "agua", start: 40.047, end: 40.481, phrase: 16, key: true, brk: true, speaker: 'homero', emoji: '💧'},
  {w: "para", start: 40.527, end: 40.701, phrase: 16, speaker: 'homero'},
  {w: "que", start: 40.757, end: 40.841, phrase: 16, speaker: 'homero'},
  {w: "las", start: 40.857, end: 41.001, phrase: 16, speaker: 'homero'},
  {w: "computadoras", start: 41.027, end: 41.801, phrase: 16, speaker: 'homero'},
  {w: "no", start: 41.801, end: 41.921, phrase: 16, speaker: 'homero'},
  {w: "se", start: 41.987, end: 42.081, phrase: 16, speaker: 'homero'},
  {w: "calienten", start: 42.147, end: 42.941, phrase: 16, key: true, brk: true, speaker: 'homero'},
  {w: "La", start: 43.271, end: 43.396, phrase: 17, speaker: 'homero'},
  {w: "respuesta", start: 43.451, end: 44.056, phrase: 17, speaker: 'homero'},
  {w: "hace", start: 44.091, end: 44.277, phrase: 17, speaker: 'homero'},
  {w: "el", start: 44.331, end: 44.377, phrase: 17, speaker: 'homero'},
  {w: "viaje", start: 44.401, end: 44.737, phrase: 17, key: true, kc: true, speaker: 'homero'},
  {w: "de", start: 44.771, end: 44.897, phrase: 17, key: true, kc: true, speaker: 'homero'},
  {w: "vuelta", start: 44.961, end: 45.477, phrase: 17, key: true, brk: true, speaker: 'homero'},
  {w: "Y", start: 45.777, end: 45.853, phrase: 18, speaker: 'homero'},
  {w: "aparece", start: 45.907, end: 46.373, phrase: 18, speaker: 'homero'},
  {w: "en", start: 46.407, end: 46.453, phrase: 18, speaker: 'homero'},
  {w: "su", start: 46.487, end: 46.593, phrase: 18, key: true, kc: true, speaker: 'homero'},
  {w: "pantalla", start: 46.647, end: 47.433, phrase: 18, key: true, brk: true, speaker: 'homero'},
  {w: "Sofi", start: 47.777, end: 48.203, phrase: 19, key: true, kc: true, speaker: 'homero'},
  {w: "cocina", start: 48.317, end: 49.083, phrase: 19, key: true, brk: true, speaker: 'homero', emoji: '🍳'},
  {w: "Su", start: 49.267, end: 49.384, phrase: 20, speaker: 'homero'},
  {w: "novio", start: 49.387, end: 49.724, phrase: 20, key: true, speaker: 'homero'},
  {w: "le", start: 49.737, end: 49.844, phrase: 20, speaker: 'homero'},
  {w: "pide", start: 49.917, end: 50.144, phrase: 20, speaker: 'homero'},
  {w: "la", start: 50.147, end: 50.264, phrase: 20, speaker: 'homero'},
  {w: "receta", start: 50.297, end: 51.024, phrase: 20, key: true, brk: true, speaker: 'homero'},
  {w: "Y", start: 51.244, end: 51.342, phrase: 21, speaker: 'homero'},
  {w: "yo", start: 51.474, end: 51.642, phrase: 21, brk: true, speaker: 'homero'},
  {w: "en", start: 51.794, end: 52.062, phrase: 21, speaker: 'homero'},
  {w: "ese", start: 52.062, end: 52.362, phrase: 21, speaker: 'homero'},
  {w: "mismo", start: 52.364, end: 52.722, phrase: 21, key: true, kc: true, speaker: 'homero'},
  {w: "segundo", start: 52.784, end: 53.222, phrase: 21, key: true, brk: true, speaker: 'homero'},
  {w: "estoy", start: 53.254, end: 53.522, phrase: 21, speaker: 'homero'},
  {w: "haciendo", start: 53.522, end: 54.043, phrase: 21, speaker: 'homero'},
  {w: "esto", start: 54.074, end: 54.423, phrase: 21, speaker: 'homero'},
  {w: "con", start: 54.464, end: 54.623, phrase: 21, speaker: 'homero'},
  {w: "millones", start: 54.644, end: 55.123, phrase: 21, key: true, kc: true, speaker: 'homero'},
  {w: "de", start: 55.123, end: 55.203, phrase: 21, key: true, kc: true, speaker: 'homero'},
  {w: "personas", start: 55.234, end: 55.823, phrase: 21, key: true, speaker: 'homero'},
  {w: "más", start: 55.823, end: 56.363, phrase: 21, brk: true, speaker: 'homero'},
  {w: "Mándaselo", start: 57.184, end: 57.864, phrase: 22, key: true, speaker: 'homero'},
  {w: "a", start: 57.864, end: 57.944, phrase: 22, speaker: 'homero'},
  {w: "ese", start: 57.994, end: 58.164, phrase: 22, speaker: 'homero'},
  {w: "amigo", start: 58.214, end: 58.524, phrase: 22, speaker: 'homero'},
  {w: "que", start: 58.574, end: 58.664, phrase: 22, speaker: 'homero'},
  {w: "se", start: 58.694, end: 58.784, phrase: 22, speaker: 'homero'},
  {w: "impacienta", start: 58.814, end: 59.444, phrase: 22, key: true, speaker: 'homero'},
  {w: "si", start: 59.484, end: 59.604, phrase: 22, speaker: 'homero'},
  {w: "tardo", start: 59.694, end: 60.004, phrase: 22, speaker: 'homero'},
  {w: "dos", start: 60.054, end: 60.304, phrase: 22, key: true, kc: true, speaker: 'homero'},
  {w: "segundos", start: 60.324, end: 61.085, phrase: 22, key: true, brk: true, speaker: 'homero'},
];

/** Cuadro en que empieza la palabra (nth = ocurrencia, desde 0). */
export const at = (word: string, nth = 0) => {
  const hits = WORDS.filter((x) => x.w.toLowerCase() === word.toLowerCase());
  if (!hits[nth]) {
    throw new Error(`at(): no existe "${word}" #${nth}`);
  }
  return Math.round(hits[nth].start * FPS);
};

/** Primer y último cuadro de una frase del guion. */
export const phraseRange = (n: number) => {
  const ws = WORDS.filter((x) => x.phrase === n);
  return [Math.round(ws[0].start * FPS), Math.round(ws[ws.length - 1].end * FPS)] as const;
};

/** El evento llega un poco antes que la palabra. */
export const lead = (f: number, frames = 3) => f - frames;
