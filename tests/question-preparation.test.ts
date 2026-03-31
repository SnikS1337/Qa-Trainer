import assert from 'node:assert/strict';
import { LESSONS } from '../src/data/lessons';
import {
  buildLessonSessionQuestions,
  getLessonSessionQuestionCount,
  LESSON_SESSION_QUESTION_LIMIT,
} from '../src/domain/lesson_session';
import type { QuestionChoice } from '../src/types';
import { prepareQuestionsWithShuffledChoices, shuffle } from '../src/utils';

function createChoiceQuestions(count: number): QuestionChoice[] {
  return Array.from({ length: count }, (_, index) => ({
    type: 'choice' as const,
    q: `Question ${index + 1}`,
    opts: ['Option A', 'Option B', 'Option C', 'Option D'],
    ans: 1,
    exp: 'Explanation',
  }));
}

function getCorrectIndexCounts(questions: QuestionChoice[]) {
  const counts = [0, 0, 0, 0];

  for (const question of questions) {
    counts[question.ans] += 1;
  }

  return counts;
}

const ALL_CHOICE_QUESTIONS = LESSONS.flatMap((lesson) =>
  lesson.questions.filter((question): question is QuestionChoice => question.type === 'choice')
);

export const tests = [
  {
    name: 'lesson sessions use at most ten random questions per run',
    run: () => {
      assert.equal(getLessonSessionQuestionCount(6), 6);
      assert.equal(getLessonSessionQuestionCount(15), LESSON_SESSION_QUESTION_LIMIT);

      const longSession = buildLessonSessionQuestions(createChoiceQuestions(15));
      const shortSession = buildLessonSessionQuestions(createChoiceQuestions(8));

      assert.equal(longSession.length, LESSON_SESSION_QUESTION_LIMIT);
      assert.equal(shortSession.length, 8);
    },
  },
  {
    name: 'prepared lesson-sized sets never let one fixed slot reach lesson pass threshold',
    run: () => {
      for (const size of [4, 5, 6, 7, 8, 9, 10, 12, 15]) {
        for (let run = 0; run < 120; run += 1) {
          const prepared = prepareQuestionsWithShuffledChoices(createChoiceQuestions(size));
          const counts = getCorrectIndexCounts(prepared);
          const requiredToPass = Math.ceil(size * 0.6);

          assert.ok(
            Math.max(...counts) < requiredToPass,
            `A fixed slot can still pass a ${size}-question lesson: ${counts.join(', ')}`
          );
        }
      }
    },
  },
  {
    name: 'prepared five-question sets never allow one slot to pass on its own',
    run: () => {
      for (let run = 0; run < 200; run += 1) {
        const prepared = prepareQuestionsWithShuffledChoices(createChoiceQuestions(5));
        const counts = getCorrectIndexCounts(prepared);

        assert.ok(
          Math.max(...counts) <= 2,
          `One fixed slot can still dominate a 5-question set: ${counts.join(', ')}`
        );
      }
    },
  },
  {
    name: 'prepared twenty-question sets distribute correct slots evenly',
    run: () => {
      const prepared = prepareQuestionsWithShuffledChoices(createChoiceQuestions(20));
      const counts = getCorrectIndexCounts(prepared);

      assert.deepEqual(counts, [5, 5, 5, 5]);
    },
  },
  {
    name: 'real daily samples never let one fixed slot reach pass threshold',
    run: () => {
      for (let run = 0; run < 300; run += 1) {
        const prepared = prepareQuestionsWithShuffledChoices(shuffle(ALL_CHOICE_QUESTIONS).slice(0, 5));
        const counts = getCorrectIndexCounts(prepared);

        assert.ok(
          Math.max(...counts) <= 2,
          `Real daily sample still allows fixed-slot passing: ${counts.join(', ')}`
        );
      }
    },
  },
];
