import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { ACHIEVEMENTS } from '../data/achievements';
import { loadLessonById } from '../data/content_loaders';
import { MOTIVATIONAL_MESSAGES } from '../data/messages';
import type { AppState, Lesson as LessonType, Question } from '../types';
import { shuffle } from '../utils';
import confetti from 'canvas-confetti';
import ConfirmModal from '../components/ConfirmModal';

export default function Lesson({ id }: { id: string }) {
  const { updateState, navigate, showToast } = useAppStore();

  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
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
  const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perfectToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    void loadLessonById(id).then((loadedLesson) => {
      if (!isMounted) {
        return;
      }

      setLesson(loadedLesson);
      setQuestions(loadedLesson ? shuffle(loadedLesson.questions).slice(0, 6) : []);
    });

    return () => {
      isMounted = false;
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
      if (perfectToastTimerRef.current) clearTimeout(perfectToastTimerRef.current);
    };
  }, [id]);

  const checkAchievements = (newState: AppState) => {
    ACHIEVEMENTS.forEach((a) => {
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

    updateState((prev) => {
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
    const gainedXP = passed
      ? perfect
        ? Math.round(lesson!.xp * 1.5)
        : lesson!.xp
      : Math.round(lesson!.xp * 0.2);

    updateState((prev) => {
      const s = { ...prev };
      s.totalXP += gainedXP;
      s.streak = passed ? s.streak + 1 : 0;
      if (s.streak > s.maxStreak) s.maxStreak = s.streak;

      if (passed && !s.completedLessons.includes(lesson!.id)) {
        s.completedLessons.push(lesson!.id);
      }
      if (perfect) s.perfectLessons++;
      if (!passed) s.retries++;

      checkAchievements(s);
      return s;
    });

    if (passed) {
      confettiTimerRef.current = setTimeout(() => confetti(), 200);
      if (perfect) {
        perfectToastTimerRef.current = setTimeout(
          () => showToast('💎 Идеальный результат! +50% XP!', 'text-brand-amber'),
          1000
        );
      }
    }
  };

  if (!lesson || questions.length === 0) {
    return <div className="p-10 text-center text-slate-400">Подготавливаем урок...</div>;
  }

  if (finished) {
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 60 && hearts > 0;
    const perfect = correct === total && hearts === 3;
    const gainedXP = passed
      ? perfect
        ? Math.round(lesson.xp * 1.5)
        : lesson.xp
      : Math.round(lesson.xp * 0.2);
    const motivMsg = MOTIVATIONAL_MESSAGES.find((m) => pct >= m.pct)!;

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
              { l: 'Правильных', v: `${correct}/${total}`, c: 'text-brand-green' },
              { l: 'Результат', v: `${pct}%`, c: 'text-white', style: { color: lesson.color } },
              { l: 'XP получено', v: `+${gainedXP}`, c: 'text-brand-amber' },
              { l: 'Жизни', v: '❤️'.repeat(hearts) || '💀', c: 'text-brand-red' },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-4 text-center">
                <div className={`font-mono text-2xl font-extrabold ${s.c}`} style={s.style}>
                  {s.v}
                </div>
                <div className="mt-1 text-[11px] tracking-[1px] text-slate-300 uppercase">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-brand-green/10 text-brand-green border-brand-green/20 mb-6 rounded-xl border p-4 text-left text-[13px] leading-relaxed">
            💡 Практикуй каждый день — 15 минут регулярно лучше, чем 3 часа раз в неделю!
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
                  setConsecutiveCorrect(0);
                  setFinished(false);
                  setQuestions(shuffle(lesson.questions).slice(0, 6));
                }}
              >
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
  const isCorrectAns =
    q.type === 'choice'
      ? selected === q.ans
      : JSON.stringify(sortOrder) === JSON.stringify(q.correct);

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
      {/* Top bar */}
      <div className="solid-header p-3">
        <div className="mx-auto flex max-w-[600px] items-center gap-3">
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1 text-xl text-slate-300 transition-colors hover:text-white"
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
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`transition-all duration-300 ${i < hearts ? 'opacity-100 drop-shadow-[0_0_4px_#f87171]' : 'opacity-20 grayscale'}`}
              >
                {i < hearts ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[600px] flex-1 flex-col p-5">
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
        <div className="mb-4 font-mono text-xs text-slate-300">
          Вопрос {qIndex + 1} из {questions.length}
        </div>

        <div
          className={`glass-panel mb-5 p-5 transition-colors duration-300 ${answered ? (isCorrectAns ? 'border-brand-green/50 bg-brand-green/5' : 'border-brand-red/50 bg-brand-red/5') : ''}`}
        >
          <div className="text-[17px] leading-relaxed font-bold text-white">{q.q}</div>
          {q.type === 'sort' && (
            <div className="mt-2 text-xs text-slate-300">
              👇 Нажимай на варианты в правильном порядке (снизу вверх)
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2.5">
          {q.type === 'choice' &&
            q.opts.map((opt: string, i: number) => {
              const isSelected = selected === i;
              const isCorrectOption = q.ans === i;

              let bg = 'bg-white/5';
              let border = 'border-white/10';
              let text = 'text-white';

              if (answered) {
                if (isCorrectOption) {
                  bg = 'bg-brand-green/10';
                  border = 'border-brand-green/50';
                  text = 'text-brand-green';
                } else if (isSelected) {
                  bg = 'bg-brand-red/10';
                  border = 'border-brand-red/50';
                  text = 'text-brand-red';
                }
              } else if (isSelected) {
                bg = `bg-white/10`;
                border = 'border-white/30';
              }

              return (
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => setSelected(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left text-[14px] font-semibold backdrop-blur-md transition-all ${bg} ${border} ${text} ${!answered && 'hover:border-white/20 hover:bg-white/10'}`}
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
                    {['A', 'B', 'C', 'D'][i]}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {answered && isCorrectOption && <span>✓</span>}
                  {answered && isSelected && !isCorrectOption && <span>✗</span>}
                </button>
              );
            })}

          {q.type === 'sort' && (
            <>
              <div className="glass-panel mb-3 flex min-h-[60px] flex-col gap-1.5 border-dashed p-2.5">
                {sortOrder.length === 0 ? (
                  <div className="p-1 text-xs text-slate-400">
                    Сюда появятся выбранные варианты...
                  </div>
                ) : (
                  sortOrder.map((s, i) => (
                    <div
                      key={s}
                      onClick={() => !answered && setSortOrder(sortOrder.filter((x) => x !== s))}
                      className="bg-brand-green/10 border-brand-green/30 flex cursor-pointer items-center justify-between rounded-lg border-[1.5px] px-3 py-2 text-[13px] font-semibold text-white"
                    >
                      <span>
                        {i + 1}. {s}
                      </span>
                      <span className="text-slate-400">✕</span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-col gap-2">
                {q.items.map((item: string) => {
                  const isSelected = sortOrder.includes(item);
                  return (
                    <button
                      key={item}
                      disabled={answered}
                      onClick={() => {
                        if (isSelected) setSortOrder(sortOrder.filter((x) => x !== item));
                        else setSortOrder([...sortOrder, item]);
                      }}
                      className={`w-full rounded-xl border-[1.5px] p-3 text-left text-[13px] font-semibold text-white backdrop-blur-md transition-all ${isSelected ? 'border-white/5 bg-black/20 opacity-35' : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}`}
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
            className={`mt-4 rounded-2xl border-l-[3px] p-4 text-[13px] leading-relaxed backdrop-blur-md ${isCorrectAns ? 'bg-brand-green/10 border-brand-green' : 'bg-brand-red/10 border-brand-red'}`}
          >
            <div
              className={`mb-1 font-extrabold ${isCorrectAns ? 'text-brand-green' : 'text-brand-red'}`}
            >
              {isCorrectAns ? '✅ Верно!' : '❌ Не совсем...'}
            </div>
            <div className="text-slate-300">{q.exp}</div>
          </div>
        )}

        {answered && currentStreak >= 3 && (
          <div className="text-brand-amber glass-panel border-brand-amber/30 mt-4 animate-pulse rounded-2xl border p-4 text-center text-[13px] leading-relaxed font-bold backdrop-blur-xl">
            🔥 {currentStreak} подряд!
          </div>
        )}

        <div className="mt-5">
          <button
            disabled={!isReady}
            onClick={handleCheck}
            className={`w-full rounded-xl border py-4 font-bold tracking-wide uppercase backdrop-blur-md transition-all ${isReady ? (answered ? (isCorrectAns ? 'bg-brand-green/80 border-brand-green/50 hover:bg-brand-green text-white' : 'bg-brand-red/80 border-brand-red/50 hover:bg-brand-red text-white') : 'border-white/20 text-white') : 'border-white/5 bg-black/20 text-slate-400 opacity-50'}`}
            style={{
              backgroundColor: isReady && !answered ? `${lesson.color}CC` : undefined,
              borderColor: isReady && !answered ? lesson.color : undefined,
            }}
          >
            {answered ? 'ДАЛЬШЕ →' : 'ПРОВЕРИТЬ'}
          </button>
        </div>
      </div>
    </div>
  );
}
