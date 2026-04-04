import { useAppStore } from '../store';
import { LESSON_META } from '../data/lesson_meta';
import { PRACTICE_TASK_META } from '../data/practice_task_meta';
import { QUOTES } from '../data/quotes';
import { getLevelInfo, getTimeOfDayGreeting, plural } from '../utils';
import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import DevMenu from '../components/DevMenu';
import HomeHeader from '../components/home/HomeHeader';
import HomeLessonCard from '../components/home/HomeLessonCard';
import HomeModes from '../components/home/HomeModes';
import HomeQuoteDock from '../components/home/HomeQuoteDock';
import { getLocalDateKey } from '../domain/dates';
import { getLessonSessionQuestionCount } from '../domain/lesson_session';
import { useHomeLessonsModel } from '../hooks/useHomeLessonsModel';

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

  const lessonsModel = useHomeLessonsModel(state.completedLessons);
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
      <HomeHeader
        greeting={greeting}
        totalXP={state.totalXP}
        level={lvl.level}
        levelName={lvl.name}
        streak={state.streak}
        completedLessonsCount={state.completedLessons.length}
        totalLessonsCount={LESSON_META.length}
        xpInLevel={lvl.xpInLevel}
        xpToNext={lvl.xpToNext}
        levelProgressPct={lvl.pct}
        onOpenAchievements={() => navigate('achievements')}
        onOpenStats={() => navigate('stats')}
        onOpenCertificate={() => navigate('certificate')}
        onDevPointerDown={handlePointerDown}
        onDevPointerUpOrLeave={handlePointerUpOrLeave}
      />

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
        {lessonsModel.map((categoryModel) => {
          const cat = categoryModel.category;
          const catLessons = categoryModel.lessons;
          const catUnlocked = categoryModel.unlocked;
          const catDone = categoryModel.doneCount;

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

              {catLessons.map((item) => {
                const { lesson, done, locked } = item;
                const isOpening = openingLessonId === lesson.id;
                const isHovered = hoveredLessonId === lesson.id;
                const sessionQuestionCount = getLessonSessionQuestionCount(lesson.questionCount);
                const questionCountLabel =
                  lesson.questionCount > sessionQuestionCount
                    ? `${sessionQuestionCount} за попытку · ${lesson.questionCount} всего`
                    : `${lesson.questionCount} ${plural(lesson.questionCount, 'вопрос', 'вопроса', 'вопросов')}`;

                return (
                  <HomeLessonCard
                    key={lesson.id}
                    lesson={lesson}
                    done={done}
                    locked={locked}
                    isOpening={isOpening}
                    isHovered={isHovered}
                    questionCountLabel={questionCountLabel}
                    onOpen={() => handleLessonOpen(lesson.id, locked)}
                    onKeyDown={handleKeyboardActivation}
                    onHoverStart={() => !locked && setHoveredLessonId(lesson.id)}
                    onHoverEnd={() =>
                      setHoveredLessonId((prev) => (prev === lesson.id ? null : prev))
                    }
                  />
                );
              })}
            </div>
          );
        })}

        <HomeModes
          dailyDone={dailyDone}
          dailyStreak={state.dailyStreak}
          completedLessonsCount={state.completedLessons.length}
          examBestScore={state.examBestScore}
          practDone={practDone}
          practiceTotal={PRACTICE_TASK_META.length}
          totalLessons={LESSON_META.length}
          isCompleteCelebrating={isCompleteCelebrating}
          completeCelebrationKey={completeCelebrationKey}
          completeStarParticles={completeStarParticles}
          onOpenDaily={() => navigate('daily')}
          onOpenExam={() => navigate('exam')}
          onOpenPractice={() => navigate('practice')}
          onCompleteCelebrate={handleCompletePanelCelebrate}
          onKeyDown={handleKeyboardActivation}
          plural={plural}
        />
      </div>
      {showDevMenu && <DevMenu onClose={() => setShowDevMenu(false)} />}
    </div>
  );
}
