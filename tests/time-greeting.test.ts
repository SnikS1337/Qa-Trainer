import assert from 'node:assert/strict';
import { getTimeOfDayGreeting } from '../src/utils';

export const tests = [
  {
    name: 'getTimeOfDayGreeting returns the expected greeting by hour',
    run: () => {
      assert.equal(getTimeOfDayGreeting(new Date(2026, 2, 28, 6, 0, 0)), 'Доброе утро');
      assert.equal(getTimeOfDayGreeting(new Date(2026, 2, 28, 13, 0, 0)), 'Добрый день');
      assert.equal(getTimeOfDayGreeting(new Date(2026, 2, 28, 19, 0, 0)), 'Добрый вечер');
      assert.equal(getTimeOfDayGreeting(new Date(2026, 2, 28, 2, 0, 0)), 'Доброй ночи');
    },
  },
];
