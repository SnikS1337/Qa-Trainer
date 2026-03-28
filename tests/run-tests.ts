type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const modules = [
  await import('./dates.test.ts'),
  await import('./progression.test.ts'),
  await import('./course.test.ts'),
  await import('./content.test.ts'),
  await import('./choice-display.test.ts'),
  await import('./question-preparation.test.ts'),
];

const cases = modules.flatMap((module) => module.tests as TestCase[]);
let passed = 0;
let failed = 0;

for (const testCase of cases) {
  try {
    await testCase.run();
    passed += 1;
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
  }
}

console.log(`\n${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}
