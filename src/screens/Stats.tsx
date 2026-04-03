import { useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import { ACHIEVEMENTS } from '../data/achievements';
import { LESSON_META } from '../data/lesson_meta';
import { APP_STATE_STORAGE_KEY, initialState, useAppStore } from '../store';
import { getLevelInfo } from '../utils';

export function Stats() {
  const { state, navigate, updateState, showToast } = useAppStore();
  const lvl = getLevelInfo(state.totalXP);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[600px] p-6 pb-10">
      <ConfirmModal
        isOpen={showConfirm}
        title="Сбросить прогресс?"
        message="Это действие нельзя отменить. Вы уверены?"
        onConfirm={() => {
          localStorage.removeItem(APP_STATE_STORAGE_KEY);
          updateState(initialState);
          setShowConfirm(false);
          navigate('splash');
          showToast('Прогресс сброшен', 'text-brand-green');
        }}
        onCancel={() => setShowConfirm(false)}
      />
      <div className="mb-6 flex items-center gap-3">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>
          ← Назад
        </button>
        <h2 className="text-[22px] font-extrabold text-white">📊 Статистика</h2>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {[
          { icon: '⚡', label: 'Всего XP', value: state.totalXP, color: 'text-brand-amber' },
          {
            icon: '🎯',
            label: 'Уровень',
            value: `${lvl.level} — ${lvl.name}`,
            color: 'text-brand-green',
          },
          {
            icon: '✅',
            label: 'Уроков пройдено',
            value: `${state.completedLessons.length} / ${LESSON_META.length}`,
            color: 'text-brand-blue',
          },
          {
            icon: '🏆',
            label: 'Рекорд экзамена',
            value: state.examBestScore ? `${state.examBestScore}%` : '—',
            color: 'text-brand-red',
          },
          {
            icon: '🔥',
            label: 'Серия дней',
            value: state.dailyStreak || 0,
            color: 'text-brand-purple',
          },
          {
            icon: '💎',
            label: 'Достижений',
            value: `${state.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`,
            color: 'text-brand-amber',
          },
          {
            icon: '🎯',
            label: 'Точность ответов',
            value: `${state.totalQuestionsAnswered > 0 ? Math.round((state.totalCorrect / state.totalQuestionsAnswered) * 100) : 0}%`,
            color: 'text-brand-blue',
          },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-3.5 text-center">
            <div className="mb-1 text-[22px]">{s.icon}</div>
            <div className={`font-mono text-lg font-extrabold break-words ${s.color}`}>
              {s.value}
            </div>
            <div className="mt-1 text-[10px] tracking-[1px] text-slate-300 uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel mb-5 p-4">
        <div className="mb-2.5 font-mono text-[11px] tracking-[2px] text-slate-300">
          ПРОГРЕСС УРОВНЯ
        </div>
        <div className="mb-2 flex justify-between text-[13px]">
          <span className="font-bold text-white">{lvl.name}</span>
          <span className="text-slate-300">
            {lvl.xpInLevel} / {lvl.xpToNext} XP
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-black/30">
          <div
            className="bg-brand-amber h-full rounded-full transition-all duration-500"
            style={{ width: `${lvl.pct}%` }}
          ></div>
        </div>
      </div>

      <div className="glass-panel mb-5 p-4">
        <div className="mb-3 font-mono text-[11px] tracking-[2px] text-slate-300">
          ПРОГРЕСС ПО УРОКАМ
        </div>
        {LESSON_META.map((l) => {
          const done = state.completedLessons.includes(l.id);
          return (
            <div
              key={l.id}
              className="flex items-center gap-2.5 border-b border-white/10 py-2 last:border-0"
            >
              <span className="text-lg">{done ? l.icon : '⬜'}</span>
              <span className={`flex-1 text-[13px] ${done ? 'text-white' : 'text-slate-400'}`}>
                {l.title}
              </span>
              {done ? (
                <span className="text-brand-green text-xs font-bold">✓</span>
              ) : (
                <span className="text-xs text-slate-500">—</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="glass-button bg-brand-red/10 border-brand-red/30 text-brand-red w-full py-3.5 font-bold"
        onClick={() => setShowConfirm(true)}
      >
        🗑️ Сбросить прогресс
      </button>
    </div>
  );
}
