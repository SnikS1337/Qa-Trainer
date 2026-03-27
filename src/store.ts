import { createContext, useContext, useState, useEffect } from 'react';
import { AppState } from './types';

export const initialState: AppState = {
  totalXP: 0, completedLessons: [], streak: 0, maxStreak: 0,
  perfectLessons: 0, retries: 0, bestStreak: 0,
  unlockedAchievements: [], lastQuoteIndex: 0, dailyQuoteDate: '',
  examBestScore: 0, examAttempts: 0,
  dailyStreak: 0, lastDailyDate: '',
  totalQuestionsAnswered: 0, totalCorrect: 0, completedPractice: [],
  certName: '', lastActiveDate: '', isCheater: false, examPassed: false
};

export function useAppStoreInit() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const s = localStorage.getItem('qa_trainer_v2');
      return s ? { ...initialState, ...JSON.parse(s) } : initialState;
    } catch {
      return initialState;
    }
  });

  // Auto-save on every state change
  useEffect(() => {
    try {
      localStorage.setItem('qa_trainer_v2', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state to localStorage:', error);
      // Silently fail - user can continue using the app
    }
  }, [state]);

  const updateState = (updates: Partial<AppState> | ((prev: AppState) => Partial<AppState>)) => {
    setState(prev => {
      const newValues = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...newValues };
    });
  };

  return { state, updateState };
}

export const AppContext = createContext<ReturnType<typeof useAppStoreInit> & { navigate: (s: string, id?: string) => void, showToast: (msg: string, color?: string) => void }>({
  state: initialState,
  updateState: () => {},
  navigate: () => {},
  showToast: () => {}
});

export const useAppStore = () => useContext(AppContext);
