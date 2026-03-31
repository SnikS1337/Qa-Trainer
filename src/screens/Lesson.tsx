import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';
import { loadLessonById } from '../data/content_loaders';
import { buildLessonSessionQuestions } from '../domain/lesson_session';
import { MOTIVATIONAL_MESSAGES } from '../data/messages';
import { finalizeLessonResult, getAchievementUnlockTitles } from '../domain/progression';
import { useQuestionTransition } from '../hooks/useQuestionTransition';
import { useAppStore } from '../store';
import type { Lesson as LessonType, Question } from '../types';
import { compactQuestionText, getChoiceOptionDisplayTexts } from '../utils';

export default function Lesson({ id }: { id: string }) {
  const { state, updateState, navigate, showToast } = useAppStore();

  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [awardedXP, setAwardedXP] = useState(0);
  const [wasReplay, setWasReplay] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isTransitioning, runQuestionTransition } = useQuestionTransition();

  useEffect(() => {
    let isMounted = true;
    setLoadError(null);

    void loadLessonById(id)
      .then((loadedLesson) => {
        if (!isMounted) {
          return;
        }

        if (!loadedLesson) {
          setLesson(null);
          setQuestions([]);
          setLoadError('Урок не найден. Вернись на главную и выбери другой урок.');
          return;
        }

        setLesson(loadedLesson);
        setQuestions(buildLessonSessionQuestions(loadedLesson.questions));
        setAwardedXP(0);
        setWasReplay(false);
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error('Failed to load lesson content:', error);
        setLesson(null);
        setQuestions([]);
        setLoadError('Не удалось загрузить урок. Попробуй открыть его снова.');
        showToast('Ошибка загрузки урока', 'text-brand-red');
      });

    return () => {
      isMounted = false;
      if (confettiTimerRef.current) {
        clearTimeout(confettiTimerRef.current);
      }
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
            onClick={() => navigate('home')}
          >
            ← На главную
          </button>
        </div>
      </div>
    );
  }

  const finishLesson = () => {
    if (!lesson) {
      return;
    }

    setFinished(true);

    const result = finalizeLessonResult(state, {
      lessonId: lesson.id,
      lessonXP: lesson.xp,
      correctAnswers: correct,
      totalQuestions: questions.length,
      heartsLeft: hearts,
    });

    setAwardedXP(result.awardedXP);
    setWasReplay(result.alreadyCompleted);
    updateState(result.nextState);

    for (const title of getAchievementUnlockTitles(result.unlockedAchievements)) {
      showToast(`🏆 Достижение: ${title}!`, 'text-brand-amber');
    }

    if (result.passed) {
      confettiTimerRef.current = setTimeout(() => confetti(), 200);
    }
  };

  const handleCheck = () => {
    if (isTransitioning) {
      return;
    }

    if (answered) {
      runQuestionTransition(() => {
        if (hearts === 0 || qIndex + 1 >= questions.length) {
          finishLesson();
          return;
        }

        setQIndex((prev) => prev + 1);
        setAnswered(false);
        setSelected(null);
        setSortOrder([]);
      });
      return;
    }

    const question = questions[qIndex];
    let isCorrect = false;

    if (question.type === 'choice') {
      isCorrect = selected === question.ans;
    }

    if (question.type === 'sort') {
      isCorrect = JSON.stringify(sortOrder) === JSON.stringify(question.correct);
    }

    setAnswered(true);

    let nextHearts = hearts;
    let nextCorrect = correct;

    if (isCorrect) {
      nextCorrect += 1;
    } else {
      nextHearts -= 1;
    }

    setCorrect(nextCorrect);
    setHearts(nextHearts);

    updateState((prev) => {
      const nextState = { ...prev };
      nextState.totalQuestionsAnswered += 1;
      if (isCorrect) {
        nextState.totalCorrect += 1;
      }
      return nextState;
    });
  };

  if (!lesson || questions.length === 0) {
    return <div className="p-10 text-center text-slate-400">Подготавливаем урок...</div>;
  }

  if (finished) {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60 && hearts > 0;
    const perfect = correct === total && hearts === 3;
    const motivMsg = MOTIVATIONAL_MESSAGES.find((message) => pct >= message.pct)!;

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel w-full max-w-[400px] p-8">
          <div className="mb-4 animate-bounce text-[80px]">
            {perfect ? '🎉' : passed ? '💪' : '😤'}
          </div>
          <div className="mb-2 text-3xl font-extrabold text-white">{motivMsg.msg}</div>
          <div className="mb-7 text-[15px] leading-relaxed text-slate-300">{motivMsg.sub}</div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { label: 'Правильных', value: `${correct}/${total}`, className: 'text-brand-green' },
              {
                label: 'Результат',
                value: `${pct}%`,
                className: 'text-white',
                style: { color: lesson.color },
              },
              { label: 'XP получено', value: `+${awardedXP}`, className: 'text-brand-amber' },
              { label: 'Жизни', value: '❤️'.repeat(hearts) || '💀', className: 'text-brand-red' },
            ].map((item, index) => (
              <div key={index} className="glass-panel p-4 text-center">
                <div
                  className={`font-mono text-2xl font-extrabold ${item.className}`}
                  style={item.style}
                >
                  {item.value}
                </div>
                <div className="mt-1 text-[11px] tracking-[1px] text-slate-300 uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-green/10 text-brand-green border-brand-green/20 mb-6 rounded-xl border p-4 text-left text-[13px] leading-relaxed">
            💡 Практикуй каждый день: 15 минут регулярно лучше, чем 3 часа раз в неделю.
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="bg-brand-green/80 hover:bg-brand-green border-brand-green/50 w-full rounded-xl border py-4 font-bold tracking-wide text-white uppercase backdrop-blur-md transition-all"
              onClick={() => navigate('home')}
            >
              ← На главную
            </button>

            {(!passed || perfect) && (
              <button
                className="glass-button w-full py-4 font-bold tracking-wide text-white uppercase"
                onClick={() => {
                  setQIndex(0);
                  setHearts(3);
                  setCorrect(0);
                  setAnswered(false);
                  setSelected(null);
                  setSortOrder([]);
                  setAwardedXP(0);
                  setFinished(false);
                  setWasReplay(false);
                  setQuestions(buildLessonSessionQuestions(lesson.questions));
                }}
              >
                🔄 Повторить урок
              </button>
            )}
          </div>

          {passed && wasReplay && (
            <div className="mt-4 text-[12px] leading-relaxed text-slate-400">
              XP и прогресс за этот урок уже были начислены ранее. Повтор доступен только для
              практики.
            </div>
          )}
        </div>
      </div>
    );
  }

  const question = questions[qIndex];
  const progress = (qIndex / questions.length) * 100;
  const isReady =
    question.type === 'choice' ? selected !== null : sortOrder.length === question.items.length;
  const isCorrectAnswer =
    question.type === 'choice'
      ? selected === question.ans
      : JSON.stringify(sortOrder) === JSON.stringify(question.correct);
  const choiceOptionTexts =
    question.type === 'choice' ? getChoiceOptionDisplayTexts(question.opts) : [];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <ConfirmModal
        isOpen={showConfirm}
        title="Выйти из урока?"
        message="Прогресс не сохранится. Вы уверены?"
        confirmText="Да, прервать"
        onConfirm={() => navigate('home')}
        onCancel={() => setShowConfirm(false)}
      />

      <div className="solid-header p-3">
        <div className="mx-auto flex max-w-[600px] items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="mobile-tap-target p-1 text-xl text-slate-300 transition-colors hover:text-white"
          >
            ✕
          </button>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-white/5 bg-black/30">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: lesson.color }}
            ></div>
          </div>
          <div className="flex gap-1 text-xl">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`transition-all duration-300 ${index < hearts ? 'opacity-100 drop-shadow-[0_0_4px_#f87171]' : 'opacity-20 grayscale'}`}
              >
                {index < hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col p-4 sm:p-5">
        <div
          key={qIndex}
          className={isTransitioning ? 'question-stage-exit' : 'question-stage-enter'}
        >
          <div className="mb-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-bold tracking-[0.5px]"
              style={{
                backgroundColor: `${lesson.color}18`,
                color: lesson.color,
                borderColor: `${lesson.color}30`,
              }}
            >
              {lesson.icon} {lesson.title}
            </span>
          </div>

          <div className="mb-3 font-mono text-xs text-slate-300 sm:mb-4">
            Вопрос {qIndex + 1} из {questions.length}
          </div>

          <div
            className={`glass-panel mb-4 p-4 transition-colors duration-300 sm:mb-5 sm:p-5 ${answered ? (isCorrectAnswer ? 'border-brand-green/50 bg-brand-green/5' : 'border-brand-red/50 bg-brand-red/5') : ''}`}
          >
            <div className="text-[16px] leading-relaxed font-bold text-white sm:text-[17px]">
              {compactQuestionText(question.q)}
            </div>

            {question.type === 'sort' && (
              <div className="mt-2 text-xs text-slate-300">
                👇 Нажимай на варианты в правильном порядке
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2.5">
            {question.type === 'choice' &&
              question.opts.map((_, index) => {
                const optionText = choiceOptionTexts[index];
                const isSelected = selected === index;
                const isCorrectOption = question.ans === index;

                let bgClass = 'bg-white/5';
                let borderClass = 'border-white/10';
                let textClass = 'text-white';

                if (answered) {
                  if (isCorrectOption) {
                    bgClass = 'bg-brand-green/10';
                    borderClass = 'border-brand-green/50';
                    textClass = 'text-brand-green';
                  } else if (isSelected) {
                    bgClass = 'bg-brand-red/10';
                    borderClass = 'border-brand-red/50';
                    textClass = 'text-brand-red';
                  }
                } else if (isSelected) {
                  bgClass = 'bg-white/10';
                  borderClass = 'border-white/30';
                }

                return (
                  <button
                    key={index}
                    disabled={answered || isTransitioning}
                    onClick={() => setSelected(index)}
                    className={`flex min-h-[72px] w-full items-start gap-3 rounded-xl border-[1.5px] px-3 py-2.5 text-left text-[13px] font-semibold backdrop-blur-md transition-all duration-300 ease-out sm:min-h-[78px] sm:px-3.5 sm:py-3 sm:text-[14px] ${isSelected && !answered ? 'answer-choice-selected' : ''} ${bgClass} ${borderClass} ${textClass} ${!answered && !isTransitioning ? 'hover:border-white/20 hover:bg-white/10' : ''}`}
                    style={
                      !answered && isSelected
                        ? { borderColor: lesson.color, backgroundColor: `${lesson.color}18` }
                        : undefined
                    }
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-extrabold ${answered && isCorrectOption ? 'bg-brand-green/20 text-brand-green' : isSelected && !answered ? 'bg-white/20 text-white' : 'bg-black/30 text-slate-300'}`}
                      style={
                        !answered && isSelected
                          ? { backgroundColor: `${lesson.color}40`, color: lesson.color }
                          : undefined
                      }
                    >
                      {['A', 'B', 'C', 'D'][index]}
                    </span>
                    <span className="flex-1 leading-relaxed">{optionText}</span>
                    {answered && isCorrectOption && <span>✓</span>}
                    {answered && isSelected && !isCorrectOption && <span>✗</span>}
                  </button>
                );
              })}

            {question.type === 'sort' && (
              <>
                <div className="glass-panel mb-3 flex min-h-[56px] flex-col gap-1.5 border-dashed p-2 sm:min-h-[60px] sm:p-2.5">
                  {sortOrder.length === 0 ? (
                    <div className="p-1 text-xs text-slate-400">
                      Сюда появятся выбранные варианты...
                    </div>
                  ) : (
                    sortOrder.map((item, index) => (
                      <div
                        key={item}
                        onClick={() => {
                          if (answered || isTransitioning) {
                            return;
                          }

                          setSortOrder(sortOrder.filter((value) => value !== item));
                        }}
                        className="bg-brand-green/10 border-brand-green/30 flex cursor-pointer items-center justify-between rounded-lg border-[1.5px] px-2.5 py-2 text-[12px] font-semibold text-white sm:px-3 sm:text-[13px]"
                      >
                        <span>
                          {index + 1}. {item}
                        </span>
                        <span className="text-slate-400">✕</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {question.items.map((item) => {
                    const isSelected = sortOrder.includes(item);

                    return (
                      <button
                        key={item}
                        disabled={answered || isTransitioning}
                        onClick={() => {
                          if (isSelected) {
                            setSortOrder(sortOrder.filter((value) => value !== item));
                            return;
                          }

                          setSortOrder([...sortOrder, item]);
                        }}
                        className={`w-full rounded-xl border-[1.5px] p-2.5 text-left text-[12px] font-semibold text-white backdrop-blur-md transition-all duration-300 ease-out sm:p-3 sm:text-[13px] ${isSelected ? 'border-white/5 bg-black/20 opacity-35' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {answered && (
            <div
              className={`mt-4 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${isCorrectAnswer ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
            >
              <div
                className={`mb-1 font-extrabold ${isCorrectAnswer ? 'text-brand-green' : 'text-brand-red'}`}
              >
                {isCorrectAnswer ? '✅ Верно!' : '❌ Не совсем...'}
              </div>
              <div className="text-slate-300">{question.exp}</div>
            </div>
          )}

          <div className="mt-5">
            <button
              disabled={!isReady || isTransitioning}
              onClick={handleCheck}
              className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${isReady && !isTransitioning ? (answered ? (isCorrectAnswer ? 'bg-brand-green/80 border-brand-green/50 hover:bg-brand-green text-white' : 'bg-brand-red/80 border-brand-red/50 hover:bg-brand-red text-white') : 'border-white/20 text-white') : 'border-white/5 bg-black/20 text-slate-400 opacity-50'}`}
              style={{
                backgroundColor:
                  isReady && !answered && !isTransitioning ? `${lesson.color}CC` : undefined,
                borderColor: isReady && !answered && !isTransitioning ? lesson.color : undefined,
              }}
            >
              {answered ? 'ДАЛЬШЕ →' : 'ПРОВЕРИТЬ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
