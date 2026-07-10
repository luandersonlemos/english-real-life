from __future__ import annotations

import argparse
import sys
from pathlib import Path

from . import __version__
from .builder import build_block_from_yaml, update_blocks_index
from .daily import build_daily_plan, save_daily_plan, sync_catalog
from .journal import process_all_journals
from .models import CONTENT_DIR, load_catalog, load_progress
from .audio import generate_catalog_audio
from .progress_io import ensure_progress_file


def cmd_sync(_: argparse.Namespace) -> int:
    path = sync_catalog()
    print(f"OK — catálogo atualizado: {path}")
    return 0


def cmd_daily(_: argparse.Namespace) -> int:
    plan = build_daily_plan()
    md_path, json_path = save_daily_plan(plan)
    print(f"Aula do dia gerada:")
    print(f"  - {md_path}")
    print(f"  - {json_path}")
    return 0


def cmd_status(_: argparse.Namespace) -> int:
    catalog_path = CONTENT_DIR / "catalog.json"
    if not catalog_path.exists():
        print("Catálogo ausente. Rode: python -m ebrl sync")
        return 1

    catalog = load_catalog()
    progress = load_progress()
    blocks = catalog.get("blocks", [])
    print(f"EBRL Engine v{__version__}")
    print(f"Blocos no catálogo: {len(blocks)}")

    if not progress:
        print("Progresso: content/progress.json não encontrado")
        print("Dica: exporte do app (botão no header) ou copie progress.example.json")
        return 0

    counts: dict[str, int] = {}
    for bp in progress.get("blocks", {}).values():
        status = bp.get("status", "unknown")
        counts[status] = counts.get(status, 0) + 1

    print(f"Bloco atual: {progress.get('currentBlockId', '?')}")
    for status, count in sorted(counts.items()):
        print(f"  {status}: {count}")
    return 0


def cmd_build(args: argparse.Namespace) -> int:
    yaml_path = Path(args.file)
    if not yaml_path.exists():
        print(f"Arquivo não encontrado: {yaml_path}")
        return 1

    out = build_block_from_yaml(yaml_path)
    update_blocks_index()
    print(f"Bloco gerado: {out}")
    print("Próximo passo: npm run catalog  (ou python -m ebrl sync)")
    return 0


def cmd_journal(_: argparse.Namespace) -> int:
    outputs = process_all_journals()
    if not outputs:
        print("Nenhum diário em content/journal/*.yaml")
        return 0
    for path in outputs:
        print(f"Gerado: {path}")
    return 0


def cmd_audio(args: argparse.Namespace) -> int:
    limit = int(args.limit) if args.limit else None
    print("Gerando áudios com edge-tts...")
    outputs = generate_catalog_audio(limit=limit)
    print(f"Pronto: {len(outputs)} arquivos em public/audio/")
    return 0


def cmd_setup(_: argparse.Namespace) -> int:
    catalog_path = CONTENT_DIR / "catalog.json"
    if not catalog_path.exists():
        sync_catalog()
    else:
        print(f"Catálogo OK: {catalog_path}")

    progress_path = ensure_progress_file()
    print(f"Progresso OK: {progress_path}")

    plan = build_daily_plan()
    md_path, json_path = save_daily_plan(plan)
    print(f"Aula do dia: {md_path}")

    journal_outputs = process_all_journals()
    for path in journal_outputs:
        print(f"Diário: {path}")

    print("Motor pronto.")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="ebrl",
        description="English by Real Life — motor de automação",
    )
    parser.add_argument("--version", action="version", version=f"%(prog)s {__version__}")

    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("sync", help="Exporta blocos do app para content/catalog.json").set_defaults(
        func=cmd_sync
    )
    sub.add_parser("daily", help="Gera a aula do dia em output/").set_defaults(func=cmd_daily)
    sub.add_parser("status", help="Mostra resumo do catálogo e progresso").set_defaults(
        func=cmd_status
    )
    sub.add_parser("journal", help="Gera exercícios a partir do diário").set_defaults(
        func=cmd_journal
    )
    sub.add_parser("setup", help="Configura tudo: catálogo, progresso, aula do dia").set_defaults(
        func=cmd_setup
    )

    audio_parser = sub.add_parser("audio", help="Gera MP3 de pronúncia em public/audio/")
    audio_parser.add_argument(
        "--limit",
        help="Limitar quantidade (teste rápido)",
        default=None,
    )
    audio_parser.set_defaults(func=cmd_audio)

    build_parser = sub.add_parser("build", help="Gera block-XX.ts a partir de YAML")
    build_parser.add_argument("file", help="Caminho do YAML (ex: content/blocks/block-19.yaml)")
    build_parser.set_defaults(func=cmd_build)

    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except FileNotFoundError as exc:
        print(f"Erro: {exc}")
        return 1
    except RuntimeError as exc:
        print(f"Erro: {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
