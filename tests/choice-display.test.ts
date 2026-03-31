import assert from 'node:assert/strict';
import { LESSONS } from '../src/data/lessons';
import {
  capitalizeDisplayedChoiceText,
  compactChoiceOptionText,
  getChoiceOptionDisplayTexts,
} from '../src/utils';

function startsLowerCyrillic(value: string) {
  return /^[^A-Za-zА-ЯЁа-яё]*[а-яё]/.test(value.trimStart());
}

function getLengthBiasStats(transform: (options: string[]) => string[]) {
  let total = 0;
  let uniquelyLongestCorrect = 0;

  for (const lesson of LESSONS) {
    for (const question of lesson.questions) {
      if (question.type !== 'choice') {
        continue;
      }

      const displayOptions = transform(question.opts);
      const lengths = displayOptions.map((option) => option.length);
      const longestLength = Math.max(...lengths);

      total += 1;
      assert.equal(displayOptions.length, question.opts.length);
      assert.ok(displayOptions.every((option) => option.length > 0));

      if (lengths.filter((length) => length === longestLength).length === 1) {
        if (lengths[question.ans] === longestLength) {
          uniquelyLongestCorrect += 1;
        }
      }
    }
  }

  return {
    total,
    uniquelyLongestCorrect,
    pct: (uniquelyLongestCorrect / total) * 100,
  };
}

export const tests = [
  {
    name: 'choice display still reduces some longest-answer bias without breaking meaning',
    run: () => {
      const rawStats = getLengthBiasStats((options) => options.map(compactChoiceOptionText));
      const balancedStats = getLengthBiasStats(getChoiceOptionDisplayTexts);

      assert.ok(balancedStats.uniquelyLongestCorrect < rawStats.uniquelyLongestCorrect);
    },
  },
  {
    name: 'balanced choice display never starts visible answers with lowercase cyrillic',
    run: () => {
      const samples: Array<{ lesson: string; option: string }> = [];

      for (const lesson of LESSONS) {
        for (const question of lesson.questions) {
          if (question.type !== 'choice') {
            continue;
          }

          for (const option of getChoiceOptionDisplayTexts(question.opts)) {
            if (startsLowerCyrillic(option)) {
              samples.push({ lesson: lesson.id, option });
            }
          }
        }
      }

      assert.deepEqual(samples, []);
    },
  },
  {
    name: 'capitalizeDisplayedChoiceText uppercases only cyrillic sentence starts',
    run: () => {
      assert.equal(capitalizeDisplayedChoiceText('проверяет API'), 'Проверяет API');
      assert.equal(capitalizeDisplayedChoiceText('  «проверяет API»'), '  «Проверяет API»');
      assert.equal(capitalizeDisplayedChoiceText('Проверяет API'), 'Проверяет API');
      assert.equal(
        capitalizeDisplayedChoiceText('iOS показывает экран входа'),
        'iOS показывает экран входа'
      );
    },
  },
  {
    name: 'choice display does not leave dangling truncated fragments',
    run: () => {
      for (const lesson of LESSONS) {
        for (const question of lesson.questions) {
          if (question.type !== 'choice') {
            continue;
          }

          for (const option of getChoiceOptionDisplayTexts(question.opts)) {
            const openParens = (option.match(/\(/g) ?? []).length;
            const closeParens = (option.match(/\)/g) ?? []).length;

            assert.equal(
              openParens,
              closeParens,
              `Displayed option has unbalanced parentheses: ${option}`
            );
          }
        }
      }
    },
  },
  {
    name: 'choice display keeps full contrast answers intact',
    run: () => {
      const sqlOptions = getChoiceOptionDisplayTexts([
        'SQL — старый, NoSQL — новый',
        'SQL — таблицы и связи, NoSQL — документы, ключ-значение и другие гибкие структуры',
        'NoSQL быстрее всегда',
        'SQL только для Windows',
      ]);
      const e2eOptions = getChoiceOptionDisplayTexts([
        'Они написаны на нестабильных языках программирования',
        'Они зависят от сети, БД, UI-таймаутов и других внешних факторов, из-за которых бывают ложные падения',
        'Они проверяют только визуальную часть приложения',
        'Их легко сломать, просто изменив цвет кнопки',
      ]);

      assert.match(sqlOptions[1], /SQL/);
      assert.match(sqlOptions[1], /NoSQL/);
      assert.match(e2eOptions[1], /внешних факторов/i);
      assert.match(e2eOptions[1], /UI-таймаутов/i);
    },
  },
];
