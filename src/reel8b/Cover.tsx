import React from "react";
import { AbsoluteFill } from "remotion";
import { Phone } from "./objects/Phone";
import { FitSign } from "./objects/R3";
import { CYAN, ChatPhoneScreen, LightOrb, Trail, WorldGlobe } from "./objects/R8";
import { FACES, MOUTHS } from "./rig/expressions";
import { HomeroPose } from "./rig/Homero";
import { HomeroB, Tag } from "./scenes/common";
import { ACCOUNT, C, SANS } from "./tokens";
import { Backdrop } from "./world/Backdrop";

// Portada del reel 8b: "CHATGPT NO ESTÁ EN TU CELULAR". El celular de Sofi (vacío) abajo, un hilo de luz que
// sube y, lejos, el globo con el centro de datos donde está Homero (CHATGPT), saludando.
const POSE: HomeroPose = {
  face: { ...FACES.feliz, lidTop: 0.3, gazeX: -0.6, gazeY: 0.5 },
  mouth: MOUTHS.sonrisa,
  armL: { shoulder: 150, elbow: 22, hand: 0, gesture: "open" },
  armR: { shoulder: 8, elbow: -66, hand: -14, gesture: "open" },
  headTilt: -4,
  headTurn: 0,
  headDy: 0,
  bodyTilt: 0,
  squash: 0,
  emotion: "neutro",
  halo: 0.9,
};
const TRAIL = Array.from({ length: 18 }, (_, i) => {
  const k = i / 17;
  return { x: 330 + 300 * k + 60 * Math.sin(k * Math.PI), y: 1330 - 380 * k - 120 * Math.sin(k * Math.PI) };
});

export const Cover: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.fondo }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <Backdrop id="cover" bg="nocheIndigo" texture="dots" />
      <g transform="translate(760 960) scale(0.62)">
        <WorldGlobe frame={20} n={10} hub={{ x: 0, y: 0 }} />
      </g>
      <HomeroB id="cover-homero" place={{ x: 790, y: 1060, scale: 0.36 }} pose={POSE} badgeGlow={0.8} />
      <Tag text="CHATGPT" x={860} y={760} tx={780} ty={880} k={1} />
      <Phone id="cover-phone" x={300} y={1500} scale={1.05} screenOn={1} glow={0.8}>
        <ChatPhoneScreen frame={10} typed={0} sent={0} />
      </Phone>
      <Trail pts={TRAIL} color={CYAN} w={30} />
      <g transform={`translate(${TRAIL[17].x} ${TRAIL[17].y})`}>
        <LightOrb frame={0} r={24} />
      </g>
      <g transform="translate(540 520) rotate(-2)">
        <FitSign lines={["CHATGPT NO ESTÁ", "EN TU CELULAR"]} size={120} maxW={1000} colors={["#FFFFFF", CYAN]} />
      </g>
      <text x={540} y={330} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#FFFFFF" opacity={0.9}>
        {ACCOUNT}
      </text>
    </svg>
  </AbsoluteFill>
);
