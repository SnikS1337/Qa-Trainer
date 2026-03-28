import assert from 'node:assert/strict';
import {
  finalizeDailyQuizResult,
  finalizeExamResult,
  finalizeLessonResult,
  finalizePracticeTaskResult,
} from '../src/domain/progression';
import { createAppState } from './test-helpers';

export const tests = [
  {
    name: 'finalizeLessonResult awards first perfect pass and updates progress',
    run: () => {
      const result = finalizeLessonResult(createAppState(), {
        lessonId: 'pyramid',
        lessonXP: 20,
        correctAnswers: 6,
        totalQuestions: 6,
        heartsLeft: 3,
      });

      assert.equal(result.passed, true);
      assert.equal(result.perfect, true);
      assert.equal(result.awardedXP, 30);
      assert.equal(result.nextState.totalXP, 30);
      assert.deepEqual(result.nextState.completedLessons, ['pyramid']);
      assert.equal(result.nextState.streak, 1);
      assert.equal(result.nextState.maxStreak, 1);
      assert.equal(result.nextState.perfectLessons, 1);
    },
  },
  {
    name: 'finalizeLessonResult counts retries and resets streak on first failed attempt',
    run: () => {
      const result = finalizeLessonResult(createAppState({ streak: 2, maxStreak: 2 }), {
        lessonId: 'pyramid',
        lessonXP: 20,
        correctAnswers: 2,
        totalQuestions: 6,
        heartsLeft: 0,
      });

      assert.equal(result.passed, false);
      assert.equal(result.awardedXP, 0);
      assert.equal(result.nextState.retries, 1);
      assert.equal(result.nextState.streak, 0);
      assert.equal(result.nextState.maxStreak, 2);
      assert.deepEqual(result.nextState.completedLessons, []);
    },
  },
  {
    name: 'finalizeLessonResult does not re-award XP on replay',
    run: () => {
      const result = finalizeLessonResult(
        createAppState({
          totalXP: 30,
          streak: 3,
          maxStreak: 3,
          completedLessons: ['pyramid'],
        }),
        {
          lessonId: 'pyramid',
          lessonXP: 20,
          correctAnswers: 6,
          totalQuestions: 6,
          heartsLeft: 3,
        }
      );

      assert.equal(result.alreadyCompleted, true);
      assert.equal(result.awardedXP, 0);
      assert.equal(result.nextState.totalXP, 30);
      assert.deepEqual(result.nextState.completedLessons, ['pyramid']);
    },
  },
  {
    name: 'finalizePracticeTaskResult awards practice XP only once',
    run: () => {
      const firstPass = finalizePracticeTaskResult(createAppState(), {
        taskId: 'triage1',
        taskXP: 20,
        passed: true,
      });
      const replayPass = finalizePracticeTaskResult(firstPass.nextState, {
        taskId: 'triage1',
        taskXP: 20,
        passed: true,
      });

      assert.equal(firstPass.awardedXP, 20);
      assert.equal(firstPass.nextState.totalXP, 20);
      assert.deepEqual(firstPass.nextState.completedPractice, ['triage1']);
      assert.equal(replayPass.awardedXP, 0);
      assert.equal(replayPass.nextState.totalXP, 20);
    },
  },
  {
    name: 'finalizeExamResult awards only the first successful pass but keeps best score',
    run: () => {
      const firstPass = finalizeExamResult(createAppState(), { score: 16 });
      const replayPass = finalizeExamResult(firstPass.nextState, { score: 20 });

      assert.equal(firstPass.passed, true);
      assert.equal(firstPass.awardedXP, 500);
      assert.equal(firstPass.nextState.totalXP, 500);
      assert.equal(firstPass.nextState.examPassed, true);
      assert.equal(firstPass.nextState.examAttempts, 1);
      assert.equal(firstPass.nextState.examBestScore, 80);

      assert.equal(replayPass.awardedXP, 0);
      assert.equal(replayPass.nextState.totalXP, 500);
      assert.equal(replayPass.nextState.examAttempts, 2);
      assert.equal(replayPass.nextState.examBestScore, 100);
    },
  },
  {
    name: 'finalizeDailyQuizResult continues adjacent streaks and resets after gaps',
    run: () => {
      const continued = finalizeDailyQuizResult(
        createAppState({
          totalXP: 40,
          dailyStreak: 3,
          lastDailyDate: '2026-03-27',
          lastActiveDate: '2026-03-27',
        }),
        {
          todayKey: '2026-03-28',
          rewardXP: 15,
        }
      );

      const reset = finalizeDailyQuizResult(
        createAppState({
          totalXP: 40,
          dailyStreak: 3,
          lastDailyDate: '2026-03-25',
          lastActiveDate: '2026-03-25',
        }),
        {
          todayKey: '2026-03-28',
          rewardXP: 15,
        }
      );

      assert.equal(continued.awardedXP, 15);
      assert.equal(continued.nextState.totalXP, 55);
      assert.equal(continued.nextState.dailyStreak, 4);
      assert.equal(continued.nextState.lastDailyDate, '2026-03-28');

      assert.equal(reset.nextState.dailyStreak, 1);
      assert.equal(reset.nextState.lastActiveDate, '2026-03-28');
    },
  },
];
