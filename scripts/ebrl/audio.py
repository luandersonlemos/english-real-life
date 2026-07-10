"""Gera arquivos MP3 com edge-tts para pronúncia em inglês."""

from __future__ import annotations

import asyncio
import re
from pathlib import Path

from .models import ROOT, load_catalog

AUDIO_DIR = ROOT / "public" / "audio"
VOICE = "en-US-AriaNeural"


def slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-") or "word"


async def _generate_one(text: str, output: Path) -> None:
    import edge_tts

    output.parent.mkdir(parents=True, exist_ok=True)
    communicate = edge_tts.Communicate(text, VOICE)
    await communicate.save(str(output))


def generate_audio(text: str, output: Path | None = None) -> Path:
    output = output or AUDIO_DIR / f"{slugify(text)}.mp3"
    asyncio.run(_generate_one(text, output))
    return output


def collect_texts_from_catalog() -> list[str]:
    texts: set[str] = set()
    catalog = load_catalog()

    for block in catalog.get("blocks", []):
        for word in block.get("words", []):
            texts.add(word["english"])
            if word.get("example"):
                texts.add(word["example"])
        verb = block.get("verb", {})
        if verb.get("english"):
            texts.add(verb["english"])
        connector = block.get("connector", {})
        if connector.get("english"):
            texts.add(connector["english"])
        for sentence in block.get("sentences", []):
            texts.add(sentence["english"])

    return sorted(texts)


def generate_catalog_audio(limit: int | None = None) -> list[Path]:
    texts = collect_texts_from_catalog()
    if limit:
        texts = texts[:limit]

    outputs: list[Path] = []
    for text in texts:
        path = AUDIO_DIR / f"{slugify(text)}.mp3"
        if path.exists():
            outputs.append(path)
            continue
        outputs.append(generate_audio(text, path))
        print(f"  {text} -> {path.name}")

    return outputs
