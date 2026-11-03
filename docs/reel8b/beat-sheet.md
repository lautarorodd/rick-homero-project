# Reel 8b — beat sheet (el reel 8 con la voz a velocidad normal y el hook nuevo)

Voz final: `public/audio/reel8b/voz.wav`, 61,4 s (video 62,8 s), **2,59 palabras/s** (el reel 8 iba a 2,38). Todo se ancla con `pw()` a `docs/reel8b/guion.md`.

**Qué cambia respecto del reel 8:**
- **Hook nuevo:** zoom out por tres capas anidadas y picada de vuelta.
- **Sale la escena "En vivo"** (frase "Por eso ves que escribo de a poco…").
- **Destellos suaves y fichas en los tramos sin eventos:** el reel 8 tenía hasta 4,5 s sin nada nuevo en el viaje.

El resto (escenas, transiciones y paleta) es el mismo, solo que con el timing nuevo.

## Escenas

| Escena | t (s) | Eventos (palabra → imagen) | Entra por |
|---|---|---|---|
| A · Hook | 0–4,6 | Cuadro 0: Homero (CHATGPT) asoma desde adentro del celular de Sofi. En 0,1 s, el cartel "CHATGPT NO ESTÁ EN TU CELULAR" (sale a los ~1,9 s). En "ChatGPT", el gafete brilla. En "no estoy", Homero sale disparado hacia arriba y la cámara se aleja de golpe: atraviesa el techo de la casa, la ciudad de noche y llega al globo. En "Estoy a miles…", aparecen el centro de datos lejano con Homero (CHATGPT) y el arco con la luz; en "miles", la ficha "A MILES DE KILÓMETROS"; en "kilómetros", un destello. En "Mira", picada de vuelta: globo → ciudad → casa → cuarto | — |
| B · Las 23:00 | 4,6–13,9 | En "once", el reloj 23:00. En "Sofi", etiqueta SOFI. Mientras tipea, destellos en "qué", "novio" y "vegetariano" (salta un ❤️ en "novio" y un 🥦 en "vegetariano"). En "enviar", aprieta. En "sale", la pregunta se vuelve luz (destello) y sale por la ventana; en "convertida", "VIAJA COMO LUZ" | continuo (el hook termina en el mismo encuadre) |
| C · El viaje | 13,9–20,0 | Destellos en "cables", "veces", "fondo", "mar", "hasta", "edificio" y "enorme". Ficha "POR EL FONDO DEL MAR"; en "edificio", "CENTRO DE DATOS" | portal (la ventana) |
| D · Pasillos | 20,0–22,9 | En "computadoras" y "apagan", destellos; en "nunca", la ficha "NUNCA SE APAGAN" | portal (la puerta) |
| E · Tokens | 22,9–28,9 | En "corto", las 13 fichas reales; en "pedacitos", "TOKENS". En "leo entera", rayos a todas a la vez ("LA LEE ENTERA, DE UNA VEZ"). Destellos en "pedacitos", "entera" y "vez" | portal (el rack) |
| F · Palabra a palabra | 28,9–34,8 | Como en el reel 8 | paneo |
| H · Horno | 34,8–38,9 | Como en el reel 8 | paneo |
| I · Gotita | 38,9–43,1 | Como en el reel 8 | paneo |
| J · La vuelta | 43,1–45,6 | Destellos ámbar en "hace" y "vuelta" | portal (la gotita) |
| K · Su pantalla | 45,6–47,6 | Como en el reel 8 | portal (la ventana) |
| L · Cocina | 47,6–51,1 | Como en el reel 8 | paneo |
| M · Millones | 51,1–57,0 | Como en el reel 8 | unportal |
| N · CTA | 57,0–62,8 | Como en el reel 8 | unportal |

## Chequeo (medido sobre el render)
- [x] Ningún tramo de más de 1,5 s sin un evento nuevo: el hueco más largo mide 1,50 s (`build/eventos_qa.py`).
- [x] Golpe suave cada ≤ 4 s; tramo sin cambio grande ≤ 4,4 s.
- [x] Sin cortes duros.
