"use client";

import { useEffect, useState } from "react";

interface DailyTask {
  kind: string;
  title: string;
  detail: string;
  block_id?: string;
  minutes: number;
}

interface DailyPlan {
  date: string;
  student: string;
  total_minutes: number;
  tasks: DailyTask[];
  speaking_prompts: string[];
  flashcards: { english: string; portuguese: string; emoji: string }[];
}

export function DailyLessonCard() {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch("/api/motor/daily", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.plan) setPlan(data.plan as DailyPlan);
        else setHidden(true);
      })
      .catch(() => setHidden(true))
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  if (hidden || !plan) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8">
      <article className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              Motor Python — aula do dia
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Plano de hoje ({plan.total_minutes} min)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Atualiza automaticamente quando você estuda no app.
            </p>
          </div>
          <span className="text-2xl">🤖</span>
        </div>

        <ol className="mt-4 space-y-3">
          {plan.tasks.map((task, index) => (
            <li key={`${task.title}-${index}`} className="rounded-xl bg-white/80 border border-violet-100 px-4 py-3">
              <p className="font-medium text-slate-900">
                {index + 1}. {task.title}{" "}
                <span className="text-violet-600 text-sm">({task.minutes} min)</span>
              </p>
              <p className="text-sm text-slate-600 mt-1">{task.detail}</p>
            </li>
          ))}
        </ol>

        {plan.flashcards.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {plan.flashcards.slice(0, 6).map((card) => (
              <span
                key={card.english}
                className="rounded-full bg-white border border-slate-200 px-3 py-1 text-sm text-slate-700"
              >
                {card.emoji} {card.english}
              </span>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
