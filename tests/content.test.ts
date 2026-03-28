import assert from 'node:assert/strict';
import { ACHIEVEMENTS } from '../src/data/achievements';
import { LESSON_META } from '../src/data/lesson_meta';
import { LESSONS } from '../src/data/lessons';
import { PRACTICE_TASK_META } from '../src/data/practice_task_meta';
import { PRACTICE_TASKS } from '../src/data/practice_tasks';
import { FOUNDATION_LESSON_IDS } from '../src/domain/course';
import { createAppState } from './test-helpers';

function expectUnique(ids: string[], label: string) {
  assert.equal(new Set(ids).size, ids.length, `${label} should contain unique ids`);
}

export const tests = [
  {
    name: 'lesson metadata matches lesson content',
    run: () => {
      const metaIds = LESSON_META.map((lesson) => lesson.id);
      const lessonIds = LESSONS.map((lesson) => lesson.id);

      expectUnique(metaIds, 'Lesson meta ids');
      expectUnique(lessonIds, 'Lesson ids');
      assert.deepEqual([...metaIds].sort(), [...lessonIds].sort());

      for (const meta of LESSON_META) {
        const lesson = LESSONS.find((entry) => entry.id === meta.id);
        assert.ok(lesson, `Missing lesson data for ${meta.id}`);
        assert.equal(
          lesson.questions.length,
          meta.questionCount,
          `Question count mismatch for ${meta.id}`
        );
      }
    },
  },
  {
    name: 'practice metadata matches practice content',
    run: () => {
      const metaIds = PRACTICE_TASK_META.map((task) => task.id);
      const taskIds = PRACTICE_TASKS.map((task) => task.id);

      expectUnique(metaIds, 'Practice meta ids');
      expectUnique(taskIds, 'Practice ids');
      assert.deepEqual([...metaIds].sort(), [...taskIds].sort());
    },
  },
  {
    name: 'each lesson has at least ten questions',
    run: () => {
      for (const lesson of LESSONS) {
        assert.ok(
          lesson.questions.length >= 10,
          `Lesson ${lesson.id} should have at least 10 questions`
        );
      }
    },
  },
  {
    name: 'foundation achievement uses the actual foundation lesson set',
    run: () => {
      const allAchievement = ACHIEVEMENTS.find((achievement) => achievement.id === 'all');

      assert.ok(allAchievement);
      assert.equal(allAchievement.check(createAppState()), false);
      assert.equal(
        allAchievement.check(
          createAppState({
            completedLessons: [...FOUNDATION_LESSON_IDS],
          })
        ),
        true
      );
    },
  },
];
