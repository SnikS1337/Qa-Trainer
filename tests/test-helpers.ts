import type { AppState } from '../src/types';

export function createAppState(overrides: Partial<AppState> = {}): AppState {
  const nextState: AppState = {
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
    lastLaunchDate: '',
    lastLessonRewardDate: '',
    weeklyCheckpointWeek: '',
    weeklyCheckpointCategories: [],
    weeklyCheckpointCompletions: 0,
    isCheater: false,
    examPassed: false,
    ...overrides,
  };

  nextState.completedLessons = [...(overrides.completedLessons ?? nextState.completedLessons)];
  nextState.unlockedAchievements = [
    ...(overrides.unlockedAchievements ?? nextState.unlockedAchievements),
  ];
  nextState.completedPractice = [...(overrides.completedPractice ?? nextState.completedPractice)];
  nextState.weeklyCheckpointCategories = [
    ...(overrides.weeklyCheckpointCategories ?? nextState.weeklyCheckpointCategories),
  ];

  return nextState;
}
