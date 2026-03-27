import { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Screen } from './types';

export const STORAGE_KEY = 'qa_trainer_v2';

export const initialState: AppState = {
  totalXP: 0, 
  completedLessons: [], 
  streak: 0, 
  maxStreak: 0,
  perfectLessons: 0, 
  retries: 0, 
  bestStreak: 0,
  unlockedAchievements: [], 
  lastQuoteIndex: 0, 
  dailyQuoteDate: '',
  examBestScore: 0, 
  examAttempts: 0,
  dailyStreak: 0, 
  lastDailyDate: '',
  totalQuestionsAnswered: 0, 
  totalCorrect: 0, 
  completedPractice: [],
  certName: '', 
  lastActiveDate: '', 
  isCheater: false, 
  examPassed: false
};

export function useAppStoreInit() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? { ...initialState, ...JSON.parse(s) } : initialState;
    } catch {
      return initialState;
    }
  });

  // Auto-save on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage failures to keep the app usable.
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

type AppContextValue = ReturnType<typeof useAppStoreInit> & {
  navigate: (screen: Screen, id?: string) => void;
  showToast: (msg: string, color?: string) => void;
};

export const AppContext = createContext<AppContextValue>({
  state: initialState,
  updateState: () => {},
  navigate: () => {},
  showToast: () => {}
});

export const useAppStore = () => useContext(AppContext);
