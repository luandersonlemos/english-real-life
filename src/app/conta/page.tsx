import { Suspense } from "react";
import ContaContent from "./ContaContent";

export default function ContaPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-16 text-center text-slate-400">
          Carregando...
        </main>
      }
    >
      <ContaContent />
    </Suspense>
  );
}
