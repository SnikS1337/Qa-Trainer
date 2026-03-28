import { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { PRACTICE_TASKS, ACHIEVEMENTS } from '../data';
import { AppState, PracticeBug, PracticeCheckItem, PracticeField, PracticeSeverity, PracticeTask as PracticeTaskType } from '../types';
import confetti from 'canvas-confetti';

export default function PracticeTask({ id }: { id: string }) {
  const { updateState, navigate, showToast } = useAppStore();
  const task = PRACTICE_TASKS.find((t): t is PracticeTaskType => t.id === id);

  const [answered, setAnswered] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [selectedErrors, setSelectedErrors] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const toggleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    return () => {
      if (toggleTimerRef.current) {
        clearTimeout(toggleTimerRef.current);
        toggleTimerRef.current = null;
      }
    };
  }, []);

  if (!task) return null;

  // Debounced toggle handler to prevent race conditions
  const handleToggleError = useCallback((fieldId: string) => {
    if (answered || isProcessing) return;

    if (toggleTimerRef.current) {
      clearTimeout(toggleTimerRef.current);
    }

    setIsProcessing(true);
    toggleTimerRef.current = setTimeout(() => {
      setSelectedErrors(prev => {
        const newSet = new Set(prev);
        if (newSet.has(fieldId)) {
          newSet.delete(fieldId);
        } else {
          newSet.add(fieldId);
        }
        return newSet;
      });
      setIsProcessing(false);
      toggleTimerRef.current = null;
    }, 50); // 50ms debounce
  }, [answered, isProcessing]);

  const checkAchievements = (newState: AppState) => {
    ACHIEVEMENTS.forEach(a => {
      if (!newState.unlockedAchievements.includes(a.id) && a.check(newState)) {
        newState.unlockedAchievements.push(a.id);
        showToast(`🏆 Достижение: ${a.title}!`, 'text-brand-amber');
      }
    });
  };

  const finishTask = (passed: boolean, xp: number) => {
    updateState(prev => {
      const s = { ...prev };
      s.totalXP += xp;
      if (!s.completedPractice) s.completedPractice = [];
      if (passed && !s.completedPractice.includes(task.id)) s.completedPractice.push(task.id);
      checkAchievements(s);
      return s;
    });
    showToast(passed ? `🛠️ Задание выполнено! +${xp} XP` : '📖 Попробуй ещё раз!', passed ? 'text-brand-green' : 'text-brand-amber');
    navigate('practice');
  };

  const getCriteriaCount = (practiceTask: PracticeTaskType) => {
    switch (practiceTask.type) {
      case 'triage':
        return practiceTask.bugs.length;
      case 'find_error':
        return practiceTask.fields.length;
      case 'write_test':
      case 'bug_report':
        return practiceTask.checkItems.length;
    }
  };

  const handleCheck = () => {
    if (answered) {
      const pct = Math.round((correctCount / getCriteriaCount(task)) * 100);
      const passed = pct >= 60;
      const xp = passed ? task.xp : Math.round(task.xp * 0.3);
      finishTask(passed, xp);
      return;
    }

    let correct = 0;
    if (task.type === 'triage') {
      task.bugs.forEach((b: PracticeBug) => { if (selections[b.id] === b.correct) correct++; });
    } else if (task.type === 'find_error') {
      task.fields.forEach((f: PracticeField) => { if (f.hasError && selectedErrors.has(f.id)) correct++; });
    } else if (task.type === 'write_test' || task.type === 'bug_report') {
      task.checkItems.forEach((item: PracticeCheckItem) => {
        try { if (item.check(formValues)) correct++; } catch {}
      });
    }

    setCorrectCount(correct);
    setAnswered(true);

    const pct = Math.round((correct / getCriteriaCount(task)) * 100);
    if (pct >= 60) confetti();
  };

  const renderTriage = (task: Extract<PracticeTaskType, { type: 'triage' }>) => {
    const allDone = task.bugs.every((b: PracticeBug) => selections[b.id]);
    const pct = answered ? Math.round((correctCount / task.bugs.length) * 100) : 0;
    const passed = pct >= 60;

    return (
      <>
        <div className="text-xs text-slate-400 mb-3 font-mono">Расставь severity для каждого бага</div>
        <div className="glass-panel bg-amber-500/10 border-amber-500/30 p-4 mb-4 text-[13px] leading-relaxed text-slate-300">
          <div className="text-[10px] text-brand-amber font-bold tracking-[2px] font-mono mb-2">📋 ЗАДАНИЕ</div>
          {task.desc}
        </div>

        <div className="flex-1 flex flex-col gap-2.5">
          {task.bugs.map((bug: PracticeBug) => {
            const sel = selections[bug.id];
            const isCorrect = sel === bug.correct;
            return (
              <div key={bug.id} className="glass-panel p-4">
                <div className="text-[13px] font-semibold text-white mb-3 leading-relaxed">🐛 {bug.desc}</div>
                <div className="flex flex-wrap gap-2">
                  {task.severities.map((sev: PracticeSeverity) => {
                    const isSelected = sel === sev.key;
                    return (
                      <button 
                        key={sev.key} 
                        disabled={answered}
                        onClick={() => setSelections({ ...selections, [bug.id]: sev.key })}
                        className={`border-[1.5px] rounded-lg px-3 py-1.5 text-[11px] font-bold font-mono transition-all backdrop-blur-sm ${isSelected ? 'opacity-100' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        style={isSelected ? { backgroundColor: `${sev.color}25`, borderColor: sev.color, color: sev.color } : undefined}
                      >
                        {sev.label}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className={`mt-3 text-xs px-3 py-2 rounded-lg leading-relaxed backdrop-blur-sm ${isCorrect ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'}`}>
                    {isCorrect ? '✅ Верно! ' : `❌ Правильно: ${bug.correct.charAt(0).toUpperCase() + bug.correct.slice(1)} — `}
                    {bug.hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {answered && (
          <div className={`mt-4 p-4 rounded-2xl text-[13px] leading-relaxed border-l-[3px] backdrop-blur-md ${passed ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}>
            <div className={`font-extrabold mb-1 ${passed ? 'text-brand-green' : 'text-brand-red'}`}>
              {passed ? `🎯 ${correctCount}/${task.bugs.length} верно! +${task.xp} XP` : `💪 ${correctCount}/${task.bugs.length} верно. Повтори урок о severity!`}
            </div>
            <div className="text-slate-300">Critical = система неработоспособна. Major = важная функция сломана. Minor = работает, но с проблемами. Trivial = косметика.</div>
          </div>
        )}

        <div className="mt-4">
          <button disabled={!allDone && !answered} onClick={handleCheck} className={`w-full font-bold py-4 rounded-xl uppercase tracking-wide transition-all backdrop-blur-md border ${allDone || answered ? (answered ? (passed ? 'bg-brand-green/80 border-brand-green/50 text-white hover:bg-brand-green' : 'bg-brand-red/80 border-brand-red/50 text-white hover:bg-brand-red') : 'bg-brand-amber/80 border-brand-amber/50 text-white hover:bg-brand-amber') : 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed'}`} style={{ backgroundColor: allDone && !answered ? task.color : undefined }}>
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
        <div className="text-xs text-slate-400 mb-3 font-mono">Нажми на поля с ошибками (Выбрано: {selected} / {errorCount})</div>
        <div className="glass-panel bg-amber-500/10 border-amber-500/30 p-4 mb-4 text-[13px] leading-relaxed text-slate-300">
          <div className="text-[10px] text-brand-amber font-bold tracking-[2px] font-mono mb-1.5">📋 ЗАДАНИЕ</div>
          {task.desc}
          <div className="mt-1.5 text-[11px] text-slate-400 font-mono">Контекст: {task.context}</div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          {task.fields.map((field: PracticeField) => {
            const isSelected = selectedErrors.has(field.id);
            let bg = 'bg-white/5';
            let border = 'border-white/10';

            if (answered) {
              if (field.hasError && isSelected) { bg = 'bg-brand-green/10'; border = 'border-brand-green/50'; }
              else if (field.hasError && !isSelected) { bg = 'bg-brand-red/10'; border = 'border-brand-red/50'; }
              else if (!field.hasError && isSelected) { bg = 'bg-brand-red/10'; border = 'border-brand-red/50'; }
            } else if (isSelected) {
              bg = 'bg-brand-amber/10'; border = 'border-brand-amber/50';
            }

            return (
              <div key={field.id} onClick={() => handleToggleError(field.id)} className={`border-[1.5px] rounded-2xl p-3.5 cursor-pointer transition-all select-none backdrop-blur-md ${bg} ${border} ${!answered && !isSelected && 'hover:border-white/20 hover:bg-white/10'}`}>
                <div className="text-[10px] text-slate-400 font-mono tracking-[1px] mb-1 uppercase">{field.label}</div>
                <div className="text-[13px] font-semibold leading-relaxed whitespace-pre-line text-white">{field.value}</div>
                
                {answered && field.hasError && isSelected && <div className="mt-2 text-xs text-brand-green leading-relaxed">✅ Верно! {field.errorExp}</div>}
                {answered && field.hasError && !isSelected && <div className="mt-2 text-xs text-brand-red leading-relaxed">❌ Пропустил! {field.errorExp}</div>}
                {answered && !field.hasError && isSelected && <div className="mt-2 text-xs text-brand-red leading-relaxed">❌ Здесь ошибки нет</div>}
              </div>
            );
          })}
        </div>

        {answered && (
          <div className={`mt-4 p-4 rounded-2xl text-[13px] leading-relaxed border-l-[3px] backdrop-blur-md ${passed ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}>
            <div className={`font-extrabold ${passed ? 'text-brand-green' : 'text-brand-red'}`}>
              {passed ? `🔍 Молодец! Нашёл ${correctCount}/${errorCount} ошибок. +${task.xp} XP` : `💪 Найдено ${correctCount}/${errorCount}. Читай объяснения выше!`}
            </div>
          </div>
        )}

        <div className="mt-4">
          <button disabled={!ready && !answered} onClick={handleCheck} className={`w-full font-bold py-4 rounded-xl uppercase tracking-wide transition-all backdrop-blur-md border ${ready || answered ? (answered ? (passed ? 'bg-brand-green/80 border-brand-green/50 text-white hover:bg-brand-green' : 'bg-brand-red/80 border-brand-red/50 text-white hover:bg-brand-red') : 'bg-brand-amber/80 border-brand-amber/50 text-white hover:bg-brand-amber') : 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed'}`} style={{ backgroundColor: ready && !answered ? task.color : undefined }}>
            {answered ? '← К заданиям' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </>
    );
  };

  const renderWriteTest = (task: Extract<PracticeTaskType, { type: 'write_test' | 'bug_report' }>) => {
    const filled = Object.values(formValues).filter(x => typeof x === 'string' && x.trim().length > 5).length >= 3;
    const pct = answered ? Math.round((correctCount / task.checkItems.length) * 100) : 0;
    const passed = pct >= 60;

    const fields = task.type === 'write_test' ? [
      { key:'title', label:'Название тест-кейса', placeholder:'Напиши конкретное название...', multi:false },
      { key:'precond', label:'Предусловие', placeholder:'Что должно быть выполнено до начала теста...', multi:true },
      { key:'steps', label:'Шаги выполнения', placeholder:'1. ...\n2. ...\n3. ...', multi:true },
      { key:'expected', label:'Ожидаемый результат', placeholder:'Что должно произойти после шагов...', multi:true },
    ] : [
      { key:'title', label:'Заголовок баг-репорта', placeholder:'[Модуль] Краткое описание проблемы', multi:false },
      { key:'steps', label:'Шаги воспроизведения', placeholder:'1. ...\n2. ...\n3. ...', multi:true },
      { key:'actual', label:'Фактический результат', placeholder:'Что произошло на самом деле...', multi:true },
      { key:'expected', label:'Ожидаемый результат', placeholder:'Что должно было произойти...', multi:true },
    ];

    return (
      <>
        <div className="text-xs text-slate-400 mb-3 font-mono">{task.type === 'write_test' ? 'Составь тест-кейс по требованию' : 'Напиши баг-репорт по описанию'}</div>
        <div className="glass-panel bg-amber-500/10 border-amber-500/30 p-4 mb-4 text-[13px] leading-relaxed text-slate-300">
          <div className="text-[10px] text-brand-amber font-bold tracking-[2px] font-mono mb-1.5">{task.type === 'write_test' ? '📄 ТРЕБОВАНИЕ' : '🔍 СЦЕНАРИЙ'}</div>
          {task.type === 'write_test' ? task.requirement : task.scenario}
        </div>

        <div className="flex-1 flex flex-col gap-3.5">
          {fields.map(f => (
            <div key={f.key}>
              <div className="text-[10px] text-slate-400 font-mono tracking-[2px] mb-1.5 uppercase">{f.label}</div>
              {f.multi ? (
                <textarea 
                  disabled={answered}
                  placeholder={f.placeholder}
                  rows={3}
                  value={formValues[f.key] || ''}
                  onChange={e => setFormValues({ ...formValues, [f.key]: e.target.value })}
                  className="glass-input w-full p-3 text-white font-sans text-[13px] font-medium outline-none resize-y transition-colors focus:border-brand-purple disabled:opacity-60"
                />
              ) : (
                <input 
                  disabled={answered}
                  placeholder={f.placeholder}
                  value={formValues[f.key] || ''}
                  onChange={e => setFormValues({ ...formValues, [f.key]: e.target.value })}
                  className="glass-input w-full p-3 text-white font-sans text-[13px] font-medium outline-none transition-colors focus:border-brand-purple disabled:opacity-60"
                />
              )}
            </div>
          ))}
        </div>

        {answered && (
          <>
            <div className="mt-4 glass-panel p-4">
              <div className="text-[10px] text-slate-400 font-mono tracking-[2px] mb-2.5">КРИТЕРИИ ПРОВЕРКИ</div>
              {task.checkItems.map((item: PracticeCheckItem, i: number) => {
                let ok = false;
                try { ok = item.check(formValues); } catch {}
                return (
                  <div key={i} className="flex gap-2 py-1.5 border-b border-white/10 last:border-0 text-xs items-start leading-relaxed">
                    <span className="shrink-0 mt-0.5">{ok ? '✅' : '❌'}</span>
                    <span className={ok ? 'text-brand-green' : 'text-brand-red'}>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 glass-panel bg-brand-green/5 border-brand-green/20 p-4">
              <div className="text-[10px] text-brand-green font-mono tracking-[2px] mb-2.5">💡 ЭТАЛОННЫЙ ОТВЕТ</div>
              <div className="text-xs text-slate-300 leading-relaxed">
                {task.type === 'write_test' ? (
                  <>
                    <b className="text-white">Название:</b> {task.solution.title}<br/><br/>
                    <b className="text-white">Предусловие:</b> {task.solution.precondition}<br/><br/>
                    <b className="text-white">Шаги:</b><br/>{(task.solution?.steps || []).map((s: string, i: number) => <span key={i}>{i+1}. {s}<br/></span>)}<br/>
                    <b className="text-white">Ожидаемый результат:</b> {task.solution?.expected}
                  </>
                ) : (
                  <>
                    <b className="text-white">Заголовок:</b> {task.solution?.title}<br/><br/>
                    <b className="text-white">Шаги:</b><br/>{(task.solution?.steps || []).map((s: string, i: number) => <span key={i}>{i+1}. {s}<br/></span>)}<br/>
                    <b className="text-white">Факт:</b> {task.solution?.actual}<br/><br/>
                    <b className="text-white">Ожидание:</b> {task.solution?.expected}<br/><br/>
                    <b className="text-white">Severity:</b> {task.solution?.severity}
                  </>
                )}
              </div>
            </div>

            <div className={`mt-4 p-4 rounded-2xl text-[13px] leading-relaxed border-l-[3px] backdrop-blur-md ${passed ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}>
              <div className={`font-extrabold ${passed ? 'text-brand-green' : 'text-brand-red'}`}>
                {passed ? `✅ Отлично! ${correctCount}/${task.checkItems.length} критериев выполнено. +${task.xp} XP` : `💪 ${correctCount}/${task.checkItems.length} критериев. Сравни с эталоном ↑`}
              </div>
            </div>
          </>
        )}

        <div className="mt-4">
          <button disabled={!filled && !answered} onClick={handleCheck} className={`w-full font-bold py-4 rounded-xl uppercase tracking-wide transition-all backdrop-blur-md border ${filled || answered ? (answered ? (passed ? 'bg-brand-green/80 border-brand-green/50 text-white hover:bg-brand-green' : 'bg-brand-amber/80 border-brand-amber/50 text-white hover:bg-brand-amber') : 'bg-brand-purple/80 border-brand-purple/50 text-white hover:bg-brand-purple') : 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed'}`} style={{ backgroundColor: filled && !answered ? task.color : undefined }}>
            {answered ? '← К заданиям' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="solid-header p-3">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <button onClick={() => navigate('practice')} className="text-slate-300 text-xl p-1 hover:text-white transition-colors">✕</button>
          <div className="flex-1 bg-black/30 border border-white/5 rounded-full h-2.5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: answered ? '100%' : '0%', backgroundColor: task.color }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto w-full p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.5px] font-mono border backdrop-blur-sm" style={{ backgroundColor: `${task.color}18`, color: task.color, borderColor: `${task.color}30` }}>
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
