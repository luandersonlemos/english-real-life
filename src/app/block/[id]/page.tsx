"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { LessonProgress } from "@/components/LessonProgress";
import { LessonFlow } from "@/components/LessonFlow";
import { getBlock } from "@/data/blocks";
import {
  canAccessBlock,
  completeLesson,
  masterBlock,
  startBlock,
} from "@/lib/progress";
import { useAuth } from "@/contexts/auth-context";
import { isBlockInPlan } from "@/lib/plans";
import type { LessonStep } from "@/types";

export default function BlockPage() {
  const params = useParams();
  const router = useRouter();
  const blockId = params.id as string;
  const block = getBlock(blockId);
  const [step, setStep] = useState<LessonStep>("intro");
  const [accessDenied, setAccessDenied] = useState(false);
  const [premiumLocked, setPremiumLocked] = useState(false);
  const { plan } = useAuth();

  useEffect(() => {
    if (!block) return;
    if (!isBlockInPlan(block.number, plan)) {
      setPremiumLocked(true);
      return;
    }
    if (!canAccessBlock(blockId, plan)) {
      setAccessDenied(true);
      return;
    }
    startBlock(blockId);
  }, [block, blockId, plan]);

  if (!block) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-slate-500">Bloco não encontrado.</p>
          <Link href="/" className="mt-4 inline-block text-teal-600">
            ← Voltar ao início
          </Link>
        </main>
      </>
    );
  }

  if (premiumLocked) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <span className="text-5xl">⭐</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Bloco Premium</h1>
          <p className="mt-2 text-slate-500">
            O plano gratuito inclui os blocos 1 a 3. Ative o Premium para continuar.
          </p>
          <Link
            href="/conta"
            className="mt-6 inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Ver planos →
          </Link>
        </main>
      </>
    );
  }

  if (accessDenied) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <span className="text-5xl">🔒</span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Bloco bloqueado</h1>
          <p className="mt-2 text-slate-500">
            Complete o bloco anterior com 80% de domínio para desbloquear.
          </p>
          <Link href="/" className="mt-6 inline-block text-teal-600">
            ← Voltar ao início
          </Link>
        </main>
      </>
    );
  }

  const handleStepChange = (newStep: LessonStep) => {
    setStep(newStep);
    if (newStep === "review-plan") {
      completeLesson(blockId);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-6"
        >
          ← Voltar aos blocos
        </Link>

        <LessonProgress currentStep={step} block={block} />
        <LessonFlow
          block={block}
          initialStep={step}
          onStepChange={handleStepChange}
          onComplete={(score) => {
            masterBlock(blockId, score);
            router.push("/");
          }}
        />
      </main>
    </>
  );
}
