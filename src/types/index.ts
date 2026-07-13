export type Pronoun = "I" | "You" | "We" | "They" | "He" | "She" | "It";

export type Tense = "present" | "past";

export interface Word {
  id: string;
  english: string;
  portuguese: string;
  emoji: string;
  imageHint: string;
  example?: string;
}

export interface Sentence {
  id: string;
  english: string;
  portuguese: string;
  pronoun: Pronoun;
  tense: Tense;
  situation: string;
}

export interface RealLifeSituation {
  id: string;
  title: string;
  description: string;
  emoji: string;
  dialogue: { speaker: string; text: string; translation: string }[];
}

export interface ReviewDay {
  day: number;
  label: string;
  activities: string[];
}

export interface MasteryQuestion {
  id: string;
  type: "match" | "complete" | "translate";
  prompt: string;
  options: string[];
  correctIndex: number;
  wordId?: string;
}

export interface Block {
  id: string;
  number: number;
  title: string;
  titleEn: string;
  theme: string;
  description: string;
  descriptionEn?: string;
  emoji: string;
  tense: Tense;
  pronouns: Pronoun[];
  words: Word[];
  verb: Word & { conjugations: Partial<Record<Pronoun, string>> };
  connector: Word;
  sentences: Sentence[];
  situations: RealLifeSituation[];
  reviewPlan: ReviewDay[];
  masteryQuiz: MasteryQuestion[];
  masteryThreshold: number;
}

export interface BlockProgress {
  blockId: string;
  status: "locked" | "available" | "in_progress" | "review" | "mastered";
  currentStep: number;
  masteryScore?: number;
  startedAt?: string;
  masteredAt?: string;
  reviewDates: Record<number, boolean>;
}

export interface UserProgress {
  currentBlockId: string;
  blocks: Record<string, BlockProgress>;
  lastVisit: string;
}

export type LessonStep =
  | "intro"
  | "words"
  | "verb"
  | "connector"
  | "sentences"
  | "situations"
  | "speaking"
  | "review-plan"
  | "mastery";
