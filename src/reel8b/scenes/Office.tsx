import React from "react";
import { useCurrentFrame } from "remotion";
import { OFFICE } from "../layout";
import { BossDoor, Desk, Mug, Plant } from "../objects/Props";
import { Calendar, ProjectorSlide, WallClock } from "../objects/R3";
import { Sofi, SofiArm, SofiMood } from "../objects/Sofi";
import { HOMERO as K } from "../tokens";

const ST = { stroke: K.contorno, strokeWidth: 7, strokeLinejoin: "round" as const };

/** Pulgar que tipea (coordenadas de escena). */
export const Thumb: React.FC<{ x: number; y: number; press: number; scale?: number }> = ({ x, y, press, scale = 0.6 }) => (
  <g transform={`translate(${x} ${y}) rotate(-24) scale(${scale * (1 - 0.05 * press)})`}>
    <path d="M -58 214 C -64 84 -42 4 0 0 C 42 4 64 84 58 214 L 64 560 L -64 560 Z" fill={K.piel} {...ST} />
    <path d="M -32 70 C -30 26 30 26 32 70 C 32 102 -32 102 -32 70 Z" fill="#FFF1A8" {...ST} strokeWidth={5} />
  </g>
);

/** Monitor de Sofi con la diapositiva adentro (la misma del hook, en chico). */
const SlideMonitor: React.FC<{ frame: number; slide: React.ComponentProps<typeof ProjectorSlide>; screen?: React.ReactNode }> = ({ frame, slide, screen }) => (
  <g>
    <rect x={-30} y={-40} width={60} height={46} fill="#3A3F5C" {...ST} />
    <rect x={-90} y={0} width={180} height={18} rx={8} fill="#3A3F5C" {...ST} />
    <rect x={-182} y={-262} width={364} height={230} rx={18} fill="#2A2F63" {...ST} />
    <g transform="translate(0 -147) scale(0.44)">{screen ?? <ProjectorSlide {...slide} frame={frame} />}</g>
  </g>
);

/**
 * La oficina de Sofi (reel 3 y 4): pared de color con reloj y calendario, monitor con la diapositiva,
 * puerta del jefe, escritorio, taza, planta y Sofi. Lo que pasa adelante lo dibuja la escena (`front`).
 */
export const OfficeSet: React.FC<{
  mood: SofiMood;
  gazeX?: number;
  gazeY?: number;
  armL?: SofiArm;
  armR?: SofiArm;
  door?: number;
  clap?: number;
  sweat?: number;
  jump?: number;
  tilt?: number;
  clockA?: number;
  calFlip?: number;
  calPulse?: number; // 0 … 1: golpe de escala del calendario
  slide: Omit<React.ComponentProps<typeof ProjectorSlide>, "frame">;
  /** reel 4: otra cosa en el monitor en vez de la diapositiva del reel 3 (centrada, 720 × 420) */
  screen?: React.ReactNode;
  /** reel 5: sin el calendario "MAÑANA 9:00" (no hay apuro en esta historia) */
  calendar?: boolean;
  propR?: React.ReactNode;
  /** reel 7: sin la puerta del jefe (en la pared va la postal de Bariloche) */
  door0?: boolean;
  front?: React.ReactNode;
  behind?: React.ReactNode;
}> = ({ mood, gazeX, gazeY, armL, armR, door = 0, clap = 0, sweat = 0, jump = 0, tilt = 0, clockA = 0.15, calFlip = 0, calPulse = 0, slide, screen, calendar = true, propR, door0 = false, front, behind }) => {
  const frame = useCurrentFrame();
  const S = OFFICE.sofi;
  return (
    <g>
      {/* zócalo y piso */}
      <rect x={-600} y={OFFICE.deskY + 260} width={2400} height={900} fill="#0E6664" opacity={0.75} />
      <rect x={-600} y={OFFICE.deskY + 250} width={2400} height={16} fill="#0B4F4D" />
      <g transform={`translate(${OFFICE.clock.x} ${OFFICE.clock.y})`}>
        <WallClock a={clockA} />
      </g>
      {calendar ? (
        <g transform={`translate(${OFFICE.calendar.x} ${OFFICE.calendar.y}) rotate(${3 - 6 * calPulse}) scale(${1 + 0.3 * calPulse})`}>
          <Calendar flip={calFlip} />
        </g>
      ) : null}
      {door0 ? null : (
        <g transform={`translate(${OFFICE.door.x} ${OFFICE.door.y})`}>
          <BossDoor open={door} clap={clap} />
        </g>
      )}
      {behind}
      <Sofi id="sofi" x={S.x} y={S.y} scale={S.scale} mood={mood} gazeX={gazeX} gazeY={gazeY} armL={armL} armR={armR} sweat={sweat} jump={jump} tilt={tilt} propR={propR} />
      <g transform={`translate(540 ${OFFICE.deskY})`}>
        <Desk />
      </g>
      <g transform={`translate(${OFFICE.monitor.x} ${OFFICE.monitor.y})`}>
        <SlideMonitor frame={frame} slide={{ ...slide, frame }} screen={screen} />
      </g>
      <g transform={`translate(${OFFICE.mug.x} ${OFFICE.mug.y})`}>
        <Mug frame={frame} />
      </g>
      <g transform={`translate(640 ${OFFICE.deskY}) scale(0.7)`}>
        <Plant frame={frame} />
      </g>
      {front}
    </g>
  );
};
