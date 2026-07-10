"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { BlockCard } from "@/components/BlockCard";
import { DailyLessonCard } from "@/components/DailyLessonCard";
import { InstallGuideCard } from "@/components/InstallGuideCard";
import { blocks } from "@/data/blocks";
import { loadProgress } from "@/lib/progress";
import { useAuth } from "@/contexts/auth-context";
import type { BlockProgress, UserProgress } from "@/types";
import Link from "next/link";

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const { plan, user, supabaseEnabled } = useAuth();

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
        <section className="relative border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 via-transparent to-transparent pointer-events-none" />
          <div className="mx-auto max-w-5xl px-4 py-12 sm:py-20 relative">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-teal-300 mb-3 tracking-wide">
                ✦ Seu treinador pessoal de inglês
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight text-glow">
                English by Real Life
              </h1>
              <p className="mt-4 text-lg text-slate-300 leading-relaxed">
                Aprenda inglês por blocos temáticos do seu dia a dia. Palavras visuais,
                frases simples, fala desde o início — sem gramática pesada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/block/block-01"
                  className="rounded-xl btn-cosmic px-6 py-3 text-sm font-semibold text-white transition-all"
                >
                  Começar Bloco 1 →
                </Link>
                <Link
                  href="/revisao"
                  className="rounded-xl glass-panel border-amber-400/30 px-6 py-3 text-sm font-semibold text-amber-200 hover:border-amber-400/50 transition-colors"
                >
                  Revisão rápida (5 min) →
                </Link>
                <Link
                  href={user ? "/conta" : "/auth"}
                  className="rounded-xl glass-panel px-6 py-3 text-sm font-semibold text-violet-200 hover:border-violet-400/40 transition-colors"
                >
                  {user ? "Minha conta" : "Entrar / Criar conta"}
                </Link>
                <span className="rounded-xl glass-panel px-6 py-3 text-sm text-slate-300">
                  {masteredCount}/{blocks.length} blocos dominados
                </span>
              </div>
            </div>
          </div>
        </section>

        <DailyLessonCard />

        {supabaseEnabled && plan === "free" && (
          <section className="mx-auto max-w-5xl px-4 pb-4">
            <article className="rounded-2xl border border-violet-400/25 bg-violet-500/10 backdrop-blur-sm px-5 py-4 text-sm text-violet-200">
              Plano <strong>Gratuito</strong> — blocos 1 a 3 liberados.{" "}
              <Link href="/conta" className="font-semibold underline">
                Ative o Premium
              </Link>{" "}
              para os 24 blocos.
            </article>
          </section>
        )}

        <InstallGuideCard />

        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="text-xl font-semibold text-slate-100 mb-6">
            Seus Blocos Temáticos
          </h2>
          <div className="space-y-4">
            {blocks.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                progress={getBlockProgress(block.id)}
                plan={plan}
              />
            ))}

            <article className="glass-panel rounded-2xl p-6 text-center border-violet-400/20">
              <span className="text-3xl">🌙</span>
              <p className="mt-2 font-medium text-violet-200">Fase 3 — Passado He/She/It</p>
              <p className="text-sm text-slate-400 mt-1">
                Blocos 19–24 · Domine o Bloco 18 para liberar · 360 palavras no total
              </p>
            </article>
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto max-w-5xl px-4 py-12">
            <h2 className="text-xl font-semibold text-slate-100 mb-8 text-center">
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
                  className="glass-panel rounded-xl p-5 text-center hover:border-teal-400/25 transition-colors"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <h3 className="mt-3 font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 glass-panel py-6">
        <p className="text-center text-sm text-slate-500">
          English by Real Life · Projeto de portfólio · Método personalizado
        </p>
      </footer>
    </>
  );
}
