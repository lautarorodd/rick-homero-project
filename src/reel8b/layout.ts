// Puesta de las escenas del reel 3 (coordenadas de escena 1080 × 1920).

// B / L: la oficina de Sofi (la misma del reel 2, con pared de color, reloj y calendario)
export const OFFICE = {
  sofi: { x: 470, y: 1000, scale: 0.95 },
  deskY: 1180,
  monitor: { x: 210, y: 1180 },
  mug: { x: 770, y: 1176 },
  door: { x: 900, y: 1182 },
  clock: { x: 200, y: 640 },
  calendar: { x: 700, y: 600 },
  phone: { x: 660, y: 1050, scale: 0.8 },
};

/** La pantalla del monitor de Sofi (centro y tamaño en escena), donde vive la diapositiva. */
export const MONITOR_SCREEN = { x: OFFICE.monitor.x, y: OFFICE.monitor.y - 147, w: 320, h: 186 };
