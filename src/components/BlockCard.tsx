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
    color: "bg-slate-800/60 text-slate-500 border-slate-600/40",
    icon: "🔒",
  },
  available: {
    label: "Disponível",
    color: "bg-teal-500/15 text-teal-300 border-teal-400/35",
    icon: "✨",
  },
  in_progress: {
    label: "Em andamento",
    color: "bg-amber-500/15 text-amber-300 border-amber-400/35",
    icon: "📖",
  },
  review: {
    label: "Em revisão",
    color: "bg-violet-500/15 text-violet-300 border-violet-400/35",
    icon: "🔄",
  },
  mastered: {
    label: "Dominado",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-400/35",
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
      className={`relative rounded-2xl p-6 transition-all duration-300 ${
        isClickable
          ? "glass-panel glass-panel-hover cursor-pointer"
          : "glass-panel opacity-55 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 border border-white/10 text-3xl">
            {block.emoji}
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Bloco {block.number}
            </p>
            <h3 className="text-lg font-semibold text-slate-100">
              {block.title}{" "}
              <span className="text-slate-500 font-normal">/ {block.titleEn}</span>
            </h3>
            <p className="mt-1 text-sm text-slate-400">{block.theme}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}
        >
          {config.icon} {config.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["15 palavras", `1 verbo: ${block.verb.english}`, `1 conector: ${block.connector.english}`, `${tenseLabel[block.tense]} · ${block.pronouns.join(", ")}`].map(
          (tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white/5 border border-white/8 px-2.5 py-1 text-xs text-slate-400"
            >
              {tag}
            </span>
          )
        )}
      </div>

      {progress.masteryScore !== undefined && (
        <p className="mt-3 text-sm text-emerald-400">Domínio: {progress.masteryScore}%</p>
      )}

      {isClickable && (
        <p className="mt-4 text-sm font-medium text-teal-300">
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
        <p className="mt-4 text-sm text-slate-500">
          Complete o bloco anterior com 80% de domínio para desbloquear
        </p>
      )}

      {planLocked && (
        <p className="mt-4 text-sm text-violet-300">
          🔒 Premium —{" "}
          <Link href="/conta" className="underline font-medium text-violet-200">
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
