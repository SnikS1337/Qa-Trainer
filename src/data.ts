import { Quote, Achievement } from './types';
import { LESSONS } from './data/lessons';
import { PRACTICE_TASKS } from './data/practice';

export { LESSONS } from './data/lessons';
export { PRACTICE_TASKS } from './data/practice';

export const QUOTES: Quote[] = [
  { text: "Тестирование — это процесс выполнения программы с целью обнаружения ошибок.", author: "Гленфорд Майерс", book: "Искусство тестирования программ" },
  { text: "Тестировщик, который никогда не ломает программу — не тестировщик.", author: "Джеймс Бах", book: "Lessons Learned in Software Testing" },
  { text: "Качество не может быть добавлено в продукт на финальном этапе — оно должно быть встроено в процесс.", author: "Лиза Криспин", book: "Agile Testing" },
  { text: "Успешный тест — это тот, который находит баг.", author: "Гленфорд Майерс", book: "Искусство тестирования программ" },
  { text: "Тестирование показывает наличие дефектов, но не их отсутствие.", author: "Эдсгер Дейкстра", book: "Software Engineering Techniques" },
  { text: "Хороший тестировщик думает как пользователь, но знает как разработчик.", author: "Джеймс Уиттакер", book: "How Google Tests Software" },
  { text: "Автоматизация без понимания — это автоматизированный хаос.", author: "Майкл Болтон", book: "Lessons Learned in Software Testing" }
];

export const MOTIVATIONAL_MESSAGES = [
  { pct: 100, msg: "🔥 Идеально! Ты настоящий профессионал!", sub: "Ни одной ошибки — так держать!" },
  { pct: 80, msg: "💪 Отличная работа!", sub: "Пара ошибок — и всё равно круто. Продолжай!" },
  { pct: 60, msg: "👍 Хороший результат!", sub: "Основа есть, теперь шлифуем детали." },
  { pct: 40, msg: "📖 Нужно повторить!", sub: "Не беда — повторенье мать ученья!" },
  { pct: 0, msg: "🌱 Начало пути!", sub: "Все профи когда-то были новичками. Попробуй ещё раз!" },
];

export const LEVEL_NAMES = [
  "Стажёр", "Junior QA", "Тестировщик", "QA Engineer", "Senior QA", "QA Lead", "QA Architect", "QA Legend"
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", icon: "🌱", title: "Первый шаг", desc: "Пройди свой первый урок", check: s => s.completedLessons.length >= 1 },
  { id: "no_errors", icon: "💯", title: "Перфекционист", desc: "Пройди урок без единой ошибки", check: s => s.perfectLessons >= 1 },
  { id: "streak3", icon: "🔥", title: "На огне!", desc: "Пройди 3 урока подряд без перерыва", check: s => s.maxStreak >= 3 },
  { id: "xp100", icon: "⚡", title: "Энергия!", desc: "Набери 100 XP", check: s => s.totalXP >= 100 },
  { id: "xp300", icon: "💎", title: "Бриллиант", desc: "Набери 300 XP", check: s => s.totalXP >= 300 },
  { id: "half", icon: "🎯", title: "На полпути", desc: "Пройди половину уроков", check: s => s.completedLessons.length >= Math.ceil(LESSONS.length / 2) },
  { id: "all", icon: "🏆", title: "QA Чемпион", desc: "Пройди все базовые уроки", check: s => ['pyramid','equiv','boundary','decision','testcase','states','types','checklist'].every(id => s.completedLessons.includes(id)) },
  { id: "retry", icon: "🔄", title: "Упорный", desc: "Повтори урок после неудачи", check: s => s.retries >= 1 },
  { id: "speed", icon: "⚡", title: "Быстрый разум", desc: "5 правильных ответов подряд", check: s => s.bestStreak >= 5 },
  { id: "exam_pass", icon: "🎯", title: "Экзамен сдан!", desc: "Пройди экзамен с результатом 70%+", check: s => s.examBestScore >= 70 },
  { id: "daily7", icon: "📅", title: "Недельная серия", desc: "Пройди ежедневный квиз 7 дней подряд", check: s => s.dailyStreak >= 7 },
];


