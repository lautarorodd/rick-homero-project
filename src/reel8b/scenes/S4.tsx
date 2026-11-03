import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, lerp, pop, pulse, ramp, track } from "../anim";
import { ChatGPTLogo } from "../objects/Brand";
import { IconCheck } from "../objects/Icons";
import { Phone } from "../objects/Phone";
import { FitSign } from "../objects/R3";
import { ANSWER, AMBER, ARCS, CYAN, ChatPhoneScreen, DataSign, LightOrb, Oven, Source8, Stove, Teaspoon, WaterDrop, WorldGlobe } from "../objects/R8";
import { SOFI_ARMS, Sofi } from "../objects/Sofi";
import { SceneCam } from "../stage";
import { SC, exitFade, pw, pwEnd } from "../timeline";
import { ACCOUNT, C, HOMERO as K, SANS } from "../tokens";
import { fitSize } from "../ui/fit";
import { Backdrop } from "../world/Backdrop";
import { AUDIO_DURATION, FPS } from "../words";
import { HomeroB, Tag } from "./common";
import { FACES, MOUTHS, homeroPose } from "./homeroPose";
import { Thumb } from "./Office";
import { ROOM, RoomSet } from "./S1";

/** Rayo de electricidad (zigzag) de `a` a `b`, que avanza con `k`. */
const Bolt: React.FC<{ a: { x: number; y: number }; b: { x: number; y: number }; k: number; frame: number }> = ({ a, b, k, frame }) => {
  if (k < 0.01) return null;
  const n = 9;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n;
    const j = i === 0 || i === n ? 0 : (i % 2 ? 1 : -1) * (18 + 8 * Math.sin(frame + i));
    return `${lerp(a.x, b.x, u) + j} ${lerp(a.y, b.y, u) - j * 0.5}`;
  }).slice(0, Math.max(2, Math.round(k * (n + 1))));
  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      <polyline points={pts.join(" ")} stroke="#FFE27A" strokeWidth={22} opacity={0.3} />
      <polyline points={pts.join(" ")} stroke="#FFFFFF" strokeWidth={7} />
    </g>
  );
};

// ---------------------------------------------------------------- H · el horno (frase 16)
const H = { electricidad: pw(15, "electricidad"), horno: pw(15, "horno"), un: pw(15, "un", 1), segundo: pw(15, "segundo") };
export const SceneH: React.FC = () => {
  const frame = useCurrentFrame();
  const heat = ramp(frame, H.horno - 4, H.horno + 6);
  const bolt = ramp(frame, H.electricidad - 4, H.electricidad + 8) * (1 - ramp(frame, H.horno + 10, H.horno + 18));
  const sign = frame < H.horno - 3 ? 0 : pop(frame, H.horno - 3, { damping: 13 });
  return (
    <g>
      <Backdrop id="h" bg="nocheRojo" texture="rays" seed={17} />
      <SceneCam
        keys={[
          [SC.H, 540, 1080, 1.0],
          [H.horno, 540, 1120, 1.06],
          [SC.I, 540, 1100, 1.1],
        ]}
      >
        <g transform="translate(150 1500) scale(0.55)">
          <rect x={-100} y={-220} width={200} height={440} rx={8} fill="#1D2147" stroke={K.contorno} strokeWidth={6} />
          {Array.from({ length: 8 }, (_, r) => (
            <circle key={r} cx={-50} cy={-180 + r * 50} r={8} fill={CYAN} opacity={Math.sin(frame / 3 + r) > 0 ? 1 : 0.3} />
          ))}
        </g>
        <Bolt a={{ x: 200, y: 1360 }} b={{ x: 400, y: 1160 }} k={bolt} frame={frame} />
        <g transform="translate(560 1200) scale(1.55)">
          <Oven heat={heat} frame={frame} timer={heat > 0.5 ? "1 s" : "0 s"} />
        </g>
      </SceneCam>
      {sign > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign * exitFade(frame, SC.I + 1)})`}>
          <DataSign lines={["≈ 1 segundo de horno"]} color={AMBER} />
        </g>
      ) : null}
      <Source8 y={720} k={sign * exitFade(frame, SC.I + 1)} />
    </g>
  );
};

// ---------------------------------------------------------------- I · la gotita (frase 17)
const I = { gotita: pw(16, "gotita"), agua: pw(16, "agua"), computadoras: pw(16, "computadoras"), calienten: pw(16, "calienten") };
export const SPOON = { x: 560, y: 1330 };
export const SceneI: React.FC = () => {
  const frame = useCurrentFrame();
  const fall = ramp(frame, I.gotita - 6, I.agua, EASE.in);
  const fill = ramp(frame, I.agua, I.agua + 10);
  const splash = frame >= I.agua ? clamp01((frame - I.agua) / 14) : 0;
  const sign = frame < SC.I + 8 ? 0 : pop(frame, SC.I + 8, { damping: 13 });
  const fan = (frame - SC.I) * (frame > I.computadoras ? 30 : 12);
  return (
    <g>
      <Backdrop id="i" bg="nocheTeal" texture="dots" seed={19} />
      <SceneCam
        keys={[
          [SC.I, 540, 1100, 1.0],
          [I.agua, 540, 1160, 1.08],
          [SC.J, SPOON.x - 40, SPOON.y - 20, 1.3],
        ]}
      >
        <g transform={`translate(${SPOON.x} ${SPOON.y}) scale(1.9)`}>
          <Teaspoon fill={fill} />
        </g>
        {fall < 1 ? (
          <g transform={`translate(${SPOON.x - 76} ${lerp(760, SPOON.y - 40, fall)})`}>
            <WaterDrop s={0.9} />
          </g>
        ) : null}
        {splash > 0.01 && splash < 1 ? (
          <g transform={`translate(${SPOON.x - 76} ${SPOON.y - 8})`} opacity={1 - splash}>
            <ellipse rx={30 + 110 * splash} ry={10 + 30 * splash} fill="none" stroke="#BFF6FF" strokeWidth={6} />
            {[-1, 1].map((d) => (
              <circle key={d} cx={d * (30 + 60 * splash)} cy={-50 * Math.sin(splash * Math.PI)} r={9} fill="#5FD0FF" />
            ))}
          </g>
        ) : null}
        {/* el rack que se enfría: ventilador que gira */}
        <g transform="translate(830 1000) scale(0.68)">
          <rect x={-110} y={-160} width={220} height={320} rx={16} fill="#1D2147" stroke={K.contorno} strokeWidth={6} />
          <circle cx={0} cy={-30} r={78} fill="#2A3068" stroke={K.contorno} strokeWidth={5} />
          <g transform={`translate(0 -30) rotate(${fan})`}>
            {[0, 120, 240].map((a) => (
              <path key={a} d="M 0 0 C 30 -20 50 -50 20 -68 C 0 -60 -6 -30 0 0 Z" fill="#7FD3FF" transform={`rotate(${a})`} />
            ))}
          </g>
          <text x={0} y={110} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={40} fill="#7FD3FF">
            ❄
          </text>
        </g>
      </SceneCam>
      {sign > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign * exitFade(frame, SC.J + 1)})`}>
          <DataSign lines={["≈ 1/15 de cucharadita", "de agua"]} color="#7FD3FF" />
        </g>
      ) : null}
      <Source8 y={770} k={sign * exitFade(frame, SC.J + 1)} />
    </g>
  );
};

// ---------------------------------------------------------------- K · aparece en su pantalla (frase 19)
const Kw = { aparece: pw(18, "aparece"), pantalla: pw(18, "pantalla") };
const ANS_LEN = ANSWER.join(" ").length;
export const SceneK: React.FC = () => {
  const frame = useCurrentFrame();
  const answer = lerp(0, ANS_LEN, ramp(frame, Kw.aparece - 4, SC.L - 2, EASE.linear));
  const orbK = ramp(frame, SC.K, SC.K + 10, EASE.in);
  return (
    <g>
      <Backdrop id="k" bg="nocheIndigo" texture="dots" seed={21} />
      <SceneCam
        keys={[
          [SC.K, 420, 900, 1.3],
          [Kw.aparece, ROOM.phone.x - 60, ROOM.phone.y - 120, 1.7],
          [SC.L, ROOM.phone.x - 40, ROOM.phone.y - 100, 1.8],
        ]}
      >
        <RoomSet frame={frame} />
        <Sofi id="k-sofi" x={ROOM.sofi.x} y={ROOM.sofi.y} scale={ROOM.sofi.scale} mood={frame > Kw.pantalla ? "happy" : "wow"} gazeX={0.6} gazeY={0.6} armR={SOFI_ARMS.celular} />
        <Phone id="k-phone" x={ROOM.phone.x} y={ROOM.phone.y} scale={ROOM.phone.scale} screenOn={1} glow={0.8}>
          <ChatPhoneScreen frame={frame} typed={999} sent={1} answer={answer} />
        </Phone>
        {orbK < 1 ? (
          <g transform={`translate(${lerp(ROOM.window.x, ROOM.phone.x, orbK)} ${lerp(ROOM.window.y, ROOM.phone.y - 60, orbK)}) scale(${1 - 0.6 * orbK})`}>
            <LightOrb frame={frame} color={AMBER} r={22} />
          </g>
        ) : null}
      </SceneCam>
    </g>
  );
};

// ---------------------------------------------------------------- L · la cocina (frases 20–21)
const L = { cocina: pw(19, "cocina"), novio: pw(20, "novio"), pide: pw(20, "pide"), receta: pw(20, "receta") };
export const KITCHEN_DOT = { x: 249, y: 1074 };
export const SceneL: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = ramp(frame, L.novio - 10, L.novio + 6, EASE.out);
  const bubble = frame < L.receta - 4 ? 0 : pop(frame, L.receta - 4, { damping: 12 });
  return (
    <g>
      <Backdrop id="l" bg="naranja" texture="dots" seed={23} />
      <SceneCam
        keys={[
          [SC.L, 520, 1100, 1.0],
          [L.novio, 600, 1080, 0.96],
          [SC.M, 600, 1080, 1.0],
        ]}
      >
        {/* azulejos y ventana con la noche afuera */}
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => <rect key={`${r}-${c}`} x={-60 + c * 140} y={620 + r * 120} width={130} height={110} rx={10} fill="#FFE2B0" opacity={0.35} />),
        )}
        <g transform="translate(860 760)">
          <rect x={-140} y={-130} width={280} height={260} rx={14} fill="#1B1F5E" stroke={K.contorno} strokeWidth={8} />
          <circle cx={60} cy={-50} r={34} fill="#FFF4C9" />
        </g>
        <Sofi id="l-sofi" x={420} y={1300} scale={0.9} mood="happy" gazeX={-0.2} gazeY={0.6} armL={{ shoulder: 20, elbow: -100 }} armR={{ shoulder: 30, elbow: 70 }} />
        <g transform="translate(420 1560)">
          <Stove frame={frame} stir={(frame - SC.L) / 40} />
        </g>
        <rect x={-300} y={1620} width={1700} height={500} fill="#C77B30" stroke={K.contorno} strokeWidth={6} />
        {enter > 0.01 ? <Sofi id="l-novio" x={lerp(1350, 850, enter)} y={1330} scale={0.85} mood={frame > L.receta ? "happy" : "wow"} gazeX={-0.8} gazeY={0.4} novio /> : null}
        {bubble > 0.01 ? (
          <g transform={`translate(780 820) scale(${bubble})`}>
            <rect x={-250} y={-60} width={500} height={120} rx={50} fill="#FFFFFF" stroke={K.contorno} strokeWidth={6} />
            <path d="M 60 56 L 110 120 L 120 56 Z" fill="#FFFFFF" stroke={K.contorno} strokeWidth={6} strokeLinejoin="round" />
            <rect x={56} y={50} width={70} height={14} fill="#FFFFFF" />
            <text x={0} y={16} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} fill="#1C1A24">
              ¿Me pasás la receta?
            </text>
          </g>
        ) : null}
        <Tag text="SOFI" x={200} y={700} tx={380} ty={800} k={(frame < SC.L + 4 ? 0 : pop(frame, SC.L + 4, { damping: 13 })) * (1 - ramp(frame, L.novio - 4, L.novio + 2))} />
      </SceneCam>
    </g>
  );
};

// ---------------------------------------------------------------- M · millones de personas (frase 22)
const M = { mismo: pw(21, "mismo"), segundo: pw(21, "segundo"), millones: pw(21, "millones"), personas: pw(21, "personas") };
const HUB = { x: 540, y: 1000 };
export const SceneM: React.FC = () => {
  const frame = useCurrentFrame();
  const n = lerp(10, ARCS, ramp(frame, SC.M + 10, M.millones + 6, EASE.inOut));
  const pose = homeroPose(frame, {
    face: [[0, { ...FACES.feliz, lidTop: 0.55, lidBottom: 0.25, gazeX: 0, gazeY: 0 }]],
    mouth: [[0, MOUTHS.sonrisa]],
    emotion: [[0, "neutro"]],
    halo: 1,
  });
  const sign = frame < M.mismo - 3 ? 0 : pop(frame, M.mismo - 3, { damping: 14 });
  return (
    <g>
      <Backdrop id="m" bg="nocheAzul" texture="dots" seed={25} />
      {frame >= M.millones - 6 ? (
        <g opacity={ramp(frame, M.millones - 6, M.millones + 8)}>
          <Backdrop id="m2" bg="nocheIndigo" texture="rays" seed={25} />
        </g>
      ) : null}
      <SceneCam
        keys={[
          [SC.M, 540, 1000, 1.25],
          [M.mismo, 540, 1000, 1.05],
          [M.millones, 540, 1000, 0.82],
          [SC.N, 540, 1000, 0.78],
        ]}
      >
        <g transform={`translate(${HUB.x} ${HUB.y})`}>
          <WorldGlobe frame={frame} n={n} hub={{ x: 0, y: 30 }} />
        </g>
        <circle cx={HUB.x} cy={HUB.y + 24} r={170 + 10 * Math.sin(frame / 8)} fill={CYAN} opacity={0.12} />
        <HomeroB id="m-homero" place={{ x: HUB.x, y: HUB.y + 150, scale: 0.36 }} pose={pose} badgeGlow={0.6} />
      </SceneCam>
      {sign > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign * exitFade(frame, SC.N + 1)})`}>
          <FitSign lines={["AL MISMO TIEMPO"]} size={84} maxW={860} color={CYAN} />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- N · CTA (frase 23)
const N = { mandaselo: pw(22, "mándaselo"), amigo: pw(22, "amigo"), impacienta: pw(22, "impacienta"), segundos: pw(22, "segundos"), end: pwEnd(22, "segundos") };
export const SHARE = { x: 540, y: 1200, scale: 1.55 };
const CONTACTS = [
  { n: "Nico", c: "#38D6E8", x: -96 },
  { n: "Caro", c: "#34D058", x: -32 },
  { n: "Santi", c: "#FFC53D", x: 32 },
  { n: "Juli", c: "#FF7AB6", x: 96 },
];
const END = Math.ceil(AUDIO_DURATION * FPS) + 40;

const ShareScreen: React.FC<{ frame: number; sheet: number; hover: number; selected: number; send: number; three: number }> = ({ frame, sheet, hover, selected, send, three }) => {
  const sy = lerp(320, -40, sheet);
  return (
    <g>
      <rect x={-138} y={-298} width={276} height={596} fill="#141833" />
      <circle cx={-40} cy={-160} r={170} fill="#2A2F6B" opacity={0.5} />
      {/* el reel que se comparte: el cartel del hook y la luz */}
      <rect x={-118} y={-262} width={236} height={196} rx={18} fill="#1B1F5E" stroke="rgba(127,243,255,0.6)" strokeWidth={2} />
      {["¿QUÉ PASA CUANDO", "APRETÁS ENVIAR?"].map((t, i) => (
        <text key={t} x={0} y={-226 + i * 30} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([t], 22, 210)} fill={i ? CYAN : "#FFFFFF"}>
          {t}
        </text>
      ))}
      <g transform="translate(0 -130)">
        <LightOrb frame={frame} r={12} />
      </g>
      <text x={0} y={-76} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={fitSize(["El viaje de tu pregunta a ChatGPT"], 15, 250, 800)} fill="#FFFFFF">
        El viaje de tu pregunta a ChatGPT
      </text>
      {sheet > 0.01 ? (
        <g>
          <rect x={-138} y={sy} width={276} height={360} rx={26} fill="#1F2450" stroke="rgba(255,255,255,0.15)" strokeWidth={2} />
          <rect x={-24} y={sy + 10} width={48} height={5} rx={2.5} fill="rgba(255,255,255,0.3)" />
          <text x={-116} y={sy + 44} fontFamily={SANS} fontWeight={700} fontSize={20} fill="#FFFFFF">
            Enviar a
          </text>
          {CONTACTS.map((c, i) => {
            const isSel = i === 2 && selected > 0;
            return (
              <g key={c.n}>
                <circle cx={c.x} cy={sy + 100} r={26} fill={c.c} />
                <text x={c.x} y={sy + 108} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={22} fill="#0A0C16">
                  {c.n[0]}
                </text>
                <text x={c.x} y={sy + 150} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={14} fill="#FFFFFF" opacity={0.9}>
                  {c.n}
                </text>
                {isSel ? (
                  <g>
                    <circle cx={c.x} cy={sy + 100} r={31} fill="none" stroke={C.seleccion} strokeWidth={4} />
                    <g transform={`translate(${c.x + 20} ${sy + 80}) scale(${0.62 * selected})`}>
                      <circle cx={0} cy={0} r={18} fill={C.seleccion} />
                      <IconCheck />
                    </g>
                  </g>
                ) : null}
              </g>
            );
          })}
          <rect x={hover - 34} y={sy + 66} width={68} height={68} rx={18} fill="none" stroke={C.seleccion} strokeWidth={3} opacity={selected > 0 ? 0 : 1} />
          {three > 0.01 ? (
            <g transform={`translate(${CONTACTS[2].x - 20} ${sy + 36 - 6 * Math.sin(frame / 5)}) scale(${three})`}>
              <rect x={-84} y={-20} width={168} height={38} rx={19} fill="#FFFFFF" stroke={K.contorno} strokeWidth={3} />
              <text x={0} y={6} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={16} fill="#1C1A24">
                {"“¿por qué tarda?” ⏳"}
              </text>
            </g>
          ) : null}
          <g transform={`translate(0 ${sy + 214}) scale(${1 - 0.06 * send})`}>
            <rect x={-100} y={-22} width={200} height={44} rx={22} fill={C.seleccion} opacity={selected > 0 ? 1 : 0.35} />
            <text x={0} y={7} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={18} fill="#FFFFFF">
              Enviar
            </text>
          </g>
        </g>
      ) : null}
    </g>
  );
};

export const SceneN: React.FC = () => {
  const frame = useCurrentFrame();
  const sheet = ramp(frame, N.mandaselo + 2, N.mandaselo + 16, EASE.out);
  const hover = track(frame, [
    [N.amigo - 6, CONTACTS[0].x],
    [N.amigo + 6, CONTACTS[1].x],
    [N.impacienta - 2, CONTACTS[2].x],
  ]);
  const three = frame < N.impacienta + 6 ? 0 : pop(frame, N.impacienta + 6, { damping: 12 });
  const selected = frame < N.segundos ? 0 : pop(frame, N.segundos, { damping: 11 });
  const sendAt = N.end + 4;
  const send = pulse(frame, sendAt, 2, 6);
  const toW = (lx: number, ly: number) => ({ x: SHARE.x + lx * SHARE.scale, y: SHARE.y + ly * SHARE.scale });
  const sheetY = lerp(320, -40, sheet);
  const thumbTo = frame < N.segundos + 4 ? toW(hover, sheetY + 120) : toW(0, sheetY + 230);
  const thumbIn = ramp(frame, N.amigo - 10, N.amigo - 2) * (1 - ramp(frame, sendAt + 6, sendAt + 14));
  const orbK = ramp(frame, sendAt + 2, sendAt + 26, EASE.inOut);
  const phoneOut = ramp(frame, sendAt + 10, sendAt + 22, EASE.in);
  const handle = frame < sendAt + 14 ? 0 : pop(frame, sendAt + 14, { damping: 14 });
  const cta = frame < N.mandaselo ? 0 : pop(frame, N.mandaselo, { damping: 14 });
  const pose = homeroPose(frame, {
    face: [
      [0, { ...FACES.feliz, gazeX: -0.6, gazeY: -0.7 }],
      [sendAt + 12, { ...FACES.feliz, lidSkew: 0.75, gazeX: 0, gazeY: 0 }, 5], // guiño
    ],
    mouth: [[0, MOUTHS.sonrisa]],
    emotion: [[0, "ok"]],
  });
  const homeroUp = frame < sendAt + 8 ? 0 : pop(frame, sendAt + 8, { damping: 15 });
  return (
    <g>
      <Backdrop id="n" bg="violeta" texture="dots" seed={27} />
      <SceneCam
        keys={[
          [SC.N, 540, 1040, 1.0],
          [N.impacienta, 550, 1020, 1.05],
          [sendAt, 540, 1000, 1.0],
          [END, 540, 990, 1.02],
        ]}
      >
        {phoneOut < 1 ? (
          <Phone id="n-share" x={SHARE.x} y={SHARE.y + phoneOut * 1300} scale={SHARE.scale} screenOn={1} glow={0.6}>
            <ShareScreen frame={frame} sheet={sheet} hover={hover} selected={selected} send={send} three={three} />
          </Phone>
        ) : null}
        {thumbIn > 0.01 ? <Thumb x={thumbTo.x + 40} y={thumbTo.y + 10 + (1 - thumbIn) * 400} press={Math.max(pulse(frame, N.segundos, 1, 4), send)} scale={0.9} /> : null}
        {orbK > 0 && orbK < 1 ? (
          <g transform={`translate(${lerp(SHARE.x, 980, orbK)} ${lerp(SHARE.y + 100, 520, orbK) - Math.sin(orbK * Math.PI) * 160})`}>
            <LightOrb frame={frame} r={22} />
          </g>
        ) : null}
        {homeroUp > 0.01 ? <HomeroB id="n-homero" place={{ x: 600, y: lerp(2500, 1830, homeroUp), scale: 0.95 }} pose={pose} /> : null}
        {handle > 0.01 ? (
          <g transform={`translate(540 1000) scale(${handle})`}>
            <rect x={-360} y={-74} width={720} height={148} rx={36} fill="rgba(20,24,51,0.95)" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
            <g transform="translate(-270 0) scale(0.44)">
              <ChatGPTLogo />
            </g>
            <text x={40} y={18} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={fitSize([ACCOUNT], 50, 540)} fill="#FFFFFF">
              {ACCOUNT}
            </text>
          </g>
        ) : null}
      </SceneCam>
      {cta > 0.01 ? (
        <g transform={`translate(540 570) scale(${cta * (1 - ramp(frame, sendAt + 10, sendAt + 16))})`}>
          <FitSign lines={["Mandáselo a ese amigo que se impacienta", "si ChatGPT tarda dos segundos"]} size={50} maxW={960} />
        </g>
      ) : null}
    </g>
  );
};
