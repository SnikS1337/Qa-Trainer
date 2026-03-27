import { ACHIEVEMENTS } from '../data';
import { AppState, Question, QuestionChoice } from '../types';
import { shuffle, shuffleOptions } from '../utils';
import { isChoiceQuestion } from '../data/lessons';

export type PreparedChoiceQuestion = QuestionChoice & {
  opts: string[];
  ans: number;
};

export type PreparedQuestion = Question | PreparedChoiceQuestion;

export function prepareChoiceQuestion(question: QuestionChoice): PreparedChoiceQuestion {
  const { shuffledOpts, newCorrectIndex } = shuffleOptions(question.opts, question.ans);

  return {
    ...question,
    opts: shuffledOpts,
    ans: newCorrectIndex,
  };
}

export function prepareChoiceQuestions(questions: Question[], limit: number) {
  return shuffle(questions)
    .filter(isChoiceQuestion)
    .slice(0, limit)
    .map(prepareChoiceQuestion);
}

export function prepareLessonQuestions(questions: Question[], limit: number) {
  return shuffle(questions)
    .slice(0, limit)
    .map(question => (isChoiceQuestion(question) ? prepareChoiceQuestion(question) : question));
}

export function calculatePercent(score: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((score / total) * 100);
}

export function awardNewAchievements(state: AppState, onUnlock?: (title: string) => void) {
  ACHIEVEMENTS.forEach(achievement => {
    if (!state.unlockedAchievements.includes(achievement.id) && achievement.check(state)) {
      state.unlockedAchievements.push(achievement.id);
      onUnlock?.(achievement.title);
    }
  });
}
