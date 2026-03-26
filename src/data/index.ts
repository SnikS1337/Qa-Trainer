// Lazy loading для данных уроков
import { Lesson } from '../types';

// Экспортируем функцию для ленивой загрузки уроков
export const loadLessons = async (): Promise<Lesson[]> => {
  const [part1, part2, part3, part4] = await Promise.all([
    import('./lessons_part_1'),
    import('./lessons_part_2'),
    import('./lessons_part_3'),
    import('./lessons_part_4'),
  ]);

  return [
    ...part1.LESSONS_PART_1,
    ...part2.LESSONS_PART_2,
    ...part3.LESSONS_PART_3,
    ...part4.LESSONS_PART_4,
  ];
};

// Для обратной совместимости - синхронный импорт (будет использоваться как fallback)
export { LESSONS_PART_1 } from './lessons_part_1';
export { LESSONS_PART_2 } from './lessons_part_2';
export { LESSONS_PART_3 } from './lessons_part_3';
export { LESSONS_PART_4 } from './lessons_part_4';
