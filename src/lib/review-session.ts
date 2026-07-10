import type { Word } from "@/types";

export interface ReviewCard {
  id: string;
  english: string;
  portuguese: string;
  emoji: string;
  example?: string;
  blockTitle: string;
}

export interface QuickReviewSession {
  cards: ReviewCard[];
  speakingPrompts: string[];
  blockCount: number;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildQuickReviewSession(
  blocks: Array<{
    id: string;
    title: string;
    status: string;
    words: Word[];
    sentences: { english: string }[];
  }>,
  maxCards = 15
): QuickReviewSession {
  const cards: ReviewCard[] = [];
  const speakingPrompts: string[] = [];

  const mastered = blocks.filter((b) => b.status === "mastered");
  const active = blocks.find((b) =>
    ["available", "in_progress", "review"].includes(b.status)
  );

  for (const block of mastered) {
    const sample = shuffle(block.words).slice(0, 2);
    for (const word of sample) {
      cards.push({
        id: `${block.id}-${word.id}`,
        english: word.english,
        portuguese: word.portuguese,
        emoji: word.emoji,
        example: word.example,
        blockTitle: block.title,
      });
    }
    const sentence = block.sentences[0];
    if (sentence) {
      speakingPrompts.push(`Diga em voz alta: ${sentence.english}`);
    }
  }

  if (active) {
    for (const word of active.words.slice(0, 8)) {
      cards.push({
        id: `${active.id}-${word.id}`,
        english: word.english,
        portuguese: word.portuguese,
        emoji: word.emoji,
        example: word.example,
        blockTitle: active.title,
      });
    }
    for (const sentence of active.sentences.slice(0, 3)) {
      speakingPrompts.push(`Repita: ${sentence.english}`);
    }
  }

  if (!cards.length && blocks[0]) {
    for (const word of blocks[0].words.slice(0, maxCards)) {
      cards.push({
        id: `fallback-${word.id}`,
        english: word.english,
        portuguese: word.portuguese,
        emoji: word.emoji,
        example: word.example,
        blockTitle: blocks[0].title,
      });
    }
  }

  return {
    cards: shuffle(cards).slice(0, maxCards),
    speakingPrompts: speakingPrompts.slice(0, 5),
    blockCount: mastered.length + (active ? 1 : 0),
  };
}
