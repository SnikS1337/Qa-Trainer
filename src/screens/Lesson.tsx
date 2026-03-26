import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { LESSONS, MOTIVATIONAL_MESSAGES, ACHIEVEMENTS } from '../data';
import { AppState } from '../types';
import { shuffle, shuffleOptions } from '../utils';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedProgressBar } from '../components/AnimatedProgressBar';

export default function Lesson({ id }: { id: string }) {
  const { state, updateState, navigate, showToast } = useAppStore();
  const lesson = LESSONS.find(l => l.id === id);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<string[]>([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    if (lesson) {
      // Shuffle questions and shuffle options for choice questions
      const shuffledQuestions = shuffle(lesson.questions).slice(0, 6).map(q => {
        if (q.type === 'choice') {
          const { shuffledOpts, newCorrectIndex } = shuffleOptions(q.opts, q.ans);
          return { ...q, opts: shuffledOpts, ans: newCorrectIndex };
        }
        return q;
      });
      setQuestions(shuffledQuestions);
    }
  }, [lesson]);

  const checkAchievements = (newState: AppState) => {
    ACHIEVEMENTS.forEach(a => {
      if (!newState.unlockedAchievements.includes(a.id) && a.check(newState)) {
        newState.unlockedAchievements.push(a.id);
        showToast(`🏆 Достижение: ${a.title}!`, 'text-brand-amber');
      }
    });
  };

  const handleCheck = () => {
    // Защита от race condition: если уже обрабатывается, игнорируем
    if (answered && (hearts === 0 || qIndex + 1 >= questions.length)) {
      finishLesson();
      return;
    }
    
    if (answered) {
      setQIndex(qIndex + 1);
      setAnswered(false);
      setSelected(null);
      setSortOrder([]);
      return;
    }

    const q = questions[qIndex];
    let isCorrect = false;
    if (q.type === 'choice') isCorrect = selected === q.ans;
    if (q.type === 'sort') isCorrect = JSON.stringify(sortOrder) === JSON.stringify(q.correct);

    setAnswered(true);
    
    let newConsecutive = consecutiveCorrect;
    let newHearts = hearts;
    let newCorrect = correct;

    if (isCorrect) {
      newCorrect++;
      newConsecutive++;
       if (newConsecutive >= 3) {
        setCurrentStreak(newConsecutive);
      }
    } else {
      newHearts--;
      newConsecutive = 0;
      setCurrentStreak(0);
    }

    setCorrect(newCorrect);
    setConsecutiveCorrect(newConsecutive);
    setHearts(newHearts);

    updateState(prev => {
      const s = { ...prev };
      s.totalQuestionsAnswered++;
      if (isCorrect) s.totalCorrect++;
      if (newConsecutive > s.bestStreak) s.bestStreak = newConsecutive;
      return s;
    });
  };

  const finishLesson = () => {
    setFinished(true);
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60 && hearts > 0;
    const perfect = correct === total && hearts === 3;
    
    // Новая система начисления XP
    let gainedXP = 0;
    let earnedXP = 0;
    let penaltyXP = 0;
    
    if (passed) {
      // Успешное прохождение - весь XP идет в earnedXP
      gainedXP = perfect ? Math.round(lesson!.xp * 1.5) : lesson!.xp;
      earnedXP = gainedXP;
    } else {
      // Провал - проверяем лимит провалов (максимум 3 раза)
      const failCount = (state.lessonFailCount[lesson!.id] || 0);
      if (failCount < 3) {
        // Даем 20% XP как штрафной
        gainedXP = Math.round(lesson!.xp * 0.2);
        penaltyXP = gainedXP;
      } else {
        // После 3 провалов XP больше не дается
        gainedXP = 0;
      }
    }

    updateState(prev => {
      const s = { ...prev };
      s.totalXP += gainedXP;
      s.earnedXP += earnedXP;
      s.penaltyXP += penaltyXP;
      s.streak = passed ? s.streak + 1 : 0;
      if (s.streak > s.maxStreak) s.maxStreak = s.streak;
      
      // Обновляем счетчик провалов
      if (!passed) {
        s.lessonFailCount = { ...s.lessonFailCount };
        s.lessonFailCount[lesson!.id] = (s.lessonFailCount[lesson!.id] || 0) + 1;
        s.retries++;
      } else {
        // При успехе сбрасываем счетчик провалов для этого урока
        if (s.lessonFailCount[lesson!.id]) {
          s.lessonFailCount = { ...s.lessonFailCount };
          delete s.lessonFailCount[lesson!.id];
        }
      }
      
      if (passed && !s.completedLessons.includes(lesson!.id)) {
        s.completedLessons.push(lesson!.id);
      }
      if (perfect) s.perfectLessons++;
      
      checkAchievements(s);
      return s;
    });

    if (passed) {
      setTimeout(() => confetti(), 200);
      if (perfect) setTimeout(() => showToast('💎 Идеальный результат! +50% XP!', 'text-brand-amber'), 1000);
    } else {
      const failCount = (state.lessonFailCount[lesson!.id] || 0) + 1;
      if (failCount >= 3) {
        setTimeout(() => showToast('⚠️ Лимит провалов достигнут. Пройди урок успешно!', 'text-brand-red'), 500);
      }
    }
  };

  if (!lesson || questions.length === 0) return null;

  // Переменная q определена в области видимости компонента, но не используется в функциях, где нужна текущая версия вопроса

  if (finished) {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60 && hearts > 0;
    const perfect = correct === total && hearts === 3;
    
    // Рассчитываем XP для отображения
    let gainedXP = 0;
    if (passed) {
      gainedXP = perfect ? Math.round(lesson.xp * 1.5) : lesson.xp;
    } else {
      const failCount = (state.lessonFailCount[lesson.id] || 0);
      if (failCount < 3) {
        gainedXP = Math.round(lesson.xp * 0.2);
      }
    }
    
    const motivMsg = MOTIVATIONAL_MESSAGES.find(m => pct >= m.pct)!;
    const failCount = (state.lessonFailCount[lesson.id] || 0);
    const showFailWarning = !passed && failCount >= 3;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center w-full">
        <div className="max-w-[400px] w-full glass-panel p-8">
          <div className="text-[80px] mb-4 animate-bounce">{perfect ? '🎉' : passed ? '💪' : '😤'}</div>
          <div className="text-3xl font-extrabold mb-2 text-white">{motivMsg.msg}</div>
          <div className="text-[15px] text-slate-300 mb-7 leading-relaxed">{motivMsg.sub}</div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { l: 'Правильных', v: `${correct}/${total}`, c: 'text-brand-green' },
              { l: 'Результат', v: `${pct}%`, c: 'text-white', style: { color: lesson.color } },
              { l: 'XP получено', v: `+${gainedXP}`, c: 'text-brand-amber' },
              { l: 'Жизни', v: '❤️'.repeat(hearts) || '💀', c: 'text-brand-red' },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-4 text-center">
                <div className={`text-2xl font-extrabold font-mono ${s.c}`} style={s.style}>{s.v}</div>
                <div className="text-[11px] text-slate-300 mt-1 tracking-[1px] uppercase">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-brand-green/10 rounded-xl text-[13px] text-brand-green leading-relaxed mb-6 text-left border border-brand-green/20">
            💡 Практикуй каждый день — 15 минут регулярно лучше, чем 3 часа раз в неделю!
          </div>

          {showFailWarning && (
            <div className="p-4 bg-brand-red/10 rounded-xl text-[13px] text-brand-red leading-relaxed mb-6 text-left border border-brand-red/20">
              ⚠️ Лимит провалов достигнут! Дальнейшие попытки не дадут XP. Пройди урок успешно!
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button className="w-full bg-brand-green/80 hover:bg-brand-green backdrop-blur-md border border-brand-green/50 text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-all" onClick={() => navigate('home')}>
              ← На главную
            </button>
            {(!passed || perfect) && (
              <button className="w-full glass-button text-white font-bold py-4 uppercase tracking-wide" onClick={() => {
                setQIndex(0); setHearts(3); setCorrect(0); setAnswered(false); setSelected(null); setSortOrder([]); setConsecutiveCorrect(0); setFinished(false);
                setQuestions(shuffle(lesson.questions).slice(0, 6));
              }}>
                🔄 Повторить урок
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];
  const progress = (qIndex / questions.length) * 100;
  const isReady = q.type === 'choice' ? selected !== null : sortOrder.length === q.items?.length;
  const isCorrectAns = q.type === 'choice' ? selected === q.ans : JSON.stringify(sortOrder) === JSON.stringify(q.correct);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <ConfirmModal 
        isOpen={showConfirm} 
        title="Выйти из урока?" 
        message="Прогресс не сохранится. Вы уверены?" 
        confirmText="Да, прервать"
        onConfirm={() => navigate('home')} 
        onCancel={() => setShowConfirm(false)} 
      />
      {/* Top bar */}
      <div className="solid-header p-3">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <button onClick={() => setShowConfirm(true)} className="text-slate-300 text-xl p-1 hover:text-white transition-colors">✕</button>
          <div className="flex-1 bg-black/30 border border-white/5 rounded-full h-2.5 overflow-hidden">
            <AnimatedProgressBar 
              value={progress} 
              color={lesson.color}
              height="10px"
            />
          </div>
          <div className="flex gap-1 text-xl">
            {[0,1,2].map(i => (
              <span key={i} className={`transition-all duration-300 ${i < hearts ? 'opacity-100 drop-shadow-[0_0_4px_#f87171]' : 'opacity-20 grayscale'}`}>
                {i < hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto w-full p-5 flex flex-col flex-1">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.5px] font-mono border" style={{ backgroundColor: `${lesson.color}18`, color: lesson.color, borderColor: `${lesson.color}30` }}>
            {lesson.icon} {lesson.title}
          </span>
        </div>
        <div className="text-xs text-slate-300 mb-4 font-mono">Вопрос {qIndex + 1} из {questions.length}</div>

        <AnimatePresence mode="wait">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`glass-panel p-5 mb-5 transition-colors duration-300 ${answered ? (isCorrectAns ? 'border-brand-green/50 bg-brand-green/5' : 'border-brand-red/50 bg-brand-red/5') : ''}`}>
              <div className="text-[17px] font-bold leading-relaxed text-white">{q.q}</div>
              {q.type === 'sort' && <div className="mt-2 text-xs text-slate-300">👇 Нажимай на варианты в правильном порядке (снизу вверх)</div>}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex-1 flex flex-col gap-2.5">
          {q.type === 'choice' && q.opts.map((opt: string, i: number) => {
            const isSelected = selected === i;
            const isCorrectOption = q.ans === i;
            
            let bg = 'bg-white/5';
            let border = 'border-white/10';
            let text = 'text-white';
            
            if (answered) {
              if (isCorrectOption) { bg = 'bg-brand-green/10'; border = 'border-brand-green/50'; text = 'text-brand-green'; }
              else if (isSelected) { bg = 'bg-brand-red/10'; border = 'border-brand-red/50'; text = 'text-brand-red'; }
            } else if (isSelected) {
              bg = `bg-white/10`; border = 'border-white/30';
            }

            return (
              <motion.button 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={!answered ? { scale: 1.02, x: 5 } : {}}
                whileTap={!answered ? { scale: 0.98 } : {}}
                disabled={answered} 
                onClick={() => setSelected(i)} 
                className={`w-full text-left p-3.5 rounded-xl border-[1.5px] font-semibold text-[14px] flex items-center gap-3 transition-all backdrop-blur-md ${bg} ${border} ${text} ${!answered && 'hover:bg-white/10 hover:border-white/20'}`} 
                style={!answered && isSelected ? { borderColor: lesson.color, backgroundColor: `${lesson.color}18` } : undefined}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold font-mono shrink-0 ${answered && isCorrectOption ? 'bg-brand-green/20 text-brand-green' : isSelected && !answered ? 'bg-white/20 text-white' : 'bg-black/30 text-slate-300'}`} style={!answered && isSelected ? { backgroundColor: `${lesson.color}40`, color: lesson.color } : undefined}>
                  {['A','B','C','D'][i]}
                </span>
                <span className="flex-1 leading-relaxed">{opt}</span>
              </motion.button>
            );
          })}

          {q.type === 'sort' && (
            <>
              <div className="min-h-[60px] glass-panel border-dashed p-2.5 mb-3 flex flex-col gap-1.5">
                {sortOrder.length === 0 ? (
                  <div className="text-slate-400 text-xs p-1">Сюда появятся выбранные варианты...</div>
                ) : (
                  sortOrder.map((s, i) => (
                    <div key={s} onClick={() => !answered && setSortOrder(sortOrder.filter(x => x !== s))} className="bg-brand-green/10 border-[1.5px] border-brand-green/30 rounded-lg py-2 px-3 text-[13px] font-semibold cursor-pointer flex justify-between items-center text-white">
                      <span>{i + 1}. {s}</span>
                      <span className="text-slate-400">✕</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-col gap-2">
                {q.items.map((item: string) => {
                  const isSelected = sortOrder.includes(item);
                  return (
                    <button key={item} disabled={answered} onClick={() => {
                      if (isSelected) setSortOrder(sortOrder.filter(x => x !== item));
                      else setSortOrder([...sortOrder, item]);
                    }} className={`w-full text-left p-3 rounded-xl border-[1.5px] font-semibold text-[13px] transition-all backdrop-blur-md text-white ${isSelected ? 'opacity-35 border-white/5 bg-black/20' : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'}`}>
                      {item}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {answered && (
          <div className={`mt-4 p-4 rounded-2xl text-[13px] leading-relaxed border-l-[3px] backdrop-blur-md ${isCorrectAns ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}>
            <div className={`font-extrabold mb-1 ${isCorrectAns ? 'text-brand-green' : 'text-brand-red'}`}>
              {isCorrectAns ? '✅ Верно!' : '❌ Не совсем...'}
            </div>
            <div className="text-slate-300">{q.exp}</div>
          </div>
        )}

        {answered && currentStreak >= 3 && (
          <div className="mt-4 p-4 rounded-2xl text-[13px] leading-relaxed font-bold text-center text-brand-amber animate-pulse glass-panel backdrop-blur-xl border border-brand-amber/30">
            🔥 {currentStreak} подряд!
          </div>
        )}

        <div className="mt-5">
          <button 
            disabled={!isReady} 
            onClick={handleCheck} 
            className={`w-full font-bold py-4 rounded-xl uppercase tracking-wide transition-all backdrop-blur-md border ${isReady ? (answered ? (isCorrectAns ? 'bg-brand-green/80 border-brand-green/50 text-white hover:bg-brand-green' : 'bg-brand-red/80 border-brand-red/50 text-white hover:bg-brand-red') : 'text-white border-white/20') : 'bg-black/20 border-white/5 text-slate-400 opacity-50'}`}
            style={{ backgroundColor: isReady && !answered ? `${lesson.color}CC` : undefined, borderColor: isReady && !answered ? lesson.color : undefined }}
          >
            {answered ? 'ДАЛЬШЕ →' : 'ПРОВЕРИТЬ'}
          </button>
        </div>


      </div>
    </div>
  );
}
