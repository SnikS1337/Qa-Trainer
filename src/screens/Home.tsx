import { useAppStore } from '../store';
import { LESSONS, QUOTES, PRACTICE_TASKS } from '../data';
import { getLevelInfo, plural } from '../utils';
import { useMemo, useState, useRef } from 'react';
import DevMenu from '../components/DevMenu';

export default function Home() {
  const { state, navigate, updateState, showToast } = useAppStore();
  const lvl = getLevelInfo(state.totalXP);

  // Scroll to top when component mounts
  if(typeof window !== 'undefined') {
    window.scrollTo(0, 0);
  }

  const [showDevMenu, setShowDevMenu] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rocketPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rocketPressProgress, setRocketPressProgress] = useState(0);

  // Handle rocket press for unlocking all lessons
  const handleRocketPressStart = () => {
    if (state.completedLessons.length > 0) return; // Only available for empty profile
    
    const startTime = Date.now();
    const totalTime = 3000; // 3 seconds to activate
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / totalTime) * 100, 100);
      setRocketPressProgress(progress);
      
      if (progress < 100) {
        rocketPressTimer.current = setTimeout(updateProgress, 50);
      } else {
        // Unlock all lessons as if they were completed legitimately
        updateState(prev => ({
          ...prev,
          completedLessons: LESSONS.map(l => l.id),
          // Calculate appropriate XP based on lessons completed
          totalXP: LESSONS.reduce((sum, lesson) => sum + lesson.xp, 0),
          // Don't set isCheater - this is legitimate unlock for demonstration purposes
        }));
        showToast('🎉 Все уроки разблокированы!', 'text-brand-green');
        setRocketPressProgress(0);
      }
    };
    
    rocketPressTimer.current = setTimeout(updateProgress, 50);
  };

  const handleRocketPressEnd = () => {
    if (rocketPressTimer.current) {
      clearTimeout(rocketPressTimer.current);
      rocketPressTimer.current = null;
    }
    setRocketPressProgress(0);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent scroll when pressing anywhere
    pressTimer.current = setTimeout(() => {
      setShowDevMenu(true);
    }, 1000);
  };

  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    e.preventDefault(); // Prevent scroll
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const quote = useMemo(() => {
    const today = new Date().toDateString();
    let idx = state.lastQuoteIndex;
    if (state.dailyQuoteDate !== today) {
      idx = Math.floor(Math.random() * QUOTES.length);
      // Update the quote index in state for consistency
      updateState({ lastQuoteIndex: idx, dailyQuoteDate: today });
    }
    return QUOTES[idx % QUOTES.length];
  }, [state.lastQuoteIndex, state.dailyQuoteDate, updateState]);

  const categories = ['Основы', 'Техники тест-дизайна', 'Продвинутый уровень', 'Процессы', 'Карьера'];

  // Check completion status for extra modes
  const dailyDone = state.lastDailyDate === new Date().toDateString();
  const practiceCompletedCount = PRACTICE_TASKS.filter(t => state.completedPractice.includes(t.id)).length;
  const practiceDone = practiceCompletedCount === PRACTICE_TASKS.length;

  return (
    <div className="pb-10 w-full">
      {/* Header */}
      <div className="solid-header p-4">
        <div className="max-w-[600px] mx-auto">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <span 
                className="text-2xl cursor-pointer select-none"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}
              >
                🧪
              </span>
              <div>
                <div className="font-mono text-[10px] text-brand-green tracking-[3px]">QA TRAINER</div>
                <div className="text-lg font-extrabold text-white">Привет, тестировщик!</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="glass-button px-3 py-2 text-xs" onClick={() => navigate('achievements')}>🏆</button>
              <button className="glass-button px-3 py-2 text-xs" onClick={() => navigate('stats')}>📊</button>
              <button className="glass-button px-3 py-2 text-xs" onClick={() => navigate('certificate')}>🎓</button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { icon: '⚡', val: state.totalXP, label: 'XP', color: 'text-brand-amber' },
              { icon: '🎯', val: lvl.level, label: 'Уровень', color: 'text-brand-green' },
              { icon: '🔥', val: state.streak, label: 'Серия', color: 'text-brand-red' },
              { icon: '✅', val: `${state.completedLessons.length}/${LESSONS.length}`, label: 'Уроки', color: 'text-brand-blue' },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-2 text-center rounded-xl">
                <div className="text-base mb-1">{s.icon}</div>
                <div className={`text-lg font-extrabold font-mono ${s.color}`}>{s.val}</div>
                <div className="text-[9px] text-slate-300 tracking-[1.5px] uppercase mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between mb-1 text-[11px] text-slate-300">
              <span>Уровень {lvl.level} — {lvl.name}</span>
              <span>{lvl.xpInLevel} / {lvl.xpToNext} XP</span>
            </div>
            <div className="bg-black/30 rounded-full h-2 overflow-hidden border border-white/5">
              <div className="h-full bg-brand-amber rounded-full transition-all duration-500" style={{ width: `${lvl.pct}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-5 pt-5">
        {/* Quote */}
        <div className="p-4 glass-panel mb-6 flex gap-3 items-start border-brand-green/30 bg-brand-green/5">
          <span className="text-xl mt-0.5 shrink-0">💬</span>
          <div>
            <div className="text-[11px] text-brand-green font-bold tracking-[2px] mb-1 font-mono">ЦИТАТА ДНЯ</div>
            <div className="text-[13px] leading-relaxed text-white italic">"{quote.text}"</div>
            <div className="text-[11px] text-slate-300 mt-1">— {quote.author}, "{quote.book}"</div>
          </div>
        </div>

        {/* Lessons */}
        {categories.map((cat, catIdx) => {
          const catLessons = LESSONS.filter(l => l.category === cat);
          const prevCat = catIdx > 0 ? categories[catIdx - 1] : null;
          const prevCatLessons = prevCat ? LESSONS.filter(l => l.category === prevCat) : [];
          
          // Fix logic bug: require ALL lessons in previous category to be done
          const catUnlocked = catIdx === 0 || prevCatLessons.every(l => state.completedLessons.includes(l.id));
          const catDone = catLessons.filter(l => state.completedLessons.includes(l.id)).length;

          return (
            <div key={cat} className="mb-7">
              <div className={`font-mono text-[10px] ${catUnlocked ? 'text-white' : 'text-slate-400'} tracking-[3px] uppercase mb-3 flex items-center gap-2`}>
                <span className="flex-1 h-[1px] bg-white/20"></span>
                <span>{!catUnlocked && '🔒 '}{cat}</span>
                {catUnlocked && <span className="text-[9px] text-slate-300 font-bold tracking-normal">{catDone}/{catLessons.length}</span>}
                <span className="flex-1 h-[1px] bg-white/20"></span>
              </div>

              {catLessons.map((lesson, idxInCat) => {
                const done = state.completedLessons.includes(lesson.id);
                let locked = !catUnlocked;
                if (catUnlocked && idxInCat > 0) {
                  locked = !state.completedLessons.includes(catLessons[idxInCat - 1].id);
                }

                return (
                  <div 
                    key={lesson.id} 
                    onClick={() => !locked && navigate('lesson', lesson.id)}
                    className={`glass-panel p-4 mb-3 relative overflow-hidden transition-all duration-300
                      ${locked ? 'opacity-50 cursor-default' : 'cursor-pointer hover:translate-x-1 hover:bg-white/10'}
                      ${done ? 'border-opacity-50' : ''}`}
                    style={{ borderColor: !locked && !done ? 'rgba(255,255,255,0.2)' : undefined }}
                  >
                    {done && (
                      <div className="absolute top-0 right-0 text-black text-[9px] font-extrabold px-2.5 py-1 rounded-bl-xl tracking-[1px] font-mono" style={{ backgroundColor: lesson.color }}>
                        ГОТОВО ✓
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 bg-black/20" 
                           style={{ borderColor: locked ? 'rgba(255,255,255,0.1)' : `${lesson.color}50` }}>
                        {locked ? '🔒' : lesson.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm mb-0.5 text-white">{lesson.title}</div>
                        <div className="text-xs text-slate-300 mb-2 truncate">{lesson.desc}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-300 font-mono">{lesson.questions.length} вопросов</span>
                          <span className="text-slate-500">·</span>
                          <span className="bg-brand-amber/20 text-brand-amber border border-brand-amber/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">+{lesson.xp} XP</span>
                        </div>
                      </div>
                      {!locked && <div className="text-lg shrink-0" style={{ color: lesson.color }}>›</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Extra Modes */}
        <div className="pb-10">
           <div 
             onClick={() => !dailyDone && navigate('daily')}
             className={`glass-panel p-4 mb-3 transition-all duration-300 border-purple-400/30 bg-purple-400/5 ${dailyDone ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-purple-400/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:scale-[1.02]'}`}
           >
            <div className="flex items-center gap-3">
              <div className="text-3xl">{dailyDone ? '✅' : '📅'}</div>
              <div className="flex-1">
                <div className="font-extrabold text-sm mb-1 text-white">Ежедневный квиз {state.dailyStreak > 1 && `🔥${state.dailyStreak}`}</div>
                <div className="text-xs text-slate-300">{dailyDone ? 'Уже пройден сегодня — возвращайся завтра!' : '5 случайных вопросов · +15 XP · Обновляется каждый день'}</div>
              </div>
              {!dailyDone && <div className="text-brand-purple text-lg">›</div>}
            </div>
          </div>

          {state.completedLessons.length >= 4 && (
             <div 
               onClick={() => navigate('exam')}
               className="glass-panel p-4 mb-3 cursor-pointer transition-all duration-300 border-red-400/30 bg-red-400/5 hover:bg-red-400/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-[1.02]"
             >
              <div className="flex items-center gap-3">
                <div className="text-3xl">🎯</div>
                <div className="flex-1">
                  <div className="font-extrabold text-sm mb-1 text-white">Режим экзамена</div>
                  <div className="text-xs text-slate-300">20 вопросов · 2 минуты · Без подсказок {state.examBestScore > 0 && <span>· Рекорд: <span className="text-brand-red font-extrabold">{state.examBestScore}%</span></span>}</div>
                </div>
                <div className="text-brand-red text-lg">›</div>
              </div>
            </div>
          )}

           <div 
             onClick={() => navigate('practice')}
             className="glass-panel p-4 mb-3 cursor-pointer transition-all duration-300 border-blue-400/30 bg-blue-400/5 hover:bg-blue-400/10 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:scale-[1.02]"
           >
            <div className="flex items-center gap-3">
              <div className="text-3xl">🛠️</div>
              <div className="flex-1">
                <div className="font-extrabold text-sm mb-1 text-white">Практические задания</div>
                <div className="text-xs text-slate-300">Реальные сценарии · {practiceCompletedCount}/{PRACTICE_TASKS.length} пройдено</div>
              </div>
              <div className="text-emerald-400 text-lg">›</div>
            </div>
          </div>

          {state.completedLessons.length === 0 ? (
            <div className="text-center p-5 text-slate-300 text-[13px] leading-relaxed">
              <div 
                className="text-3xl mb-2 touch-none select-none cursor-pointer"
                onTouchStart={(e) => { e.preventDefault(); handleRocketPressStart(); }}
                onTouchEnd={(e) => { e.preventDefault(); handleRocketPressEnd(); }}
                onTouchCancel={(e) => { e.preventDefault(); handleRocketPressEnd(); }}
                onMouseDown={(e) => { e.preventDefault(); handleRocketPressStart(); }}
                onMouseUp={(e) => { e.preventDefault(); handleRocketPressEnd(); }}
                onMouseLeave={(e) => { e.preventDefault(); handleRocketPressEnd(); }}
              >
                {rocketPressProgress > 0 ? (
                  <div className="relative inline-block">
                    <span className="opacity-30">🚀</span>
                    <div 
                      className="absolute top-0 left-0 h-full bg-brand-amber/30 rounded-full overflow-hidden"
                      style={{ width: `${rocketPressProgress}%` }}
                    >
                      <span>🚀</span>
                    </div>
                  </div>
                ) : '🚀'}
              </div>
              Начни с первого урока! Каждый профессиональный тестировщик начинал именно так.
            </div>
          ) : state.completedLessons.length < LESSONS.length ? (
            <div className="text-center p-4 glass-panel mt-1">
              <div className="text-2xl mb-1">{state.completedLessons.length > LESSONS.length / 2 ? '💪' : '🌱'}</div>
              <div className="text-sm font-bold mb-1 text-white">{Math.round((state.completedLessons.length / LESSONS.length) * 100)}% пройдено</div>
              <div className="text-xs text-slate-300">Ещё {LESSONS.length - state.completedLessons.length} {plural(LESSONS.length - state.completedLessons.length, 'урок', 'урока', 'уроков')} до финала!</div>
            </div>
          ) : (
            <div className="text-center p-5 glass-panel border-brand-green/40 bg-brand-green/10">
              <div className="text-4xl mb-2 animate-bounce">🏆</div>
              <div className="text-base font-extrabold text-brand-green">Все уроки пройдены!</div>
              <div className="text-xs text-slate-300 mt-1.5">Теперь испытай себя в режиме экзамена 👆</div>
            </div>
          )}
        </div>
      </div>
      {showDevMenu && <DevMenu onClose={() => setShowDevMenu(false)} />}
    </div>
  );
}
