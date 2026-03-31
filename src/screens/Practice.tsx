import { useEffect, type KeyboardEvent } from 'react';
import { useAppStore } from '../store';
import { preloadPracticeTasksContent } from '../data/content_loaders';
import { PRACTICE_TASK_META } from '../data/practice_task_meta';

export default function Practice() {
  const { state, navigate } = useAppStore();

  const handleKeyboardActivation = (
    event: KeyboardEvent<HTMLElement>,
    action: () => void
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    action();
  };

  useEffect(() => {
    preloadPracticeTasksContent();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const typeLabels: Record<string, string> = {
    triage: '🔴 Расстановка severity',
    find_error: '🔍 Найди ошибки',
    write_test: '✍️ Напиши тест-кейс',
    bug_report: '📝 Напиши баг-репорт',
  };

  return (
    <div className="mx-auto w-full max-w-[600px] p-6 pb-10">
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          className="glass-button px-3.5 py-2 text-[13px]"
          onClick={() => navigate('home')}
        >
          ← Назад
        </button>
        <h2 className="text-[22px] font-extrabold text-white">🛠️ Практика</h2>
      </div>
      <p className="mb-5 text-[13px] leading-relaxed text-slate-300">
        Реальные сценарии из работы тестировщика. Применяй знания на практике.
      </p>

      <div className="flex flex-col gap-3">
        {PRACTICE_TASK_META.map((task) => {
          const done = state.completedPractice?.includes(task.id);

          return (
            <div
              key={task.id}
              onClick={() => navigate('practice-task', task.id)}
              onKeyDown={(event) =>
                handleKeyboardActivation(event, () => navigate('practice-task', task.id))
              }
              role="button"
              tabIndex={0}
              className={`glass-panel relative cursor-pointer overflow-hidden p-4 transition-all duration-200 hover:translate-x-1 ${done ? 'opacity-70' : ''}`}
            >
              {done && (
                <div className="status-ribbon text-black" style={{ ['--status-bg' as string]: task.color }}>
                  ПРОЙДЕНО ✓
                </div>
              )}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-[1.5px] text-2xl"
                  style={{ backgroundColor: `${task.color}18`, borderColor: `${task.color}40` }}
                >
                  {task.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 text-sm font-bold text-white">{task.title}</div>
                  <div className="mb-1.5 truncate text-xs text-slate-300">{task.desc}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold" style={{ color: task.color }}>
                      {typeLabels[task.type] || task.type}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="rounded-full bg-gradient-to-br from-amber-500 to-amber-600 px-2 py-0.5 font-mono text-[10px] font-bold text-black">
                      +{task.xp} XP
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-lg" style={{ color: task.color }}>
                  ›
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
