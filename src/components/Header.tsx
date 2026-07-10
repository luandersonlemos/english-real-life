"use client";

import Link from "next/link";
import { exportProgressJson } from "@/lib/progress";
import { useAuth } from "@/contexts/auth-context";
import { PLAN_LABELS } from "@/lib/plans";

function downloadProgress() {
  const json = exportProgressJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "progress.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function Header() {
  const { user, plan, supabaseEnabled } = useAuth();

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-lg shadow-sm">
            🌍
          </span>
          <div>
            <p className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
              English by Real Life
            </p>
            <p className="text-xs text-slate-500">Aprenda falando, não decorando</p>
          </div>
        </Link>
        <nav className="hidden sm:flex items-center gap-3 text-sm text-slate-600">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Início
          </Link>
          <Link
            href="/revisao"
            className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Revisão 5 min
          </Link>
          {supabaseEnabled && (
            <Link
              href={user ? "/conta" : "/auth"}
              className="rounded-lg border border-teal-200 px-3 py-1.5 text-xs font-medium text-teal-700 hover:bg-teal-50"
            >
              {user ? `Conta · ${PLAN_LABELS[plan]}` : "Entrar"}
            </Link>
          )}
          <button
            type="button"
            onClick={downloadProgress}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:border-teal-300 hover:text-teal-700 transition-colors"
            title="Backup manual do progresso"
          >
            Backup
          </button>
        </nav>
      </div>
    </header>
  );
}
