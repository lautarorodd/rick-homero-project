import React from "react";
import { clamp01, lerp } from "../anim";
import { fitSize, textWidth } from "../ui/fit";
import { C, HOMERO as K, MONO, SANS } from "../tokens";
import { CHAT, wrap } from "./Chat";
import { ChatGPTLogo } from "./Brand";

// Utilería nueva del reel 4, en el mismo estilo que la del reel 3 (colores planos, contorno negro).
// Todo centrado en el origen salvo que se diga otra cosa.
const ST = { stroke: K.contorno, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const INK = "#1C1A24";

// ---------- las dos presentaciones ----------
/** La diapositiva que sale con poco contexto: gris, genérica, igual a la de todo el mundo (w × h). */
export const GenericSlide: React.FC<{ w?: number; h?: number; stamp?: number; stampText?: string }> = ({ w = 680, h = 400, stamp = 0, stampText = "GENÉRICA" }) => (
  <g>
    <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={14} fill="#000000" opacity={0.25} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#E6E7EC" {...ST} />
    <text x={-w / 2 + 36} y={-h / 2 + 60} fontFamily={SANS} fontWeight={800} fontSize={w * 0.058} fill="#8A8E9C">
      PRESENTACIÓN DE VENTAS
    </text>
    <rect x={-w / 2 + 36} y={-h / 2 + 78} width={w * 0.2} height={8} rx={4} fill="#B8BBC6" />
    {/* clip-art: dos manos que se dan la mano */}
    <g transform={`translate(${-w * 0.27} ${h * 0.08}) scale(${w / 680})`} fill="#C3C6D0" stroke="#9A9EAC" strokeWidth={5}>
      <rect x={-120} y={-40} width={110} height={60} rx={26} />
      <rect x={10} y={-40} width={110} height={60} rx={26} />
      <ellipse cx={0} cy={-10} rx={50} ry={34} />
      <rect x={-170} y={-50} width={60} height={80} rx={10} fill="#AEB2BE" />
      <rect x={110} y={-50} width={60} height={80} rx={10} fill="#AEB2BE" />
    </g>
    {/* viñetas grises */}
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(${w * 0.04} ${-h * 0.12 + i * h * 0.14})`}>
        <circle r={8} fill="#A3A7B4" />
        <rect x={20} y={-7} width={w * (0.36 - 0.06 * i)} height={14} rx={7} fill="#C3C6D0" />
      </g>
    ))}
    {/* gráfico sin datos */}
    {[0.4, 0.55, 0.5, 0.65].map((v, i) => (
      <rect key={i} x={w * 0.06 + i * w * 0.07} y={h / 2 - 30 - h * 0.32 * v} width={w * 0.05} height={h * 0.32 * v} rx={4} fill="#B8BBC6" />
    ))}
    {stamp > 0.01 ? (
      <g transform={`translate(${w * 0.2} ${-h * 0.12}) rotate(-12) scale(${lerp(1.8, 1, clamp01(stamp))})`} opacity={clamp01(stamp * 2)}>
        <rect x={-w * 0.27} y={-46} width={w * 0.54} height={92} rx={16} fill="rgba(255,255,255,0.85)" stroke={C.peligro} strokeWidth={9} />
        <text x={0} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([stampText], 64, w * 0.5)} fill={C.peligro} letterSpacing={2}>
          {stampText}
        </text>
      </g>
    ) : null}
  </g>
);

const DECK = ["#FF7A45", "#2BB3B1", "#6B3FD8", "#F06CA8", "#23A55A"];

/** Casita (ícono de la inmobiliaria). */
const House: React.FC<{ c: string; s?: number }> = ({ c, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -40 0 L 0 -38 L 40 0 L 40 40 L -40 40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -50 4 L 0 -46 L 50 4" fill="none" stroke={c} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    <rect x={-10} y={14} width={20} height={26} fill={c} />
  </g>
);

/** Una diapositiva de la presentación de Sofi (página 0 … 4), w × h. */
export const SofiSlide: React.FC<{ page: number; w?: number; h?: number; ejemplo?: boolean }> = ({ page, w = 680, h = 400, ejemplo = true }) => {
  const c = DECK[page % 5];
  const u = w / 680;
  return (
    <g>
      <rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} rx={14} fill="#000000" opacity={0.22} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#FFFFFF" {...ST} />
      <rect x={-w / 2 + 3} y={-h / 2 + 3} width={w - 6} height={h * 0.26} rx={11} fill={c} />
      <g transform={`scale(${u})`}>
        {page === 0 ? (
          <g>
            <text x={-300} y={-110} fontFamily={SANS} fontWeight={900} fontSize={54} fill="#FFFFFF">
              Ventas 2026
            </text>
            <text x={-300} y={-10} fontFamily={SANS} fontWeight={800} fontSize={36} fill={INK}>
              Inmobiliaria · Córdoba
            </text>
            <text x={-300} y={44} fontFamily={SANS} fontWeight={600} fontSize={30} fill="#5A5F73">
              Para: mi jefe
            </text>
            <g transform="translate(-200 120)">
              {[0, 1, 2].map((i) => (
                <g key={i} transform={`translate(${i * 110} 0)`}>
                  <House c={DECK[(i + 1) % 5]} s={0.9} />
                </g>
              ))}
            </g>
            <g transform="translate(210 110)">
              <circle r={70} fill={DECK[1]} stroke={INK} strokeWidth={5} />
              <path d="M 0 -40 C 26 -40 34 -14 0 32 C -34 -14 -26 -40 0 -40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} />
              <circle cy={-16} r={9} fill={DECK[0]} />
            </g>
          </g>
        ) : page === 1 ? (
          <g>
            <text x={-300} y={-110} fontFamily={SANS} fontWeight={900} fontSize={48} fill="#FFFFFF">
              Casas vendidas
            </text>
            {[0.35, 0.5, 0.45, 0.7, 0.9].map((v, i) => (
              <g key={i}>
                <rect x={-280 + i * 100} y={160 - 230 * v} width={70} height={230 * v} rx={10} fill={DECK[i]} stroke={INK} strokeWidth={4} />
              </g>
            ))}
            <line x1={-300} y1={162} x2={240} y2={162} stroke={INK} strokeWidth={5} />
          </g>
        ) : page === 2 ? (
          <g>
            <text x={-300} y={-110} fontFamily={SANS} fontWeight={900} fontSize={48} fill="#FFFFFF">
              Mejor mes
            </text>
            <text x={0} y={70} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={130} fill={c}>
              Marzo
            </text>
            <text x={0} y={140} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={34} fill="#5A5F73">
              ⭐ récord del año
            </text>
          </g>
        ) : page === 3 ? (
          <g>
            <text x={-300} y={-110} fontFamily={SANS} fontWeight={900} fontSize={48} fill="#FFFFFF">
              Barrios
            </text>
            {[
              [-180, 40, "Centro"],
              [0, 100, "Nueva Cba."],
              [180, 30, "Cerro"],
            ].map(([x, y, t], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <path d="M 0 -50 C 32 -50 42 -18 0 40 C -42 -18 -32 -50 0 -50 Z" fill={DECK[(i + 2) % 5]} stroke={INK} strokeWidth={5} />
                <circle cy={-20} r={12} fill="#FFFFFF" />
                <text x={0} y={84} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={INK}>
                  {t}
                </text>
              </g>
            ))}
          </g>
        ) : (
          <g>
            <text x={-300} y={-110} fontFamily={SANS} fontWeight={900} fontSize={48} fill="#FFFFFF">
              Próximos pasos
            </text>
            {["Más visitas", "Fotos nuevas", "Redes"].map((t, i) => (
              <g key={t} transform={`translate(-260 ${-10 + i * 70})`}>
                <circle r={22} fill={C.ok} stroke={INK} strokeWidth={4} />
                <path d="M -10 0 L -3 8 L 11 -9" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <text x={44} y={12} fontFamily={SANS} fontWeight={800} fontSize={38} fill={INK}>
                  {t}
                </text>
              </g>
            ))}
          </g>
        )}
        <text x={300} y={182} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={26} fill="#8A8E9C">
          {page + 1}/5
        </text>
        {ejemplo ? (
          <text x={-300} y={182} fontFamily={SANS} fontWeight={700} fontSize={18} letterSpacing={3} fill="#A3A7B4">
            EJEMPLO
          </text>
        ) : null}
      </g>
    </g>
  );
};

/** Las 5 diapositivas de Sofi: apiladas (spread 0) o en abanico (spread 1). La primera queda adelante. */
export const SofiDeck: React.FC<{ spread: number; w?: number; h?: number }> = ({ spread, w = 560, h = 330 }) => (
  <g>
    {[4, 3, 2, 1, 0].map((p) => {
      const d = p - 2;
      return (
        <g key={p} transform={`translate(${d * 70 * spread} ${Math.abs(d) * 26 * spread - 60 * spread}) rotate(${d * 7 * spread})`}>
          <SofiSlide page={p} w={w} h={h} />
        </g>
      );
    })}
  </g>
);

// ---------- piezas y tablero ----------
/** Pieza de contexto (un dato del mensaje): ficha de color con un emoji y el texto. Centrada. */
export const Piece: React.FC<{ text: string; emoji?: string; color: string; size?: number; glow?: number }> = ({ text, emoji, color, size = 44, glow = 0 }) => {
  const fs = fitSize([text], size, 420, 800);
  const tw = textWidth(text, fs, 800) + (emoji ? fs * 1.3 : 0);
  const w = tw + 60;
  const h = fs * 1.9;
  return (
    <g>
      {glow > 0.01 ? <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={h / 2 + 10} fill="#FFE27A" opacity={0.55 * glow} /> : null}
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={h / 2} fill="#000000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} {...ST} strokeWidth={5} />
      {/* encastre de rompecabezas a la derecha */}
      <circle cx={w / 2} cy={0} r={h * 0.2} fill={color} {...ST} strokeWidth={5} />
      <rect x={w / 2 - h * 0.24} y={-h * 0.17} width={h * 0.2} height={h * 0.34} fill={color} />
      <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fs} fill="#FFFFFF" stroke={INK} strokeWidth={5} paintOrder="stroke">
        {emoji ? <tspan>{emoji} </tspan> : null}
        {text}
      </text>
    </g>
  );
};

export const SLOTS = [
  { q: "¿PARA QUIÉN?", c: "#3A5BEA" },
  { q: "¿DE QUÉ?", c: "#C2347A" },
  { q: "¿CUÁNTO?", c: "#16803A" },
  { q: "¿CÓMO?", c: "#6B3FD8" },
];
/** Centro de cada hueco del tablero (2 × 2), en coordenadas del tablero. */
export const SLOT_POS = [
  { x: -215, y: -110 },
  { x: 215, y: -110 },
  { x: -215, y: 170 },
  { x: 215, y: 170 },
];

/** Tablero de 4 huecos (900 × 640). `fill[i]`: 0 vacío … 1 lleno con `texts[i]`; `lit`: brilla completo. */
export const Board: React.FC<{ fill: number[]; texts: string[]; lit?: number; frame: number }> = ({ fill, texts, lit = 0, frame }) => (
  <g>
    <rect x={-450 + 12} y={-320 + 16} width={900} height={640} rx={44} fill="#000000" opacity={0.22} />
    <rect x={-450} y={-320} width={900} height={640} rx={44} fill="#FFF8E7" {...ST} strokeWidth={8} />
    {lit > 0.01 ? <rect x={-450} y={-320} width={900} height={640} rx={44} fill="none" stroke="#FFE27A" strokeWidth={22} opacity={lit * (0.6 + 0.4 * Math.sin(frame / 3))} /> : null}
    <text x={0} y={-250} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={46} fill={INK}>
      Lo que necesito saber
    </text>
    {SLOTS.map((s, i) => {
      const p = SLOT_POS[i];
      const k = clamp01(fill[i] ?? 0);
      return (
        <g key={s.q} transform={`translate(${p.x} ${p.y})`}>
          <rect x={-195} y={-110} width={390} height={230} rx={28} fill={k > 0.5 ? s.c : "#F0E8D2"} stroke={s.c} strokeWidth={6} strokeDasharray={k > 0.5 ? undefined : "18 12"} />
          <text x={0} y={-56} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={40} fill={k > 0.5 ? "#FFFFFF" : s.c}>
            {s.q}
          </text>
          {k > 0.5 ? (
            <g transform={`scale(${lerp(1.25, 1, clamp01((k - 0.5) * 2))})`}>
              {texts[i].split("\n").map((l, j, arr) => (
                <text key={j} x={0} y={30 + j * 44 - (arr.length - 1) * 22} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fitSize([l], 38, 350, 800)} fill="#FFFFFF">
                  {l}
                </text>
              ))}
              <g transform="translate(160 -84)">
                <circle r={26} fill={C.ok} stroke={INK} strokeWidth={4} />
                <path d="M -12 0 L -3 9 L 13 -10" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ) : (
            <text x={0} y={56} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={70} fill={s.c} opacity={0.35}>
              ?
            </text>
          )}
        </g>
      );
    })}
  </g>
);

// ---------- globo de pregunta ----------
/** Globo de diálogo con una pregunta (la cola apunta hacia `tail`: -1 abajo a la izquierda, 1 a la derecha). */
export const QBubble: React.FC<{ text: string; color?: string; tail?: -1 | 1; size?: number }> = ({ text, color = "#FFFFFF", tail = -1, size = 58 }) => {
  const fs = fitSize([text], size, 520);
  const w = textWidth(text, fs) + 70;
  const h = fs * 1.7;
  return (
    <g>
      <path d={`M ${tail * 30} ${h / 2 - 6} L ${tail * 70} ${h / 2 + 50} L ${tail * 90} ${h / 2 - 6} Z`} fill={color} {...ST} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={color} {...ST} />
      <rect x={tail > 0 ? 34 : -96} y={h / 2 - 12} width={62} height={14} fill={color} />
      <text x={0} y={fs * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} fill={INK}>
        {text}
      </text>
    </g>
  );
};

// ---------- embudo ----------
/** Embudo de color (boca de 420 px arriba, pico abajo). */
export const Funnel: React.FC<{ color: string; label?: string }> = ({ color, label }) => (
  <g>
    <path d="M -210 -150 L 210 -150 L 50 60 L 50 170 L -50 170 L -50 60 Z" fill={color} {...ST} strokeWidth={7} />
    <ellipse cx={0} cy={-150} rx={210} ry={36} fill="#000000" opacity={0.3} stroke={INK} strokeWidth={7} />
    <path d="M -150 -100 L -40 40" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" opacity={0.35} />
    {label ? (
      <text x={0} y={-30} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([label], 40, 280)} fill="#FFFFFF" stroke={INK} strokeWidth={5} paintOrder="stroke">
        {label}
      </text>
    ) : null}
  </g>
);

// ---------- tarjeta de 4 pasos ----------
const IconPerson: React.FC = () => (
  <g fill="#FFFFFF">
    <circle cx={0} cy={-16} r={17} />
    <path d="M -30 34 C -30 6 30 6 30 34 Z" />
  </g>
);
const IconList: React.FC = () => (
  <g stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round">
    {[-18, 0, 18].map((y) => (
      <g key={y}>
        <circle cx={-22} cy={y} r={3} fill="#FFFFFF" />
        <line x1={-8} y1={y} x2={26} y2={y} />
      </g>
    ))}
  </g>
);
const IconTie: React.FC = () => (
  <g fill="#FFFFFF">
    <path d="M -12 -32 L 12 -32 L 6 -18 L -6 -18 Z" />
    <path d="M -6 -16 L 6 -16 L 16 22 L 0 38 L -16 22 Z" />
  </g>
);
const IconBrush: React.FC = () => (
  <g>
    <rect x={-6} y={-36} width={12} height={44} rx={5} fill="#FFFFFF" transform="rotate(30)" />
    <path d="M -20 14 C -10 4 6 8 4 22 C 2 34 -18 38 -30 34 C -22 30 -24 20 -20 14 Z" fill="#FFFFFF" />
  </g>
);

export const STEPS = [
  { t: "¿Quién sos?", Icon: IconPerson, c: "#3A5BEA" },
  { t: "¿Qué necesitás?", Icon: IconList, c: "#C2347A" },
  { t: "¿Para quién es?", Icon: IconTie, c: "#16803A" },
  { t: "¿Cómo lo querés?", Icon: IconBrush, c: "#6B3FD8" },
];
/** Altura de cada fila de la tarjeta (centro de la fila i = ROW0 + i · ROW_H). */
export const STEP_ROW0 = -170;
export const STEP_ROW_H = 165;

/** Tarjeta "Antes de escribirle:" (880 × 940) con 4 renglones (rows: aparición 0 … 1; nums: los 1-4). */
export const FourSteps: React.FC<{ nums: number; rows: number[]; frame: number }> = ({ nums, rows, frame }) => (
  <g>
    <rect x={-440 + 12} y={-470 + 18} width={880} height={940} rx={44} fill="#000000" opacity={0.22} />
    <rect x={-440} y={-470} width={880} height={940} rx={44} fill="#FFFFFF" {...ST} strokeWidth={8} />
    <text x={0} y={-345} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={66} fill={INK}>
      Antes de escribirle:
    </text>
    {STEPS.map((r, i) => {
      const k = rows[i];
      const y = STEP_ROW0 + i * STEP_ROW_H;
      return (
        <g key={r.t} transform={`translate(0 ${y})`}>
          <g opacity={clamp01(nums * 4 - i)}>
            <rect x={-390} y={-66} width={780} height={132} rx={30} fill="#F3F4FA" />
            <text x={-350} y={22} fontFamily={MONO} fontWeight={700} fontSize={60} fill="#C9CCD9">
              {i + 1}
            </text>
          </g>
          {k > 0.01 ? (
            <g opacity={clamp01(k * 2)} transform={`translate(${-40 * (1 - k)} 0)`}>
              <g transform={`translate(-220 0) scale(${0.6 + 0.4 * k})`}>
                <circle r={54} fill={r.c} {...ST} strokeWidth={5} />
                <r.Icon />
              </g>
              <text x={-140} y={20} fontFamily={SANS} fontWeight={900} fontSize={fitSize([r.t], 58, 450)} fill={INK}>
                {r.t}
              </text>
              <g transform={`translate(352 0) rotate(${6 * Math.sin(frame / 6 + i)})`}>
                <circle r={26} fill={C.ok} stroke={INK} strokeWidth={4} />
                <path d="M -12 0 L -3 9 L 13 -10" stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ) : null}
        </g>
      );
    })}
  </g>
);

// ---------- el truco ----------
/** Cartita dorada "TRUCO" (gira con `spin` en grados, como una moneda). */
export const TrickCard: React.FC<{ spin: number; frame: number }> = ({ spin, frame }) => {
  const sx = Math.cos((spin * Math.PI) / 180);
  return (
    <g transform={`scale(${Math.abs(sx) < 0.05 ? 0.05 : sx} 1)`}>
      <rect x={-130} y={-170} width={260} height={340} rx={26} fill="#F5C04A" {...ST} strokeWidth={7} />
      <rect x={-112} y={-152} width={224} height={304} rx={18} fill="none" stroke="#FFF4C2" strokeWidth={5} strokeDasharray="14 10" />
      {sx > 0 ? (
        <g>
          <text x={0} y={-20} textAnchor="middle" fontSize={90}>
            ✨
          </text>
          <text x={0} y={90} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={60} fill={INK}>
            TRUCO
          </text>
        </g>
      ) : (
        <text x={0} y={40} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={140} fill="#FFF4C2">
          ?
        </text>
      )}
      <rect x={-300 + ((frame * 9) % 600)} y={-170} width={40} height={340} fill="#FFFFFF" opacity={0.25} transform="skewX(-20)" />
    </g>
  );
};

// ---------- chat del reel 4 ----------
export type ChatMsg = {
  me: boolean;
  text: string;
  /** 0 … 1: aparece la burbuja (las del usuario se tipean con `typed`) */
  k: number;
  /** letras ya tipeadas (solo las del usuario); por defecto, todas */
  typed?: number;
  /** palabras resaltadas: [desde, hasta) índices de palabra y cuánto brillan (0 … 1) */
  hi?: ReadonlyArray<readonly [number, number, number]>;
};

/**
 * Pantalla de ChatGPT del reel 4 (coordenadas de la pantalla del celular, 276 × 596, centrada): una lista
 * de mensajes de arriba hacia abajo. `thinking`: puntitos de "escribiendo…" debajo del último.
 */
export const ChatScreen4: React.FC<{ frame: number; msgs: ChatMsg[]; thinking?: number; top?: number; size?: number }> = ({ frame, msgs, thinking = 0, top = -190, size = 19 }) => {
  let y = top;
  const lh = size * 1.3;
  const out: React.ReactNode[] = [];
  msgs.forEach((m, mi) => {
    if (m.k < 0.01) return;
    const shown = m.me ? m.text.slice(0, Math.round(m.typed ?? m.text.length)) : m.text;
    if (m.me && shown.length === 0) return;
    const words = shown.split(" ");
    const lines = wrap(words, Math.floor(((m.me ? 19 : 22) * 19) / size));
    const bw = m.me ? Math.min(244, Math.max(...lines.map((l) => textWidth(l.join(" "), size, 600))) + 28) : 0;
    const h = lines.length * lh + 18;
    let wi = 0;
    out.push(
      <g key={mi} transform={`translate(0 ${y + (1 - clamp01(m.k)) * 20})`} opacity={clamp01(m.k * 1.5)}>
        {m.me ? <rect x={130 - bw} y={-size - 4} width={bw} height={h} rx={18} fill={CHAT.user} /> : (
          <g transform="translate(-116 -6) scale(0.1)">
            <ChatGPTLogo />
          </g>
        )}
        {lines.map((l, li) => (
          <text key={li} x={m.me ? 130 - bw + 12 : -94} y={li * lh + 4} fontFamily={SANS} fontWeight={m.me ? 600 : 500} fontSize={size} fill={CHAT.text}>
            {l.map((w, k) => {
              const idx = wi++;
              const hit = (m.hi ?? []).find(([a, b]) => idx >= a && idx < b);
              const glow = hit ? hit[2] : 0;
              return (
                <tspan key={k} fill={glow > 0.5 ? "#FFE27A" : CHAT.text} fontWeight={glow > 0.5 ? 800 : undefined}>
                  {(k ? " " : "") + w}
                </tspan>
              );
            })}
          </text>
        ))}
      </g>,
    );
    y += h + 16;
  });
  return (
    <g>
      <rect x={-138} y={-298} width={276} height={596} fill={CHAT.bg} />
      <g transform="translate(-62 -246) scale(0.12)">
        <ChatGPTLogo />
      </g>
      <text x={-44} y={-240} fontFamily={SANS} fontWeight={700} fontSize={18} fill={CHAT.text}>
        ChatGPT
      </text>
      <line x1={-138} y1={-218} x2={138} y2={-218} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      {out}
      {thinking > 0.01 ? (
        <g transform={`translate(-116 ${y - 2})`} opacity={thinking}>
          <g transform="translate(0 -4) scale(0.1)">
            <ChatGPTLogo />
          </g>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={26 + i * 14} cy={6} r={4.5} fill={CHAT.text} opacity={0.3 + 0.7 * Math.abs(Math.sin(frame / 6 - i * 0.7))} />
          ))}
        </g>
      ) : null}
      <rect x={-124} y={236} width={248} height={42} rx={21} fill="#2F2F2F" />
      <text x={-104} y={263} fontFamily={SANS} fontWeight={500} fontSize={15} fill="#8E8E8E">
        Escribí tu mensaje…
      </text>
    </g>
  );
};

/** Dónde termina (y) la lista de mensajes de ChatScreen4: para ubicar los "…" o el portal. */
export const chatBottom = (msgs: ChatMsg[], top = -190, size = 19) => {
  let y = top;
  const lh = size * 1.3;
  msgs.forEach((m) => {
    if (m.k < 0.01) return;
    const lines = wrap(m.text.split(" "), Math.floor(((m.me ? 19 : 22) * 19) / size));
    y += lines.length * lh + 18 + 16;
  });
  return y;
};
