import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../store';
import { ACHIEVEMENTS } from '../data/achievements';
import { loadChoiceQuestions } from '../data/content_loaders';
import {
  compactChoiceOptionText,
  compactQuestionText,
  prepareQuestionsWithShuffledChoices,
  shuffle,
} from '../utils';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';
import { QuestionChoice } from '../types';

function buildExamQuestions(questions: QuestionChoice[]) {
  return prepareQuestionsWithShuffledChoices(shuffle(questions).slice(0, 20));
}

export default function Exam() {
  const { updateState, navigate, showToast } = useAppStore();

  const [questions, setQuestions] = useState<QuestionChoice[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void loadChoiceQuestions().then((allQuestions) => {
      if (!isMounted) {
        return;
      }

      setQuestions(buildExamQuestions(allQuestions));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFinish = useCallback(
    (resultScore: number = score) => {
      if (finished) return;

      setFinished(true);
      setFinalScore(resultScore);
      const passed = resultScore >= 16; // 80% to pass

      updateState((prev) => {
        const s = { ...prev };
        s.examAttempts += 1;
        s.examBestScore = Math.max(s.examBestScore, Math.round((resultScore / 20) * 100));

        if (passed) {
          s.totalXP += 500;
          if (!s.examPassed) s.examPassed = true;

          // Check achievements
          ACHIEVEMENTS.forEach((a) => {
            if (!s.unlockedAchievements.includes(a.id) && a.check(s)) {
              s.unlockedAchievements.push(a.id);
              showToast(`🏆 Достижение: ${a.title}!`, 'text-brand-amber');
            }
          });
        }

        return s;
      });

      if (passed) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        showToast('🎓 Экзамен сдан! +500 XP', 'text-brand-green');
      } else {
        showToast('❌ Экзамен не сдан. Нужно 80% правильных ответов.', 'text-brand-red');
      }
    },
    [finished, score, updateState, showToast]
  );

  useEffect(() => {
    if (finished || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
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
    const isCorrect = selectedOption === q.ans;
    const finalScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore(finalScore);
    }

    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      handleFinish(finalScore);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (questions.length === 0)
    return <div className="p-10 text-center text-slate-400">Загрузка экзамена...</div>;

  if (finished) {
    const resolvedScore = finalScore ?? score;
    const passed = resolvedScore >= 16;
    return (
      <div className="mx-auto w-full max-w-[500px] p-6 pt-20 text-center">
        <div className="mb-6 text-6xl">{passed ? '🎓' : '💔'}</div>
        <h2 className="mb-2 text-3xl font-extrabold text-white">
          {passed ? 'Экзамен сдан!' : 'Экзамен провален'}
        </h2>
        <p className="mb-8 text-slate-400">
          Твой результат:{' '}
          <span className={`font-bold ${passed ? 'text-brand-green' : 'text-brand-red'}`}>
            {resolvedScore} / 20
          </span>
        </p>

        <div className="glass-panel mb-8 p-6 text-left">
          <div className="mb-4 text-sm text-slate-300">
            {passed
              ? 'Поздравляем! Ты доказал свои знания и готов к реальным задачам. Сертификат теперь доступен в профиле.'
              : 'Не расстраивайся. Повтори теорию, пройди практику и попробуй снова. Для сдачи нужно минимум 16 правильных ответов.'}
          </div>
          {passed && (
            <div className="bg-brand-green/10 border-brand-green/30 flex items-center justify-between rounded-xl border p-3">
              <span className="text-brand-green text-sm font-bold">+500 XP</span>
              <span className="text-brand-green text-xl">✨</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {passed && (
            <button
              onClick={() => navigate('certificate')}
              className="bg-brand-purple/80 hover:bg-brand-purple border-brand-purple/50 w-full rounded-xl border py-4 font-bold tracking-wide text-white uppercase backdrop-blur-md transition-all"
            >
              Получить сертификат
            </button>
          )}
          <button
            onClick={() => navigate('home')}
            className="glass-button w-full py-4 font-bold tracking-wide text-white uppercase"
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ConfirmModal
        isOpen={showConfirm}
        title="Прервать экзамен?"
        message="Прогресс будет потерян. Вы уверены?"
        confirmText="Да, прервать"
        onConfirm={() => navigate('home')}
        onCancel={() => setShowConfirm(false)}
      />
      <div className="solid-header p-4">
        <div className="mx-auto mb-3 flex max-w-[600px] items-center justify-between">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm font-bold text-slate-400 transition-colors hover:text-white"
          >
            ✕ ПРЕРВАТЬ
          </button>
          <div
            className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-brand-red animate-pulse' : 'text-brand-amber'}`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
        <div className="mx-auto h-2.5 max-w-[600px] overflow-hidden rounded-full border border-white/5 bg-black/30">
          <div
            className="bg-brand-purple h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentIdx / 20) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col p-6">
        <div className="text-brand-purple mb-4 font-mono text-sm font-bold tracking-widest uppercase">
          Вопрос {currentIdx + 1} из 20
        </div>
        <h2 className="mb-8 text-[22px] leading-snug font-semibold text-white">
          {compactQuestionText(q.q)}
        </h2>

        <div className="flex flex-1 flex-col gap-3">
          {(q.opts || []).map((opt: string, idx: number) => {
            const optionText = compactChoiceOptionText(opt);

            return (
              <button
                key={idx}
                title={opt}
                onClick={() => setSelectedOption(idx)}
                className={`rounded-2xl border-[1.5px] px-4 py-3 text-left backdrop-blur-md transition-all duration-200 ${selectedOption === idx ? 'border-brand-purple/50 bg-brand-purple/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] ${selectedOption === idx ? 'border-brand-purple' : 'border-white/20'}`}
                  >
                    {selectedOption === idx && (
                      <div className="bg-brand-purple h-3 w-3 rounded-full"></div>
                    )}
                  </div>
                  <span className="flex-1 text-[15px] leading-relaxed">{optionText}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <button
            disabled={selectedOption === null}
            onClick={handleAnswer}
            className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${selectedOption !== null ? 'bg-brand-purple/80 border-brand-purple/50 hover:bg-brand-purple text-white' : 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500'}`}
          >
            {currentIdx === questions.length - 1 ? 'ЗАВЕРШИТЬ ЭКЗАМЕН' : 'СЛЕДУЮЩИЙ ВОПРОС'}
          </button>
        </div>
      </div>
    </div>
  );
}
