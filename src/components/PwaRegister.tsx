"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "ebrl-install-dismissed";

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

async function clearBrokenServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((reg) => reg.unregister()));
  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    setMobile(isMobileDevice());
    setIos(isIos());
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    if ("serviceWorker" in navigator) {
      if (isDev) {
        void clearBrokenServiceWorkers();
      } else {
        navigator.serviceWorker.register("/sw.js?v=3").catch(() => {});
      }
    }

    const onInstallable = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onInstallable);
    window.addEventListener("appinstalled", onInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  if (installed || dismissed) return null;

  // iPhone nunca mostra botão automático — sempre mostrar instruções
  if (mobile && ios) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-teal-200 bg-white p-4 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">📱 Instalar no iPhone</p>
        <ol className="mt-2 text-xs text-slate-600 space-y-1 list-decimal pl-4">
          <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta)</li>
          <li>Role e toque em <strong>Adicionar à Tela de Início</strong></li>
          <li>Toque em <strong>Adicionar</strong></li>
        </ol>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Entendi
        </button>
      </div>
    );
  }

  // Android com prompt nativo
  if (installEvent) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-teal-200 bg-white p-4 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">Instalar English by Real Life</p>
        <p className="mt-1 text-xs text-slate-500">Ícone na tela inicial — como um app.</p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await installEvent.prompt();
              setInstallEvent(null);
            }}
            className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Instalar app
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600"
          >
            Depois
          </button>
        </div>
      </div>
    );
  }

  // Android sem prompt ainda — instruções manuais
  if (mobile) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-teal-200 bg-white p-4 shadow-lg">
        <p className="text-sm font-semibold text-slate-900">📱 Instalar no Android</p>
        <p className="mt-1 text-xs text-slate-600">
          Chrome → menu <strong>⋮</strong> → <strong>Instalar app</strong> ou{" "}
          <strong>Adicionar à tela inicial</strong>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-3 w-full rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Entendi
        </button>
      </div>
    );
  }

  return null;
}
