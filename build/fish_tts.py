"""Generación de voz con Fish Audio para el reel 2 (Homero narra todo).

La clave se lee de .env (FISH_AUDIO_API_KEY) y nunca se imprime. Cada toma se cachea por hash de
(texto, modelo, parámetros): si ya existe, no se vuelve a generar.

  python build/fish_tts.py <bloque.txt> <salida_dir> <nombre> [--model s2.1-pro] [--temperature 0.7]
                           [--top_p 0.7] [--tag soft]
"""
import argparse
import hashlib
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE_ID = "1f278d1516e54ff2b18189f5c71c9027"  # Homero (modelo de voz en Fish Audio)
# Cómo se escribe para que suene bien (solo en el texto que va a la voz; los subtítulos llevan el real).
SPOKEN = {"ChatGPT": "chatyipití", "Sofi": "Sófi", "video": "vidéo"}  # acentos: i final de ChatGPT, o de Sofi, e de video


def api_key():
    # Primero la variable de entorno (sesiones en la nube); si no está, el .env local (nunca se sube a Git).
    if os.environ.get("FISH_AUDIO_API_KEY"):
        return os.environ["FISH_AUDIO_API_KEY"].strip()
    env = ROOT / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8-sig").splitlines():
            k, _, v = line.strip().partition("=")
            if k.strip() == "FISH_AUDIO_API_KEY":
                return v.strip().strip('"').strip("'")
    sys.exit("Falta FISH_AUDIO_API_KEY (variable de entorno o .env)")


def tts(text, model, temperature, top_p, speed=1.0):
    body = {
        "text": text,
        "reference_id": VOICE_ID,
        "format": "wav",
        "sample_rate": 44100,
        "temperature": temperature,
        "top_p": top_p,
        "latency": "normal",
        "prosody": {"speed": speed, "normalize_loudness": True},
        "language": "es",
    }
    req = urllib.request.Request("https://api.fish.audio/v1/tts", data=json.dumps(body).encode(), method="POST")
    req.add_header("Authorization", f"Bearer {api_key()}")
    req.add_header("Content-Type", "application/json")
    req.add_header("model", model)
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"Fish Audio respondió {e.code}: {e.read()[:300].decode(errors='replace')}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("texto")
    ap.add_argument("salida")
    ap.add_argument("nombre")
    ap.add_argument("--model", default="s2.1-pro")
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--top_p", type=float, default=0.7)
    ap.add_argument("--tag", default="", help="un tag suave opcional al principio: soft, chuckling o sighing")
    ap.add_argument("--speed", type=float, default=1.0, help="reel 8: velocidad de la prosodia de Fish (0,85–0,9 = más lento)")
    ap.add_argument("--take", type=int, default=0, help="número de toma: otra toma con los mismos parámetros")
    ap.add_argument("--say", action="append", default=[], help='cómo se escribe una palabra para la voz: "ChatGPT=chatyipití"')
    a = ap.parse_args()

    spoken = {**SPOKEN, **dict(s.split("=", 1) for s in a.say)}
    text = Path(a.texto).read_text(encoding="utf-8").strip()
    for k, v in spoken.items():
        text = text.replace(k, v)
    if a.tag:
        # suaves para la narración; los de alteración, solo para el hook del reel 5; serio y misterioso, reel 6
        assert a.tag in ("soft", "chuckling", "sighing", "frustrated", "angry", "shouting", "serious", "mysterious", "calm", "whispering", "gentle"), "tag no previsto"
        text = f"[{a.tag}] {text}"
    assert len(text) <= 500, f"bloque de {len(text)} caracteres (máx. 500)"
    params = [text, a.model, a.temperature, a.top_p, VOICE_ID] + ([a.take] if a.take else []) + ([a.speed] if a.speed != 1.0 else [])
    key = hashlib.sha1(json.dumps(params).encode()).hexdigest()[:10]
    out = Path(a.salida)
    out.mkdir(parents=True, exist_ok=True)
    wav = out / f"{a.nombre}_{key}.wav"
    if wav.exists():
        print(f"en caché: {wav}")
        return
    wav.write_bytes(tts(text, a.model, a.temperature, a.top_p, a.speed))
    (out / f"{a.nombre}_{key}.json").write_text(
        json.dumps({"texto": text, "modelo": a.model, "temperature": a.temperature, "top_p": a.top_p, "speed": a.speed}, ensure_ascii=False, indent=1),
        encoding="utf-8")
    print(f"generada: {wav}")


if __name__ == "__main__":
    main()
