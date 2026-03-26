import { useMemo } from 'react';
import { useAppStore } from '../store';
import { PRACTICE_TASKS } from '../data';

export default function Practice() {
  const { state, navigate } = useAppStore();

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
      
      <div className="space-y-5">
        {Object.entries(groupedTasks).map(([type, tasks]) => {
          const typedTasks = tasks as typeof PRACTICE_TASKS[number][];

          return (
          <div key={type} className="glass-panel p-5">
            <div className="text-[15px] font-bold mb-4 text-white">{typeLabels[type]}</div>
            <div className="grid grid-cols-2 gap-3">
              {typedTasks.map(task => {
                const done = state.completedPractice.includes(task.id);
                return (
                  <button 
                    key={task.id} 
                    onClick={() => navigate('practice_task', task.id)}
                    type="button"
                    className={`interactive-card p-3.5 rounded-xl text-left duration-200 ${done ? 'bg-brand-green/10 border border-brand-green/30' : 'bg-white/5 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10'} cursor-pointer`}
                  >
                    <div className="text-[13px] font-bold text-white mb-1">#{task.id.split('-')[1]}</div>
                    <div className="text-[11px] text-slate-300 truncate">{task.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1">{task.xp} XP</div>
                    {done && <div className="text-[8px] text-brand-green font-bold mt-1">ГОТОВО ✓</div>}
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
