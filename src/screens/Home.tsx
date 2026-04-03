import { useAppStore } from '../store';
import { preloadLessonsContent, preloadPracticeTasksContent } from '../data/content_loaders';
import { LESSON_META } from '../data/lesson_meta';
import { PRACTICE_TASK_META } from '../data/practice_task_meta';
import { QUOTES } from '../data/quotes';
import { getLevelInfo, getTimeOfDayGreeting, plural } from '../utils';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import DevMenu from '../components/DevMenu';
import TiltedSurface from '../components/TiltedSurface';
import CardOutline from '../components/home/CardOutline';
import HomeQuoteDock from '../components/home/HomeQuoteDock';
import { getLocalDateKey } from '../domain/dates';

const QUOTE_VISIBILITY_STORAGE_KEY = 'qa_trainer_quote_hidden_date';
const QUOTE_HIDE_ANIMATION_MS = 420;
const COMPLETE_PANEL_COOLDOWN_MS = 3000;
const COMPLETE_PANEL_CELEBRATION_MS = 1800;

type CompleteStarParticle = {
  id: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  rotate: number;
};

function createCompleteStarParticles() {
  return Array.from({ length: 20 }, (_, index) => {
    const x = 6 + Math.random() * 88;
    const delay = Math.random() * 240;
    const duration = 980 + Math.random() * 520;
    const size = 10 + Math.round(Math.random() * 8);
    const drift = -26 + Math.random() * 52;
    const rotate = -32 + Math.random() * 64;

    return {
      id: `star-${index}-${Math.round(x * 10)}`,
      x,
      delay,
      duration,
      size,
      drift,
      rotate,
    };
  });
}

export default function Home() {
  const { state, navigate, updateState } = useAppStore();
  const lvl = getLevelInfo(state.totalXP);
  const today = getLocalDateKey();

  const [now, setNow] = useState(() => new Date());
  const [scrollGlassProgress, setScrollGlassProgress] = useState(0);
  const [isQuoteCollapsed, setIsQuoteCollapsed] = useState(() => {
    try {
      return localStorage.getItem(QUOTE_VISIBILITY_STORAGE_KEY) === today;
    } catch {
      return false;
    }
  });
  const [isQuoteExpandedRendered, setIsQuoteExpandedRendered] = useState(() => !isQuoteCollapsed);
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [openingLessonId, setOpeningLessonId] = useState<string | null>(null);
  const [hoveredLessonId, setHoveredLessonId] = useState<string | null>(null);
  const [isPageScrolling, setIsPageScrolling] = useState(false);
  const isPageScrollingRef = useRef(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openLessonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteUnmountTimerRef = useRef<number | null>(null);
  const completeCelebrateTimerRef = useRef<number | null>(null);
  const quoteExpandedRef = useRef<HTMLDivElement | null>(null);
  const [quoteExpandedHeight, setQuoteExpandedHeight] = useState(0);
  const [completeCelebrationKey, setCompleteCelebrationKey] = useState(0);
  const [isCompleteCelebrating, setIsCompleteCelebrating] = useState(false);
  const [completeCooldownUntil, setCompleteCooldownUntil] = useState(0);
  const [completeStarParticles, setCompleteStarParticles] = useState<CompleteStarParticle[]>([]);

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

  const handleKeyboardActivation = (event: KeyboardEvent<HTMLElement>, action: () => void) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    action();
  };

  const handleLessonOpen = (lessonId: string, locked: boolean) => {
    if (locked || openingLessonId || isPageScrolling) return;

    setOpeningLessonId(lessonId);
    openLessonTimer.current = setTimeout(() => {
      navigate('lesson', lessonId);
      openLessonTimer.current = null;
    }, 460);
  };

  useEffect(() => {
    isPageScrollingRef.current = isPageScrolling;
  }, [isPageScrolling]);

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
      if (scrollIdleTimer.current) {
        clearTimeout(scrollIdleTimer.current);
        scrollIdleTimer.current = null;
      }
      if (quoteUnmountTimerRef.current) {
        window.clearTimeout(quoteUnmountTimerRef.current);
        quoteUnmountTimerRef.current = null;
      }
      if (completeCelebrateTimerRef.current) {
        window.clearTimeout(completeCelebrateTimerRef.current);
        completeCelebrateTimerRef.current = null;
      }
    };
  }, []);

  const handleCompletePanelCelebrate = () => {
    const nowMs = Date.now();
    if (isCompleteCelebrating || nowMs < completeCooldownUntil) {
      return;
    }

    if (completeCelebrateTimerRef.current) {
      window.clearTimeout(completeCelebrateTimerRef.current);
      completeCelebrateTimerRef.current = null;
    }

    setCompleteStarParticles(createCompleteStarParticles());
    setCompleteCelebrationKey((prev) => prev + 1);
    setIsCompleteCelebrating(true);
    setCompleteCooldownUntil(nowMs + COMPLETE_PANEL_COOLDOWN_MS);

    completeCelebrateTimerRef.current = window.setTimeout(() => {
      setIsCompleteCelebrating(false);
      completeCelebrateTimerRef.current = null;
    }, COMPLETE_PANEL_CELEBRATION_MS);
  };

  useEffect(() => {
    const greetingTimer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(greetingTimer);
  }, []);

  useEffect(() => {
    let frame = 0;

    const updateScrollGlass = () => {
      frame = 0;
      const maxScroll = Math.max(window.innerHeight * 1.35, 1);
      const nextProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      setScrollGlassProgress((prev) =>
        Math.abs(prev - nextProgress) < 0.01 ? prev : nextProgress
      );
    };

    updateScrollGlass();

    const handleScroll = () => {
      if (!isPageScrollingRef.current) {
        setIsPageScrolling(true);
        isPageScrollingRef.current = true;
      }
      if (scrollIdleTimer.current) {
        clearTimeout(scrollIdleTimer.current);
      }
      scrollIdleTimer.current = setTimeout(() => {
        setIsPageScrolling(false);
        isPageScrollingRef.current = false;
        scrollIdleTimer.current = null;
      }, 140);

      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollGlass);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      if (scrollIdleTimer.current) {
        clearTimeout(scrollIdleTimer.current);
        scrollIdleTimer.current = null;
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    preloadLessonsContent();
    preloadPracticeTasksContent();

    if (state.dailyQuoteDate !== today) {
      updateState({
        lastQuoteIndex: Math.floor(Math.random() * QUOTES.length),
        dailyQuoteDate: today,
      });
    }
  }, [state.dailyQuoteDate, today, updateState]);

  useEffect(() => {
    if (quoteUnmountTimerRef.current) {
      window.clearTimeout(quoteUnmountTimerRef.current);
      quoteUnmountTimerRef.current = null;
    }

    try {
      const hiddenToday = localStorage.getItem(QUOTE_VISIBILITY_STORAGE_KEY) === today;
      setIsQuoteCollapsed(hiddenToday);
      setIsQuoteExpandedRendered(!hiddenToday);
    } catch {
      setIsQuoteCollapsed(false);
      setIsQuoteExpandedRendered(true);
    }
  }, [today]);

  useEffect(() => {
    if (quoteUnmountTimerRef.current) {
      window.clearTimeout(quoteUnmountTimerRef.current);
      quoteUnmountTimerRef.current = null;
    }

    if (!isQuoteCollapsed) {
      setIsQuoteExpandedRendered(true);
      return;
    }

    quoteUnmountTimerRef.current = window.setTimeout(() => {
      setIsQuoteExpandedRendered(false);
      quoteUnmountTimerRef.current = null;
    }, QUOTE_HIDE_ANIMATION_MS);

    return () => {
      if (quoteUnmountTimerRef.current) {
        window.clearTimeout(quoteUnmountTimerRef.current);
        quoteUnmountTimerRef.current = null;
      }
    };
  }, [isQuoteCollapsed]);

  const quote = QUOTES[state.lastQuoteIndex % QUOTES.length];

  useEffect(() => {
    const expandedNode = quoteExpandedRef.current;
    if (!expandedNode) {
      return;
    }

    const updateHeight = () => {
      const nextHeight = Math.ceil(expandedNode.getBoundingClientRect().height);
      setQuoteExpandedHeight((prev) => (Math.abs(prev - nextHeight) < 1 ? prev : nextHeight));
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(expandedNode);

    return () => observer.disconnect();
  }, [isQuoteExpandedRendered, state.lastQuoteIndex]);

  const greeting = getTimeOfDayGreeting(now);
  const homeGlassStyle = {
    ['--home-glass-left-y' as string]: `${34 + scrollGlassProgress * 30}%`,
    ['--home-glass-right-y' as string]: `${68 - scrollGlassProgress * 24}%`,
    ['--home-glass-green-alpha' as string]: (0.07 + scrollGlassProgress * 0.04).toFixed(3),
    ['--home-glass-blue-alpha' as string]: (0.095 + scrollGlassProgress * 0.03).toFixed(3),
    ['--home-glass-green-alpha-soft' as string]: (0.04 + scrollGlassProgress * 0.025).toFixed(3),
    ['--home-glass-blue-alpha-soft' as string]: (0.055 + scrollGlassProgress * 0.02).toFixed(3),
    ['--home-glass-green-alpha-strong' as string]: (0.085 + scrollGlassProgress * 0.045).toFixed(3),
    ['--home-glass-blue-alpha-strong' as string]: (0.1 + scrollGlassProgress * 0.03).toFixed(3),
  };

  const categories = Array.from(new Set(LESSON_META.map((lesson) => lesson.category)));
  const dailyDone = state.lastDailyDate === today;
  const practDone = state.completedPractice?.length || 0;

  const hideQuoteForToday = () => {
    try {
      localStorage.setItem(QUOTE_VISIBILITY_STORAGE_KEY, today);
    } catch {
      // Ignore storage errors and still collapse in current session.
    }

    setIsQuoteCollapsed(true);
  };

  const showQuoteAgain = () => {
    try {
      localStorage.removeItem(QUOTE_VISIBILITY_STORAGE_KEY);
    } catch {
      // Ignore storage errors and still expand in current session.
    }

    if (quoteUnmountTimerRef.current) {
      window.clearTimeout(quoteUnmountTimerRef.current);
      quoteUnmountTimerRef.current = null;
    }

    setIsQuoteCollapsed(false);
    setIsQuoteExpandedRendered(true);
  };

  return (
    <div className="w-full pb-10" style={homeGlassStyle}>
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
                type="button"
                className="home-toolbar-button"
                onClick={() => navigate('achievements')}
                aria-label="Открыть достижения"
              >
                <span className="home-toolbar-icon">🏆</span>
              </button>
              <button
                type="button"
                className="home-toolbar-button"
                onClick={() => navigate('stats')}
                aria-label="Открыть статистику"
              >
                <span className="home-toolbar-icon">📊</span>
              </button>
              <button
                type="button"
                className="home-toolbar-button"
                onClick={() => navigate('certificate')}
                aria-label="Открыть сертификат"
              >
                <span className="home-toolbar-icon">🎓</span>
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
              <div key={i} className="home-clean-glass home-stat-card">
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
        <HomeQuoteDock
          quote={quote}
          isQuoteCollapsed={isQuoteCollapsed}
          isQuoteExpandedRendered={isQuoteExpandedRendered}
          quoteExpandedHeight={quoteExpandedHeight}
          quoteExpandedRef={quoteExpandedRef}
          onHideForToday={hideQuoteForToday}
          onShowAgain={showQuoteAgain}
        />

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
                const questionCountLabel = `До ${lesson.questionCount} ${plural(
                  lesson.questionCount,
                  'вопрос',
                  'вопроса',
                  'вопросов'
                )}`;

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonOpen(lesson.id, locked)}
                    onKeyDown={(event) =>
                      handleKeyboardActivation(event, () => handleLessonOpen(lesson.id, locked))
                    }
                    onMouseEnter={() => !locked && setHoveredLessonId(lesson.id)}
                    onMouseLeave={() =>
                      setHoveredLessonId((prev) => (prev === lesson.id ? null : prev))
                    }
                    role="button"
                    tabIndex={locked ? -1 : 0}
                    aria-disabled={locked}
                    className={`relative mb-3 overflow-visible transition-all duration-300 ${locked ? 'cursor-default opacity-50' : 'cursor-pointer'} ${openingLessonId === lesson.id ? 'lesson-card-opening scale-[0.995]' : ''}`}
                  >
                    <TiltedSurface disabled={locked} className="rounded-[24px]">
                      {!locked && (
                        <CardOutline color={lesson.color} hovered={isHovered} opening={isOpening} />
                      )}
                      <div
                        className={`home-surface-card lesson-tilt-face relative overflow-hidden p-4 transition-all duration-300 ${locked ? '' : 'hover:bg-white/10'} ${done ? 'border-opacity-50' : ''}`}
                        style={{
                          ['--lesson-accent' as string]: lesson.color,
                          borderColor: !locked && !done ? 'rgba(255,255,255,0.2)' : undefined,
                        }}
                      >
                        {done && (
                          <div
                            className="status-ribbon text-black"
                            style={{ ['--status-bg' as string]: lesson.color }}
                          >
                            ГОТОВО ✓
                          </div>
                        )}
                        <div className="lesson-tilt-content relative z-[1] flex items-center gap-3">
                          <div className="lesson-tilt-icon-slot relative h-12 w-12 shrink-0">
                            <div
                              aria-hidden="true"
                              className="lesson-tilt-icon-well absolute inset-0 rounded-xl"
                              style={{
                                ['--icon-accent' as string]: locked
                                  ? 'rgba(255,255,255,0.18)'
                                  : lesson.color,
                              }}
                            />
                            <div
                              className="lesson-tilt-icon absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-xl border bg-black/20 text-2xl"
                              data-icon={locked ? '🔒' : lesson.icon}
                              style={{
                                ['--icon-color' as string]: locked ? '#94a3b8' : lesson.color,
                                borderColor: locked ? 'rgba(255,255,255,0.1)' : `${lesson.color}50`,
                              }}
                            >
                              {locked ? '🔒' : lesson.icon}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-0.5 text-sm font-bold text-white">
                              {lesson.title}
                            </div>
                            <div className="mb-2 truncate text-xs text-slate-300">
                              {lesson.desc}
                            </div>
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
                    </TiltedSurface>
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
              onKeyDown={(event) => {
                if (dailyDone) {
                  return;
                }
                handleKeyboardActivation(event, () => navigate('daily'));
              }}
              role="button"
              tabIndex={dailyDone ? -1 : 0}
              aria-disabled={dailyDone}
              className={`home-surface-card home-surface-card--mode mode-gloss mode-gloss--daily border-purple-400/30 bg-purple-400/5 p-4 transition-all duration-300 ${dailyDone ? 'cursor-default' : 'cursor-pointer hover:bg-purple-400/10'}`}
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
                onKeyDown={(event) => handleKeyboardActivation(event, () => navigate('exam'))}
                role="button"
                tabIndex={0}
                className="home-surface-card home-surface-card--mode mode-gloss mode-gloss--exam cursor-pointer border-red-400/30 bg-red-400/5 p-4 transition-all duration-300 hover:bg-red-400/10"
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
              onKeyDown={(event) => handleKeyboardActivation(event, () => navigate('practice'))}
              role="button"
              tabIndex={0}
              className="home-surface-card home-surface-card--mode mode-gloss mode-gloss--practice cursor-pointer border-emerald-400/30 bg-emerald-400/5 p-4 transition-all duration-300 hover:bg-emerald-400/10"
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
            <div className="glass-panel home-complete-panel border-brand-green/40 bg-brand-green/10 p-5 text-center">
              <button
                type="button"
                className={`complete-panel-star-trigger ${isCompleteCelebrating ? 'complete-panel-star-trigger--active' : ''}`}
                onClick={handleCompletePanelCelebrate}
                aria-label="Запустить праздничные звёзды"
              >
                ✦
              </button>
              {isCompleteCelebrating && (
                <div
                  className="complete-panel-stars"
                  key={completeCelebrationKey}
                  aria-hidden="true"
                >
                  {completeStarParticles.map((particle) => (
                    <span
                      key={`${completeCelebrationKey}-${particle.id}`}
                      className="complete-panel-star"
                      style={{
                        left: `${particle.x}%`,
                        animationDelay: `${particle.delay}ms`,
                        animationDuration: `${particle.duration}ms`,
                        ['--star-size' as string]: `${particle.size}px`,
                        ['--star-drift' as string]: `${particle.drift}px`,
                        ['--star-rotate' as string]: `${particle.rotate}deg`,
                      }}
                    >
                      ✦
                    </span>
                  ))}
                </div>
              )}
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
