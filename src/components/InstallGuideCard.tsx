"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function InstallGuideCard() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 pb-8">
      <article className="glass-panel rounded-2xl p-6 border-teal-400/30">
        <div className="flex items-start gap-4">
          <span className="text-4xl">📱</span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
              {mobile ? "Você está no celular — instale o app" : "App no celular (PWA)"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-100">
              Adicionar à tela inicial
            </h2>

            {mobile ? (
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div className="rounded-xl glass-panel border-teal-400/20 p-3">
                  <p className="font-semibold text-slate-100">🍎 iPhone (Safari)</p>
                  <p className="mt-1">
                    Compartilhar ↑ → <strong>Adicionar à Tela de Início</strong> → Adicionar
                  </p>
                </div>
                <div className="rounded-xl glass-panel border-teal-400/20 p-3">
                  <p className="font-semibold text-slate-100">🤖 Android (Chrome)</p>
                  <p className="mt-1">
                    Menu ⋮ → <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                Abra{" "}
                <Link href="https://english-real-life.vercel.app" className="text-teal-300 underline">
                  english-real-life.vercel.app
                </Link>{" "}
                no celular para instalar.
              </p>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
