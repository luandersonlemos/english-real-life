"""CLI: gera um MP3 — usado pela API do Next.js."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ebrl.audio import generate_audio, slugify


def main() -> None:
    if len(sys.argv) < 3:
        print("Uso: tts.py <texto> <caminho-saida.mp3>", file=sys.stderr)
        sys.exit(1)

    text = sys.argv[1]
    output = Path(sys.argv[2])
    generate_audio(text, output)
    print(slugify(text))


if __name__ == "__main__":
    main()
