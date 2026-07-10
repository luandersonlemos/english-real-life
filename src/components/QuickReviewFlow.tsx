"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { blocks } from "@/data/blocks";
import { loadProgress } from "@/lib/progress";
import { buildQuickReviewSession } from "@/lib/review-session";
import { speak, stopSpeaking } from "@/lib/speech";

const TOTAL_SECONDS = 5 * 60;

type Phase = "intro" | "cards" | "speaking" | "done";

export function QuickReviewFlow() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [running, setRunning] = useState(false);

  const session = useMemo(() => {
    const progress = loadProgress();
    const enriched = blocks.map((block) => ({
      id: block.id,
      title: block.title,
      status: progress.blocks[block.id]?.status ?? "locked",
      words: block.words,
      sentences: block.sentences,
    }));
    return buildQuickReviewSession(enriched);
  }, []);

  useEffect(() => {
    if (!running || phase === "done" || phase === "intro") return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase("done");
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, phase]);

  useEffect(() => () => stopSpeaking(), []);

  const card = session.cards[index];
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");

  if (phase === "intro") {
    return (
      <section className="space-y-6">
        <div className="glass-panel rounded-2xl border-amber-400/30 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
            Modo revisão rápida
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-100">5 minutos de foco</h1>
          <p className="mt-2 text-slate-400">
            Flashcards dos blocos dominados + bloco atual, depois exercícios de fala.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>• {session.cards.length} flashcards</li>
            <li>• {session.speakingPrompts.length} frases para falar</li>
            <li>• Áudio automático (edge-tts no PC)</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => {
            setRunning(true);
            setPhase("cards");
          }}
          className="w-full rounded-xl bg-amber-500 px-6 py-4 text-sm font-semibold text-white hover:bg-amber-400 shadow-lg shadow-amber-500/25 transition-all"
        >
          Começar revisão →
        </button>
      </section>
    );
  }

  if (phase === "cards" && card) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Flashcard {index + 1}/{session.cards.length}
          </span>
          <span className="font-mono text-amber-300">
            {minutes}:{seconds}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setFlipped(!flipped)}
          className="w-full glass-panel glass-panel-hover rounded-2xl p-8 text-center border-amber-400/20 transition-colors"
        >
          <p className="text-xs text-slate-500">{card.blockTitle}</p>
          <span className="text-5xl block my-4">{card.emoji}</span>
          {flipped ? (
            <>
              <p className="text-2xl font-bold text-slate-100">{card.english}</p>
              <p className="text-slate-400 mt-1">{card.portuguese}</p>
              {card.example && (
                <p className="mt-3 text-sm text-amber-200 bg-amber-500/15 border border-amber-400/25 rounded-lg px-3 py-2">
                  {card.example}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-amber-300">Toque para revelar</p>
          )}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => void speak(card.english)}
            className="flex-1 rounded-xl glass-panel px-4 py-3 text-sm text-slate-300 hover:border-amber-400/30"
          >
            🔊 Ouvir de novo
          </button>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              if (index + 1 >= session.cards.length) {
                setPhase("speaking");
                setIndex(0);
                setFlipped(false);
                return;
              }
              setIndex(index + 1);
              setFlipped(false);
            }}
            className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-400"
          >
            Próximo →
          </button>
        </div>
      </section>
    );
  }

  if (phase === "speaking") {
    const prompt = session.speakingPrompts[index];
    if (!prompt) {
      setPhase("done");
      return null;
    }

    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Fala {index + 1}/{session.speakingPrompts.length}
          </span>
          <span className="font-mono text-amber-300">
            {minutes}:{seconds}
          </span>
        </div>

        <article className="glass-panel rounded-2xl border-violet-400/25 p-6">
          <p className="text-lg font-medium text-slate-100">{prompt}</p>
          <p className="mt-2 text-sm text-violet-300">
            Fale em voz alta antes de avançar. Use o botão para ouvir o modelo.
          </p>
        </article>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              const english = prompt
                .replace(/^[^:]+:\s*/, "")
                .replace(/^Diga em voz alta:\s*/, "")
                .replace(/^Repita:\s*/, "");
              void speak(english);
            }}
            className="flex-1 rounded-xl glass-panel px-4 py-3 text-sm text-slate-300 hover:border-violet-400/30"
          >
            🔊 Ouvir modelo
          </button>
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              if (index + 1 >= session.speakingPrompts.length) {
                setPhase("done");
                setRunning(false);
                return;
              }
              setIndex(index + 1);
            }}
            className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 shadow-lg shadow-violet-500/25"
          >
            Falei! Próximo →
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 text-center">
      <span className="text-5xl">🎉</span>
      <h1 className="text-2xl font-bold text-slate-100">Revisão concluída!</h1>
      <p className="text-slate-400">
        Você revisou {session.cards.length} palavras e praticou fala. Volte amanhã!
      </p>
      <Link
        href="/"
        className="inline-block rounded-xl btn-cosmic px-6 py-3 text-sm font-semibold text-white"
      >
        ← Voltar ao início
      </Link>
    </section>
  );
}
