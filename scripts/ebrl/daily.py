from __future__ import annotations

import subprocess
from datetime import date, datetime
from pathlib import Path

from .models import CONTENT_DIR, ROOT, DailyPlan, DailyTask, Profile, load_catalog, load_profile, load_progress


def sync_catalog() -> Path:
    """Exporta blocos do app Next.js para content/catalog.json."""
    result = subprocess.run(
        ["npm.cmd", "run", "catalog"],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr or result.stdout or "Falha ao exportar catálogo")
    out = CONTENT_DIR / "catalog.json"
    if not out.exists():
        raise FileNotFoundError("catalog.json não foi gerado")
    return out


def _parse_iso(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).date()
    except ValueError:
        return None


def blocks_due_for_review(
    catalog: dict,
    progress: dict | None,
    intervals: list[int],
    today: date | None = None,
) -> list[dict]:
    today = today or date.today()
    if not progress:
        return []

    due: list[dict] = []
    blocks_by_id = {b["id"]: b for b in catalog.get("blocks", [])}

    for block_id, block_progress in progress.get("blocks", {}).items():
        if block_progress.get("status") != "mastered":
            continue
        mastered_at = _parse_iso(block_progress.get("masteredAt"))
        if not mastered_at:
            continue

        review_dates = block_progress.get("reviewDates", {})
        block = blocks_by_id.get(block_id)
        if not block:
            continue

        for day_offset in intervals:
            review_day = mastered_at.toordinal() + day_offset
            if today.toordinal() == review_day and not review_dates.get(str(day_offset)):
                due.append(
                    {
                        "block": block,
                        "day_offset": day_offset,
                        "label": f"D+{day_offset}",
                    }
                )
    return due


def current_block(catalog: dict, progress: dict | None) -> dict | None:
    if not progress:
        return catalog.get("blocks", [{}])[0] if catalog.get("blocks") else None

    current_id = progress.get("currentBlockId")
    for block in catalog.get("blocks", []):
        if block.get("id") == current_id:
            return block
    return None


def pick_flashcards(block: dict, limit: int = 8) -> list[dict[str, str]]:
    cards: list[dict[str, str]] = []
    for word in block.get("words", [])[:limit]:
        cards.append(
            {
                "english": word["english"],
                "portuguese": word["portuguese"],
                "emoji": word.get("emoji", ""),
                "example": word.get("example", ""),
            }
        )
    verb = block.get("verb", {})
    if verb:
        cards.append(
            {
                "english": verb.get("english", ""),
                "portuguese": verb.get("portuguese", ""),
                "emoji": verb.get("emoji", ""),
                "example": f"Verb: {verb.get('english', '')}",
            }
        )
    return cards[:limit]


def speaking_prompts_from_block(block: dict) -> list[str]:
    prompts: list[str] = []
    for sentence in block.get("sentences", [])[:4]:
        prompts.append(f"Diga em voz alta: {sentence['english']}")
    verb = block.get("verb", {})
    pronouns = block.get("pronouns", ["I"])
    tense = block.get("tense", "present")
    for pronoun in pronouns[:2]:
        conj = verb.get("conjugations", {}).get(pronoun, verb.get("english", ""))
        prompts.append(f"Crie uma frase ({pronoun}, {tense}): ___ {conj} ___")
    return prompts


def build_daily_plan(today: date | None = None) -> DailyPlan:
    today = today or date.today()
    profile = load_profile()
    catalog = load_catalog()
    progress = load_progress()

    plan = DailyPlan(
        date=today.isoformat(),
        student=profile.name,
        total_minutes=profile.daily_minutes,
    )

    due_reviews = blocks_due_for_review(catalog, progress, profile.review_intervals, today)
    for item in due_reviews[:2]:
        block = item["block"]
        plan.tasks.append(
            DailyTask(
                kind="review",
                title=f"Revisão {item['label']}: {block['title']}",
                detail=f"Rever {len(block.get('words', []))} palavras e falar 3 frases.",
                block_id=block["id"],
                minutes=8,
            )
        )
        plan.speaking_prompts.extend(speaking_prompts_from_block(block)[:2])

    active = current_block(catalog, progress)
    if active and progress:
        status = progress.get("blocks", {}).get(active["id"], {}).get("status")
        if status in ("available", "in_progress", "review"):
            plan.tasks.append(
                DailyTask(
                    kind="lesson",
                    title=f"Continuar: {active['title']}",
                    detail=active.get("description", ""),
                    block_id=active["id"],
                    minutes=12,
                )
            )
            plan.flashcards = pick_flashcards(active)
            plan.speaking_prompts.extend(speaking_prompts_from_block(active)[:3])

    if not plan.tasks:
        first = catalog.get("blocks", [{}])[0]
        plan.tasks.append(
            DailyTask(
                kind="warmup",
                title="Aquecimento — exporte seu progresso do app",
                detail="Copie localStorage (ebrl-progress) para content/progress.json",
                minutes=profile.daily_minutes,
            )
        )
        if first:
            plan.flashcards = pick_flashcards(first)

    if profile.life_themes:
        theme = profile.life_themes[0]
        plan.tasks.append(
            DailyTask(
                kind="real_life",
                title=f"Vida real: {theme}",
                detail="Escreva uma situação em content/journal/ e rode: python -m ebrl journal",
                minutes=5,
            )
        )

    return plan


def save_daily_plan(plan: DailyPlan) -> tuple[Path, Path]:
    import json

    from .models import OUTPUT_DIR

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    md_path = OUTPUT_DIR / f"daily-{plan.date}.md"
    json_path = OUTPUT_DIR / f"daily-{plan.date}.json"

    lines = [
        f"# Aula do dia — {plan.date}",
        f"**Aluno:** {plan.student}  ",
        f"**Tempo planejado:** ~{plan.total_minutes} min",
        "",
        "## Tarefas",
        "",
    ]
    for i, task in enumerate(plan.tasks, 1):
        lines.append(f"{i}. **{task.title}** ({task.minutes} min)")
        lines.append(f"   - {task.detail}")
        if task.block_id:
            lines.append(f"   - Bloco: `{task.block_id}`")
        lines.append("")

    if plan.flashcards:
        lines.extend(["## Flashcards", ""])
        for card in plan.flashcards:
            lines.append(f"- {card['emoji']} **{card['english']}** — {card['portuguese']}")
        lines.append("")

    if plan.speaking_prompts:
        lines.extend(["## Fala (em voz alta)", ""])
        for prompt in plan.speaking_prompts:
            lines.append(f"- {prompt}")
        lines.append("")

    md_path.write_text("\n".join(lines), encoding="utf-8")

    payload = {
        "date": plan.date,
        "student": plan.student,
        "total_minutes": plan.total_minutes,
        "tasks": [task.__dict__ for task in plan.tasks],
        "flashcards": plan.flashcards,
        "speaking_prompts": plan.speaking_prompts,
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return md_path, json_path
