import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { loadPracticeTaskById } from '../data/content_loaders';
import {
  PracticeBug,
  PracticeCheckItem,
  PracticeField,
  PracticeSeverity,
  type PracticeTask as PracticeTaskType,
} from '../types';
import confetti from 'canvas-confetti';
import {
  finalizePracticeTaskResult,
  getAchievementUnlockTitles,
  getPracticeCriteriaCount,
} from '../domain/progression';

export default function PracticeTask({ id }: { id: string }) {
  const { state, updateState, navigate, showToast } = useAppStore();

  const [task, setTask] = useState<PracticeTaskType | null>(null);
  const [answered, setAnswered] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    setTask(null);
    setLoadError(null);
    setAnswered(false);
    setSelections({});
    setSelectedErrors(new Set());
    setFormValues({});
    setCorrectCount(0);

    let isMounted = true;

    void loadPracticeTaskById(id)
      .then((loadedTask) => {
        if (!isMounted) {
          return;
        }

        if (!loadedTask) {
          setTask(null);
          setLoadError('Практическое задание не найдено.');
          return;
        }

        setTask(loadedTask);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load practice task:', error);
        setTask(null);
        setLoadError('Не удалось загрузить практическое задание. Попробуй снова.');
        showToast('Ошибка загрузки практики', 'text-brand-red');
      });

    return () => {
      isMounted = false;
    };
  }, [id, showToast]);

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[600px] flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel w-full p-6">
          <div className="mb-3 text-4xl">⚠️</div>
          <div className="mb-4 text-sm leading-relaxed text-slate-300">{loadError}</div>
          <button
            type="button"
            className="glass-button w-full py-3 font-bold uppercase"
            onClick={() => navigate('practice')}
          >
            ← К заданиям
          </button>
        </div>
      </div>
    );
  }

  const handleToggleError = (fieldId: string) => {
    if (answered) return;

    setSelectedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  if (!task) {
    return (
      <div className="p-10 text-center text-slate-400">Подготавливаем практическое задание...</div>
    );
  }

  const alreadyCompleted = state.completedPractice?.includes(task.id) ?? false;

  const finishTask = (passed: boolean) => {
    const result = finalizePracticeTaskResult(state, {
      taskId: task.id,
      taskXP: task.xp,
      passed,
    });

    updateState(result.nextState);

    for (const title of getAchievementUnlockTitles(result.unlockedAchievements)) {
      showToast(`🏆 Достижение: ${title}!`, 'text-brand-amber');
    }

    if (passed && result.awardedXP > 0) {
      showToast(`Задание выполнено! +${result.awardedXP} XP`, 'text-brand-green');
    } else if (passed) {
      showToast('Задание уже было зачтено ранее. XP больше не начисляется.', 'text-brand-amber');
    } else {
      showToast('Попробуй ещё раз!', 'text-brand-amber');
    }
    navigate('practice');
  };

  const handleCheck = () => {
    if (answered) {
      const pct = Math.round((correctCount / getPracticeCriteriaCount(task)) * 100);
      const passed = pct >= 60;
      finishTask(passed);
      return;
    }

    let correct = 0;
    if (task.type === 'triage') {
      task.bugs.forEach((b: PracticeBug) => {
        if (selections[b.id] === b.correct) correct++;
      });
    } else if (task.type === 'find_error') {
      task.fields.forEach((f: PracticeField) => {
        if (f.hasError && selectedErrors.has(f.id)) correct++;
      });
    } else if (task.type === 'write_test' || task.type === 'bug_report') {
      task.checkItems.forEach((item: PracticeCheckItem) => {
        try {
          if (item.check(formValues)) correct++;
        } catch {
          // Ignore invalid intermediate input while validating free-form answers.
        }
      });
    }

    setCorrectCount(correct);
    setAnswered(true);

    const pct = Math.round((correct / getPracticeCriteriaCount(task)) * 100);
    if (pct >= 60) confetti();
  };

  const renderTriage = (task: Extract<PracticeTaskType, { type: 'triage' }>) => {
    const allDone = task.bugs.every((b: PracticeBug) => selections[b.id]);
    const pct = answered ? Math.round((correctCount / task.bugs.length) * 100) : 0;
    const passed = pct >= 60;

    return (
      <>
        <div className="mb-3 font-mono text-xs text-slate-400">
          Расставь severity для каждого бага
        </div>
        <div className="glass-panel mb-4 border-amber-500/30 bg-amber-500/10 p-4 text-[13px] leading-relaxed text-slate-300">
          <div className="text-brand-amber mb-2 font-mono text-[10px] font-bold tracking-[2px]">
            📋 ЗАДАНИЕ
          </div>
          {task.desc}
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          {task.bugs.map((bug: PracticeBug) => {
            const sel = selections[bug.id];
            const isCorrect = sel === bug.correct;
            return (
              <div key={bug.id} className="glass-panel p-4">
                <div className="mb-3 text-[13px] leading-relaxed font-semibold text-white">
                  🐛 {bug.desc}
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.severities.map((sev: PracticeSeverity) => {
                    const isSelected = sel === sev.key;
                    return (
                      <button
                        key={sev.key}
                        disabled={answered}
                        onClick={() => setSelections({ ...selections, [bug.id]: sev.key })}
                        className={`rounded-lg border-[1.5px] px-3 py-1.5 font-mono text-[11px] font-bold backdrop-blur-sm transition-all ${isSelected ? 'opacity-100' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        style={
                          isSelected
                            ? {
                                backgroundColor: `${sev.color}25`,
                                borderColor: sev.color,
                                color: sev.color,
                              }
                            : undefined
                        }
                      >
                        {sev.label}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div
                    className={`mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed backdrop-blur-sm ${isCorrect ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}
                  >
                    {isCorrect
                      ? '✅ Верно! '
                      : `❌ Правильно: ${bug.correct.charAt(0).toUpperCase() + bug.correct.slice(1)} — `}
                    {bug.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-4 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${passed ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
          >
            <div
              className={`mb-1 font-extrabold ${passed ? 'text-brand-green' : 'text-brand-red'}`}
            >
              {passed
                ? alreadyCompleted
                  ? `🎯 ${correctCount}/${task.bugs.length} верно! Задание уже было зачтено ранее.`
                  : `🎯 ${correctCount}/${task.bugs.length} верно! +${task.xp} XP`
                : `💪 ${correctCount}/${task.bugs.length} верно. Повтори урок о severity!`}
            </div>
            <div className="text-slate-300">
              Critical = система неработоспособна. Major = важная функция сломана. Minor = работает,
              но с проблемами. Trivial = косметика.
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            disabled={!allDone && !answered}
            onClick={handleCheck}
            className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${allDone || answered ? (answered ? (passed ? 'bg-brand-green/80 border-brand-green/50 hover:bg-brand-green text-white' : 'bg-brand-red/80 border-brand-red/50 hover:bg-brand-red text-white') : 'bg-brand-amber/80 border-brand-amber/50 hover:bg-brand-amber text-white') : 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500'}`}
            style={{ backgroundColor: allDone && !answered ? task.color : undefined }}
          >
            {answered ? '← К заданиям' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </>
    );
  };

  const renderFindError = (task: Extract<PracticeTaskType, { type: 'find_error' }>) => {
    const errorCount = task.fields.filter((f: PracticeField) => f.hasError).length;
    const selected = selectedErrors.size;
    const ready = selected === errorCount;
    const pct = answered ? Math.round((correctCount / errorCount) * 100) : 0;
    const passed = pct >= 60;

    return (
      <>
        <div className="mb-3 font-mono text-xs text-slate-400">
          Нажми на поля с ошибками (Выбрано: {selected} / {errorCount})
        </div>
        <div className="glass-panel mb-4 border-amber-500/30 bg-amber-500/10 p-4 text-[13px] leading-relaxed text-slate-300">
          <div className="text-brand-amber mb-1.5 font-mono text-[10px] font-bold tracking-[2px]">
            📋 ЗАДАНИЕ
          </div>
          {task.desc}
          <div className="mt-1.5 font-mono text-[11px] text-slate-400">
            Контекст: {task.context}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {task.fields.map((field: PracticeField) => {
            const isSelected = selectedErrors.has(field.id);
            let bg = 'bg-white/5';
            let border = 'border-white/10';

            if (answered) {
              if (field.hasError && isSelected) {
                bg = 'bg-brand-green/10';
                border = 'border-brand-green/50';
              } else if (field.hasError && !isSelected) {
                bg = 'bg-brand-red/10';
                border = 'border-brand-red/50';
              } else if (!field.hasError && isSelected) {
                bg = 'bg-brand-red/10';
                border = 'border-brand-red/50';
              }
            } else if (isSelected) {
              bg = 'bg-brand-amber/10';
              border = 'border-brand-amber/50';
            }

            return (
              <div
                key={field.id}
                onClick={() => handleToggleError(field.id)}
                className={`cursor-pointer rounded-2xl border-[1.5px] p-3.5 backdrop-blur-md transition-all select-none ${bg} ${border} ${!answered && !isSelected && 'hover:border-white/20 hover:bg-white/10'}`}
              >
                <div className="mb-1 font-mono text-[10px] tracking-[1px] text-slate-400 uppercase">
                  {field.label}
                </div>
                <div className="text-[13px] leading-relaxed font-semibold whitespace-pre-line text-white">
                  {field.value}
                </div>

                {answered && field.hasError && isSelected && (
                  <div className="text-brand-green mt-2 text-xs leading-relaxed">
                    ✅ Верно! {field.errorExp}
                  </div>
                )}
                {answered && field.hasError && !isSelected && (
                  <div className="text-brand-red mt-2 text-xs leading-relaxed">
                    ❌ Пропустил! {field.errorExp}
                  </div>
                )}
                {answered && !field.hasError && isSelected && (
                  <div className="text-brand-red mt-2 text-xs leading-relaxed">
                    ❌ Здесь ошибки нет
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-4 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${passed ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
          >
            <div className={`font-extrabold ${passed ? 'text-brand-green' : 'text-brand-red'}`}>
              {passed
                ? alreadyCompleted
                  ? `🔍 Молодец! Нашёл ${correctCount}/${errorCount} ошибок. Задание уже было зачтено ранее.`
                  : `🔍 Молодец! Нашёл ${correctCount}/${errorCount} ошибок. +${task.xp} XP`
                : `💪 Найдено ${correctCount}/${errorCount}. Читай объяснения выше!`}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button
            disabled={!ready && !answered}
            onClick={handleCheck}
            className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${ready || answered ? (answered ? (passed ? 'bg-brand-green/80 border-brand-green/50 hover:bg-brand-green text-white' : 'bg-brand-red/80 border-brand-red/50 hover:bg-brand-red text-white') : 'bg-brand-amber/80 border-brand-amber/50 hover:bg-brand-amber text-white') : 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500'}`}
            style={{ backgroundColor: ready && !answered ? task.color : undefined }}
          >
            {answered ? '← К заданиям' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </>
    );
  };

  const renderWriteTest = (
    task: Extract<PracticeTaskType, { type: 'write_test' | 'bug_report' }>
  ) => {
    const filled =
      Object.values(formValues).filter((x) => typeof x === 'string' && x.trim().length > 5)
        .length >= 3;
    const pct = answered ? Math.round((correctCount / task.checkItems.length) * 100) : 0;
    const passed = pct >= 60;

    const fields =
      task.type === 'write_test'
        ? [
            {
              key: 'title',
              label: 'Название тест-кейса',
              placeholder: 'Напиши конкретное название...',
              multi: false,
            },
            {
              key: 'precond',
              label: 'Предусловие',
              placeholder: 'Что должно быть выполнено до начала теста...',
              multi: true,
            },
            {
              key: 'steps',
              label: 'Шаги выполнения',
              placeholder: '1. ...\n2. ...\n3. ...',
              multi: true,
            },
            {
              key: 'expected',
              label: 'Ожидаемый результат',
              placeholder: 'Что должно произойти после шагов...',
              multi: true,
            },
          ]
        : [
            {
              key: 'title',
              label: 'Заголовок баг-репорта',
              placeholder: '[Модуль] Краткое описание проблемы',
              multi: false,
            },
            {
              key: 'steps',
              label: 'Шаги воспроизведения',
              placeholder: '1. ...\n2. ...\n3. ...',
              multi: true,
            },
            {
              key: 'actual',
              label: 'Фактический результат',
              placeholder: 'Что произошло на самом деле...',
              multi: true,
            },
            {
              key: 'expected',
              label: 'Ожидаемый результат',
              placeholder: 'Что должно было произойти...',
              multi: true,
            },
          ];

    return (
      <>
        <div className="mb-3 font-mono text-xs text-slate-400">
          {task.type === 'write_test'
            ? 'Составь тест-кейс по требованию'
            : 'Напиши баг-репорт по описанию'}
        </div>
        <div className="glass-panel mb-4 border-amber-500/30 bg-amber-500/10 p-4 text-[13px] leading-relaxed text-slate-300">
          <div className="text-brand-amber mb-1.5 font-mono text-[10px] font-bold tracking-[2px]">
            {task.type === 'write_test' ? '📄 ТРЕБОВАНИЕ' : '🔍 СЦЕНАРИЙ'}
          </div>
          {task.type === 'write_test' ? task.requirement : task.scenario}
        </div>

        <div className="flex flex-1 flex-col gap-3.5">
          {fields.map((f) => (
            <div key={f.key}>
              <div className="mb-1.5 font-mono text-[10px] tracking-[2px] text-slate-400 uppercase">
                {f.label}
              </div>
              {f.multi ? (
                <textarea
                  disabled={answered}
                  placeholder={f.placeholder}
                  rows={3}
                  value={formValues[f.key] || ''}
                  onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                  className="glass-input focus:border-brand-purple w-full resize-y p-3 font-sans text-[13px] font-medium text-white transition-colors outline-none disabled:opacity-60"
                />
              ) : (
                <input
                  disabled={answered}
                  placeholder={f.placeholder}
                  value={formValues[f.key] || ''}
                  onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                  className="glass-input focus:border-brand-purple w-full p-3 font-sans text-[13px] font-medium text-white transition-colors outline-none disabled:opacity-60"
                />
              )}
            </div>
          ))}
        </div>

        {answered && (
          <>
            <div className="glass-panel mt-4 p-4">
              <div className="mb-2.5 font-mono text-[10px] tracking-[2px] text-slate-400">
                КРИТЕРИИ ПРОВЕРКИ
              </div>
              {task.checkItems.map((item: PracticeCheckItem, i: number) => {
                let ok = false;
                try {
                  ok = item.check(formValues);
                } catch {
                  // Keep criterion as failed if the validation helper throws.
                }
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 border-b border-white/10 py-1.5 text-xs leading-relaxed last:border-0"
                  >
                    <span className="mt-0.5 shrink-0">{ok ? '✅' : '❌'}</span>
                    <span className={ok ? 'text-brand-green' : 'text-brand-red'}>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="glass-panel bg-brand-green/5 border-brand-green/20 mt-3 p-4">
              <div className="text-brand-green mb-2.5 font-mono text-[10px] tracking-[2px]">
                💡 ЭТАЛОННЫЙ ОТВЕТ
              </div>
              <div className="text-xs leading-relaxed text-slate-300">
                {task.type === 'write_test' ? (
                  <>
                    <b className="text-white">Название:</b> {task.solution.title}
                    <br />
                    <br />
                    <b className="text-white">Предусловие:</b> {task.solution.precondition}
                    <br />
                    <br />
                    <b className="text-white">Шаги:</b>
                    <br />
                    {(task.solution?.steps || []).map((s: string, i: number) => (
                      <span key={i}>
                        {i + 1}. {s}
                        <br />
                      </span>
                    ))}
                    <br />
                    <b className="text-white">Ожидаемый результат:</b> {task.solution?.expected}
                  </>
                ) : (
                  <>
                    <b className="text-white">Заголовок:</b> {task.solution?.title}
                    <br />
                    <br />
                    <b className="text-white">Шаги:</b>
                    <br />
                    {(task.solution?.steps || []).map((s: string, i: number) => (
                      <span key={i}>
                        {i + 1}. {s}
                        <br />
                      </span>
                    ))}
                    <br />
                    <b className="text-white">Факт:</b> {task.solution?.actual}
                    <br />
                    <br />
                    <b className="text-white">Ожидание:</b> {task.solution?.expected}
                    <br />
                    <br />
                    <b className="text-white">Severity:</b> {task.solution?.severity}
                  </>
                )}
              </div>
            </div>

            <div
              className={`mt-4 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${passed ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
            >
              <div className={`font-extrabold ${passed ? 'text-brand-green' : 'text-brand-red'}`}>
                {passed
                  ? alreadyCompleted
                    ? `✅ Отлично! ${correctCount}/${task.checkItems.length} критериев выполнено. Задание уже было зачтено ранее.`
                    : `✅ Отлично! ${correctCount}/${task.checkItems.length} критериев выполнено. +${task.xp} XP`
                  : `💪 ${correctCount}/${task.checkItems.length} критериев. Сравни с эталоном ↑`}
              </div>
            </div>
          </>
        )}

        <div className="mt-4">
          <button
            disabled={!filled && !answered}
            onClick={handleCheck}
            className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${filled || answered ? (answered ? (passed ? 'bg-brand-green/80 border-brand-green/50 hover:bg-brand-green text-white' : 'bg-brand-amber/80 border-brand-amber/50 hover:bg-brand-amber text-white') : 'bg-brand-purple/80 border-brand-purple/50 hover:bg-brand-purple text-white') : 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500'}`}
            style={{ backgroundColor: filled && !answered ? task.color : undefined }}
          >
            {answered ? '← К заданиям' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="solid-header p-3">
        <div className="mx-auto flex max-w-[600px] items-center gap-3">
          <button
            onClick={() => navigate('practice')}
            className="p-1 text-xl text-slate-300 transition-colors hover:text-white"
          >
            ✕
          </button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/5 bg-black/30">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: answered ? '100%' : '0%', backgroundColor: task.color }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col p-5">
        <div className="mb-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold tracking-[0.5px] backdrop-blur-sm"
            style={{
              backgroundColor: `${task.color}18`,
              color: task.color,
              borderColor: `${task.color}30`,
            }}
          >
            {task.icon} {task.title}
          </span>
        </div>

        {task.type === 'triage' && renderTriage(task)}
        {task.type === 'find_error' && renderFindError(task)}
        {(task.type === 'write_test' || task.type === 'bug_report') && renderWriteTest(task)}
      </div>
    </div>
  );
}
