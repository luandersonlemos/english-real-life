"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BlockCard } from "@/components/BlockCard";
import { blocks } from "@/data/blocks";
import { loadProgress } from "@/lib/progress";
import type { BlockProgress, UserProgress } from "@/types";
import Link from "next/link";

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const getBlockProgress = (blockId: string): BlockProgress => {
    return (
      progress?.blocks[blockId] ?? {
        blockId,
        status: blockId === "block-01" ? "available" : "locked",
        currentStep: 0,
        reviewDates: {},
      }
    );
  };

  const masteredCount = progress
    ? Object.values(progress.blocks).filter((b) => b.status === "mastered").length
    : 0;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-teal-50/80 to-white border-b border-slate-100">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-teal-600 mb-3">
                Seu treinador pessoal de inglês
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                English by Real Life
              </h1>
              <p className="mt-4 text-lg text-slate-600 leading-relaxed">
                Aprenda inglês por blocos temáticos do seu dia a dia. Palavras visuais,
                frases simples, fala desde o início — sem gramática pesada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/block/block-01"
                  className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Começar Bloco 1 →
                </Link>
                <span className="rounded-xl border border-slate-200 px-6 py-3 text-sm text-slate-600 bg-white">
                  {masteredCount}/{blocks.length} blocos dominados
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Seus Blocos Temáticos
          </h2>
          <div className="space-y-4">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                progress={getBlockProgress(block.id)}
              />
            ))}

            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <span className="text-3xl">🎓</span>
              <p className="mt-2 font-medium text-emerald-800">18 blocos completos!</p>
              <p className="text-sm text-emerald-600 mt-1">
                Fase 1: I/You/We/They · Fase 2: He/She/It · 270 palavras
              </p>
            </article>
          </div>
        </section>

        <section className="bg-slate-50 border-t border-slate-100">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-8 text-center">
              Como funciona o método
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  emoji: "🧱",
                  title: "Blocos temáticos",
                  desc: "15 palavras + 1 verbo + 1 conector por tema real",
                },
                {
                  emoji: "👁️",
                  title: "Aprendizado visual",
                  desc: "Emojis, imagens e associação para fixar palavras",
                },
                {
                  emoji: "🗣️",
                  title: "Fala primeiro",
                  desc: "Frases simples antes de gramática complexa",
                },
                {
                  emoji: "🔄",
                  title: "Revisão espaçada",
                  desc: "Plano automático — só avança com domínio real",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-white border border-slate-200 p-5 text-center"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <p className="text-center text-sm text-slate-400">
          English by Real Life · Projeto de portfólio · Método personalizado
        </p>
      </footer>
    </>
  );
}
