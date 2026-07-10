import { Header } from "@/components/Header";
import { QuickReviewFlow } from "@/components/QuickReviewFlow";
import Link from "next/link";

export default function RevisaoPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-teal-300 mb-6 transition-colors"
        >
          ← Voltar ao início
        </Link>
        <QuickReviewFlow />
      </main>
    </>
  );
}
