import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: SANS } = loadInter("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});
export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

export const W = 1080;
export const H = 1920;

// Paleta de sistema-visual.md. Cambio aprobado en v1: la "IA escondida" no va en dorado
// sino en blanco cálido con brillo, porque el dorado se pierde sobre la piel de Homero.
export const C = {
  fondo: "#0A0C16",
  fondoAlto: "#141833",
  grilla: "rgba(120,140,255,0.08)",
  texto: "#FFFFFF",
  textoOff: "#7D8299",
  seleccion: "#3D7BFF",
  energia: "#F5C04A",
  ia: "#FFF4DC",
  iaGlow: "#FFC24D",
  peligro: "#FF3B5C",
  neutro: "#38D6E8",
  curioso: "#FFC53D",
  ok: "#34D058",
  marca: "#FED90F",
};

// Homero
export const HOMERO = {
  piel: "#FED90F",
  pielSombra: "#E5BC00",
  barba: "#D3AE72",
  barbaSombra: "#C7AA6E",
  contorno: "#1C1A24",
  ojo: "#FFFFFF",
  pupila: "#15131A",
  camisa: "#F4F4F0",
  camisaSombra: "#CFD0DC",
  boca: "#4A1520",
  lengua: "#E2627A",
  dientes: "#FFFFFF",
};

export type Emotion = "neutro" | "peligro" | "curioso" | "ok";

// Nombre de la cuenta que aparece en la caja de herramientas (frase 17): el reel sale en
// @homeroteloexplica.
export const ACCOUNT = "@homeroteloexplica";

// Zonas seguras (1080×1920)
export const SAFE = {
  reelsTop: 230, // arriba: interfaz de Reels
  hudY: 244, // contador, entre la interfaz y los subtítulos
  subTop: 330, // franja de subtítulos 330–470
  subBottom: 470,
  sceneTop: 500, // escena 500–1450
  sceneBottom: 1450,
  igBottom: 1500, // abajo: descripción de Instagram
};

// Reel 3: cada escena tiene su fondo de color (beat sheet, "Escenas y fondos"). El color va en
// pares: base y tono más oscuro para la textura (rayos, puntos, vetas).
export const BG = {
  coral: ["#FF5A5F", "#C42E4E"],
  turquesa: ["#2BB3B1", "#1E8C8A"],
  azul: ["#3A5BEA", "#2742C2"],
  violeta: ["#6B3FD8", "#4C26AE"],
  verde: ["#23A55A", "#178445"],
  rojo: ["#E0313F", "#B01F2C"],
  turquesaOscuro: ["#137C8B", "#0C5F6B"],
  naranja: ["#F2843A", "#D2651F"],
  magenta: ["#C2347A", "#98205B"],
  azulElectrico: ["#2F6BFF", "#1D4FD6"],
  celeste: ["#6CC6F5", "#49AEE3"],
  mostaza: ["#E9B23A", "#C99221"],
  atardecer: ["#FF9A4D", "#7A3FB8"],
  madera: ["#8C3B2A", "#6E2B1E"],
  verdeAgua: ["#1FB59A", "#14917B"],
  rosa: ["#F06CA8", "#D24C8B"],
  amarillo: ["#FFC23D", "#E8A41C"],
  // reel 5: las escenas de fichas van sobre fondo oscuro (como un visor de tokenizador), con un tinte
  // distinto en cada escena para que el fondo siga cambiando
  nocheIndigo: ["#3A3FA8", "#14163F"],
  nocheTeal: ["#1F7F86", "#082B31"],
  nocheCiruela: ["#7E2F92", "#25092E"],
  nocheAzul: ["#2A5FC8", "#0B1A45"],
  nocheVerde: ["#228A5E", "#082A1C"],
  nocheRojo: ["#962A48", "#2E0A14"],
  nocheNegro: ["#4A1A2E", "#08030A"], // reel 6b: el pico ("y lo peor") y el cierre
} as const;
export type BgName = keyof typeof BG;
