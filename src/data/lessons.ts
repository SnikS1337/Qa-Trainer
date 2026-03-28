import type { Lesson } from '../types';
import { LESSONS_PART_1 } from './lessons_part_1';
import { LESSONS_PART_2 } from './lessons_part_2';
import { LESSONS_PART_3 } from './lessons_part_3';
import { LESSONS_PART_4 } from './lessons_part_4';

export const LESSONS: Lesson[] = [
  ...LESSONS_PART_1,
  ...LESSONS_PART_2,
  ...LESSONS_PART_3,
  ...LESSONS_PART_4,
];
