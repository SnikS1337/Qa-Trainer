import { LEVEL_NAMES } from './data/messages';
import type { Question, QuestionChoice } from './types';

export function getLevelInfo(xp: number) {
  const levels = [0, 50, 120, 220, 350, 500, 700, 1000];
  let level = 1;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i]) level = i + 1;
  }
  const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const curr = levels[Math.min(level - 1, levels.length - 1)];
  const next = levels[Math.min(level, levels.length - 1)];
  const pct = next === curr ? 100 : Math.round(((xp - curr) / (next - curr)) * 100);
  return { level, name, curr, next, pct, xpInLevel: xp - curr, xpToNext: next - curr };
}

export function getTimeOfDayGreeting(date: Date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Доброе утро';
  }

  if (hour >= 12 && hour < 18) {
    return 'Добрый день';
  }

  if (hour >= 18 && hour < 23) {
    return 'Добрый вечер';
  }

  return 'Доброй ночи';
}

export function getBackgroundGradient(screen: string): string {
  const gradients: Record<string, string> = {
    splash:
      'radial-gradient(circle at 18% 20%, rgba(124, 58, 237, 0.42), transparent 38%), radial-gradient(circle at 82% 24%, rgba(8, 145, 178, 0.34), transparent 40%), radial-gradient(circle at 50% 84%, rgba(30, 64, 175, 0.28), transparent 46%), radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.35), transparent 65%)',
    home: 'radial-gradient(circle at 15% 50%, rgba(21, 128, 61, 0.36), transparent 44%), radial-gradient(circle at 85% 30%, rgba(14, 116, 144, 0.32), transparent 42%), radial-gradient(circle at 52% 84%, rgba(59, 130, 246, 0.22), transparent 48%), radial-gradient(circle at 50% 18%, rgba(56, 189, 248, 0.12), transparent 34%)',
    lesson:
      'radial-gradient(circle at 18% 22%, rgba(251, 191, 36, 0.28), transparent 36%), radial-gradient(circle at 86% 28%, rgba(234, 88, 12, 0.32), transparent 40%), radial-gradient(circle at 50% 82%, rgba(14, 165, 233, 0.18), transparent 48%), radial-gradient(circle at 48% 16%, rgba(217, 119, 6, 0.14), transparent 30%)',
    practice:
      'radial-gradient(circle at 14% 52%, rgba(6, 95, 70, 0.36), transparent 42%), radial-gradient(circle at 84% 26%, rgba(79, 70, 229, 0.3), transparent 40%), radial-gradient(circle at 50% 84%, rgba(16, 185, 129, 0.2), transparent 48%), radial-gradient(circle at 52% 18%, rgba(45, 212, 191, 0.12), transparent 34%)',
    'practice-task':
      'radial-gradient(circle at 18% 18%, rgba(15, 118, 110, 0.36), transparent 40%), radial-gradient(circle at 82% 24%, rgba(168, 85, 247, 0.3), transparent 40%), radial-gradient(circle at 50% 84%, rgba(34, 197, 94, 0.18), transparent 50%), radial-gradient(circle at 48% 14%, rgba(14, 165, 233, 0.12), transparent 30%)',
    exam: 'radial-gradient(circle at 16% 18%, rgba(220, 38, 38, 0.32), transparent 38%), radial-gradient(circle at 82% 24%, rgba(126, 34, 206, 0.28), transparent 38%), radial-gradient(circle at 50% 84%, rgba(30, 64, 175, 0.18), transparent 50%), radial-gradient(circle at 50% 16%, rgba(239, 68, 68, 0.12), transparent 28%)',
    daily:
      'radial-gradient(circle at 15% 24%, rgba(245, 158, 11, 0.32), transparent 38%), radial-gradient(circle at 84% 30%, rgba(22, 163, 74, 0.28), transparent 40%), radial-gradient(circle at 50% 84%, rgba(14, 165, 233, 0.18), transparent 48%), radial-gradient(circle at 46% 16%, rgba(250, 204, 21, 0.12), transparent 30%)',
    stats:
      'radial-gradient(circle at 15% 22%, rgba(37, 99, 235, 0.32), transparent 38%), radial-gradient(circle at 84% 26%, rgba(8, 145, 178, 0.28), transparent 40%), radial-gradient(circle at 50% 84%, rgba(34, 197, 94, 0.14), transparent 52%), radial-gradient(circle at 50% 16%, rgba(96, 165, 250, 0.12), transparent 30%)',
    achievements:
      'radial-gradient(circle at 16% 18%, rgba(217, 119, 6, 0.34), transparent 38%), radial-gradient(circle at 84% 24%, rgba(217, 70, 239, 0.26), transparent 38%), radial-gradient(circle at 50% 84%, rgba(234, 179, 8, 0.18), transparent 50%), radial-gradient(circle at 50% 16%, rgba(251, 191, 36, 0.12), transparent 28%)',
    certificate:
      'radial-gradient(circle at 18% 20%, rgba(190, 24, 93, 0.3), transparent 38%), radial-gradient(circle at 84% 22%, rgba(124, 58, 237, 0.28), transparent 38%), radial-gradient(circle at 50% 84%, rgba(14, 165, 233, 0.16), transparent 52%), radial-gradient(circle at 50% 14%, rgba(244, 114, 182, 0.1), transparent 28%)',
  };

  return gradients[screen] ?? gradients.home;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickBalancedCorrectIndex(
  question: QuestionChoice,
  usageByIndex: Map<number, number>,
  previousCorrectIndex: number | null
) {
  const positions = question.opts.map((_, index) => index);
  const minUsage = Math.min(...positions.map((index) => usageByIndex.get(index) ?? 0));

  let candidates = positions.filter((index) => (usageByIndex.get(index) ?? 0) === minUsage);

  const nonRepeatingCandidates = candidates.filter((index) => index !== previousCorrectIndex);
  if (nonRepeatingCandidates.length > 0) {
    candidates = nonRepeatingCandidates;
  }

  const nonOriginalCandidates = candidates.filter((index) => index !== question.ans);
  if (nonOriginalCandidates.length > 0) {
    candidates = nonOriginalCandidates;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

function rebalanceChoiceQuestion(
  question: QuestionChoice,
  usageByIndex: Map<number, number>,
  previousCorrectIndex: number | null
) {
  const nextCorrectIndex = pickBalancedCorrectIndex(question, usageByIndex, previousCorrectIndex);
  const correctOption = question.opts[question.ans];
  const distractors = shuffle(question.opts.filter((_, index) => index !== question.ans));
  const nextOptions: string[] = [];
  let distractorIndex = 0;

  for (let index = 0; index < question.opts.length; index++) {
    if (index === nextCorrectIndex) {
      nextOptions.push(correctOption);
      continue;
    }

    nextOptions.push(distractors[distractorIndex]);
    distractorIndex += 1;
  }

  return {
    ...question,
    opts: nextOptions,
    ans: nextCorrectIndex,
  };
}

export function prepareQuestionsWithShuffledChoices<T extends Question>(questions: T[]): T[] {
  const usageByIndex = new Map<number, number>();
  let previousCorrectIndex: number | null = null;

  return questions.map((question) => {
    if (question.type !== 'choice') {
      return question;
    }

    const nextQuestion = rebalanceChoiceQuestion(question, usageByIndex, previousCorrectIndex);
    usageByIndex.set(nextQuestion.ans, (usageByIndex.get(nextQuestion.ans) ?? 0) + 1);
    previousCorrectIndex = nextQuestion.ans;

    return nextQuestion as T;
  });
}

const DISPLAY_TERM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/'Visual Regression Testing'/gi, 'визуальная регрессия'],
  [/Visual Regression Testing/gi, 'визуальная регрессия'],
  [/'Component Testing'/gi, 'тестирование компонента'],
  [/Component Testing/gi, 'тестирование компонента'],
  [/'Build Verification Test' \(BVT\)/gi, 'быстрая проверка сборки (BVT)'],
  [/Build Verification Test \(BVT\)/gi, 'быстрая проверка сборки (BVT)'],
  [/'Internationalization' \(I18n\)/gi, 'подготовка к переводу (I18n)'],
  [/Internationalization \(I18n\)/gi, 'подготовка к переводу (I18n)'],
  [/'Localization' \(L10n\)/gi, 'локализация (L10n)'],
  [/Localization \(L10n\)/gi, 'локализация (L10n)'],
  [/'Feature Flag' \(фича-флаг\)/gi, 'флаг функции'],
  [/Feature Flag \(фича-флаг\)/gi, 'флаг функции'],
  [/'Environment Parity' \(различия окружений\)/gi, 'разные окружения'],
  [/Environment Parity \(различия окружений\)/gi, 'разные окружения'],
  [/'Backward Compatibility' \(обратная совместимость\)/gi, 'обратная совместимость'],
  [/Backward Compatibility \(обратная совместимость\)/gi, 'обратная совместимость'],
  [/'Security Headers' \(напр\. CSP, HSTS\)/gi, 'защитные заголовки'],
  [/Security Headers \(напр\. CSP, HSTS\)/gi, 'защитные заголовки'],
  [/'Session-Based Testing'/gi, 'сессионное тестирование'],
  [/Session-Based Testing/gi, 'сессионное тестирование'],
  [/'Error Guessing'/gi, 'предположение ошибок'],
  [/Error Guessing/gi, 'предположение ошибок'],
  [/'Showstopper'/gi, 'стоп-баг'],
  [/Showstopper/gi, 'стоп-баг'],
  [/'Decision Table' \(Таблица принятия решений\)/gi, 'таблица решений'],
  [/Decision Table \(Таблица принятия решений\)/gi, 'таблица решений'],
  [/'Test Suite' \(Тестовый набор\)/gi, 'набор тестов'],
  [/Test Suite \(Тестовый набор\)/gi, 'набор тестов'],
  [/'Transition' \(Переход\)/gi, 'переход'],
  [/Transition \(Переход\)/gi, 'переход'],
  [/'Subquery' \(подзапрос\)/gi, 'подзапрос'],
  [/Subquery \(подзапрос\)/gi, 'подзапрос'],
  [/'Rendering Engine' \(движок рендеринга\)/gi, 'движок браузера'],
  [/Rendering Engine \(движок рендеринга\)/gi, 'движок браузера'],
  [/'Polyfill' \(полифил\)/gi, 'полифил'],
  [/Polyfill \(полифил\)/gi, 'полифил'],
  [/'Orthogonal Array' \(ортогональные массивы\)/gi, 'ортогональные массивы'],
  [/Orthogonal Array \(ортогональные массивы\)/gi, 'ортогональные массивы'],
  [/'All-Pairs'/gi, 'попарное покрытие'],
  [/All-Pairs/gi, 'попарное покрытие'],
  [/'All-Combinations'/gi, 'все комбинации'],
  [/All-Combinations/gi, 'все комбинации'],
  [/'Testing Trophy'/gi, 'трофей тестирования'],
  [/Testing Trophy/gi, 'трофей тестирования'],
  [/'Shift Left Testing'/gi, 'раннее тестирование'],
  [/Shift Left Testing/gi, 'раннее тестирование'],
];

function normalizeDisplayTerms(text: string) {
  return DISPLAY_TERM_REPLACEMENTS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    text
  )
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function compactQuestionText(text: string) {
  let value = normalizeDisplayTerms(text);

  value = value
    .replace(/^Что означает (.+?), а что — (.+)\?$/i, 'Чем отличается $1 от $2?')
    .replace('обычно располагается', 'обычно находится')
    .replace('в контексте', 'в')
    .replace('и как он соотносится со', 'и чем отличается от');

  return value;
}

export function compactChoiceOptionText(text: string) {
  let value = normalizeDisplayTerms(text);

  value = value
    .replace('проверяет визуальное отображение в браузере', 'проверяет внешний вид интерфейса')
    .replace('подготовить продукт к разным языкам', 'подготовить продукт к переводу')
    .replace('перевести и настроить под конкретную страну', 'перевести и настроить под страну')
    .replace(
      'автоматизированный Smoke-тест, который запускается сразу после сборки билда',
      'автоматический Smoke-тест сразу после сборки'
    )
    .replace(
      'тестирование отдельного компонента в изоляции',
      'проверка отдельного компонента отдельно'
    )
    .replace('значительно больше, чем', 'больше, чем')
    .replace('Это делает поддержку дорогой и неэффективной', '')
    .replace(
      'Система должна сообщать об ошибке как можно раньше',
      'Ошибка должна находиться как можно раньше'
    )
    .replace(
      'проверка, что две системы понимают один и тот же API-контракт',
      'проверка, что две системы понимают один API-контракт'
    )
    .replace(
      'Тестирование начинают как можно раньше, еще на этапе требований',
      'Тестирование начинают как можно раньше'
    )
    .replace(
      'В код специально вносят маленькую ошибку и смотрят, заметят ли ее тесты',
      'В код вносят ошибку и смотрят, заметят ли ее тесты'
    );

  const withoutExamples = value.replace(/\s*\((?:напр\.?|например)[^)]*\)/gi, '');
  if (withoutExamples.length <= value.length - 10) {
    value = withoutExamples.trim();
  }

  if (value.length > 80 && value.includes('. ')) {
    value = value.split('. ')[0].trim();
  }

  if (value.length > 78) {
    for (const separator of [
      ', так как',
      ' так как ',
      ', потому что',
      ' потому что ',
      ', чтобы ',
    ]) {
      const separatorIndex = value.indexOf(separator);

      if (separatorIndex >= 20 && separatorIndex <= 84) {
        value = value.slice(0, separatorIndex).trim();
        break;
      }
    }
  }

  return value.replace(/[.,;:!?-]+$/g, '').trim();
}

function squeezeChoiceOptionText(text: string) {
  return compactChoiceOptionText(text)
    .replace(/\s*\(([^)]{4,})\)$/g, '')
    .replace(/^Они\s+/i, '')
    .replace(/^Это\s+/i, '')
    .replace(/^Чтобы\s+/i, '')
    .replace(/^Когда\s+/i, '')
    .replace(/^Если\s+/i, '')
    .replace(/^Проверка,\s+что\s+/i, 'Проверяет, что ')
    .replace(/^Проверка\s+/i, 'Проверяет ')
    .replace(/[.,;:!?-]+$/g, '')
    .trim();
}

const SAFE_CHOICE_BALANCE_SEPARATORS = [
  '. ',
  ', из-за которых ',
  ', из-за ',
  ', которые ',
  ', который ',
  ', которая ',
  ', которое ',
  ', когда ',
  ', если ',
  ', чтобы ',
  ', потому что ',
  ', так как ',
  ', где ',
];

function hasBalancedParentheses(text: string) {
  let depth = 0;

  for (const char of text) {
    if (char === '(') {
      depth += 1;
    }

    if (char === ')') {
      depth -= 1;
    }

    if (depth < 0) {
      return false;
    }
  }

  return depth === 0;
}

function trimChoiceOptionTextSafely(text: string, targetLength: number) {
  if (text.length <= targetLength) {
    return text;
  }

  let bestCut = -1;

  for (const separator of SAFE_CHOICE_BALANCE_SEPARATORS) {
    let separatorIndex = text.indexOf(separator);

    while (separatorIndex !== -1) {
      const candidate = text.slice(0, separatorIndex).trim();

      if (
        separatorIndex >= 24 &&
        separatorIndex <= targetLength + 16 &&
        hasBalancedParentheses(candidate)
      ) {
        bestCut = Math.max(bestCut, separatorIndex);
      }

      separatorIndex = text.indexOf(separator, separatorIndex + separator.length);
    }
  }

  if (bestCut >= 24) {
    return text.slice(0, bestCut).trim();
  }

  return text;
}

export function capitalizeDisplayedChoiceText(text: string) {
  return text.replace(/^([^A-Za-zА-ЯЁа-яё]*)([а-яё])/, (_, prefix: string, letter: string) => {
    return `${prefix}${letter.toUpperCase()}`;
  });
}

export function getChoiceOptionDisplayTexts(options: string[]) {
  const balancedOptions = options.map((option) =>
    capitalizeDisplayedChoiceText(squeezeChoiceOptionText(option))
  );

  if (balancedOptions.length < 2) {
    return balancedOptions;
  }

  const lengths = balancedOptions.map((option) => option.length);
  const longestLength = Math.max(...lengths);
  const longestIndexes = lengths
    .map((length, index) => (length === longestLength ? index : -1))
    .filter((index) => index >= 0);

  if (longestIndexes.length !== 1) {
    return balancedOptions;
  }

  const longestIndex = longestIndexes[0];
  const secondLongestLength = [...lengths]
    .filter((_, index) => index !== longestIndex)
    .sort((left, right) => right - left)[0];

  if (longestLength - secondLongestLength <= 8) {
    return balancedOptions;
  }

  const targetLength = Math.max(secondLongestLength + 6, 32);
  const trimmedLongestOption = capitalizeDisplayedChoiceText(
    trimChoiceOptionTextSafely(balancedOptions[longestIndex], targetLength)
  );

  if (
    trimmedLongestOption.length < balancedOptions[longestIndex].length &&
    hasBalancedParentheses(trimmedLongestOption)
  ) {
    balancedOptions[longestIndex] = trimmedLongestOption;
  }

  return balancedOptions;
}

export function plural(n: number, a: string, b: string, c: string) {
  const m = n % 100,
    m10 = n % 10;
  if (m >= 11 && m <= 19) return c;
  if (m10 === 1) return a;
  if (m10 >= 2 && m10 <= 4) return b;
  return c;
}
