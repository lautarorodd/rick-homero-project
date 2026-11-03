import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, lerp, pop, pulse, ramp, track } from "../anim";
import { Phone } from "../objects/Phone";
import { FitSign } from "../objects/R3";
import { CYAN, ChatPhoneScreen, DigitalClock, FlashPulse, Lamp, LightOrb, NightWindow, QUESTION, Trail, WorldGlobe } from "../objects/R8";
import { SOFI_ARMS, Sofi } from "../objects/Sofi";
import { SceneCam } from "../stage";
import { SC, exitFade, pw, pwEnd } from "../timeline";
import { HOMERO as K } from "../tokens";
import { Backdrop } from "../world/Backdrop";
import { HomeroB, Tag } from "./common";
import { FACES, MOUTHS, homeroPose } from "./homeroPose";
import { Thumb } from "./Office";

/** Puesta del cuarto de Sofi (la usan el hook, B y K). */
export const ROOM = {
  window: { x: 300, y: 760 },
  clock: { x: 200, y: 1290 },
  sofi: { x: 640, y: 1360, scale: 0.86 },
  phone: { x: 640 + 172, y: 1360 + 44, scale: 0.72 },
};

// ---------------------------------------------------------------- A · hook (frases 1–2)
// "Yo, ChatGPT, no estoy en tu celular." Homero (CHATGPT) asoma desde ADENTRO del celular de Sofi y, en "no
// estoy", sale disparado: la cámara se aleja de golpe, atraviesa el techo, la ciudad y el globo hasta el
// punto lejano donde está él ("Estoy a miles de kilómetros"). En "Mira", picada de vuelta al cuarto, en el
// mismo encuadre con el que arranca B (el paso es continuo). Tres capas anidadas: el cuarto (unidades de
// escena), la ciudad (1 unidad = K1 del cuarto, la ventana de Sofi en W) y el globo (1 unidad = K2 de la
// ciudad, Sofi en GD).
const A = { chatgpt: pw(1, "chatgpt"), no: pw(1, "no"), celular: pw(1, "celular"), estoy: pw(2, "estoy"), miles: pw(2, "miles"), km: pw(2, "kilómetros"), mira: pw(2, "mira") };
const RC = { x: 560, y: 1150 }; // centro del cuarto = encuadre inicial de B
const PHONE_C = { x: ROOM.phone.x, y: ROOM.phone.y - 30 };
const CAM0 = { x: ROOM.phone.x, y: ROOM.phone.y - 150 }; // el celular abajo y la cabeza de Homero debajo del cartel
const K1 = 30;
const K2 = 500;
const W = { x: 0, y: 0 };
const GD = { x: -190, y: 150 }; // Sofi, en el globo
const GF = { x: 210, y: -170 }; // el centro de datos donde está Homero, lejos
const GMID = { x: (GD.x + GF.x) / 2, y: (GD.y + GF.y) / 2 + 10 };
const S0 = 2.5;
const S_END = 1.15 / (K1 * K2);
const lnS = (frame: number) =>
  frame < A.no + 2
    ? Math.log(lerp(S0 * 0.94, S0, 1 - frame / (A.no + 2)))
    : frame < A.km
      ? lerp(Math.log(S0 * 0.94), Math.log(S_END), EASE.inOut(clamp01((frame - A.no - 2) / (A.km - A.no - 2))))
      : frame < A.mira - 2
        ? Math.log(S_END) - 0.12 * ((frame - A.km) / (A.mira - A.km))
        : lerp(Math.log(S_END) - 0.12, 0, EASE.inOut(clamp01((frame - A.mira + 2) / (SC.B - A.mira + 2))));

/** Transformación de una capa: su escala en pantalla y el punto (en sus coordenadas) que va al centro. */
const layerT = (s: number, c: { x: number; y: number }) => `translate(${540 - c.x * s} ${960 - c.y * s}) scale(${s})`;

/** La ciudad de noche alrededor de la casa de Sofi (la ventana encendida en W). */
const CityLayer: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-3000} y={-3000} width={6000} height={3000} fill="#151A55" />
    <rect x={-3000} y={0} width={6000} height={3000} fill="#141236" />
    {Array.from({ length: 40 }, (_, i) => (
      <circle key={i} cx={-1400 + ((i * 337) % 2800)} cy={-1100 + ((i * 211) % 900)} r={3 + (i % 3)} fill="#FFFFFF" opacity={0.4 + 0.4 * Math.abs(Math.sin(frame / 15 + i))} />
    ))}
    {Array.from({ length: 22 }, (_, i) => {
      const x = -1500 + i * 140;
      const h = 160 + ((i * 97) % 260);
      return (
        <g key={i}>
          <rect x={x} y={140 - h} width={110} height={h} fill="#26236A" />
          {Array.from({ length: 6 }, (_, j) => (
            <rect key={j} x={x + 14 + (j % 3) * 30} y={160 - h + Math.floor(j / 3) * 50} width={16} height={22} fill="#FFD27A" opacity={(i * 7 + j * 3) % 5 > 1 ? 0.8 : 0.12} />
          ))}
        </g>
      );
    })}
    {/* la casa de Sofi: el techo que atraviesa la cámara y la ventana encendida (adentro está el cuarto) */}
    <rect x={-70} y={-110} width={140} height={250} fill="#3B2A6E" stroke={K.contorno} strokeWidth={4} />
    <path d="M -90 -110 L 0 -190 L 90 -110 Z" fill="#5A3A7A" stroke={K.contorno} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-20} y={-17} width={40} height={34} fill="#FFD27A" stroke={K.contorno} strokeWidth={3} />
    <rect x={-3000} y={140} width={6000} height={20} fill="#2A2560" />
  </g>
);

export const SceneA: React.FC = () => {
  const frame = useCurrentFrame();
  const S = Math.exp(lnS(frame));
  // centro de cámara: en el celular durante el zoom out; en el globo se corre al medio entre Sofi y Homero;
  // en la picada vuelve a Sofi y termina en el centro del cuarto (el encuadre de B)
  const toMid = track(frame, [
    [A.km - 10, 0],
    [A.km + 8, 1],
    [A.mira - 2, 1],
    [A.mira + 8, 0],
  ]);
  const camG = { x: lerp(GD.x, GMID.x, toMid), y: lerp(GD.y, GMID.y, toMid) };
  const back = ramp(frame, A.mira + 4, SC.B);
  // (con el mismo bamboleo que SceneCam: el último cuadro coincide con el primero de B)
  const roomBase = { x: lerp(CAM0.x, RC.x, back) + Math.sin(frame / 47) * 4, y: lerp(CAM0.y, RC.y, back) + Math.cos(frame / 53) * 3 };
  const cam = { x: roomBase.x + (camG.x - GD.x) * K1 * K2, y: roomBase.y + (camG.y - GD.y) * K1 * K2 };
  const camCity = { x: W.x + (cam.x - RC.x) / K1, y: W.y + (cam.y - RC.y) / K1 };
  const camGlobe = { x: GD.x + (camCity.x - W.x) / K2, y: GD.y + (camCity.y - W.y) / K2 };
  const sCity = S * K1;
  const sGlobe = S * K1 * K2;
  // cada capa se ve en su rango de escala (fundidos en escala logarítmica)
  const roomK = clamp01((Math.log(S) - Math.log(0.05)) / (Math.log(0.16) - Math.log(0.05)));
  const cityK = clamp01((Math.log(sCity) - Math.log(0.04)) / (Math.log(0.12) - Math.log(0.04)));
  // Homero: asoma del celular (desde el cuadro 0) y en "no estoy" sale disparado hacia arriba
  const rise = EASE.out(clamp01(frame / 14));
  const fly = EASE.in(ramp(frame, A.no - 2, A.no + 10, EASE.linear));
  const pose = homeroPose(frame, {
    face: [
      [0, { ...FACES.feliz, lidTop: 0.3, gazeX: 0, gazeY: 0 }],
      [A.no - 4, { ...FACES.sorprendido, gazeX: 0, gazeY: -0.6 }, 4],
    ],
    mouth: [[0, MOUTHS.sonrisa]],
    armL: [[0, { shoulder: 30, elbow: 110, hand: 0 }]],
    gestL: [[0, "open"]],
    emotion: [[0, "neutro"]],
    tilt: 4 * Math.sin(frame / 6),
  });
  const HP = { x: PHONE_C.x + 260 * fly, y: lerp(PHONE_C.y + 330, PHONE_C.y - 40, rise) - 1600 * fly, scale: 0.3 * (1 - 0.85 * fly) };
  const screenOf = (p: { x: number; y: number }) => ({ x: 540 + (p.x - cam.x) * S, y: 960 + (p.y - cam.y) * S });
  const tag1 = (frame < 2 ? 0 : pop(frame, 2, { damping: 14 })) * (1 + 0.2 * pulse(frame, A.chatgpt, 3, 14)) * (1 - ramp(frame, A.no, A.no + 6));
  const tagHead = screenOf({ x: HP.x, y: HP.y - 300 * HP.scale });
  const sign = (frame < 3 ? 0 : pop(frame, 3, { damping: 13 })) * (1 - ramp(frame, 50, 58));
  // el globo: Sofi (cian) y, lejos, el centro de datos con Homero; el arco con la luz que viaja
  const globeIn = clamp01(1 - cityK); // se apaga por escala (en la picada, cuando aparece la ciudad)
  const arc = ramp(frame, A.estoy, A.km + 6);
  const chip = frame < A.miles - 3 ? 0 : pop(frame, A.miles - 3, { damping: 13 }) * (1 - ramp(frame, A.mira, A.mira + 6));
  const farHomero = frame < A.estoy ? 0 : pop(frame, A.estoy, { damping: 13 });
  const qd = (k: number) => {
    const mid = { x: GMID.x - 40, y: GMID.y - 180 };
    return { x: (1 - k) * (1 - k) * GD.x + 2 * (1 - k) * k * mid.x + k * k * GF.x, y: (1 - k) * (1 - k) * GD.y + 2 * (1 - k) * k * mid.y + k * k * GF.y };
  };
  const pts = Array.from({ length: 24 }, (_, i) => qd((i / 23) * arc));
  const tag2Pos = { x: 540 + (GF.x - camGlobe.x) * sGlobe, y: 960 + (GF.y - 70 - camGlobe.y) * sGlobe };
  return (
    <g>
      <Backdrop id="a" bg="nocheIndigo" texture="dots" seed={3} />
      {/* el globo (abajo de todo) */}
      {S < 0.02 ? (
        <g transform={layerT(sGlobe, camGlobe)} opacity={globeIn}>
          <WorldGlobe frame={frame} n={8} hub={GF} />
          {arc > 0.01 ? <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={CYAN} strokeWidth={4 / Math.max(0.6, sGlobe)} strokeDasharray="10 8" /> : null}
          {arc > 0.01 ? (
            <g transform={`translate(${pts[pts.length - 1].x} ${pts[pts.length - 1].y}) scale(${0.45 / Math.max(0.6, sGlobe)})`}>
              <LightOrb frame={frame} r={20} />
            </g>
          ) : null}
          <g transform={`translate(${GD.x} ${GD.y})`}>
            <circle r={20} fill={CYAN} opacity={0.35 + 0.2 * Math.sin(frame / 4)} />
            <circle r={9} fill="#FFFFFF" />
          </g>
          <g transform={`translate(${GF.x} ${GF.y})`}>
            <circle r={60} fill={CYAN} opacity={0.18} />
            <rect x={-40} y={-30} width={80} height={60} rx={6} fill="#232A57" stroke={CYAN} strokeWidth={3} />
            {[0, 1, 2].map((r) => (
              <rect key={r} x={-30} y={-22 + r * 18} width={60} height={8} rx={3} fill={CYAN} opacity={0.5 + 0.5 * Math.sin(frame / 4 + r)} />
            ))}
          </g>
          {farHomero > 0.01 ? <HomeroB id="a-far" place={{ x: GF.x + 70, y: GF.y + 60, scale: 0.17 * farHomero }} pose={pose} badgeGlow={0.8} /> : null}
        </g>
      ) : null}
      {/* la ciudad */}
      {cityK > 0.01 && sCity < 40 ? (
        <g transform={layerT(sCity, camCity)} opacity={cityK}>
          <CityLayer frame={frame} />
        </g>
      ) : null}
      {/* el cuarto de Sofi, con Homero que asoma del celular */}
      {roomK > 0.01 ? (
        <g opacity={roomK}>
          <g transform={layerT(S, cam)}>
            <RoomSet frame={frame} />
            <Sofi id="b-sofi" x={ROOM.sofi.x} y={ROOM.sofi.y} scale={ROOM.sofi.scale} mood="determined" gazeX={0.6} gazeY={0.6} armR={SOFI_ARMS.celular} />
            <Phone id="b-phone" x={ROOM.phone.x} y={ROOM.phone.y} scale={ROOM.phone.scale} screenOn={1} glow={0.7 + 0.3 * (1 - fly)}>
              <ChatPhoneScreen frame={frame} typed={0} sent={0} />
            </Phone>
            {fly < 1 ? (
              <g>
                <clipPath id="a-from-phone">
                  <rect x={ROOM.phone.x - 99} y={ROOM.phone.y - 2600} width={198} height={2600 + 214} />
                </clipPath>
                <g clipPath={fly < 0.05 ? "url(#a-from-phone)" : undefined} opacity={1 - fly * 0.6}>
                  <HomeroB id="a-homero" place={HP} pose={pose} badgeGlow={0.4 + 0.6 * pulse(frame, A.chatgpt, 3, 16)} />
                </g>
                {fly > 0.01 ? <rect x={HP.x - 8} y={HP.y} width={16} height={1600 * fly} fill={CYAN} opacity={0.5 * (1 - fly)} /> : null}
              </g>
            ) : null}
          </g>
        </g>
      ) : null}
      <FlashPulse frame={frame} hits={[A.km]} x={540 + (GF.x - camGlobe.x) * sGlobe} y={960 + (GF.y - camGlobe.y) * sGlobe} />
      <Tag text="CHATGPT" x={Math.min(900, tagHead.x + 230)} y={Math.max(700, tagHead.y - 40)} tx={tagHead.x + 60} ty={tagHead.y + 40} k={tag1} />
      <Tag text="CHATGPT" x={Math.min(880, tag2Pos.x + 120)} y={tag2Pos.y - 120} tx={tag2Pos.x} ty={tag2Pos.y} k={farHomero * (1 - ramp(frame, A.mira, A.mira + 6))} />
      {chip > 0.01 ? (
        <g transform={`translate(540 1470) scale(${chip})`}>
          <FitSign lines={["A MILES DE KILÓMETROS"]} size={64} maxW={860} color={CYAN} />
        </g>
      ) : null}
      {sign > 0.01 ? (
        <g transform={`translate(540 620) rotate(-2) scale(${sign})`}>
          <FitSign lines={["CHATGPT NO ESTÁ", "EN TU CELULAR"]} size={92} maxW={900} colors={["#FFFFFF", CYAN]} />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- B · las 23:00 (frases 3–6)
// El cuarto de Sofi de noche: el reloj, Sofi que escribe, aprieta enviar y la pregunta sale como luz por la
// ventana.
const B = {
  once: pw(3, "once"),
  sofi: pw(4, "sofi"),
  que: pw(4, "qué"),
  vegEnd: pwEnd(4, "vegetariano"),
  enviar: pw(5, "enviar"),
  sale: pw(6, "sale"),
  celular: pw(6, "celular"),
  convertida: pw(6, "convertida"),
  novio: pw(4, "novio"),
  veg: pw(4, "vegetariano"),
};
/** Punto de la pantalla del celular de Sofi (coordenadas de la pantalla del celular → escena). */
const onPhone = (lx: number, ly: number) => ({ x: ROOM.phone.x + lx * ROOM.phone.scale, y: ROOM.phone.y + ly * ROOM.phone.scale });

/** El cuarto (pared, ventana, mesa de luz con el reloj y la lámpara, cama). */
export const RoomSet: React.FC<{ frame: number; clockPulse?: number }> = ({ frame, clockPulse = 0 }) => (
  <g>
    <linearGradient id="room-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2A2363" />
      <stop offset="100%" stopColor="#3B2A6E" />
    </linearGradient>
    <rect x={-400} y={-400} width={1900} height={2800} fill="url(#room-wall)" />
    {/* luz de luna que entra por la ventana */}
    <path d={`M ${ROOM.window.x - 180} ${ROOM.window.y - 220} L ${ROOM.window.x + 180} ${ROOM.window.y - 220} L ${ROOM.window.x + 620} 1700 L ${ROOM.window.x + 60} 1700 Z`} fill="#BFD4FF" opacity={0.07 + 0.02 * Math.sin(frame / 20)} />
    <g transform={`translate(${ROOM.window.x} ${ROOM.window.y})`}>
      <NightWindow frame={frame} />
    </g>
    <rect x={-400} y={1480} width={1900} height={900} fill="#231C4E" />
    {/* cama */}
    <rect x={380} y={1420} width={900} height={200} rx={30} fill="#5A4AA8" stroke={K.contorno} strokeWidth={6} />
    <rect x={380} y={1400} width={900} height={60} rx={24} fill="#EDE6FF" stroke={K.contorno} strokeWidth={6} />
    {/* mesa de luz, reloj y lámpara */}
    <rect x={40} y={1350} width={300} height={260} rx={16} fill="#6E4A3A" stroke={K.contorno} strokeWidth={6} />
    <g transform={`translate(${ROOM.clock.x} ${ROOM.clock.y})`}>
      <DigitalClock frame={frame} pulse={clockPulse} />
    </g>
    <g transform="translate(300 1350) scale(0.75)">
      <Lamp />
    </g>
  </g>
);

export const SceneB: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = lerp(0, QUESTION.length, ramp(frame, B.que - 4, B.vegEnd - 2, EASE.linear));
  const sent = ramp(frame, B.enviar + 2, B.enviar + 10, EASE.out);
  const press = pulse(frame, B.enviar, 2, 8);
  // la pregunta se vuelve luz y sale del celular hacia la ventana (con una curva suave)
  const fly = ramp(frame, B.sale - 2, SC.C + 4, EASE.inOut);
  const from = onPhone(0, -150);
  const to = { x: ROOM.window.x, y: ROOM.window.y };
  const orbAt = (k: number) => ({
    x: lerp(from.x, to.x, k) + Math.sin(k * Math.PI) * -120,
    y: lerp(from.y, to.y, k) - Math.sin(k * Math.PI) * 160,
  });
  const orb = orbAt(fly);
  const trail = Array.from({ length: 12 }, (_, i) => orbAt(Math.max(0, fly - (11 - i) * 0.025)));
  const leave = ramp(frame, B.sale - 2, B.sale + 4);
  const thumbIn = ramp(frame, B.que - 10, B.que - 2) * (1 - ramp(frame, B.enviar + 8, B.enviar + 18));
  const send = onPhone(108, 247);
  const typing = frame < B.vegEnd ? Math.abs(Math.sin(frame / 2)) : 0;
  const thumb = frame < B.enviar - 6 ? onPhone(-40 + 60 * Math.sin(frame / 5), 250) : send;
  const tag = (frame < B.sofi - 2 ? 0 : pop(frame, B.sofi - 2, { damping: 13 })) * (1 - ramp(frame, B.que, B.que + 6));
  return (
    <g>
      <Backdrop id="b" bg="nocheIndigo" texture="dots" seed={5} />
      <SceneCam
        keys={[
          [SC.B, 560, 1150, 1.0],
          [B.once - 4, 300, 1240, 1.45],
          [B.sofi - 6, 300, 1240, 1.45],
          [B.sofi + 4, 680, 1180, 1.12],
          [B.que - 2, ROOM.phone.x, ROOM.phone.y - 40, 2.25],
          [B.enviar + 6, ROOM.phone.x, ROOM.phone.y - 40, 2.35],
          [B.sale + 8, 640, 1150, 1.25],
          [SC.C, 420, 900, 1.6],
        ]}
      >
        <RoomSet frame={frame} clockPulse={pulse(frame, B.once, 4, 24)} />
        <Sofi id="b-sofi" x={ROOM.sofi.x} y={ROOM.sofi.y} scale={ROOM.sofi.scale} mood={frame < B.enviar ? "determined" : "happy"} gazeX={0.6} gazeY={0.6} armR={SOFI_ARMS.celular} />
        <Phone id="b-phone" x={ROOM.phone.x} y={ROOM.phone.y} scale={ROOM.phone.scale} screenOn={1} glow={0.7}>
          <ChatPhoneScreen frame={frame} typed={typed} sent={sent} pressed={press} glow={frame >= B.vegEnd && frame < B.enviar + 4 ? 0.6 + 0.4 * Math.sin(frame / 4) : 0} leave={leave} />
        </Phone>
        {thumbIn > 0.01 ? <Thumb x={thumb.x + 18} y={thumb.y + 12 + (1 - thumbIn) * 200 - 6 * typing} press={press} scale={0.42} /> : null}
        {fly > 0.001 ? (
          <g>
            <Trail pts={trail} color={CYAN} w={26} />
            <g transform={`translate(${orb.x} ${orb.y})`}>
              <LightOrb frame={frame} r={20} />
            </g>
          </g>
        ) : null}
        <Tag text="SOFI" x={420} y={760} tx={600} ty={860} k={tag} />
        {/* lo que pregunta, en emojis que saltan del celular */}
        {[
          { e: "❤️", at: B.novio - 2, dx: -150 },
          { e: "🥦", at: B.veg, dx: 150 },
        ].map((m) => {
          const k = frame < m.at ? 0 : pop(frame, m.at, { damping: 10 }) * (1 - ramp(frame, B.enviar - 4, B.enviar + 2));
          return k > 0.01 ? (
            <text key={m.e} x={ROOM.phone.x + m.dx} y={ROOM.phone.y - 260 - 30 * k} textAnchor="middle" fontSize={90 * k}>
              {m.e}
            </text>
          ) : null;
        })}
      </SceneCam>
      <FlashPulse frame={frame} hits={[B.sale, B.celular]} />
      <FlashPulse frame={frame} hits={[B.que, B.novio, B.veg]} x={600} y={900} />
      {frame >= B.convertida - 4 ? (
        <g transform={`translate(540 600) scale(${pop(frame, B.convertida - 4, { damping: 14 }) * exitFade(frame, SC.C + 1)})`}>
          <FitSign lines={["VIAJA COMO LUZ"]} size={84} maxW={860} color={CYAN} />
        </g>
      ) : null}
    </g>
  );
};
