"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/plans";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <p className="text-slate-400">
            Login na nuvem ainda não configurado neste ambiente.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            O app funciona normalmente no modo local com todos os blocos.
          </p>
          <Link href="/" className="mt-6 inline-block text-teal-300">
            ← Voltar ao início
          </Link>
        </main>
      </>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Conta criada! Verifique seu e-mail ou faça login.");
      setMode("login");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/conta";
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12">
        <Link href="/" className="text-sm text-slate-400 hover:text-teal-300 transition-colors">
          ← Voltar
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-slate-100">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Salve seu progresso na nuvem e estude em qualquer dispositivo.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl input-cosmic px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl input-cosmic px-4 py-3 text-sm"
            />
          </div>

          {message && (
            <p className="text-sm alert-cosmic rounded-xl px-4 py-3">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl btn-cosmic px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm text-teal-300 hover:underline"
        >
          {mode === "login"
            ? "Não tem conta? Criar agora"
            : "Já tem conta? Entrar"}
        </button>

        <div className="mt-8 glass-panel rounded-xl p-4 text-sm text-slate-400">
          <p className="font-medium text-slate-200">Planos</p>
          <p className="mt-1">
            <strong className="text-slate-300">Gratuito:</strong> blocos 1–3 + nuvem
          </p>
          <p>
            <strong className="text-slate-300">Premium:</strong> todos os 24 blocos
          </p>
        </div>
      </main>
    </>
  );
}
