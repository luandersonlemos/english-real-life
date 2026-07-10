"use client";

import type { Block, LessonStep } from "@/types";

const steps: { id: LessonStep; label: string }[] = [
  { id: "intro", label: "Intro" },
  { id: "words", label: "Palavras" },
  { id: "verb", label: "Verbo" },
  { id: "connector", label: "Conector" },
  { id: "sentences", label: "Frases" },
  { id: "situations", label: "Situações" },
  { id: "speaking", label: "Fala" },
  { id: "review-plan", label: "Revisão" },
  { id: "mastery", label: "Domínio" },
];

interface LessonProgressProps {
  currentStep: LessonStep;
  block: Block;
}

export function LessonProgress({ currentStep }: LessonProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "btn-cosmic text-white"
                    : isDone
                      ? "bg-teal-500/20 text-teal-300 border border-teal-400/30"
                      : "bg-white/5 text-slate-500 border border-white/8"
                }`}
              >
                <span className="w-4 text-center">
                  {isDone ? "✓" : index + 1}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-1 h-0.5 w-3 sm:w-6 ${
                    isDone ? "bg-teal-400/50" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
