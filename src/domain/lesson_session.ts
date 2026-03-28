import type { Question } from '../types';
import { prepareQuestionsWithShuffledChoices, shuffle } from '../utils';

export const LESSON_SESSION_QUESTION_LIMIT = 10;

export function getLessonSessionQuestionCount(totalQuestions: number) {
  return Math.min(totalQuestions, LESSON_SESSION_QUESTION_LIMIT);
}

export function buildLessonSessionQuestions(questions: Question[]) {
  const questionCount = getLessonSessionQuestionCount(questions.length);
  return prepareQuestionsWithShuffledChoices(shuffle(questions).slice(0, questionCount));
}
