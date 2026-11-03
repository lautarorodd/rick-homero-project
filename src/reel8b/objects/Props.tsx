import React from "react";
import { random } from "remotion";
import { clamp01 } from "../anim";
import { C, HOMERO as K, MONO, SANS } from "../tokens";

// Utilería del reel 2, en el estilo de la serie: colores planos, contorno negro, una luz de borde.
const ST = { stroke: K.contorno, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// ---------- oficina de Sofi ----------
export const Desk: React.FC = () => (
  <g>
    <rect x={-470} y={0} width={940} height={46} rx={14} fill="#B8743F" {...ST} />
    <rect x={-470} y={0} width={940} height={14} rx={7} fill="#D9955A" />
    <path d="M -440 46 L -420 520 L 420 520 L 440 46 Z" fill="#8F5A30" {...ST} />
    <rect x={-380} y={110} width={300} height={120} rx={12} fill="#A3683A" {...ST} strokeWidth={5} />
    <circle cx={-230} cy={170} r={10} fill="#F5C04A" {...ST} strokeWidth={4} />
  </g>
);

export const Monitor: React.FC<{ glow?: number }> = ({ glow = 0.6 }) => (
  <g>
    <rect x={-30} y={-40} width={60} height={46} fill="#3A3F5C" {...ST} />
    <rect x={-90} y={0} width={180} height={18} rx={8} fill="#3A3F5C" {...ST} />
    <rect x={-180} y={-260} width={360} height={226} rx={18} fill="#2A2F63" {...ST} />
    <rect x={-160} y={-240} width={320} height={186} rx={8} fill="#3D7BFF" opacity={0.35 + 0.3 * glow} />
    <path d="M -140 -200 L 60 -200 M -140 -170 L 120 -170 M -140 -140 L 20 -140" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
  </g>
);

export const Plant: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    {[-30, 0, 30, -14, 18].map((a, i) => (
      <path
        key={i}
        d={`M 0 -40 C ${a * 2} -120 ${a * 3} -170 ${a * 2.4} -210`}
        fill="none"
        stroke="#34D058"
        strokeWidth={18}
        strokeLinecap="round"
        transform={`rotate(${Math.sin(frame / 25 + i) * 3} 0 -40)`}
      />
    ))}
    <path d="M -60 -50 L 60 -50 L 44 40 L -44 40 Z" fill="#FF7AB6" {...ST} />
  </g>
);

export const Mug: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <path d="M 40 -70 C 80 -70 80 -10 40 -14" fill="none" {...ST} strokeWidth={12} />
    <rect x={-44} y={-90} width={88} height={96} rx={14} fill="#FFFFFF" {...ST} />
    <text x={0} y={-30} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#3D7BFF">
      ☕
    </text>
    {[0, 1].map((i) => (
      <path
        key={i}
        d={`M ${-12 + i * 24} -110 c -10 -16 10 -24 0 -44`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={6}
        strokeLinecap="round"
        opacity={0.35 + 0.25 * Math.sin(frame / 8 + i)}
        transform={`translate(0 ${-((frame / 2 + i * 10) % 20)})`}
      />
    ))}
  </g>
);

/** Puerta del jefe: se abre (0 … 1) y asoma una silueta seria. Origen abajo al centro. */
export const BossDoor: React.FC<{ open: number; clap?: number }> = ({ open, clap = 0 }) => (
  <g>
    <rect x={-150} y={-560} width={300} height={560} fill="#0B0D1A" {...ST} />
    {open > 0.02 ? (
      <g transform={`translate(${-20 + 30 * clap * Math.sin(clap * 20)} 0)`} opacity={clamp01(open * 2)}>
        <circle cx={0} cy={-400} r={70} fill="#2A2F4F" />
        <path d="M -120 0 C -120 -200 -90 -300 0 -310 C 90 -300 120 -200 120 0 Z" fill="#2A2F4F" />
        <path d="M -12 -300 L 12 -300 L 20 -180 L 0 -150 L -20 -180 Z" fill="#C8102E" />
        <rect x={-40} y={-418} width={26} height={8} rx={4} fill="#FFFFFF" opacity={0.85} />
        <rect x={14} y={-418} width={26} height={8} rx={4} fill="#FFFFFF" opacity={0.85} />
      </g>
    ) : null}
    {/* la hoja de la puerta gira sobre la bisagra izquierda */}
    <g transform={`translate(-150 0) scale(${1 - 0.82 * open} 1)`}>
      <rect x={0} y={-560} width={300} height={560} fill="#7A4B2A" {...ST} />
      <rect x={30} y={-520} width={240} height={200} rx={8} fill="none" stroke="#5E3820" strokeWidth={6} />
      <rect x={30} y={-290} width={240} height={250} rx={8} fill="none" stroke="#5E3820" strokeWidth={6} />
      <circle cx={260} cy={-280} r={14} fill="#F5C04A" {...ST} strokeWidth={4} />
      <rect x={60} y={-500} width={180} height={64} rx={8} fill="#F5C04A" {...ST} strokeWidth={4} />
      <text x={150} y={-456} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={40} fill="#1C1A24">
        JEFE
      </text>
    </g>
  </g>
);

/** Globo de pensamiento con un "$" que crece. */
export const MoneyBubble: React.FC<{ grow: number; frame: number }> = ({ grow, frame }) => (
  <g>
    {[
      [-120, 150, 16],
      [-80, 110, 24],
    ].map(([x, y, r]) => (
      <circle key={x} cx={x} cy={y} r={r} fill="#FFFFFF" {...ST} strokeWidth={5} />
    ))}
    <ellipse cx={0} cy={0} rx={150} ry={110} fill="#FFFFFF" {...ST} />
    <g transform={`scale(${0.4 + 0.9 * grow})`}>
      <circle r={64} fill="#34D058" {...ST} />
      <text x={0} y={30} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={90} fill="#FFFFFF">
        $
      </text>
    </g>
    {grow > 0.6
      ? [0, 1, 2].map((i) => {
          const t = ((frame / 30 + i * 0.33) % 1) * clamp01((grow - 0.6) * 3);
          return (
            <g key={i} transform={`translate(${(i - 1) * 90 + t * 40 * (i - 1)} ${-40 - t * 120}) rotate(${(i - 1) * 20 + t * 30})`} opacity={1 - t}>
              <rect x={-34} y={-18} width={68} height={36} rx={6} fill="#7ED957" {...ST} strokeWidth={4} />
              <text x={0} y={10} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={24} fill="#1C1A24">
                $
              </text>
            </g>
          );
        })
      : null}
  </g>
);

// ---------- hook ----------
export const Brain: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <path
      d="M -120 10 C -150 -40 -120 -110 -60 -110 C -40 -150 40 -150 60 -110 C 120 -110 150 -40 120 10 C 140 60 90 100 40 90 C 20 120 -20 120 -40 90 C -90 100 -140 60 -120 10 Z"
      fill="#FF9EC7"
      {...ST}
    />
    <path d="M 0 -130 C -10 -80 10 -40 0 80 M -80 -60 C -40 -50 -40 0 -80 20 M 80 -60 C 40 -50 40 0 80 20" fill="none" stroke="#C9578B" strokeWidth={6} strokeLinecap="round" />
    {[-60, 60].map((gx, i) => (
      <g key={gx} transform={`translate(${gx} ${-150}) rotate(${(i ? -1 : 1) * frame * 6})`}>
        {Array.from({ length: 8 }, (_, k) => (
          <rect key={k} x={-8} y={-38} width={16} height={18} fill="#C9CCD9" {...ST} strokeWidth={3} transform={`rotate(${k * 45})`} />
        ))}
        <circle r={26} fill="#C9CCD9" {...ST} strokeWidth={4} />
        <circle r={8} fill="#3A3F5C" />
      </g>
    ))}
  </g>
);

/** Sello de goma: texto en un rectángulo con borde doble. */
export const Stamp: React.FC<{ text: string; color?: string; w?: number; size?: number }> = ({ text, color = C.peligro, w = 520, size = 84 }) => (
  <g>
    <rect x={-w / 2} y={-size * 0.85} width={w} height={size * 1.7} rx={18} fill="rgba(255,255,255,0.08)" stroke={color} strokeWidth={12} />
    <rect x={-w / 2 + 16} y={-size * 0.85 + 16} width={w - 32} height={size * 1.7 - 32} rx={10} fill="none" stroke={color} strokeWidth={4} />
    <text x={0} y={size * 0.34} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={color} letterSpacing={4}>
      {text}
    </text>
  </g>
);

/** Cartel de texto en pantalla (rioplatense). */
export const Sign: React.FC<{ lines: string[]; size?: number; color?: string; bg?: string }> = ({ lines, size = 56, color = "#FFFFFF", bg = "rgba(20,24,51,0.92)" }) => {
  const w = Math.max(...lines.map((l) => l.length)) * size * 0.56 + 80;
  const h = lines.length * size * 1.2 + 50;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={28} fill={bg} stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
      {lines.map((l, i) => (
        <text key={l} x={0} y={-h / 2 + 25 + size * 0.95 + i * size * 1.2} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={size} fill={color}>
          {l}
        </text>
      ))}
    </g>
  );
};

// ---------- adentro del chat ----------
export const Magnifier: React.FC<{ crossed: number }> = ({ crossed }) => (
  <g>
    <path d="M 60 60 L 170 170" stroke="#7A4B2A" strokeWidth={34} strokeLinecap="round" />
    <path d="M 60 60 L 170 170" fill="none" {...ST} strokeWidth={4} />
    <circle r={100} fill="rgba(160,220,255,0.35)" {...ST} strokeWidth={22} stroke="#3A3F5C" />
    <circle r={100} fill="none" {...ST} />
    <path d="M -50 -50 C -30 -70 0 -76 20 -70" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
    {crossed > 0 ? (
      <g stroke={C.peligro} strokeWidth={26} strokeLinecap="round">
        <line x1={-130} y1={-130} x2={-130 + 260 * clamp01(crossed * 2)} y2={-130 + 260 * clamp01(crossed * 2)} />
        <line x1={130} y1={-130} x2={130 - 260 * clamp01(crossed * 2 - 1)} y2={-130 + 260 * clamp01(crossed * 2 - 1)} opacity={crossed > 0.5 ? 1 : 0} />
      </g>
    ) : null}
  </g>
);

export const EmptyDrawer: React.FC<{ open: number }> = ({ open }) => (
  <g>
    <rect x={-150} y={-110} width={300} height={220} rx={14} fill="#5B6488" {...ST} />
    <g transform={`translate(0 ${open * 90})`}>
      <rect x={-130} y={-60} width={260} height={130} rx={10} fill="#8C95BC" {...ST} />
      <rect x={-50} y={-22} width={100} height={22} rx={11} fill="#3A3F5C" />
      <text x={0} y={50} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={26} fill="#1C1A24">
        RESPUESTAS
      </text>
    </g>
    {open > 0.5 ? (
      <text x={0} y={open * 90 + 120} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={C.textoOff} opacity={clamp01((open - 0.5) * 2)}>
        (vacío)
      </text>
    ) : null}
  </g>
);

export const Drop: React.FC = () => (
  <path d="M 0 -26 C -14 -6 -18 6 -18 14 C -18 26 -8 32 0 32 C 8 32 18 26 18 14 C 18 6 14 -6 0 -26 Z" fill="#9FD8FF" {...ST} strokeWidth={4} />
);

// ---------- aprender ----------
export const Book: React.FC<{ color: string; title?: string }> = ({ color, title }) => (
  <g>
    <rect x={-70} y={-90} width={140} height={180} rx={10} fill={color} {...ST} />
    <rect x={-70} y={-90} width={24} height={180} fill="rgba(0,0,0,0.2)" />
    {title ? (
      <text x={12} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={22} fill="#FFFFFF">
        {title}
      </text>
    ) : null}
  </g>
);

export const ForumPost: React.FC<{ title: string; color: string }> = ({ title, color }) => (
  <g>
    <rect x={-150} y={-70} width={300} height={140} rx={16} fill="#FFFFFF" {...ST} />
    <circle cx={-110} cy={-30} r={22} fill={color} {...ST} strokeWidth={4} />
    <text x={-78} y={-22} fontFamily={SANS} fontWeight={800} fontSize={20} fill="#1C1A24">
      {title}
    </text>
    <path d="M -126 16 L 120 16 M -126 44 L 60 44" stroke="#C9CCD9" strokeWidth={12} strokeLinecap="round" />
  </g>
);

export const WebPage: React.FC<{ color: string }> = ({ color }) => (
  <g>
    <rect x={-140} y={-100} width={280} height={200} rx={14} fill="#FFFFFF" {...ST} />
    <rect x={-140} y={-100} width={280} height={36} rx={14} fill={color} {...ST} />
    {[-118, -96, -74].map((x) => (
      <circle key={x} cx={x} cy={-82} r={6} fill="#FFFFFF" />
    ))}
    <rect x={-116} y={-40} width={110} height={110} rx={8} fill={color} opacity={0.35} />
    <path d="M 10 -30 L 116 -30 M 10 0 L 96 0 M 10 30 L 116 30 M 10 60 L 70 60" stroke="#C9CCD9" strokeWidth={12} strokeLinecap="round" />
  </g>
);

/** Embudo: lo que entra por arriba sale por el pico hacia abajo. Origen en el pico. */
export const Funnel: React.FC = () => (
  <g>
    <path d="M -300 -420 L 300 -420 L 60 -120 L 60 0 L -60 0 L -60 -120 Z" fill="rgba(160,190,255,0.25)" {...ST} />
    <ellipse cx={0} cy={-420} rx={300} ry={40} fill="rgba(160,190,255,0.35)" {...ST} />
    <path d="M -240 -380 L -60 -150" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" opacity={0.35} />
  </g>
);

export const FileBox: React.FC<{ open: number; crossed: number }> = ({ open, crossed }) => (
  <g>
    <rect x={-170} y={-130} width={340} height={260} rx={16} fill="#C9A15C" {...ST} />
    <g transform={`translate(0 ${-open * 120}) rotate(${-open * 12} -170 -130)`}>
      <rect x={-170} y={-150} width={340} height={40} rx={10} fill="#B08844" {...ST} />
    </g>
    <rect x={-110} y={-40} width={220} height={60} rx={8} fill="#FFFFFF" {...ST} strokeWidth={4} />
    <text x={0} y={0} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#1C1A24">
      RESPUESTAS
    </text>
    {crossed > 0 ? (
      <g stroke={C.peligro} strokeWidth={24} strokeLinecap="round">
        <line x1={-200} y1={-160} x2={-200 + 400 * clamp01(crossed * 2)} y2={-160 + 320 * clamp01(crossed * 2)} />
        <line x1={200} y1={-160} x2={200 - 400 * clamp01(crossed * 2 - 1)} y2={-160 + 320 * clamp01(crossed * 2 - 1)} opacity={crossed > 0.5 ? 1 : 0} />
      </g>
    ) : null}
  </g>
);

// ---------- azar ----------
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

/** Dado en perspectiva (cara de frente + techo + costado). */
export const Dice: React.FC<{ face: number; top?: number }> = ({ face, top = 3 }) => (
  <g>
    <path d="M -90 -90 L -40 -140 L 140 -140 L 90 -90 Z" fill="#F0F0F6" {...ST} />
    <path d="M 90 -90 L 140 -140 L 140 40 L 90 90 Z" fill="#C9CCD9" {...ST} />
    <rect x={-90} y={-90} width={180} height={180} rx={22} fill="#FFFFFF" {...ST} />
    {PIPS[face].map(([px, py], i) => (
      <circle key={i} cx={px * 48} cy={py * 48} r={17} fill={face === 1 ? C.peligro : K.contorno} />
    ))}
    {PIPS[top].map(([px, py], i) => (
      <ellipse key={`t${i}`} cx={25 + px * 26 + py * 12} cy={-115 + py * 12} rx={10} ry={5} fill={K.contorno} />
    ))}
  </g>
);

/** Persiana metálica de local: baja (0 … 1) y tapa todo el cuadro. Coordenadas de pantalla. */
export const Shutter: React.FC<{ down: number; label?: string }> = ({ down, label }) => {
  const h = 1920 * down;
  if (down <= 0.001) return null;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={h} fill="#8C93A8" />
      {Array.from({ length: Math.ceil(h / 48) }, (_, i) => (
        <g key={i}>
          <rect x={0} y={h - (i + 1) * 48} width={1080} height={48} fill={i % 2 ? "#9AA1B6" : "#868DA2"} />
          <line x1={0} y1={h - (i + 1) * 48 + 2} x2={1080} y2={h - (i + 1) * 48 + 2} stroke="#5E6478" strokeWidth={4} />
        </g>
      ))}
      <rect x={0} y={h - 40} width={1080} height={40} fill="#5E6478" />
      <rect x={480} y={h - 34} width={120} height={22} rx={8} fill="#3A3F5C" />
      {label ? (
        <g transform={`translate(540 ${h - 960})`}>
          <rect x={-330} y={-110} width={660} height={220} rx={24} fill="#FFC53D" stroke={K.contorno} strokeWidth={8} />
          <text x={0} y={-12} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={76} fill="#1C1A24">
            {label}
          </text>
          <text x={0} y={62} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={40} fill="#1C1A24">
            alucinaciones
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Globo con una cita inventada. */
export const FakeQuote: React.FC = () => (
  <g>
    <path d="M -330 -150 L 330 -150 C 360 -150 380 -130 380 -100 L 380 90 C 380 120 360 140 330 140 L -120 140 L -200 210 L -190 140 L -330 140 C -360 140 -380 120 -380 90 L -380 -100 C -380 -130 -360 -150 -330 -150 Z" fill="#FFFFFF" {...ST} />
    <text x={0} y={-70} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#1C1A24">
      "Según la Ley 27.401
    </text>
    <text x={0} y={-16} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} fill="#1C1A24">
      de aumentos…"
    </text>
    <text x={120} y={80} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={32} fontStyle="italic" fill="#3A3F5C">
      — Albert Einstein
    </text>
  </g>
);

export const CONFETTI = Array.from({ length: 120 }, (_, i) => {
  const r = (k: string) => random(`r2-conf-${i}-${k}`);
  return {
    x: r("x") * 1080,
    vy: 6 + r("vy") * 10,
    vx: (r("vx") - 0.5) * 6,
    w: 12 + r("w") * 14,
    h: 7 + r("h") * 8,
    spin: (r("s") - 0.5) * 30,
    delay: r("d") * 18,
    c: ["#FF3B5C", "#FFC53D", "#34D058", "#38D6E8", "#7B4DFF", "#FF7AB6"][i % 6],
  };
});

/** Lluvia de confeti en coordenadas de pantalla, desde el cuadro `at`. */
export const Confetti: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  if (frame < at) return null;
  return (
    <g>
      {CONFETTI.map((p, i) => {
        const t = frame - at - p.delay;
        if (t < 0) return null;
        return (
          <rect
            key={i}
            x={-p.w / 2}
            y={-p.h / 2}
            width={p.w}
            height={p.h}
            rx={2}
            fill={p.c}
            opacity={clamp01(1.6 - t / 70)}
            transform={`translate(${p.x + p.vx * t + Math.sin(t / 6 + i) * 20} ${-40 + p.vy * t}) rotate(${p.spin * t}) scale(1 ${Math.cos(t * 0.3 + i)})`}
          />
        );
      })}
    </g>
  );
};

export const MonoText: React.FC<{ x: number; y: number; size: number; color?: string; children: React.ReactNode }> = ({ x, y, size, color = "#FFFFFF", children }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={size} fill={color}>
    {children}
  </text>
);
