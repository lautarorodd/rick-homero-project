import React from "react";
import { clamp01, lerp } from "../anim";
import { fitSize, textWidth } from "../ui/fit";
import { C, MONO, SANS } from "../tokens";

// Utilería nueva del reel 5: las fichas (tokens) como en un visor de tokenizador, el cartel de límite,
// la tijera, la mesa con su medidor y las pilas de libros. Todo centrado en el origen salvo que se diga.
const INK = "#1C1A24";

// ---------- fichas ----------
/** Colores pastel de las fichas, con su borde (un tono más oscuro). */
export const PASTEL = [
  ["#FFC9DE", "#E58BB0"],
  ["#C9E4FF", "#7FB2E8"],
  ["#CFF5D6", "#7FCB91"],
  ["#FFF0B3", "#E0C25A"],
  ["#E2D4FF", "#A88BE6"],
  ["#FFD9BF", "#E8A273"],
  ["#BFF1EC", "#6FCBC0"],
  ["#F9D2F5", "#D58BCB"],
] as const;
export const pastel = (i: number) => PASTEL[((i % PASTEL.length) + PASTEL.length) % PASTEL.length];

/** El texto de un token tal como lo devuelve el tokenizador; el espacio inicial se dibuja (no se colapsa). */
export const shown = (t: string) => t.replace(/ /g, " ");

const PAD = 0.42; // margen lateral de la ficha, en fracción del tamaño de letra
/** Ancho de la ficha de un token con letra `size`. */
export const pillW = (t: string, size: number) => textWidth(shown(t), size, 700) + size * PAD * 2;
export const pillH = (size: number) => size * 1.5;

/**
 * Ficha de un token: píldora pastel con borde sutil y sombra suave. `k`: 0 texto suelto (sin ficha) …
 * 1 ficha completa. `glow`: brillo alrededor. `w` fija el ancho (si no, se mide).
 */
export const TokenPill: React.FC<{ text: string; ci: number; size: number; k?: number; glow?: number; w?: number; textColor?: string }> = ({
  text,
  ci,
  size,
  k = 1,
  glow = 0,
  w,
  textColor,
}) => {
  const [fill, edge] = pastel(ci);
  const ww = w ?? pillW(text, size);
  const h = pillH(size);
  const r = h / 2;
  return (
    <g>
      {glow > 0.01 ? <rect x={-ww / 2 - 10} y={-h / 2 - 10} width={ww + 20} height={h + 20} rx={r + 10} fill={fill} opacity={0.45 * glow} /> : null}
      <g opacity={clamp01(k)}>
        <rect x={-ww / 2 + 3} y={-h / 2 + 7} width={ww} height={h} rx={r} fill="#000000" opacity={0.28} />
        <rect x={-ww / 2} y={-h / 2} width={ww} height={h} rx={r} fill={fill} stroke={edge} strokeWidth={Math.max(2, size * 0.07)} />
        <rect x={-ww / 2 + r * 0.6} y={-h / 2 + h * 0.14} width={Math.max(0, ww - r * 1.2)} height={h * 0.16} rx={h * 0.08} fill="#FFFFFF" opacity={0.45} />
      </g>
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} fill={textColor ?? (k > 0.5 ? INK : "#FFFFFF")}>
        {shown(text)}
      </text>
    </g>
  );
};

/**
 * Ficha que gira como un cartel de aeropuerto: `flip` 0 muestra el texto, 1 el número (ID del token).
 * A mitad del giro se ve el canto; el número va en mono sobre el mismo color, un poco más oscuro.
 */
export const FlapPill: React.FC<{ text: string; id: number; ci: number; size: number; flip: number; w?: number; glow?: number }> = ({ text, id, ci, size, flip, w, glow = 0 }) => {
  const ww = Math.max(w ?? pillW(text, size), textWidth(String(id), size * 0.92, 700, MONO) + size * PAD * 2);
  const a = clamp01(flip) * Math.PI;
  const sy = Math.cos(a);
  const back = sy < 0;
  const [fill, edge] = pastel(ci);
  const h = pillH(size);
  return (
    <g transform={`scale(1 ${Math.max(0.04, Math.abs(sy))})`}>
      {back ? (
        <g>
          {glow > 0.01 ? <rect x={-ww / 2 - 10} y={-h / 2 - 10} width={ww + 20} height={h + 20} rx={h / 2 + 10} fill="#FFE27A" opacity={0.5 * glow} /> : null}
          <rect x={-ww / 2 + 3} y={-h / 2 + 7} width={ww} height={h} rx={h / 2} fill="#000000" opacity={0.28} />
          <rect x={-ww / 2} y={-h / 2} width={ww} height={h} rx={h / 2} fill={edge} stroke={fill} strokeWidth={Math.max(2, size * 0.07)} />
          {/* la raya del cartel de aeropuerto */}
          <line x1={-ww / 2 + 6} y1={0} x2={ww / 2 - 6} y2={0} stroke="#000000" strokeOpacity={0.18} strokeWidth={2} />
          <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={size * 0.92} fill="#FFFFFF" stroke={INK} strokeWidth={size * 0.06} paintOrder="stroke">
            {id}
          </text>
        </g>
      ) : (
        <TokenPill text={text} ci={ci} size={size} w={ww} glow={glow} />
      )}
    </g>
  );
};

export type PillPos = { i: number; text: string; x: number; y: number; w: number };
/**
 * Reparte fichas en renglones centrados de hasta `maxW` de ancho (centro del bloque en 0, 0).
 * `gap`: espacio entre fichas. Los renglones se cortan solo entre palabras (una ficha que empieza con
 * espacio abre palabra): "perfeccionista" nunca queda partida en dos renglones. Devuelve el centro de
 * cada ficha.
 */
export const layoutPills = (tokens: readonly string[], size: number, maxW: number, gap: number, lineGap = 1.35): PillPos[] => {
  const words: { i: number; w: number }[][] = [];
  tokens.forEach((t, i) => {
    if (i === 0 || t.startsWith(" ")) words.push([]);
    words[words.length - 1].push({ i, w: pillW(t, size) });
  });
  const rows: { i: number; w: number }[][] = [[]];
  let rw = 0;
  words.forEach((word) => {
    const ww = word.reduce((s, p) => s + p.w, 0) + gap * (word.length - 1);
    if (rw + ww > maxW && rows[rows.length - 1].length) {
      rows.push([]);
      rw = 0;
    }
    rows[rows.length - 1].push(...word);
    rw += ww + gap;
  });
  const lh = pillH(size) * lineGap;
  const out: PillPos[] = [];
  rows.forEach((row, r) => {
    const tw = row.reduce((s, p) => s + p.w, 0) + gap * (row.length - 1);
    let x = -tw / 2;
    row.forEach((p) => {
      out.push({ i: p.i, text: tokens[p.i], x: x + p.w / 2, y: (r - (rows.length - 1) / 2) * lh, w: p.w });
      x += p.w + gap;
    });
  });
  return out.sort((a, b) => a.i - b.i);
};

// ---------- tijera y destello ----------
/** Tijera (punta hacia la derecha). `open`: 0 cerrada … 1 abierta. */
export const Scissors: React.FC<{ open: number }> = ({ open }) => {
  const a = 4 + 22 * clamp01(open);
  const blade = "M 0 -9 L 150 -3 C 160 -1 160 3 150 5 L 0 9 Z";
  return (
    <g>
      <g transform={`rotate(${-a})`}>
        <path d={blade} fill="#E8ECF5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={-62} cy={-6} rx={44} ry={30} fill="none" stroke="#FF5A5F" strokeWidth={16} />
        <ellipse cx={-62} cy={-6} rx={44} ry={30} fill="none" stroke={INK} strokeWidth={4} />
      </g>
      <g transform={`rotate(${a})`}>
        <path d={blade} fill="#D5DBE8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={-62} cy={6} rx={44} ry={30} fill="none" stroke="#FF5A5F" strokeWidth={16} />
        <ellipse cx={-62} cy={6} rx={44} ry={30} fill="none" stroke={INK} strokeWidth={4} />
      </g>
      <circle r={9} fill="#8A8E9C" stroke={INK} strokeWidth={4} />
    </g>
  );
};

/** Destello en el punto de corte (`t`: 0 … 1 de vida). */
export const Spark: React.FC<{ t: number; color?: string; r?: number }> = ({ t, color = "#FFE27A", r = 60 }) => {
  if (t <= 0 || t >= 1) return null;
  const s = lerp(0.4, 1.3, t);
  return (
    <g opacity={1 - t}>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={0} y1={-r * 0.35 * s} x2={0} y2={-r * s} stroke={color} strokeWidth={7} strokeLinecap="round" transform={`rotate(${i * 45 + 20 * t})`} />
      ))}
      <circle r={r * 0.28 * (1 - t)} fill="#FFFFFF" />
    </g>
  );
};

// ---------- el cartel de límite ----------
/**
 * Cartel "Alcanzaste el límite de esta conversación" (interfaz estilizada, no una captura), en
 * coordenadas de la pantalla del celular (276 de ancho). `glow`: brillo sobre "tokens" en la letra chica.
 */
export const LimitCard: React.FC<{ glow?: number }> = ({ glow = 0 }) => (
  <g>
    <rect x={-138} y={-298} width={276} height={596} fill="#000000" opacity={0.55} />
    <rect x={-122} y={-150} width={244} height={300} rx={22} fill="#2A2B32" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />
    <g transform="translate(0 -104)">
      <circle r={24} fill="#FFB020" />
      <text x={0} y={10} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#2A2B32">
        !
      </text>
    </g>
    {["Alcanzaste el límite", "de esta conversación"].map((l, i) => (
      <text key={l} x={0} y={-48 + i * 26} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={20} fill="#FFFFFF">
        {l}
      </text>
    ))}
    {/* letra chica: "tokens" se ilumina */}
    {[
      ["Esta conversación superó la", ""],
      ["cantidad máxima de ", "tokens"],
      ["Empezá un chat nuevo.", ""],
    ].map(([a, b], i) => (
      <text key={i} x={0} y={8 + i * 19} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={13.5} fill="#B9BCC8">
        {a}
        {b ? (
          <tspan fill={glow > 0.3 ? "#FFE27A" : "#B9BCC8"} fontWeight={glow > 0.3 ? 900 : 500}>
            {b}
          </tspan>
        ) : null}
        {b ? "." : ""}
      </text>
    ))}
    {glow > 0.01 ? <ellipse cx={46} cy={22} rx={34 + 10 * glow} ry={14 + 4 * glow} fill="none" stroke="#FFE27A" strokeWidth={3} opacity={glow} /> : null}
    <rect x={-92} y={92} width={184} height={40} rx={20} fill="#FFFFFF" />
    <text x={0} y={118} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={16} fill="#1C1A24">
      Nuevo chat
    </text>
  </g>
);

// ---------- el CV en el monitor ----------
/** El currículum de Sofi (720 × 420, como la diapositiva del monitor). */
export const CVDoc: React.FC<{ pulse?: number }> = ({ pulse = 0 }) => (
  <g>
    <rect x={-360} y={-210} width={720} height={420} fill="#FFFFFF" />
    <rect x={-360} y={-210} width={720} height={70} fill="#3A5BEA" />
    <text x={-320} y={-160} fontFamily={SANS} fontWeight={900} fontSize={44} fill="#FFFFFF">
      CV · Sofía
    </text>
    <circle cx={-270} cy={-40} r={60} fill="#FED90F" stroke={INK} strokeWidth={5} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={-170} y={-80 + i * 46} width={[420, 360, 470, 300, 400][i]} height={18} rx={9} fill={i === 0 ? "#3A5BEA" : "#C9CCD9"} />
    ))}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={-320} y={60 + i * 42} width={[540, 600, 470][i]} height={14} rx={7} fill="#DADCE5" />
    ))}
    {pulse > 0.01 ? <rect x={-356} y={-206} width={712} height={412} fill="none" stroke="#FFE27A" strokeWidth={14} opacity={pulse} /> : null}
  </g>
);

// ---------- la mesa ----------
export const TRAY = { x: 540, y: 1150, w: 820, h: 330 };
/** La mesa de ChatGPT, de costado: una bandeja de vidrio con el medidor de lugar al costado (sin números). */
export const TrayBack: React.FC = () => (
  <g>
    <rect x={TRAY.x - TRAY.w / 2} y={TRAY.y - TRAY.h / 2} width={TRAY.w} height={TRAY.h} rx={26} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.35)" strokeWidth={5} />
    {/* marcas de lugares (tokens contados) */}
    {Array.from({ length: 5 }, (_, r) => (
      <line key={r} x1={TRAY.x - TRAY.w / 2 + 20} y1={TRAY.y + TRAY.h / 2 - 20 - (r + 1) * 52} x2={TRAY.x + TRAY.w / 2 - 20} y2={TRAY.y + TRAY.h / 2 - 20 - (r + 1) * 52} stroke="rgba(255,255,255,0.08)" strokeWidth={2} strokeDasharray="10 10" />
    ))}
  </g>
);
export const TrayFront: React.FC = () => (
  <g>
    <rect x={TRAY.x - TRAY.w / 2 - 30} y={TRAY.y + TRAY.h / 2} width={TRAY.w + 60} height={34} rx={12} fill="#8C5A3C" stroke={INK} strokeWidth={6} />
    <rect x={TRAY.x - TRAY.w / 2 + 40} y={TRAY.y + TRAY.h / 2 + 34} width={30} height={150} fill="#6E4430" stroke={INK} strokeWidth={6} />
    <rect x={TRAY.x + TRAY.w / 2 - 70} y={TRAY.y + TRAY.h / 2 + 34} width={30} height={150} fill="#6E4430" stroke={INK} strokeWidth={6} />
    {/* reflejo del vidrio */}
    <path d={`M ${TRAY.x - TRAY.w / 2 + 30} ${TRAY.y - TRAY.h / 2 + 30} L ${TRAY.x - TRAY.w / 2 + 90} ${TRAY.y - TRAY.h / 2 + 30} L ${TRAY.x - TRAY.w / 2 + 30} ${TRAY.y + 60} Z`} fill="#FFFFFF" opacity={0.07} />
  </g>
);

/** Medidor de lugar (vertical, sin números): `v` 0 … 1; se pone rojo y titila cuando está lleno. */
export const Meter: React.FC<{ v: number; frame: number; h?: number }> = ({ v, frame, h = 470 }) => {
  const col = v < 0.6 ? C.ok : v < 0.9 ? C.curioso : C.peligro;
  const blink = v >= 0.99 && Math.floor(frame / 4) % 2 === 0;
  return (
    <g>
      <rect x={-34} y={-h / 2} width={68} height={h} rx={34} fill="rgba(20,24,51,0.9)" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
      <clipPath id="meter-clip">
        <rect x={-26} y={-h / 2 + 8} width={52} height={h - 16} rx={26} />
      </clipPath>
      <rect x={-26} y={h / 2 - 8 - (h - 16) * clamp01(v)} width={52} height={(h - 16) * clamp01(v)} fill={blink ? "#FFFFFF" : col} clipPath="url(#meter-clip)" />
      <text x={0} y={-h / 2 - 24} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={26} letterSpacing={2} fill="#FFFFFF">
        LUGAR
      </text>
      <line x1={-50} y1={-h / 2 + 8} x2={50} y2={-h / 2 + 8} stroke={C.peligro} strokeWidth={5} strokeDasharray="10 6" />
    </g>
  );
};

// ---------- libros ----------
const BOOK_COLORS = ["#FF5A5F", "#3A5BEA", "#23A55A", "#FFC23D", "#6B3FD8", "#2BB3B1", "#F06CA8", "#F2843A"];
/** Pila de libros (de abajo hacia arriba): `n` libros, `k` 0 … 1 cuántos ya cayeron. */
export const BookPile: React.FC<{ n: number; k: number; seed: number; label: string; w?: number }> = ({ n, k, seed, label, w = 300 }) => {
  const shownN = Math.round(n * clamp01(k));
  return (
    <g>
      {Array.from({ length: shownN }, (_, i) => {
        const bw = w * (0.78 + 0.22 * Math.abs(Math.sin(i * 1.7 + seed)));
        const dx = 18 * Math.sin(i * 2.3 + seed);
        const c = BOOK_COLORS[(i + seed) % BOOK_COLORS.length];
        return (
          <g key={i} transform={`translate(${dx} ${-i * 40}) rotate(${3 * Math.sin(i * 1.1 + seed)})`}>
            <rect x={-bw / 2} y={-38} width={bw} height={36} rx={5} fill={c} stroke={INK} strokeWidth={4} />
            <rect x={-bw / 2 + 12} y={-31} width={bw - 24} height={22} rx={3} fill="#FFFFFF" opacity={0.85} />
            <rect x={-bw / 2 + 24} y={-24} width={(bw - 48) * 0.5} height={8} rx={4} fill={c} opacity={0.6} />
          </g>
        );
      })}
      <g transform="translate(0 46)">
        <rect x={-w / 2 - 10} y={-30} width={w + 20} height={60} rx={30} fill="rgba(20,24,51,0.92)" stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
        <text x={0} y={12} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([label], 34, w)} letterSpacing={2} fill="#FFFFFF">
          {label}
        </text>
      </g>
    </g>
  );
};
