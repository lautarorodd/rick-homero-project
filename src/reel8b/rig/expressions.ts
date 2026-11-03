import type { Arm, Face, Gesture, Mouth } from "./Homero";

// Código emocional fijo (personaje.md). Cada cara va con su color de halo.
// v2b: el Homero de la serie tiene los ojos redondos y abiertos; el párpado aparece solo cuando actúa.
const F0: Face = {
  lidTop: 0.06,
  lidSkew: 0,
  lidAngle: 0,
  lidBottom: 0,
  pupil: 1,
  gazeX: 0,
  gazeY: 0,
  papada: 1,
  wrinkles: 0,
  sniff: 0,
};

export const FACES = {
  neutral: F0,
  dormido: { ...F0, lidTop: 0.9, gazeY: 0.3 },
  sorprendido: { ...F0, lidTop: 0, pupil: 0.7, wrinkles: 0.7 },
  indignado: { ...F0, lidTop: 0.42, lidAngle: 22, wrinkles: 1, pupil: 0.95 },
  desden: { ...F0, lidTop: 0.52, lidAngle: -4, gazeX: 0.55, gazeY: 0.15 },
  confundido: { ...F0, lidTop: 0.26, lidSkew: 0.3, lidAngle: -10, wrinkles: 0.6 },
  feliz: { ...F0, lidTop: 0.34, lidBottom: 0.28 },
  espantado: { ...F0, lidTop: 0, pupil: 0.55, wrinkles: 0.9 },
} satisfies Record<string, Face>;

const M0: Mouth = { open: 0, wide: 0.5, round: 0, smile: 0, teeth: 0 };

export const MOUTHS = {
  reposo: M0,
  ronquido: { open: 0.16, wide: 0.3, round: 0.7, smile: 0, teeth: 0 },
  sonrisa: { open: 0, wide: 0.85, round: 0, smile: 1, teeth: 0 },
  sonrisaAbierta: { open: 0.4, wide: 0.9, round: 0, smile: 0.9, teeth: 1 },
  mueca: { open: 0.2, wide: 0.9, round: 0, smile: -0.7, teeth: 1 },
  o: { open: 0.55, wide: 0.3, round: 1, smile: 0, teeth: 0 },
  grito: { open: 1, wide: 0.75, round: 0.3, smile: 0.25, teeth: 1 },
  desden: { open: 0, wide: 0.55, round: 0, smile: -0.4, teeth: 0 },
} satisfies Record<string, Mouth>;

// Ángulos de brazo (el gesto de la mano va aparte porque es discreto).
export type ArmAngles = { shoulder: number; elbow: number; hand: number };

export const ARMS = {
  // antebrazo cruzado sobre la frazada
  reposo: { shoulder: 8, elbow: -66, hand: -14 },
  // índice arriba, indignado
  dedo: { shoulder: 36, elbow: 136, hand: 0 },
  // estirarse hacia el costado (agarrar algo de la mesa de luz)
  estirar: { shoulder: 66, elbow: 14, hand: -16 },
  // sostener algo adelante, a la altura del pecho (antebrazo para arriba)
  sostener: { shoulder: 10, elbow: 158, hand: 0 },
  // encogerse de hombros, palmas arriba
  encoger: { shoulder: 52, elbow: -118, hand: 70 },
  // mano en el mentón (pensativo, confundido)
  menton: { shoulder: -15, elbow: -131, hand: 10 },
  // brazos arriba, festejo
  festejo: { shoulder: 150, elbow: 22, hand: 0 },
} satisfies Record<string, ArmAngles>;

export const arm = (a: ArmAngles, gesture: Gesture): Arm => ({ ...a, gesture });
