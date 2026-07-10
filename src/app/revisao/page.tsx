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
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 mb-6"
        >
          ← Voltar ao início
        </Link>
        <QuickReviewFlow />
      </main>
    </>
  );
}
