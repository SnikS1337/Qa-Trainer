import type { Achievement, AppState, PracticeTask } from '../types';
import { unlockAchievements } from './achievements';
import { getPreviousDateKey } from './dates';

function cloneState(state: AppState): AppState {
  return {
    ...state,
    completedLessons: [...state.completedLessons],
    unlockedAchievements: [...state.unlockedAchievements],
    completedPractice: [...state.completedPractice],
  };
}

export function getPracticeCriteriaCount(task: PracticeTask) {
  switch (task.type) {
    case 'triage':
      return task.bugs.length;
    case 'find_error':
      return task.fields.filter((field) => field.hasError).length;
    case 'write_test':
    case 'bug_report':
      return task.checkItems.length;
  }
}

export function finalizeLessonResult(
  state: AppState,
  {
    lessonId,
    lessonXP,
    correctAnswers,
    totalQuestions,
    heartsLeft,
  }: {
    lessonId: string;
    lessonXP: number;
    correctAnswers: number;
    totalQuestions: number;
    heartsLeft: number;
  }
) {
  const nextState = cloneState(state);
  const passed = Math.round((correctAnswers / totalQuestions) * 100) >= 60 && heartsLeft > 0;
  const perfect = correctAnswers === totalQuestions && heartsLeft === 3;
  const alreadyCompleted = nextState.completedLessons.includes(lessonId);
  const awardedXP =
    passed && !alreadyCompleted ? (perfect ? Math.round(lessonXP * 1.5) : lessonXP) : 0;

  if (!alreadyCompleted) {
    nextState.totalXP += awardedXP;
    nextState.streak = passed ? nextState.streak + 1 : 0;
    if (nextState.streak > nextState.maxStreak) {
      nextState.maxStreak = nextState.streak;
    }

    if (passed) {
      nextState.completedLessons.push(lessonId);
    } else {
      nextState.retries += 1;
    }
  }

  if (perfect) {
    nextState.perfectLessons = Math.max(nextState.perfectLessons, 1);
  }

  const achievementResult = unlockAchievements(nextState);

  return {
    alreadyCompleted,
    awardedXP,
    passed,
    perfect,
    nextState: achievementResult.nextState,
    unlockedAchievements: achievementResult.unlocked,
  };
}

export function finalizePracticeTaskResult(
  state: AppState,
  {
    taskId,
    taskXP,
    passed,
  }: {
    taskId: string;
    taskXP: number;
    passed: boolean;
  }
) {
  const nextState = cloneState(state);
  const alreadyCompleted = nextState.completedPractice.includes(taskId);
  const awardedXP = passed && !alreadyCompleted ? taskXP : 0;

  if (awardedXP > 0) {
    nextState.totalXP += awardedXP;
  }

  if (passed && !alreadyCompleted) {
    nextState.completedPractice.push(taskId);
  }

  const achievementResult = unlockAchievements(nextState);

  return {
    alreadyCompleted,
    awardedXP,
    passed,
    nextState: achievementResult.nextState,
    unlockedAchievements: achievementResult.unlocked,
  };
}

export function finalizeExamResult(
  state: AppState,
  {
    score,
    maxScore = 20,
    passingScore = 16,
    rewardXP = 500,
  }: {
    score: number;
    maxScore?: number;
    passingScore?: number;
    rewardXP?: number;
  }
) {
  const nextState = cloneState(state);
  const passed = score >= passingScore;
  const awardedXP = passed && !nextState.examPassed ? rewardXP : 0;

  nextState.examAttempts += 1;
  nextState.examBestScore = Math.max(nextState.examBestScore, Math.round((score / maxScore) * 100));

  if (passed && !nextState.examPassed) {
    nextState.totalXP += rewardXP;
    nextState.examPassed = true;
  }

  const achievementResult = unlockAchievements(nextState);

  return {
    awardedXP,
    passed,
    nextState: achievementResult.nextState,
    unlockedAchievements: achievementResult.unlocked,
  };
}

export function finalizeDailyQuizResult(
  state: AppState,
  {
    todayKey,
    rewardXP,
  }: {
    todayKey: string;
    rewardXP: number;
  }
) {
  const nextState = cloneState(state);
  const previousDailyDate = nextState.lastDailyDate || nextState.lastActiveDate;
  const yesterdayKey = getPreviousDateKey(todayKey);

  nextState.totalXP += rewardXP;
  nextState.lastDailyDate = todayKey;

  if (previousDailyDate && yesterdayKey && previousDailyDate === yesterdayKey) {
    nextState.dailyStreak += 1;
  } else if (previousDailyDate !== todayKey) {
    nextState.dailyStreak = 1;
  } else if (nextState.dailyStreak === 0) {
    nextState.dailyStreak = 1;
  }

  nextState.lastActiveDate = todayKey;

  const achievementResult = unlockAchievements(nextState);

  return {
    awardedXP: rewardXP,
    nextState: achievementResult.nextState,
    unlockedAchievements: achievementResult.unlocked,
  };
}

export function getAchievementUnlockTitles(achievements: Achievement[]) {
  return achievements.map((achievement) => achievement.title);
}
