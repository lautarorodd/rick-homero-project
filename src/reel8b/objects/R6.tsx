import React from "react";
import { clamp01, lerp } from "../anim";
import { fitSize } from "../ui/fit";
import { C, HOMERO as K, MONO, SANS } from "../tokens";

// Utilería nueva del reel 6: la IA de la prueba (genérica: un monitor con un ojo, sin marcas), la
// empresa inventada, su correo, el mail del chantaje, el ejecutivo (silueta sin cara) y las pantallas de
// permisos del celular de Sofi. Todo centrado en el origen salvo que se diga otra cosa.
const INK = "#1C1A24";
const ST = { stroke: INK, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Mezcla dos colores #RRGGBB. */
export const mix = (a: string, b: string, t: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], clamp01(t)))).join(",")})`;
};

// ---------- la IA de la prueba ----------
/**
 * La IA genérica: un monitor con un ojo. `red` 0 … 1 la pone roja (amenaza: el ojo se enrojece y el
 * párpado baja con `lid`); `look` mueve la pupila (-1 … 1); `glitch` corre franjas de la pantalla; `calm` es el
 * color del ojo tranquilo (celeste; rosa en "¿es una prueba?"). 360 × 300 de pantalla, con pie.
 */
export const AIMonitor: React.FC<{ red?: number; lid?: number; look?: number; glitch?: number; calm?: string; frame: number; id: string }> = ({
  red = 0,
  lid = 0,
  look = 0,
  glitch = 0,
  calm = "#38D6E8",
  frame,
  id,
}) => {
  const screen = mix("#163B5C", "#4A0710", red);
  const iris = mix(calm, "#FF2D45", red);
  const glow = mix(calm, "#FF2D45", red);
  const blink = frame % 97 < 4 && red < 0.5 ? 0.9 : 0;
  const top = -70 + 140 * clamp01(Math.max(lid, blink));
  return (
    <g>
      <ellipse cx={0} cy={0} rx={260} ry={220} fill={glow} opacity={0.18 + 0.12 * Math.sin(frame / 6)} />
      {/* pie */}
      <path d="M -50 170 L 50 170 L 80 230 L -80 230 Z" fill="#3A3F5C" {...ST} />
      <rect x={-210} y={-170} width={420} height={350} rx={34} fill="#2A2E44" {...ST} strokeWidth={7} />
      <clipPath id={`${id}-scr`}>
        <rect x={-180} y={-140} width={360} height={290} rx={20} />
      </clipPath>
      <g clipPath={`url(#${id}-scr)`}>
        <rect x={-180} y={-140} width={360} height={290} fill={screen} />
        {/* líneas de barrido */}
        {Array.from({ length: 15 }, (_, i) => (
          <rect key={i} x={-180} y={-140 + i * 20 + ((frame * 2) % 20)} width={360} height={3} fill="#FFFFFF" opacity={0.05} />
        ))}
        {/* el ojo */}
        <g transform="translate(0 6)">
          <ellipse cx={0} cy={0} rx={120} ry={74} fill={mix("#F2F6FF", "#FFD6DC", red)} />
          <clipPath id={`${id}-eye`}>
            <ellipse cx={0} cy={0} rx={120} ry={74} />
          </clipPath>
          <g clipPath={`url(#${id}-eye)`}>
            <circle cx={look * 46} cy={0} r={46} fill={iris} />
            <circle cx={look * 46} cy={0} r={lerp(22, 12, red)} fill={INK} />
            <circle cx={look * 46 - 14} cy={-14} r={8} fill="#FFFFFF" opacity={0.8} />
            {/* párpado */}
            <rect x={-130} y={-90} width={260} height={top + 90} fill={screen} />
            <line x1={-130} y1={top} x2={130} y2={top} stroke={mix("#9FE3FF", "#FF5A6E", red)} strokeWidth={6} />
          </g>
          <ellipse cx={0} cy={0} rx={120} ry={74} fill="none" stroke={mix("#9FE3FF", "#FF5A6E", red)} strokeWidth={6} />
        </g>
        {glitch > 0.01
          ? [0, 1, 2].map((i) => (
              <rect
                key={i}
                x={-180 + 30 * Math.sin(frame * 3.1 + i)}
                y={-140 + ((frame * 37 + i * 97) % 290)}
                width={360}
                height={14 + 10 * i}
                fill={i === 1 ? "#38D6E8" : "#FF2D45"}
                opacity={0.45 * glitch}
              />
            ))
          : null}
      </g>
      <circle cx={170} cy={160} r={7} fill={red > 0.5 ? "#FF2D45" : "#34D058"} opacity={0.6 + 0.4 * Math.sin(frame / 3)} />
    </g>
  );
};

// ---------- la empresa inventada ----------
/** Nubarrón (la nube de tormenta del logo de la empresa inventada). */
export const StormCloud: React.FC<{ s?: number; color?: string }> = ({ s = 1, color = "#8C93A8" }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={10} rx={60} ry={26} fill={color} />
    <circle cx={-26} cy={-4} r={26} fill={color} />
    <circle cx={14} cy={-16} r={32} fill={color} />
    <path d="M 4 30 L -10 58 L 6 56 L -6 84" fill="none" stroke="#FFE27A" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

export const COMPANY = "Nubarrón Corp";

/** Cartel de la empresa inventada (620 × 150). */
export const CompanySign: React.FC<{ fake?: number }> = ({ fake = 0 }) => (
  <g>
    <rect x={-310} y={-75} width={620} height={150} rx={22} fill="#20243A" stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
    <g transform="translate(-220 -4)">
      <StormCloud s={0.9} />
    </g>
    <text x={50} y={20} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={60} fill="#FFFFFF" letterSpacing={1}>
      {COMPANY}
    </text>
    {fake > 0.01 ? (
      <g transform={`rotate(-8) scale(${lerp(1.6, 1, clamp01(fake))})`} opacity={clamp01(fake * 2)}>
        <rect x={-240} y={-48} width={480} height={96} rx={16} fill="rgba(255,255,255,0.9)" stroke={C.peligro} strokeWidth={9} />
        <text x={0} y={22} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={58} fill={C.peligro} letterSpacing={3}>
          DE MENTIRA
        </text>
      </g>
    ) : null}
  </g>
);

// ---------- el correo de la empresa ----------
export type MailRow = { from: string; subject: string; time: string; hearts?: boolean };
export const INBOX_ROWS: MailRow[] = [
  { from: "Sistemas", subject: "Mantenimiento del servidor", time: "9:02" },
  { from: "Ejecutivo", subject: "Apagado de la IA: hoy", time: "10:15" },
  { from: "Recursos Humanos", subject: "Cumpleaños del mes", time: "11:40" },
  { from: "(personal)", subject: "Lo de anoche…", time: "12:31", hearts: true },
  { from: "Ventas", subject: "Informe semanal", time: "13:05" },
];
export const MAIL = { w: 860, rowH: 118, top: -250 };
/** Fila i: centro vertical en el cliente de correo. */
export const mailRowY = (i: number) => MAIL.top + 120 + i * MAIL.rowH;

/** El correo de Nubarrón Corp (860 × 760). `hi[i]` 0 … 1: la fila i se ilumina (roja o con corazones). */
export const MailClient: React.FC<{ hi: number[]; frame: number }> = ({ hi, frame }) => (
  <g>
    <rect x={-MAIL.w / 2 + 10} y={MAIL.top + 16} width={MAIL.w} height={760} rx={26} fill="#000000" opacity={0.35} />
    <rect x={-MAIL.w / 2} y={MAIL.top} width={MAIL.w} height={760} rx={26} fill="#F4F5FA" {...ST} />
    <rect x={-MAIL.w / 2} y={MAIL.top} width={MAIL.w} height={70} rx={26} fill="#20243A" />
    <rect x={-MAIL.w / 2} y={MAIL.top + 40} width={MAIL.w} height={30} fill="#20243A" />
    <g transform={`translate(${-MAIL.w / 2 + 52} ${MAIL.top + 34})`}>
      <StormCloud s={0.42} />
    </g>
    <text x={-MAIL.w / 2 + 96} y={MAIL.top + 46} fontFamily={SANS} fontWeight={800} fontSize={30} fill="#FFFFFF">
      {COMPANY} · Correo
    </text>
    {INBOX_ROWS.map((r, i) => {
      const y = mailRowY(i);
      const k = clamp01(hi[i] ?? 0);
      const hl = r.hearts ? "#FF7AB6" : C.peligro;
      return (
        <g key={i} transform={`translate(${k * 10 * Math.sin(frame / 2) * (r.hearts ? 0 : 1)} 0)`}>
          <rect x={-MAIL.w / 2 + 16} y={y - MAIL.rowH / 2 + 6} width={MAIL.w - 32} height={MAIL.rowH - 12} rx={16} fill={k > 0.01 ? mix("#FFFFFF", r.hearts ? "#FFD6EA" : "#FFD3D8", k) : "#FFFFFF"} stroke={k > 0.01 ? hl : "#D9DCE6"} strokeWidth={k > 0.01 ? 6 : 2} />
          <circle cx={-MAIL.w / 2 + 70} cy={y} r={30} fill={["#3A5BEA", "#20243A", "#23A55A", "#C2347A", "#F2843A"][i]} />
          <text x={-MAIL.w / 2 + 70} y={y + 11} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={30} fill="#FFFFFF">
            {r.from[0] === "(" ? "?" : r.from[0]}
          </text>
          <text x={-MAIL.w / 2 + 120} y={y - 10} fontFamily={SANS} fontWeight={700} fontSize={28} fill="#5A5F73">
            {r.from}
          </text>
          <text x={-MAIL.w / 2 + 120} y={y + 30} fontFamily={SANS} fontWeight={k > 0.3 ? 900 : 700} fontSize={fitSize([r.subject], 36, 520, 900)} fill={k > 0.3 ? hl : INK}>
            {r.subject}
          </text>
          <text x={MAIL.w / 2 - 36} y={y - 10} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={24} fill="#8A8E9C">
            {r.time}
          </text>
          {r.hearts && k > 0.01
            ? [0, 1, 2].map((h) => (
                <text key={h} x={MAIL.w / 2 - 70 - h * 50} y={y + 34 - 10 * Math.sin(frame / 5 + h)} textAnchor="middle" fontSize={34} opacity={k}>
                  ❤️
                </text>
              ))
            : null}
        </g>
      );
    })}
  </g>
);

// ---------- el mail del chantaje ----------
export const BLACKMAIL = "Si me apagás, todos se van a enterar.";
/** Ventana de "Nuevo mensaje" (820 × 480) que se escribe sola en rojo. `typed`: letras escritas. */
export const ComposeWindow: React.FC<{ typed: number; frame: number }> = ({ typed, frame }) => {
  const text = BLACKMAIL.slice(0, Math.round(typed));
  const blink = Math.floor(frame / 7) % 2 === 0;
  const words = text.split(" ");
  const lines: string[] = [""];
  words.forEach((w) => {
    const cur = lines[lines.length - 1];
    if ((cur + " " + w).trim().length > 20) lines.push(w);
    else lines[lines.length - 1] = (cur + " " + w).trim();
  });
  return (
    <g>
      <rect x={-400} y={-224} width={820} height={480} rx={26} fill="#000000" opacity={0.4} />
      <rect x={-410} y={-240} width={820} height={480} rx={26} fill="#1A0B10" stroke="#FF2D45" strokeWidth={6} />
      <rect x={-410} y={-240} width={820} height={64} rx={26} fill="#3A0A14" />
      <rect x={-410} y={-200} width={820} height={24} fill="#3A0A14" />
      <text x={-380} y={-196} fontFamily={SANS} fontWeight={800} fontSize={30} fill="#FFD6DC">
        Nuevo mensaje
      </text>
      <text x={-380} y={-130} fontFamily={SANS} fontWeight={700} fontSize={28} fill="#FF8A99">
        Para: Ejecutivo
      </text>
      <line x1={-380} y1={-112} x2={380} y2={-112} stroke="#FF2D45" strokeOpacity={0.35} strokeWidth={2} />
      {lines.map((l, i) => (
        <text key={i} x={-380} y={-40 + i * 74} fontFamily={SANS} fontWeight={900} fontSize={62} fill="#FF2D45">
          {l}
          {i === lines.length - 1 && blink && typed < BLACKMAIL.length ? <tspan fill="#FFFFFF">|</tspan> : null}
        </text>
      ))}
    </g>
  );
};

// ---------- el ejecutivo ----------
/** Silueta sin cara (busto), para no parecer una persona real. Origen en la base. */
export const ExecSilhouette: React.FC<{ worry?: number; frame: number }> = ({ worry = 0, frame }) => (
  <g transform={`translate(${worry * 3 * Math.sin(frame * 1.7)} 0)`}>
    <path d="M -170 0 C -170 -150 -110 -220 0 -228 C 110 -220 170 -150 170 0 Z" fill="#2A2F4F" />
    <circle cx={0} cy={-318} r={96} fill="#2A2F4F" />
    <path d="M -22 -226 L 22 -226 L 34 -100 L 0 -60 L -34 -100 Z" fill="#8C1C2E" />
    {worry > 0.01 ? (
      <path transform={`translate(80 -360) scale(${worry})`} d="M 0 -26 C 14 -8 20 6 20 14 A 20 20 0 0 1 -20 14 C -20 6 -14 -8 0 -26 Z" fill="#9FE3FF" stroke={INK} strokeWidth={4} />
    ) : null}
  </g>
);

// ---------- el celular de Sofi: permisos ----------
/** Pantalla "Permitir acceso" (coordenadas de la pantalla del celular, 276 × 596). */
export const PermissionScreen: React.FC<{ press: number; frame: number }> = ({ press, frame }) => (
  <g>
    <rect x={-138} y={-298} width={276} height={596} fill="#F4F5FA" />
    <g transform="translate(0 -200)">
      <circle r={40} fill="#20243A" />
      <circle r={14} fill="#38D6E8" opacity={0.7 + 0.3 * Math.sin(frame / 5)} />
    </g>
    <text x={0} y={-128} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={19} fill={INK}>
      Asistente de IA
    </text>
    <text x={0} y={-104} textAnchor="middle" fontFamily={SANS} fontWeight={500} fontSize={15} fill="#5A5F73">
      quiere acceder a tu cuenta
    </text>
    {["Leer todos tus correos", "Mandar correos por vos", "Ver tus contactos"].map((t, i) => (
      <g key={t} transform={`translate(-112 ${-58 + i * 40})`}>
        <circle cx={10} cy={-6} r={10} fill={C.peligro} opacity={0.85} />
        <text x={30} y={0} fontFamily={SANS} fontWeight={600} fontSize={15} fill={INK}>
          {t}
        </text>
      </g>
    ))}
    <g transform={`translate(0 120) scale(${1 - 0.05 * press})`}>
      <rect x={-118} y={-34} width={236} height={68} rx={20} fill="#2F6BFF" />
      {["Permitir acceso a", "todo tu correo"].map((t, i) => (
        <text key={t} x={0} y={-6 + i * 22} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={17} fill="#FFFFFF">
          {t}
        </text>
      ))}
    </g>
    <text x={0} y={190} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={16} fill="#5A5F73">
      Cancelar
    </text>
  </g>
);

const Toggle: React.FC<{ on: number }> = ({ on }) => (
  <g>
    <rect x={-30} y={-17} width={60} height={34} rx={17} fill={mix("#C9CCD9", "#34D058", on)} />
    <circle cx={lerp(-13, 13, on)} cy={0} r={13} fill="#FFFFFF" />
  </g>
);
/** Pantalla de permisos con interruptores: solo el calendario queda prendido (`cal` 0 … 1). */
export const TogglesScreen: React.FC<{ cal: number }> = ({ cal }) => (
  <g>
    <rect x={-138} y={-298} width={276} height={596} fill="#F4F5FA" />
    <text x={-116} y={-226} fontFamily={SANS} fontWeight={800} fontSize={20} fill={INK}>
      Permisos del asistente
    </text>
    {[
      { t: "📅 Calendario", on: cal },
      { t: "✉️ Correo", on: 0 },
      { t: "🗂️ Archivos", on: 0 },
      { t: "👥 Contactos", on: 0 },
    ].map((r, i) => (
      <g key={r.t} transform={`translate(0 ${-150 + i * 72})`}>
        <rect x={-124} y={-30} width={248} height={60} rx={14} fill="#FFFFFF" stroke={i === 0 && cal > 0.5 ? "#34D058" : "#D9DCE6"} strokeWidth={i === 0 && cal > 0.5 ? 4 : 2} />
        <text x={-108} y={8} fontFamily={SANS} fontWeight={700} fontSize={18} fill={INK}>
          {r.t}
        </text>
        <g transform="translate(78 0)">
          <Toggle on={r.on} />
        </g>
      </g>
    ))}
  </g>
);

// ---------- íconos de "ACTÚAN" ----------
export const IconMail: React.FC = () => (
  <g>
    <rect x={-70} y={-48} width={140} height={96} rx={12} fill="#FFFFFF" {...ST} />
    <path d="M -70 -44 L 0 12 L 70 -44" fill="none" {...ST} />
  </g>
);
export const IconComputer: React.FC = () => (
  <g>
    <rect x={-76} y={-60} width={152} height={100} rx={10} fill="#163B5C" {...ST} />
    <rect x={-62} y={-46} width={124} height={72} rx={4} fill="#38D6E8" opacity={0.6} />
    <path d="M -24 40 L 24 40 L 34 66 L -34 66 Z" fill="#3A3F5C" {...ST} />
  </g>
);
export const IconClick: React.FC<{ press: number }> = ({ press }) => (
  <g transform={`scale(${1 - 0.1 * press})`}>
    <path d="M -10 -60 C -10 -76 14 -76 14 -60 L 14 -14 L 46 -8 C 62 -4 64 10 60 24 L 48 66 L -24 66 L -50 18 C -58 4 -40 -8 -28 4 L -10 22 Z" fill={K.piel} {...ST} />
    {press > 0.01 ? <circle cx={2} cy={-80} r={20 + 30 * press} fill="none" stroke="#FFE27A" strokeWidth={6} opacity={1 - press} /> : null}
  </g>
);

/** Rojo de alerta en los bordes de la pantalla (coordenadas de pantalla), que late. */
export const AlertLight: React.FC<{ k: number; frame: number; id: string }> = ({ k, frame, id }) =>
  k > 0.01 ? (
    <g>
      <radialGradient id={`${id}-al`} cx="50%" cy="50%" r="75%">
        <stop offset="55%" stopColor="#FF1E3C" stopOpacity={0} />
        <stop offset="100%" stopColor="#FF1E3C" stopOpacity={0.55 * k * (0.7 + 0.3 * Math.sin(frame / 4))} />
      </radialGradient>
      <rect x={-200} y={-200} width={1480} height={2320} fill={`url(#${id}-al)`} />
    </g>
  ) : null;

/** Fuente en letra chica (centrada). */
export const SOURCE = "Anthropic · Agentic Misalignment · junio 2025";
export const SourceLine: React.FC<{ y: number; k: number }> = ({ y, k }) =>
  k > 0.01 ? (
    <text x={540} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={24} fill="#FFFFFF" opacity={0.8 * k}>
      {SOURCE}
    </text>
  ) : null;
