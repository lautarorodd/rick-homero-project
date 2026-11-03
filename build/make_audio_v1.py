"""Audio y timing de v1.

Lee docs/v1/guion.md y las tomas de docs/v1/, arma la voz final en public/audio/v1/voz.wav
y los tiempos por palabra en src/v1/words.ts.

  python build/make_audio_v1.py

Por toma: declip -> limpieza de ruido (perfil = silencio del principio) -> alineación forzada
(MMS_FA, con el guion como texto) -> paso alto -> EQ de balance tonal (acerca la voz al espectro
estándar de habla, ANSI S3.5) -> de-esser -> recorte de pausas (<= 0,3 s; 0,9 s antes del CTA).
Después: nivelación por frase -> compresor suave -> -14 LUFS -> limitador true peak -1 dBTP.
Los tiempos de palabra salen de la alineación sobre las tomas y se trasladan por el mapa de
cortes, así que son exactos respecto del audio final.
"""
import re
import json
import unicodedata
from pathlib import Path

import numpy as np
import soundfile as sf
import pyloudnorm as pyln
import noisereduce as nr
import torch
import torchaudio
from scipy.interpolate import CubicSpline
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, fftconvolve, firwin2, istft, resample_poly, sosfiltfilt, stft, welch

ROOT = Path(__file__).resolve().parent.parent
GUION = ROOT / "docs/v1/guion.md"
OUT_WAV = ROOT / "public/audio/v1/voz.wav"
OUT_TS = ROOT / "src/v1/words.ts"
OUT_REPORT = ROOT / "build/v1_audio_report.json"
GENERATOR = "build/make_audio_v1.py"

# Tomas. Homero va con la voz convertida (2 y 19). La frase 11 no tiene toma convertida: hasta que
# exista docs/v1/voces_homero_frase11_convertida.wav se usa la no convertida como provisoria, y se
# exporta el recorte crudo a docs/v1/para_convertir/ para pasarlo por el conversor.
F11_CONVERTED = "docs/v1/voces_homero_frase11_convertida.wav"
F11_RAW = ("docs/v1/voces_homero_no_convertidas.wav", (7.6, 10.2))
NARRATOR_EQ = (0.65, -3.0, 6.0)  # cuánto acercar al espectro estándar, recorte mínimo y máximo (dB)
HOMERO_EQ = (0.35, -3.0, 4.0)    # la convertida casi no tiene graves y le sobra 1,6-4 kHz
SOURCES = [
    {"name": "narrador", "file": "docs/v1/voces_narrador.wav", "eq": NARRATOR_EQ,
     "phrases": [1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18]},
    {"name": "homero", "file": "docs/v1/voces_homero_convertida.wav", "eq": HOMERO_EQ, "phrases": [2, 19]},
    {"name": "homero_f11", "file": F11_CONVERTED, "eq": HOMERO_EQ, "phrases": [11]}
    if (ROOT / F11_CONVERTED).exists() else
    {"name": "homero_f11_provisoria", "file": F11_RAW[0], "window": F11_RAW[1], "eq": NARRATOR_EQ,
     "phrases": [11]},
]
# Lo que dice la toma convertida cuando no coincide con el guion (el subtítulo muestra lo que se oye).
# Frase 2: la alineación forzada da "usé ChatGPT ese" (-53) muy por encima de "abrí el ChatGPT ese" (-82).
TEXT_OVERRIDES = {2: "¿**Yo**? ¡Si nunca usé **ChatGPT** ese!"}
EMOJI = {(1, "desayunar"): "☕", (6, "estafas"): "🚨", (8, "viaje"): "🎵", (13, "dibujan"): "🍩"}
CTA_PHRASE = 18

MAX_PAUSE = 0.26      # pausa interna máxima entre palabras (medida queda <= 0,3 s con los bordes)
PHRASE_GAP = 0.20     # silencio insertado entre frases (+ EDGE_PAD de cada lado)
CTA_GAP = 0.90        # la única pausa larga, antes del CTA
GAP_BEFORE = {}       # pausas puntuales antes de una frase (n -> segundos), p. ej. para un remate
VOICED_DB = -50       # hasta dónde se estira cada frase: por encima de esto hay voz (o cola de voz)
HEAD_MAX = 0.25       # cuánto se puede estirar una frase hacia atrás (consonante inicial, toma de aire)
TAIL_MAX = 0.40       # y hacia adelante (colas de consonantes)
SPLIT_AT_VALLEY = False  # True: ninguna frase se estira más allá del valle de energía que la separa de la vecina
EDGE_PAD = 0.04       # aire antes/después de cada frase
FADE = 0.008
LOUD_FADE = 0.008     # fundido cuando el corte cae con voz sonando (por defecto, el mismo)
LEVEL_RANGE = 3.0     # la nivelación por frase del narrador corrige como mucho ±3 dB

TARGET_LUFS = -14.0
TP_CEILING_DB = -1.2  # margen sobre -1 dBTP
COMP_RATIO = 2.5
SR = 44100

# Cómo suena cada palabra, para el alineador (solo letras a-z).
PRONUNCIATION = {
    "chatgpt": "chatyipiti",
    "ias": "ia",
    "mail": "meil",
    "spotify": "spotifai",
    "selfie": "selfi",
    "woo-hoo": "uju",
}

# Espectro estándar de habla, esfuerzo normal (ANSI S3.5-1997), nivel espectral en dB/Hz por
# tercio de octava.
ANSI = {160: 32.41, 200: 34.48, 250: 34.75, 315: 33.98, 400: 34.59, 500: 34.27, 630: 32.06, 800: 28.30,
        1000: 25.01, 1250: 23.00, 1600: 20.15, 2000: 17.32, 2500: 13.18, 3150: 11.55, 4000: 9.33,
        5000: 5.31, 6300: 2.59, 8000: 1.13}


# ---------- guion ----------
def parse_text(text):
    words, buf, bold, key = [], "", False, False
    i = 0
    while i <= len(text):
        if text[i:i + 2] == "**":
            bold = not bold
            i += 2
            continue
        ch = text[i] if i < len(text) else " "
        if ch.isspace():
            clean = re.sub(r"[^\w\-]", "", buf).strip("-")
            if clean:
                # brk: la palabra cierra una unidad de sentido (puntuación en el guion)
                # kc: la negrita sigue en la palabra siguiente ("**inteligencia artificial**")
                words.append({"w": clean, "key": key, "brk": bool(re.search(r"[.,;:?!…]\W*$", buf)),
                              "kc": key and bold})
            buf, key = "", False
        else:
            buf += ch
            key = key or bold
        i += 1
    return words


def parse_guion():
    phrases = []
    for line in GUION.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\|\s*(\d+)\s*\|\s*(Narrador|Homero)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$", line)
        if not m:
            continue
        n, voice = int(m.group(1)), m.group(2).lower()
        phrases.append({"n": n, "speaker": voice, "words": parse_text(TEXT_OVERRIDES.get(n, m.group(3)))})
    return phrases


def romanize(word):
    w = word.lower()
    if w in PRONUNCIATION:
        return PRONUNCIATION[w]
    w = unicodedata.normalize("NFD", w)
    return "".join(c for c in w if "a" <= c <= "z")


# ---------- DSP ----------
def frames_db(x, hop):
    n = len(x) // hop
    return 20 * np.log10(np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-12)


def declip(x, thr=0.999):
    bad = np.abs(x) >= thr
    if not bad.any():
        return x, 0
    good = np.where(~bad)[0]
    y = x.copy()
    # spline local por cada tramo recortado, con 8 muestras sanas de cada lado
    idx = np.where(bad)[0]
    runs = np.split(idx, np.where(np.diff(idx) > 1)[0] + 1)
    for r in runs:
        a, b = r[0], r[-1]
        left = good[(good < a)][-8:]
        right = good[(good > b)][:8]
        if len(left) < 2 or len(right) < 2:
            continue
        cs = CubicSpline(np.concatenate([left, right]), x[np.concatenate([left, right])])
        y[a:b + 1] = cs(np.arange(a, b + 1))
    return y, int(bad.sum())


def denoise(x, sr, speech_start):
    """Perfil de ruido = silencio del principio (antes de la primera palabra)."""
    lead = x[: max(0, int((speech_start - 0.3) * sr))]
    lead = lead[np.abs(lead) > 0]  # el gate de la grabación deja ceros digitales
    floor = float(20 * np.log10(np.sqrt((lead ** 2).mean()) + 1e-12)) if len(lead) else None
    info = {"noise_profile_s": round(len(lead) / sr, 2), "noise_floor_db": floor and round(floor, 1)}
    if len(lead) < 0.2 * sr or floor < -70:
        info["denoise"] = "omitido: el silencio inicial ya está por debajo de -70 dBFS"
        return x, info
    y = nr.reduce_noise(y=x, sr=sr, y_noise=lead, stationary=True, prop_decrease=0.85)
    info["denoise"] = "aplicado"
    return y.astype(np.float32), info


def highpass(x, sr, hz=70):
    return sosfiltfilt(butter(2, hz, "hp", fs=sr, output="sos"), x).astype(np.float32)


def third_octave(x, sr):
    v = x[np.abs(x) > 10 ** (-45 / 20)]
    f, p = welch(v, sr, nperseg=8192)
    return np.array([10 * np.log10(p[(f >= fc / 2 ** (1 / 6)) & (f < fc * 2 ** (1 / 6))].sum() + 1e-20)
                     for fc in ANSI])


def tonal_eq(x, sr, amount, lo, hi):
    """EQ de fase lineal que acerca el balance tonal (normalizado en 500 Hz) al espectro estándar de
    habla. Corrige solo una parte (amount) para no borrar el carácter de la voz."""
    fcs = np.array(list(ANSI))
    ref = np.array(list(ANSI.values())) + 10 * np.log10(0.2316 * fcs)
    ref -= ref[fcs == 500]
    rec = third_octave(x, sr)
    rec -= rec[fcs == 500]
    gain = np.clip(amount * (ref - rec), lo, hi)
    gain = np.convolve(np.pad(gain, 1, mode="edge"), np.ones(3) / 3, mode="valid")  # sin picos finos
    freqs = np.linspace(0, sr / 2, 2049)
    g = np.interp(np.log10(np.maximum(freqs, 20)), np.log10(fcs), gain)
    g = np.where(freqs > 8000, gain[-1] * np.clip((14000 - freqs) / 6000, 0, 1), g)  # nada arriba de 14 kHz
    h = firwin2(4097, freqs, 10 ** (g / 20), fs=sr)
    y = fftconvolve(x, h, mode="same").astype(np.float32)
    return y, {int(fc): round(float(gv), 1) for fc, gv in zip(fcs, gain)}


def deess(x, sr, lo=4500, hi=10000, thresh_db=-12.0, depth=0.6, max_cut_db=6.0):
    """Baja la banda de sibilancia solo en los cuadros donde domina (las "s" filosas)."""
    nper, hop = 1024, 256
    f, _, Z = stft(x, sr, nperseg=nper, noverlap=nper - hop)
    band = (f >= lo) & (f < hi)
    ratio = 10 * np.log10((np.abs(Z[band]) ** 2).sum(0) / ((np.abs(Z) ** 2).sum(0) + 1e-20) + 1e-20)
    cut = np.clip(depth * (ratio - thresh_db), 0, max_cut_db)
    rel = np.exp(-hop / sr / 0.03)  # suelta en ~30 ms
    for i in range(1, len(cut)):
        cut[i] = max(cut[i], cut[i - 1] * rel)
    taper = np.clip((f - (lo - 500)) / 500, 0, 1) * np.clip((hi + 1000 - f) / 1000, 0, 1)
    Z *= 10 ** (-np.outer(taper, cut) / 20)
    _, y = istft(Z, sr, nperseg=nper, noverlap=nper - hop)
    active = cut > 0.5
    return y[: len(x)].astype(np.float32), {"frames_cut_pct": round(100 * float(active.mean()), 1),
                                            "avg_cut_db": round(float(cut[active].mean()), 1) if active.any() else 0}


def compress(x, sr, ratio=2.5, knee=6.0, attack=0.010, release=0.150, window=0.010):
    """Compresor con detector RMS de 10 ms (no sigue cada ciclo de la voz) y rodilla suave.
    El umbral es el percentil 60 del nivel de la voz: solo trabaja en las sílabas fuertes."""
    hop = int(sr * 0.001)
    env = 10 * np.log10(uniform_filter1d(x.astype(np.float64) ** 2, size=int(window * sr))[::hop] + 1e-12)
    active = env > env.max() - 40
    thr = np.percentile(env[active], 60)
    over = env - thr
    slope = 1 - 1 / ratio
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, slope * over, slope * (over + knee / 2) ** 2 / (2 * knee)))
    a_att, a_rel = np.exp(-0.001 / attack), np.exp(-0.001 / release)
    g = np.empty_like(gr)
    cur = 0.0
    for i, t in enumerate(gr):
        a = a_att if t > cur else a_rel
        cur = a * cur + (1 - a) * t
        g[i] = cur
    gain = 10 ** (-np.interp(np.arange(len(x)) / hop, np.arange(len(g)), g) / 20)
    return (x * gain).astype(np.float32), {"avg_gr_db": round(float(g[active].mean()), 1),
                                           "p95_gr_db": round(float(np.percentile(g[active], 95)), 1)}


def true_peak(x, sr):
    return float(np.abs(resample_poly(x, 4, 1)).max())


def limit(x, sr, ceiling_db, lookahead=0.005, release=0.10):
    ceiling = 10 ** (ceiling_db / 20)
    up = np.abs(resample_poly(x, 4, 1))
    peak = up[: len(x) * 4].reshape(len(x), 4).max(1)
    need = np.minimum(1.0, ceiling / np.maximum(peak, 1e-9))
    L = max(1, int(lookahead * sr))
    held = minimum_filter1d(need, size=2 * L + 1)
    smooth = np.minimum(uniform_filter1d(held, size=L), need)
    a = np.exp(-1 / (release * sr))
    out = np.empty_like(smooth)
    cur = 1.0
    for i, s in enumerate(smooth):
        cur = s if s < cur else a * cur + (1 - a) * s
        out[i] = cur
    gr = -20 * np.log10(out)
    return (x * out).astype(np.float32), {"max_gr_db": round(float(gr.max()), 1),
                                          "time_over_1db_pct": round(100 * float((gr > 1).mean()), 2)}


# ---------- alineación forzada ----------
_FA = {}


def forced_align(x, sr, words):
    """Devuelve (start, end) en segundos por palabra. words = lista de strings romanizados."""
    if not _FA:
        bundle = torchaudio.pipelines.MMS_FA
        _FA["bundle"] = bundle
        _FA["model"] = bundle.get_model(with_star=False)
        _FA["tok"] = bundle.get_tokenizer()
        _FA["aligner"] = bundle.get_aligner()
    b = _FA["bundle"]
    wav = torch.from_numpy(resample_poly(x, b.sample_rate, sr).astype(np.float32))[None]
    with torch.inference_mode():
        emission, _ = _FA["model"](wav)
        spans = _FA["aligner"](emission[0], _FA["tok"](words))
    ratio = wav.size(1) / emission.size(1) / b.sample_rate
    return [(s[0].start * ratio, s[-1].end * ratio) for s in spans]


# ---------- armado ----------
def load(path, window=None):
    x, sr = sf.read(ROOT / path, dtype="float32")
    if x.ndim > 1:
        x = x.mean(1)
    if window:
        x = x[int(window[0] * sr):int(window[1] * sr)]
    if sr != SR:
        x = resample_poly(x, SR, sr).astype(np.float32)
    return x


def main():
    phrases = {p["n"]: p for p in parse_guion()}
    report = {"sources": {}}
    pieces = {}  # n -> (audio, [(start,end) relativos por palabra])
    meter = pyln.Meter(SR)

    for src in SOURCES:
        nums = src["phrases"]
        x = load(src["file"], src.get("window"))
        if src.get("window") and src.get("export", True):
            out = ROOT / "docs/v1/para_convertir/frase11_sin_convertir.wav"
            out.parent.mkdir(parents=True, exist_ok=True)
            sf.write(out, x, SR, subtype="PCM_16")
        x, nclip = declip(x)
        words = [w for n in nums for w in phrases[n]["words"]]
        roman = [romanize(w["w"]) for w in words]
        times = forced_align(x, SR, roman)
        if src.get("raw"):
            # toma ya terminada: solo recorte de puntas y nivel (más abajo)
            info = {"proceso": "solo recorte y nivel"}
        else:
            if src.get("denoise", True):
                x, info = denoise(x, SR, times[0][0])
            else:
                info = {"denoise": "omitido: voz sintética sin ruido de fondo"}
            x = highpass(x, SR)
            x, info["eq_db"] = tonal_eq(x, SR, *src["eq"])
            x, info["deess"] = deess(x, SR)
        info["declipped_samples"] = nclip
        info["file"] = src["file"]
        report["sources"][src["name"]] = info

        db = frames_db(x, int(SR * 0.01))
        voiced = lambda t: 0 <= int(t * 100) < len(db) and db[int(t * 100)] > VOICED_DB  # noqa: E731

        # límites entre frases seguidas: el valle de energía entre el final de una y el comienzo de la
        # otra. Si la toma lee dos frases sin silencio, ninguna se estira hasta meterse en la otra.
        spans, k = [], 0
        for n in nums:
            spans.append((times[k][0], times[k + len(phrases[n]["words"]) - 1][1]))
            k += len(phrases[n]["words"])
        limits = [0.0]
        for (_, e0), (s1, _) in zip(spans, spans[1:]):
            fa, fb = int(e0 * 100), max(int(e0 * 100) + 1, int(s1 * 100))
            limits.append((fa + int(np.argmin(db[fa:fb]))) / 100 if SPLIT_AT_VALLEY else 0.0)
        limits.append(len(x) / SR)

        k = 0
        for j, n in enumerate(nums):
            wt = times[k:k + len(phrases[n]["words"])]
            k += len(phrases[n]["words"])
            a, b = wt[0][0], wt[-1][1]
            lo, hi = (limits[j], limits[j + 1]) if SPLIT_AT_VALLEY else (0.0, len(x) / SR)
            # estirar hasta donde termina la energía (colas de consonantes, respiraciones cortas no)
            for _ in range(round(HEAD_MAX * 100)):
                if voiced(a - 0.01) and a - 0.01 > lo:
                    a -= 0.01
            for _ in range(round(TAIL_MAX * 100)):
                if voiced(b + 0.01) and b + 0.01 < hi:
                    b += 0.01
            a, b = max(lo, a - EDGE_PAD), min(hi, b + EDGE_PAD)
            thr = db[int(a * 100):int(b * 100)].max() - 32
            quiet = thr - 8  # las fricativas son suaves: por debajo de esto es silencio
            wt = [list(w) for w in wt]
            # en el hueco entre palabras hay cola de la anterior (decae) y a veces la consonante inicial
            # de la siguiente (s, f, sh), que el alineador deja afuera: la palabra siguiente arranca
            # después del último tramo en silencio o, si no hay, en el valle de energía
            for i in range(1, len(wt)):
                g0, g1 = wt[i - 1][1], wt[i][0]
                fa, fb = int(g0 * 100), int(np.ceil(g1 * 100))
                if fb - fa < 3:
                    continue
                gap = db[fa:fb]
                silent = np.where(gap <= quiet)[0]
                f = silent[-1] + 1 if len(silent) else int(np.argmin(gap))
                wt[i][0] = max(g0, min(g1, (fa + f) / 100))
            # la primera palabra empieza donde arranca la energía (la "sh" de "Yo"; o el alineador
            # arranca un poco antes, en el silencio)
            f0 = int(a * 100)
            while f0 < len(db) and db[f0] <= thr:
                f0 += 1
            if abs(f0 / 100 - wt[0][0]) <= 0.15:
                wt[0][0] = f0 / 100
            # recortar pausas internas: solo el tramo en silencio más largo de cada hueco, por el medio
            cuts = []
            for i in range(1, len(wt)):
                fa, fb = int(wt[i - 1][1] * 100), int(wt[i][0] * 100)
                best, s = (0, 0), None
                for j, q in enumerate(np.append(db[fa:fb] <= quiet, False)):
                    if q and s is None:
                        s = j
                    if not q and s is not None:
                        if j - s > best[1] - best[0]:
                            best = (s, j)
                        s = None
                dur = (best[1] - best[0]) / 100
                if dur > MAX_PAUSE:
                    mid = (fa + (best[0] + best[1]) / 2) / 100
                    cuts.append((mid - (dur - MAX_PAUSE) / 2, mid + (dur - MAX_PAUSE) / 2))
            segs, cur = [], a
            for c0, c1 in cuts:
                segs.append((cur, c0))
                cur = c1
            segs.append((cur, b))

            def remap(t, cuts=cuts, a=a):
                return t - a - sum(c1 - c0 for c0, c1 in cuts if c1 <= t)

            rel = [(remap(ws), remap(we)) for ws, we in wt]
            audio = []
            for sa, sb in segs:
                seg = x[int(sa * SR):int(sb * SR)].copy()
                # si el corte cae con voz sonando (frases leídas de corrido), fundido largo: la vocal se
                # apaga en vez de cortarse en seco
                def fade_len(t):
                    loud = 0 <= int(t * 100) < len(db) and db[int(t * 100)] > VOICED_DB
                    return min(int((LOUD_FADE if loud else FADE) * SR), len(seg) // 2)
                fi, fo = fade_len(sa), fade_len(sb - 0.01)
                seg[:fi] *= np.linspace(0, 1, fi)
                seg[len(seg) - fo:] *= np.linspace(1, 0, fo)
                audio.append(seg)
            pieces[n] = (np.concatenate(audio), rel)

    # nivelación por frase: el narrador se acerca a su nivel típico (±3 dB, conserva énfasis);
    # Homero se iguala al narrador
    def lufs(y):
        while len(y) < 0.45 * SR:
            y = np.concatenate([y, y])
        return meter.integrated_loudness(y)

    narr_nums = SOURCES[0]["phrases"]
    ref = float(np.median([lufs(pieces[n][0]) for n in narr_nums]))
    levels = {}
    for n, (y, rel) in pieces.items():
        g = ref - lufs(y)
        if n in narr_nums:
            g = float(np.clip(g, -LEVEL_RANGE, LEVEL_RANGE))
        levels[n] = round(g, 1)
        pieces[n] = (y * 10 ** (g / 20), rel)
    report["phrase_gain_db"] = levels

    # concatenar en orden del guion
    order = sorted(phrases)
    out, words_out, t = [], [], 0.0
    for i, n in enumerate(order):
        if i > 0:
            gap = GAP_BEFORE.get(n, CTA_GAP if n == CTA_PHRASE else PHRASE_GAP)
            out.append(np.zeros(int(gap * SR), np.float32))
            t += int(gap * SR) / SR
        y, rel = pieces[n]
        for w, (ws, we) in zip(phrases[n]["words"], rel):
            words_out.append({"w": w["w"], "start": t + ws, "end": t + we, "phrase": n, "key": w["key"],
                              "kc": w["kc"], "brk": w["brk"], "speaker": phrases[n]["speaker"],
                              "emoji": EMOJI.get((n, w["w"]))})
        out.append(y.astype(np.float32))
        t += len(y) / SR
    out.append(np.zeros(int(0.3 * SR), np.float32))
    y = np.concatenate(out)

    # dinámica: compresión -> loudness -> limitador (iterar porque el limitador baja el integrado)
    y, report["compressor"] = compress(y / np.abs(y).max() * 0.5, SR, ratio=COMP_RATIO)
    for _ in range(4):
        y = y * 10 ** ((TARGET_LUFS - meter.integrated_loudness(y)) / 20)
        y, report["limiter"] = limit(y, SR, TP_CEILING_DB)
        if abs(meter.integrated_loudness(y) - TARGET_LUFS) < 0.1:
            break

    OUT_WAV.parent.mkdir(parents=True, exist_ok=True)
    sf.write(OUT_WAV, y, SR, subtype="PCM_24")

    # pausas en el audio final
    db = frames_db(y, int(SR * 0.01))
    on = db > -45
    pauses, s = [], None
    first, last = np.argmax(on), len(on) - np.argmax(on[::-1])
    for i in range(first, last):
        if not on[i] and s is None:
            s = i
        if on[i] and s is not None:
            if i - s >= 20:
                pauses.append((round(s / 100, 2), round((i - s) / 100, 2)))
            s = None
    v = y[np.abs(y) > 10 ** (-40 / 20)]
    report.update({
        "duration_s": round(len(y) / SR, 3),
        "integrated_lufs": round(meter.integrated_loudness(y), 2),
        "true_peak_dbtp": round(20 * np.log10(true_peak(y, SR)), 2),
        "crest_db": round(float(20 * np.log10(np.abs(y).max() / np.sqrt((v ** 2).mean()))), 1),
        "pauses_over_0.2s": pauses,
        "words": len(words_out),
    })
    OUT_REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")

    write_ts(words_out, len(y) / SR)
    print(json.dumps(report, ensure_ascii=False, indent=1))


def write_ts(words, duration):
    lines = []
    for w in words:
        extra = ""
        if w["key"]:
            extra += ", key: true"
        if w["kc"]:
            extra += ", kc: true"
        if w["brk"]:
            extra += ", brk: true"
        if w["speaker"] == "homero":
            extra += ", speaker: 'homero'"
        if w["emoji"]:
            extra += f", emoji: '{w['emoji']}'"
        lines.append(f"  {{w: {json.dumps(w['w'], ensure_ascii=False)}, start: {w['start']:.3f}, "
                     f"end: {w['end']:.3f}, phrase: {w['phrase']}{extra}}},")
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    src = OUT_WAV.relative_to(ROOT / "public").as_posix()
    OUT_TS.write_text(f"""// Generado por {GENERATOR} — no editar a mano.
// Tiempos en segundos sobre public/{src} (alineación forzada MMS_FA con el guion).

export const FPS = 30;
export const AUDIO_SRC = '{src}';
export const AUDIO_DURATION = {duration:.3f};

export type Word = {{
  w: string;
  start: number;
  end: number;
  phrase: number;
  key?: true;
  /** La palabra clave sigue en la próxima (negrita de varias palabras: van en un mismo recuadro). */
  kc?: true;
  /** Cierra una unidad de sentido (había puntuación en el guion). */
  brk?: true;
  speaker?: 'homero';
  emoji?: string;
}};

export const WORDS: Word[] = [
{chr(10).join(lines)}
];

/** Cuadro en que empieza la palabra (nth = ocurrencia, desde 0). */
export const at = (word: string, nth = 0) => {{
  const hits = WORDS.filter((x) => x.w.toLowerCase() === word.toLowerCase());
  if (!hits[nth]) {{
    throw new Error(`at(): no existe "${{word}}" #${{nth}}`);
  }}
  return Math.round(hits[nth].start * FPS);
}};

/** Primer y último cuadro de una frase del guion. */
export const phraseRange = (n: number) => {{
  const ws = WORDS.filter((x) => x.phrase === n);
  return [Math.round(ws[0].start * FPS), Math.round(ws[ws.length - 1].end * FPS)] as const;
}};

/** El evento llega un poco antes que la palabra. */
export const lead = (f: number, frames = 3) => f - frames;
""", encoding="utf-8")


if __name__ == "__main__":
    main()
