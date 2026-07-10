from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
CONTENT_DIR = ROOT / "content"
OUTPUT_DIR = ROOT / "output"


@dataclass
class Profile:
    name: str
    native_language: str
    level: str
    daily_minutes: int
    focus_tense: str
    focus_pronouns: list[str]
    life_themes: list[str]
    review_intervals: list[int]


@dataclass
class DailyTask:
    kind: str
    title: str
    detail: str
    block_id: str | None = None
    minutes: int = 5


@dataclass
class DailyPlan:
    date: str
    student: str
    total_minutes: int
    tasks: list[DailyTask] = field(default_factory=list)
    speaking_prompts: list[str] = field(default_factory=list)
    flashcards: list[dict[str, str]] = field(default_factory=list)


def load_yaml(path: Path) -> dict[str, Any]:
    import yaml

    with path.open(encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not isinstance(data, dict):
        raise ValueError(f"YAML inválido em {path}")
    return data


def load_profile() -> Profile:
    data = load_yaml(CONTENT_DIR / "profile.yaml")
    focus = data.get("focus", {})
    return Profile(
        name=str(data.get("name", "Aluno")),
        native_language=str(data.get("native_language", "pt-BR")),
        level=str(data.get("level", "beginner")),
        daily_minutes=int(data.get("daily_minutes", 20)),
        focus_tense=str(focus.get("tense", "present")),
        focus_pronouns=[str(p) for p in focus.get("pronouns", ["I", "You", "We", "They"])],
        life_themes=[str(t) for t in data.get("life_themes", [])],
        review_intervals=[int(d) for d in data.get("review_intervals", [1, 2, 4, 7])],
    )


def load_catalog() -> dict[str, Any]:
    path = CONTENT_DIR / "catalog.json"
    if not path.exists():
        raise FileNotFoundError(
            "Catálogo não encontrado. Rode: npm run catalog  (ou motor.bat sync)"
        )
    import json

    with path.open(encoding="utf-8") as f:
        return json.load(f)


def load_progress() -> dict[str, Any] | None:
    path = CONTENT_DIR / "progress.json"
    if not path.exists():
        return None
    import json

    with path.open(encoding="utf-8") as f:
        return json.load(f)
