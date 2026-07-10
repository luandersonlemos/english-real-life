"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/auth-context";
import { PLAN_FEATURES, PLAN_LABELS } from "@/lib/plans";

export default function ContaPage() {
  const { user, plan, loading, supabaseEnabled, signOut, refreshProfile } = useAuth();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  if (!supabaseEnabled) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-slate-600">Conta na nuvem não configurada.</p>
          <Link href="/" className="mt-6 inline-block text-teal-600">
            ← Voltar
          </Link>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center text-slate-500">
          Carregando...
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-slate-600">Faça login para ver sua conta.</p>
          <Link
            href="/auth"
            className="mt-6 inline-block rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Entrar →
          </Link>
        </main>
      </>
    );
  }

  async function redeemCode(event: React.FormEvent) {
    event.preventDefault();
    setRedeeming(true);
    setMessage("");

    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    setRedeeming(false);

    if (data.ok) {
      setMessage("Premium ativado! Todos os blocos liberados.");
      await refreshProfile();
      return;
    }

    setMessage("Código inválido. Tente novamente.");
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-lg px-4 py-10">
        <Link href="/" className="text-sm text-slate-500 hover:text-teal-600">
          ← Voltar
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">Minha conta</h1>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>

        <article className="mt-8 rounded-2xl border border-teal-200 bg-teal-50 p-6">
          <p className="text-xs font-semibold uppercase text-teal-700">Plano atual</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{PLAN_LABELS[plan]}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {PLAN_FEATURES[plan].map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </article>

        {plan === "free" && (
          <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <h2 className="font-semibold text-violet-900">Ativar Premium</h2>
            <p className="mt-1 text-sm text-violet-700">
              Desbloqueie os 24 blocos. No portfólio, use o código promocional de demonstração.
            </p>
            <form onSubmit={redeemCode} className="mt-4 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Código promocional"
                className="flex-1 rounded-xl border border-violet-200 px-4 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={redeeming}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                Ativar
              </button>
            </form>
            {message && <p className="mt-3 text-sm text-violet-800">{message}</p>}
          </section>
        )}

        <button
          type="button"
          onClick={() => signOut()}
          className="mt-8 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50"
        >
          Sair da conta
        </button>
      </main>
    </>
  );
}
