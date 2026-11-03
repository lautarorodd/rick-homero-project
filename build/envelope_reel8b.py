"""Envolvente de la voz del reel 7, un valor por cuadro (30 fps), para que la boca de Homero se abra
según el volumen real y no solo según las letras.

  python build/envelope_reel8b.py   ->   src/reel8b/envelope.ts

0 = silencio (≤ -45 dBFS), 1 = voz fuerte (≥ -14 dBFS), con un suavizado de ~50 ms.
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.ndimage import uniform_filter1d

ROOT = Path(__file__).resolve().parent.parent
FPS = 30

x, sr = sf.read(ROOT / "public/audio/reel8b/voz.wav", dtype="float32")
if x.ndim > 1:
    x = x.mean(1)
hop = sr // 200  # 5 ms
n = len(x) // hop
rms = np.sqrt(np.maximum(uniform_filter1d((x[: n * hop].reshape(n, hop) ** 2).mean(1), size=10), 0))
db = 20 * np.log10(rms + 1e-9)
per_frame = [db[int(i * 200 / FPS)] for i in range(int(n * FPS / 200))]
env = np.clip((np.array(per_frame) + 45) / 31, 0, 1)
vals = ",".join(f"{v:.2f}".rstrip("0").rstrip(".") or "0" for v in env)
(ROOT / "src/reel8b/envelope.ts").write_text(
    "// Generado por build/envelope_reel8b.py — no editar a mano.\n"
    "// Volumen de la voz por cuadro (0 … 1), para abrir la boca de Homero.\n"
    f"export const ENVELOPE: number[] = [{vals}];\n",
    encoding="utf-8",
)
print(len(env), "cuadros")
