import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
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

function buildDailyQuestions(questions: QuestionChoice[]) {
  return prepareQuestionsWithShuffledChoices(shuffle(questions).slice(0, 5));
}

const DAILY_XP_REWARD = 15;

export default function Daily() {
  const { state, updateState, navigate, showToast } = useAppStore();

  const [questions, setQuestions] = useState<QuestionChoice[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (finished) {
      return;
    }

    // Проверяем прохождение daily по нормализованной дате.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toDateString();

    if (state.lastDailyDate === todayStr) {
      showToast('Ты уже прошел ежедневный квиз сегодня!', 'text-brand-amber');
      navigate('home');
      return;
    }

    let isMounted = true;

    void loadChoiceQuestions().then((allQuestions) => {
      if (!isMounted) {
        return;
      }

      setQuestions(buildDailyQuestions(allQuestions));
    });

    return () => {
      isMounted = false;
    };
  }, [finished, navigate, showToast, state.lastDailyDate]);

  const handleFinish = () => {
    setFinished(true);
    const passed = score >= 3; // 60% to pass
    const xpEarned = DAILY_XP_REWARD;

    if (passed) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    updateState((prev) => {
      const s = { ...prev };
      s.totalXP += xpEarned;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toDateString();

      s.lastDailyDate = todayStr;

      // Обновляем стрик по нормализованной дате.
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

    showToast(
      `Ежедневный квиз пройден! +${xpEarned} XP`,
      passed ? 'text-brand-green' : 'text-brand-amber'
    );
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;

    if (!answered) {
      const q = questions[currentIdx];
      if (selectedOption === q.ans) {
        setScore((prev) => prev + 1);
      }
      setAnswered(true);
    } else {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
      } else {
        handleFinish();
      }
    }
  };

  if (questions.length === 0)
    return <div className="p-10 text-center text-slate-400">Загрузка квиза...</div>;

  if (finished) {
    const passed = score >= 3;
    const xpEarned = DAILY_XP_REWARD;

    return (
      <div className="mx-auto w-full max-w-[500px] p-6 pt-20 text-center">
        <div className="mb-6 text-6xl">{passed ? '🌟' : '👍'}</div>
        <h2 className="mb-2 text-3xl font-extrabold text-white">Дейлик завершен!</h2>
        <p className="mb-8 text-slate-400">
          Правильных ответов:{' '}
          <span className={`font-bold ${passed ? 'text-brand-green' : 'text-brand-amber'}`}>
            {score} / 5
          </span>
        </p>

        <div className="glass-panel mb-8 p-6 text-left">
          <div className="mb-4 text-sm text-slate-300">
            {passed
              ? 'Отличная работа! Ты поддерживаешь свои знания в тонусе. Возвращайся завтра за новой порцией вопросов.'
              : 'Хорошая попытка! Повторение - мать учения. Завтра будет новый шанс улучшить результат.'}
          </div>
          <div className="bg-brand-amber/10 border-brand-amber/30 flex items-center justify-between rounded-xl border p-3">
            <span className="text-brand-amber text-sm font-bold">+{xpEarned} XP</span>
            <span className="text-brand-amber text-xl">🔥</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('stats')}
            className="glass-button w-full py-4 font-bold tracking-wide text-white uppercase"
          >
            К статистике
          </button>
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
        title="Прервать квиз?"
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
          <div className="text-brand-amber font-mono text-lg font-bold">🔥 ДЕЙЛИК</div>
        </div>
        <div className="mx-auto h-2.5 max-w-[600px] overflow-hidden rounded-full border border-white/5 bg-black/30">
          <div
            className="bg-brand-amber h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentIdx / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col p-6">
        <div className="text-brand-amber mb-4 font-mono text-sm font-bold tracking-widest uppercase">
          Вопрос {currentIdx + 1} из 5
        </div>
        <h2 className="mb-8 text-[22px] leading-snug font-semibold text-white">
          {compactQuestionText(q.q)}
        </h2>

        <div className="flex flex-1 flex-col gap-3">
          {(q.opts || []).map((opt: string, idx: number) => {
            const optionText = compactChoiceOptionText(opt);
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
                title={opt}
                onClick={() => setSelectedOption(idx)}
                className={`rounded-2xl border-[1.5px] px-4 py-3 text-left backdrop-blur-md transition-all duration-200 ${bgClass} ${borderClass} ${textClass} ${!answered && 'hover:border-white/20 hover:bg-white/10'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] ${selectedOption === idx || (answered && idx === q.ans) ? borderClass : 'border-white/20'}`}
                  >
                    {(selectedOption === idx || (answered && idx === q.ans)) && (
                      <div
                        className={`h-3 w-3 rounded-full ${answered && idx === q.ans ? 'bg-brand-green' : answered && idx === selectedOption ? 'bg-brand-red' : 'bg-brand-amber'}`}
                      ></div>
                    )}
                  </div>
                  <span className="flex-1 text-[15px] leading-relaxed">{optionText}</span>
                </div>
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={`mt-6 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${selectedOption === q.ans ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
          >
            <div
              className={`mb-1 font-extrabold ${selectedOption === q.ans ? 'text-brand-green' : 'text-brand-red'}`}
            >
              {selectedOption === q.ans ? '✅ Верно!' : '❌ Ошибка!'}
            </div>
            <div className="text-slate-300">{q.exp}</div>
          </div>
        )}

        <div className="mt-8">
          <button
            disabled={selectedOption === null}
            onClick={handleAnswer}
            className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${selectedOption !== null ? (answered ? 'bg-brand-amber/80 border-brand-amber/50 hover:bg-brand-amber text-white' : 'border-white/20 bg-white/10 text-white hover:bg-white/20') : 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500'}`}
          >
            {answered ? (currentIdx === questions.length - 1 ? 'ЗАВЕРШИТЬ' : 'ДАЛЕЕ') : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </div>
    </div>
  );
}
