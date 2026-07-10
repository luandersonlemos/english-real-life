from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .models import CONTENT_DIR, load_catalog


def create_initial_progress(catalog: dict[str, Any] | None = None) -> dict[str, Any]:
    catalog = catalog or load_catalog()
    block_list = catalog.get("blocks", [])
    block_progress: dict[str, Any] = {}

    for index, block in enumerate(block_list):
        block_progress[block["id"]] = {
            "blockId": block["id"],
            "status": "available" if index == 0 else "locked",
            "currentStep": 0,
            "reviewDates": {},
        }

    return {
        "currentBlockId": block_list[0]["id"] if block_list else "",
        "blocks": block_progress,
        "lastVisit": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }


def save_progress_file(progress: dict[str, Any]) -> Path:
    path = CONTENT_DIR / "progress.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    progress["lastVisit"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    path.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def ensure_progress_file() -> Path:
    path = CONTENT_DIR / "progress.json"
    if path.exists():
        return path
    return save_progress_file(create_initial_progress())
