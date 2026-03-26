export interface QuestionChoice {
  type: 'choice';
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface QuestionSort {
  type: 'sort';
  q: string;
  items: string[];
  correct: string[];
  exp: string;
}

export type Question = QuestionChoice | QuestionSort;

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: string;
  xp: number;
  desc: string;
  questions: Question[];
}

export interface Quote {
  text: string;
  author: string;
  book: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (s: AppState) => boolean;
}

export interface AppState {
  totalXP: number;
  completedLessons: string[];
  streak: number;
  maxStreak: number;
  perfectLessons: number;
  retries: number;
  bestStreak: number;
  unlockedAchievements: string[];
  lastQuoteIndex: number;
  dailyQuoteDate: string;
  examBestScore: number;
  examAttempts: number;
  dailyStreak: number;
  lastDailyDate: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  completedPractice: string[];
  certName: string;
  lastActiveDate: string;
  lessonFailCount: Record<string, number>;
  isCheater?: boolean;
  examPassed?: boolean;
}
