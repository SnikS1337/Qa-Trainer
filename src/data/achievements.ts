import type { Achievement } from '../types';
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
    check: (s) =>
      [
        'pyramid',
        'equiv',
        'boundary',
        'decision',
        'testcase',
        'states',
        'types',
        'checklist',
      ].every((id) => s.completedLessons.includes(id)),
  },
  {
    id: 'retry',
    icon: '🔄',
    title: 'Упорный',
    desc: 'Повтори урок после неудачи',
    check: (s) => s.retries >= 1,
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
];
