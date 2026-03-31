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

export interface LessonMeta {
  id: string;
  title: string;
  icon: string;
  color: string;
  category: string;
  xp: number;
  desc: string;
  questionCount: number;
}

export interface Quote {
  text: string;
  author: string;
  book: string;
}

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
  lastLaunchDate: string;
  lastLessonRewardDate: string;
  weeklyCheckpointWeek: string;
  weeklyCheckpointCategories: string[];
  weeklyCheckpointCompletions: number;
  isCheater?: boolean;
  examPassed?: boolean;
}

export interface PracticeCheckValues {
  title?: string;
  precond?: string;
  steps?: string;
  expected?: string;
  actual?: string;
  desc?: string;
  [key: string]: string | undefined;
}

export interface PracticeCheckItem {
  label: string;
  check: (values: PracticeCheckValues) => boolean;
}

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

interface PracticeTaskBase {
  id: string;
  icon: string;
  xp: number;
  color: string;
  title: string;
  desc: string;
}

export interface PracticeTriageTask extends PracticeTaskBase {
  type: 'triage';
  bugs: PracticeBug[];
  severities: PracticeSeverity[];
}

export interface PracticeFindErrorTask extends PracticeTaskBase {
  type: 'find_error';
  context: string;
  fields: PracticeField[];
}

export interface PracticeWriteTestTask extends PracticeTaskBase {
  type: 'write_test';
  requirement: string;
  checkItems: PracticeCheckItem[];
  solution: {
    title: string;
    precondition: string;
    steps: string[];
    expected: string;
  };
}

export interface PracticeBugReportTask extends PracticeTaskBase {
  type: 'bug_report';
  scenario?: string;
  requirement?: string;
  checkItems: PracticeCheckItem[];
  solution: {
    title: string;
    steps: string[];
    actual?: string;
    expected: string;
    severity?: string;
  };
}

export type PracticeTask =
  | PracticeTriageTask
  | PracticeFindErrorTask
  | PracticeWriteTestTask
  | PracticeBugReportTask;

export type PracticeTaskMeta = Pick<
  PracticeTask,
  'id' | 'type' | 'icon' | 'xp' | 'color' | 'title' | 'desc'
>;
