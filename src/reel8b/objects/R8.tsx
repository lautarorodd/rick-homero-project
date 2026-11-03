import React from "react";
import { random } from "remotion";
import { clamp01, lerp } from "../anim";
import { HOMERO as K, MONO, SANS } from "../tokens";
import { fitSize, textWidth } from "../ui/fit";
import { ChatGPTLogo } from "./Brand";
import { mix } from "./R6";

// Utilería del reel 8 ("¿Qué pasa cuando apretás enviar?"): el viaje de la pregunta de Sofi. Estilo de la
// serie (colores planos, contorno negro) con mucha luz: la pregunta es siempre lo más brillante de la
// pantalla (cian a la ida, ámbar a la vuelta).
const INK = K.contorno;
const ST = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const CYAN = "#7FF3FF";
export const AMBER = "#FFC86B";

export const QUESTION = "¿Qué le cocino a mi novio, que es vegetariano?";
/** La pregunta como la corta el tokenizador real (tiktoken o200k_base, el de los modelos de OpenAI). */
export const Q_TOKENS = ["¿Qué", " le", " coc", "ino", " a", " mi", " novio", ",", " que", " es", " vegetar", "iano", "?"];
export const ANSWER = ["¡Probá", "un", "risotto", "de", "hongos!", "Es", "fácil", "y", "queda", "riquísimo."];

// ---------------------------------------------------------------- la luz
/** El hilo de luz: núcleo blanco, halo de color y destellos. Radio base 26. */
export const LightOrb: React.FC<{ color?: string; r?: number; frame: number }> = ({ color = CYAN, r = 26, frame }) => {
  const p = 1 + 0.12 * Math.sin(frame / 3);
  return (
    <g>
      <circle r={r * 4.2 * p} fill={color} opacity={0.12} />
      <circle r={r * 2.4 * p} fill={color} opacity={0.3} />
      <circle r={r * 1.3} fill={color} opacity={0.85} />
      <circle r={r * 0.75} fill="#FFFFFF" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M 0 ${-r * 2.6} L 0 ${-r * 4.2}`} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.6} transform={`rotate(${i * 90 + frame * 2})`} />
      ))}
    </g>
  );
};

/** Estela: una polilínea brillante que se afina hacia atrás. `pts` del más viejo al más nuevo. */
export const Trail: React.FC<{ pts: { x: number; y: number }[]; color?: string; w?: number }> = ({ pts, color = CYAN, w = 30 }) => (
  <g strokeLinecap="round" fill="none">
    {pts.slice(1).map((p, i) => {
      const q = pts[i];
      const k = (i + 1) / pts.length;
      return (
        <g key={i}>
          <line x1={q.x} y1={q.y} x2={p.x} y2={p.y} stroke={color} strokeWidth={w * k * 1.8} opacity={0.18 * k} />
          <line x1={q.x} y1={q.y} x2={p.x} y2={p.y} stroke={k > 0.7 ? "#FFFFFF" : color} strokeWidth={w * k * 0.55} opacity={0.9 * k} />
        </g>
      );
    })}
  </g>
);

// ---------------------------------------------------------------- el celular de Sofi
/**
 * Pantalla del chat (coordenadas de la pantalla del celular, 276 × 596, centrada). `typed`: letras de la
 * pregunta en el campo de texto; `sent` 0 … 1: la pregunta sube a burbuja y brilla; `answer`: letras de la
 * respuesta (aparece letra por letra); `pressed`: el botón de enviar hundido; `glow`: el botón late.
 */
export const ChatPhoneScreen: React.FC<{ frame: number; typed: number; sent: number; answer?: number; pressed?: number; glow?: number; leave?: number }> = ({
  frame,
  typed,
  sent,
  answer = 0,
  pressed = 0,
  glow = 0,
  leave = 0,
}) => {
  const q = QUESTION.slice(0, Math.round(typed));
  const wrapLines = (s: string, n: number) => {
    const out: string[] = [""];
    s.split(" ").forEach((w) => {
      const cur = out[out.length - 1];
      if ((cur + " " + w).trim().length > n) out.push(w);
      else out[out.length - 1] = (cur + " " + w).trim();
    });
    return out;
  };
  const qLines = wrapLines(q, 20);
  const ansText = ANSWER.join(" ").slice(0, Math.round(answer));
  const aLines = wrapLines(ansText, 21);
  const s = clamp01(sent);
  const bubbleY = lerp(150, -150, s);
  return (
    <g>
      <rect x={-138} y={-298} width={276} height={596} fill="#17181F" />
      <g transform="translate(-62 -252) scale(0.12)">
        <ChatGPTLogo />
      </g>
      <text x={-44} y={-246} fontFamily={SANS} fontWeight={700} fontSize={18} fill="#ECECEC">
        ChatGPT
      </text>
      <line x1={-138} y1={-224} x2={138} y2={-224} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      {/* la pregunta enviada: burbuja que sube y brilla (se va como luz: `leave`) */}
      {s > 0.01 ? (
        <g transform={`translate(0 ${bubbleY})`} opacity={1 - clamp01(leave)}>
          <rect x={-120} y={-34} width={244} height={qLines.length * 24 + 26} rx={18} fill={mix("#303030", "#2E7F8C", s)} />
          {s > 0.3 ? <rect x={-126} y={-40} width={256} height={qLines.length * 24 + 38} rx={22} fill="none" stroke={CYAN} strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(frame / 4)} /> : null}
          {qLines.map((l, i) => (
            <text key={i} x={-104} y={-6 + i * 24} fontFamily={SANS} fontWeight={600} fontSize={18} fill="#FFFFFF">
              {l}
            </text>
          ))}
        </g>
      ) : null}
      {/* la respuesta, letra por letra */}
      {answer > 0.5 ? (
        <g transform="translate(0 -40)">
          <g transform="translate(-118 -6) scale(0.1)">
            <ChatGPTLogo />
          </g>
          {aLines.map((l, i) => (
            <text key={i} x={-96} y={i * 25} fontFamily={SANS} fontWeight={500} fontSize={18} fill={mix("#FFE8B8", "#ECECEC", clamp01((answer - 10) / 40))}>
              {l}
              {i === aLines.length - 1 && answer < ANSWER.join(" ").length ? <tspan fill={AMBER}>{Math.floor(frame / 4) % 2 ? " ●" : ""}</tspan> : ""}
            </text>
          ))}
        </g>
      ) : null}
      {/* campo de texto + enviar */}
      <rect x={-124} y={216} width={204} height={62} rx={22} fill="#2F2F2F" />
      {s < 0.05 && q.length ? (
        qLines.slice(-2).map((l, i, arr) => (
          <text key={i} x={-110} y={252 - (arr.length - 1 - i) * 20} fontFamily={SANS} fontWeight={500} fontSize={15} fill="#ECECEC">
            {l}
            {i === arr.length - 1 && Math.floor(frame / 6) % 2 ? "|" : ""}
          </text>
        ))
      ) : (
        <text x={-110} y={253} fontFamily={SANS} fontWeight={500} fontSize={15} fill="#8E8E8E">
          Escribí tu mensaje…
        </text>
      )}
      <g transform={`translate(108 247) scale(${1 - 0.15 * pressed})`}>
        {glow > 0.01 ? <circle r={34 + 10 * glow} fill={CYAN} opacity={0.35 * glow} /> : null}
        <circle r={27} fill={glow > 0.01 || q.length ? "#FFFFFF" : "#676767"} />
        <path d="M 0 11 L 0 -10 M -9 -1 L 0 -10 L 9 -1" stroke="#17181F" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- el cuarto de Sofi
/** Ventana de noche (360 × 440): cielo, luna, estrellas que titilan y la ciudad a lo lejos. */
export const NightWindow: React.FC<{ frame: number; w?: number; h?: number }> = ({ frame, w = 360, h = 440 }) => (
  <g>
    <clipPath id="nw-clip">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} />
    </clipPath>
    <g clipPath="url(#nw-clip)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#1B1F5E" />
      <rect x={-w / 2} y={0} width={w} height={h / 2} fill="#2A2470" opacity={0.6} />
      <circle cx={w * 0.22} cy={-h * 0.24} r={40} fill="#FFF4C9" />
      <circle cx={w * 0.22 + 14} cy={-h * 0.24 - 8} r={34} fill="#1B1F5E" opacity={0.18} />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={-w / 2 + random(`ws-x${i}`) * w} cy={-h / 2 + random(`ws-y${i}`) * h * 0.5} r={2 + random(`ws-r${i}`) * 2} fill="#FFFFFF" opacity={0.4 + 0.6 * Math.abs(Math.sin(frame / 14 + i))} />
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const bw = 40 + random(`wb-w${i}`) * 30;
        const bh = 80 + random(`wb-h${i}`) * 120;
        const bx = -w / 2 + i * (w / 6.5);
        return (
          <g key={i}>
            <rect x={bx} y={h / 2 - bh} width={bw} height={bh} fill="#141640" />
            {Array.from({ length: 4 }, (_, j) => (
              <rect key={j} x={bx + 8 + (j % 2) * 16} y={h / 2 - bh + 14 + Math.floor(j / 2) * 26} width={8} height={10} fill="#FFD27A" opacity={random(`wl${i}${j}`) > 0.4 ? 0.85 : 0.15} />
            ))}
          </g>
        );
      })}
    </g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="none" stroke="#3B2A4E" strokeWidth={22} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="none" {...ST} />
    <line x1={0} y1={-h / 2} x2={0} y2={h / 2} stroke="#3B2A4E" strokeWidth={14} />
    <line x1={-w / 2} y1={0} x2={w / 2} y2={0} stroke="#3B2A4E" strokeWidth={14} />
  </g>
);

/** Reloj despertador digital "23:00" (220 × 110), que late con `pulse`. */
export const DigitalClock: React.FC<{ frame: number; pulse?: number }> = ({ frame, pulse = 0 }) => (
  <g transform={`scale(${1 + 0.12 * pulse})`}>
    <rect x={-110} y={-55} width={220} height={110} rx={22} fill="#20243A" {...ST} />
    <rect x={-92} y={-38} width={184} height={76} rx={10} fill="#0B0D1C" />
    {pulse > 0.01 ? <rect x={-104} y={-48} width={208} height={96} rx={18} fill={CYAN} opacity={0.18 * pulse} /> : null}
    <text x={0} y={22} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={58} fill={CYAN} opacity={0.85 + 0.15 * Math.sin(frame / 10)}>
      23{Math.floor(frame / 15) % 2 ? ":" : " "}00
    </text>
  </g>
);

/** Lámpara de mesa con luz cálida (origen en la base). */
export const Lamp: React.FC<{ on?: number }> = ({ on = 1 }) => (
  <g>
    <circle cx={0} cy={-200} r={170} fill={AMBER} opacity={0.16 * on} />
    <rect x={-8} y={-150} width={16} height={150} fill="#8C6A4A" {...ST} strokeWidth={4} />
    <path d="M -70 -150 L -40 -250 L 40 -250 L 70 -150 Z" fill="#FFE2A8" {...ST} />
    <rect x={-40} y={-6} width={80} height={12} rx={6} fill="#8C6A4A" {...ST} strokeWidth={4} />
  </g>
);

// ---------------------------------------------------------------- el camino
/** Vértices del camino (coordenadas del mundo del viaje): ventana → postes → costa → fondo del mar → costa → puerta. */
const RAW_PATH: Array<{ x: number; y: number; sag?: number }> = [
  { x: 250, y: 1010 },
  { x: 560, y: 760 },
  { x: 1140, y: 760, sag: 70 },
  { x: 1720, y: 760, sag: 70 },
  { x: 2200, y: 1240 },
  { x: 2560, y: 1960 },
  { x: 3300, y: 1990, sag: 40 },
  { x: 3900, y: 1960, sag: 40 },
  { x: 4220, y: 1240 },
  { x: 4950, y: 1170 },
];
/** El camino muestreado (con las curvas de los cables) y su largo acumulado. */
const PATH = (() => {
  const pts: { x: number; y: number }[] = [RAW_PATH[0]];
  for (let i = 1; i < RAW_PATH.length; i++) {
    const a = RAW_PATH[i - 1];
    const b = RAW_PATH[i];
    for (let k = 1; k <= 24; k++) {
      const u = k / 24;
      pts.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) + (b.sag ?? 0) * 4 * u * (1 - u) });
    }
  }
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, len, total: len[len.length - 1] };
})();
/** Punto del camino en la fracción `u` (0 … 1) de su largo. */
export const pathAt = (u: number) => {
  const d = clamp01(u) * PATH.total;
  let i = 1;
  while (i < PATH.len.length - 1 && PATH.len[i] < d) i++;
  const a = PATH.pts[i - 1];
  const b = PATH.pts[i];
  const k = (d - PATH.len[i - 1]) / Math.max(1e-6, PATH.len[i] - PATH.len[i - 1]);
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
};
/** Fracciones del camino en sus hitos (para anclar el viaje a las palabras). */
export const PATH_MARK = (() => {
  const at = (i: number) => {
    const target = RAW_PATH[i];
    let best = 0;
    PATH.pts.forEach((p, j) => {
      if (Math.hypot(p.x - target.x, p.y - target.y) < 1) best = j;
    });
    return PATH.len[best] / PATH.total;
  };
  return { window: 0, pole1: at(1), pole3: at(3), shore: at(4), seabed: at(5), seaEnd: at(7), coast: at(8), door: 1 };
})();

const Fish: React.FC<{ c: string; flip?: boolean; frame: number; i: number }> = ({ c, flip = false, frame, i }) => (
  <g transform={`scale(${flip ? -1 : 1} 1)`}>
    <path d={`M 40 0 L 70 ${-20 + 6 * Math.sin(frame / 3 + i)} L 70 ${20 + 6 * Math.sin(frame / 3 + i)} Z`} fill={c} {...ST} strokeWidth={4} />
    <ellipse cx={0} cy={0} rx={48} ry={26} fill={c} {...ST} strokeWidth={4} />
    <circle cx={-26} cy={-6} r={6} fill="#FFFFFF" />
    <circle cx={-27} cy={-6} r={3} fill={INK} />
  </g>
);

/** El centro de datos (origen en la base, al medio): bloque enorme con filas de luces y el cartel. */
export const DataCenter: React.FC<{ frame: number; sign?: number }> = ({ frame, sign = 1 }) => (
  <g>
    <rect x={-520} y={-900} width={1040} height={900} fill="#232A57" {...ST} />
    <rect x={-520} y={-900} width={1040} height={60} fill="#2F3770" {...ST} strokeWidth={4} />
    {Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 12 }, (_, c) => {
        const on = Math.sin(frame / (8 + ((r * 7 + c * 3) % 9)) + r * 1.7 + c) > -0.3;
        return <rect key={`${r}-${c}`} x={-480 + c * 80} y={-800 + r * 80} width={44} height={22} rx={5} fill={on ? CYAN : "#3C4588"} opacity={on ? 0.85 : 0.6} />;
      }),
    )}
    <rect x={-80} y={-180} width={160} height={180} fill="#11152E" {...ST} />
    <rect x={-80} y={-180} width={160} height={180} fill={CYAN} opacity={0.15 + 0.1 * Math.sin(frame / 6)} />
    <g transform={`translate(0 -960) scale(${sign})`}>
      <rect x={-330} y={-56} width={660} height={92} rx={16} fill="#0B0D1C" stroke={CYAN} strokeWidth={5} />
      <text x={0} y={12} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={56} fill={CYAN} letterSpacing={3}>
        CENTRO DE DATOS
      </text>
    </g>
  </g>
);

/**
 * El mundo del viaje (coordenadas propias; el camino va de x 250 a 4700). Cielo de noche con estrellas,
 * la casa de Sofi con su ventana, la calle con postes y cables, la costa, el mar con el cable submarino,
 * peces y burbujas, y el centro de datos. El cable brilla un poco donde ya pasó la luz (`u`, `color`).
 */
export const JourneyWorld: React.FC<{ frame: number; u: number; color: string; dcSign?: number }> = ({ frame, u, color, dcSign = 1 }) => {
  const passed = PATH.pts.filter((_, i) => PATH.len[i] <= u * PATH.total);
  return (
    <g>
      {/* cielo */}
      <linearGradient id="jw-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0E0F3A" />
        <stop offset="100%" stopColor="#3A2A82" />
      </linearGradient>
      <rect x={-1500} y={-1200} width={8000} height={2500} fill="url(#jw-sky)" />
      {Array.from({ length: 90 }, (_, i) => (
        <circle key={i} cx={-1200 + random(`js-x${i}`) * 7600} cy={-1100 + random(`js-y${i}`) * 2000} r={2 + random(`js-r${i}`) * 3} fill="#FFFFFF" opacity={0.3 + 0.5 * Math.abs(Math.sin(frame / 18 + i))} />
      ))}
      <circle cx={900} cy={250} r={90} fill="#FFF4C9" opacity={0.95} />
      <circle cx={900} cy={250} r={180} fill="#FFF4C9" opacity={0.08} />
      {/* ciudad lejana */}
      {Array.from({ length: 16 }, (_, i) => {
        const bx = -600 + i * 170;
        const bh = 260 + random(`jc-h${i}`) * 380;
        return (
          <g key={i}>
            <rect x={bx} y={1300 - bh} width={130} height={bh} fill="#22205A" />
            {Array.from({ length: 6 }, (_, j) => (
              <rect key={j} x={bx + 18 + (j % 3) * 36} y={1300 - bh + 30 + Math.floor(j / 3) * 60} width={18} height={24} fill="#FFD27A" opacity={random(`jcw${i}${j}`) > 0.45 ? 0.75 : 0.1} />
            ))}
          </g>
        );
      })}
      {/* suelo de la ciudad y la costa */}
      <rect x={-1500} y={1300} width={3700} height={2600} fill="#1A1840" />
      <path d="M 2200 1300 L 2300 1300 L 2560 2000 L 2560 3900 L 2200 3900 Z" fill="#1A1840" />
      {/* casa de Sofi con su ventana */}
      <rect x={60} y={700} width={420} height={600} fill="#3B2A6E" {...ST} />
      <rect x={160} y={920} width={180} height={190} rx={8} fill="#FFD27A" {...ST} />
      <rect x={160} y={920} width={180} height={190} rx={8} fill="#FFFFFF" opacity={0.15 + 0.1 * Math.sin(frame / 8)} />
      {/* el mar */}
      <linearGradient id="jw-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1C5AA8" />
        <stop offset="100%" stopColor="#06103A" />
      </linearGradient>
      <rect x={2240} y={1250} width={2000} height={2650} fill="url(#jw-sea)" />
      <path d={`M 2240 1250 ${Array.from({ length: 21 }, (_, i) => `L ${2240 + i * 100} ${1250 + 10 * Math.sin(frame / 8 + i)}`).join(" ")} L 4240 1250`} fill="none" stroke="#7FD3FF" strokeWidth={6} opacity={0.6} />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M ${2400 + i * 300} 1260 L ${2340 + i * 300} 2100 L ${2460 + i * 300} 2100 Z`} fill="#BFF6FF" opacity={0.05} />
      ))}
      <path d="M 2240 2080 C 2700 2040 3200 2120 3600 2060 C 3900 2020 4100 2070 4240 2080 L 4240 3900 L 2240 3900 Z" fill="#2B2F5E" />
      {Array.from({ length: 7 }, (_, i) => {
        const x = 2650 + i * 210;
        return <path key={i} d={`M ${x} 2080 C ${x + 20 * Math.sin(frame / 10 + i)} 2020 ${x - 20} 1980 ${x + 10 * Math.sin(frame / 12 + i)} 1930`} fill="none" stroke="#2FA36B" strokeWidth={10} strokeLinecap="round" />;
      })}
      {Array.from({ length: 7 }, (_, i) => {
        const dir = i % 2 ? 1 : -1;
        const x = 2400 + ((i * 290 + dir * frame * (2 + (i % 3))) % 1800 + 1800) % 1800;
        const y = 1500 + i * 70;
        return (
          <g key={i} transform={`translate(${x} ${y + 12 * Math.sin(frame / 9 + i)}) scale(${0.7 + 0.15 * (i % 3)})`}>
            <Fish c={["#FF9E5E", "#FFD23D", "#FF7AB6", "#7FF3FF"][i % 4]} flip={dir > 0} frame={frame} i={i} />
          </g>
        );
      })}
      {Array.from({ length: 12 }, (_, i) => (
        <circle key={i} cx={2500 + random(`jb-x${i}`) * 1600} cy={2000 - ((frame * (2 + random(`jb-v${i}`) * 3) + i * 90) % 700)} r={5 + random(`jb-r${i}`) * 6} fill="none" stroke="#BFF6FF" strokeWidth={2} opacity={0.5} />
      ))}
      {/* la otra costa y el centro de datos */}
      <path d="M 3900 3900 L 3900 2000 L 4240 1260 L 4300 1260 L 6500 1260 L 6500 3900 Z" fill="#1A1840" />
      <g transform="translate(4950 1260)">
        <DataCenter frame={frame} sign={dcSign} />
      </g>
      {/* postes de la calle */}
      {[560, 1140, 1720].map((x) => (
        <g key={x}>
          <rect x={x - 10} y={740} width={20} height={560} fill="#5A4A6E" {...ST} strokeWidth={4} />
          <rect x={x - 60} y={760} width={120} height={14} rx={6} fill="#5A4A6E" {...ST} strokeWidth={4} />
        </g>
      ))}
      {/* el cable (oscuro), y lo que ya recorrió la luz, brillando */}
      <polyline points={PATH.pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#0B0D1C" strokeWidth={14} strokeLinejoin="round" />
      <polyline points={PATH.pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#4A4F8C" strokeWidth={5} strokeLinejoin="round" />
      {passed.length > 1 ? <polyline points={passed.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" opacity={0.55} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- pasillos de servidores
/** Un rack de frente (ancho 1 = 200, alto 440), con lucecitas que titilan. */
const Rack: React.FC<{ frame: number; seed: number; hot?: number }> = ({ frame, seed, hot = 0 }) => (
  <g>
    <rect x={-100} y={-220} width={200} height={440} rx={8} fill="#1D2147" {...ST} strokeWidth={4} />
    {Array.from({ length: 10 }, (_, r) => (
      <g key={r}>
        <rect x={-84} y={-204 + r * 42} width={168} height={32} rx={4} fill="#2A3068" />
        {Array.from({ length: 5 }, (_, c) => {
          const on = Math.sin(frame / (3 + ((seed + r + c) % 5)) + seed * 3.1 + r * 1.9 + c) > 0;
          return <circle key={c} cx={-64 + c * 14} cy={-188 + r * 42} r={4} fill={c === 4 ? "#34D058" : CYAN} opacity={on ? 1 : 0.2} />;
        })}
        <rect x={10} y={-196 + r * 42} width={62} height={16} rx={3} fill="#101330" />
      </g>
    ))}
    {hot > 0.01 ? <rect x={-100} y={-220} width={200} height={440} rx={8} fill={CYAN} opacity={0.35 * hot} /> : null}
  </g>
);

/**
 * Pasillo infinito de racks en perspectiva (pantalla 1080 × 1920, punto de fuga en el centro). `z` avanza
 * la cámara por el pasillo (se repite: es infinito); `orb` 0 … 1 lleva la luz hacia el fondo.
 */
export const Corridor: React.FC<{ frame: number; z: number }> = ({ frame, z }) => {
  const VX = 540;
  const VY = 980;
  const racks: React.ReactNode[] = [];
  const N = 14;
  for (let i = N - 1; i >= 0; i--) {
    const depth = ((i - (z % 1) + N) % N) + 0.6;
    const s = 2.4 / depth;
    const fade = clamp01((N - depth) / 4);
    for (const side of [-1, 1]) {
      const x = VX + side * 520 * s;
      racks.push(
        <g key={`${i}-${side}`} transform={`translate(${x} ${VY + 120 * s}) scale(${s * 1.6})`} opacity={fade}>
          <Rack frame={frame} seed={i * 7 + (side > 0 ? 3 : 0) + Math.floor(z)} />
        </g>,
      );
    }
  }
  return (
    <g>
      <radialGradient id="cor-bg" cx="50%" cy="51%" r="60%">
        <stop offset="0%" stopColor="#4A5CC8" />
        <stop offset="100%" stopColor="#0B0D2A" />
      </radialGradient>
      <rect x={-300} y={-300} width={1680} height={2520} fill="url(#cor-bg)" />
      {/* piso y techo con líneas de fuga */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = -1 + i / 4;
        return (
          <g key={i} opacity={0.35}>
            <line x1={VX} y1={VY} x2={VX + a * 1400} y2={2300} stroke={CYAN} strokeWidth={3} />
            <line x1={VX} y1={VY} x2={VX + a * 1400} y2={-400} stroke="#8C9BFF" strokeWidth={2} />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const depth = ((i - (z * 2) % 1 + 8) % 8) + 0.6;
        const y = VY + 1300 / depth;
        return <line key={i} x1={-300} y1={y} x2={1380} y2={y} stroke={CYAN} strokeWidth={3} opacity={0.25 * clamp01((8 - depth) / 3)} />;
      })}
      {racks}
    </g>
  );
};

// ---------------------------------------------------------------- horno y gotita
/** Horno (340 × 300) con la puerta que se ilumina (`heat`) y el timer arriba. */
export const Oven: React.FC<{ heat: number; frame: number; timer: string }> = ({ heat, frame, timer }) => (
  <g>
    {heat > 0.01 ? <circle cx={0} cy={30} r={300} fill="#FF8A3D" opacity={0.18 * heat} /> : null}
    <rect x={-170} y={-150} width={340} height={300} rx={22} fill="#E8E2D6" {...ST} />
    <rect x={-170} y={-150} width={340} height={64} rx={22} fill="#CFC6B4" {...ST} />
    {[-110, -60].map((x) => (
      <circle key={x} cx={x} cy={-118} r={16} fill="#8C8577" {...ST} strokeWidth={4} />
    ))}
    <g transform="translate(70 -118)">
      <rect x={-58} y={-22} width={116} height={44} rx={8} fill="#0B0D1C" />
      <text x={0} y={13} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={mix("#5A4A3A", "#FFB23D", heat)}>
        {timer}
      </text>
    </g>
    <rect x={-136} y={-62} width={272} height={180} rx={14} fill={mix("#3A3530", "#FF9A3D", heat)} {...ST} />
    <rect x={-120} y={-48} width={240} height={150} rx={10} fill={mix("#4A4540", "#FFD27A", heat)} opacity={0.9} />
    {heat > 0.01
      ? [0, 1, 2].map((i) => (
          <path key={i} d={`M ${-80 + i * 80} 70 q 10 -30 0 -60 q -10 -30 0 -60`} fill="none" stroke="#FF6A1A" strokeWidth={8} strokeLinecap="round" opacity={heat * (0.6 + 0.4 * Math.sin(frame / 3 + i))} />
        ))
      : null}
    <rect x={-120} y={-80} width={240} height={10} rx={5} fill="#8C8577" />
  </g>
);

/** Cucharita de té (punta hacia la izquierda), con un poquito de agua (`fill` 0 … 1). */
export const Teaspoon: React.FC<{ fill: number }> = ({ fill }) => (
  <g>
    <rect x={40} y={-10} width={300} height={20} rx={10} fill="#C9CFDF" {...ST} strokeWidth={5} />
    <ellipse cx={-40} cy={0} rx={100} ry={56} fill="#DDE2EE" {...ST} />
    <ellipse cx={-40} cy={-4} rx={78} ry={36} fill="#B9C0D3" />
    {fill > 0.01 ? <ellipse cx={-40} cy={2} rx={22 * fill + 8} ry={10 * fill + 4} fill="#5FD0FF" opacity={0.9} /> : null}
  </g>
);

export const WaterDrop: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0 -50 C 22 -16 32 4 32 20 A 32 32 0 0 1 -32 20 C -32 4 -22 -16 0 -50 Z" fill="#5FD0FF" {...ST} strokeWidth={5} />
    <path d="M -12 6 C -14 18 -8 28 2 30" fill="none" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
  </g>
);

/** Fuente en letra chica (centrada en x). */
export const SOURCE8 = "Según OpenAI · Sam Altman · junio 2025";
export const Source8: React.FC<{ y: number; k: number; color?: string }> = ({ y, k, color = "#FFFFFF" }) =>
  k > 0.01 ? (
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={26} fill={color} opacity={0.85 * k}>
      {SOURCE8}
    </text>
  ) : null;

/** Cartel con "≈ …" (dato con su unidad), en una sola pieza. */
export const DataSign: React.FC<{ lines: string[]; color?: string }> = ({ lines, color = "#FFFFFF" }) => {
  const fs = Math.min(...lines.map((l) => fitSize([l], 70, 860)));
  const w = Math.max(...lines.map((l) => textWidth(l, fs, 900))) + 90;
  const h = lines.length * fs * 1.2 + 50;
  return (
    <g>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={30} fill="#000000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill="rgba(20,24,51,0.94)" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
      {lines.map((l, i) => (
        <text key={l} x={0} y={-h / 2 + 25 + fs * 0.95 + i * fs * 1.2} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} fill={i === 0 ? color : "#FFFFFF"}>
          {l}
        </text>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- la cocina
/** Hornalla con la sartén del risotto y vapor (origen en la hornalla). */
export const Stove: React.FC<{ frame: number; stir: number }> = ({ frame, stir }) => (
  <g>
    <rect x={-260} y={0} width={520} height={60} rx={10} fill="#3A3F5C" {...ST} />
    <ellipse cx={0} cy={-6} rx={130} ry={22} fill="#FF6A1A" opacity={0.5 + 0.2 * Math.sin(frame / 3)} />
    <path d="M -170 -70 L 170 -70 L 140 -6 L -140 -6 Z" fill="#2A2E44" {...ST} />
    <ellipse cx={0} cy={-70} rx={170} ry={30} fill="#F2D9A0" {...ST} />
    {Array.from({ length: 9 }, (_, i) => (
      <circle key={i} cx={-120 + i * 30} cy={-70 + 8 * Math.sin(i * 1.7)} r={9} fill={i % 3 ? "#C99A5A" : "#8C6A3A"} />
    ))}
    <rect x={170} y={-82} width={190} height={22} rx={11} fill="#2A2E44" {...ST} strokeWidth={5} />
    <g transform={`translate(${40 * Math.sin(stir * Math.PI * 2)} -80) rotate(${20 + 12 * Math.sin(stir * Math.PI * 2)})`}>
      <rect x={-10} y={-200} width={20} height={200} rx={8} fill="#C9935A" {...ST} strokeWidth={4} />
    </g>
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 20) % 60) / 60;
      return <path key={i} d={`M ${-60 + i * 60} ${-110 - 160 * t} q 20 -30 0 -60 q -20 -30 0 -60`} fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.5 * (1 - t)} />;
    })}
  </g>
);

// ---------------------------------------------------------------- el mapa del mundo
const CONTINENTS = [
  // América del Norte, América del Sur, Europa, África, Asia, Oceanía (siluetas simplificadas, propias)
  "M -760 -330 C -700 -420 -540 -440 -440 -380 C -380 -330 -400 -260 -460 -220 C -500 -180 -520 -120 -580 -110 C -640 -120 -700 -180 -740 -240 Z",
  "M -500 -60 C -440 -80 -380 -40 -380 20 C -380 100 -420 180 -470 250 C -500 290 -530 260 -520 200 C -510 120 -560 40 -540 -20 Z",
  "M -120 -380 C -60 -420 40 -410 80 -360 C 90 -320 40 -290 -10 -280 C -60 -270 -110 -300 -130 -340 Z",
  "M -110 -220 C -40 -250 60 -230 90 -170 C 120 -100 100 0 50 80 C 20 130 -20 120 -40 70 C -60 10 -110 -40 -140 -110 C -150 -160 -140 -200 -110 -220 Z",
  "M 120 -400 C 260 -460 480 -440 600 -360 C 660 -300 640 -220 560 -180 C 480 -140 380 -150 300 -170 C 220 -190 140 -240 110 -300 C 100 -340 100 -380 120 -400 Z",
  "M 440 80 C 500 50 600 60 640 110 C 660 160 610 200 540 200 C 480 200 430 160 440 80 Z",
];
export const CITY_DOTS = [
  { x: -560, y: -250 }, { x: -470, y: 120 }, { x: -20, y: -340 }, { x: 10, y: -60 }, { x: 330, y: -300 }, { x: 520, y: -230 }, { x: 560, y: 130 }, { x: -640, y: -320 }, { x: 200, y: -260 }, { x: -440, y: 30 },
];
/**
 * Mapa del mundo de noche (centrado, ~1600 × 1000) con arcos de luz que van (cian) y vuelven (ámbar) entre
 * ciudades y el centro (`hub`). `n` arcos visibles (0 … ARCS).
 */
export const ARCS = 46;
export const WorldMap: React.FC<{ frame: number; n: number; hub: { x: number; y: number } }> = ({ frame, n, hub }) => (
  <g>
    {CONTINENTS.map((d, i) => (
      <path key={i} d={d} fill="#2C3478" stroke="#5A66C8" strokeWidth={4} />
    ))}
    {Array.from({ length: Math.round(n) }, (_, i) => {
      const a = random(`arc-a${i}`) * Math.PI * 2;
      const r = 250 + random(`arc-r${i}`) * 420;
      const p = CITY_DOTS[i % CITY_DOTS.length];
      const from = i < CITY_DOTS.length ? p : { x: hub.x + Math.cos(a) * r * 1.4, y: hub.y + Math.sin(a) * r * 0.7 };
      const mid = { x: (from.x + hub.x) / 2, y: Math.min(from.y, hub.y) - 120 - 120 * random(`arc-h${i}`) };
      const t = ((frame * (0.012 + 0.01 * random(`arc-v${i}`)) + random(`arc-o${i}`)) % 1);
      const back = t > 0.5;
      const tt = back ? (t - 0.5) * 2 : t * 2;
      const q = (k: number) => ({ x: (1 - k) * (1 - k) * from.x + 2 * (1 - k) * k * mid.x + k * k * hub.x, y: (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * mid.y + k * k * hub.y });
      const pos = q(back ? 1 - tt : tt);
      const col = back ? AMBER : CYAN;
      return (
        <g key={i}>
          <path d={`M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${hub.x} ${hub.y}`} fill="none" stroke={col} strokeWidth={2.5} opacity={0.22} />
          <circle cx={from.x} cy={from.y} r={6} fill={AMBER} opacity={0.8} />
          <circle cx={pos.x} cy={pos.y} r={16} fill={col} opacity={0.25} />
          <circle cx={pos.x} cy={pos.y} r={7} fill="#FFFFFF" />
        </g>
      );
    })}
  </g>
);

/**
 * El mundo como un globo de noche (radio 430, centrado): meridianos que giran despacio, continentes
 * recortados adentro, ciudades que se encienden y `n` arcos de luz que van (cian) y vuelven (ámbar) entre
 * las ciudades y el centro (`hub`, donde está Homero).
 */
export const WorldGlobe: React.FC<{ frame: number; n: number; hub: { x: number; y: number } }> = ({ frame, n, hub }) => {
  const R = 430;
  const spin = frame * 0.6;
  return (
    <g>
      <circle r={R + 60} fill={CYAN} opacity={0.08} />
      <radialGradient id="globe-g" cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#2E4FB8" />
        <stop offset="100%" stopColor="#0B1238" />
      </radialGradient>
      <circle r={R} fill="url(#globe-g)" stroke="#7F9BFF" strokeWidth={4} />
      <clipPath id="globe-clip">
        <circle r={R} />
      </clipPath>
      <g clipPath="url(#globe-clip)">
        {[-1, 0, 1].map((w) => (
          <g key={w} transform={`translate(${((spin % 1600) - 800) + w * 1600} 60) scale(0.62)`}>
            {CONTINENTS.map((d, i) => (
              <path key={i} d={d} fill="#2C3478" stroke="#5A66C8" strokeWidth={5} />
            ))}
          </g>
        ))}
        {Array.from({ length: 7 }, (_, i) => {
          const ph = ((i / 7) * Math.PI + spin / 260) % Math.PI;
          return <ellipse key={i} rx={Math.abs(Math.cos(ph)) * R} ry={R} fill="none" stroke="#5A72D8" strokeWidth={2} opacity={0.35} />;
        })}
        {[-0.66, -0.33, 0, 0.33, 0.66].map((y) => (
          <ellipse key={y} cx={0} cy={y * R} rx={Math.sqrt(1 - y * y) * R} ry={18} fill="none" stroke="#5A72D8" strokeWidth={2} opacity={0.35} />
        ))}
      </g>
      {Array.from({ length: Math.round(n) }, (_, i) => {
        const a = random(`ga-a${i}`) * Math.PI * 2;
        const rr = Math.sqrt(random(`ga-r${i}`)) * (R - 30);
        const from = { x: Math.cos(a) * rr, y: Math.sin(a) * rr };
        const mid = { x: (from.x + hub.x) / 2 + (random(`ga-m${i}`) - 0.5) * 200, y: (from.y + hub.y) / 2 - 140 - 120 * random(`ga-h${i}`) };
        const t = (frame * (0.012 + 0.012 * random(`ga-v${i}`)) + random(`ga-o${i}`)) % 1;
        const back = t > 0.5;
        const tt = back ? (t - 0.5) * 2 : t * 2;
        const k = back ? 1 - tt : tt;
        const pos = { x: (1 - k) * (1 - k) * from.x + 2 * (1 - k) * k * mid.x + k * k * hub.x, y: (1 - k) * (1 - k) * from.y + 2 * (1 - k) * k * mid.y + k * k * hub.y };
        const col = back ? AMBER : CYAN;
        return (
          <g key={i}>
            <path d={`M ${from.x} ${from.y} Q ${mid.x} ${mid.y} ${hub.x} ${hub.y}`} fill="none" stroke={col} strokeWidth={3} opacity={0.3} />
            <circle cx={from.x} cy={from.y} r={7} fill={AMBER} />
            <circle cx={pos.x} cy={pos.y} r={18} fill={col} opacity={0.3} />
            <circle cx={pos.x} cy={pos.y} r={8} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

/** Destello suave de toda la pantalla (coordenadas de pantalla) en cada `hits`: marca un evento sin golpes. */
export const FlashPulse: React.FC<{ frame: number; hits: number[]; color?: string; x?: number; y?: number }> = ({ frame, hits, color = CYAN, x = 540, y = 960 }) => {
  const k = Math.max(0, ...hits.map((h) => (frame < h ? 0 : frame < h + 2 ? (frame - h) / 2 : Math.max(0, 1 - (frame - h - 2) / 12))));
  if (k < 0.01) return null;
  return (
    <g>
      <radialGradient id={`fp-${Math.round(x)}-${Math.round(y)}`} cx={x / 1080} cy={y / 1920} r="0.7">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.55 * k} />
        <stop offset="35%" stopColor={color} stopOpacity={0.3 * k} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
      <rect x={-300} y={-300} width={1680} height={2520} fill={`url(#fp-${Math.round(x)}-${Math.round(y)})`} />
    </g>
  );
};

/** Ficha chica de texto que entra con un pop (coordenadas de pantalla). */
export const Chip: React.FC<{ text: string; k: number; y?: number; color?: string }> = ({ text, k, y = 1470, color = CYAN }) =>
  k > 0.01 ? (
    <g transform={`translate(540 ${y}) scale(${k})`}>
      <rect x={-textWidth(text, 50, 900) / 2 - 36} y={-42} width={textWidth(text, 50, 900) + 72} height={84} rx={42} fill="rgba(20,24,51,0.94)" stroke={color} strokeWidth={4} />
      <text x={0} y={17} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={50} fill={color}>
        {text}
      </text>
    </g>
  ) : null;
