# Reel 8b — "¿Qué pasa cuando apretás enviar?" (corrección: voz a velocidad normal y hook nuevo)

## Brief
- **Idea única:** cada respuesta de ChatGPT es un viaje físico real (cables, edificios, electricidad y agua) que pasa en un segundo, y la respuesta se arma palabra por palabra.
- **Situación:** 23:00, Sofi le pregunta a ChatGPT qué cocinarle a su novio vegetariano y aprieta enviar.
- **Objeto narrativo:** la pregunta de Sofi (un hilo de luz cian a la ida; la respuesta vuelve en luz cálida).
- **Rol de Homero:** es ChatGPT (etiqueta CHATGPT y gafete); recibe la pregunta en el centro de datos y arma la respuesta.
- **Tono nuevo:** calmo, lento y satisfactorio; noche con mucha luz; cierre cálido en la cocina de Sofi.
- **Remate + CTA:** millones de hilos de luz a la vez → "Mandáselo a ese amigo que se impacienta si ChatGPT tarda dos segundos".

## Datos (verificados por el usuario; no se agregan otros números)
Sam Altman, "The Gentle Singularity" (blog, junio de 2025): una consulta promedio usa unos 0,34 Wh (lo que usa un horno en poco más de un segundo) y unos 0,000085 galones de agua (≈ 1/15 de cucharadita). Es una cifra de la empresa: en pantalla, "Según OpenAI · Sam Altman · junio 2025".

## Voz
Fish Audio, voz de Homero, s2.1-pro-free, temperatura 0,5, top_p 0,7, tag `[soft]`, **velocidad 1,0** (`build/tomas_reel8b.py`, ajuste `soft100`). Sin atempo. Pausas internas ≤ 0,3 s (solo la de antes del CTA, hasta ~0,8 s).

## Cambios respecto del reel 8
- Hook nuevo (frases 1–2): "Yo, ChatGPT, no estoy en tu celular. Estoy a miles de kilómetros. Mira."
- Sale "Por eso ves que escribo de a poco: estoy armando la respuesta en vivo." (y su escena "en vivo"): con el ritmo pedido (~2,5 palabras/s) el guion completo daba ~67 s y el objetivo es 58–65 s; el brief del reel 8 la marcaba como la primera a cortar.

## Guion
Audio en español neutro; los subtítulos dicen exactamente esto. Texto en pantalla en rioplatense. Partido en frases para anclar las escenas.

| # | Voz | Texto | Escena |
|---|---|---|---|
| 1 | Homero | Yo, **ChatGPT**, no estoy en tu **celular**. | A hook |
| 2 | Homero | Estoy a **miles de kilómetros**. **Mira**. | A |
| 3 | Homero | Son las **once de la noche**. | B cuarto de Sofi |
| 4 | Homero | **Sofi** me escribe: "¿Qué le **cocino** a mi novio, que es **vegetariano**?" | B |
| 5 | Homero | Y aprieta **enviar**. | B |
| 6 | Homero | Su pregunta sale del celular convertida en **luz**. | C |
| 7 | Homero | Viaja por **cables**, a veces por el **fondo del mar**. | D calle → E mar |
| 8 | Homero | Hasta un **edificio enorme**, lleno de **computadoras** que nunca se **apagan**. | F centro de datos |
| 9 | Homero | Ahí, primero, **corto** su pregunta en **pedacitos**. | G tokens |
| 10 | Homero | Y la **leo entera**, de una vez. | G |
| 11 | Homero | Después **elijo** una palabra. | H palabra a palabra |
| 12 | Homero | La **agrego**. | H |
| 13 | Homero | Vuelvo a **leer todo**. | H |
| 14 | Homero | Y elijo la **siguiente**. | H |
| 15 | Homero | Cada pregunta gasta la **electricidad** de un **horno** prendido **un segundo**. | J horno |
| 16 | Homero | Y una **gotita de agua**, para que las computadoras no se **calienten**. | J gota |
| 17 | Homero | La respuesta hace el **viaje de vuelta**. | K vuelta |
| 18 | Homero | Y aparece en **su pantalla**. | L celular |
| 19 | Homero | **Sofi cocina**. | M cocina |
| 20 | Homero | Su **novio** le pide la **receta**. | M |
| 21 | Homero | Y yo, en ese **mismo segundo**, estoy haciendo esto con **millones de personas** más. | N mapa |
| 22 | Homero | **Mándaselo** a ese amigo que se **impacienta** si tardo **dos segundos**. | O CTA |
