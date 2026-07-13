"use client";

import type { Block, LessonStep } from "@/types";
import { WordCard } from "./WordCard";
import { BilingualHeading, BilingualItem } from "./Bilingual";
import { speak } from "@/lib/speech";
import { useState, type ReactNode } from "react";

const tenseLabel = {
  present: { en: "present", pt: "presente" },
  past: { en: "past", pt: "passado" },
} as const;

interface LessonFlowProps {
  block: Block;
  initialStep?: LessonStep;
  onStepChange?: (step: LessonStep) => void;
  onComplete?: (score: number) => void;
}

const stepOrder: LessonStep[] = [
  "intro",
  "words",
  "verb",
  "connector",
  "sentences",
  "situations",
  "speaking",
  "review-plan",
  "mastery",
];

export function LessonFlow({
  block,
  initialStep = "intro",
  onStepChange,
  onComplete,
}: LessonFlowProps) {
  const [step, setStep] = useState<LessonStep>(initialStep);
  const [wordIndex, setWordIndex] = useState(0);
  const [spokenCount, setSpokenCount] = useState(0);

  const goTo = (next: LessonStep) => {
    setStep(next);
    onStepChange?.(next);
  };

  const next = () => {
    const idx = stepOrder.indexOf(step);
    if (idx < stepOrder.length - 1) {
      goTo(stepOrder[idx + 1]);
    }
  };

  const prev = () => {
    const idx = stepOrder.indexOf(step);
    if (idx > 0) {
      goTo(stepOrder[idx - 1]);
    }
  };

  return (
    <div className="min-w-0 w-full max-w-full overflow-x-hidden">
      {step === "intro" && (
        <section className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-teal-600/90 via-indigo-600/85 to-violet-700/90 border border-white/15 p-5 sm:p-8 text-white shadow-xl shadow-violet-600/25">
            <span className="text-5xl">{block.emoji}</span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold break-words">
              Block {block.number}: {block.titleEn}
            </h2>
            <p className="mt-2 text-teal-100 text-base sm:text-lg break-words">
              {block.title}
              <span className="text-white/50 text-sm sm:text-base block sm:inline sm:ml-2">
                / Bloco {block.number}
              </span>
            </p>
            {block.descriptionEn ? (
              <>
                <p className="mt-4 text-white/95 text-lg leading-relaxed">
                  {block.descriptionEn}
                </p>
                <p className="mt-2 text-white/55 text-sm leading-relaxed">
                  {block.description}
                </p>
              </>
            ) : (
              <p className="mt-4 text-white/90">{block.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            <div className="rounded-xl glass-panel p-4 sm:p-5 min-w-0 overflow-hidden">
              <BilingualHeading
                en="What you'll learn"
                pt="O que você vai aprender"
                className="font-semibold mb-3"
              />
              <ul className="space-y-2 text-sm">
                <BilingualItem
                  en="15 useful everyday words"
                  pt="15 palavras úteis do seu dia a dia"
                />
                <BilingualItem
                  en={
                    <>
                      Verb <strong className="text-teal-300">{block.verb.english}</strong> in the{" "}
                      {tenseLabel[block.tense].en}
                    </>
                  }
                  pt={
                    <>
                      Verbo <strong>{block.verb.english}</strong> no{" "}
                      {tenseLabel[block.tense].pt}
                    </>
                  }
                />
                <BilingualItem
                  en={
                    <>
                      Connector <strong className="text-teal-300">{block.connector.english}</strong> to build sentences
                    </>
                  }
                  pt={
                    <>
                      Conector <strong>{block.connector.english}</strong> para montar frases
                    </>
                  }
                />
                <BilingualItem
                  en={`Sentences with ${block.pronouns.join(", ")}`}
                  pt={`Frases com ${block.pronouns.join(", ")}`}
                />
                {block.pronouns.includes("He") && block.tense === "present" && (
                  <BilingualItem
                    en="New phase: He, She & It — the verb changes in the present!"
                    pt="Nova fase: He, She e It — o verbo muda no presente!"
                  />
                )}
                {block.pronouns.includes("He") && block.tense === "past" && (
                  <BilingualItem
                    en="Phase 3: He, She & It in the past — no -s on the verb!"
                    pt="Fase 3: He, She e It no passado — o verbo NÃO ganha -s!"
                  />
                )}
                <BilingualItem
                  en="3 real-life situations to practice"
                  pt="3 situações reais para praticar"
                />
                {block.tense === "past" && !block.pronouns.includes("He") && (
                  <BilingualItem
                    en="Past with I, You, We, They — connects to present blocks"
                    pt="Passado com I, You, We, They — conecta com os blocos do presente"
                  />
                )}
              </ul>
            </div>
            <div className="rounded-xl glass-panel p-4 sm:p-5 min-w-0 overflow-hidden">
              <BilingualHeading
                en="English by Real Life method"
                pt="Método English by Real Life"
                className="font-semibold mb-3"
              />
              <ul className="space-y-2 text-sm">
                <BilingualItem
                  icon="👁️"
                  en="Learn with images and visual association"
                  pt="Aprenda com imagens e associação visual"
                />
                <BilingualItem
                  icon="🗣️"
                  en="Speak from the very first lesson"
                  pt="Fale desde a primeira aula"
                />
                <BilingualItem
                  icon="🔄"
                  en="Automatic spaced repetition"
                  pt="Revisão espaçada automática"
                />
                <BilingualItem
                  icon="🚫"
                  en="No heavy grammar — phrases first"
                  pt="Sem gramática pesada — frases primeiro"
                />
              </ul>
            </div>
          </div>

          <NavButtons
            onNext={next}
            showPrev={false}
            nextLabel="Start lesson →"
          />
        </section>
      )}

      {step === "words" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">15 Useful Words</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Tap the card to reveal. Listen to the pronunciation. Match the emoji to the word.
            </p>
            <p className="text-slate-600 mt-1 text-xs">
              Toque no card para revelar. Ouça a pronúncia. Associe o emoji à palavra.
            </p>
          </div>

          <WordCard
            word={block.words[wordIndex]}
            index={wordIndex}
            total={block.words.length}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              disabled={wordIndex === 0}
              onClick={() => setWordIndex((i) => i - 1)}
              className="rounded-xl glass-panel px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-teal-400/30 transition-colors w-full sm:w-auto"
            >
              ← Previous
            </button>
            <span className="text-sm text-teal-300 font-medium text-center">
              {wordIndex + 1} of {block.words.length}
            </span>
            <button
              type="button"
              disabled={wordIndex === block.words.length - 1}
              onClick={() => setWordIndex((i) => i + 1)}
              className="rounded-xl glass-panel px-4 py-2 text-sm text-slate-300 disabled:opacity-40 hover:border-teal-400/30 transition-colors w-full sm:w-auto"
            >
              Next →
            </button>
          </div>

          {wordIndex === block.words.length - 1 && (
            <NavButtons onNext={next} onPrev={prev} nextLabel="Learn the verb →" />
          )}
        </section>
      )}

      {step === "verb" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              Verbo do bloco: {block.verb.english.toUpperCase()}
            </h2>
            <p className="text-slate-500 mt-1">
              {block.verb.portuguese} · Tense / Tempo: {tenseLabel[block.tense].en} /{" "}
              {tenseLabel[block.tense].pt} · Pronouns / Pronomes:{" "}
              {block.pronouns.join(", ")}
            </p>
          </div>

          <div className="rounded-2xl glass-panel p-8 text-center">
            <span className="text-5xl">{block.verb.emoji}</span>
            <p className="mt-4 text-3xl font-bold text-slate-100">{block.verb.english}</p>
            <p className="text-slate-500">{block.verb.portuguese}</p>
            <button
              type="button"
              onClick={() => void speak(block.verb.english)}
              className="mt-4 rounded-full bg-teal-500/20 border border-teal-400/30 px-4 py-2 text-sm text-teal-300 hover:bg-teal-500/30"
            >
              🔊 Ouvir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {block.pronouns.map((p) => (
              <div
                key={p}
                className="rounded-xl glass-panel p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-100">{p}</p>
                  <p className="text-teal-300">
                    {p} {block.verb.conjugations[p]}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void speak(`${p} ${block.verb.conjugations[p]}`)}
                  className="text-lg hover:scale-110 transition-transform"
                >
                  🔊
                </button>
              </div>
            ))}
          </div>

          {block.pronouns.includes("He") && block.tense === "present" && (
            <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm text-violet-200">
              <strong>Regra nova:</strong> I / You / We / They →{" "}
              <em>{block.verb.conjugations.I ?? block.verb.english}</em>
              <br />
              He / She / It →{" "}
              <em>{block.verb.conjugations.He ?? `${block.verb.english}s`}</em> (+s no final)
            </div>
          )}

          {block.pronouns.includes("He") && block.tense === "past" && (
            <div className="rounded-xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm text-violet-200">
              <strong>Regra do passado:</strong> He / She / It usam a mesma forma —{" "}
              <em>He {block.verb.conjugations.He ?? block.verb.english}</em>,{" "}
              <em>She {block.verb.conjugations.She ?? block.verb.english}</em> — sem -s!
            </div>
          )}

          <p className="text-sm text-amber-200 glass-panel border-amber-400/25 rounded-xl p-4">
            💡 <strong>Dica:</strong>{" "}
            {block.pronouns.includes("He") && block.tense === "present"
              ? `Com He, She e It o verbo ganha -s: want → wants. No passado todos ficam iguais (wanted).`
              : block.tense === "past"
                ? `No passado, com I, You, We e They o verbo é ${block.verb.english} — todos iguais!`
                : `Com I, You, We e They o verbo ${block.verb.english} não muda!`}
          </p>

          <NavButtons onNext={next} onPrev={prev} nextLabel="Aprender o conector" />
        </section>
      )}

      {step === "connector" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              Conector: {block.connector.english.toUpperCase()}
            </h2>
            <p className="text-slate-500 mt-1">
              Use <strong>{block.connector.english}</strong> ({block.connector.portuguese}
              ). Exemplo: {block.connector.example}.
            </p>
          </div>

          <div className="rounded-2xl glass-panel p-8 text-center">
            <span className="text-5xl">{block.connector.emoji}</span>
            <p className="mt-4 text-3xl font-bold text-slate-100">{block.connector.english}</p>
            <p className="text-slate-500">{block.connector.portuguese}</p>
          </div>

          <div className="space-y-3">
            {block.sentences
              .filter((s) =>
                s.english.toLowerCase().includes(block.connector.english.toLowerCase())
              )
              .slice(0, 3)
              .map((sentence) => (
                <div
                  key={sentence.id}
                  className="rounded-xl glass-panel p-4 flex items-center justify-between"
                >
                  <p className="text-sm text-slate-300">{sentence.english}</p>
                  <button
                    type="button"
                    onClick={() => void speak(sentence.english)}
                    className="shrink-0 text-sm ml-3"
                  >
                    🔊
                  </button>
                </div>
              ))}
          </div>

          <NavButtons onNext={next} onPrev={prev} nextLabel="Construir frases" />
        </section>
      )}

      {step === "sentences" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Construção de Frases</h2>
            <p className="text-slate-500 mt-1">
              Leia em voz alta. Pense na situação. Repita até fluir naturalmente.
            </p>
          </div>

          <div className="space-y-4">
            {block.sentences.map((sentence) => (
              <div
                key={sentence.id}
                className="rounded-xl glass-panel p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-medium text-teal-300 bg-teal-500/15 border border-teal-400/25 px-2 py-0.5 rounded-full">
                      {sentence.pronoun} · {sentence.situation}
                    </span>
                    <p className="mt-2 text-xl font-semibold text-slate-100">
                      {sentence.english}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">{sentence.portuguese}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void speak(sentence.english)}
                    className="shrink-0 rounded-full bg-white/10 border border-white/10 p-3 hover:bg-teal-500/20 transition-colors"
                  >
                    🔊
                  </button>
                </div>
              </div>
            ))}
          </div>

          <NavButtons onNext={next} onPrev={prev} nextLabel="Situações reais" />
        </section>
      )}

      {step === "situations" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Situações Reais</h2>
            <p className="text-slate-500 mt-1">
              Encene cada diálogo. Imagine que está vivendo a situação.
            </p>
          </div>

          {block.situations.map((sit) => (
            <div key={sit.id} className="rounded-2xl glass-panel overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500/15 to-teal-500/15 px-6 py-4 border-b border-white/10">
                <span className="text-3xl">{sit.emoji}</span>
                <h3 className="font-semibold text-slate-100 mt-2">{sit.title}</h3>
                <p className="text-sm text-slate-500">{sit.description}</p>
              </div>
              <div className="p-6 space-y-4">
                {sit.dialogue.map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="shrink-0 w-24 text-xs text-slate-400 pt-1">
                      {line.speaker}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-100">{line.text}</p>
                      <p className="text-sm text-slate-400">{line.translation}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void speak(line.text)}
                      className="shrink-0 text-sm hover:scale-110 transition-transform"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <NavButtons onNext={next} onPrev={prev} nextLabel="Exercício de fala" />
        </section>
      )}

      {step === "speaking" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Exercício de Fala</h2>
            <p className="text-slate-500 mt-1">
              Fale cada frase em voz alta. Marque quando conseguir pronunciar com confiança.
            </p>
          </div>

          <div className="space-y-3">
            {block.sentences.slice(0, 5).map((sentence) => (
              <SpeakingLine key={sentence.id} sentence={sentence.english} />
            ))}
          </div>

          <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-5">
            <h3 className="font-semibold text-violet-200">Desafio livre</h3>
            <p className="text-sm text-violet-300 mt-1">
              Crie sua própria frase sobre o que você quer agora. Exemplo:
            </p>
            <p className="mt-2 font-medium text-violet-100">
              &quot;I want coffee and breakfast now.&quot;
            </p>
            <button
              type="button"
              onClick={() => setSpokenCount((c) => c + 1)}
              className="mt-3 rounded-xl bg-violet-600 text-white px-4 py-2 text-sm hover:bg-violet-700"
            >
              ✓ Falei minha frase!
            </button>
            {spokenCount > 0 && (
              <p className="mt-2 text-sm text-violet-300">
                Ótimo! Você criou {spokenCount} frase(s) própria(s).
              </p>
            )}
          </div>

          <NavButtons onNext={next} onPrev={prev} nextLabel="Ver plano de revisão" />
        </section>
      )}

      {step === "review-plan" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Plano de Revisão</h2>
            <p className="text-slate-500 mt-1">
              Repetição espaçada — revise nestes dias antes do teste de domínio.
            </p>
          </div>

          <div className="space-y-4">
            {block.reviewPlan.map((day) => (
              <div
                key={day.day}
                className="rounded-xl glass-panel p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-bold text-sm">
                    D{day.day}
                  </span>
                  <h3 className="font-semibold text-slate-100">{day.label}</h3>
                </div>
                <ul className="space-y-2">
                  {day.activities.map((activity, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-400">
                      <span className="text-teal-500">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-5">
            <p className="text-sm text-amber-200">
              <strong>Importante:</strong> Só avance para o próximo bloco quando demonstrar
              domínio de pelo menos {block.masteryThreshold}% no teste final.
            </p>
          </div>

          <NavButtons
            onNext={next}
            onPrev={prev}
            nextLabel="Fazer teste de domínio"
          />
        </section>
      )}

      {step === "mastery" && (
        <MasteryQuiz
          block={block}
          onPrev={prev}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

function NavButtons({
  onNext,
  onPrev,
  showPrev = true,
  nextLabel = "Continue →",
}: {
  onNext: () => void;
  onPrev?: () => void;
  showPrev?: boolean;
  nextLabel?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full min-w-0">
      {showPrev && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="rounded-xl glass-panel px-6 py-3 text-sm font-medium text-slate-300 hover:border-teal-400/35 transition-colors w-full sm:w-auto shrink-0"
        >
          ← Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="flex-1 min-w-0 w-full rounded-xl btn-cosmic px-4 sm:px-6 py-3 text-sm font-medium text-white transition-all text-center break-words"
      >
        {nextLabel}
      </button>
    </div>
  );
}

function ExampleSentence({
  parts,
  emojis,
  sentence,
  full,
}: {
  parts: string[];
  emojis: string[];
  sentence: string;
  full?: boolean;
}) {
  return (
    <div className="rounded-xl glass-panel p-4 flex items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <span>{emojis[i]}</span>
            <span
              className={`text-sm ${part === "and" ? "font-bold text-teal-300" : "text-slate-300"}`}
            >
              {part}
            </span>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void speak(sentence)}
        className="shrink-0 text-sm"
      >
        🔊
      </button>
    </div>
  );
}

function SpeakingLine({ sentence }: { sentence: string }) {
  const [done, setDone] = useState(false);

  return (
    <div
      className={`rounded-xl border p-4 flex items-center justify-between transition-colors ${
        done ? "border-emerald-400/40 bg-emerald-500/15" : "glass-panel"
      }`}
    >
      <p className="font-medium text-slate-100">{sentence}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void speak(sentence)}
          className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-slate-300 hover:bg-teal-500/20"
        >
          🔊 Ouvir
        </button>
        <button
          type="button"
          onClick={() => setDone(!done)}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            done
              ? "bg-emerald-600 text-white"
              : "bg-white/10 border border-white/10 hover:bg-emerald-500/20 text-slate-300"
          }`}
        >
          {done ? "✓ Feito" : "Falei!"}
        </button>
      </div>
    </div>
  );
}

function MasteryQuiz({
  block,
  onPrev,
  onComplete,
}: {
  block: Block;
  onPrev: () => void;
  onComplete?: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = block.masteryQuiz.length;
  const correct = block.masteryQuiz.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;
  const score = Math.round((correct / total) * 100);
  const passed = score >= block.masteryThreshold;

  const handleSubmit = () => {
    setSubmitted(true);
    if (passed) {
      onComplete?.(score);
    }
  };

  const allAnswered = block.masteryQuiz.every((q) => answers[q.id] !== undefined);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Teste de Domínio</h2>
        <p className="text-slate-500 mt-1">
          Precisa de {block.masteryThreshold}% para desbloquear o próximo bloco.
        </p>
      </div>

      <div className="space-y-6">
        {block.masteryQuiz.map((q, index) => (
          <div key={q.id} className="rounded-xl glass-panel p-5">
            <p className="font-medium text-slate-100 mb-3">
              {index + 1}. {q.prompt}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((option, i) => {
                const selected = answers[q.id] === i;
                const isCorrect = i === q.correctIndex;
                let style = "border-white/15 bg-white/5 hover:border-teal-400/40 text-slate-300";

                if (submitted) {
                  if (isCorrect) style = "border-emerald-400/50 bg-emerald-500/15 text-emerald-200";
                  else if (selected) style = "border-red-400/50 bg-red-500/15 text-red-200";
                } else if (selected) {
                  style = "border-teal-400/50 bg-teal-500/15 text-teal-200";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers({ ...answers, [q.id]: i })}
                    className={`rounded-lg border px-4 py-3 text-sm text-left transition-colors ${style}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {submitted && (
        <div
          className={`rounded-2xl p-6 text-center ${
            passed
              ? "bg-emerald-500/15 border border-emerald-400/35"
              : "bg-red-500/15 border border-red-400/35"
          }`}
        >
          <p className="text-4xl mb-2">{passed ? "🎉" : "📚"}</p>
          <p className="text-2xl font-bold text-slate-100">{score}%</p>
          <p className="mt-2 text-slate-400">
            {passed
              ? "Parabéns! Você dominou este bloco. O próximo será liberado."
              : `Continue revisando. Você precisa de ${block.masteryThreshold}%.`}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-xl glass-panel px-6 py-3 text-sm font-medium text-slate-300 hover:border-teal-400/35 transition-colors"
        >
          ← Voltar
        </button>
        {!submitted ? (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="flex-1 rounded-xl btn-cosmic px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            Enviar respostas
          </button>
        ) : !passed ? (
          <button
            type="button"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
            className="flex-1 rounded-xl bg-amber-500 px-6 py-3 text-sm font-medium text-white hover:bg-amber-600"
          >
            Tentar novamente
          </button>
        ) : null}
      </div>
    </section>
  );
}
