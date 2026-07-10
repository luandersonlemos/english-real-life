"use client";

import type { Word } from "@/types";
import { speak } from "@/lib/speech";
import { useState } from "react";

interface WordCardProps {
  word: Word;
  index: number;
}

export function WordCard({ word, index }: WordCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setFlipped(!flipped);
      }}
      className="group relative w-full text-left cursor-pointer"
      aria-label={`Card da palavra ${word.english}`}
    >
      <div
        className={`rounded-2xl border p-5 transition-all duration-300 ${
          flipped
            ? "border-teal-300 bg-teal-50"
            : "border-slate-200 bg-white hover:border-teal-200 hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">
            Palavra {index + 1}/15
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void speak(word.english);
            }}
            className="rounded-full bg-slate-100 px-3 py-2 text-xs hover:bg-teal-100 transition-colors"
            aria-label="Ouvir de novo"
            title="Ouvir de novo"
          >
            🔊 Ouvir
          </button>
        </div>

        {!flipped ? (
          <div className="text-center py-2">
            <span className="text-5xl block mb-3">{word.emoji}</span>
            <p className="text-xs text-slate-400 italic">{word.imageHint}</p>
            <p className="mt-3 text-xs text-teal-600">Toque para revelar</p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-2xl font-bold text-slate-900">{word.english}</p>
            <p className="text-slate-500 mt-1">{word.portuguese}</p>
            {word.example && (
              <p className="mt-3 text-sm text-teal-700 bg-teal-100/50 rounded-lg px-3 py-2">
                {word.example}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
