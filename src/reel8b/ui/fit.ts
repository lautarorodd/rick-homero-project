import { SANS } from "../tokens";

// Medición de texto con canvas (lo mismo que hace @remotion/layout-utils): los carteles achican la
// letra hasta entrar en el ancho disponible. Así ningún texto queda cortado por los bordes (en el
// reel 2, "ADIVINA / ChatGPT NO PIENSA" se salía del cuadro cerca de los 4 s).
let ctx: CanvasRenderingContext2D | null = null;
const cache = new Map<string, number>();

export const textWidth = (text: string, size: number, weight = 900, family = SANS) => {
  const key = `${weight}|${size}|${family}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  if (!ctx && typeof document !== "undefined") ctx = document.createElement("canvas").getContext("2d");
  // sin canvas (no debería pasar en el render): estimación conservadora
  const w = ctx ? ((ctx.font = `${weight} ${size}px ${family}`), ctx.measureText(text).width) : text.length * size * 0.62;
  cache.set(key, w);
  return w;
};

/** Tamaño de letra más grande (≤ `size`) con el que todos los renglones entran en `maxW`. */
export const fitSize = (lines: string[], size: number, maxW: number, weight = 900, family = SANS) => {
  const widest = Math.max(...lines.map((l) => textWidth(l, size, weight, family)));
  return widest <= maxW ? size : Math.floor((size * maxW) / widest);
};
