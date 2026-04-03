import assert from 'node:assert/strict';
import { hydrateAppState } from '../src/domain/persistence';
import { createAppState } from './test-helpers';

export const tests = [
  {
    name: 'hydrateAppState returns base state for non-object input',
    run: () => {
      const base = createAppState({ totalXP: 42 });

      const hydrated = hydrateAppState(null, base);

      assert.equal(hydrated, base);
    },
  },
  {
    name: 'hydrateAppState normalizes dates and sanitizes arrays',
    run: () => {
      const base = createAppState();
      const raw = {
        completedLessons: ['intro', 123, null, 'pyramid'],
        unlockedAchievements: ['a1', false, 'a2'],
        completedPractice: ['task-1', {}, 'task-2'],
        dailyQuoteDate: new Date(2026, 2, 28).toDateString(),
        lastDailyDate: 'bad-value',
        weeklyCheckpointCategories: ['Основы', 22, 'Карьера'],
      };

      const hydrated = hydrateAppState(raw, base);

      assert.deepEqual(hydrated.completedLessons, ['intro', 'pyramid']);
      assert.deepEqual(hydrated.unlockedAchievements, ['a1', 'a2']);
      assert.deepEqual(hydrated.completedPractice, ['task-1', 'task-2']);
      assert.equal(hydrated.dailyQuoteDate, '2026-03-28');
      assert.equal(hydrated.lastDailyDate, '');
      assert.deepEqual(hydrated.weeklyCheckpointCategories, ['Основы', 'Карьера']);
    },
  },
  {
    name: 'hydrateAppState falls back for invalid scalar values',
    run: () => {
      const base = createAppState({
        totalXP: 10,
        dailyStreak: 3,
        certName: 'QA User',
        isCheater: false,
        examPassed: false,
      });

      const raw = {
        totalXP: '100',
        dailyStreak: NaN,
        certName: 17,
        isCheater: 'yes',
        examPassed: 1,
      };

      const hydrated = hydrateAppState(raw, base);

      assert.equal(hydrated.totalXP, 10);
      assert.equal(hydrated.dailyStreak, 3);
      assert.equal(hydrated.certName, 'QA User');
      assert.equal(hydrated.isCheater, false);
      assert.equal(hydrated.examPassed, false);
    },
  },
];
