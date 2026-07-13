"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { PLAN_FEATURES } from "@/lib/plans";

const MONTHLY_LABEL =
  process.env.NEXT_PUBLIC_PRICE_MONTHLY_LABEL ?? "R$ 29,90/mês";
const YEARLY_LABEL =
  process.env.NEXT_PUBLIC_PRICE_YEARLY_LABEL ?? "R$ 249,90/ano";

export default function PrecosPage() {
  const { user, plan, supabaseEnabled } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "yearly" | null>(
    null
  );
  const [message, setMessage] = useState("");

  async function startCheckout(interval: "monthly" | "yearly") {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    setLoadingPlan(interval);
    setMessage("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    setLoadingPlan(null);

    if (data.ok && data.url) {
      window.location.href = data.url;
      return;
    }

    if (data.reason === "payments-not-configured") {
      setMessage(
        "Pagamentos ainda não configurados. Siga o guia COMECAR-STRIPE.txt no projeto."
      );
      return;
    }

    setMessage("Não foi possível abrir o checkout. Tente de novo em instantes.");
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/" className="text-sm text-slate-400 hover:text-teal-300">
          ← Voltar
        </Link>

        <div className="mt-6 text-center max-w-2xl mx-auto">
          <p className="text-sm font-medium text-teal-300 tracking-wide">
            ✦ Invista no seu inglês
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-100 text-glow">
            Planos English by Real Life
          </h1>
          <p className="mt-3 text-slate-400">
            Comece grátis com 3 blocos. Premium libera os 24 blocos, todas as
            fases e progresso na nuvem.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <article className="glass-panel rounded-2xl p-6 border-white/10">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Gratuito
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-100">R$ 0</p>
            <p className="text-sm text-slate-500">para sempre</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              {PLAN_FEATURES.free.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            <Link
              href={user ? "/" : "/auth"}
              className="mt-8 block w-full rounded-xl glass-panel px-4 py-3 text-center text-sm font-semibold text-slate-200 hover:border-teal-400/30"
            >
              {user ? "Continuar no gratuito" : "Criar conta grátis"}
            </Link>
          </article>

          <article className="glass-panel rounded-2xl p-6 border-violet-400/35 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-teal-500/10 pointer-events-none" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase text-violet-300">
                Premium
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-100">
                {MONTHLY_LABEL}
              </p>
              <p className="text-sm text-slate-400">
                ou {YEARLY_LABEL} (economize no anual)
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-300">
                {PLAN_FEATURES.premium.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>

              {plan === "premium" ? (
                <Link
                  href="/conta"
                  className="mt-8 block w-full rounded-xl btn-cosmic px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Você já é Premium →
                </Link>
              ) : (
                <div className="mt-8 space-y-3">
                  <button
                    type="button"
                    disabled={!supabaseEnabled || loadingPlan !== null}
                    onClick={() => startCheckout("monthly")}
                    className="w-full rounded-xl btn-cosmic px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {loadingPlan === "monthly"
                      ? "Abrindo checkout..."
                      : "Assinar mensal →"}
                  </button>
                  <button
                    type="button"
                    disabled={!supabaseEnabled || loadingPlan !== null}
                    onClick={() => startCheckout("yearly")}
                    className="w-full rounded-xl glass-panel border-violet-400/30 px-4 py-3 text-sm font-semibold text-violet-200 hover:border-violet-400/50 disabled:opacity-50"
                  >
                    {loadingPlan === "yearly"
                      ? "Abrindo checkout..."
                      : "Assinar anual →"}
                  </button>
                </div>
              )}
            </div>
          </article>
        </div>

        {message && (
          <p className="mt-6 text-center text-sm alert-cosmic rounded-xl px-4 py-3 max-w-xl mx-auto">
            {message}
          </p>
        )}

        <section className="mt-12 glass-panel rounded-2xl p-6 text-sm text-slate-400">
          <h2 className="font-semibold text-slate-200 mb-3">Como funciona</h2>
          <ol className="space-y-2 list-decimal pl-5">
            <li>Crie sua conta em /auth</li>
            <li>Escolha mensal ou anual — pagamento seguro via Stripe</li>
            <li>Premium libera na hora após confirmação</li>
            <li>Cancele quando quiser em Minha conta → Gerenciar assinatura</li>
          </ol>
          <p className="mt-4 text-xs text-slate-500">
            Cartão, Pix (se habilitado na Stripe Brasil) e outros métodos conforme
            sua conta Stripe.
          </p>
        </section>
      </main>
    </>
  );
}
