import type { Lesson, PracticeTask, QuestionChoice } from '../types';

let lessonsPromise: Promise<Lesson[]> | null = null;
let practiceTasksPromise: Promise<PracticeTask[]> | null = null;
let choiceQuestionsPromise: Promise<QuestionChoice[]> | null = null;

export function loadLessonsContent() {
  if (!lessonsPromise) {
    lessonsPromise = import('./lessons').then((module) => module.LESSONS);
  }

  return lessonsPromise;
}

export function loadPracticeTasksContent() {
  if (!practiceTasksPromise) {
    practiceTasksPromise = import('./practice_tasks').then((module) => module.PRACTICE_TASKS);
  }

  return practiceTasksPromise;
}

export function loadChoiceQuestions() {
  if (!choiceQuestionsPromise) {
    choiceQuestionsPromise = loadLessonsContent().then((lessons) =>
      lessons.flatMap((lesson) =>
        lesson.questions.filter(
          (question): question is QuestionChoice => question.type === 'choice'
        )
      )
    );
  }

  return choiceQuestionsPromise;
}

export async function loadLessonById(id: string) {
  const lessons = await loadLessonsContent();
  return lessons.find((lesson) => lesson.id === id) ?? null;
}

export async function loadPracticeTaskById(id: string) {
  const tasks = await loadPracticeTasksContent();
  return tasks.find((task) => task.id === id) ?? null;
}

export function preloadLessonsContent() {
  void loadLessonsContent();
  void loadChoiceQuestions();
}

export function preloadPracticeTasksContent() {
  void loadPracticeTasksContent();
}
