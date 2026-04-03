import assert from 'node:assert/strict';
import { LESSON_META } from '../src/data/lesson_meta';
import { createHomeLessonsModel } from '../src/hooks/useHomeLessonsModel';

export const tests = [
  {
    name: 'home lessons model locks category until previous one is complete',
    run: () => {
      const model = createHomeLessonsModel(LESSON_META, []);

      assert.ok(model.length > 1);
      assert.equal(model[0].unlocked, true);
      assert.equal(model[1].unlocked, false);
    },
  },
  {
    name: 'home lessons model unlocks first lesson in category but keeps chain lock',
    run: () => {
      const foundations = LESSON_META.filter(
        (lesson) => lesson.category === LESSON_META[0].category
      );
      const completed = foundations.map((lesson) => lesson.id);

      const model = createHomeLessonsModel(LESSON_META, completed);
      const secondCategory = model[1];

      assert.equal(secondCategory.unlocked, true);
      assert.equal(secondCategory.lessons[0].locked, false);
      if (secondCategory.lessons.length > 1) {
        assert.equal(secondCategory.lessons[1].locked, true);
      }
    },
  },
  {
    name: 'home lessons model marks done lessons and done counters',
    run: () => {
      const firstCategory = LESSON_META[0].category;
      const firstCategoryLessons = LESSON_META.filter(
        (lesson) => lesson.category === firstCategory
      );
      const completedIds = firstCategoryLessons.slice(0, 2).map((lesson) => lesson.id);

      const model = createHomeLessonsModel(LESSON_META, completedIds);
      const firstModel = model[0];

      assert.equal(firstModel.doneCount, completedIds.length);
      assert.equal(firstModel.lessons[0].done, true);
      if (firstModel.lessons.length > 1) {
        assert.equal(firstModel.lessons[1].done, true);
      }
    },
  },
];
