import assert from 'node:assert/strict';
import {
  CAREER_LESSON_IDS,
  DESIGN_TECHNIQUES_LESSON_IDS,
  FOUNDATION_LESSON_IDS,
  getCertificateProgress,
} from '../src/domain/course';

const FOUNDATION_ONLY = [...FOUNDATION_LESSON_IDS];
const FOUNDATION_AND_DESIGN = [...FOUNDATION_LESSON_IDS, ...DESIGN_TECHNIQUES_LESSON_IDS];
const FULL_CHAIN = [
  ...FOUNDATION_LESSON_IDS,
  ...DESIGN_TECHNIQUES_LESSON_IDS,
  ...CAREER_LESSON_IDS,
];

export const tests = [
  {
    name: 'certificate stays locked after only foundation lessons',
    run: () => {
      const progress = getCertificateProgress(FOUNDATION_ONLY);

      assert.equal(progress.foundationDone, true);
      assert.equal(progress.designDone, false);
      assert.equal(progress.careerDone, false);
      assert.equal(progress.fullCourseDone, false);
      assert.equal(progress.certType, 'none');
    },
  },
  {
    name: 'certificate stays locked after foundation and design without career',
    run: () => {
      const progress = getCertificateProgress(FOUNDATION_AND_DESIGN);

      assert.equal(progress.foundationDone, true);
      assert.equal(progress.designDone, true);
      assert.equal(progress.careerDone, false);
      assert.equal(progress.fullCourseDone, false);
      assert.equal(progress.certType, 'none');
    },
  },
  {
    name: 'certificate unlocks only after the full lesson chain',
    run: () => {
      const progress = getCertificateProgress(FULL_CHAIN);

      assert.equal(progress.foundationDone, true);
      assert.equal(progress.designDone, true);
      assert.equal(progress.careerDone, true);
      assert.equal(progress.fullCourseDone, true);
      assert.equal(progress.certType, 'career');
    },
  },
];
