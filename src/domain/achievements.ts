import { ACHIEVEMENTS } from '../data/achievements';
import type { Achievement, AppState } from '../types';

export function unlockAchievements(state: AppState) {
  const nextState: AppState = {
    ...state,
    unlockedAchievements: [...state.unlockedAchievements],
  };
  const unlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (nextState.unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    if (achievement.check(nextState)) {
      nextState.unlockedAchievements.push(achievement.id);
      unlocked.push(achievement);
    }
  }

  return { nextState, unlocked };
}
