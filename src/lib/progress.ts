import type { BlockProgress, UserProgress } from "@/types";
import { blocks } from "@/data/blocks";
import { scheduleMotorSync } from "@/lib/motor-sync";
import { emitProgressSave } from "@/lib/progress-cloud";
import { isBlockInPlan, type PlanId } from "@/lib/plans";

const STORAGE_KEY = "ebrl-progress";

function createInitialProgress(): UserProgress {
  const blockProgress: Record<string, BlockProgress> = {};

  blocks.forEach((block, index) => {
    blockProgress[block.id] = {
      blockId: block.id,
      status: index === 0 ? "available" : "locked",
      currentStep: 0,
      reviewDates: {},
    };
  });

  return {
    currentBlockId: blocks[0]?.id ?? "",
    blocks: blockProgress,
    lastVisit: new Date().toISOString(),
  };
}

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return createInitialProgress();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();

    const saved = JSON.parse(raw) as UserProgress;
    let changed = false;

    blocks.forEach((block, index) => {
      if (!saved.blocks[block.id]) {
        const prevBlock = blocks[index - 1];
        const prevMastered =
          prevBlock && saved.blocks[prevBlock.id]?.status === "mastered";

        saved.blocks[block.id] = {
          blockId: block.id,
          status: index === 0 || prevMastered ? "available" : "locked",
          currentStep: 0,
          reviewDates: {},
        };
        changed = true;
      }
    });

    if (changed) saveProgress(saved);
    else scheduleMotorSync(saved);
    return saved;
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  progress.lastVisit = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  scheduleMotorSync(progress);
  emitProgressSave(progress);
}

export function updateBlockProgress(
  blockId: string,
  updates: Partial<BlockProgress>
): UserProgress {
  const progress = loadProgress();
  const current = progress.blocks[blockId];
  if (!current) return progress;

  progress.blocks[blockId] = { ...current, ...updates };
  saveProgress(progress);
  return progress;
}

export function startBlock(blockId: string): UserProgress {
  return updateBlockProgress(blockId, {
    status: "in_progress",
    startedAt: new Date().toISOString(),
  });
}

export function completeLesson(blockId: string): UserProgress {
  return updateBlockProgress(blockId, { status: "review" });
}

export function masterBlock(blockId: string, score: number): UserProgress {
  const progress = loadProgress();
  const blockIndex = blocks.findIndex((b) => b.id === blockId);
  const nextBlock = blocks[blockIndex + 1];

  progress.blocks[blockId] = {
    ...progress.blocks[blockId],
    status: "mastered",
    masteryScore: score,
    masteredAt: new Date().toISOString(),
  };

  if (nextBlock) {
    progress.blocks[nextBlock.id] = {
      ...progress.blocks[nextBlock.id],
      status: "available",
    };
    progress.currentBlockId = nextBlock.id;
  }

  saveProgress(progress);
  return progress;
}

export function canAccessBlock(blockId: string, plan: PlanId = "premium"): boolean {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return false;
  if (!isBlockInPlan(block.number, plan)) return false;

  const progress = loadProgress();
  const blockProgress = progress.blocks[blockId];
  return blockProgress?.status !== "locked";
}

export function markReviewDay(blockId: string, day: number): UserProgress {
  const progress = loadProgress();
  const current = progress.blocks[blockId];
  if (!current) return progress;

  progress.blocks[blockId] = {
    ...current,
    reviewDates: { ...current.reviewDates, [day]: true },
  };
  saveProgress(progress);
  return progress;
}

export function exportProgressJson(): string {
  return JSON.stringify(loadProgress(), null, 2);
}

export function importProgressJson(raw: string): UserProgress {
  const parsed = JSON.parse(raw) as UserProgress;
  saveProgress(parsed);
  return parsed;
}
