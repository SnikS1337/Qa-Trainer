import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { LESSONS } from '../data';
import { shuffle, shuffleOptions } from '../utils';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';

export default function Daily() {
  const { state, updateState, navigate, showToast } = useAppStore();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Check if already played today - fix: normalize date to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();
    
    if (state.lastDailyDate === todayStr) {
      showToast('Ты уже прошел ежедневный квиз сегодня!', 'text-brand-amber');
      navigate('home');
      return;
    }

    // Gather all choice questions from all lessons
    let allQ: any[] = [];
    LESSONS.forEach(l => {
      if (l.questions) {
        allQ = [...allQ, ...l.questions.filter(q => q.type === 'choice')];
      }
    });
    
    // Select 5 random questions and shuffle their options
    const shuffled = shuffle(allQ).slice(0, 5).map(q => {
      const { shuffledOpts, newCorrectIndex } = shuffleOptions(q.opts, q.ans);
      return { ...q, opts: shuffledOpts, ans: newCorrectIndex };
    });
    setQuestions(shuffled);
  }, []);

  const handleFinish = () => {
    setFinished(true);
    const passed = score >= 3; // 60% to pass
    const xpEarned = score * 10;
    
    if (passed) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    
    updateState(prev => {
      const s = { ...prev };
      s.totalXP += xpEarned;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toDateString();
      
      s.lastDailyDate = todayStr;
      
      // Update streak if needed - fix: normalize dates to midnight for accurate comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      const lastActive = s.lastActiveDate ? new Date(s.lastActiveDate) : null;
      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        const lastActiveStr = lastActive.toDateString();
        
        if (lastActiveStr === yesterdayStr) {
          s.dailyStreak += 1;
        } else if (lastActiveStr !== todayStr) {
          s.dailyStreak = 1;
        }
      } else {
        s.dailyStreak = 1;
      }
      
      s.lastActiveDate = todayStr;
      
      return s;
    });
    
    showToast(`Ежедневный квиз пройден! +${xpEarned} XP`, passed ? 'text-brand-green' : 'text-brand-amber');
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    if (!answered) {
      const q = questions[currentIdx];
      if (selectedOption === q.ans) {
        setScore(prev => prev + 1);
      }
      setAnswered(true);
    } else {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
      } else {
        handleFinish();
      }
    }
  };

  if (questions.length === 0) return <div className="p-10 text-center text-slate-400">Загрузка квиза...</div>;

  if (finished) {
    const passed = score >= 3;
    return (
      <div className="max-w-[500px] mx-auto p-6 pt-20 text-center w-full">
        <div className="text-6xl mb-6">{passed ? '🌟' : '👍'}</div>
        <h2 className="text-3xl font-extrabold mb-2 text-white">Дейлик завершен!</h2>
        <p className="text-slate-400 mb-8">Правильных ответов: <span className={`font-bold ${passed ? 'text-brand-green' : 'text-brand-amber'}`}>{score} / 5</span></p>
        
        <div className="glass-panel p-6 mb-8 text-left">
          <div className="text-sm text-slate-300 mb-4">
            {passed 
              ? 'Отличная работа! Ты поддерживаешь свои знания в тонусе. Возвращайся завтра за новой порцией вопросов.' 
              : 'Хорошая попытка! Повторение - мать учения. Завтра будет новый шанс улучшить результат.'}
          </div>
          <div className="flex items-center justify-between p-3 bg-brand-amber/10 border border-brand-amber/30 rounded-xl">
            <span className="text-brand-amber font-bold text-sm">+{score * 10} XP</span>
            <span className="text-brand-amber text-xl">🔥</span>
          </div>
        </div>
        
        <button onClick={() => navigate('home')} className="w-full glass-button text-white font-bold py-4 uppercase tracking-wide">
          На главную
        </button>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <ConfirmModal 
        isOpen={showConfirm} 
        title="Прервать квиз?" 
        message="Прогресс будет потерян. Вы уверены?" 
        confirmText="Да, прервать"
        onConfirm={() => navigate('home')} 
        onCancel={() => setShowConfirm(false)} 
      />
      <div className="solid-header p-4">
        <div className="max-w-[600px] mx-auto flex items-center justify-between mb-3">
          <button onClick={() => setShowConfirm(true)} className="text-slate-400 hover:text-white text-sm font-bold transition-colors">✕ ПРЕРВАТЬ</button>
          <div className="font-mono font-bold text-lg text-brand-amber">
            🔥 ДЕЙЛИК
          </div>
        </div>
        <div className="max-w-[600px] mx-auto bg-black/30 border border-white/5 rounded-full h-2.5 overflow-hidden">
          <div className="bg-brand-amber h-full rounded-full transition-all duration-300" style={{ width: `${(currentIdx / 5) * 100}%` }}></div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto w-full p-6 flex flex-col flex-1">
        <div className="text-sm text-brand-amber font-bold tracking-widest mb-4 font-mono uppercase">Вопрос {currentIdx + 1} из 5</div>
        <h2 className="text-[22px] font-semibold leading-snug mb-8 text-white">{q.q}</h2>

        <div className="flex-1 flex flex-col gap-3">
          {(q.opts || []).map((opt: string, idx: number) => {
            let bgClass = 'bg-white/5';
            let borderClass = 'border-white/10';
            let textClass = 'text-slate-300';
            
            if (answered) {
              if (idx === q.ans) {
                bgClass = 'bg-brand-green/10';
                borderClass = 'border-brand-green/50';
                textClass = 'text-brand-green font-bold';
              } else if (idx === selectedOption) {
                bgClass = 'bg-brand-red/10';
                borderClass = 'border-brand-red/50';
                textClass = 'text-brand-red font-bold';
              }
            } else if (selectedOption === idx) {
              bgClass = 'bg-brand-amber/10';
              borderClass = 'border-brand-amber/50';
              textClass = 'text-white font-bold';
            }

             return (
               <button
                 key={idx}
                 disabled={answered}
                 onClick={() => setSelectedOption(idx)}
                 className={`text-left p-4 rounded-2xl border-[1.5px] transition-all duration-200 backdrop-blur-md ${bgClass} ${borderClass} ${textClass} ${!answered ? 'hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] hover:scale-[1.02] cursor-pointer' : 'cursor-default'}`}
               >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${selectedOption === idx || (answered && idx === q.ans) ? borderClass : 'border-white/20'}`}>
                    {(selectedOption === idx || (answered && idx === q.ans)) && <div className={`w-3 h-3 rounded-full ${answered && idx === q.ans ? 'bg-brand-green' : (answered && idx === selectedOption ? 'bg-brand-red' : 'bg-brand-amber')}`}></div>}
                  </div>
                  <span className="text-[15px] leading-relaxed">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={`mt-6 p-4 rounded-2xl text-[13px] leading-relaxed border-l-[3px] backdrop-blur-md ${selectedOption === q.ans ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}>
            <div className={`font-extrabold mb-1 ${selectedOption === q.ans ? 'text-brand-green' : 'text-brand-red'}`}>
              {selectedOption === q.ans ? '✅ Верно!' : '❌ Ошибка!'}
            </div>
            <div className="text-slate-300">{q.exp}</div>
          </div>
        )}

         <div className="mt-8">
           <button 
             disabled={selectedOption === null} 
             onClick={handleAnswer} 
             className={`w-full font-bold py-4 rounded-xl uppercase tracking-wide transition-all duration-200 backdrop-blur-md border ${selectedOption !== null ? (answered ? 'bg-brand-amber/80 border-brand-amber/50 text-white hover:bg-brand-amber hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:scale-[1.02]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.02]') : 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed'}`}
           >
             {answered ? (currentIdx === questions.length - 1 ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ') : 'ПРОВЕРИТЬ'}
           </button>
         </div>
      </div>
    </div>
  );
}
