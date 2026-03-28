import React, { useState } from 'react';
import { useAppStore, initialState } from '../store';
import { LESSON_META } from '../data/lesson_meta';
import ConfirmModal from './ConfirmModal';
import ModalShell from './ModalShell';

export default function DevMenu({ onClose }: { onClose: () => void }) {
  const { state, updateState, showToast, navigate } = useAppStore();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [importData, setImportData] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'trainer') {
      setAuthenticated(true);
    } else {
      showToast('Неверный пароль', 'text-brand-red');
    }
  };

  const addXP = (amount: number) => {
    updateState((prev) => ({ totalXP: prev.totalXP + amount, isCheater: true }));
    showToast(`Добавлено ${amount} XP`, 'text-brand-green');
  };

  const unlockAll = () => {
    updateState({ completedLessons: LESSON_META.map((lesson) => lesson.id), isCheater: true });
    showToast('Все уроки открыты', 'text-brand-green');
  };

  const resetProgress = () => {
    setShowConfirm(true);
  };

  const handleConfirmReset = () => {
    localStorage.removeItem('qa_trainer_v2');
    updateState(initialState);
    setShowConfirm(false);
    onClose();
    navigate('splash');
    showToast('Прогресс сброшен', 'text-brand-green');
  };

  const exportProgress = () => {
    const data = JSON.stringify(state);
    navigator.clipboard.writeText(data);
    showToast('Прогресс скопирован в буфер обмена', 'text-brand-green');
  };

  const importProgress = () => {
    try {
      const parsed = JSON.parse(importData);

      // Validate that parsed data has the expected structure of AppState
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Invalid data structure');
      }

      // Check for required AppState properties and their types
      const requiredFields: Record<string, string> = {
        totalXP: 'number',
        completedLessons: 'object',
        streak: 'number',
        maxStreak: 'number',
        perfectLessons: 'number',
        retries: 'number',
        bestStreak: 'number',
        unlockedAchievements: 'object',
        lastQuoteIndex: 'number',
        dailyQuoteDate: 'string',
        examBestScore: 'number',
        examAttempts: 'number',
        dailyStreak: 'number',
        lastDailyDate: 'string',
        totalQuestionsAnswered: 'number',
        totalCorrect: 'number',
        completedPractice: 'object',
        certName: 'string',
        lastActiveDate: 'string',
      };

      for (const [field, expectedType] of Object.entries(requiredFields)) {
        if (!(field in parsed)) {
          throw new Error(`Missing field: ${field}`);
        }

        const actualType = Array.isArray(parsed[field]) ? 'object' : typeof parsed[field];
        if (actualType !== expectedType) {
          throw new Error(`Invalid type for ${field}: expected ${expectedType}, got ${actualType}`);
        }
      }

      // Additional validation for arrays
      if (!Array.isArray(parsed.completedLessons)) {
        throw new Error('completedLessons must be an array');
      }
      if (!Array.isArray(parsed.unlockedAchievements)) {
        throw new Error('unlockedAchievements must be an array');
      }
      if (!Array.isArray(parsed.completedPractice)) {
        throw new Error('completedPractice must be an array');
      }

      updateState({ ...parsed, isCheater: true });
      showToast('Прогресс загружен', 'text-brand-green');
      setImportData('');
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Неверный JSON';
      showToast(`Ошибка импорта: ${errorMsg}`, 'text-brand-red');
    }
  };

  return (
    <ModalShell isOpen={true} onClose={onClose} size="wide" showCloseButton>
      <ConfirmModal
        isOpen={showConfirm}
        title="Сбросить прогресс?"
        message="Это действие нельзя отменить. Вы уверены?"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowConfirm(false)}
      />
      <h2 className="text-brand-green mb-4 font-mono text-xl font-bold">DEV MENU</h2>

      {!authenticated ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="glass-input px-4 py-3"
          />
          <button
            type="submit"
            className="glass-button bg-brand-green/20 border-brand-green/30 text-brand-green py-3 font-bold"
          >
            Войти
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => addXP(100)} className="glass-button py-2 text-sm">
              +100 XP
            </button>
            <button onClick={() => addXP(1000)} className="glass-button py-2 text-sm">
              +1000 XP
            </button>
          </div>

          <button
            onClick={unlockAll}
            className="glass-button bg-brand-blue/10 border-brand-blue/30 text-brand-blue py-2 text-sm"
          >
            Открыть все уроки
          </button>

          <div className="my-1 h-[1px] bg-white/10"></div>

          <button onClick={exportProgress} className="glass-button py-2 text-sm">
            Копировать сохранение
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Вставить JSON..."
              className="glass-input min-w-0 flex-1 px-3 py-2 text-xs"
            />
            <button onClick={importProgress} className="glass-button shrink-0 px-4 py-2 text-xs">
              Загрузить
            </button>
          </div>

          <div className="my-1 h-[1px] bg-white/10"></div>

          <button
            onClick={resetProgress}
            className="glass-button bg-brand-red/10 border-brand-red/30 text-brand-red py-2 text-sm"
          >
            Сбросить весь прогресс
          </button>
        </div>
      )}
    </ModalShell>
  );
}
