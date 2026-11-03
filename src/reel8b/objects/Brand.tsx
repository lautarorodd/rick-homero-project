import React from "react";
import { HOMERO as K, SANS } from "../tokens";

export const GPT_GREEN = "#10A37F";

/** Logo de ChatGPT: el nudo de seis pétalos sobre el círculo verde. Centrado, radio 100. */
export const ChatGPTLogo: React.FC<{ spin?: number; ring?: boolean }> = ({ spin = 0, ring = true }) => (
  <g>
    {ring ? <circle r={100} fill={GPT_GREEN} /> : null}
    <g transform={`rotate(${spin})`} fill="none" stroke="#FFFFFF" strokeWidth={11} strokeLinejoin="round">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x={-18} y={-66} width={36} height={86} rx={18} transform={`rotate(${a}) translate(14 0)`} />
      ))}
    </g>
  </g>
);

/**
 * Gafete de la planta nuclear, versión ChatGPT: tarjeta blanca con la franja amarilla de
 * "SEGURIDAD", el logo donde iría la foto y el clip arriba. Origen en el clip; cuelga hacia abajo.
 */
export const Badge: React.FC<{ glow?: number; alarm?: number }> = ({ glow = 0, alarm = 0 }) => (
  <g>
    <rect x={-14} y={-10} width={28} height={30} rx={6} fill="#C9CCD9" stroke={K.contorno} strokeWidth={4} />
    <g transform="translate(0 20)">
      {glow > 0.01 ? <rect x={-96} y={-8} width={192} height={256} rx={26} fill="#FFE27A" opacity={0.55 * glow} /> : null}
      <rect x={-86} y={0} width={172} height={236} rx={18} fill="#FFFFFF" stroke={K.contorno} strokeWidth={5} />
      <rect x={-86} y={0} width={172} height={50} rx={18} fill={alarm > 0.5 ? "#FF3B5C" : "#F5C04A"} stroke={K.contorno} strokeWidth={5} />
      <rect x={-84} y={30} width={168} height={18} fill={alarm > 0.5 ? "#FF3B5C" : "#F5C04A"} />
      <text x={0} y={36} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={26} fill="#C8102E" letterSpacing={1}>
        {alarm > 0.5 ? "¡BIP!" : "SEGURIDAD"}
      </text>
      <g transform="translate(0 116) scale(0.5)">
        <ChatGPTLogo />
      </g>
      <text x={0} y={198} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#1C1A24">
        ChatGPT
      </text>
      <text x={0} y={222} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={14} fill="#3D7BFF" letterSpacing={1}>
        PLANTA DE PALABRAS
      </text>
    </g>
  </g>
);
