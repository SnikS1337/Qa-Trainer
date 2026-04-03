import { ACHIEVEMENTS } from '../data/achievements';
import { useAppStore } from '../store';

export function Achievements() {
  const { state, navigate } = useAppStore();
  const earned = state.unlockedAchievements;

  return (
    <div className="mx-auto w-full max-w-[600px] p-6 pb-10">
      <div className="mb-6 flex items-center gap-3">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>
          ← Назад
        </button>
        <h2 className="text-[22px] font-extrabold text-white">🏆 Достижения</h2>
      </div>

      <div className="mb-3 text-[13px] text-slate-300">
        {earned.length} из {ACHIEVEMENTS.length} разблокировано
      </div>

      <div className="flex flex-col gap-2.5">
        {ACHIEVEMENTS.map((a) => {
          const done = earned.includes(a.id);
          return (
            <div
              key={a.id}
              className={`glass-panel flex items-center gap-3.5 p-3.5 ${done ? 'border-amber-500/30 bg-amber-500/10 opacity-100' : 'opacity-50'}`}
            >
              <div className={`text-[34px] ${done ? '' : 'grayscale'}`}>{a.icon}</div>
              <div className="flex-1">
                <div className={`font-bold ${done ? 'text-brand-amber' : 'text-white'}`}>
                  {a.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-300">{a.desc}</div>
              </div>
              <div className={`text-lg ${done ? 'text-brand-amber' : 'text-slate-500'}`}>
                {done ? '✓' : '?'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
