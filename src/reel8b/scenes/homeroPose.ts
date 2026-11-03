import { blend, step } from "../anim";
import { ARMS, ArmAngles, FACES, MOUTHS } from "../rig/expressions";
import type { Face, Gesture, HomeroPose, Mouth } from "../rig/Homero";
import { homeroSpeech, mixMouth } from "../rig/lipsync";
import type { Emotion } from "../tokens";
import { FPS } from "../words";

type Keys<T> = ReadonlyArray<readonly [number, T, number?]>;
type Steps<T> = ReadonlyArray<readonly [number, T]>;

/** Cuánto está hablando Homero alrededor del cuadro (0 … 1, suavizado). */
export const talkAt = (frame: number) => {
  let sum = 0;
  for (let k = -2; k <= 2; k++) sum += homeroSpeech((frame + k) / FPS).talking;
  return sum / 5;
};

/**
 * Pose de Homero en el cuadro: las expresiones de la escena (cara, boca, brazos, color emocional)
 * más la boca de la voz (visemas + volumen) y un cabeceo leve mientras habla.
 */
export const homeroPose = (
  frame: number,
  o: {
    face: Keys<Face>;
    mouth?: Keys<Mouth>;
    armL?: Keys<ArmAngles>;
    armR?: Keys<ArmAngles>;
    gestL?: Steps<Gesture>;
    gestR?: Steps<Gesture>;
    emotion?: Steps<Emotion | null>;
    tilt?: number;
    turn?: number;
    squash?: number;
    halo?: number;
    redEye?: number;
  },
): HomeroPose => {
  const face = blend<Face>(frame, o.face);
  const expr = blend<Mouth>(frame, o.mouth ?? [[0, MOUTHS.reposo]]);
  const speech = homeroSpeech(frame / FPS).mouth;
  const talk = talkAt(frame);
  const mouth = mixMouth(expr, { ...speech, smile: speech.smile + expr.smile * 0.5 }, talk);
  const armL = blend<ArmAngles>(frame, o.armL ?? [[0, ARMS.reposo]]);
  const armR = blend<ArmAngles>(frame, o.armR ?? [[0, ARMS.reposo]]);
  return {
    face,
    mouth,
    armL: { ...armL, gesture: step<Gesture>(frame, o.gestL ?? [[0, "open"]]) },
    armR: { ...armR, gesture: step<Gesture>(frame, o.gestR ?? [[0, "open"]]) },
    headTilt: (o.tilt ?? 0) + talk * 3 * Math.sin(frame * 0.45),
    headTurn: o.turn ?? 0,
    headDy: -5 * talk * Math.abs(Math.sin(frame * 0.4)),
    bodyTilt: 0,
    squash: o.squash ?? 0,
    emotion: step<Emotion | null>(frame, o.emotion ?? [[0, "neutro"]]),
    halo: o.halo ?? 0.8,
    redEye: o.redEye ?? 0,
  };
};

export { ARMS, FACES, MOUTHS };
