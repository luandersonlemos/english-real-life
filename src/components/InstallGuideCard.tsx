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
      <article className="rounded-2xl border-2 border-teal-300 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <span className="text-4xl">📱</span>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
              {mobile ? "Você está no celular — instale o app" : "App no celular (PWA)"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Adicionar à tela inicial
            </h2>

            {mobile ? (
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <div className="rounded-xl bg-white border border-teal-100 p-3">
                  <p className="font-semibold text-slate-900">🍎 iPhone (Safari)</p>
                  <p className="mt-1">
                    Compartilhar ↑ → <strong>Adicionar à Tela de Início</strong> → Adicionar
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-teal-100 p-3">
                  <p className="font-semibold text-slate-900">🤖 Android (Chrome)</p>
                  <p className="mt-1">
                    Menu ⋮ → <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                Abra{" "}
                <Link href="https://english-real-life.vercel.app" className="text-teal-600 underline">
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
