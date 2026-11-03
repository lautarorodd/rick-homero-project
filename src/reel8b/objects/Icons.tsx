import React from "react";
import { C, HOMERO as K } from "../tokens";

// Íconos genéricos (sin logos de marcas), centrados en el origen, ~120 px de lado.
const S = {
  fill: "none",
  stroke: C.ia,
  strokeWidth: 8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconFace: React.FC = () => (
  <g {...S}>
    <circle cx={0} cy={0} r={46} />
    <circle cx={-16} cy={-10} r={4} fill={C.ia} />
    <circle cx={16} cy={-10} r={4} fill={C.ia} />
    <path d="M -18 16 Q 0 30 18 16" />
  </g>
);

export const IconKeyboard: React.FC = () => (
  <g {...S}>
    <rect x={-56} y={-34} width={112} height={68} rx={12} />
    {[-30, -10, 10, 30].map((x) => (
      <circle key={x} cx={x} cy={-12} r={3} fill={C.ia} stroke="none" />
    ))}
    <path d="M -26 14 L 26 14" />
  </g>
);

export const IconShield: React.FC = () => (
  <g {...S}>
    <path d="M 0 -50 L 42 -32 L 42 2 C 42 30 20 46 0 54 C -20 46 -42 30 -42 2 L -42 -32 Z" />
    <path d="M -16 2 L -4 14 L 18 -12" />
  </g>
);

export const IconPin: React.FC = () => (
  <g {...S}>
    <path d="M 0 52 C -30 18 -40 2 -40 -14 C -40 -38 -22 -52 0 -52 C 22 -52 40 -38 40 -14 C 40 2 30 18 0 52 Z" />
    <circle cx={0} cy={-14} r={12} />
  </g>
);

export const IconNote: React.FC = () => (
  <g {...S}>
    <path d="M -12 30 L -12 -40 L 34 -50 L 34 20" />
    <circle cx={-26} cy={30} r={14} fill={C.ia} />
    <circle cx={20} cy={20} r={14} fill={C.ia} />
  </g>
);

export const IconCard: React.FC = () => (
  <g {...S}>
    <rect x={-54} y={-36} width={108} height={72} rx={12} />
    <path d="M -54 -12 L 54 -12" />
    <path d="M -36 16 L -10 16" />
  </g>
);

export const IconCamera: React.FC = () => (
  <g {...S}>
    <path d="M -54 -24 L -26 -24 L -16 -40 L 16 -40 L 26 -24 L 54 -24 L 54 38 L -54 38 Z" />
    <circle cx={0} cy={6} r={20} />
  </g>
);

export const Padlock: React.FC<{ open?: number; color?: string; body?: string }> = ({
  open = 0,
  color = C.ia,
  body,
}) => (
  <g>
    <path
      d="M -26 -6 L -26 -30 C -26 -64 26 -64 26 -30 L 26 -6"
      fill="none"
      stroke={color}
      strokeWidth={13}
      strokeLinecap="round"
      transform={`translate(0 ${-open * 16}) rotate(${-open * 32} -26 -6)`}
    />
    <rect x={-44} y={-12} width={88} height={70} rx={14} fill={body ?? color} />
    <circle cx={0} cy={16} r={9} fill={C.fondo} />
    <rect x={-4} y={18} width={8} height={18} rx={4} fill={C.fondo} />
  </g>
);

export const IconMouth: React.FC<{ open: number }> = ({ open }) => (
  <g>
    <path
      d={`M -64 0 C -30 -26 30 -26 64 0 C 30 ${10 + open * 50} -30 ${10 + open * 50} -64 0 Z`}
      fill="#E2627A"
      stroke={C.ia}
      strokeWidth={8}
      strokeLinejoin="round"
    />
    <path d={`M -50 ${2 + open * 6} C -20 ${8 + open * 20} 20 ${8 + open * 20} 50 ${2 + open * 6}`} fill="none" stroke={K.boca} strokeWidth={open * 30} strokeLinecap="round" opacity={0.85} />
  </g>
);

export const IconEar: React.FC = () => (
  <g {...S}>
    <path d="M -20 46 C -40 46 -44 26 -40 10 C -50 -14 -40 -52 0 -54 C 34 -56 48 -28 40 -4 C 34 14 18 18 14 32 C 10 46 0 50 -20 46 Z" />
    <path d="M -14 -6 C -14 -26 16 -30 18 -10 C 20 4 2 6 2 18" />
  </g>
);

export const IconGraph: React.FC<{ progress?: number }> = ({ progress = 1 }) => {
  const pts = [
    [-56, 30],
    [-30, 14],
    [-8, 22],
    [16, -6],
    [36, -18],
  ];
  const fut = [
    [36, -18],
    [56, -44],
  ];
  return (
    <g>
      <path d="M -66 -54 L -66 46 L 66 46" fill="none" stroke={C.textoOff} strokeWidth={6} strokeLinecap="round" />
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={C.ia}
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={200}
        strokeDashoffset={200 * (1 - Math.min(1, progress * 1.6))}
      />
      <polyline
        points={fut.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={C.ia}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray="4 12"
        opacity={Math.max(0, progress * 2 - 1)}
      />
    </g>
  );
};

export const IconPencil: React.FC = () => (
  <g>
    <path d="M -10 -62 L 10 -62 L 10 34 L 0 58 L -10 34 Z" fill="#FFC53D" stroke={K.contorno} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -10 34 L 10 34 L 0 58 Z" fill="#F4D7A8" stroke={K.contorno} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -4 50 L 4 50 L 0 58 Z" fill={K.contorno} />
    <rect x={-10} y={-74} width={20} height={14} rx={4} fill="#FF7AB6" stroke={K.contorno} strokeWidth={6} />
  </g>
);

/** La rosquilla de Homero: rosada, con granas que después se vuelven el enjambre. */
export const SPRINKLES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + (i % 2) * 0.3;
  const r = 48 + (i % 3) * 9;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, rot: (i * 47) % 180, c: ["#FFF4DC", "#38D6E8", "#FFC53D", "#34D058"][i % 4] };
});

export const Donut: React.FC<{ sprinkles?: number }> = ({ sprinkles = 1 }) => (
  <g>
    <circle cx={0} cy={0} r={86} fill="#E8B06A" stroke={K.contorno} strokeWidth={7} />
    <path
      d="M -78 -8 C -74 -60 -30 -80 6 -78 C 52 -76 84 -42 80 2 C 84 24 66 20 62 40 C 54 70 24 66 6 76 C -24 86 -40 64 -56 58 C -84 48 -70 22 -78 -8 Z"
      fill="#FF7AB6"
      stroke={K.contorno}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    <circle cx={0} cy={0} r={28} fill={C.fondo} stroke={K.contorno} strokeWidth={7} />
    {SPRINKLES.map((s, i) => (
      <rect
        key={i}
        x={s.x - 8}
        y={s.y - 3}
        width={16}
        height={6}
        rx={3}
        fill={s.c}
        opacity={sprinkles}
        transform={`rotate(${s.rot} ${s.x} ${s.y})`}
      />
    ))}
  </g>
);

export const IconPlane: React.FC<{ color?: string }> = ({ color = C.ia }) => (
  <g fill="none" stroke={color} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round">
    <path d="M -56 -6 L 58 -54 L 30 54 L 4 18 Z" />
    <path d="M 4 18 L 58 -54" />
    <path d="M 4 18 L 0 46 L 16 30" />
  </g>
);

export const IconCheck: React.FC<{ color?: string }> = ({ color = "#FFFFFF" }) => (
  <path d="M -14 0 L -4 10 L 16 -12" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
);

export const ICONS_SEVEN = [IconFace, IconKeyboard, IconShield, IconPin, IconNote, IconCard, IconCamera];
