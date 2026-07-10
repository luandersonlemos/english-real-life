"use client";

import type { BlockProgress } from "@/types";
import type { Block } from "@/types";
import type { PlanId } from "@/lib/plans";
import { isBlockInPlan } from "@/lib/plans";
import Link from "next/link";

const tenseLabel = { present: "Presente", past: "Passado" } as const;

const statusConfig = {
  locked: {
    label: "Bloqueado",
    color: "bg-slate-100 text-slate-400 border-slate-200",
    icon: "🔒",
  },
  available: {
    label: "Disponível",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    icon: "✨",
  },
  in_progress: {
    label: "Em andamento",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "📖",
  },
  review: {
    label: "Em revisão",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    icon: "🔄",
  },
  mastered: {
    label: "Dominado",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "✅",
  },
};

interface BlockCardProps {
  block: Block;
  progress: BlockProgress;
  plan?: PlanId;
}

export function BlockCard({ block, progress, plan = "premium" }: BlockCardProps) {
  const config = statusConfig[progress.status];
  const planLocked = !isBlockInPlan(block.number, plan);
  const isClickable = progress.status !== "locked" && !planLocked;

  const content = (
    <article
      className={`relative rounded-2xl border p-6 transition-all ${
        isClickable
          ? "border-slate-200 bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-100/50 cursor-pointer"
          : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-3xl">
            {block.emoji}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Bloco {block.number}
            </p>
            <h3 className="text-lg font-semibold text-slate-900">
              {block.title}{" "}
              <span className="text-slate-400 font-normal">/ {block.titleEn}</span>
            </h3>
            <p className="mt-1 text-sm text-slate-500">{block.theme}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}
        >
          {config.icon} {config.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          15 palavras
        </span>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          1 verbo: {block.verb.english}
        </span>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          1 conector: {block.connector.english}
        </span>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          {tenseLabel[block.tense]} · {block.pronouns.join(", ")}
        </span>
      </div>

      {progress.masteryScore !== undefined && (
        <p className="mt-3 text-sm text-emerald-600">
          Domínio: {progress.masteryScore}%
        </p>
      )}

      {isClickable && (
        <p className="mt-4 text-sm font-medium text-teal-600">
          {progress.status === "in_progress"
            ? "Continuar aula →"
            : progress.status === "review"
              ? "Fazer teste de domínio →"
              : progress.status === "mastered"
                ? "Revisar bloco →"
                : "Começar aula →"}
        </p>
      )}

      {progress.status === "locked" && !planLocked && (
        <p className="mt-4 text-sm text-slate-400">
          Complete o bloco anterior com 80% de domínio para desbloquear
        </p>
      )}

      {planLocked && (
        <p className="mt-4 text-sm text-violet-600">
          🔒 Premium —{" "}
          <Link href="/conta" className="underline font-medium">
            ative o plano
          </Link>{" "}
          para acessar este bloco
        </p>
      )}
    </article>
  );

  if (isClickable) {
    return <Link href={`/block/${block.id}`}>{content}</Link>;
  }

  return content;
}
