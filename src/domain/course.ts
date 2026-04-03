import { LESSON_META } from '../data/lesson_meta';

const FOUNDATION_CATEGORY = 'Основы';
const DESIGN_CATEGORY = 'Техники тест-дизайна';

export const FOUNDATION_LESSON_IDS = LESSON_META.filter(
  (lesson) => lesson.category === FOUNDATION_CATEGORY
).map((lesson) => lesson.id);

export const DESIGN_TECHNIQUES_LESSON_IDS = LESSON_META.filter(
  (lesson) => lesson.category === DESIGN_CATEGORY
).map((lesson) => lesson.id);

export const CAREER_LESSON_IDS = ['interview'] as const;
export const CERTIFICATE_REQUIRED_LESSON_IDS = [
  ...FOUNDATION_LESSON_IDS,
  ...DESIGN_TECHNIQUES_LESSON_IDS,
  ...CAREER_LESSON_IDS,
] as const;

type CertificateType = 'none' | 'career';

function hasAllLessons(completedLessons: string[], requiredLessonIds: readonly string[]) {
  return requiredLessonIds.every((lessonId) => completedLessons.includes(lessonId));
}

export function getCertificateProgress(completedLessons: string[]): {
  certType: CertificateType;
  foundationDone: boolean;
  designDone: boolean;
  careerDone: boolean;
  fullCourseDone: boolean;
  foundationCompletedCount: number;
  designCompletedCount: number;
  careerCompletedCount: number;
  totalCompletedCount: number;
  totalRequiredCount: number;
} {
  const foundationCompletedCount = FOUNDATION_LESSON_IDS.filter((lessonId) =>
    completedLessons.includes(lessonId)
  ).length;
  const designCompletedCount = DESIGN_TECHNIQUES_LESSON_IDS.filter((lessonId) =>
    completedLessons.includes(lessonId)
  ).length;
  const careerCompletedCount = CAREER_LESSON_IDS.filter((lessonId) =>
    completedLessons.includes(lessonId)
  ).length;
  const foundationDone = hasAllLessons(completedLessons, FOUNDATION_LESSON_IDS);
  const designDone =
    foundationDone && hasAllLessons(completedLessons, DESIGN_TECHNIQUES_LESSON_IDS);
  const careerDone = foundationDone && hasAllLessons(completedLessons, CAREER_LESSON_IDS);
  const fullCourseDone = foundationDone && designDone && careerDone;
  const totalRequiredCount = CERTIFICATE_REQUIRED_LESSON_IDS.length;
  const totalCompletedCount =
    foundationCompletedCount + designCompletedCount + careerCompletedCount;

  let certType: CertificateType = 'none';

  if (fullCourseDone) {
    certType = 'career';
  }

  return {
    certType,
    foundationDone,
    designDone,
    careerDone,
    fullCourseDone,
    foundationCompletedCount,
    designCompletedCount,
    careerCompletedCount,
    totalCompletedCount,
    totalRequiredCount,
  };
}
