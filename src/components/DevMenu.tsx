import React, { useState } from 'react';
import { useAppStore, initialState } from '../store';
import { LESSONS } from '../data';
import ConfirmModal from './ConfirmModal';

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
    updateState(prev => ({ totalXP: prev.totalXP + amount, isCheater: true }));
    showToast(`Добавлено ${amount} XP`, 'text-brand-green');
  };

  const unlockAll = () => {
    updateState({ completedLessons: LESSONS.map(l => l.id), isCheater: true });
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
      updateState({ ...parsed, isCheater: true });
      showToast('Прогресс загружен', 'text-brand-green');
      setImportData('');
    } catch (e) {
      showToast('Ошибка импорта (неверный JSON)', 'text-brand-red');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <ConfirmModal 
        isOpen={showConfirm} 
        title="Сбросить прогресс?" 
        message="Это действие нельзя отменить. Вы уверены?" 
        onConfirm={handleConfirmReset} 
        onCancel={() => setShowConfirm(false)} 
      />
      <div className="glass-panel w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl transition-colors">✕</button>
        
        <h2 className="text-xl font-bold mb-4 font-mono text-brand-green">DEV MENU</h2>

        {!authenticated ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Пароль"
              className="glass-input px-4 py-3"
              autoFocus
            />
            <button type="submit" className="glass-button bg-brand-green/20 border-brand-green/30 text-brand-green font-bold py-3">Войти</button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addXP(100)} className="glass-button py-2 text-sm">+100 XP</button>
              <button onClick={() => addXP(1000)} className="glass-button py-2 text-sm">+1000 XP</button>
            </div>
            
            <button onClick={unlockAll} className="glass-button bg-brand-blue/10 border-brand-blue/30 text-brand-blue py-2 text-sm">
              Открыть все уроки
            </button>
            
            <div className="h-[1px] bg-white/10 my-1"></div>

            <button onClick={exportProgress} className="glass-button py-2 text-sm">
              Копировать сохранение
            </button>

            <div className="flex gap-2">
              <input 
                type="text" 
                value={importData}
                onChange={e => setImportData(e.target.value)}
                placeholder="Вставить JSON..."
                className="glass-input px-3 py-2 text-xs flex-1 min-w-0"
              />
              <button onClick={importProgress} className="glass-button px-4 py-2 text-xs shrink-0">
                Загрузить
              </button>
            </div>

            <div className="h-[1px] bg-white/10 my-1"></div>

            <button onClick={resetProgress} className="glass-button bg-brand-red/10 border-brand-red/30 text-brand-red py-2 text-sm">
              Сбросить весь прогресс
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
