import { useMemo } from 'react';
import { LESSON_META } from '../data/lesson_meta';
import type { LessonMeta } from '../types';

export type HomeLessonItem = {
  lesson: LessonMeta;
  done: boolean;
  locked: boolean;
};

export type HomeLessonCategory = {
  category: string;
  unlocked: boolean;
  doneCount: number;
  lessons: HomeLessonItem[];
};

export function createHomeLessonsModel(lessons: LessonMeta[], completedLessonIds: string[]) {
  const completedSet = new Set(completedLessonIds);
  const categories = Array.from(new Set(lessons.map((lesson) => lesson.category)));

  const lessonsByCategory = new Map<string, LessonMeta[]>();
  for (const category of categories) {
    lessonsByCategory.set(
      category,
      lessons.filter((lesson) => lesson.category === category)
    );
  }

  const categoryUnlocked = new Map<string, boolean>();
  categories.forEach((category, index) => {
    if (index === 0) {
      categoryUnlocked.set(category, true);
      return;
    }

    const previousCategory = categories[index - 1];
    const previousCategoryLessons = lessonsByCategory.get(previousCategory) ?? [];
    categoryUnlocked.set(
      category,
      previousCategoryLessons.every((lesson) => completedSet.has(lesson.id))
    );
  });

  return categories.map((category) => {
    const categoryLessons = lessonsByCategory.get(category) ?? [];
    const unlocked = categoryUnlocked.get(category) ?? false;

    const lessonItems = categoryLessons.map((lesson, lessonIndex) => {
      const done = completedSet.has(lesson.id);
      let locked = !unlocked;

      if (!locked && lessonIndex > 0) {
        locked = !completedSet.has(categoryLessons[lessonIndex - 1].id);
      }

      return {
        lesson,
        done,
        locked,
      };
    });

    const doneCount = lessonItems.reduce((acc, item) => acc + (item.done ? 1 : 0), 0);

    return {
      category,
      unlocked,
      doneCount,
      lessons: lessonItems,
    };
  });
}

export function useHomeLessonsModel(completedLessonIds: string[]) {
  return useMemo(
    () => createHomeLessonsModel(LESSON_META, completedLessonIds),
    [completedLessonIds]
  );
}
