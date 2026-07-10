import type { UserProgress } from "@/types";

export const PROGRESS_SAVE_EVENT = "ebrl-progress-save";

export function emitProgressSave(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(PROGRESS_SAVE_EVENT, { detail: progress })
  );
}

export function mergeProgress(
  local: UserProgress,
  remote: UserProgress
): UserProgress {
  const merged = structuredClone(local);
  const remoteTime = new Date(remote.lastVisit).getTime();
  const localTime = new Date(local.lastVisit).getTime();

  if (remoteTime > localTime) {
    merged.currentBlockId = remote.currentBlockId;
    merged.lastVisit = remote.lastVisit;
  }

  for (const [blockId, remoteBlock] of Object.entries(remote.blocks)) {
    const localBlock = merged.blocks[blockId];
    if (!localBlock) {
      merged.blocks[blockId] = remoteBlock;
      continue;
    }

    const statusRank: Record<string, number> = {
      locked: 0,
      available: 1,
      in_progress: 2,
      review: 3,
      mastered: 4,
    };

    if (statusRank[remoteBlock.status] > statusRank[localBlock.status]) {
      merged.blocks[blockId] = remoteBlock;
    } else if (
      remoteBlock.status === localBlock.status &&
      (remoteBlock.masteryScore ?? 0) > (localBlock.masteryScore ?? 0)
    ) {
      merged.blocks[blockId] = remoteBlock;
    }
  }

  return merged;
}
