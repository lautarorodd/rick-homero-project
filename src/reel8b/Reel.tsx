import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, Track, staticFile } from "remotion";
import { SceneA, SceneB } from "./scenes/S1";
import { SceneC, SceneD, SceneJ } from "./scenes/S2";
import { SceneE, SceneF } from "./scenes/S3";
import { SHARE, SceneH, SceneI, SceneK, SceneL, SceneM, SceneN } from "./scenes/S4";
import { SFX, speaking } from "./sfx";
import { GlobalCam, SceneDef, Stage } from "./stage";
import { SC } from "./timeline";
import { C } from "./tokens";
import { Subtitles } from "./ui/Subtitles";
import { AUDIO_DURATION, AUDIO_SRC, FPS } from "./words";

// Reel 8b — "¿Qué pasa cuando apretás enviar?" (corregido: voz a velocidad normal y hook nuevo): seguimos la pregunta de Sofi en su viaje de ida y vuelta. Un
// solo viaje continuo: cada escena entra por un portal (la cámara se mete en un objeto), sale de uno
// (unportal) o por un paneo suave que sigue a la luz. Sin cortes duros y sin sacudidas.
const SCENES: SceneDef[] = [
  { id: "A", from: SC.A, C: SceneA },
  // el hook termina con la picada al cuarto en el mismo encuadre con el que arranca B: el paso es continuo
  { id: "B", from: SC.B, C: SceneB },
  // la luz sale por la ventana: la cámara pasa por la ventana al mundo de afuera
  { id: "C", from: SC.C, C: SceneC, tr: { kind: "portal", x: 348, y: 736, r: 150, dur: 12 } },
  // entra por la puerta del centro de datos
  { id: "D", from: SC.D, C: SceneD, tr: { kind: "portal", x: 540, y: 1020, r: 110, dur: 12 } },
  // se mete en un rack, al fondo del pasillo
  { id: "E", from: SC.E, C: SceneE, tr: { kind: "portal", x: 540, y: 1000, r: 80, dur: 12 } },
  { id: "F", from: SC.F, C: SceneF, tr: { kind: "pan", dir: 1, dur: 8 } },
  { id: "H", from: SC.H, C: SceneH, tr: { kind: "pan", dir: -1, dur: 8 } },
  { id: "I", from: SC.I, C: SceneI, tr: { kind: "pan", dir: 1, dur: 8 } },
  // la cámara entra en la gotita de la cucharita y sale al camino de vuelta
  { id: "J", from: SC.J, C: SceneJ, tr: { kind: "portal", x: 493, y: 986, r: 110, dur: 12 } },
  // la luz cálida entra por la ventana de Sofi
  { id: "K", from: SC.K, C: SceneK, tr: { kind: "portal", x: 540, y: 1020, r: 140, dur: 12 } },
  { id: "L", from: SC.L, C: SceneL, tr: { kind: "pan", dir: -1, dur: 8 } },
  // la cocina se achica hasta ser un punto del mapa del mundo
  { id: "M", from: SC.M, C: SceneM, tr: { kind: "unportal", x: 176, y: 1093, w: 70, h: 124, dur: 18 } },
  // todo el mapa se achica y queda adentro del celular del CTA
  { id: "N", from: SC.N, C: SceneN, tr: { kind: "unportal", x: 540, y: SHARE.y - 40, w: 276 * SHARE.scale, h: 596 * SHARE.scale, dur: 16 } },
];

// música: baja de 0,13 a 0,06 mientras habla Homero (suavizado para que no bombee)
const TOTAL = Math.ceil(AUDIO_DURATION * FPS) + 40;
const DUCK = (() => {
  const raw = Array.from({ length: TOTAL }, (_, f) => (speaking(f) ? 1 : 0));
  return raw.map((_, f) => {
    let s = 0;
    for (let k = -6; k <= 6; k++) s += raw[Math.min(TOTAL - 1, Math.max(0, f + k))];
    return s / 13;
  });
})();
// reel 8: lo-fi bien por debajo de la voz
const musicVolume = (f: number) => 0.13 - 0.07 * (DUCK[Math.min(TOTAL - 1, Math.max(0, f))] ?? 0);

export const REEL8B_FRAMES = TOTAL;

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.fondo }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <GlobalCam>
        <Stage scenes={SCENES} />
      </GlobalCam>
    </svg>
    <Subtitles />
    <Track name="Voz">
      <Sequence name="Homero" layout="none">
        <Audio name="Voz" src={staticFile(AUDIO_SRC)} />
      </Sequence>
    </Track>
    <Audio name="Música" src={staticFile("audio/reel8b/musica.wav")} volume={musicVolume} />
    <Track name="SFX">
      {SFX.map((x, i) => (
        <Audio key={i} name={x.s} src={staticFile(`sfx/${x.s}.wav`)} from={x.f} volume={x.v} />
      ))}
    </Track>
  </AbsoluteFill>
);
