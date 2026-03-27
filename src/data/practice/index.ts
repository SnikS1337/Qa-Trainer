import { PracticeTask } from '../../types';
import { FIND_ERROR_TASKS } from './findErrorTasks';
import { TRIAGE_TASKS } from './triageTasks';
import { BUG_REPORT_TASKS, WRITE_TEST_TASKS } from './writingTasks';

export const PRACTICE_TASKS: PracticeTask[] = [
  ...TRIAGE_TASKS,
  ...FIND_ERROR_TASKS,
  ...WRITE_TEST_TASKS,
  ...BUG_REPORT_TASKS,
];

export { TRIAGE_TASKS, FIND_ERROR_TASKS, WRITE_TEST_TASKS, BUG_REPORT_TASKS };
