import React from "react";
import { random } from "remotion";
import { clamp01, lerp } from "../anim";
import { fitSize } from "../ui/fit";
import { C, HOMERO as K, MONO, SANS } from "../tokens";

// Utilería nueva del reel 3, en el estilo de la serie: colores planos, contorno negro de 6 y una luz
// de borde. Todo centrado en el origen salvo que se diga otra cosa.
const ST = { stroke: K.contorno, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const INK = "#1C1A24";

/** Cartel con el texto medido: la letra se achica hasta entrar en `maxW` (nada cortado por los bordes). */
export const FitSign: React.FC<{
  lines: string[];
  size?: number;
  maxW?: number;
  color?: string;
  bg?: string;
  border?: string;
  weight?: number;
  sizes?: number[]; // tamaño relativo de cada renglón (1 = size)
  colors?: string[];
}> = ({ lines, size = 64, maxW = 860, color = "#FFFFFF", bg = "rgba(20,24,51,0.94)", border = "rgba(255,255,255,0.4)", weight = 900, sizes, colors }) => {
  const rel = sizes ?? lines.map(() => 1);
  // un solo factor para todos los renglones: se mantiene la jerarquía
  const fs = Math.min(...lines.map((l, i) => fitSize([l], size * rel[i], maxW - 70, weight) / rel[i]));
  const hs = rel.map((r) => fs * r * 1.18);
  const h = hs.reduce((a, b) => a + b, 0) + 44;
  const w = Math.min(maxW, Math.max(...lines.map((l, i) => l.length * fs * rel[i] * 0.6)) + 80);
  let y = -h / 2 + 22;
  return (
    <g>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={30} fill="#000000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={bg} stroke={border} strokeWidth={4} />
      {lines.map((l, i) => {
        y += hs[i];
        return (
          <text key={i} x={0} y={y - hs[i] * 0.22} textAnchor="middle" fontFamily={SANS} fontWeight={weight} fontSize={fs * rel[i]} fill={colors?.[i] ?? color}>
            {l}
          </text>
        );
      })}
    </g>
  );
};

// ---------- hook y oficina ----------
/** Pantalla de proyector con la diapositiva de Sofi. `red`: se tiñe desde abajo; `blank`: diapositiva vacía. */
export const ProjectorSlide: React.FC<{ id: string; w?: number; h?: number; red?: number; ok?: number; blank?: number; crossed?: number; postit?: number; frame: number }> = ({
  id,
  w = 720,
  h = 420,
  red = 0,
  ok = 1,
  blank = 0,
  crossed = 0,
  postit = 0,
  frame,
}) => (
  <g>
    <rect x={-w / 2 - 24} y={-h / 2 - 40} width={w + 48} height={26} rx={12} fill="#3A3F5C" {...ST} />
    <rect x={-w / 2} y={-h / 2 - 14} width={w} height={h + 14} fill="#F6F7FB" {...ST} />
    <clipPath id={`${id}-clip`}>
      <rect x={-w / 2 + 3} y={-h / 2 - 11} width={w - 6} height={h + 8} />
    </clipPath>
    <g clipPath={`url(#${id}-clip)`}>
      <text x={-w / 2 + 40} y={-h / 2 + 52} fontFamily={SANS} fontWeight={800} fontSize={40} fill="#2A2F63">
        Ventas online {blank > 0.5 ? "" : "2026"}
      </text>
      <rect x={-w / 2 + 40} y={-h / 2 + 72} width={160} height={8} rx={4} fill="#3D7BFF" />
      {blank > 0.5 ? (
        <text x={0} y={70} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={150} fill="#C9CCD9">
          ???
        </text>
      ) : (
        <g>
          <text x={-w / 2 + 40} y={h / 2 - 80} fontFamily={MONO} fontWeight={700} fontSize={136} fill={INK}>
            +37 %
          </text>
          {/* barras del gráfico */}
          {[0.35, 0.5, 0.62, 0.95].map((v, i) => (
            <rect key={i} x={w / 2 - 200 + i * 40} y={h / 2 - 50 - 200 * v} width={30} height={200 * v} rx={6} fill={i === 3 ? "#34D058" : "#9AA6D6"} />
          ))}
          {/* sello: ✔ verde o ✗ roja */}
          <g transform={`translate(${w / 2 - 70} ${-h / 2 + 50}) scale(${ok > 0.5 ? 1 : 0.001 + (1 - ok) * 1})`}>
            <circle r={40} fill={ok > 0.5 ? C.ok : C.peligro} stroke={INK} strokeWidth={5} />
            {ok > 0.5 ? (
              <path d="M -18 0 L -4 14 L 20 -14" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M -15 -15 L 15 15 M 15 -15 L -15 15" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" />
            )}
          </g>
        </g>
      )}
      {/* se tiñe de rojo desde abajo, con una onda en el borde */}
      {red > 0.01 ? (
        <path
          d={`M ${-w / 2 - 10} ${h / 2 + 10} L ${-w / 2 - 10} ${h / 2 - (h + 30) * red} ${Array.from({ length: 9 }, (_, i) => {
            const x = -w / 2 + (i * w) / 8;
            return `L ${x} ${h / 2 - (h + 30) * red + 10 * Math.sin(frame / 3 + i)}`;
          }).join(" ")} L ${w / 2 + 10} ${h / 2 - (h + 30) * red} L ${w / 2 + 10} ${h / 2 + 10} Z`}
          fill={C.peligro}
          opacity={0.62}
        />
      ) : null}
      {crossed > 0.01 ? (
        <path
          d={`M ${-w / 2 + 40} ${h / 2 - 120} L ${-w / 2 + 40 + 480 * crossed} ${h / 2 - 150 - 20 * crossed}`}
          stroke={C.peligro}
          strokeWidth={22}
          strokeLinecap="round"
        />
      ) : null}
    </g>
    <path d={`M 0 ${h / 2} L 0 ${h / 2 + 60}`} stroke="#3A3F5C" strokeWidth={12} />
    {postit > 0.01 ? (
      <g transform={`translate(${w / 2 - 150} ${h / 2 - 150}) rotate(${6 - 10 * (1 - postit)}) scale(${postit})`}>
        <PostIt lines={["DATO", "CHEQUEADO ✔"]} />
      </g>
    ) : null}
  </g>
);

export const PostIt: React.FC<{ lines: string[] }> = ({ lines }) => (
  <g>
    <rect x={-120} y={-100} width={240} height={200} fill="#FFE46B" {...ST} strokeWidth={4} />
    <rect x={-120} y={-100} width={240} height={36} fill="#F7D23E" />
    {lines.map((l, i) => (
      <text key={i} x={0} y={-6 + i * 46} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={i ? 30 : 40} fill={i ? "#16803A" : INK}>
        {l}
      </text>
    ))}
  </g>
);

/** Reloj de pared: `a` = ángulo de la aguja grande en vueltas. */
export const WallClock: React.FC<{ a: number }> = ({ a }) => (
  <g>
    <circle r={92} fill="#FFFFFF" {...ST} strokeWidth={8} />
    {Array.from({ length: 12 }, (_, i) => (
      <line key={i} x1={0} y1={-76} x2={0} y2={-64} stroke={INK} strokeWidth={6} transform={`rotate(${i * 30})`} />
    ))}
    <line x1={0} y1={0} x2={0} y2={-46} stroke={INK} strokeWidth={10} strokeLinecap="round" transform={`rotate(${(a / 12) * 360 + 240})`} />
    <line x1={0} y1={0} x2={0} y2={-68} stroke={C.peligro} strokeWidth={6} strokeLinecap="round" transform={`rotate(${a * 360})`} />
    <circle r={8} fill={INK} />
  </g>
);

/** Calendario de pared: `flip` 0 … 1 pasa la hoja; abajo queda "MAÑANA 9:00". */
export const Calendar: React.FC<{ flip: number }> = ({ flip }) => (
  <g>
    <rect x={-90} y={-100} width={180} height={200} rx={12} fill="#FFFFFF" {...ST} />
    <rect x={-90} y={-100} width={180} height={50} rx={12} fill={C.peligro} {...ST} />
    <text x={0} y={-12} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill={C.peligro}>
      MAÑANA
    </text>
    <text x={0} y={60} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={50} fill={INK}>
      9:00
    </text>
    {flip < 1 ? (
      <g transform={`translate(0 -50) scale(1 ${Math.cos(flip * Math.PI * 0.5)}) translate(0 50)`}>
        <rect x={-90} y={-50} width={180} height={150} fill="#FFFFFF" {...ST} />
        <text x={0} y={52} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={80} fill={INK}>
          HOY
        </text>
      </g>
    ) : null}
    {[-50, 50].map((x) => (
      <rect key={x} x={x - 8} y={-116} width={16} height={34} rx={8} fill="#8C93A8" {...ST} strokeWidth={4} />
    ))}
  </g>
);

export const Folder: React.FC<{ label: string }> = ({ label }) => (
  <g>
    <path d="M -170 -110 L -60 -110 L -36 -86 L 170 -86 L 170 110 L -170 110 Z" fill="#E9B23A" {...ST} />
    <rect x={-170} y={-60} width={340} height={170} fill="#F5C04A" {...ST} />
    <text x={0} y={36} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={label.length > 10 ? 34 : 40} fill={INK}>
      {label}
    </text>
  </g>
);

export const Cart: React.FC<{ frame: number; flag?: number }> = ({ frame, flag = 0 }) => (
  <g>
    {flag > 0.01 ? (
      <g transform={`translate(70 -150) scale(${flag})`}>
        <line x1={0} y1={0} x2={0} y2={-150} stroke={INK} strokeWidth={6} />
        <g transform="translate(0 -150)">
          {[0, 1, 2].map((r) => (
            <path
              key={r}
              d={`M 0 ${r * 30} Q 40 ${r * 30 + 10 * Math.sin(frame / 4)} 80 ${r * 30} Q 120 ${r * 30 - 10 * Math.sin(frame / 4)} 140 ${r * 30} L 140 ${r * 30 + 30} Q 120 ${r * 30 + 30 - 10 * Math.sin(frame / 4)} 80 ${r * 30 + 30} Q 40 ${r * 30 + 30 + 10 * Math.sin(frame / 4)} 0 ${r * 30 + 30} Z`}
              fill={r === 1 ? "#FFFFFF" : "#74ACDF"}
            />
          ))}
          <circle cx={70} cy={45} r={10} fill="#F6B40E" />
          <rect x={0} y={0} width={140} height={90} fill="none" stroke={INK} strokeWidth={4} />
        </g>
      </g>
    ) : null}
    <rect x={-120} y={-150} width={110} height={90} rx={8} fill="#FF7AB6" {...ST} strokeWidth={5} />
    <rect x={-10} y={-130} width={100} height={70} rx={8} fill="#38D6E8" {...ST} strokeWidth={5} />
    <path d="M -220 -170 L -170 -170 L -130 40 L 140 40 L 170 -90 L -150 -90" fill="none" {...ST} strokeWidth={12} />
    <path d="M -150 -90 L 170 -90 L 140 40 L -130 40 Z" fill="rgba(255,255,255,0.35)" />
    {[-100, 110].map((x) => (
      <g key={x} transform={`translate(${x} 80) rotate(${frame * 12})`}>
        <circle r={30} fill="#3A3F5C" {...ST} />
        <line x1={-20} y1={0} x2={20} y2={0} stroke="#FFFFFF" strokeWidth={5} />
      </g>
    ))}
  </g>
);

export const TrendArrow: React.FC<{ grow: number }> = ({ grow }) => (
  <g>
    <path
      d="M -150 120 L -60 20 L 0 70 L 140 -100"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth={30}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={`${560 * grow} 600`}
    />
    <path d="M -150 120 L -60 20 L 0 70 L 140 -100" fill="none" stroke={C.ok} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${560 * grow} 600`} />
    {grow > 0.95 ? <path d="M 140 -100 L 76 -86 M 140 -100 L 132 -36" stroke={C.ok} strokeWidth={18} strokeLinecap="round" /> : null}
  </g>
);

// ---------- la respuesta "oficial" ----------
/** Escarapela dorada con estrella: el sello "oficial" que le pone Homero a su fuente. */
export const OfficialSeal: React.FC<{ spin?: number }> = ({ spin = 0 }) => (
  <g>
    <g transform={`rotate(${spin})`}>
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d="M 0 -78 L 12 -60 L -12 -60 Z" fill="#E8A41C" transform={`rotate(${i * 15})`} />
      ))}
    </g>
    <circle r={64} fill="#F5C04A" {...ST} strokeWidth={5} />
    <circle r={48} fill="none" stroke="#B97F12" strokeWidth={4} strokeDasharray="6 6" />
    <path d="M 0 -30 L 9 -9 L 31 -9 L 13 5 L 20 27 L 0 14 L -20 27 L -13 5 L -31 -9 L -9 -9 Z" fill="#FFF4DC" stroke="#B97F12" strokeWidth={3} />
  </g>
);

export const SOURCE = ["Observatorio Nacional", "de Ventas Digitales"];

/**
 * Tarjeta de respuesta con marco dorado: "37 %" (count: 0 … 37) y la fuente (src: 0 … 1 escrita).
 * `shine` recorre un brillo; `crack` agrieta el número; `red` lo tiñe.
 */
export const AnswerCard: React.FC<{ id: string; count: number; src: number; shine?: number; crack?: number; red?: number; seal?: number; frame: number }> = ({
  id,
  count,
  src,
  shine = -1,
  crack = 0,
  red = 0,
  seal = 0,
  frame,
}) => {
  const w = 880;
  const h = 640;
  const chars = Math.round(SOURCE.join(" ").length * clamp01(src));
  const l1 = SOURCE[0].slice(0, chars);
  const l2 = SOURCE[1].slice(0, Math.max(0, chars - SOURCE[0].length - 1));
  return (
    <g>
      <rect x={-w / 2 + 10} y={-h / 2 + 16} width={w} height={h} rx={40} fill="#000000" opacity={0.25} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={40} fill="#FFFBEF" stroke="#E8A41C" strokeWidth={14} />
      <rect x={-w / 2 + 22} y={-h / 2 + 22} width={w - 44} height={h - 44} rx={26} fill="none" stroke="#F5C04A" strokeWidth={4} strokeDasharray="14 10" />
      <text x={-w / 2 + 60} y={-h / 2 + 90} fontFamily={SANS} fontWeight={800} fontSize={34} letterSpacing={4} fill="#9A7A2E">
        RESPUESTA
      </text>
      <text x={0} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={250} fill={red > 0.5 ? C.peligro : INK}>
        {Math.round(count)} %
      </text>
      {crack > 0.01 ? (
        <path
          d="M -260 -120 L -180 -60 L -220 -10 L -110 40 L -150 90 L -40 130"
          fill="none"
          stroke={INK}
          strokeWidth={8}
          strokeDasharray={`${700 * crack} 800`}
          strokeLinejoin="round"
        />
      ) : null}
      <line x1={-w / 2 + 60} y1={110} x2={w / 2 - 60} y2={110} stroke="#E9DFC5" strokeWidth={4} />
      {src > 0.01 ? (
        <g>
          <text x={-w / 2 + 60} y={170} fontFamily={SANS} fontWeight={700} fontSize={32} fill="#7D8299">
            Fuente:
          </text>
          <text x={-w / 2 + 60} y={222} fontFamily={SANS} fontWeight={800} fontSize={44} fill="#2A2F63">
            {l1}
          </text>
          <text x={-w / 2 + 60} y={276} fontFamily={SANS} fontWeight={800} fontSize={44} fill="#2A2F63">
            {l2}
          </text>
        </g>
      ) : null}
      {seal > 0.01 ? (
        <g transform={`translate(${w / 2 - 110} 200) scale(${seal})`}>
          <OfficialSeal spin={frame * 1.5} />
        </g>
      ) : null}
      {shine >= 0 && shine <= 1 ? (
        <g>
          <clipPath id={`${id}-shine`}>
            <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={40} />
          </clipPath>
          <rect
            x={lerp(-w / 2 - 300, w / 2 + 100, shine)}
            y={-h / 2 - 100}
            width={140}
            height={h + 200}
            fill="#FFFFFF"
            opacity={0.55}
            transform="skewX(-20)"
            clipPath={`url(#${id}-shine)`}
          />
        </g>
      ) : null}
    </g>
  );
};

/** Sello de verificación que gira como un cartel: adelante ✔ + `front` en verde; atrás "INVENTADO". */
export const CheckStamp: React.FC<{ front: string; flip: number; w?: number }> = ({ front, flip, w = 470 }) => {
  const back = flip > 0.5;
  const sy = Math.abs(Math.cos(flip * Math.PI));
  const col = back ? C.peligro : "#16803A";
  return (
    <g transform={`scale(1 ${Math.max(0.02, sy)})`}>
      <rect x={-w / 2} y={-62} width={w} height={124} rx={18} fill="rgba(255,255,255,0.92)" stroke={col} strokeWidth={10} />
      <rect x={-w / 2 + 12} y={-50} width={w - 24} height={100} rx={10} fill="none" stroke={col} strokeWidth={3} />
      {back ? (
        <text x={0} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize(["INVENTADO"], 66, w - 60)} letterSpacing={4} fill={col}>
          INVENTADO
        </text>
      ) : (
        <g>
          <circle cx={-w / 2 + 62} cy={0} r={32} fill={col} />
          <path d={`M ${-w / 2 + 46} 0 L ${-w / 2 + 58} 12 L ${-w / 2 + 78} -12`} stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" />
          <text x={34} y={14} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([front], 40, w - 140)} fill={col}>
            {front}
          </text>
        </g>
      )}
    </g>
  );
};

// ---------- balanza ----------
/** Balanza dorada. `tilt` en grados (+ baja el platillo derecho). Pesas opcionales en cada platillo. */
export const Balance: React.FC<{ tilt: number; left?: string; right?: string; inL?: number; inR?: number; eq?: number; frame: number }> = ({
  tilt,
  left,
  right,
  inL = 0,
  inR = 0,
  eq = 0,
  frame,
}) => {
  const arm = 330;
  const a = (tilt * Math.PI) / 180;
  const pL = { x: -arm * Math.cos(a), y: -arm * Math.sin(a) };
  const pR = { x: arm * Math.cos(a), y: arm * Math.sin(a) };
  const pan = (p: { x: number; y: number }, label: string | undefined, k: number, col: string, key: string) => (
    <g key={key} transform={`translate(${p.x} ${p.y})`}>
      <line x1={0} y1={0} x2={-110} y2={210} stroke="#B97F12" strokeWidth={5} />
      <line x1={0} y1={0} x2={110} y2={210} stroke="#B97F12" strokeWidth={5} />
      {label && k > 0.01 ? (
        <g transform={`translate(0 ${150 - 260 * (1 - k)}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 3)}>
          <path d="M -120 60 L -100 -50 L 100 -50 L 120 60 Z" fill={col} {...ST} />
          <rect x={-40} y={-74} width={80} height={30} rx={14} fill="none" {...ST} strokeWidth={8} />
          {label.split("\n").map((l, i, arr) => (
            <text key={i} x={0} y={14 + (i - (arr.length - 1) / 2) * 34} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([l], 38, 215)} fill="#FFFFFF">
              {l}
            </text>
          ))}
        </g>
      ) : null}
      <path d="M -150 210 Q 0 290 150 210 Z" fill="#F5C04A" {...ST} />
    </g>
  );
  return (
    <g>
      <path d="M -150 640 L 150 640 L 90 600 L -90 600 Z" fill="#E8A41C" {...ST} />
      <rect x={-22} y={0} width={44} height={605} fill="#F5C04A" {...ST} />
      <g transform={`rotate(${tilt})`}>
        <rect x={-arm - 20} y={-16} width={arm * 2 + 40} height={32} rx={16} fill="#F5C04A" {...ST} />
      </g>
      <circle r={40} fill="#E8A41C" {...ST} />
      {pan(pL, left, inL, "#7B4DFF", "l")}
      {pan(pR, right, inR, "#16803A", "r")}
      {eq > 0.01 ? (
        <g transform={`translate(0 -150) scale(${eq})`}>
          <circle r={86} fill="#FFFFFF" {...ST} />
          <text x={0} y={42} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={130} fill="#E8A41C">
            =
          </text>
          <circle r={98} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.5 + 0.5 * Math.sin(frame / 4)} />
        </g>
      ) : null}
    </g>
  );
};

// ---------- inocencia ----------
export const Polygraph: React.FC<{ frame: number; from: number; beep?: number }> = ({ frame, from, beep = 0 }) => {
  const len = Math.max(0, frame - from) * 9;
  return (
    <g>
      <rect x={-220} y={-150} width={440} height={300} rx={26} fill="#3A3F5C" {...ST} />
      <rect x={-190} y={-110} width={380} height={170} rx={10} fill="#FFFFFF" {...ST} strokeWidth={4} />
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={-190 + i * 64 - (len % 64)} y1={-110} x2={-190 + i * 64 - (len % 64)} y2={60} stroke="#D7DCEC" strokeWidth={2} />
      ))}
      <path d={`M -190 -25 L ${-190 + Math.min(380, len)} -25`} stroke={C.ok} strokeWidth={8} strokeLinecap="round" />
      <circle cx={-190 + Math.min(380, len)} cy={-25} r={10} fill={C.ok} />
      <text x={0} y={118} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={36} fill="#FFFFFF" letterSpacing={2}>
        SIN MENTIRAS
      </text>
      <circle cx={170} cy={-130} r={22} fill={beep > 0.5 ? C.ok : "#1D5E34"} {...ST} strokeWidth={4} />
    </g>
  );
};

export const AngelHalo: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <ellipse cx={0} cy={0} rx={120} ry={30} fill="none" stroke="#FFE27A" strokeWidth={16} />
    <ellipse cx={0} cy={0} rx={120} ry={30} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0.6 + 0.4 * Math.sin(frame / 5)} />
  </g>
);

export const ThoughtBubble: React.FC<{ w?: number; h?: number; children?: React.ReactNode }> = ({ w = 360, h = 240, children }) => (
  <g>
    {[
      [-w / 2 + 30, h / 2 + 80, 18],
      [-w / 2 + 70, h / 2 + 34, 28],
    ].map(([x, y, r]) => (
      <circle key={x} cx={x} cy={y} r={r} fill="#FFFFFF" {...ST} strokeWidth={5} />
    ))}
    <ellipse cx={0} cy={0} rx={w / 2} ry={h / 2} fill="#FFFFFF" {...ST} />
    {children}
  </g>
);

// ---------- el caso real ----------
export const Newspaper: React.FC<{ stamp?: number; year?: number; photo?: React.ReactNode }> = ({ stamp = 0, year = 0, photo }) => (
  <g>
    <rect x={-400} y={-520} width={800} height={1040} fill="#F3EEDF" {...ST} />
    <text x={0} y={-430} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={72} fill={INK}>
      EL DIARIO
    </text>
    <line x1={-360} y1={-400} x2={360} y2={-400} stroke={INK} strokeWidth={4} />
    <line x1={-360} y1={-390} x2={360} y2={-390} stroke={INK} strokeWidth={2} />
    <text x={0} y={-300} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={96} fill={INK}>
      CASO REAL
    </text>
    <rect x={-360} y={-250} width={720} height={420} fill="#C9CCD9" stroke={INK} strokeWidth={4} />
    {photo}
    {Array.from({ length: 6 }, (_, i) => (
      <rect key={i} x={-360} y={210 + i * 40} width={i % 3 === 2 ? 480 : 720} height={16} rx={8} fill="#B9B3A2" />
    ))}
    {year > 0.01 ? (
      <g transform={`translate(-200 320) rotate(-6) scale(${year})`}>
        <rect x={-130} y={-60} width={260} height={110} rx={14} fill={INK} />
        <text x={0} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={84} fill="#FFE27A">
          2023
        </text>
      </g>
    ) : null}
    {stamp > 0.01 ? (
      <g transform={`translate(170 330) rotate(8) scale(${lerp(1.6, 1, stamp)})`} opacity={clamp01(stamp * 2)}>
        <rect x={-170} y={-56} width={340} height={112} rx={14} fill="rgba(255,255,255,0.85)" stroke={C.peligro} strokeWidth={10} />
        <text x={0} y={24} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={66} fill={C.peligro}>
          EN SERIO
        </text>
      </g>
    ) : null}
  </g>
);

const BUILDINGS = Array.from({ length: 14 }, (_, i) => ({
  x: -560 + i * 82,
  w: 70 + random(`bld-w-${i}`) * 40,
  h: 260 + random(`bld-h-${i}`) * 420,
}));

/** Skyline de Nueva York al atardecer con la Estatua de la Libertad. Origen: la línea del agua. */
export const Skyline: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {BUILDINGS.map((b, i) => (
      <g key={i}>
        <rect x={b.x} y={-b.h} width={b.w} height={b.h} fill="#2A1846" stroke="#1C1030" strokeWidth={4} />
        {Array.from({ length: Math.floor(b.h / 60) }, (_, r) =>
          [0, 1].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={b.x + 14 + c * (b.w / 2 - 6)}
              y={-b.h + 24 + r * 60}
              width={14}
              height={22}
              fill="#FFD36E"
              opacity={random(`win-${i}-${r}-${c}`) > 0.45 ? 0.85 + 0.15 * Math.sin(frame / 9 + i + r) : 0.15}
            />
          )),
        )}
      </g>
    ))}
    {/* Empire State */}
    <g transform="translate(60 0)">
      <rect x={-60} y={-560} width={120} height={560} fill="#2A1846" stroke="#1C1030" strokeWidth={4} />
      <rect x={-36} y={-680} width={72} height={120} fill="#2A1846" stroke="#1C1030" strokeWidth={4} />
      <rect x={-16} y={-760} width={32} height={80} fill="#2A1846" />
      <line x1={0} y1={-760} x2={0} y2={-860} stroke="#2A1846" strokeWidth={8} />
    </g>
    <rect x={-700} y={0} width={1400} height={500} fill="#3B2A78" />
    {Array.from({ length: 8 }, (_, i) => (
      <rect key={i} x={-600 + ((i * 170 + frame * 2) % 1300)} y={40 + i * 50} width={120} height={6} rx={3} fill="#FFD36E" opacity={0.4} />
    ))}
    {/* Estatua de la Libertad */}
    <g transform="translate(-330 0)" fill="#3FA58A" stroke="#1C3A33" strokeWidth={5} strokeLinejoin="round">
      <path d="M -70 0 L -50 -110 L 50 -110 L 70 0 Z" fill="#6E5A8C" stroke="#2A1846" />
      <path d="M -36 -110 L -24 -300 L 24 -300 L 36 -110 Z" />
      <circle cx={0} cy={-326} r={26} />
      {[-40, -20, 0, 20, 40].map((a) => (
        <path key={a} d="M 0 -346 L -6 -372 L 6 -372 Z" transform={`rotate(${a} 0 -330)`} />
      ))}
      <path d="M 18 -290 L 50 -400 L 66 -396 L 36 -286 Z" />
      <path d="M 46 -400 L 70 -400 L 66 -420 L 50 -420 Z" />
      <path d="M 58 -420 C 46 -446 58 -462 58 -470 C 70 -456 74 -440 58 -420 Z" fill="#FFB547" stroke="#C96F10" opacity={0.85 + 0.15 * Math.sin(frame / 3)} />
    </g>
  </g>
);

/** Persona del tribunal (estilo de la serie, personajes genéricos). Origen en la base del cuello. */
export const Person: React.FC<{
  kind: "juez" | "abogado1" | "abogado2";
  frame: number;
  panic?: number; // 0 … 1: ojos grandes, sudor
  frown?: number; // 0 … 1: cejo fruncido
  arm?: number; // ángulo del brazo derecho (el del mazo para el juez)
  prop?: React.ReactNode; // en la mano derecha
}> = ({ kind, frame, panic = 0, frown = 0, arm = 0, prop }) => {
  const suit = kind === "juez" ? "#1C1A24" : kind === "abogado1" ? "#3A4E8C" : "#5B5F6E";
  const hair = kind === "juez" ? "#E9ECF4" : kind === "abogado1" ? "#3B2416" : "#8C5A2E";
  const blink = (frame + (kind === "abogado1" ? 40 : kind === "abogado2" ? 90 : 0)) % 110 < 4;
  const lid = blink ? 1 : kind === "juez" ? 0.3 + 0.25 * frown : 0.1 * (1 - panic);
  const er = 34 + 8 * panic;
  return (
    <g>
      {/* cuerpo */}
      <path d="M -170 380 C -170 120 -130 20 0 10 C 130 20 170 120 170 380 Z" fill={suit} {...ST} />
      {kind === "juez" ? (
        <path d="M -40 14 L 0 90 L 40 14 Z" fill="#FFFFFF" {...ST} strokeWidth={4} />
      ) : (
        <g>
          <path d="M -46 14 L 0 120 L 46 14 Z" fill="#FFFFFF" {...ST} strokeWidth={4} />
          <path d="M -12 30 L 12 30 L 18 110 L 0 130 L -18 110 Z" fill={kind === "abogado1" ? "#C8102E" : "#F5C04A"} {...ST} strokeWidth={4} />
        </g>
      )}
      {/* brazo derecho (de la pantalla) */}
      <g transform={`translate(140 80) rotate(${arm})`}>
        <path d="M -24 0 L 24 0 L 22 170 L -22 170 Z" fill={suit} {...ST} />
        <circle cx={0} cy={186} r={30} fill={K.piel} {...ST} />
        {prop ? <g transform="translate(0 186)">{prop}</g> : null}
      </g>
      {/* cabeza */}
      <path d="M -10 20 L -10 -40 L 30 -40 L 30 20 Z" fill={K.piel} {...ST} />
      <g transform={`translate(0 -150) rotate(${2 * Math.sin(frame / 20)})`}>
        <path d="M -100 -20 C -110 -140 100 -150 104 -20 L 96 90 C 60 130 -60 130 -96 90 Z" fill={K.piel} {...ST} />
        {kind === "juez" ? (
          <path d="M -110 -30 C -150 -80 -120 -150 -60 -150 C -20 -190 40 -190 70 -150 C 130 -150 150 -80 110 -30 C 130 -90 90 -120 60 -110 C 20 -140 -30 -140 -60 -110 C -100 -120 -130 -80 -110 -30 Z" fill={hair} {...ST} />
        ) : (
          <path d={kind === "abogado1" ? "M -104 -10 C -120 -130 -40 -170 20 -160 C 90 -150 120 -100 104 -10 C 90 -70 40 -110 -20 -100 C -60 -94 -90 -60 -104 -10 Z" : "M -104 -30 C -100 -120 -40 -150 10 -150 C 70 -150 110 -110 104 -30 L 80 -70 L 40 -90 L -20 -80 L -70 -70 Z"} fill={hair} {...ST} />
        )}
        {[-36, 36].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={-12} r={er} fill="#FFFFFF" {...ST} strokeWidth={5} />
            <circle cx={x + 4 * Math.sin(frame / 30)} cy={-8} r={6 * (1 - 0.3 * panic)} fill={INK} />
            {lid > 0.05 ? (
              <path
                d={`M ${x - er} -12 A ${er} ${er} 0 0 1 ${x + er} -12 L ${x + er} ${-12 - er + 2 * er * lid} L ${x - er} ${-12 - er + 2 * er * lid + (i ? -1 : 1) * 14 * frown} Z`}
                fill={K.piel}
                {...ST}
                strokeWidth={5}
              />
            ) : null}
          </g>
        ))}
        {kind === "abogado2" ? (
          <g fill="none" stroke={INK} strokeWidth={5}>
            <circle cx={-36} cy={-12} r={er + 6} />
            <circle cx={36} cy={-12} r={er + 6} />
          </g>
        ) : null}
        <path d={`M -20 ${30} Q 0 46 20 30`} fill="none" stroke={INK} strokeWidth={5} />
        <path
          d={panic > 0.3 ? "M -30 70 Q 0 50 30 70 Q 0 100 -30 70 Z" : frown > 0.3 ? "M -34 78 Q 0 62 34 78" : "M -30 70 Q 0 86 30 70"}
          fill={panic > 0.3 ? "#4A1520" : "none"}
          stroke={INK}
          strokeWidth={6}
          strokeLinecap="round"
        />
        {panic > 0.3 ? (
          <path
            transform={`translate(96 ${-60 + ((frame * 3) % 60)})`}
            d="M 0 -18 C 10 -4 14 4 14 10 A 14 14 0 0 1 -14 10 C -14 4 -10 -4 0 -18 Z"
            fill="#9FE3FF"
            stroke={INK}
            strokeWidth={3}
          />
        ) : null}
      </g>
    </g>
  );
};

export const Gavel: React.FC = () => (
  <g transform="rotate(-30)">
    <rect x={-10} y={-180} width={20} height={190} rx={8} fill="#8C5A2E" {...ST} strokeWidth={5} />
    <rect x={-70} y={-240} width={140} height={70} rx={18} fill="#A86B37" {...ST} />
    <rect x={-80} y={-232} width={18} height={54} rx={6} fill="#F5C04A" {...ST} strokeWidth={4} />
    <rect x={62} y={-232} width={18} height={54} rx={6} fill="#F5C04A" {...ST} strokeWidth={4} />
  </g>
);

/** Expediente con su número; `smoke` 0 … 1 lo disuelve en humo de abajo hacia arriba. */
export const CaseFile: React.FC<{ n: number; smoke: number; id: string }> = ({ n, smoke, id }) => (
  <g>
    <clipPath id={`${id}-dis`}>
      <rect x={-140} y={-110 - 240 * 0} width={280} height={220 * (1 - smoke)} />
    </clipPath>
    <g clipPath={`url(#${id}-dis)`}>
      <rect x={-130} y={-100} width={260} height={200} rx={12} fill="#F3EEDF" {...ST} />
      <rect x={-130} y={-100} width={110} height={30} rx={8} fill="#E9B23A" {...ST} strokeWidth={4} />
      <text x={0} y={10} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={40} fill={INK}>
        CASO {n}
      </text>
      {[40, 66].map((y) => (
        <rect key={y} x={-90} y={y} width={180} height={10} rx={5} fill="#C9C2AE" />
      ))}
      <circle cx={92} cy={-56} r={24} fill="#F5C04A" {...ST} strokeWidth={4} />
    </g>
    {smoke > 0.01 && smoke < 1
      ? Array.from({ length: 8 }, (_, i) => (
          <circle
            key={i}
            cx={-110 + i * 32 + 20 * Math.sin(smoke * 6 + i)}
            cy={110 - 220 * smoke - 60 * smoke * random(`smk-${id}-${i}`)}
            r={28 + 40 * smoke}
            fill="#E9ECF4"
            opacity={0.85 * (1 - smoke)}
          />
        ))
      : null}
  </g>
);

export const FineTicket: React.FC<{ amount: number }> = ({ amount }) => (
  <g>
    <path d="M -300 -190 L 300 -190 L 300 190 L -300 190 Z" fill="#FFFFFF" {...ST} />
    {Array.from({ length: 12 }, (_, i) => (
      <circle key={i} cx={-275 + i * 50} cy={190} r={12} fill="#8C3B2A" />
    ))}
    <rect x={-300} y={-190} width={600} height={90} fill={C.peligro} {...ST} />
    <text x={0} y={-128} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={64} fill="#FFFFFF" letterSpacing={6}>
      MULTA
    </text>
    <text x={0} y={70} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={110} fill={INK}>
      USD {Math.round(amount).toLocaleString("es-AR")}
    </text>
  </g>
);

export const Bill: React.FC = () => (
  <g>
    <rect x={-70} y={-34} width={140} height={68} rx={8} fill="#7BC77E" stroke="#2E6B35" strokeWidth={4} />
    <circle r={20} fill="#A8DDA9" stroke="#2E6B35" strokeWidth={3} />
    <text x={0} y={9} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={26} fill="#2E6B35">
      $
    </text>
  </g>
);

// ---------- "¿estás seguro?" ----------
/** Cartel de doble cara en un palo: gira sobre el eje vertical. */
export const DoubleSign: React.FC<{ flip: number; front: string[]; back: string[] }> = ({ flip, front, back }) => {
  const isBack = flip > 0.5;
  const sx = Math.max(0.03, Math.abs(Math.cos(flip * Math.PI)));
  const lines = isBack ? back : front;
  const col = isBack ? C.peligro : "#16803A";
  return (
    <g>
      <rect x={-12} y={0} width={24} height={300} fill="#8C5A2E" {...ST} strokeWidth={5} />
      <g transform={`scale(${sx} 1)`}>
        <rect x={-260} y={-190} width={520} height={210} rx={24} fill="#FFFFFF" stroke={col} strokeWidth={12} />
        {lines.map((l, i) => (
          <text key={i} x={0} y={-112 + i * 76} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([l], i ? 56 : 46, 470)} fill={i ? col : INK}>
            {l}
          </text>
        ))}
      </g>
    </g>
  );
};

/** Burbuja de chat (en coordenadas de escena): `me` = del usuario, a la derecha. */
export const ChatBubble: React.FC<{ text: string; me?: boolean; size?: number; maxW?: number }> = ({ text, me = false, size = 48, maxW = 720 }) => {
  const fs = fitSize([text], size, maxW - 60, 700);
  const w = Math.min(maxW, text.length * fs * 0.56 + 70);
  return (
    <g>
      <rect x={me ? -w : 0} y={-fs * 0.95} width={w} height={fs * 1.9} rx={fs * 0.9} fill={me ? "#303030" : "#FFFFFF"} stroke={me ? "none" : INK} strokeWidth={me ? 0 : 5} />
      <text x={me ? -w / 2 : w / 2} y={fs * 0.35} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={fs} fill={me ? "#ECECEC" : INK}>
        {text}
      </text>
    </g>
  );
};

// ---------- checklist ----------
const IconHash: React.FC = () => (
  <text x={0} y={22} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={62} fill="#FFFFFF">
    #%
  </text>
);
const IconQuote: React.FC = () => (
  <text x={0} y={46} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={120} fill="#FFFFFF">
    “
  </text>
);
const IconLaw: React.FC = () => (
  <g fill="none" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round">
    <line x1={0} y1={-34} x2={0} y2={30} />
    <line x1={-34} y1={-24} x2={34} y2={-24} />
    <path d="M -34 -24 L -46 6 L -22 6 Z M 34 -24 L 22 6 L 46 6 Z" fill="#FFFFFF" />
    <line x1={-20} y1={32} x2={20} y2={32} />
  </g>
);

export const CHECK_ROWS = [
  { t: "Números exactos", Icon: IconHash, c: "#3A5BEA" },
  { t: "Nombres y citas", Icon: IconQuote, c: "#C2347A" },
  { t: "Leyes y estudios", Icon: IconLaw, c: "#16803A" },
];

/** Tarjeta "Desconfiá de:" con 3 renglones (rows: aparición 0 … 1 de cada uno; nums: los 1-2-3). */
export const Checklist: React.FC<{ nums: number; rows: number[]; frame: number }> = ({ nums, rows, frame }) => (
  <g>
    <rect x={-440 + 12} y={-430 + 18} width={880} height={860} rx={44} fill="#000000" opacity={0.22} />
    <rect x={-440} y={-430} width={880} height={860} rx={44} fill="#FFFFFF" {...ST} strokeWidth={8} />
    <g transform="translate(-330 -330)">
      <line x1={0} y1={-50} x2={0} y2={60} stroke={INK} strokeWidth={8} />
      <path d={`M 0 -50 L 70 ${-38 + 6 * Math.sin(frame / 4)} L 0 -20 Z`} fill={C.peligro} {...ST} strokeWidth={4} />
    </g>
    <text x={-250} y={-300} fontFamily={SANS} fontWeight={900} fontSize={76} fill={INK}>
      Desconfiá de:
    </text>
    {CHECK_ROWS.map((r, i) => {
      const k = rows[i];
      const y = -150 + i * 200;
      return (
        <g key={r.t} transform={`translate(0 ${y})`}>
          <g opacity={clamp01(nums * 3 - i)}>
            <rect x={-380} y={-74} width={760} height={148} rx={30} fill="#F3F4FA" />
            <text x={-340} y={24} fontFamily={MONO} fontWeight={700} fontSize={64} fill="#C9CCD9">
              {i + 1}
            </text>
          </g>
          {k > 0.01 ? (
            <g opacity={clamp01(k * 2)} transform={`translate(${-40 * (1 - k)} 0)`}>
              <g transform={`translate(-210 0) scale(${0.6 + 0.4 * k})`}>
                <circle r={58} fill={r.c} {...ST} strokeWidth={5} />
                <r.Icon />
              </g>
              <text x={-120} y={20} fontFamily={SANS} fontWeight={900} fontSize={fitSize([r.t], 58, 440)} fill={INK}>
                {r.t}
              </text>
              <g transform={`translate(330 -10) rotate(${8 * Math.sin(frame / 5 + i)})`}>
                <line x1={0} y1={-30} x2={0} y2={40} stroke={INK} strokeWidth={6} />
                <path d="M 0 -30 L 44 -20 L 0 -6 Z" fill={C.peligro} stroke={INK} strokeWidth={3} />
              </g>
            </g>
          ) : null}
        </g>
      );
    })}
  </g>
);

/** Pantalla del navegador "404" (coordenadas de la pantalla del celular, 276 × 596). */
export const Browser404: React.FC<{ k: number }> = ({ k }) => (
  <g opacity={k}>
    <rect x={-138} y={-298} width={276} height={596} fill="#FFFFFF" />
    <rect x={-138} y={-298} width={276} height={70} fill="#ECEEF5" />
    <rect x={-120} y={-262} width={240} height={30} rx={15} fill="#FFFFFF" stroke="#C9CCD9" strokeWidth={2} />
    <text x={-104} y={-241} fontFamily={SANS} fontWeight={600} fontSize={14} fill="#7D8299">
      🔒 …
    </text>
    <text x={0} y={-40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={90} fill={C.peligro}>
      404
    </text>
    <text x={0} y={20} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill={INK}>
      Esta página
    </text>
    <text x={0} y={50} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill={INK}>
      no existe
    </text>
    <circle cx={0} cy={140} r={44} fill="#F3F4FA" stroke="#C9CCD9" strokeWidth={3} />
    <path d="M -18 -6 Q 0 -24 18 -6 M -16 18 L 16 18" transform="translate(0 140)" stroke="#7D8299" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
