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
    <header className="glass-panel sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 via-violet-500 to-fuchsia-500 text-lg shadow-lg shadow-violet-500/30">
            🌍
          </span>
          <div>
            <p className="font-semibold text-slate-100 group-hover:text-teal-300 transition-colors">
              English by Real Life
            </p>
            <p className="text-xs text-slate-400">Aprenda falando, não decorando</p>
          </div>
        </Link>
        <nav className="hidden sm:flex items-center gap-3 text-sm text-slate-300">
          <Link href="/" className="hover:text-teal-300 transition-colors">
            Início
          </Link>
          <Link
            href="/revisao"
            className="rounded-lg bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-500/25 transition-colors"
          >
            Revisão 5 min
          </Link>
          {supabaseEnabled && (
            <Link
              href={user ? "/conta" : "/auth"}
              className="rounded-lg border border-violet-400/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 hover:bg-violet-500/20"
            >
              {user ? `Conta · ${PLAN_LABELS[plan]}` : "Entrar"}
            </Link>
          )}
          <button
            type="button"
            onClick={downloadProgress}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 hover:border-teal-400/40 hover:text-teal-300 transition-colors"
            title="Backup manual do progresso"
          >
            Backup
          </button>
        </nav>
      </div>
    </header>
  );
}
