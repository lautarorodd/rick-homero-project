import React from "react";
import { clamp01 } from "../anim";
import { SANS } from "../tokens";
import { ChatGPTLogo } from "./Brand";

// El objeto que viaja: la respuesta que Homero arma para Sofi, palabra por palabra.
// Reel 3: la pregunta de Sofi y la respuesta inventada de Homero.
export const PROMPT = "¿Cuánto crecieron las ventas online en Argentina?";
export const RESPONSE = "37 %, según el Observatorio Nacional de Ventas Digitales.".split(" ");

export const CHAT = { bg: "#212121", user: "#303030", text: "#ECECEC" };


/** Parte palabras en renglones de hasta `maxChars` caracteres. */
export const wrap = (words: string[], maxChars: number) => {
  const lines: string[][] = [[]];
  let len = 0;
  words.forEach((w) => {
    if (len + w.length > maxChars && lines[lines.length - 1].length) {
      lines.push([]);
      len = 0;
    }
    lines[lines.length - 1].push(w);
    len += w.length + 1;
  });
  return lines;
};

/**
 * Pantalla de ChatGPT en coordenadas de la pantalla del celular (276 × 596, centrada).
 * typed: letras escritas del pedido · sent: 0 … 1 enviado · thinking: puntitos · words: palabras
 * de la respuesta ya elegidas · cursor: hueco que parpadea después de la última palabra.
 */
export const ChatScreen: React.FC<{
  frame: number;
  typed: number;
  sent: number;
  thinking?: number;
  words: number;
  cursor?: number;
  newest?: number; // 0 … 1: brillo de la última palabra que llegó
  response?: string[]; // otra respuesta (la segunda pantalla de "te contesta diferente")
  hi?: number[]; // índices de palabras resaltadas
  prompt?: string;
}> = ({ frame, typed, sent, thinking = 0, words, cursor = 0, newest = 0, response = RESPONSE, hi = [], prompt = PROMPT }) => {
  const text = prompt.slice(0, Math.round(typed));
  const userLines = wrap(text.split(" "), 14);
  const respLines = wrap(response.slice(0, words), 24);
  const bubbleY = -160 - 30 * clamp01(sent);
  const respY = bubbleY + userLines.length * 26 + 30;
  const blink = Math.floor(frame / 8) % 2 === 0;
  let count = 0;
  return (
    <g>
      <rect x={-138} y={-298} width={276} height={596} fill={CHAT.bg} />
      {/* encabezado */}
      <g transform="translate(-62 -246) scale(0.12)">
        <ChatGPTLogo />
      </g>
      <text x={-44} y={-240} fontFamily={SANS} fontWeight={700} fontSize={18} fill={CHAT.text}>
        ChatGPT
      </text>
      <line x1={-138} y1={-218} x2={138} y2={-218} stroke="rgba(255,255,255,0.08)" strokeWidth={2} />
      {/* pedido de Sofi */}
      {typed > 0.5 ? (
        <g transform={`translate(0 ${bubbleY})`}>
          <rect x={124 - 196} y={-26} width={196} height={18 + userLines.length * 26} rx={18} fill={sent > 0.5 ? CHAT.user : "#2B4E9C"} />
          {userLines.map((l, i) => (
            <text key={i} x={124 - 182} y={0 + i * 26} fontFamily={SANS} fontWeight={600} fontSize={20} fill={CHAT.text}>
              {l.join(" ")}
            </text>
          ))}
        </g>
      ) : null}
      {/* respuesta: el logo y las palabras elegidas */}
      {sent > 0.5 ? (
        <g transform={`translate(-120 ${respY})`}>
          <g transform="translate(10 4) scale(0.11)">
            <ChatGPTLogo />
          </g>
          {thinking > 0.01 && words === 0
            ? [0, 1, 2].map((i) => (
                <circle key={i} cx={36 + i * 14} cy={6} r={4.5} fill={CHAT.text} opacity={0.3 + 0.7 * Math.abs(Math.sin(frame / 6 - i * 0.7))} />
              ))
            : null}
          {respLines.map((l, i) => (
            <text key={i} x={30} y={10 + i * 23} fontFamily={SANS} fontWeight={500} fontSize={16} fill={CHAT.text}>
              {l.map((w, k) => {
                count += 1;
                const isNew = count === words;
                const isHi = hi.indexOf(count - 1) >= 0;
                return (
                  <tspan key={k} fill={(isNew && newest > 0.01) || isHi ? "#FFE27A" : CHAT.text} fontWeight={isHi ? 800 : 500}>
                    {(k ? " " : "") + w}
                  </tspan>
                );
              })}
            </text>
          ))}
          {cursor > 0.01 && blink ? (
            <rect
              x={30 + (respLines.length ? respLines[respLines.length - 1].join(" ").length * 8.6 + 4 : 0)}
              y={-4 + Math.max(0, respLines.length - 1) * 23}
              width={10}
              height={18}
              rx={2}
              fill="#FFE27A"
              opacity={cursor}
            />
          ) : null}
        </g>
      ) : null}
      {/* barra de escribir */}
      <rect x={-124} y={236} width={248} height={42} rx={21} fill="#2F2F2F" />
      <text x={-104} y={263} fontFamily={SANS} fontWeight={500} fontSize={15} fill="#8E8E8E">
        Escribí tu mensaje…
      </text>
    </g>
  );
};
