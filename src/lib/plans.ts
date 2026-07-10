export type PlanId = "free" | "premium";

export const FREE_BLOCK_LIMIT = 3;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isBlockInPlan(blockNumber: number, plan: PlanId): boolean {
  if (plan === "premium") return true;
  return blockNumber <= FREE_BLOCK_LIMIT;
}

export function getEffectivePlan(
  plan: PlanId | null,
  supabaseEnabled: boolean
): PlanId {
  if (!supabaseEnabled) return "premium";
  return plan ?? "free";
}

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Gratuito",
  premium: "Premium",
};

export const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: ["Blocos 1 a 3", "Progresso na nuvem", "Revisão rápida"],
  premium: [
    "Todos os 24 blocos",
    "Fases 1, 2 e 3 completas",
    "Progresso na nuvem",
    "Revisão rápida + PWA",
  ],
};
