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

  return (
    <div className="max-w-[600px] mx-auto p-6 pb-10 w-full">
      <div className="flex items-center gap-3 mb-2">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>← Назад</button>
        <h2 className="text-[22px] font-extrabold text-white">🛠️ Практика</h2>
      </div>
      <p className="text-[13px] text-slate-300 mb-5 leading-relaxed">Реальные сценарии из работы тестировщика. Применяй знания на практике.</p>

      <div className="flex flex-col gap-3">
        {PRACTICE_TASKS.map((task, idx) => {
          const done = state.completedPractice?.includes(task.id);
          
          return (
            <div 
              key={task.id}
              onClick={() => navigate('practice-task', task.id)}
              className={`glass-panel p-4 cursor-pointer relative overflow-hidden transition-all duration-200 hover:translate-x-1 ${done ? 'opacity-70' : ''}`}
            >
              {done && (
                <div className="absolute top-0 right-0 text-black text-[9px] font-extrabold px-2.5 py-1 rounded-bl-xl tracking-[1px] font-mono" style={{ backgroundColor: task.color }}>
                  ПРОЙДЕНО ✓
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl border-[1.5px] flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${task.color}18`, borderColor: `${task.color}40` }}>
                  {task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm mb-0.5 text-white">{task.title}</div>
                  <div className="text-xs text-slate-300 mb-1.5 truncate">{task.desc}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono" style={{ color: task.color }}>{typeLabels[task.type] || task.type}</span>
                    <span className="text-slate-600">·</span>
                    <span className="bg-gradient-to-br from-amber-500 to-amber-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">+{task.xp} XP</span>
                  </div>
                </div>
                <div className="text-lg shrink-0" style={{ color: task.color }}>›</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
