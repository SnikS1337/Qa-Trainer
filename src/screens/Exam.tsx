import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { LESSONS, ACHIEVEMENTS } from '../data';
import { shuffle, shuffleOptions } from '../utils';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';

export default function Exam() {
  const { state, updateState, navigate, showToast } = useAppStore();
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Gather all choice questions from all lessons
    let allQ: any[] = [];
    LESSONS.forEach(l => {
      if (l.questions) {
        allQ = [...allQ, ...l.questions.filter(q => q.type === 'choice')];
      }
    });
    
    // Select 20 random questions and shuffle their options
    const shuffled = shuffle(allQ).slice(0, 20).map(q => {
      const { shuffledOpts, newCorrectIndex } = shuffleOptions(q.opts, q.ans);
      return { ...q, opts: shuffledOpts, ans: newCorrectIndex };
    });
    setQuestions(shuffled);
  }, []);

  const handleFinish = useCallback(() => {
    setFinished(true);
    const passed = score >= 16; // 80% to pass
    
    if (passed) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      updateState(prev => {
        const s = { ...prev };
        s.totalXP += 500;
        if (!s.examPassed) s.examPassed = true;
        
        // Check achievements
        ACHIEVEMENTS.forEach(a => {
          if (!s.unlockedAchievements.includes(a.id) && a.check(s)) {
            s.unlockedAchievements.push(a.id);
            showToast(`🏆 Достижение: ${a.title}!`, 'text-brand-amber');
          }
        });
        
        return s;
      });
      showToast('🎓 Экзамен сдан! +500 XP', 'text-brand-green');
    } else {
      showToast('❌ Экзамен не сдан. Нужно 80% правильных ответов.', 'text-brand-red');
    }
  }, [score, updateState, showToast]);

  useEffect(() => {
    if (finished || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [finished, questions.length, handleFinish]);

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    const q = questions[currentIdx];
    if (selectedOption === q.ans) {
      setScore(prev => prev + 1);
    }
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleFinish();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (questions.length === 0) return <div className="p-10 text-center text-slate-400">Загрузка экзамена...</div>;

  if (finished) {
    const passed = score >= 16;
    return (
      <div className="max-w-[500px] mx-auto p-6 pt-20 text-center w-full">
        <div className="text-6xl mb-6">{passed ? '🎓' : '💔'}</div>
        <h2 className="text-3xl font-extrabold mb-2 text-white">{passed ? 'Экзамен сдан!' : 'Экзамен провален'}</h2>
        <p className="text-slate-400 mb-8">Твой результат: <span className={`font-bold ${passed ? 'text-brand-green' : 'text-brand-red'}`}>{score} / 20</span></p>
        
        <div className="glass-panel p-6 mb-8 text-left">
          <div className="text-sm text-slate-300 mb-4">
            {passed 
              ? 'Поздравляем! Ты доказал свои знания и готов к реальным задачам. Сертификат теперь доступен в профиле.' 
              : 'Не расстраивайся. Повтори теорию, пройди практику и попробуй снова. Для сдачи нужно минимум 16 правильных ответов.'}
          </div>
          {passed && (
            <div className="flex items-center justify-between p-3 bg-brand-green/10 border border-brand-green/30 rounded-xl">
              <span className="text-brand-green font-bold text-sm">+500 XP</span>
              <span className="text-brand-green text-xl">✨</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          {passed && (
            <button onClick={() => navigate('certificate')} className="w-full bg-brand-purple/80 hover:bg-brand-purple backdrop-blur-md border border-brand-purple/50 text-white font-bold py-4 rounded-xl uppercase tracking-wide transition-all">
              Получить сертификат
            </button>
          )}
          <button onClick={() => navigate('home')} className="w-full glass-button text-white font-bold py-4 uppercase tracking-wide">
            На главную
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="flex flex-col min-h-screen w-full">
      <ConfirmModal 
        isOpen={showConfirm} 
        title="Прервать экзамен?" 
        message="Прогресс будет потерян. Вы уверены?" 
        confirmText="Да, прервать"
        onConfirm={() => navigate('home')} 
        onCancel={() => setShowConfirm(false)} 
      />
      <div className="solid-header p-4">
        <div className="max-w-[600px] mx-auto flex items-center justify-between mb-3">
          <button onClick={() => setShowConfirm(true)} className="text-slate-400 hover:text-white text-sm font-bold transition-colors">✕ ПРЕРВАТЬ</button>
          <div className={`font-mono font-bold text-lg ${timeLeft < 60 ? 'text-brand-red animate-pulse' : 'text-brand-amber'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
        <div className="max-w-[600px] mx-auto bg-black/30 border border-white/5 rounded-full h-2.5 overflow-hidden">
          <div className="bg-brand-purple h-full rounded-full transition-all duration-300" style={{ width: `${(currentIdx / 20) * 100}%` }}></div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto w-full p-6 flex flex-col flex-1">
        <div className="text-sm text-brand-purple font-bold tracking-widest mb-4 font-mono uppercase">Вопрос {currentIdx + 1} из 20</div>
        <h2 className="text-[22px] font-semibold leading-snug mb-8 text-white">{q.q}</h2>

        <div className="flex-1 flex flex-col gap-3">
          {(q.opts || []).map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedOption(idx)}
              className={`text-left p-4 rounded-2xl border-[1.5px] transition-all duration-200 backdrop-blur-md ${selectedOption === idx ? 'border-brand-purple/50 bg-brand-purple/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${selectedOption === idx ? 'border-brand-purple' : 'border-white/20'}`}>
                  {selectedOption === idx && <div className="w-3 h-3 rounded-full bg-brand-purple"></div>}
                </div>
                <span className="text-[15px] leading-relaxed">{opt}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <button 
            disabled={selectedOption === null} 
            onClick={handleAnswer} 
            className={`w-full font-bold py-4 rounded-xl uppercase tracking-wide transition-all backdrop-blur-md border ${selectedOption !== null ? 'bg-brand-purple/80 border-brand-purple/50 text-white hover:bg-brand-purple' : 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed'}`}
          >
            {currentIdx === questions.length - 1 ? 'ЗАВЕРШИТЬ ЭКЗАМЕН' : 'СЛЕДУЮЩИЙ ВОПРОС'}
          </button>
        </div>
      </div>
    </div>
  );
}
