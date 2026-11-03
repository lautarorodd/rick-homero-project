"""Tomas de voz del reel 8b (el reel 8 corregido): calma por el tono, pero a velocidad normal (1,0).

  python build/tomas_reel8b.py prueba        # el bloque 1 con tres ajustes de tono y velocidad
  python build/tomas_reel8b.py [bloque ...]  # por defecto b1..b5, 3 tomas cada uno, con el ajuste elegido (TONO)

Misma voz y modelo que siempre (s2.1-pro-free, temperatura 0,5, top_p 0,7); cambian el tag y la velocidad de la
prosodia (--speed en build/fish_tts.py). Caché por hash; reintentos con espera creciente.
"""
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOQUES = ROOT / "docs/reel8b/bloques"
TOMAS = ROOT / "docs/reel8b/voz/tomas"
BASE = ["--model", "s2.1-pro-free", "--temperature", "0.5", "--top_p", "0.7"]
PRUEBA = {
    "soft090": BASE + ["--tag", "soft", "--speed", "0.9"],
    "calm088": BASE + ["--tag", "calm", "--speed", "0.88"],
    "soft085": BASE + ["--tag", "soft", "--speed", "0.85"],
    "soft100": BASE + ["--tag", "soft"],  # reel 8b: velocidad normal (la del reel 8 sonaba en cámara lenta)
}
TONO = "soft100"  # reel 8b: la calma sale del tono y del guion, no de bajar la velocidad


def una(bloque, take, args, nombre):
    cmd = [sys.executable, str(ROOT / "build/fish_tts.py"), str(BLOQUES / f"{bloque}.txt"), str(TOMAS), nombre, "--take", str(take), *args]
    for intento in range(5):
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode == 0:
            print(r.stdout.strip(), flush=True)
            return True
        print(f"{nombre}: intento {intento + 1} falló: {(r.stderr or r.stdout).strip()[:200]}", flush=True)
        if intento < 4:
            time.sleep(10 * 2 ** intento)
    return False


if __name__ == "__main__":
    args = sys.argv[1:]
    fallas = []
    if args and args[0] == "prueba":
        fallas += [n for k, a in PRUEBA.items() if not una("b1", 1, a, (n := f"b1_{k}"))]
    else:
        assert TONO, "elegí TONO después de la prueba"
        for b in args or ["b1", "b2", "b3", "b4", "b5"]:
            fallas += [f"{b}_n{t}" for t in (1, 2, 3) if not una(b, t, PRUEBA[TONO], f"{b}_n{t}")]  # "n": velocidad normal
    print("FALLARON: " + ", ".join(fallas) if fallas else "todas las tomas listas")
