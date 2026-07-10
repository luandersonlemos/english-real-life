import type { UserProgress } from "@/types";

let syncTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleMotorSync(progress: UserProgress): void {
  if (typeof window === "undefined") return;

  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    fetch("/api/motor/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(progress),
    }).catch(() => {
      // Motor local indisponível (ex.: deploy na Vercel) — ignora silenciosamente.
    });
  }, 400);
}
