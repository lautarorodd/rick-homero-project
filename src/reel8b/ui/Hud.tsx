import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, clamp01, pop, pulse, ramp, track } from "../anim";
import { SC, pw } from "../timeline";
import { C, MONO, SAFE, SANS } from "../tokens";

// Reel 4: "CONFIANZA" con un valor que se mueve. Entra baja con las preguntas (Homero no sabe nada de
// Sofi), cae en "No tengo idea" y sube pieza a pieza con el mensaje largo hasta 100 % en "Ahora sí".
// Se va con "¿Por qué cambia tanto?". La primera vez se presenta (crece, titila y lleva "qué tan seguro
// estoy" ~1 s), como en el reel 3b.
const FROM = SC.D + 4;
const TO = SC.J - 2;
const VALUE: ReadonlyArray<readonly [number, number]> = [
  [FROM, 30],
  [pw(5, "idea") - 2, 30],
  [pw(5, "idea") + 6, 10],
  [pw(11, "vendedora") - 2, 10],
  [pw(11, "vendedora") + 6, 25],
  [pw(11, "inmobiliaria") + 6, 35],
  [pw(11, "córdoba") + 6, 45],
  [pw(12, "cinco") + 8, 55],
  [pw(12, "jefe") + 8, 65],
  [pw(13, "ventas") + 8, 78],
  [pw(13, "tono") + 8, 90],
  [pw(14, "sí") - 2, 90],
  [pw(14, "sí") + 6, 100],
];
// momentos en que el medidor late
const HITS = [pw(5, "idea"), pw(11, "vendedora"), pw(11, "inmobiliaria"), pw(11, "córdoba"), pw(12, "cinco"), pw(12, "jefe"), pw(13, "ventas"), pw(13, "tono"), pw(14, "sí")];
const ALARM = [pw(5, "idea")];

const colorOf = (v: number) => (v < 35 ? C.peligro : v < 70 ? C.curioso : C.ok);

export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < FROM || frame > TO + 10) return null;
  const k = pop(frame, FROM, { damping: 13 }) * (1 - ramp(frame, TO, TO + 9, EASE.in));
  if (k < 0.01) return null;
  const hit = Math.max(...HITS.map((f) => pulse(frame, f, 2, 12)));
  const alarm = ALARM.some((f) => frame >= f && frame < f + 16);
  // presentación: ~1 s grande y titilando, con la etiqueta debajo
  const intro = 1 - ramp(frame, FROM + 30, FROM + 40);
  const blinkOn = intro > 0.5 && Math.floor((frame - FROM) / 5) % 2 === 1;
  const caption = clamp01(ramp(frame, FROM + 2, FROM + 8) * (1 - ramp(frame, FROM + 34, FROM + 42)));
  const glow = clamp01(0.35 + 0.65 * hit);
  const v = track(frame, VALUE, EASE.out);
  const col = colorOf(v);
  const rgb = col === C.ok ? "52,208,88" : col === C.curioso ? "255,197,61" : "255,59,92";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: SAFE.hudY,
          left: "50%",
          translate: `-50% ${-30 * (1 - k)}px`,
          scale: String((0.6 + 0.4 * k) * (1 + 0.12 * hit) * (1 + 0.28 * intro)),
          opacity: clamp01(k * 1.5),
          height: 70,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 24px",
          borderRadius: 35,
          background: alarm && Math.floor(frame / 4) % 2 === 0 ? "rgba(176,31,44,0.92)" : blinkOn ? `rgba(${rgb},0.75)` : "rgba(20,24,51,0.85)",
          border: "1.5px solid rgba(255,255,255,0.2)",
          boxShadow: `0 0 ${18 + 30 * glow}px rgba(${rgb},${0.15 + 0.35 * glow})`,
        }}
      >
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", color: "#FFFFFF", opacity: 0.85 }}>CONFIANZA</span>
        <div style={{ width: 150, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${v}%`, height: "100%", borderRadius: 8, background: col, boxShadow: `0 0 ${8 + 14 * glow}px ${col}` }} />
        </div>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, minWidth: 128, textAlign: "right", color: "#FFFFFF", textShadow: `0 0 ${8 + 18 * glow}px ${col}` }}>{Math.round(v)} %</span>
      </div>
      {/* etiqueta de presentación al costado del medidor (abajo la tapaba la banda de subtítulos) */}
      {caption > 0.01 ? (
        <div
          style={{
            position: "absolute",
            top: SAFE.hudY - 4,
            left: 894,
            translate: `${-10 * (1 - caption)}px 0`,
            opacity: caption,
            padding: "6px 10px",
            borderRadius: 14,
            background: "#FFE27A",
            color: "#1C1A24",
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 21,
            lineHeight: 1.1,
            boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
          }}
        >
          ← qué tan
          <br />
          seguro estoy
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
