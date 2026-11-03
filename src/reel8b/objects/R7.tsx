import React from "react";
import { random } from "remotion";
import { clamp01, lerp } from "../anim";
import { C, HOMERO as K, MONO, SANS } from "../tokens";
import { fitSize, textWidth } from "../ui/fit";
import { IconCheck, IconPlane } from "./Icons";
import { mix } from "./R6";

// Utilería nueva del reel 7 ("¿Qué son los agentes de IA?"), en el estilo de la serie: colores planos,
// contorno negro y todo centrado en el origen salvo que se diga otra cosa. Nada de marcas reales: las
// aerolíneas son inventadas (verificado en docs/reel7/guion.md) y las webs no muestran dominio.
const INK = K.contorno;
const ST = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// ---------------------------------------------------------------- hook: titulares y burbujas
/** Burbuja o recorte de diario con "AGENTES DE IA" (los que giran alrededor de Homero). */
export const Headline: React.FC<{ kind: "bubble" | "news"; lines: string[]; color?: string; tilt?: number }> = ({ kind, lines, color = C.seleccion, tilt = 0 }) => {
  if (kind === "bubble") {
    const fs = 34;
    const w = Math.max(...lines.map((l) => textWidth(l, fs, 900))) + 56;
    const h = lines.length * fs * 1.15 + 34;
    return (
      <g transform={`rotate(${tilt})`}>
        <path d={`M ${-w / 2 + 40} ${h / 2 - 2} L ${-w / 2 + 30} ${h / 2 + 26} L ${-w / 2 + 70} ${h / 2 - 2} Z`} fill={color} {...ST} strokeWidth={5} />
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2.4} fill={color} {...ST} strokeWidth={5} />
        {lines.map((l, i) => (
          <text key={l} x={0} y={-h / 2 + 17 + fs * 0.92 + i * fs * 1.15} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} fill="#FFFFFF">
            {l}
          </text>
        ))}
      </g>
    );
  }
  const fs = 30;
  const w = Math.max(...lines.map((l) => textWidth(l, fs, 900))) + 50;
  const h = lines.length * fs * 1.15 + 92;
  return (
    <g transform={`rotate(${tilt})`}>
      <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={6} fill="#000000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#F6F1E3" {...ST} strokeWidth={5} />
      <rect x={-w / 2 + 16} y={-h / 2 + 14} width={w - 32} height={20} fill={color} />
      <text x={-w / 2 + 24} y={-h / 2 + 30} fontFamily={SANS} fontWeight={900} fontSize={15} letterSpacing={3} fill="#FFFFFF">
        ÚLTIMO MOMENTO
      </text>
      {lines.map((l, i) => (
        <text key={l} x={0} y={-h / 2 + 50 + fs * 0.92 + i * fs * 1.15} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} fill={INK}>
          {l}
        </text>
      ))}
      {[0, 1].map((r) => (
        <rect key={r} x={-w / 2 + 16} y={h / 2 - 30 + r * 12} width={(w - 32) * (r ? 0.6 : 0.9)} height={6} rx={3} fill="#B9B3A2" />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- el reloj de un minuto
/**
 * Cronómetro de un minuto: `t` 0 … 1 de la vuelta (arco cian y aguja), `ring` 0 … 1 lo hace sonar (tiembla y
 * le salen rayitas). Radio 100; "1 MIN" escrito en la esfera (nunca un número sin su unidad).
 */
export const Stopwatch: React.FC<{ t: number; ring?: number; frame: number; red?: number }> = ({ t, ring = 0, frame, red = 0 }) => {
  const a = clamp01(t) * Math.PI * 2;
  const end = { x: Math.sin(a) * 78, y: -Math.cos(a) * 78 };
  const arc = t >= 0.999 ? "M 0 -78 A 78 78 0 1 1 -0.01 -78 Z" : `M 0 0 L 0 -78 A 78 78 0 ${a > Math.PI ? 1 : 0} 1 ${end.x} ${end.y} Z`;
  const shake = ring > 0.01 ? 7 * ring * Math.sin(frame * 2.3) : 0;
  const accent = mix(C.neutro, C.peligro, red);
  return (
    <g transform={`rotate(${shake})`}>
      {ring > 0.01
        ? [-40, -20, 20, 40].map((d) => (
            <path key={d} d={`M ${Math.sin((d * Math.PI) / 180) * 128} ${-Math.cos((d * Math.PI) / 180) * 128} L ${Math.sin((d * Math.PI) / 180) * 158} ${-Math.cos((d * Math.PI) / 180) * 158}`} stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={ring} />
          ))
        : null}
      <rect x={-18} y={-136} width={36} height={30} rx={8} fill="#8591AE" {...ST} />
      <rect x={-30} y={-152} width={60} height={22} rx={10} fill={accent} {...ST} />
      <circle r={104} fill="#20243A" {...ST} />
      <circle r={88} fill="#FFFFFF" />
      <path d={arc} fill={accent} opacity={0.55} />
      {Array.from({ length: 12 }, (_, i) => {
        const b = (i / 12) * Math.PI * 2;
        return <line key={i} x1={Math.sin(b) * 74} y1={-Math.cos(b) * 74} x2={Math.sin(b) * (i % 3 ? 82 : 66)} y2={-Math.cos(b) * (i % 3 ? 82 : 66)} stroke={INK} strokeWidth={i % 3 ? 4 : 7} strokeLinecap="round" />;
      })}
      <text x={0} y={42} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={24} fill={INK}>
        1 MIN
      </text>
      <line x1={0} y1={0} x2={Math.sin(a) * 70} y2={-Math.cos(a) * 70} stroke={C.peligro} strokeWidth={8} strokeLinecap="round" />
      <circle r={11} fill={INK} />
    </g>
  );
};

// ---------------------------------------------------------------- Bariloche
/** Postal de Bariloche (300 × 200): cielo, cerros con nieve, el lago y el nombre. */
export const Postcard: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-150 + 6} y={-100 + 8} width={300} height={200} rx={10} fill="#000000" opacity={0.25} />
    <rect x={-150} y={-100} width={300} height={200} rx={10} fill="#FFFFFF" {...ST} strokeWidth={5} />
    <clipPath id="postal-clip">
      <rect x={-136} y={-86} width={272} height={172} rx={6} />
    </clipPath>
    <g clipPath="url(#postal-clip)">
      <rect x={-136} y={-86} width={272} height={172} fill="#8FD3F7" />
      <circle cx={80 + 3 * Math.sin(frame / 40)} cy={-50} r={22} fill="#FFE27A" />
      <path d="M -150 40 L -80 -40 L -40 0 L 10 -64 L 70 4 L 110 -30 L 160 30 L 160 100 L -150 100 Z" fill="#4C6A8C" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -80 -40 L -98 -18 L -84 -22 L -70 -14 Z M 10 -64 L -12 -36 L 4 -40 L 18 -30 L 32 -40 Z M 110 -30 L 96 -14 L 110 -16 L 124 -10 Z" fill="#FFFFFF" />
      <rect x={-136} y={30} width={272} height={60} fill="#2F7FC1" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${-110 + i * 80 + 10 * Math.sin(frame / 12 + i)} ${48 + i * 9} l 30 0`} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
      ))}
    </g>
    <text x={0} y={80} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={38} fill="#FFFFFF" stroke={INK} strokeWidth={7} paintOrder="stroke" letterSpacing={2}>
      BARILOCHE
    </text>
  </g>
);

// ---------------------------------------------------------------- la lista de vuelos (respuesta del chat)
export const FLIGHTS = [
  { a: "Alfajor Air", p: "$ 98.400", c: "#8C4A2F" },
  { a: "Aerotero", p: "$ 91.200", c: "#23A55A" },
  { a: "Aerocarpincho", p: "$ 87.900", c: "#C77B30" },
];
/** Una fila de la lista (560 × 96): avioncito, aerolínea y precio (el precio siempre con su "$"). */
export const FlightRow: React.FC<{ a: string; p: string; c: string; best?: number; w?: number }> = ({ a, p, c, best = 0, w = 560 }) => (
  <g>
    <rect x={-w / 2 + 5} y={-44} width={w} height={96} rx={20} fill="#000000" opacity={0.22} />
    <rect x={-w / 2} y={-48} width={w} height={96} rx={20} fill={mix("#FFFFFF", "#E6FFF0", best)} stroke={best > 0.5 ? C.ok : INK} strokeWidth={best > 0.5 ? 7 : 5} />
    <circle cx={-w / 2 + 52} cy={0} r={30} fill={c} {...ST} strokeWidth={4} />
    <g transform={`translate(${-w / 2 + 52} 0) scale(0.36)`}>
      <IconPlane color="#FFFFFF" />
    </g>
    <text x={-w / 2 + 100} y={12} fontFamily={SANS} fontWeight={800} fontSize={fitSize([a], 34, w - 300, 800)} fill={INK}>
      {a}
    </text>
    <text x={w / 2 - 26} y={13} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={34} fill={best > 0.5 ? "#178445" : INK}>
      {p}
    </text>
  </g>
);

// ---------------------------------------------------------------- navegador
/**
 * Ventana de navegador (w × h, centrada): pestañas arriba (`tabs`), barra con texto (sin dominio: nada de
 * URLs inventadas) y el contenido (`children`, coordenadas centradas en el área de la página).
 */
export const Browser: React.FC<{ w: number; h: number; tabs: string[]; active?: number; bar: string; accent?: string; children?: React.ReactNode; id: string }> = ({
  w,
  h,
  tabs,
  active = 0,
  bar,
  accent = C.seleccion,
  children,
  id,
}) => {
  const top = -h / 2;
  const tw = Math.min(200, (w - 40) / Math.max(1, tabs.length));
  return (
    <g>
      <rect x={-w / 2 + 8} y={top + 12} width={w} height={h} rx={22} fill="#000000" opacity={0.28} />
      <rect x={-w / 2} y={top} width={w} height={h} rx={22} fill="#DDE2EE" {...ST} />
      {tabs.map((t, i) => (
        <g key={i} transform={`translate(${-w / 2 + 20 + i * tw} ${top + 14})`}>
          <path d={`M 0 44 L 10 4 Q 12 0 18 0 L ${tw - 18} 0 Q ${tw - 12} 0 ${tw - 10} 4 L ${tw} 44 Z`} fill={i === active ? "#FFFFFF" : "#C4CAD9"} stroke={INK} strokeWidth={3} />
          <text x={tw / 2} y={30} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={fitSize([t], 18, tw - 30, 700)} fill={INK}>
            {t}
          </text>
        </g>
      ))}
      <rect x={-w / 2 + 3} y={top + 58} width={w - 6} height={56} fill="#FFFFFF" />
      <rect x={-w / 2 + 70} y={top + 68} width={w - 100} height={36} rx={18} fill="#EEF1F7" stroke="#C4CAD9" strokeWidth={2} />
      {[0, 1].map((i) => (
        <circle key={i} cx={-w / 2 + 24 + i * 20} cy={top + 86} r={6} fill="#A9B0C2" />
      ))}
      <text x={-w / 2 + 90} y={top + 93} fontFamily={SANS} fontWeight={600} fontSize={20} fill="#5A5F73">
        {bar}
      </text>
      <clipPath id={`${id}-page`}>
        <rect x={-w / 2 + 3} y={top + 114} width={w - 6} height={h - 117} rx={18} />
      </clipPath>
      <g clipPath={`url(#${id}-page)`}>
        <rect x={-w / 2} y={top + 114} width={w} height={h - 114} fill="#FFFFFF" />
        <g transform={`translate(0 ${top + 114 + (h - 114) / 2})`}>{children}</g>
      </g>
      <rect x={-w / 2} y={top + 112} width={w} height={4} fill={accent} />
    </g>
  );
};

// ---------------------------------------------------------------- la meta del agente
/** Bandera de meta a cuadros con el objetivo escrito (tela 460 × 250 que flamea; el mástil baja 520). */
export const GoalFlag: React.FC<{ lines: string[]; frame: number; wave?: number }> = ({ lines, frame, wave = 1 }) => {
  const W0 = 460;
  const H0 = 250;
  const yAt = (x: number) => wave * 12 * Math.sin(frame / 5 - x / 70) * (x / W0);
  const top = Array.from({ length: 11 }, (_, i) => `${(i * W0) / 10} ${-H0 + yAt((i * W0) / 10)}`);
  const bot = Array.from({ length: 11 }, (_, i) => `${W0 - (i * W0) / 10} ${yAt(W0 - (i * W0) / 10)}`);
  const cloth = `M ${top.join(" L ")} L ${bot.join(" L ")} Z`;
  const sq = 23;
  return (
    <g>
      <rect x={-10} y={-H0 - 20} width={20} height={H0 + 540} rx={8} fill="#8591AE" {...ST} />
      <circle cx={0} cy={-H0 - 26} r={18} fill={K.piel} {...ST} />
      <clipPath id="flag-cloth">
        <path d={cloth} />
      </clipPath>
      <path d={cloth} fill="#FFFFFF" />
      <g clipPath="url(#flag-cloth)">
        {Array.from({ length: 40 }, (_, i) => {
          const c = i % 20;
          const r = Math.floor(i / 20);
          return (r + c) % 2 ? <rect key={i} x={c * sq} y={-H0 + r * sq + yAt(c * sq)} width={sq} height={sq + 1} fill={INK} /> : null;
        })}
        {lines.map((l, i) => (
          <text
            key={l}
            x={W0 / 2}
            y={-H0 + 2 * sq + 62 + i * 52 + yAt(W0 / 2)}
            textAnchor="middle"
            fontFamily={SANS}
            fontWeight={900}
            fontSize={fitSize([l], 46, W0 - 40)}
            fill={INK}
          >
            {l}
          </text>
        ))}
      </g>
      <path d={cloth} fill="none" {...ST} />
    </g>
  );
};

// ---------------------------------------------------------------- el plan
export const PLAN_STEPS = ["1. Abrir aerolínea", "2. Comparar", "3. Elegir asiento", "4. Pagar"];
/**
 * El plan del agente (hoja 620 × 560): título con la meta y 4 pasos que se escriben solos (`typed[i]`
 * 0 … 1 de cada renglón) y se tildan (`ticks[i]` 0 … 1).
 */
export const PlanSheet: React.FC<{ typed: number[]; ticks: number[]; frame: number; w?: number }> = ({ typed, ticks, frame, w = 620 }) => {
  const h = 560;
  const cursor = typed.findIndex((t) => t > 0 && t < 1);
  return (
    <g>
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={26} fill="#000000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={26} fill="#FFFDF4" {...ST} />
      <rect x={-w / 2} y={-h / 2} width={w} height={110} rx={26} fill="#20243A" />
      <rect x={-w / 2} y={-h / 2 + 70} width={w} height={40} fill="#20243A" />
      <g transform={`translate(${-w / 2 + 56} ${-h / 2 + 56})`}>
        <path d="M -4 -30 L -4 32" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" />
        <rect x={0} y={-30} width={40} height={28} fill="#FFFFFF" />
        <rect x={0} y={-30} width={10} height={9} fill={INK} />
        <rect x={20} y={-30} width={10} height={9} fill={INK} />
        <rect x={10} y={-21} width={10} height={9} fill={INK} />
        <rect x={30} y={-21} width={10} height={9} fill={INK} />
      </g>
      <text x={-w / 2 + 112} y={-h / 2 + 50} fontFamily={SANS} fontWeight={900} fontSize={34} fill="#FFFFFF" letterSpacing={3}>
        PLAN
      </text>
      <text x={-w / 2 + 112} y={-h / 2 + 86} fontFamily={SANS} fontWeight={700} fontSize={fitSize(["Meta: vuelo más barato a Bariloche"], 24, w - 140, 700)} fill={C.neutro}>
        Meta: vuelo más barato a Bariloche
      </text>
      {PLAN_STEPS.map((s, i) => {
        const y = -h / 2 + 180 + i * 100;
        const n = Math.round(clamp01(typed[i] ?? 0) * s.length);
        const tk = clamp01(ticks[i] ?? 0);
        return (
          <g key={s}>
            <rect x={-w / 2 + 40} y={y - 34} width={56} height={56} rx={12} fill={tk > 0.01 ? mix("#FFFFFF", C.ok, tk) : "#FFFFFF"} stroke={INK} strokeWidth={5} />
            {tk > 0.01 ? (
              <g transform={`translate(${-w / 2 + 68} ${y - 6}) scale(${1.6 * Math.min(1, tk * 1.3)})`}>
                <IconCheck />
              </g>
            ) : null}
            <text x={-w / 2 + 124} y={y + 8} fontFamily={SANS} fontWeight={800} fontSize={40} fill={tk > 0.5 ? "#5A5F73" : INK}>
              {s.slice(0, n)}
              {i === cursor && Math.floor(frame / 4) % 2 ? "|" : ""}
            </text>
            {tk > 0.5 ? <line x1={-w / 2 + 120} y1={y - 4} x2={-w / 2 + 124 + textWidth(s, 40, 800) * clamp01((tk - 0.5) * 2)} y2={y - 4} stroke="#5A5F73" strokeWidth={4} /> : null}
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- la web de la aerolínea inventada
export const AIRLINE = "Aerocarpincho";
const CARPI = "#C77B30";
/** Logo: la cabeza de un carpincho con un avioncito (dibujo propio). */
export const Carpincho: React.FC = () => (
  <g>
    <path d="M -40 10 C -44 -24 -20 -40 10 -38 C 40 -36 52 -14 50 8 C 48 30 30 40 0 40 C -26 40 -38 30 -40 10 Z" fill={CARPI} stroke={INK} strokeWidth={4} />
    <rect x={14} y={-14} width={40} height={30} rx={14} fill="#A8622A" stroke={INK} strokeWidth={4} />
    <circle cx={44} cy={-6} r={4} fill={INK} />
    <circle cx={6} cy={-14} r={5} fill={INK} />
    <path d="M -24 -34 C -28 -46 -16 -48 -12 -38" fill={CARPI} stroke={INK} strokeWidth={4} />
  </g>
);

export type SiteView = "inicio" | "precios" | "asientos" | "fechas";
/**
 * Página de Aerocarpincho (para el `Browser`, área ~ w × h centrada). Según `view`:
 * - inicio: buscador con "Buenos Aires → Bariloche" y el botón Buscar (`press`);
 * - precios: 3 vuelos con su precio, el más barato se marca (`best`);
 * - asientos: mapa de asientos, uno se elige (`seat`);
 * - fechas: tres días; el primero "SIN LUGARES" (`fail`), el segundo con lugar (`ok`).
 */
export const AirlineSite: React.FC<{ view: SiteView; w: number; h: number; press?: number; best?: number; seat?: number; fail?: number; ok?: number; scan?: number; frame: number }> = ({
  view,
  w,
  h,
  press = 0,
  best = 0,
  seat = 0,
  fail = 0,
  ok = 0,
  scan = -1,
  frame,
}) => {
  const top = -h / 2;
  return (
    <g>
      <rect x={-w / 2} y={top} width={w} height={h} fill="#FFF7EC" />
      <rect x={-w / 2} y={top} width={w} height={96} fill={CARPI} />
      <g transform={`translate(${-w / 2 + 70} ${top + 48}) scale(0.9)`}>
        <Carpincho />
      </g>
      <text x={-w / 2 + 130} y={top + 62} fontFamily={SANS} fontWeight={900} fontSize={40} fill="#FFFFFF">
        {AIRLINE}
      </text>
      {view === "inicio" ? (
        <g>
          <text x={0} y={top + 180} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} fill={INK}>
            ¿A dónde volás?
          </text>
          {["Buenos Aires", "Bariloche"].map((t, i) => (
            <g key={t} transform={`translate(0 ${top + 260 + i * 100})`}>
              <rect x={-w / 2 + 50} y={-38} width={w - 100} height={76} rx={16} fill="#FFFFFF" stroke="#D9C9B4" strokeWidth={3} />
              <text x={-w / 2 + 76} y={12} fontFamily={SANS} fontWeight={700} fontSize={32} fill={INK}>
                {(i ? "Hasta: " : "Desde: ") + t}
              </text>
            </g>
          ))}
          <g transform={`translate(0 ${top + 480}) scale(${1 - 0.08 * press})`}>
            <rect x={-170} y={-42} width={340} height={84} rx={42} fill={press > 0.3 ? "#A8622A" : CARPI} stroke={INK} strokeWidth={5} />
            <text x={0} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={38} fill="#FFFFFF">
              Buscar vuelos
            </text>
          </g>
        </g>
      ) : null}
      {view === "precios" ? (
        <g>
          <text x={0} y={top + 166} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={INK}>
            Buenos Aires → Bariloche
          </text>
          {[
            { t: "Vuelo de las 6:10", p: "$ 92.300" },
            { t: "Vuelo de las 13:45", p: "$ 87.900" },
            { t: "Vuelo de las 21:30", p: "$ 104.500" },
          ].map((r, i) => {
            const b = i === 1 ? clamp01(best) : 0;
            const hover = scan >= 0 && Math.round(scan) === i ? 1 : 0;
            return (
              <g key={r.t} transform={`translate(0 ${top + 250 + i * 116})`}>
                <rect x={-w / 2 + 40} y={-48} width={w - 80} height={96} rx={18} fill={mix(hover ? "#FFF0D6" : "#FFFFFF", "#E6FFF0", b)} stroke={b > 0.5 ? C.ok : hover ? CARPI : "#D9C9B4"} strokeWidth={b > 0.5 || hover ? 6 : 3} />
                <text x={-w / 2 + 70} y={12} fontFamily={SANS} fontWeight={700} fontSize={30} fill={INK}>
                  {r.t}
                </text>
                <text x={w / 2 - 70} y={13} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={34} fill={b > 0.5 ? "#178445" : INK}>
                  {r.p}
                </text>
                {b > 0.01 ? (
                  <g transform={`translate(${w / 2 - 40} -44) scale(${b})`}>
                    <rect x={-140} y={-22} width={160} height={42} rx={21} fill={C.ok} stroke={INK} strokeWidth={3} />
                    <text x={-60} y={8} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={22} fill="#FFFFFF">
                      MÁS BARATO
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}
        </g>
      ) : null}
      {view === "asientos" ? (
        <g>
          <text x={0} y={top + 166} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={INK}>
            Elegí tu asiento
          </text>
          {Array.from({ length: 24 }, (_, i) => {
            const r = Math.floor(i / 6);
            const c = i % 6;
            const x = (c - 2.5) * 86 + (c >= 3 ? 30 : -30);
            const y = top + 260 + r * 92;
            const taken = [1, 4, 8, 13, 15, 20, 22].includes(i);
            const chosen = i === 9 ? clamp01(seat) : 0;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${1 + 0.2 * Math.sin(chosen * Math.PI)})`}>
                <rect x={-32} y={-34} width={64} height={68} rx={14} fill={taken ? "#B9B3A2" : mix("#8FD3F7", C.ok, chosen)} stroke={INK} strokeWidth={4} />
                <rect x={-26} y={-40} width={52} height={18} rx={8} fill={taken ? "#9C9585" : mix("#5FB4E6", "#178445", chosen)} stroke={INK} strokeWidth={3} />
              </g>
            );
          })}
          {seat > 0.5 ? (
            <text x={0} y={top + 660} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill="#178445">
              Asiento elegido: ventanilla ✓
            </text>
          ) : null}
        </g>
      ) : null}
      {view === "fechas" ? (
        <g>
          <text x={0} y={top + 166} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={34} fill={INK}>
            ¿Qué día viajás?
          </text>
          {["VIE 14", "SÁB 15", "DOM 16"].map((d, i) => {
            const f = i === 0 ? clamp01(fail) : 0;
            const o = i === 1 ? clamp01(ok) : 0;
            const x = (i - 1) * 200;
            return (
              <g key={d} transform={`translate(${x} ${top + 330})`}>
                <rect x={-84} y={-90} width={168} height={180} rx={20} fill={f > 0.01 ? mix("#FFFFFF", "#FFD3D8", f) : o > 0.01 ? mix("#FFFFFF", "#D9FBE3", o) : "#FFFFFF"} stroke={f > 0.5 ? C.peligro : o > 0.5 ? C.ok : "#D9C9B4"} strokeWidth={f > 0.5 || o > 0.5 ? 7 : 3} />
                <text x={0} y={-30} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill="#5A5F73">
                  {d.split(" ")[0]}
                </text>
                <text x={0} y={40} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={66} fill={INK}>
                  {d.split(" ")[1]}
                </text>
              </g>
            );
          })}
          {ok > 0.01 ? (
            <g transform={`translate(0 ${top + 560}) scale(${clamp01(ok * 1.4)})`}>
              <rect x={-210} y={-44} width={420} height={88} rx={44} fill={C.ok} stroke={INK} strokeWidth={5} />
              <text x={0} y={16} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={42} fill="#FFFFFF">
                ¡HAY LUGAR! ✓
              </text>
            </g>
          ) : null}
        </g>
      ) : null}
      {/* el cursor del agente (una manito robot chica sigue sus clics) */}
      {frame < 0 ? null : null}
    </g>
  );
};

// ---------------------------------------------------------------- el ciclo
/** Tres flechas en círculo (radio 230) con PLANEA → HACE → REVISA, que giran (`spin` en grados). */
export const CycleArrows: React.FC<{ spin: number; lit?: number }> = ({ spin, lit = 0 }) => {
  const labels = ["PLANEA", "HACE", "REVISA"];
  const cols = [C.seleccion, K.piel, C.ok];
  const R = 230;
  return (
    <g>
      <g transform={`rotate(${spin})`}>
        {[0, 1, 2].map((i) => {
          const a0 = ((i * 120 - 90 + 12) * Math.PI) / 180;
          const a1 = ((i * 120 - 90 + 100) * Math.PI) / 180;
          const p0 = { x: Math.cos(a0) * R, y: Math.sin(a0) * R };
          const p1 = { x: Math.cos(a1) * R, y: Math.sin(a1) * R };
          const tip = { x: Math.cos(a1 + 0.2) * R, y: Math.sin(a1 + 0.2) * R };
          const n = { x: Math.cos(a1), y: Math.sin(a1) };
          return (
            <g key={i}>
              <path d={`M ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y}`} fill="none" stroke={INK} strokeWidth={46} strokeLinecap="round" />
              <path d={`M ${p0.x} ${p0.y} A ${R} ${R} 0 0 1 ${p1.x} ${p1.y}`} fill="none" stroke={cols[i]} strokeWidth={34} strokeLinecap="round" />
              <path d={`M ${p1.x + n.x * 46} ${p1.y + n.y * 46} L ${tip.x} ${tip.y} L ${p1.x - n.x * 46} ${p1.y - n.y * 46} Z`} fill={cols[i]} {...ST} />
            </g>
          );
        })}
      </g>
      {labels.map((l, i) => {
        const a = ((i * 120 - 90 + 56 + spin) * Math.PI) / 180;
        const x = Math.cos(a) * (R + 4);
        const y = Math.sin(a) * (R + 4);
        const fs = 50;
        const w = textWidth(l, fs, 900) + 40;
        return (
          <g key={l} transform={`translate(${x} ${y}) scale(${1 + 0.15 * lit})`}>
            <rect x={-w / 2} y={-38} width={w} height={70} rx={20} fill="#FFFFFF" {...ST} strokeWidth={5} />
            <text x={0} y={16} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fs} fill={INK}>
              {l}
            </text>
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- el correo de Sofi
export type Row7 = { from: string; subject: string; time: string; color: string; ticket?: boolean };
export const SOFI_ROWS: Row7[] = [
  { from: "Aerocarpincho", subject: "Tu pasaje a Bariloche ✈️", time: "10:42", color: CARPI, ticket: true },
  { from: "Mamá", subject: "¿Ya sacaste el vuelo?", time: "9:15", color: "#C2347A" },
  { from: "Facultad", subject: "Inscripción a materias", time: "8:03", color: "#3A5BEA" },
  { from: "Club de lectura", subject: "Reunión del jueves", time: "ayer", color: "#23A55A" },
];
/**
 * El correo de Sofi (840 × 700; el del reel 6 con otra paleta). La primera fila (el pasaje) entra desde
 * arriba con `arrive` 0 … 1 y empuja a las demás; `hi` la ilumina.
 */
export const SofiInbox: React.FC<{ arrive: number; hi: number; frame: number }> = ({ arrive, hi, frame }) => {
  const W0 = 840;
  const top = -350;
  const rowH = 128;
  const a = clamp01(arrive);
  return (
    <g>
      <rect x={-W0 / 2 + 10} y={top + 16} width={W0} height={700} rx={28} fill="#000000" opacity={0.3} />
      <rect x={-W0 / 2} y={top} width={W0} height={700} rx={28} fill="#F4FBFA" {...ST} />
      <rect x={-W0 / 2} y={top} width={W0} height={78} rx={28} fill="#137C8B" />
      <rect x={-W0 / 2} y={top + 44} width={W0} height={34} fill="#137C8B" />
      <text x={-W0 / 2 + 40} y={top + 52} fontFamily={SANS} fontWeight={900} fontSize={32} fill="#FFFFFF">
        Correo de Sofi
      </text>
      <text x={W0 / 2 - 40} y={top + 52} textAnchor="end" fontFamily={SANS} fontWeight={800} fontSize={24} fill="#BFF3EE">
        Recibidos
      </text>
      <clipPath id="sofi-inbox">
        <rect x={-W0 / 2 + 4} y={top + 80} width={W0 - 8} height={612} rx={24} />
      </clipPath>
      <g clipPath="url(#sofi-inbox)">
        {SOFI_ROWS.map((r, i) => {
          const slot = i === 0 ? lerp(-1.2, 0, a) : i - 1 + a;
          const y = top + 160 + slot * rowH;
          const k = i === 0 ? clamp01(hi) : 0;
          return (
            <g key={r.from} transform={`translate(0 ${y})`}>
              <rect x={-W0 / 2 + 18} y={-rowH / 2 + 8} width={W0 - 36} height={rowH - 16} rx={18} fill={k > 0.01 ? mix("#FFFFFF", "#D9FBE3", k) : "#FFFFFF"} stroke={k > 0.01 ? C.ok : "#D9E3E1"} strokeWidth={k > 0.01 ? 7 : 2} />
              <circle cx={-W0 / 2 + 76} cy={0} r={32} fill={r.color} />
              {r.ticket ? (
                <g transform={`translate(${-W0 / 2 + 76} 0) scale(0.34)`}>
                  <IconPlane color="#FFFFFF" />
                </g>
              ) : (
                <text x={-W0 / 2 + 76} y={11} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#FFFFFF">
                  {r.from[0]}
                </text>
              )}
              <text x={-W0 / 2 + 128} y={-10} fontFamily={SANS} fontWeight={700} fontSize={26} fill="#5A5F73">
                {r.from}
              </text>
              <text x={-W0 / 2 + 128} y={30} fontFamily={SANS} fontWeight={r.ticket ? 900 : 700} fontSize={fitSize([r.subject], 34, W0 - 260, 900)} fill={r.ticket && k > 0.3 ? "#178445" : INK}>
                {r.subject}
              </text>
              <text x={W0 / 2 - 40} y={-10} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={22} fill="#8A8E9C">
                {r.time}
              </text>
              {r.ticket && a > 0.5 ? <circle cx={W0 / 2 - 52} cy={28} r={11 + 2 * Math.sin(frame / 4)} fill={C.ok} /> : null}
            </g>
          );
        })}
      </g>
    </g>
  );
};

/** El pasaje (boarding pass) que sale del mail: 520 × 220. */
export const Ticket: React.FC = () => (
  <g>
    <rect x={-254} y={-102} width={520} height={220} rx={22} fill="#000000" opacity={0.25} />
    <rect x={-260} y={-110} width={520} height={220} rx={22} fill="#FFFFFF" {...ST} />
    <rect x={-260} y={-110} width={520} height={60} rx={22} fill={CARPI} />
    <rect x={-260} y={-70} width={520} height={20} fill={CARPI} />
    <text x={-230} y={-68} fontFamily={SANS} fontWeight={900} fontSize={28} fill="#FFFFFF">
      PASAJE · {AIRLINE}
    </text>
    <text x={-230} y={8} fontFamily={SANS} fontWeight={900} fontSize={40} fill={INK}>
      BUE → BARILOCHE
    </text>
    <text x={-230} y={60} fontFamily={SANS} fontWeight={700} fontSize={26} fill="#5A5F73">
      Pasajera: Sofi · Ventanilla
    </text>
    <line x1={150} y1={-50} x2={150} y2={110} stroke="#B9B3A2" strokeWidth={4} strokeDasharray="10 8" />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={176 + i * 7} y={-30 + (i % 3) * 4} width={i % 2 ? 3 : 5} height={110} fill={INK} />
    ))}
  </g>
);

// ---------------------------------------------------------------- tareas del enjambre
export const IconForm: React.FC = () => (
  <g>
    <rect x={-56} y={-72} width={112} height={144} rx={10} fill="#FFFFFF" {...ST} />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`translate(0 ${-34 + i * 36})`}>
        <rect x={-38} y={-10} width={20} height={20} rx={4} fill={i < 2 ? C.ok : "#FFFFFF"} stroke={INK} strokeWidth={3} />
        <rect x={-8} y={-5} width={48} height={10} rx={5} fill="#A9B0C2" />
      </g>
    ))}
  </g>
);

// ---------------------------------------------------------------- AYUDA → TRABAJA
/** "TE AYUDA A TRABAJAR" con AYUDA tachada (`cross` 0 … 1). */
export const HelpSign: React.FC<{ cross: number }> = ({ cross }) => {
  const fs = 66;
  const parts = ["TE ", "AYUDA", " A TRABAJAR"];
  const ws = parts.map((p) => textWidth(p, fs, 900));
  const total = ws.reduce((a, b) => a + b, 0);
  const x0 = -total / 2;
  const xA = x0 + ws[0];
  return (
    <g>
      <rect x={-total / 2 - 44} y={-70} width={total + 88} height={140} rx={30} fill="rgba(20,24,51,0.94)" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
      <text x={x0} y={24} fontFamily={SANS} fontWeight={900} fontSize={fs} fill="#FFFFFF" style={{ whiteSpace: "pre" }}>
        {parts[0]}
        <tspan fill={cross > 0.5 ? "#8E93AA" : K.piel}>{parts[1]}</tspan>
        {parts[2]}
      </text>
      {cross > 0.01 ? <line x1={xA - 8} y1={2} x2={xA - 8 + (ws[1] + 16) * clamp01(cross)} y2={2} stroke={C.peligro} strokeWidth={14} strokeLinecap="round" /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- el dato: la grilla de manitos
/** Una manito robot chica para la grilla (en un casillero de 64): apagada gris, prendida cian y amarilla. */
const MiniHand: React.FC<{ lit: number }> = ({ lit }) => {
  const body = mix("#5A6283", K.piel, lit);
  const edge = mix("#3A4060", INK, lit);
  return (
    <g>
      <rect x={-30} y={-30} width={60} height={60} rx={14} fill={mix("#262B4D", "#E6FBFF", lit)} stroke={mix("#3A4060", C.neutro, lit)} strokeWidth={3 + 2 * lit} />
      <g transform="translate(0 4)" stroke={edge} strokeWidth={2.5} strokeLinejoin="round">
        {[-12, -4, 4, 12].map((x, i) => (
          <rect key={i} x={x - 3.5} y={-20 + (i === 0 || i === 3 ? 4 : 0)} width={7} height={18} rx={3.5} fill={body} />
        ))}
        <rect x={-15} y={-6} width={30} height={22} rx={7} fill={body} />
        <rect x={-21} y={-4} width={8} height={14} rx={4} fill={body} transform="rotate(-30 -17 3)" />
      </g>
      {lit > 0.01 ? <circle cx={0} cy={9} r={3.5} fill={C.neutro} opacity={lit} /> : null}
    </g>
  );
};

/** Grilla de 10 × 10 manitos (pitch entre centros), centrada. `lit[i]` 0 … 1, `appear(i)` 0 … 1 escala. */
export const HandGrid: React.FC<{ lit: number[]; appear?: (i: number) => number; pitch?: number; frame: number }> = ({ lit, appear, pitch = 72, frame }) => (
  <g>
    {Array.from({ length: 100 }, (_, i) => {
      const r = Math.floor(i / 10);
      const c = i % 10;
      const s = appear ? appear(i) : 1;
      if (s < 0.01) return null;
      const l = lit[i] ?? 0;
      const hop = l > 0 && l < 1 ? 1 + 0.3 * Math.sin(l * Math.PI) : 1;
      const wig = l > 0.99 ? 1.5 * Math.sin(frame / 5 + i) : 0;
      return (
        <g key={i} transform={`translate(${(c - 4.5) * pitch} ${(r - 4.5) * pitch}) rotate(${wig}) scale(${s * hop * (pitch / 72)})`}>
          <MiniHand lit={l} />
        </g>
      );
    })}
  </g>
);

/** Qué casilleros se encienden (15, repartidos y fijos). */
export const LIT15 = (() => {
  const key = Array.from({ length: 100 }, (_, i) => random(`r7-lit-${i}`));
  return Array.from({ length: 100 }, (_, i) => i)
    .sort((a, b) => key[a] - key[b])
    .slice(0, 15);
})();

/**
 * La cifra, siempre entera: "2028 · 15 de 100 · DECISIONES". Una sola pieza que entra escalando (`k`):
 * nunca hay un cuadro con el número sin "de 100" ni sin "DECISIONES". `dim` la apaga (para 2024).
 */
export const DecisionPlate: React.FC<{ year: string; n: number; k: number; dim?: number; glow?: number }> = ({ year, n, k, dim = 0, glow = 0 }) => {
  if (k < 0.01) return null;
  const big = 96;
  const num = `${n}`;
  const de = "de 100";
  const tag = "DECISIONES";
  const wNum = textWidth(num, big, 900) + 18 + textWidth(de, 54, 900);
  const wTag = textWidth(tag, 50, 900) + 40;
  const gap = 26;
  const w = wNum + gap + wTag + 70;
  const h = 190;
  let x = -(wNum + gap + wTag) / 2;
  const accent = mix(C.neutro, "#8E93AA", dim);
  return (
    <g transform={`scale(${k})`} opacity={1 - 0.35 * dim}>
      {glow > 0.01 ? <rect x={-w / 2 - 14} y={-h / 2 - 14} width={w + 28} height={h + 28} rx={44} fill={C.neutro} opacity={0.35 * glow} /> : null}
      <rect x={-w / 2 + 8} y={-h / 2 + 12} width={w} height={h} rx={34} fill="#000000" opacity={0.3} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="rgba(20,24,51,0.96)" stroke={accent} strokeWidth={5} />
      <text x={0} y={-h / 2 + 46} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={36} letterSpacing={4} fill={mix("#BFF6FF", "#C9CCD9", dim)}>
        {`EN ${year}`}
      </text>
      <text x={x} y={58} fontFamily={SANS} fontWeight={900} fontSize={big} fill="#FFFFFF">
        {num}
      </text>
      {(() => {
        x += textWidth(num, big, 900) + 18;
        const el = (
          <text x={x} y={58} fontFamily={SANS} fontWeight={900} fontSize={54} fill="#FFFFFF">
            {de}
          </text>
        );
        x += textWidth(de, 54, 900);
        return el;
      })()}
      <g transform={`translate(${x + gap} 0)`}>
        <rect x={0} y={2} width={wTag} height={70} rx={18} fill={accent} />
        <text x={wTag / 2} y={56} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={50} fill={dim > 0.5 ? "#FFFFFF" : INK}>
          {tag}
        </text>
      </g>
    </g>
  );
};

/** Fuente en letra chica (centrada en x). */
export const SOURCE7 = "Gartner · predicción 2025";
export const Source7: React.FC<{ x?: number; y: number; k: number }> = ({ x = 540, y, k }) =>
  k > 0.01 ? (
    <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={24} fill="#FFFFFF" opacity={0.85 * k}>
      {SOURCE7}
    </text>
  ) : null;

// ---------------------------------------------------------------- romper todo
/** Archivero de metal (240 × 420, base en y = 210): tres cajones que se abren (`open`). */
export const FileCabinet: React.FC<{ open?: number; dent?: number }> = ({ open = 0, dent = 0 }) => (
  <g>
    <rect x={-120} y={-210} width={240} height={420} rx={14} fill="#7E8BA8" {...ST} />
    <rect x={-120} y={-210} width={30} height={420} fill="#5F6B88" opacity={0.6} />
    {[0, 1, 2].map((i) => {
      const o = i === 1 ? open : open * 0.5;
      return (
        <g key={i} transform={`translate(${o * 40} ${-140 + i * 136})`}>
          <rect x={-104} y={-56} width={208} height={112} rx={10} fill="#A9B4CC" {...ST} strokeWidth={5} />
          <rect x={-34} y={-12} width={68} height={20} rx={10} fill="#3A4060" />
          <rect x={-40} y={-44} width={80} height={24} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        </g>
      );
    })}
    {dent > 0.01 ? <path d="M -60 -60 L -20 -20 L -50 10 L 0 40" fill="none" stroke={INK} strokeWidth={5} opacity={dent} /> : null}
  </g>
);

const PAPERS = Array.from({ length: 26 }, (_, i) => ({
  vx: (random(`pp-vx-${i}`) - 0.5) * 34,
  vy: -14 - random(`pp-vy-${i}`) * 22,
  spin: (random(`pp-s-${i}`) - 0.5) * 30,
  sway: random(`pp-w-${i}`) * 6,
  s: 0.6 + random(`pp-sz-${i}`) * 0.7,
}));
/** Papeles que vuelan desde (0, 0) a partir del cuadro `at` (gravedad suave, se mecen al caer). */
export const FlyingPapers: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const t = frame - at;
  if (t < 0) return null;
  return (
    <g>
      {PAPERS.map((p, i) => {
        const x = p.vx * t + p.sway * 6 * Math.sin(t / 6 + i);
        const y = p.vy * t + 0.55 * t * t * 0.5;
        return (
          <g key={i} transform={`translate(${x} ${Math.min(y, 1400)}) rotate(${p.spin * t * 0.4}) scale(${p.s})`}>
            <rect x={-34} y={-44} width={68} height={88} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
            {[0, 1, 2].map((r) => (
              <rect key={r} x={-22} y={-26 + r * 18} width={44 - r * 8} height={6} rx={3} fill="#A9B0C2" />
            ))}
          </g>
        );
      })}
    </g>
  );
};
