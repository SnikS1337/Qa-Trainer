export interface QuestionChoice {
  type: 'choice';
  q: string;
  opts: string[];
  ans: number;
  exp: string;
}

export interface QuestionSort {
  type: 'sort';
  q: string;
  items: string[];
  correct: string[];
  exp: string;
}

export type Question = QuestionChoice | QuestionSort;

export type Screen =
  | 'splash'
  | 'home'
  | 'lesson'
  | 'practice'
  | 'practice_task'
  | 'exam'
  | 'daily'
  | 'stats'
  | 'achievements'
  | 'certificate';

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: string;
  xp: number;
  desc: string;
  questions: Question[];
}

export interface Quote {
  text: string;
  author: string;
  book: string;
}

export type PracticeTaskType = 'triage' | 'find_error' | 'write_test' | 'bug_report';

export interface PracticeSeverity {
  key: string;
  label: string;
  color: string;
  desc: string;
}

export interface PracticeBug {
  id: number;
  desc: string;
  correct: string;
  hint: string;
}

export interface PracticeField {
  id: string;
  label: string;
  value: string;
  hasError: boolean;
  errorExp?: string;
}

export interface PracticeSubmission {
  title?: string;
  precond?: string;
  steps?: string;
  actual?: string;
  expected?: string;
  desc?: string;
  [key: string]: string | undefined;
}

export interface PracticeCheckItem {
  label: string;
  check: (values: PracticeSubmission) => boolean;
}

export interface PracticeTaskBase {
  id: string;
  type: PracticeTaskType;
  icon: string;
  xp: number;
  color: string;
  title: string;
  desc: string;
}

export interface TriageTask extends PracticeTaskBase {
  type: 'triage';
  bugs: PracticeBug[];
  severities: PracticeSeverity[];
}

export interface FindErrorTask extends PracticeTaskBase {
  type: 'find_error';
  context: string;
  fields: PracticeField[];
}

export interface WriteTestSolution {
  title: string;
  precondition: string;
  steps: string[];
  expected: string;
}

export interface BugReportSolution {
  title: string;
  steps: string[];
  actual?: string;
  expected: string;
  severity?: string;
}

export interface WriteTestTask extends PracticeTaskBase {
  type: 'write_test';
  requirement: string;
  checkItems: PracticeCheckItem[];
  solution: WriteTestSolution;
}

export interface BugReportTask extends PracticeTaskBase {
  type: 'bug_report';
  requirement?: string;
  scenario?: string;
  checkItems: PracticeCheckItem[];
  solution: BugReportSolution;
}

export type PracticeTask = TriageTask | FindErrorTask | WriteTestTask | BugReportTask;

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (s: AppState) => boolean;
}

export interface AppState {
  totalXP: number;
  completedLessons: string[];
  streak: number;
  maxStreak: number;
  perfectLessons: number;
  retries: number;
  bestStreak: number;
  unlockedAchievements: string[];
  lastQuoteIndex: number;
  dailyQuoteDate: string;
  examBestScore: number;
  examAttempts: number;
  dailyStreak: number;
  lastDailyDate: string;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  completedPractice: string[];
  certName: string;
  lastActiveDate: string;
  isCheater?: boolean;
  examPassed?: boolean;
}
