import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';
import { loadChoiceQuestions } from '../data/content_loaders';
import { getLocalDateKey } from '../domain/dates';
import { finalizeDailyQuizResult, getAchievementUnlockTitles } from '../domain/progression';
import { useQuestionTransition } from '../hooks/useQuestionTransition';
import { useAppStore } from '../store';
import type { QuestionChoice } from '../types';
import {
  compactQuestionText,
  getChoiceOptionDisplayTexts,
  prepareQuestionsWithShuffledChoices,
  shuffle,
} from '../utils';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const { isTransitioning, runQuestionTransition } = useQuestionTransition();

  useEffect(() => {
    if (finished) {
      return;
    }

    setLoadError(null);

    const todayKey = getLocalDateKey();

    if (state.lastDailyDate === todayKey) {
      showToast('Ты уже прошёл ежедневный квиз сегодня!', 'text-brand-amber');
      navigate('home');
      return;
    }

    let isMounted = true;

    void loadChoiceQuestions()
      .then((allQuestions) => {
        if (!isMounted) {
          return;
        }

        if (allQuestions.length === 0) {
          setLoadError('Не удалось подобрать вопросы для дейлика. Попробуй позже.');
          return;
        }

        setQuestions(buildDailyQuestions(allQuestions));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load daily questions:', error);
        setLoadError('Ошибка загрузки ежедневного квиза. Попробуй снова.');
        showToast('Ошибка загрузки дейлика', 'text-brand-red');
      });

    return () => {
      isMounted = false;
    };
  }, [finished, navigate, showToast, state.lastDailyDate]);

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[600px] flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel w-full p-6">
          <div className="mb-3 text-4xl">⚠️</div>
          <div className="mb-4 text-sm leading-relaxed text-slate-300">{loadError}</div>
          <button
            type="button"
            className="glass-button w-full py-3 font-bold uppercase"
            onClick={() => navigate('home')}
          >
            ← На главную
          </button>
        </div>
      </div>
    );
  }

  const handleFinish = () => {
    setFinished(true);
    const passed = score >= 3;
    const result = finalizeDailyQuizResult(state, {
      todayKey: getLocalDateKey(),
      rewardXP: DAILY_XP_REWARD,
    });

    if (passed) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    updateState(result.nextState);

    for (const title of getAchievementUnlockTitles(result.unlockedAchievements)) {
      showToast(`🏆 Достижение: ${title}!`, 'text-brand-amber');
    }

    showToast(
      `Ежедневный квиз пройден! +${result.awardedXP} XP`,
      passed ? 'text-brand-green' : 'text-brand-amber'
    );
  };

  const handleAnswer = () => {
    if (selectedOption === null || isTransitioning) {
      return;
    }

    if (!answered) {
      const question = questions[currentIdx];

      if (selectedOption === question.ans) {
        setScore((prev) => prev + 1);
      }

      setAnswered(true);
      return;
    }

    runQuestionTransition(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setAnswered(false);
        return;
      }

      handleFinish();
    });
  };

  if (questions.length === 0) {
    return <div className="p-10 text-center text-slate-400">Загрузка квиза...</div>;
  }

  if (finished) {
    const passed = score >= 3;
    const xpEarned = DAILY_XP_REWARD;

    return (
      <div className="mx-auto w-full max-w-[500px] p-4 pt-16 text-center sm:p-6 sm:pt-20">
        <div className="mb-6 text-6xl">{passed ? '🌟' : '👍'}</div>
        <h2 className="mb-2 text-2xl font-extrabold text-white sm:text-3xl">Дейлик завершён!</h2>
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
              : 'Хорошая попытка! Повторение помогает закрепить материал. Завтра будет новый шанс улучшить результат.'}
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

  const question = questions[currentIdx];
  const choiceOptionTexts = getChoiceOptionDisplayTexts(question.opts);

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

      <div className="solid-header p-3 sm:p-4">
        <div className="mx-auto mb-3 flex max-w-[600px] items-center justify-between">
          <button
            onClick={() => setShowConfirm(true)}
            className="mobile-tap-target text-sm font-bold text-slate-400 transition-colors hover:text-white"
          >
            ✕ ПРЕРВАТЬ
          </button>
          <div className="text-brand-amber font-mono text-base font-bold sm:text-lg">🔥 ДЕЙЛИК</div>
        </div>
        <div className="mx-auto h-2.5 max-w-[600px] overflow-hidden rounded-full border border-white/5 bg-black/30">
          <div
            className="bg-brand-amber h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentIdx / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col p-4 sm:p-6">
        <div
          key={currentIdx}
          className={isTransitioning ? 'question-stage-exit' : 'question-stage-enter'}
        >
          <div className="text-brand-amber mb-4 font-mono text-sm font-bold tracking-widest uppercase">
            Вопрос {currentIdx + 1} из 5
          </div>
          <h2 className="mb-6 text-[20px] leading-snug font-semibold text-white sm:mb-8 sm:text-[22px]">
            {compactQuestionText(question.q)}
          </h2>

          <div className="flex flex-1 flex-col gap-3">
            {question.opts.map((_, idx) => {
              const optionText = choiceOptionTexts[idx];
              const isSelected = selectedOption === idx;
              let bgClass = 'bg-white/5';
              let borderClass = 'border-white/10';
              let textClass = 'text-slate-300';

              if (answered) {
                if (idx === question.ans) {
                  bgClass = 'bg-brand-green/10';
                  borderClass = 'border-brand-green/50';
                  textClass = 'text-brand-green font-bold';
                } else if (isSelected) {
                  bgClass = 'bg-brand-red/10';
                  borderClass = 'border-brand-red/50';
                  textClass = 'text-brand-red font-bold';
                }
              } else if (isSelected) {
                bgClass = 'bg-brand-amber/10';
                borderClass = 'border-brand-amber/50';
                textClass = 'text-white font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={answered || isTransitioning}
                  onClick={() => setSelectedOption(idx)}
                  className={`min-h-[74px] rounded-2xl border-[1.5px] px-3.5 py-3 text-left backdrop-blur-md transition-all duration-300 ease-out sm:min-h-[86px] sm:px-4 ${isSelected && !answered ? 'answer-choice-selected' : ''} ${bgClass} ${borderClass} ${textClass} ${!answered && !isTransitioning ? 'hover:border-white/20 hover:bg-white/10' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] ${isSelected || (answered && idx === question.ans) ? borderClass : 'border-white/20'}`}
                    >
                      {(isSelected || (answered && idx === question.ans)) && (
                        <div
                          className={`h-3 w-3 rounded-full ${answered && idx === question.ans ? 'bg-brand-green' : answered && isSelected ? 'bg-brand-red' : 'bg-brand-amber'}`}
                        ></div>
                      )}
                    </div>
                    <span className="flex-1 text-[14px] leading-relaxed sm:text-[15px]">
                      {optionText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={`mt-6 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${selectedOption === question.ans ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
            >
              <div
                className={`mb-1 font-extrabold ${selectedOption === question.ans ? 'text-brand-green' : 'text-brand-red'}`}
              >
                {selectedOption === question.ans ? '✅ Верно!' : '❌ Ошибка!'}
              </div>
              <div className="text-slate-300">{question.exp}</div>
            </div>
          )}

          <div className="mt-8">
            <button
              disabled={selectedOption === null || isTransitioning}
              onClick={handleAnswer}
              className={`w-full rounded-xl border py-3.5 font-bold tracking-wide uppercase backdrop-blur-md transition-all sm:py-4 ${selectedOption !== null && !isTransitioning ? (answered ? 'bg-brand-amber/80 border-brand-amber/50 hover:bg-brand-amber text-white' : 'border-white/20 bg-white/10 text-white hover:bg-white/20') : 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500'}`}
            >
              {answered
                ? currentIdx === questions.length - 1
                  ? 'ЗАВЕРШИТЬ'
                  : 'ДАЛЕЕ'
                : 'ПРОВЕРИТЬ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
