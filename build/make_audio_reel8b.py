"""Audio y timing del reel 8b (el reel 8 corregido): Homero narra todo, calmo por el tono pero a velocidad
normal (el reel 8 sonaba en cámara lenta).

Tomas de Fish Audio con la voz de Homero ([soft], velocidad 1,0; build/tomas_reel8b.py,
docs/reel8b/voz/tomas). Se pegan en orden y pasan por el procesado de siempre (recorte de pausas,
nivelación por frase, compresión, de-esser), sin atempo. Pausas internas ≤ 0,3 s, como pide la skill
(solo la de antes del CTA, hasta ~0,8 s).

  python build/make_audio_reel8b.py
"""
import re
import subprocess
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

import make_audio_v1 as base

R8 = ("docs/reel8b/voz/tomas", "docs/reel8b/bloques")
# (carpetas, toma, bloque, texto del pedazo dentro del bloque o None = la toma entera), en orden del guion
PEDAZOS = [
    (R8, "b1_n3", "b1", None),  # 1–5 (n1 y n2: Whisper oye "Chatipitino, estoy": se pierde el "no")
    (R8, "b2_n1", "b2", None),  # 6–8
    (R8, "b3_n1", "b3", None),  # 9–14
    (R8, "b4_n2", "b4", None),  # 15–18
    (R8, "b5_n2", "b5", None),  # 19–22 (n3: entonación de pregunta)
]
TEMPO = 1.0
BLOCK_GAP = 0.4
SPOKEN = {"chatgpt": "chatyipiti"}  # como lo leyó la voz


def norm(w):
    return base.romanize(SPOKEN.get(w.lower(), w))


def pedazo(dirs, nombre, bloque, texto):
    (path,) = (base.ROOT / dirs[0]).glob(f"{nombre}_*.wav")
    x, sr = sf.read(path, dtype="float32")
    assert sr == base.SR, f"{nombre}: {sr} Hz"
    x = x if x.ndim == 1 else x.mean(1)
    if texto is None:
        return x, (0.0, len(x) / sr)
    todas = [norm(w["w"]) for w in base.parse_text((base.ROOT / dirs[1] / f"{bloque}.txt").read_text(encoding="utf-8"))]
    mias = [norm(w["w"]) for w in base.parse_text(texto)]
    i = next(i for i in range(len(todas)) if todas[i:i + len(mias)] == mias)
    j = i + len(mias) - 1
    t = base.forced_align(x, sr, todas)
    a = max(t[i - 1][1] + 0.03 if i else 0.0, t[i][0] - 0.30)
    b = min(t[j + 1][0] - 0.03 if j + 1 < len(t) else len(x) / sr, t[j][1] + 0.50)
    y = x[int(a * sr):int(b * sr)].copy()
    n = int(0.01 * sr)
    y[:n] *= np.linspace(0, 1, n)
    y[-n:] *= np.linspace(1, 0, n)
    return y, (round(a, 2), round(b, 2))


def pegar():
    parts = []
    for dirs, nombre, bloque, texto in PEDAZOS:
        y, (a, b) = pedazo(dirs, nombre, bloque, texto)
        print(f"{nombre:6s} {a:6.2f}–{b:6.2f} s  {(texto or '(toda)')[:60]}", flush=True)
        parts += [y, np.zeros(int(BLOCK_GAP * base.SR), np.float32)]
    raw = Path(tempfile.gettempdir()) / "homero_reel8b_voz_raw.wav"
    out = Path(tempfile.gettempdir()) / "homero_reel8b_voz.wav"
    sf.write(raw, np.concatenate(parts), base.SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"atempo={TEMPO}", "-c:a", "pcm_f32le", str(out)], check=True)
    return str(out)


SRC = {"eq": (0.3, -2.0, 3.0), "denoise": False}
base.GUION = base.ROOT / "docs/reel8b/guion.md"
base.OUT_WAV = base.ROOT / "public/audio/reel8b/voz.wav"
base.OUT_TS = base.ROOT / "src/reel8b/words.ts"
base.OUT_REPORT = base.ROOT / "build/reel8b_audio_report.json"
base.GENERATOR = "build/make_audio_reel8b.py"
N_FRASES = len(re.findall(r"^\|\s*\d+\s*\|", base.GUION.read_text(encoding="utf-8"), re.M))
base.SOURCES = [{"name": "homero_fish", "file": pegar(), "phrases": list(range(1, N_FRASES + 1)), **SRC}]
base.TEXT_OVERRIDES = {}
base.EMOJI = {(4, "vegetariano"): "🥦", (16, "agua"): "💧", (19, "cocina"): "🍳"}
base.PRONUNCIATION = {**base.PRONUNCIATION}
base.CTA_PHRASE = N_FRASES
base.MAX_PAUSE = 0.26  # reel 8b: pausas de la skill (≤ 0,3 s)
base.PHRASE_GAP = 0.12
base.CTA_GAP = 0.75
base.GAP_BEFORE = {3: 0.26, 6: 0.26, 9: 0.26, 15: 0.26, 17: 0.26, 19: 0.26}  # respiros entre tramos (≤ 0,3 s)
base.VOICED_DB = -38
base.HEAD_MAX = 0.30
base.TAIL_MAX = 0.60
base.SPLIT_AT_VALLEY = True
base.LOUD_FADE = 0.05
base.COMP_RATIO = 1.6
base.TARGET_LUFS = -17.0
base.TP_CEILING_DB = -1.5

if __name__ == "__main__":
    base.main()
