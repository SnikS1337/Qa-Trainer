import assert from 'node:assert/strict';
import {
  getLocalDateKey,
  getPreviousDateKey,
  normalizeStoredDateKey,
  parseDateKey,
  shiftDateKey,
} from '../src/domain/dates';

export const tests = [
  {
    name: 'getLocalDateKey formats dates as YYYY-MM-DD',
    run: () => {
      assert.equal(getLocalDateKey(new Date(2026, 2, 28)), '2026-03-28');
    },
  },
  {
    name: 'parseDateKey rejects invalid calendar dates',
    run: () => {
      assert.equal(parseDateKey('2026-02-30'), null);
      assert.equal(parseDateKey('not-a-date'), null);
    },
  },
  {
    name: 'shiftDateKey and getPreviousDateKey handle month boundaries',
    run: () => {
      assert.equal(shiftDateKey('2026-03-01', -1), '2026-02-28');
      assert.equal(getPreviousDateKey('2026-04-01'), '2026-03-31');
    },
  },
  {
    name: 'normalizeStoredDateKey migrates legacy Date strings',
    run: () => {
      const legacyDate = new Date(2026, 2, 28).toDateString();

      assert.equal(normalizeStoredDateKey(legacyDate), '2026-03-28');
      assert.equal(normalizeStoredDateKey('2026-03-28'), '2026-03-28');
      assert.equal(normalizeStoredDateKey('bad-value'), '');
    },
  },
];
