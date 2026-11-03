"""Efectos de sonido de v1, sintetizados (deterministas, sin archivos de terceros).

  python build/make_sfx.py   ->   public/sfx/*.wav

Cortos y discretos, como pide la skill (beat-sheet.md): whoosh, pop, click, tic para números.
Cada uno queda con el pico en -6 dBFS; el volumen final lo pone src/v1/sfx.ts.
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/sfx"
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, attack, decay):
    x = np.arange(n) / SR
    a = np.clip(x / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(x - attack, 0) / decay)


def band(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def low(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def sweep(f0, f1, d, curve=1.0):
    tt = t(d)
    f = f0 + (f1 - f0) * (tt / d) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def norm(x, peak_db=-6.0):
    x = x - np.mean(x)
    f = int(0.004 * SR)  # sin clics en los bordes
    x[:f] *= np.linspace(0, 1, f)
    x[-f:] *= np.linspace(1, 0, f)
    return (x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)).astype(np.float32)


def whoosh(d=0.42, lo=300, hi=2600):
    n = int(d * SR)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # el centro de la banda sube: sensación de algo que pasa cerca
    for k, c in enumerate(np.geomspace(lo, hi, 6)):
        seg = band(noise, c * 0.7, min(c * 1.4, SR / 2 - 100))
        w = np.exp(-(((np.arange(n) / n) - (k + 0.5) / 6) ** 2) / 0.02)
        out += seg * w
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    return norm(out * shape)


def pop():
    s = sweep(950, 260, 0.09, 0.6) * env(int(0.09 * SR), 0.002, 0.03)
    click = band(rng.standard_normal(int(0.09 * SR)), 2000, 8000) * env(int(0.09 * SR), 0.0005, 0.004)
    return norm(s + 0.25 * click)


def tick():
    n = int(0.05 * SR)
    s = np.sin(2 * np.pi * 2600 * t(0.05)) * env(n, 0.0005, 0.008)
    c = band(rng.standard_normal(n), 3000, 9000) * env(n, 0.0003, 0.002)
    return norm(s + 0.5 * c)


def click():
    n = int(0.03 * SR)
    c = band(rng.standard_normal(n), 1500, 6000) * env(n, 0.0003, 0.003)
    return norm(c + 0.4 * np.sin(2 * np.pi * 1800 * t(0.03)) * env(n, 0.0005, 0.005))


def thump():
    n = int(0.32 * SR)
    s = sweep(110, 42, 0.32, 0.5) * env(n, 0.003, 0.11)
    hit = low(rng.standard_normal(n), 900) * env(n, 0.001, 0.02)
    return norm(s + 0.6 * hit)


def shatter():
    n = int(0.36 * SR)
    out = np.zeros(n)
    for k in range(14):
        at = int(rng.uniform(0, 0.2) * SR)
        g = band(rng.standard_normal(int(0.06 * SR)), 2500, 11000) * env(int(0.06 * SR), 0.0005, 0.012)
        out[at:at + len(g)] += g[: n - at] * rng.uniform(0.4, 1)
    return norm(out * np.exp(-np.arange(n) / (0.15 * SR)))


def sparkle():
    n = int(0.5 * SR)
    out = np.zeros(n)
    for k, f in enumerate([2093, 2637, 3136, 4186]):
        at = int(k * 0.045 * SR)
        g = np.sin(2 * np.pi * f * t(0.4)) * env(int(0.4 * SR), 0.002, 0.09)
        out[at:at + len(g)] += g[: n - at] * (0.9 - k * 0.12)
    return norm(out)


def shutter():
    n = int(0.16 * SR)
    a = band(rng.standard_normal(n), 1200, 7000) * env(n, 0.0005, 0.01)
    b = np.zeros(n)
    k = int(0.07 * SR)
    b[k:] = band(rng.standard_normal(n - k), 900, 5000) * env(n - k, 0.0005, 0.014)
    return norm(a + 0.8 * b)


def alarm():
    out = np.zeros(int(0.32 * SR))
    for k in range(2):
        at = int(k * 0.16 * SR)
        g = np.sign(np.sin(2 * np.pi * 1320 * t(0.11))) * 0.5 * env(int(0.11 * SR), 0.004, 0.06)
        g = low(g, 5000)
        out[at:at + len(g)] += g
    return norm(out)


def confetti():
    n = int(0.6 * SR)
    p = np.zeros(n)
    p[: int(0.09 * SR)] = pop()[: int(0.09 * SR)]
    s = sparkle()
    p[: len(s)] += 0.7 * s[:n]
    hiss = band(rng.standard_normal(n), 3000, 10000) * env(n, 0.005, 0.18) * 0.4
    return norm(p + hiss)


# ---------- reel 2 ----------
def rattle(d=0.62):
    """Dado que rueda: golpecitos cada vez más seguidos y más suaves."""
    out = np.zeros(int(d * SR))
    at, gap, amp = 0.0, 0.11, 1.0
    while at < d - 0.03:
        n = int(0.025 * SR)
        hit = band(rng.standard_normal(n), 1800, 6000) * env(n, 0.001, 0.008) * amp
        i = int(at * SR)
        out[i:i + n] += hit[: len(out) - i]
        at += gap
        gap = max(0.03, gap * 0.8)
        amp *= 0.86
    return norm(out)


def roll(d=0.75):
    """Persiana metálica que baja: traqueteo de láminas."""
    n = int(d * SR)
    tt = t(d)
    noise = band(rng.standard_normal(n), 300, 3500)
    am = 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 24 * tt))
    return norm(noise * am * env(n, 0.02, 0.5) + 0.3 * low(rng.standard_normal(n), 180) * env(n, 0.01, 0.3))


def page():
    n = int(0.22 * SR)
    x = band(rng.standard_normal(n), 2500, 9000) * np.sin(np.linspace(0, np.pi, n)) ** 2
    return norm(x)


def drip():
    tt = t(0.14)
    x = sweep(1400, 380, 0.14, 0.6) * env(len(tt), 0.002, 0.05)
    return norm(x)


def bip():
    out = np.zeros(int(0.32 * SR))
    for k in range(2):
        at = int(k * 0.15 * SR)
        g = np.sign(np.sin(2 * np.pi * 1760 * t(0.1))) * env(int(0.1 * SR), 0.003, 0.08)
        out[at:at + len(g)] += low(g, 6000)
    return norm(out)


# ---- reel 3
def gavel():
    """Mazo de juez: golpe de madera seco con resonancia corta."""
    n = int(0.4 * SR)
    knock = band(rng.standard_normal(n), 300, 2500) * env(n, 0.0005, 0.012)
    body = (np.sin(2 * np.pi * 180 * t(0.4)) + 0.5 * np.sin(2 * np.pi * 410 * t(0.4))) * env(n, 0.001, 0.07)
    return norm(knock + 0.7 * body)


def poof():
    """Humo: soplido grave que se abre."""
    n = int(0.55 * SR)
    x = low(rng.standard_normal(n), 1400) * np.sin(np.linspace(0, np.pi, n)) ** 0.8 * np.exp(-np.arange(n) / (0.3 * SR))
    return norm(x)


def kaching():
    """Caja registradora: clic + campanita."""
    n = int(0.6 * SR)
    out = np.zeros(n)
    c = click()
    out[: len(c)] += c
    at = int(0.06 * SR)
    tt = t(0.54)
    bell = (np.sin(2 * np.pi * 2093 * tt) + 0.6 * np.sin(2 * np.pi * 3136 * tt) + 0.3 * np.sin(2 * np.pi * 4186 * tt)) * env(len(tt), 0.002, 0.18)
    out[at:at + len(bell)] += bell[: n - at]
    return norm(out)


def gulp():
    """Tragar saliva: un 'glup' grave que sube."""
    x = sweep(160, 420, 0.16, 1.4) * env(int(0.16 * SR), 0.01, 0.06)
    return norm(low(x, 1200))


def error():
    """Bip de error: dos tonos que bajan."""
    out = np.zeros(int(0.34 * SR))
    for k, f in enumerate([880, 523]):
        at = int(k * 0.16 * SR)
        g = np.sin(2 * np.pi * f * t(0.15)) * env(int(0.15 * SR), 0.003, 0.09)
        out[at:at + len(g)] += g
    return norm(out)


def marker():
    """Marcador sobre papel: chirrido corto."""
    n = int(0.3 * SR)
    x = band(rng.standard_normal(n), 2000, 6000) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t(0.3))) * np.sin(np.linspace(0, np.pi, n))
    return norm(x)


def servo(d=0.34):
    """Reel 7: motor de los brazos robóticos: zumbido con armónicos que sube y se frena."""
    x = t(d)
    f = 140 + 220 * (x / d) ** 0.7
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sign(np.sin(ph)) * 0.5 + 0.35 * np.sin(2 * ph) + 0.2 * np.sin(3.01 * ph)
    y = band(y, 120, 3200) * env(len(x), 0.02, 0.12)
    return norm(y, -9.0)


def ring(d=0.9):
    """Reel 7: el reloj de un minuto que suena: campanilla repetida."""
    x = t(d)
    y = np.zeros_like(x)
    for k in range(9):
        s = int(k * 0.1 * SR)
        n = len(x) - s
        tt = np.arange(n) / SR
        y[s:] += (np.sin(2 * np.pi * 2350 * tt) + 0.5 * np.sin(2 * np.pi * 3520 * tt)) * np.exp(-tt * 26)
    return norm(y * env(len(x), 0.002, 0.25), -8.0)


def hum(d=1.6):
    """Reel 8: zumbido de servidores (grave, con armónicos y un aire de ventilador), entra y sale suave."""
    x = t(d)
    y = np.sin(2 * np.pi * 110 * x) + 0.5 * np.sin(2 * np.pi * 220 * x) + 0.2 * np.sin(2 * np.pi * 331 * x)
    y = y * 0.6 + band(rng.standard_normal(len(x)), 300, 1800) * 0.35
    y *= np.clip(x / 0.4, 0, 1) * np.clip((d - x) / 0.5, 0, 1)
    return norm(y, -10.0)


def chime(d=1.2):
    """Reel 8: campanita suave (dos parciales afinados, cola larga)."""
    x = t(d)
    y = np.sin(2 * np.pi * 1318.5 * x) + 0.45 * np.sin(2 * np.pi * 1975.5 * x) + 0.2 * np.sin(2 * np.pi * 2637 * x)
    return norm(y * env(len(x), 0.004, 0.35), -10.0)


def glow(d=0.7):
    """Reel 8: whoosh de luz: ruido filtrado que sube, con un brillo tonal, sin ataque."""
    x = t(d)
    y = band(rng.standard_normal(len(x)), 800, 6000) * 0.5 + 0.3 * np.sin(2 * np.pi * np.cumsum(500 + 900 * x / d) / SR)
    y *= np.sin(np.pi * x / d) ** 2
    return norm(y, -10.0)


SOUNDS = {
    "whoosh": whoosh(),
    "swish": whoosh(0.2, 600, 4000),
    "pop": pop(),
    "tick": tick(),
    "click": click(),
    "thump": thump(),
    "shatter": shatter(),
    "sparkle": sparkle(),
    "shutter": shutter(),
    "alarm": alarm(),
    "confetti": confetti(),
    "rattle": rattle(),
    "roll": roll(),
    "page": page(),
    "drip": drip(),
    "bip": bip(),
    "gavel": gavel(),
    "poof": poof(),
    "kaching": kaching(),
    "gulp": gulp(),
    "error": error(),
    "marker": marker(),
    "servo": servo(),
    "ring": ring(),
    "hum": hum(),
    "chime": chime(),
    "glow": glow(),
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, x in SOUNDS.items():
        sf.write(OUT / f"{name}.wav", x, SR, subtype="PCM_16")
        print(name, f"{len(x) / SR:.2f}s")
