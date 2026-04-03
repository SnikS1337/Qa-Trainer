import assert from 'node:assert/strict';
import {
  loadChoiceQuestions,
  loadLessonById,
  loadLessonsContent,
  loadPracticeTaskById,
  loadPracticeTasksContent,
  preloadLessonsContent,
  preloadPracticeTasksContent,
} from '../src/data/content_loaders';
import { LESSON_META } from '../src/data/lesson_meta';
import { PRACTICE_TASK_META } from '../src/data/practice_task_meta';

export const tests = [
  {
    name: 'loadLessonsContent memoizes promise instance',
    run: async () => {
      const firstPromise = loadLessonsContent();
      const secondPromise = loadLessonsContent();

      assert.equal(firstPromise, secondPromise);

      const firstResult = await firstPromise;
      const secondResult = await secondPromise;

      assert.equal(firstResult, secondResult);
      assert.ok(firstResult.length > 0);
    },
  },
  {
    name: 'loadPracticeTasksContent memoizes promise instance',
    run: async () => {
      const firstPromise = loadPracticeTasksContent();
      const secondPromise = loadPracticeTasksContent();

      assert.equal(firstPromise, secondPromise);

      const firstResult = await firstPromise;
      const secondResult = await secondPromise;

      assert.equal(firstResult, secondResult);
      assert.ok(firstResult.length > 0);
    },
  },
  {
    name: 'loadChoiceQuestions returns only choice questions and caches result',
    run: async () => {
      const firstPromise = loadChoiceQuestions();
      const secondPromise = loadChoiceQuestions();

      assert.equal(firstPromise, secondPromise);

      const questions = await firstPromise;
      assert.ok(questions.length > 0);
      assert.ok(questions.every((question) => question.type === 'choice'));
    },
  },
  {
    name: 'loadLessonById resolves known lesson and returns null for unknown id',
    run: async () => {
      const knownId = LESSON_META[0]?.id;
      assert.ok(knownId);

      const lesson = await loadLessonById(knownId!);
      const missingLesson = await loadLessonById('__missing_lesson__');

      assert.equal(lesson?.id, knownId);
      assert.equal(missingLesson, null);
    },
  },
  {
    name: 'loadPracticeTaskById resolves known task and returns null for unknown id',
    run: async () => {
      const knownId = PRACTICE_TASK_META[0]?.id;
      assert.ok(knownId);

      const task = await loadPracticeTaskById(knownId!);
      const missingTask = await loadPracticeTaskById('__missing_task__');

      assert.equal(task?.id, knownId);
      assert.equal(missingTask, null);
    },
  },
  {
    name: 'preload helpers are safe and keep loaders operational',
    run: async () => {
      preloadLessonsContent();
      preloadPracticeTasksContent();

      const [lessons, practiceTasks, choices] = await Promise.all([
        loadLessonsContent(),
        loadPracticeTasksContent(),
        loadChoiceQuestions(),
      ]);

      assert.ok(lessons.length > 0);
      assert.ok(practiceTasks.length > 0);
      assert.ok(choices.length > 0);
    },
  },
];
