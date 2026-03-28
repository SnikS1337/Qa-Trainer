import type { AppState } from '../src/types';

export function createAppState(overrides: Partial<AppState> = {}): AppState {
  return {
    totalXP: 0,
    completedLessons: [],
    streak: 0,
    maxStreak: 0,
    perfectLessons: 0,
    retries: 0,
    bestStreak: 0,
    unlockedAchievements: [],
    lastQuoteIndex: 0,
    dailyQuoteDate: '',
    examBestScore: 0,
    examAttempts: 0,
    dailyStreak: 0,
    lastDailyDate: '',
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    completedPractice: [],
    certName: '',
    lastActiveDate: '',
    isCheater: false,
    examPassed: false,
    ...overrides,
    completedLessons: [...(overrides.completedLessons ?? [])],
    unlockedAchievements: [...(overrides.unlockedAchievements ?? [])],
    completedPractice: [...(overrides.completedPractice ?? [])],
  };
}
