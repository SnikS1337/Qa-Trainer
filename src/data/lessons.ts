import type { Lesson } from '../types';
import { LESSON_EXPANSIONS } from './lesson_expansions';
import { LESSON_EXPANSIONS_BONUS } from './lesson_expansions_bonus';
import { LESSON_EXPANSIONS_BONUS_2 } from './lesson_expansions_bonus_2';
import { LESSONS_PART_1 } from './lessons_part_1';
import { LESSONS_PART_2 } from './lessons_part_2';
import { LESSONS_PART_3 } from './lessons_part_3';
import { LESSONS_PART_4 } from './lessons_part_4';

const BASE_LESSONS: Lesson[] = [
  ...LESSONS_PART_1,
  ...LESSONS_PART_2,
  ...LESSONS_PART_3,
  ...LESSONS_PART_4,
];

export const LESSONS: Lesson[] = BASE_LESSONS.map((lesson) => ({
  ...lesson,
  questions: [
    ...lesson.questions,
    ...(LESSON_EXPANSIONS[lesson.id] ?? []),
    ...(LESSON_EXPANSIONS_BONUS[lesson.id] ?? []),
    ...(LESSON_EXPANSIONS_BONUS_2[lesson.id] ?? []),
  ],
}));
