import type { AppState } from '../types';
import { normalizeStoredDateKey } from './dates';

function asNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export function hydrateAppState(raw: unknown, baseState: AppState): AppState {
  if (!raw || typeof raw !== 'object') {
    return baseState;
  }

  const candidate = raw as Partial<Record<keyof AppState, unknown>>;

  return {
    ...baseState,
    totalXP: asNumber(candidate.totalXP, baseState.totalXP),
    completedLessons: asStringArray(candidate.completedLessons, baseState.completedLessons),
    streak: asNumber(candidate.streak, baseState.streak),
    maxStreak: asNumber(candidate.maxStreak, baseState.maxStreak),
    perfectLessons: asNumber(candidate.perfectLessons, baseState.perfectLessons),
    retries: asNumber(candidate.retries, baseState.retries),
    bestStreak: asNumber(candidate.bestStreak, baseState.bestStreak),
    unlockedAchievements: asStringArray(
      candidate.unlockedAchievements,
      baseState.unlockedAchievements
    ),
    lastQuoteIndex: asNumber(candidate.lastQuoteIndex, baseState.lastQuoteIndex),
    dailyQuoteDate: normalizeStoredDateKey(asString(candidate.dailyQuoteDate, '')),
    examBestScore: asNumber(candidate.examBestScore, baseState.examBestScore),
    examAttempts: asNumber(candidate.examAttempts, baseState.examAttempts),
    dailyStreak: asNumber(candidate.dailyStreak, baseState.dailyStreak),
    lastDailyDate: normalizeStoredDateKey(asString(candidate.lastDailyDate, '')),
    totalQuestionsAnswered: asNumber(
      candidate.totalQuestionsAnswered,
      baseState.totalQuestionsAnswered
    ),
    totalCorrect: asNumber(candidate.totalCorrect, baseState.totalCorrect),
    completedPractice: asStringArray(candidate.completedPractice, baseState.completedPractice),
    certName: asString(candidate.certName, baseState.certName),
    lastActiveDate: normalizeStoredDateKey(asString(candidate.lastActiveDate, '')),
    lastLaunchDate: normalizeStoredDateKey(asString(candidate.lastLaunchDate, '')),
    lastLessonRewardDate: normalizeStoredDateKey(asString(candidate.lastLessonRewardDate, '')),
    weeklyCheckpointWeek: asString(candidate.weeklyCheckpointWeek, baseState.weeklyCheckpointWeek),
    weeklyCheckpointCategories: asStringArray(
      candidate.weeklyCheckpointCategories,
      baseState.weeklyCheckpointCategories
    ),
    weeklyCheckpointCompletions: asNumber(
      candidate.weeklyCheckpointCompletions,
      baseState.weeklyCheckpointCompletions
    ),
    isCheater: asBoolean(candidate.isCheater, baseState.isCheater ?? false),
    examPassed: asBoolean(candidate.examPassed, baseState.examPassed ?? false),
  };
}
