# Base liviana para nuevos videos

Proyecto Remotion independiente, preparado a partir de Reel 8b. Contiene el código de escenas y componentes, el audio final del ejemplo, música y efectos, el guion, las cinco tomas de voz elegidas y los scripts para generar más voz. No incluye renders MP4, tomas descartadas, proyectos de referencia, packs de skills ni el historial Git del proyecto original.

## Abrir en GitHub Codespaces o en otra computadora

Crear un repositorio **privado y vacío** en GitHub para el contenido de **esta carpeta**. Una vez publicado, abrir el repositorio en Codespaces. En su terminal:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint
npx --no-install remotion browser ensure
npm run dev
```

El Studio permite editar y previsualizar. Para producir un archivo:

```bash
mkdir -p out
npx --no-install remotion render src/index.ts HomeroReel8B out/reel8b.mp4
npx --no-install remotion still src/index.ts CoverReel8B out/cover.png
```

Los archivos de `out/` quedan en el Codespace y no se suben a Git. Descargarlos o guardarlos en un almacenamiento privado antes de borrar el Codespace. El proyecto usa 1080 × 1920, 30 fps. Las fuentes se cargan desde Google Fonts.

## Hacer el próximo video

1. Copiar `src/reel8b/` a una carpeta nueva, por ejemplo `src/reel9/`. Usar sus escenas y componentes como punto de partida; actualizar guion, tiempos, subtítulos, efectos y duración.
2. Poner el guion y los bloques en `docs/reel9/`; guardar la voz y música finales en `public/audio/reel9/`.
3. Registrar la nueva composición y portada en `src/Root.tsx`. Cambiar las referencias de audio en la nueva carpeta.
4. Ejecutar `npm run lint`, abrir Studio y revisar el video antes de renderizarlo.

`docs/reel8b/voz/tomas/` conserva solamente las cinco tomas seleccionadas para poder repetir el armado del ejemplo. Los scripts `build/fish_tts.py`, `build/tomas_reel8b.py`, `build/make_audio_reel8b.py` y `build/envelope_reel8b.py` muestran el flujo de voz. Para un guion nuevo, copiar y adaptar los scripts de Reel 8b; no ejecutarlos sobre las rutas de Reel 8b si se quiere conservar el ejemplo.

Para generar voces nuevas se necesita Python, FFmpeg, las dependencias de `requirements-audio.txt`, los modelos de alineación de `torchaudio` y una clave propia de Fish Audio. Copiar `.env.example` a `.env` y completar la clave **solo en el entorno privado**. En Codespaces se puede usar un secreto del Codespace; nunca subir `.env` ni pegar claves en Git o en el chat. Renderizar el ejemplo no requiere ninguna clave ni Python.

## Publicar esta carpeta

Abrir una terminal **dentro de `github-video-starter`** y, después de crear un repositorio privado vacío en GitHub:

```bash
git init
git add .
git commit -m "Base para producir videos con Remotion"
git branch -M main
git remote add origin https://github.com/lautarorodd/rick-homero-project.git
git push -u origin main
```

Autenticarse con el navegador o Git Credential Manager, sin poner tokens en la URL. Esta carpeta es un proyecto nuevo: publicar la carpeta original enviaría también su historial y muchos archivos que aquí se omitieron.
