import { useAppStore } from '../store';
import { preloadLessonsContent, preloadPracticeTasksContent } from '../data/content_loaders';
import { LESSON_META } from '../data/lesson_meta';
import { PRACTICE_TASK_META } from '../data/practice_task_meta';
import { QUOTES } from '../data/quotes';
import { getLessonSessionQuestionCount } from '../domain/lesson_session';
import { getLevelInfo, getTimeOfDayGreeting, plural } from '../utils';
import { useState, useRef, useEffect } from 'react';
import DevMenu from '../components/DevMenu';
import { getLocalDateKey } from '../domain/dates';

function buildLessonOutlinePaths(width: number, height: number) {
  const inset = 1.5;
  const left = inset;
  const top = inset;
  const right = Math.max(width - inset, left);
  const bottom = Math.max(height - inset, top);
  const radius = Math.min(24, (right - left) / 2, (bottom - top) / 2);
  const centerX = width / 2;

  const leftPath = [
    `M ${centerX} ${bottom}`,
    `L ${left + radius} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - radius}`,
    `L ${left} ${top + radius}`,
    `Q ${left} ${top} ${left + radius} ${top}`,
    `L ${centerX} ${top}`,
  ].join(' ');

  const rightPath = [
    `M ${centerX} ${bottom}`,
    `L ${right - radius} ${bottom}`,
    `Q ${right} ${bottom} ${right} ${bottom - radius}`,
    `L ${right} ${top + radius}`,
    `Q ${right} ${top} ${right - radius} ${top}`,
    `L ${centerX} ${top}`,
  ].join(' ');

  return [leftPath, rightPath];
}

function CardOutline({
  color,
  hovered = false,
  opening = false,
  variant = 'interactive',
  pulseMode = 'default',
}: {
  color: string;
  hovered?: boolean;
  opening?: boolean;
  variant?: 'interactive' | 'ambient';
  pulseMode?: 'default' | 'soft';
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;

    const updateSize = () => {
      const nextWidth = node.clientWidth;
      const nextHeight = node.clientHeight;

      setSize((prev) =>
        prev.width === nextWidth && prev.height === nextHeight
          ? prev
          : { width: nextWidth, height: nextHeight }
      );
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const isAmbient = variant === 'ambient';
  const outlineProgress = isAmbient ? 1 : opening ? 1 : hovered ? 0.5 : 0;
  const outlineDashArray = `${outlineProgress} 1`;
  const outlineTransition = opening
    ? '620ms cubic-bezier(0.22, 1, 0.36, 1)'
    : '420ms cubic-bezier(0.22, 1, 0.36, 1)';
  const hasSize = size.width > 0 && size.height > 0;
  const viewBoxWidth = Math.max(size.width, 1);
  const viewBoxHeight = Math.max(size.height, 1);
  const [leftPath, rightPath] = buildLessonOutlinePaths(viewBoxWidth, viewBoxHeight);
  const paths = [
    { id: 'left', d: leftPath },
    { id: 'right', d: rightPath },
  ];
  const isActive = isAmbient || opening || hovered;
  const isSoftPulse = isAmbient && pulseMode === 'soft';
  const glowOpacity = isAmbient ? (isSoftPulse ? 0.16 : 0.22) : 0.5;
  const lineOpacity = isAmbient ? (isSoftPulse ? 0.38 : 0.5) : 1;
  const glowFilter = isAmbient
    ? `blur(2px) drop-shadow(0 0 ${isSoftPulse ? '7px' : '9px'} ${color}38) drop-shadow(0 0 ${isSoftPulse ? '12px' : '16px'} ${color}18)`
    : `blur(3px) drop-shadow(0 0 10px ${color}88) drop-shadow(0 0 24px ${color}55)`;
  const lineFilter = isAmbient
    ? `drop-shadow(0 0 ${isSoftPulse ? '4px' : '5px'} ${color}44) drop-shadow(0 0 ${isSoftPulse ? '8px' : '11px'} ${color}1c)`
    : `drop-shadow(0 0 6px ${color}aa) drop-shadow(0 0 18px ${color}55)`;
  const pulseClassName = isAmbient
    ? isSoftPulse
      ? 'ambient-card-outline-pulse-soft'
      : 'ambient-card-outline-pulse'
    : undefined;

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-visible"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    >
      {hasSize &&
        paths.map((path) => (
          <g key={path.id} className={pulseClassName}>
            <path
              d={path.d}
              pathLength={1}
              fill="none"
              stroke={`color-mix(in srgb, ${color} 82%, white 18%)`}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                opacity: isActive ? glowOpacity : 0,
                strokeDasharray: outlineDashArray,
                transition: `opacity ${outlineTransition}, stroke-dasharray ${outlineTransition}`,
                filter: isActive ? glowFilter : 'none',
              }}
            />
            <path
              d={path.d}
              pathLength={1}
              fill="none"
              stroke={`color-mix(in srgb, ${color} 88%, white 12%)`}
              strokeWidth="1.55"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{
                opacity: isActive ? lineOpacity : 0,
                strokeDasharray: outlineDashArray,
                transition: `opacity ${outlineTransition}, stroke-dasharray ${outlineTransition}`,
                filter: isActive ? lineFilter : 'none',
              }}
            />
          </g>
        ))}
    </svg>
  );
}

export default function Home() {
  const { state, navigate, updateState } = useAppStore();
  const lvl = getLevelInfo(state.totalXP);

  const [now, setNow] = useState(() => new Date());
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [openingLessonId, setOpeningLessonId] = useState<string | null>(null);
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openLessonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
    pressTimer.current = setTimeout(() => {
      setShowDevMenu(true);
    }, 1000);
  };

  const handlePointerUpOrLeave = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const handleLessonOpen = (lessonId: string, locked: boolean) => {
    if (locked || openingLessonId) return;

    setOpeningLessonId(lessonId);
    openLessonTimer.current = setTimeout(() => {
      navigate('lesson', lessonId);
      openLessonTimer.current = null;
    }, 460);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
      if (openLessonTimer.current) {
        clearTimeout(openLessonTimer.current);
        openLessonTimer.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const greetingTimer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(greetingTimer);
  }, []);

  useEffect(() => {
    preloadLessonsContent();
    preloadPracticeTasksContent();

    const today = getLocalDateKey();

    if (state.dailyQuoteDate !== today) {
      updateState({
        lastQuoteIndex: Math.floor(Math.random() * QUOTES.length),
        dailyQuoteDate: today,
      });
    }
  }, [state.dailyQuoteDate, updateState]);

  const quote = QUOTES[state.lastQuoteIndex % QUOTES.length];
  const greeting = getTimeOfDayGreeting(now);

  const categories = Array.from(new Set(LESSON_META.map((lesson) => lesson.category)));
  const today = getLocalDateKey();
  const dailyDone = state.lastDailyDate === today;
  const practDone = state.completedPractice?.length || 0;

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="solid-header p-4">
        <div className="mx-auto max-w-[600px]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="cursor-pointer text-2xl select-none"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}
              >
                🧪
              </span>
              <div>
                <div className="text-brand-green font-mono text-[10px] tracking-[3px]">
                  QA TRAINER
                </div>
                <div className="text-lg font-extrabold text-white">{greeting}, тестировщик!</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="glass-button px-3 py-2 text-xs"
                onClick={() => navigate('achievements')}
              >
                🏆
              </button>
              <button className="glass-button px-3 py-2 text-xs" onClick={() => navigate('stats')}>
                📊
              </button>
              <button
                className="glass-button px-3 py-2 text-xs"
                onClick={() => navigate('certificate')}
              >
                🎓
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-4 gap-2">
            {[
              { icon: '⚡', val: state.totalXP, label: 'XP', color: 'text-brand-amber' },
              { icon: '🎯', val: lvl.level, label: 'Уровень', color: 'text-brand-green' },
              { icon: '🔥', val: state.streak, label: 'Серия', color: 'text-brand-red' },
              {
                icon: '✅',
                val: `${state.completedLessons.length}/${LESSON_META.length}`,
                label: 'Уроки',
                color: 'text-brand-blue',
              },
            ].map((s, i) => (
              <div key={i} className="glass-panel rounded-xl p-2 text-center">
                <div className="mb-1 text-base">{s.icon}</div>
                <div className={`font-mono text-lg font-extrabold ${s.color}`}>{s.val}</div>
                <div className="mt-1 text-[9px] tracking-[1.5px] text-slate-300 uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="mb-1 flex justify-between text-[11px] text-slate-300">
              <span>
                Уровень {lvl.level} — {lvl.name}
              </span>
              <span>
                {lvl.xpInLevel} / {lvl.xpToNext} XP
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-black/30">
              <div
                className="bg-brand-amber h-full rounded-full transition-all duration-500"
                style={{ width: `${lvl.pct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[600px] px-5 pt-5">
        {/* Quote */}
        <div className="relative mb-6">
          <CardOutline color="#34d399" variant="ambient" pulseMode="soft" />
          <div className="glass-panel liquid-accent-surface quote-liquid-surface border-brand-green/30 bg-brand-green/5 relative flex items-start gap-3 p-4">
            <span className="relative z-[1] mt-0.5 shrink-0 text-xl">💬</span>
            <div className="relative z-[1]">
              <div className="text-brand-green mb-1 font-mono text-[11px] font-bold tracking-[2px]">
                ЦИТАТА ДНЯ
              </div>
              <div className="text-[13px] leading-relaxed text-white italic">"{quote.text}"</div>
              <div className="mt-1 text-[11px] text-slate-300">
                — {quote.author}, "{quote.book}"
              </div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        {categories.map((cat, catIdx) => {
          const catLessons = LESSON_META.filter((lesson) => lesson.category === cat);
          const prevCat = catIdx > 0 ? categories[catIdx - 1] : null;
          const prevCatLessons = prevCat
            ? LESSON_META.filter((lesson) => lesson.category === prevCat)
            : [];

          const catUnlocked =
            catIdx === 0 || prevCatLessons.every((l) => state.completedLessons.includes(l.id));
          const catDone = catLessons.filter((l) => state.completedLessons.includes(l.id)).length;

          return (
            <div key={cat} className="mb-7">
              <div
                className={`font-mono text-[10px] ${catUnlocked ? 'text-white' : 'text-slate-400'} mb-3 flex items-center gap-2 tracking-[3px] uppercase`}
              >
                <span className="h-[1px] flex-1 bg-white/20"></span>
                <span>
                  {!catUnlocked && '🔒 '}
                  {cat}
                </span>
                {catUnlocked && (
                  <span className="text-[9px] font-bold tracking-normal text-slate-300">
                    {catDone}/{catLessons.length}
                  </span>
                )}
                <span className="h-[1px] flex-1 bg-white/20"></span>
              </div>

              {catLessons.map((lesson, idxInCat) => {
                const done = state.completedLessons.includes(lesson.id);
                let locked = !catUnlocked;
                if (catUnlocked && idxInCat > 0) {
                  locked = !state.completedLessons.includes(catLessons[idxInCat - 1].id);
                }
                const isOpening = openingLessonId === lesson.id;
                const isHovered = hoveredLessonId === lesson.id;
                const lessonRunQuestionCount = getLessonSessionQuestionCount(lesson.questionCount);
                const questionCountLabel =
                  lesson.questionCount > lessonRunQuestionCount
                    ? `${lessonRunQuestionCount} из ${lesson.questionCount} вопросов`
                    : `${lesson.questionCount} вопросов`;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonOpen(lesson.id, locked)}
                    onMouseEnter={() => !locked && setHoveredLessonId(lesson.id)}
                    onMouseLeave={() =>
                      setHoveredLessonId((prev) => (prev === lesson.id ? null : prev))
                    }
                    className={`relative mb-3 overflow-visible transition-all duration-300 ${locked ? 'cursor-default opacity-50' : 'cursor-pointer hover:translate-x-1'} ${openingLessonId === lesson.id ? 'scale-[0.995]' : ''}`}
                  >
                    {!locked && (
                      <CardOutline color={lesson.color} hovered={isHovered} opening={isOpening} />
                    )}
                    <div
                      className={`glass-panel relative overflow-hidden p-4 transition-all duration-300 ${locked ? '' : 'hover:bg-white/10'} ${done ? 'border-opacity-50' : ''}`}
                      style={{
                        borderColor: !locked && !done ? 'rgba(255,255,255,0.2)' : undefined,
                      }}
                    >
                      {done && (
                        <div
                          className="absolute top-0 right-0 rounded-bl-xl px-2.5 py-1 font-mono text-[9px] font-extrabold tracking-[1px] text-black"
                          style={{ backgroundColor: lesson.color }}
                        >
                          ГОТОВО ✓
                        </div>
                      )}
                      <div className="relative z-[1] flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-black/20 text-2xl"
                          style={{
                            borderColor: locked ? 'rgba(255,255,255,0.1)' : `${lesson.color}50`,
                          }}
                        >
                          {locked ? '🔒' : lesson.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 text-sm font-bold text-white">{lesson.title}</div>
                          <div className="mb-2 truncate text-xs text-slate-300">{lesson.desc}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-slate-300">
                              {questionCountLabel}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span className="bg-brand-amber/20 text-brand-amber border-brand-amber/30 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold">
                              До {Math.round(lesson.xp * 1.5)} XP
                            </span>
                          </div>
                        </div>
                        {!locked && (
                          <div
                            className={`shrink-0 text-lg transition-all duration-200 ${openingLessonId === lesson.id ? 'translate-x-0.5 text-white' : ''}`}
                            style={{
                              color: openingLessonId === lesson.id ? undefined : lesson.color,
                            }}
                          >
                            ›
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Extra Modes */}
        <div className="pb-10">
          <div className={`relative mb-3 ${dailyDone ? 'opacity-60' : ''}`}>
            <CardOutline color="#a78bfa" variant="ambient" />
            <div
              onClick={() => !dailyDone && navigate('daily')}
              className={`glass-panel liquid-accent-surface border-purple-400/30 bg-purple-400/5 p-4 transition-all duration-300 ${dailyDone ? 'cursor-default' : 'cursor-pointer hover:bg-purple-400/10'}`}
            >
              <div className="relative z-[1] flex items-center gap-3">
                <div className="text-3xl">{dailyDone ? '✅' : '📅'}</div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-extrabold text-white">
                    Ежедневный квиз {state.dailyStreak > 1 && `🔥${state.dailyStreak}`}
                  </div>
                  <div className="text-xs text-slate-300">
                    {dailyDone
                      ? 'Уже пройден сегодня — возвращайся завтра!'
                      : '5 случайных вопросов · +15 XP · Обновляется каждый день'}
                  </div>
                </div>
                {!dailyDone && <div className="text-brand-purple text-lg">›</div>}
              </div>
            </div>
          </div>

          {state.completedLessons.length >= 4 && (
            <div className="relative mb-3">
              <CardOutline color="#f87171" variant="ambient" />
              <div
                onClick={() => navigate('exam')}
                className="glass-panel liquid-accent-surface cursor-pointer border-red-400/30 bg-red-400/5 p-4 transition-all duration-300 hover:bg-red-400/10"
              >
                <div className="relative z-[1] flex items-center gap-3">
                  <div className="text-3xl">🎯</div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-extrabold text-white">Режим экзамена</div>
                    <div className="text-xs text-slate-300">
                      20 вопросов · 10 минут · Без подсказок{' '}
                      {state.examBestScore > 0 && (
                        <span>
                          · Рекорд:{' '}
                          <span className="text-brand-red font-extrabold">
                            {state.examBestScore}%
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-brand-red text-lg">›</div>
                </div>
              </div>
            </div>
          )}

          <div className="relative mb-3">
            <CardOutline color="#34d399" variant="ambient" />
            <div
              onClick={() => navigate('practice')}
              className="glass-panel liquid-accent-surface cursor-pointer border-emerald-400/30 bg-emerald-400/5 p-4 transition-all duration-300 hover:bg-emerald-400/10"
            >
              <div className="relative z-[1] flex items-center gap-3">
                <div className="text-3xl">🛠️</div>
                <div className="flex-1">
                  <div className="mb-1 text-sm font-extrabold text-white">Практические задания</div>
                  <div className="text-xs text-slate-300">
                    Реальные сценарии · {practDone}/{PRACTICE_TASK_META.length} пройдено
                  </div>
                </div>
                <div className="text-lg text-emerald-400">›</div>
              </div>
            </div>
          </div>

          {state.completedLessons.length === 0 ? (
            <div className="p-5 text-center text-[13px] leading-relaxed text-slate-300">
              <div className="mb-2 text-3xl">🚀</div>
              Начни с первого урока! Каждый профессиональный тестировщик начинал именно так.
            </div>
          ) : state.completedLessons.length < LESSON_META.length ? (
            <div className="glass-panel mt-1 p-4 text-center">
              <div className="mb-1 text-2xl">
                {state.completedLessons.length > LESSON_META.length / 2 ? '💪' : '🌱'}
              </div>
              <div className="mb-1 text-sm font-bold text-white">
                {Math.round((state.completedLessons.length / LESSON_META.length) * 100)}% пройдено
              </div>
              <div className="text-xs text-slate-300">
                Ещё {LESSON_META.length - state.completedLessons.length}{' '}
                {plural(
                  LESSON_META.length - state.completedLessons.length,
                  'урок',
                  'урока',
                  'уроков'
                )}{' '}
                до финала!
              </div>
            </div>
          ) : (
            <div className="glass-panel border-brand-green/40 bg-brand-green/10 p-5 text-center">
              <div className="mb-2 animate-bounce text-4xl">🏆</div>
              <div className="text-brand-green text-base font-extrabold">Все уроки пройдены!</div>
              <div className="mt-1.5 text-xs text-slate-300">
                Теперь испытай себя в режиме экзамена 👆
              </div>
            </div>
          )}
        </div>
      </div>
      {showDevMenu && <DevMenu onClose={() => setShowDevMenu(false)} />}
    </div>
  );
}
