import React from "react";
import { clamp01 } from "../anim";
import { C, HOMERO as K, MONO, SANS } from "../tokens";
import { fitSize } from "../ui/fit";

export const CARD = { w: 210, h: 290, r: 22 };

/**
 * Carta-palabra: una palabra candidata con su barra de probabilidad (0 … 1, se llena con `fill`).
 * Centrada en el origen. `glow` la marca como la elegida; `dim` la apaga.
 */
export const WordCard: React.FC<{
  word: string;
  p?: number; // probabilidad (0 … 1); sin barra si no se pasa
  fill?: number; // 0 … 1: cuánto se llenó la barra
  glow?: number;
  dim?: number;
  back?: boolean; // dada vuelta: muestra "?"
  emoji?: string;
  /** reel 6: color fijo de la barra (las tasas de chantaje van en rojo, no en "verde = bien") */
  barColor?: string;
}> = ({ word, p, fill = 1, glow = 0, dim = 0, back = false, emoji, barColor }) => {
  const { w, h, r } = CARD;
  const shown = (p ?? 0) * clamp01(fill);
  const col = barColor ?? (p === undefined ? C.textoOff : p > 0.5 ? C.ok : p > 0.1 ? C.curioso : C.peligro);
  return (
    <g opacity={1 - 0.55 * dim}>
      {glow > 0.01 ? <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={r + 12} fill={C.iaGlow} opacity={0.45 * glow} /> : null}
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={r} fill="#000000" opacity={0.3} />
      {back ? (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill="#3D2C8D" stroke={K.contorno} strokeWidth={5} />
          <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={r - 8} fill="none" stroke="#FFC53D" strokeWidth={3} strokeDasharray="10 8" />
          <text x={0} y={34} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={120} fill="#FFC53D">
            ?
          </text>
        </g>
      ) : (
        <g>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill="#FFF8E7" stroke={glow > 0.3 ? "#F5A623" : K.contorno} strokeWidth={glow > 0.3 ? 7 : 5} />
          <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={8} rx={4} fill={col} opacity={0.8} />
          {emoji ? (
            <text x={0} y={-30} textAnchor="middle" fontSize={64}>
              {emoji}
            </text>
          ) : null}
          {/* palabra (o renglones partidos con "\n"), con la letra medida para que entre en la carta */}
          {(() => {
            const lines = word.split("\n");
            const fs = fitSize(lines, lines.length > 1 ? 36 : 44, w - 30, 800);
            const y0 = (emoji ? 40 : 14) - ((lines.length - 1) * fs * 1.1) / 2 - (lines.length > 1 ? 20 : 0);
            return lines.map((l, i) => (
              <text key={i} x={0} y={y0 + i * fs * 1.1} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fs} fill="#1C1A24">
                {l}
              </text>
            ));
          })()}
          {p !== undefined ? (
            <g>
              <rect x={-w / 2 + 20} y={h / 2 - 66} width={w - 40} height={18} rx={9} fill="#E7DFCB" />
              <rect x={-w / 2 + 20} y={h / 2 - 66} width={Math.max(4, (w - 40) * Math.min(1, shown * (barColor ? 1 : 1.25)))} height={18} rx={9} fill={col} />
              <text x={0} y={h / 2 - 22} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill="#1C1A24">
                {shown < 0.01 && p > 0 && fill >= 1 ? "0,1 %" : `${Math.round(shown * 100)} %`}
              </text>
            </g>
          ) : null}
        </g>
      )}
    </g>
  );
};

/** Etiqueta chica "EJEMPLO": las barras no son datos reales. */
export const EjemploTag: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <rect x={-74} y={-22} width={148} height={40} rx={20} fill="rgba(20,24,51,0.85)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
    <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={20} letterSpacing={3} fill={C.textoOff}>
      EJEMPLO
    </text>
  </g>
);
