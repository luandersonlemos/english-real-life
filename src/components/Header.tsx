"use client";

import Link from "next/link";

export function Header() {
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
        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600">
          <Link href="/" className="hover:text-teal-600 transition-colors">
            Início
          </Link>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700 text-xs font-medium">
            18 blocos completos
          </span>
        </nav>
      </div>
    </header>
  );
}
