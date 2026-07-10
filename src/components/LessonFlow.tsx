"use client";

import type { Block, LessonStep } from "@/types";
import { WordCard } from "./WordCard";
import { speak } from "@/lib/speech";
import { useState } from "react";

const tenseLabel = { present: "presente", past: "passado" } as const;

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
    <div>
      {step === "intro" && (
        <section className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-8 text-white">
            <span className="text-5xl">{block.emoji}</span>
            <h2 className="mt-4 text-3xl font-bold">
              Bloco {block.number}: {block.title}
            </h2>
            <p className="mt-2 text-teal-100 text-lg">{block.titleEn}</p>
            <p className="mt-4 text-white/90">{block.description}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-5 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">O que você vai aprender</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>✓ 15 palavras úteis do seu dia a dia</li>
                <li>
                  ✓ Verbo <strong>{block.verb.english}</strong> no{" "}
                  {tenseLabel[block.tense]}
                </li>
                <li>
                  ✓ Conector <strong>{block.connector.english}</strong> para montar
                  frases
                </li>
                <li>✓ Frases com {block.pronouns.join(", ")}</li>
                {block.pronouns.includes("He") && block.tense === "present" && (
                  <li>✓ Nova fase: He, She e It — o verbo muda no presente!</li>
                )}
                {block.pronouns.includes("He") && block.tense === "past" && (
                  <li>✓ Fase 3: He, She e It no passado — o verbo NÃO ganha -s!</li>
                )}
                <li>✓ 3 situações reais para praticar</li>
                {block.tense === "past" && !block.pronouns.includes("He") && (
                  <li>✓ Passado com I, You, We, They — conecta com os blocos do presente</li>
                )}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-5 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Método English by Real Life</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>👁️ Aprenda com imagens e associação visual</li>
                <li>🗣️ Fale desde a primeira aula</li>
                <li>🔄 Revisão espaçada automática</li>
                <li>🚫 Sem gramática pesada — frases primeiro</li>
              </ul>
            </div>
          </div>

          <NavButtons onNext={next} showPrev={false} nextLabel="Começar aula" />
        </section>
      )}

      {step === "words" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">15 Palavras Úteis</h2>
            <p className="text-slate-500 mt-1">
              Toque no card para revelar. Ouça a pronúncia. Associe o emoji à palavra.
            </p>
          </div>

          <WordCard word={block.words[wordIndex]} index={wordIndex} />

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={wordIndex === 0}
              onClick={() => setWordIndex((i) => i - 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-500">
              {wordIndex + 1} de {block.words.length}
            </span>
            <button
              type="button"
              disabled={wordIndex === block.words.length - 1}
              onClick={() => setWordIndex((i) => i + 1)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Próxima →
            </button>
          </div>

          {wordIndex === block.words.length - 1 && (
            <NavButtons onNext={next} onPrev={prev} nextLabel="Aprender o verbo" />
          )}
        </section>
      )}

      {step === "verb" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Verbo do bloco: {block.verb.english.toUpperCase()}
            </h2>
            <p className="text-slate-500 mt-1">
              {block.verb.portuguese} · Tempo: {tenseLabel[block.tense]} · Pronomes:{" "}
              {block.pronouns.join(", ")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <span className="text-5xl">{block.verb.emoji}</span>
            <p className="mt-4 text-3xl font-bold text-slate-900">{block.verb.english}</p>
            <p className="text-slate-500">{block.verb.portuguese}</p>
            <button
              type="button"
              onClick={() => void speak(block.verb.english)}
              className="mt-4 rounded-full bg-teal-100 px-4 py-2 text-sm text-teal-700 hover:bg-teal-200"
            >
              🔊 Ouvir
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {block.pronouns.map((p) => (
              <div
                key={p}
                className="rounded-xl border border-slate-200 p-4 flex items-center justify-between bg-white"
              >
                <div>
                  <p className="font-bold text-slate-900">{p}</p>
                  <p className="text-teal-600">
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
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
              <strong>Regra nova:</strong> I / You / We / They →{" "}
              <em>{block.verb.conjugations.I ?? block.verb.english}</em>
              <br />
              He / She / It →{" "}
              <em>{block.verb.conjugations.He ?? `${block.verb.english}s`}</em> (+s no final)
            </div>
          )}

          {block.pronouns.includes("He") && block.tense === "past" && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
              <strong>Regra do passado:</strong> He / She / It usam a mesma forma —{" "}
              <em>He {block.verb.conjugations.He ?? block.verb.english}</em>,{" "}
              <em>She {block.verb.conjugations.She ?? block.verb.english}</em> — sem -s!
            </div>
          )}

          <p className="text-sm text-slate-500 bg-amber-50 border border-amber-100 rounded-xl p-4">
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
            <h2 className="text-2xl font-bold text-slate-900">
              Conector: {block.connector.english.toUpperCase()}
            </h2>
            <p className="text-slate-500 mt-1">
              Use <strong>{block.connector.english}</strong> ({block.connector.portuguese}
              ). Exemplo: {block.connector.example}.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <span className="text-5xl">{block.connector.emoji}</span>
            <p className="mt-4 text-3xl font-bold text-slate-900">{block.connector.english}</p>
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
                  className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between"
                >
                  <p className="text-sm text-slate-700">{sentence.english}</p>
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
            <h2 className="text-2xl font-bold text-slate-900">Construção de Frases</h2>
            <p className="text-slate-500 mt-1">
              Leia em voz alta. Pense na situação. Repita até fluir naturalmente.
            </p>
          </div>

          <div className="space-y-4">
            {block.sentences.map((sentence) => (
              <div
                key={sentence.id}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      {sentence.pronoun} · {sentence.situation}
                    </span>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {sentence.english}
                    </p>
                    <p className="text-slate-500 text-sm mt-1">{sentence.portuguese}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void speak(sentence.english)}
                    className="shrink-0 rounded-full bg-slate-100 p-3 hover:bg-teal-100 transition-colors"
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
            <h2 className="text-2xl font-bold text-slate-900">Situações Reais</h2>
            <p className="text-slate-500 mt-1">
              Encene cada diálogo. Imagine que está vivendo a situação.
            </p>
          </div>

          {block.situations.map((sit) => (
            <div key={sit.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-teal-50 px-6 py-4 border-b border-slate-100">
                <span className="text-3xl">{sit.emoji}</span>
                <h3 className="font-semibold text-slate-900 mt-2">{sit.title}</h3>
                <p className="text-sm text-slate-500">{sit.description}</p>
              </div>
              <div className="p-6 space-y-4">
                {sit.dialogue.map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="shrink-0 w-24 text-xs text-slate-400 pt-1">
                      {line.speaker}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{line.text}</p>
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
            <h2 className="text-2xl font-bold text-slate-900">Exercício de Fala</h2>
            <p className="text-slate-500 mt-1">
              Fale cada frase em voz alta. Marque quando conseguir pronunciar com confiança.
            </p>
          </div>

          <div className="space-y-3">
            {block.sentences.slice(0, 5).map((sentence) => (
              <SpeakingLine key={sentence.id} sentence={sentence.english} />
            ))}
          </div>

          <div className="rounded-xl bg-violet-50 border border-violet-100 p-5">
            <h3 className="font-semibold text-violet-900">Desafio livre</h3>
            <p className="text-sm text-violet-700 mt-1">
              Crie sua própria frase sobre o que você quer agora. Exemplo:
            </p>
            <p className="mt-2 font-medium text-violet-900">
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
              <p className="mt-2 text-sm text-violet-600">
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
            <h2 className="text-2xl font-bold text-slate-900">Plano de Revisão</h2>
            <p className="text-slate-500 mt-1">
              Repetição espaçada — revise nestes dias antes do teste de domínio.
            </p>
          </div>

          <div className="space-y-4">
            {block.reviewPlan.map((day) => (
              <div
                key={day.day}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-bold text-sm">
                    D{day.day}
                  </span>
                  <h3 className="font-semibold text-slate-900">{day.label}</h3>
                </div>
                <ul className="space-y-2">
                  {day.activities.map((activity, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600">
                      <span className="text-teal-500">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-5">
            <p className="text-sm text-amber-800">
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
  nextLabel = "Continuar",
}: {
  onNext: () => void;
  onPrev?: () => void;
  showPrev?: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="flex gap-3 pt-4">
      {showPrev && onPrev && (
        <button
          type="button"
          onClick={onPrev}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium hover:bg-slate-50"
        >
          ← Voltar
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        className="flex-1 rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
      >
        {nextLabel} →
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        {parts.map((part, i) => (
          <span key={i} className="flex items-center gap-1">
            <span>{emojis[i]}</span>
            <span
              className={`text-sm ${part === "and" ? "font-bold text-teal-600" : "text-slate-700"}`}
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
        done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
      }`}
    >
      <p className="font-medium text-slate-900">{sentence}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void speak(sentence)}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm hover:bg-teal-100"
        >
          🔊 Ouvir
        </button>
        <button
          type="button"
          onClick={() => setDone(!done)}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            done
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 hover:bg-emerald-100"
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
        <h2 className="text-2xl font-bold text-slate-900">Teste de Domínio</h2>
        <p className="text-slate-500 mt-1">
          Precisa de {block.masteryThreshold}% para desbloquear o próximo bloco.
        </p>
      </div>

      <div className="space-y-6">
        {block.masteryQuiz.map((q, index) => (
          <div key={q.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="font-medium text-slate-900 mb-3">
              {index + 1}. {q.prompt}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((option, i) => {
                const selected = answers[q.id] === i;
                const isCorrect = i === q.correctIndex;
                let style = "border-slate-200 hover:border-teal-300";

                if (submitted) {
                  if (isCorrect) style = "border-emerald-400 bg-emerald-50";
                  else if (selected) style = "border-red-300 bg-red-50";
                } else if (selected) {
                  style = "border-teal-400 bg-teal-50";
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
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <p className="text-4xl mb-2">{passed ? "🎉" : "📚"}</p>
          <p className="text-2xl font-bold text-slate-900">{score}%</p>
          <p className="mt-2 text-slate-600">
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
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium hover:bg-slate-50"
        >
          ← Voltar
        </button>
        {!submitted ? (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-teal-600 px-6 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-40"
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
