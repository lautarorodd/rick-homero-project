import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { clamp01, pop } from "../anim";
import { C, SAFE, SANS } from "../tokens";
import { FPS, WORDS, Word } from "../words";

// Palabras que no pueden cerrar un bloque ("de", "la", "que"…) y buenas para abrir uno.
const FUNCTION = new Set([
  "a", "al", "de", "del", "el", "la", "las", "lo", "los", "un", "una", "y", "o", "que", "con",
  "en", "su", "sus", "le", "mi", "para", "por", "te", "no", "ya", "si", "hay",
]);
const OPENERS = new Set(["antes", "que", "para", "con", "y", "pero", "solo", "porque"]);

export type Block = { words: Word[]; start: number; end: number };

const cost = (ws: Word[]) => {
  const last = ws[ws.length - 1];
  let c = 0;
  // una negrita de varias palabras ("inteligencia artificial") no se parte nunca
  if (last.kc) c += 10;
  if (FUNCTION.has(last.w.toLowerCase()) && !last.brk) c += 3;
  if (ws.length === 1) c += ws[0].key ? 0.4 : 1.2;
  if (ws.length === 3) c += 0.3;
  if (OPENERS.has(ws[0].w.toLowerCase())) c -= 0.4;
  if (last.key) c -= 0.2;
  const keys = ws.map((w, i) => (w.key ? i : -1)).filter((i) => i >= 0);
  if (keys.length > 1 && keys[keys.length - 1] - keys[0] > keys.length - 1) c += 0.5;
  return c;
};

/** Parte una frase en bloques de 1–3 palabras por unidad de sentido (programación dinámica). */
const segment = (ws: Word[]): Word[][] => {
  const best: number[] = [0];
  const cut: number[] = [0];
  for (let i = 1; i <= ws.length; i++) {
    best[i] = Infinity;
    for (let k = 1; k <= 3 && k <= i; k++) {
      const block = ws.slice(i - k, i);
      // la puntuación del guion cierra bloque: no puede quedar en el medio
      if (block.slice(0, -1).some((w) => w.brk)) continue;
      const c = best[i - k] + cost(block);
      if (c < best[i]) {
        best[i] = c;
        cut[i] = i - k;
      }
    }
  }
  const out: Word[][] = [];
  for (let i = ws.length; i > 0; i = cut[i]) out.unshift(ws.slice(cut[i], i));
  return out;
};

export const BLOCKS: Block[] = (() => {
  const phrases: Word[][] = [];
  WORDS.forEach((w) => {
    const cur = phrases[phrases.length - 1];
    if (cur && cur[0].phrase === w.phrase) cur.push(w);
    else phrases.push([w]);
  });
  const blocks: Block[] = [];
  phrases.forEach((p) => segment(p).forEach((ws) => blocks.push({ words: ws, start: ws[0].start, end: 0 })));
  blocks.forEach((b, i) => {
    const next = blocks[i + 1];
    const last = b.words[b.words.length - 1];
    const linger = last.end + 0.35;
    b.end = next ? (next.words[0].phrase === last.phrase ? next.start : Math.min(linger, next.start - 0.03)) : linger + 0.4;
  });
  return blocks;
})();

const SelectionBox: React.FC<{ enter: number }> = ({ enter }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, enter, { damping: 18, mass: 0.5, stiffness: 260 });
  const handle = (pos: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 12,
        height: 12,
        background: "#FFFFFF",
        border: `2px solid ${C.seleccion}`,
        ...pos,
      }}
    />
  );
  return (
    <div
      style={{
        position: "absolute",
        inset: "-4px -12px",
        border: `2px solid ${C.seleccion}`,
        scale: String(0.9 + 0.1 * s),
        opacity: clamp01(s * 1.5),
      }}
    >
      {handle({ left: -7, top: -7 })}
      {handle({ right: -7, top: -7 })}
      {handle({ left: -7, bottom: -7 })}
      {handle({ right: -7, bottom: -7 })}
    </div>
  );
};

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const lead = 2 / FPS;
  const block = BLOCKS.find((b) => t >= b.start - lead && t < b.end);
  if (!block) return null;
  const enter = Math.round((block.start - lead) * FPS);
  const k = clamp01((frame - enter) / 3);
  // unidades: una negrita de varias palabras va junta, en un solo recuadro
  const units: Word[][] = [];
  block.words.forEach((w, i) => {
    const prev = block.words[i - 1];
    if (prev && prev.kc) units[units.length - 1].push(w);
    else units.push([w]);
  });
  const isActive = (w: Word) => {
    const i = block.words.indexOf(w);
    const next = block.words[i + 1];
    return t >= w.start - lead && (!next || t < next.start - lead);
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* sombra suave detrás del texto: el subtítulo siempre se lee, aunque pase sobre algo claro */}
      <div
        style={{
          position: "absolute",
          top: SAFE.subTop - 50,
          height: SAFE.subBottom - SAFE.subTop + 100,
          left: 0,
          right: 0,
          // reel 3: fondos de color → banda más firme para que el blanco se lea siempre
          background: "radial-gradient(ellipse 62% 50% at 50% 50%, rgba(8,10,20,0.74) 0%, rgba(8,10,20,0.55) 55%, rgba(8,10,20,0) 100%)",
          opacity: k,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: SAFE.subTop,
          height: SAFE.subBottom - SAFE.subTop,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          translate: `0 ${(1 - k) * 10}px`,
          opacity: k,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 62,
            lineHeight: 1.15,
            textShadow: "0 3px 0 rgba(0,0,0,0.55), 0 4px 18px rgba(0,0,0,0.7)",
          }}
        >
          {units.map((u) => {
            const said = t >= u[0].start - lead;
            return (
              <span
                key={`${u[0].start}`}
                style={{ position: "relative", display: "inline-block", margin: "0 12px" }}
              >
                {u.map((w, i) => (
                  <span key={`${w.start}`} style={{ color: isActive(w) ? C.texto : C.textoOff }}>
                    {i > 0 ? " " : null}
                    {w.emoji ? <span style={{ marginRight: 12 }}>{w.emoji}</span> : null}
                    {w.w}
                  </span>
                ))}
                {u[0].key && said ? <SelectionBox enter={Math.round((u[0].start - lead) * FPS)} /> : null}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
