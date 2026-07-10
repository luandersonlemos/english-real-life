from __future__ import annotations

from pathlib import Path

from .daily import speaking_prompts_from_block
from .models import CONTENT_DIR, OUTPUT_DIR, load_catalog, load_yaml


def find_journal_entries() -> list[Path]:
    journal_dir = CONTENT_DIR / "journal"
    if not journal_dir.exists():
        return []
    return sorted(journal_dir.glob("*.yaml")) + sorted(journal_dir.glob("*.yml"))


def _find_word_in_catalog(catalog: dict, english: str) -> dict | None:
    needle = english.lower().strip()
    for block in catalog.get("blocks", []):
        for word in block.get("words", []):
            if word.get("english", "").lower() == needle:
                return {**word, "block_id": block["id"], "block_title": block["title"]}
        verb = block.get("verb", {})
        if verb.get("english", "").lower() == needle:
            return {**verb, "block_id": block["id"], "block_title": block["title"]}
    return None


def generate_journal_exercises(entry_path: Path) -> Path:
    entry = load_yaml(entry_path)
    catalog = load_catalog()

    words_to_practice = [str(w) for w in entry.get("words_to_practice", [])]
    matched = []
    missing = []
    for word in words_to_practice:
        found = _find_word_in_catalog(catalog, word)
        if found:
            matched.append(found)
        else:
            missing.append(word)

    lines = [
        f"# Exercícios — {entry.get('title', entry_path.stem)}",
        f"**Data:** {entry.get('date', '')}",
        "",
        "## Situação (português)",
        entry.get("situation_pt", ""),
        "",
        "## Palavras encontradas no catálogo",
        "",
    ]

    speaking: list[str] = []
    for word in matched:
        lines.append(
            f"- {word.get('emoji', '')} **{word['english']}** ({word['portuguese']}) "
            f"— bloco {word.get('block_title', '')}"
        )
        example = word.get("example")
        if example:
            speaking.append(f"Repita: {example}")
        else:
            speaking.append(f"Diga uma frase com: {word['english']}")

    if missing:
        lines.extend(["", "## Palavras novas (ainda não no catálogo)", ""])
        for word in missing:
            lines.append(f"- {word} → crie um bloco YAML ou adicione manualmente")

    lines.extend(["", "## Desafio de fala", ""])
    situation = entry.get("situation_pt", "")
    lines.append(f"1. Descreva em inglês (mesmo que simples): {situation}")
    lines.append("2. Use pelo menos 3 palavras da lista acima.")
    lines.append("3. Grave o áudio no celular e compare amanhã.")

    for prompt in speaking[:6]:
        lines.append(f"- {prompt}")

    # Sugestões de frases de blocos relacionados
    if matched:
        block_ids = {w.get("block_id") for w in matched if w.get("block_id")}
        for block in catalog.get("blocks", []):
            if block.get("id") in block_ids:
                for prompt in speaking_prompts_from_block(block)[:2]:
                    lines.append(f"- {prompt}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUTPUT_DIR / f"journal-{entry_path.stem}.md"
    out.write_text("\n".join(lines), encoding="utf-8")
    return out


def process_all_journals() -> list[Path]:
    outputs: list[Path] = []
    for entry in find_journal_entries():
        if entry.name.startswith("_"):
            continue
        outputs.append(generate_journal_exercises(entry))
    return outputs
