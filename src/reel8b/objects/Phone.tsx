import React from "react";
import { useCurrentFrame } from "remotion";
import { HOMERO as K, SANS } from "../tokens";

// El celular de Homero: el objeto narrativo. Detalle de asset protagonista: borde de luz,
// reflejo del vidrio y pantalla viva.
export const PHONE = { w: 300, h: 620, r: 46, screen: { w: 276, h: 596, r: 36 } };

const ST = { stroke: K.contorno, strokeWidth: 6, strokeLinejoin: "round" as const };

export const LockScreen: React.FC<{ id: string; unlocked?: number; wallpaper?: number; content?: number }> = ({
  id,
  unlocked = 0,
  wallpaper = 1,
  content = 1,
}) => {
  const frame = useCurrentFrame();
  const { w, h } = PHONE.screen;
  const drift = Math.sin(frame / 40) * 14;
  return (
    <g>
      <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E2560" />
        <stop offset="100%" stopColor="#3A1C5C" />
      </linearGradient>
      <radialGradient id={`${id}-blob`}>
        <stop offset="0%" stopColor="#6C5CFF" stopOpacity={0.55} />
        <stop offset="100%" stopColor="#6C5CFF" stopOpacity={0} />
      </radialGradient>
      <g opacity={wallpaper}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={`url(#${id}-wall)`} />
        <circle cx={-60 + drift} cy={140} r={170} fill={`url(#${id}-blob)`} />
        <circle cx={90 - drift} cy={-60} r={130} fill={`url(#${id}-blob)`} opacity={0.7} />
      </g>
      {/* Todo va centrado en vertical: cuando la cámara entra a la pantalla, lo de arriba y lo de
          abajo queda fuera de cuadro, y la franja del HUD y los subtítulos (y local −190 a −130)
          tiene que quedar libre. */}
      <g opacity={content}>
      <g transform={`translate(0 -112)`} opacity={0.9}>
        <path
          d="M -11 -2 L -11 -12 C -11 -26 11 -26 11 -12 L 11 -2"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={4.5}
          strokeLinecap="round"
          transform={`translate(0 ${-unlocked * 8}) rotate(${-unlocked * 28} -11 -2)`}
        />
        <rect x={-16} y={-4} width={32} height={24} rx={6} fill="#FFFFFF" />
      </g>
      <text
        x={0}
        y={40}
        textAnchor="middle"
        fontFamily={SANS}
        fontWeight={700}
        fontSize={96}
        letterSpacing={-3}
        fill="#FFFFFF"
      >
        7:02
      </text>
      <text
        x={0}
        y={-64}
        textAnchor="middle"
        fontFamily={SANS}
        fontWeight={500}
        fontSize={20}
        fill="#FFFFFF"
        opacity={0.75}
      >
        martes
      </text>
      <rect x={-50} y={h / 2 - 22} width={100} height={6} rx={3} fill="#FFFFFF" opacity={0.6} />
      </g>
    </g>
  );
};

export const Phone: React.FC<{
  id: string;
  x: number;
  y: number;
  scale: number;
  rotate?: number;
  flat?: number; // 1 de frente … 0,4 acostado sobre una mesa
  screenOn: number;
  glow?: number;
  fingers?: number; // 0 … 1: dedos de Homero en los bordes
  children?: React.ReactNode; // contenido de la pantalla
}> = ({ id, x, y, scale, rotate = 0, flat = 1, screenOn, glow = 0, fingers = 0, children }) => {
  const { w, h, r, screen } = PHONE;
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${flat}) rotate(${rotate}) scale(${scale})`}>
      <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation={40} />
      </filter>
      {glow > 0 ? (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={r}
          fill="#8C8CFF"
          opacity={0.55 * glow * screenOn}
          filter={`url(#${id}-blur)`}
        />
      ) : null}
      <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.75} />
        <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.08} />
        <stop offset="100%" stopColor="#9FA8FF" stopOpacity={0.45} />
      </linearGradient>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill="#14151C" {...ST} />
      <rect
        x={-w / 2 + 5}
        y={-h / 2 + 5}
        width={w - 10}
        height={h - 10}
        rx={r - 5}
        fill="none"
        stroke={`url(#${id}-rim)`}
        strokeWidth={4}
      />
      <clipPath id={`${id}-screen`}>
        <rect x={-screen.w / 2} y={-screen.h / 2} width={screen.w} height={screen.h} rx={screen.r} />
      </clipPath>
      <rect x={-screen.w / 2} y={-screen.h / 2} width={screen.w} height={screen.h} rx={screen.r} fill="#050609" />
      <g clipPath={`url(#${id}-screen)`} opacity={screenOn}>
        {children}
      </g>
      {/* isla de la cámara y reflejo del vidrio */}
      <rect x={-42} y={-h / 2 + 22} width={84} height={24} rx={12} fill="#000000" />
      <path
        d={`M ${-screen.w / 2} ${-screen.h / 2 + 120} L ${screen.w / 2} ${-screen.h / 2 - 40} L ${screen.w / 2} ${-screen.h / 2 + 30} L ${-screen.w / 2} ${-screen.h / 2 + 190} Z`}
        fill="#FFFFFF"
        opacity={0.05}
        clipPath={`url(#${id}-screen)`}
      />
      {fingers > 0.01 ? (
        <g fill={K.piel} {...ST} opacity={fingers}>
          {[70, 140, 210].map((fy) => (
            <path key={fy} d={`M ${w / 2 - 16} ${fy - 26} C ${w / 2 + 34} ${fy - 30} ${w / 2 + 34} ${fy + 30} ${w / 2 - 16} ${fy + 26} Z`} />
          ))}
          <path d={`M ${-w / 2 + 18} 40 C ${-w / 2 - 40} 30 ${-w / 2 - 40} 120 ${-w / 2 + 18} 116 C ${-w / 2 + 50} 110 ${-w / 2 + 50} 46 ${-w / 2 + 18} 40 Z`} />
        </g>
      ) : null}
    </g>
  );
};
