import type { Achievement } from '../types';
import { FOUNDATION_LESSON_IDS } from '../domain/course';
import { LESSON_META } from './lesson_meta';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    icon: '🌱',
    title: 'Первый шаг',
    desc: 'Пройди свой первый урок',
    check: (s) => s.completedLessons.length >= 1,
  },
  {
    id: 'no_errors',
    icon: '💯',
    title: 'Перфекционист',
    desc: 'Пройди урок без единой ошибки',
    check: (s) => s.perfectLessons >= 1,
  },
  {
    id: 'streak3',
    icon: '🔥',
    title: 'На огне!',
    desc: 'Пройди 3 урока подряд без перерыва',
    check: (s) => s.maxStreak >= 3,
  },
  {
    id: 'xp100',
    icon: '⚡',
    title: 'Энергия!',
    desc: 'Набери 100 XP',
    check: (s) => s.totalXP >= 100,
  },
  {
    id: 'xp300',
    icon: '💎',
    title: 'Бриллиант',
    desc: 'Набери 300 XP',
    check: (s) => s.totalXP >= 300,
  },
  {
    id: 'xp700',
    icon: '🚀',
    title: 'Ракета прогресса',
    desc: 'Набери 700 XP',
    check: (s) => s.totalXP >= 700,
  },
  {
    id: 'half',
    icon: '🎯',
    title: 'На полпути',
    desc: 'Пройди половину уроков',
    check: (s) => s.completedLessons.length >= Math.ceil(LESSON_META.length / 2),
  },
  {
    id: 'all',
    icon: '🏆',
    title: 'QA Чемпион',
    desc: 'Пройди все базовые уроки',
    check: (s) => FOUNDATION_LESSON_IDS.every((lessonId) => s.completedLessons.includes(lessonId)),
  },
  {
    id: 'retry',
    icon: '🔄',
    title: 'Упорный',
    desc: 'Повтори урок после неудачи',
    check: (s) => s.retries >= 1,
  },
  {
    id: 'lessons10',
    icon: '📚',
    title: 'В рабочем ритме',
    desc: 'Пройди 10 уроков',
    check: (s) => s.completedLessons.length >= 10,
  },
  {
    id: 'practice3',
    icon: '🧩',
    title: 'Практик',
    desc: 'Заверши 3 практических задания',
    check: (s) => (s.completedPractice?.length ?? 0) >= 3,
  },
  {
    id: 'accuracy70',
    icon: '🎯',
    title: 'Меткий QA',
    desc: 'Держи точность 70%+ после 60 ответов',
    check: (s) =>
      s.totalQuestionsAnswered >= 60 &&
      Math.round((s.totalCorrect / Math.max(1, s.totalQuestionsAnswered)) * 100) >= 70,
  },
  {
    id: 'exam_pass',
    icon: '🎯',
    title: 'Экзамен сдан!',
    desc: 'Пройди экзамен с результатом 80%+',
    check: (s) => s.examBestScore >= 80,
  },
  {
    id: 'daily7',
    icon: '📅',
    title: 'Недельная серия',
    desc: 'Пройди ежедневный квиз 7 дней подряд',
    check: (s) => s.dailyStreak >= 7,
  },
  {
    id: 'weekly_checkpoint',
    icon: '🗓️',
    title: 'Ритм недели',
    desc: 'Закрой 3 разные темы за одну неделю',
    check: (s) => s.weeklyCheckpointCompletions >= 1,
  },
];
