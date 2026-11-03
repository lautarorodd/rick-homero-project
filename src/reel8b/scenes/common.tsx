import React from "react";
import { useCurrentFrame } from "remotion";
import { Badge } from "../objects/Brand";
import { HandShape, RoboArm, drumming } from "../objects/RoboArm";
import { Homero, HomeroPose, Placement } from "../rig/Homero";
import { C, SANS } from "../tokens";

/** Homero con el gafete de ChatGPT colgado del pecho (el gafete se balancea solo). */
export const HomeroB: React.FC<{
  id: string;
  place: Placement;
  pose: HomeroPose;
  headOverlay?: React.ReactNode;
  propL?: React.ReactNode;
  propR?: React.ReactNode;
  badgeAlarm?: number;
  badgeGlow?: number;
}> = ({ id, place, pose, headOverlay, propL, propR, badgeAlarm = 0, badgeGlow = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <Homero id={id} place={place} pose={pose} headOverlay={headOverlay} propL={propL} propR={propR} />
      <g transform={`translate(${place.x + 56 * place.scale} ${place.y + 70 * place.scale}) rotate(${3 * Math.sin(frame / 9) + pose.bodyTilt}) scale(${0.625 * place.scale})`}>
        <Badge alarm={badgeAlarm > 0.5 && Math.floor(frame / 3) % 2 === 0 ? 1 : 0} glow={badgeGlow} />
      </g>
    </g>
  );
};

/** Etiqueta técnica con línea guía (sistema visual): mayúsculas chicas apuntando a un objeto. */
export const Tag: React.FC<{ text: string; x: number; y: number; tx: number; ty: number; k: number; color?: string }> = ({ text, x, y, tx, ty, k, color = "#FFFFFF" }) =>
  k > 0.01 ? (
    <g opacity={Math.min(1, k * 1.5)}>
      <line x1={x} y1={y} x2={x + (tx - x) * k} y2={y + (ty - y) * k} stroke={color} strokeWidth={3} />
      <circle cx={tx} cy={ty} r={7 * k} fill={color} />
      <g transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * k})`}>
        <rect x={-text.length * 11 - 22} y={-26} width={text.length * 22 + 44} height={52} rx={26} fill="rgba(20,24,51,0.9)" stroke={color} strokeWidth={2} />
        <text x={0} y={9} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={26} letterSpacing={3} fill={color}>
          {text}
        </text>
      </g>
    </g>
  ) : null;

/** Signo "?" que rebota sobre una cabeza. */
export const QMark: React.FC<{ k: number; color?: string }> = ({ k, color = C.curioso }) =>
  k > 0.01 ? (
    <g transform={`scale(${k})`}>
      <text x={0} y={0} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={120} fill={color} stroke="#1C1A24" strokeWidth={6} paintOrder="stroke">
        ?
      </text>
    </g>
  ) : null;

/** Gota de sudor. */
export const Sweat: React.FC<{ k: number }> = ({ k }) =>
  k > 0.01 ? (
    <path
      transform={`scale(${k})`}
      d="M 0 -30 C 16 -8 22 6 22 16 A 22 22 0 0 1 -22 16 C -22 6 -16 -8 0 -30 Z"
      fill="#9FE3FF"
      stroke="#1C1A24"
      strokeWidth={4}
    />
  ) : null;

// ---------- reel 7: Homero con manos de agente ----------
/** Un brazo robótico de Homero: destino de la muñeca en escena y cómo está la mano. */
export type RoboSide = {
  target: { x: number; y: number };
  hand?: HandShape;
  handDeg?: number;
  grow?: number;
  tap?: number;
  glow?: number;
  bend?: 1 | -1;
  prop?: React.ReactNode;
};

/** Dónde nace cada brazo robótico (coordenadas del cuerpo de Homero): encima de cada hombro. */
export const ROBO_HUB = { x: 206, y: 24 };
export const roboBase = (place: Placement, side: "L" | "R") => ({
  x: place.x + (side === "L" ? -ROBO_HUB.x : ROBO_HUB.x) * place.scale,
  y: place.y + ROBO_HUB.y * place.scale,
});
export const roboScale = (place: Placement) => place.scale * 0.92;

/** Homero con el gafete y, si los tiene, sus dos brazos robóticos (dibujados por delante). */
export const HomeroRobo: React.FC<React.ComponentProps<typeof HomeroB> & { L?: RoboSide; R?: RoboSide }> = ({ L, R, ...rest }) => {
  const frame = useCurrentFrame();
  const arm = (side: "L" | "R", a?: RoboSide) =>
    a ? (
      <RoboArm
        id={`${rest.id}-robo${side}`}
        base={roboBase(rest.place, side)}
        target={a.target}
        s={roboScale(rest.place)}
        bend={a.bend ?? (side === "L" ? 1 : -1)}
        handDeg={a.handDeg}
        hand={a.hand ?? drumming(frame + (side === "L" ? 0 : 9))}
        flip={side === "L"}
        grow={a.grow ?? 1}
        tap={a.tap ?? 0}
        glow={a.glow ?? 0}
        frame={frame}
        prop={a.prop}
      />
    ) : null;
  return (
    <g>
      <HomeroB {...rest} />
      {arm("L", L)}
      {arm("R", R)}
    </g>
  );
};
