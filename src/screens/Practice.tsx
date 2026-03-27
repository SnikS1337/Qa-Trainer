import { useMemo } from 'react';
import { useAppStore } from '../store';
import { PRACTICE_TASKS } from '../data';

export default function Practice() {
  const { state, navigate } = useAppStore();

  const typeIcons: Record<string, string> = {
    triage: '🔴',
    find_error: '🔍',
    write_test: '✍️',
    bug_report: '📝',
  };

  const typeColors: Record<string, string> = {
    triage: '#f87171',
    find_error: '#60a5fa',
    write_test: '#a78bfa',
    bug_report: '#34d399',
  };

  const typeLabels: Record<string, string> = { 
    triage: '🔴 Расстановка severity', 
    find_error: '🔍 Найди ошибки', 
    write_test: '✍️ Напиши тест-кейс', 
    bug_report: '📝 Напиши баг-репорт' 
  };

  const groupedTasks = useMemo(() => PRACTICE_TASKS.reduce((acc, task) => {
    if (!acc[task.type]) acc[task.type] = [];
    acc[task.type].push(task);
    return acc;
  }, {} as Record<string, typeof PRACTICE_TASKS[number][]>), []);

  return (
    <div className="max-w-[600px] mx-auto p-6 pb-10 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>← Назад</button>
        <h2 className="text-[22px] font-extrabold text-white">🛠️ Практика</h2>
      </div>
      
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([type, tasks]) => {
          const typedTasks = tasks as typeof PRACTICE_TASKS[number][];
          const completedCount = typedTasks.filter(task => state.completedPractice.includes(task.id)).length;
          const accent = typeColors[type] || '#94a3b8';

          return (
          <div key={type} className="mb-7">
            <div className="font-mono text-[10px] text-white tracking-[3px] uppercase mb-3 flex items-center gap-2">
              <span className="flex-1 h-[1px] bg-white/20"></span>
              <span>{typeIcons[type]} {typeLabels[type]}</span>
              <span className="text-[9px] text-slate-300 font-bold tracking-normal">{completedCount}/{typedTasks.length}</span>
              <span className="flex-1 h-[1px] bg-white/20"></span>
            </div>

            <div className="space-y-3">
              {typedTasks.map(task => {
                const done = state.completedPractice.includes(task.id);
                return (
                  <button 
                    key={task.id} 
                    onClick={() => navigate('practice_task', task.id)}
                    type="button"
                    className={`glass-panel soft-hover group w-full p-4 relative overflow-hidden text-left ${done ? 'border-opacity-60 cursor-pointer' : 'cursor-pointer'}`}
                    style={{ borderColor: done ? `${accent}55` : 'rgba(255,255,255,0.12)' }}
                  >
                    <div className="card-frame is-active"></div>
                    {done && (
                      <div className="absolute top-0 right-0 text-black text-[9px] font-extrabold px-2.5 py-1 rounded-bl-xl tracking-[1px] font-mono" style={{ backgroundColor: accent }}>
                        ГОТОВО ✓
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 bg-black/20" style={{ borderColor: `${accent}55` }}>
                        {task.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm mb-0.5 text-white">{task.title}</div>
                        <div className="text-xs text-slate-300 mb-2 truncate">{task.desc}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-300 font-mono">Практика</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-mono border" style={{ borderColor: `${accent}55`, color: accent, backgroundColor: `${accent}20` }}>
                            +{task.xp} XP
                          </span>
                        </div>
                      </div>
                      <div className="text-lg shrink-0" style={{ color: accent }}>›</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
