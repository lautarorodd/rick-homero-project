import React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, clamp01, lerp, pop, ramp, track } from "../anim";
import { FitSign } from "../objects/R3";
import { AMBER, CYAN, Chip, Corridor, FlashPulse, JourneyWorld, LightOrb, PATH_MARK, Trail, pathAt } from "../objects/R8";
import { SC, exitFade, pw } from "../timeline";
import { Backdrop } from "../world/Backdrop";

/** Cámara que sigue a la luz por el mundo del viaje: el orbe queda en (540, oy) de la pantalla. */
const Follow: React.FC<{ u: number; s: number; oy?: number; children: React.ReactNode }> = ({ u, s, oy = 1020, children }) => {
  const p = pathAt(u);
  return <g transform={`translate(${540 - p.x * s} ${oy - p.y * s}) scale(${s})`}>{children}</g>;
};

const Orb: React.FC<{ u: number; color: string; frame: number; dir?: 1 | -1 }> = ({ u, color, frame, dir = 1 }) => {
  const p = pathAt(u);
  const pts = Array.from({ length: 16 }, (_, i) => pathAt(u - dir * (15 - i) * 0.006));
  return (
    <g>
      <Trail pts={pts} color={color} w={34} />
      <g transform={`translate(${p.x} ${p.y})`}>
        <LightOrb frame={frame} color={color} r={26} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- C · el viaje (frases 6–8)
const C = { viaja: pw(7, "viaja"), cables: pw(7, "cables"), veces: pw(7, "veces"), fondo: pw(7, "fondo"), mar: pw(7, "mar"), hasta: pw(8, "hasta"), edificio: pw(8, "edificio"), enorme: pw(8, "enorme") };
/** Recorrido de la luz a la ida (fracción del camino), anclado a las palabras. */
export const uGo = (frame: number) =>
  track(frame, [
    [SC.C, 0.0],
    [C.cables, PATH_MARK.pole1 + 0.04],
    [C.fondo, PATH_MARK.shore + 0.05],
    [C.mar, PATH_MARK.seabed + 0.06],
    [C.edificio, PATH_MARK.coast + 0.02],
    [SC.D, 1],
  ], EASE.linear);

export const SceneC: React.FC = () => {
  const frame = useCurrentFrame();
  const u = uGo(frame);
  const s = track(frame, [
    [SC.C, 1.25],
    [C.cables, 0.85],
    [C.mar, 0.8],
    [C.edificio, 0.72],
    [SC.D, 1.0],
  ]);
  const sign1 = 1 - ramp(frame, C.fondo - 4, C.fondo + 2);
  const sign2 = frame < C.edificio - 4 ? 0 : pop(frame, C.edificio - 4, { damping: 14 });
  return (
    <g>
      <Backdrop id="c" bg="nocheIndigo" texture="dots" seed={7} />
      <Follow u={u} s={s}>
        <JourneyWorld frame={frame} u={u} color={CYAN} dcSign={0} />
        <Orb u={u} color={CYAN} frame={frame} />
      </Follow>
      {sign1 > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign1})`}>
          <FitSign lines={["VIAJA COMO LUZ"]} size={84} maxW={860} color={CYAN} />
        </g>
      ) : null}
      {sign2 > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign2 * exitFade(frame, SC.D + 1)})`}>
          <FitSign lines={["CENTRO DE DATOS"]} size={92} maxW={880} color={CYAN} />
        </g>
      ) : null}
      <Chip text="POR EL FONDO DEL MAR" k={(frame < C.fondo - 3 ? 0 : pop(frame, C.fondo - 3, { damping: 12 })) * (1 - ramp(frame, C.hasta - 2, C.hasta + 4))} />
      <FlashPulse frame={frame} hits={[C.cables, C.veces, C.fondo, C.mar, C.hasta, C.edificio, C.enorme]} y={1020} />
    </g>
  );
};

// ---------------------------------------------------------------- D · pasillos infinitos (frase 8)
const D = { computadoras: pw(8, "computadoras"), nunca: pw(8, "nunca"), apagan: pw(8, "apagan") };
export const SceneD: React.FC = () => {
  const frame = useCurrentFrame();
  const z = (frame - SC.D) * 0.06;
  // la luz avanza por el pasillo hacia el punto de fuga y se mete en un rack
  const k = ramp(frame, SC.D, SC.E, EASE.inOut);
  const ox = lerp(540, 540, k);
  const oy = lerp(1560, 1000, k);
  const os = lerp(1.2, 0.25, k);
  const pts = Array.from({ length: 10 }, (_, i) => {
    const kk = clamp01(k - (9 - i) * 0.03);
    return { x: 540, y: lerp(1560, 1000, kk) };
  });
  const tag = frame < D.computadoras - 2 ? 0 : pop(frame, D.computadoras - 2, { damping: 14 });
  return (
    <g>
      <Corridor frame={frame} z={z} />
      <Trail pts={pts} color={CYAN} w={40 * os} />
      <g transform={`translate(${ox} ${oy}) scale(${os})`}>
        <LightOrb frame={frame} r={30} />
      </g>
      {tag > 0.01 ? (
        <g transform={`translate(540 600) scale(${tag * exitFade(frame, SC.E + 1)})`}>
          <FitSign lines={["CENTRO DE DATOS"]} size={92} maxW={880} color={CYAN} />
        </g>
      ) : null}
      <Chip text="NUNCA SE APAGAN" k={(frame < D.nunca - 3 ? 0 : pop(frame, D.nunca - 3, { damping: 12 })) * exitFade(frame, SC.E + 1)} />
      <FlashPulse frame={frame} hits={[D.computadoras, D.nunca, D.apagan]} y={980} />
    </g>
  );
};

// ---------------------------------------------------------------- J · la vuelta (frase 18)
const J = { hace: pw(17, "hace"), vuelta: pw(17, "vuelta") };
export const SceneJ: React.FC = () => {
  const frame = useCurrentFrame();
  const u = track(frame, [
    [SC.J, 1],
    [J.vuelta, 0.45],
    [SC.K, 0.0],
  ], EASE.inOut);
  const s = track(frame, [
    [SC.J, 0.8],
    [J.vuelta, 0.6],
    [SC.K, 1.3],
  ]);
  const sign = frame < SC.J + 4 ? 0 : pop(frame, SC.J + 4, { damping: 14 });
  return (
    <g>
      <Backdrop id="j" bg="nocheIndigo" texture="dots" seed={9} />
      <Follow u={u} s={s}>
        <JourneyWorld frame={frame} u={1} color={AMBER} dcSign={1} />
        <Orb u={u} color={AMBER} frame={frame} dir={-1} />
      </Follow>
      <FlashPulse frame={frame} hits={[J.hace, J.vuelta]} color={AMBER} y={1020} />
      {sign > 0.01 ? (
        <g transform={`translate(540 600) scale(${sign * exitFade(frame, SC.K + 1)})`}>
          <FitSign lines={["EL VIAJE DE VUELTA"]} size={84} maxW={860} color={AMBER} />
        </g>
      ) : null}
    </g>
  );
};
