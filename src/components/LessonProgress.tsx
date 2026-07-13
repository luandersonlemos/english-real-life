"use client";

import type { ReactNode } from "react";
import type { Block, LessonStep } from "@/types";

const steps: { id: LessonStep; labelEn: string; labelPt: string }[] = [
  { id: "intro", labelEn: "Intro", labelPt: "Intro" },
  { id: "words", labelEn: "Words", labelPt: "Palavras" },
  { id: "verb", labelEn: "Verb", labelPt: "Verbo" },
  { id: "connector", labelEn: "Connector", labelPt: "Conector" },
  { id: "sentences", labelEn: "Sentences", labelPt: "Frases" },
  { id: "situations", labelEn: "Situations", labelPt: "Situações" },
  { id: "speaking", labelEn: "Speaking", labelPt: "Fala" },
  { id: "review-plan", labelEn: "Review", labelPt: "Revisão" },
  { id: "mastery", labelEn: "Mastery", labelPt: "Domínio" },
];

interface LessonProgressProps {
  currentStep: LessonStep;
  block: Block;
}

export function LessonProgress({ currentStep }: LessonProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8 min-w-0 max-w-full overflow-hidden">
      <div className="flex items-center gap-1 overflow-x-auto pb-2 max-w-full [-webkit-overflow-scrolling:touch]">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
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
                <span>{step.labelEn}</span>
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
