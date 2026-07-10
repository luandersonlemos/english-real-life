from __future__ import annotations

import json
import re
from pathlib import Path

from .models import ROOT, load_yaml

BLOCKS_TS_DIR = ROOT / "src" / "data" / "blocks"


def _to_ts(value, indent: int = 0) -> str:
    """Converte estrutura Python para literal TypeScript/JSON-like."""
    pad = "  " * indent
    if value is None:
        return "undefined"
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        escaped = value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")
        return f'"{escaped}"'
    if isinstance(value, list):
        if not value:
            return "[]"
        items = ",\n".join(f"{pad}  {_to_ts(v, indent + 1)}" for v in value)
        return f"[\n{items}\n{pad}]"
    if isinstance(value, dict):
        if not value:
            return "{}"
        parts = []
        for key, val in value.items():
            ts_key = key if re.match(r"^[A-Za-z_]\w*$", key) else json.dumps(key)
            parts.append(f"{pad}  {ts_key}: {_to_ts(val, indent + 1)}")
        return "{\n" + ",\n".join(parts) + f"\n{pad}}}"
    return json.dumps(value)


def render_block_ts(block: dict) -> str:
    number = int(block["number"])
    var_name = f"block{number:02d}"
    body = _to_ts(block, indent=1)
    return (
        'import type { Block } from "@/types";\n\n'
        f"export const {var_name}: Block = {body};\n"
    )


def build_block_from_yaml(yaml_path: Path) -> Path:
    block = load_yaml(yaml_path)
    number = int(block["number"])
    out = BLOCKS_TS_DIR / f"block-{number:02d}.ts"
    out.write_text(render_block_ts(block), encoding="utf-8")
    return out


def update_blocks_index(block_numbers: list[int] | None = None) -> Path:
    """Atualiza index.ts com imports de todos os block-XX.ts existentes."""
    files = sorted(BLOCKS_TS_DIR.glob("block-*.ts"))
    numbers: list[int] = []
    for f in files:
        match = re.match(r"block-(\d+)\.ts$", f.name)
        if match:
            numbers.append(int(match.group(1)))

    if block_numbers:
        numbers = sorted(set(numbers) | set(block_numbers))

    imports = "\n".join(
        f'import {{ block{n:02d} }} from "./block-{n:02d}";' for n in sorted(numbers)
    )
    array = ",\n  ".join(f"block{n:02d}" for n in sorted(numbers))
    content = (
        'import type { Block } from "@/types";\n'
        f"{imports}\n\n"
        "export const blocks: Block[] = [\n  "
        f"{array},\n"
        "];\n\n"
        "export function getBlock(id: string): Block | undefined {\n"
        "  return blocks.find((b) => b.id === id);\n"
        "}\n\n"
        "export function getBlockByNumber(n: number): Block | undefined {\n"
        "  return blocks.find((b) => b.number === n);\n"
        "}\n"
    )
    index_path = BLOCKS_TS_DIR / "index.ts"
    index_path.write_text(content, encoding="utf-8")
    return index_path
