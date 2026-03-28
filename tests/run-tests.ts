import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const testDir = dirname(fileURLToPath(import.meta.url));
const testFiles = (await readdir(testDir))
  .filter((fileName) => fileName.endsWith('.test.ts'))
  .sort();

const modules = await Promise.all(
  testFiles.map((fileName) => import(pathToFileURL(join(testDir, fileName)).href))
);

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
