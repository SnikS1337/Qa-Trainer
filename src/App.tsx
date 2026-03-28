/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Home from './screens/Home';
import Lesson from './screens/Lesson';
import Practice from './screens/Practice';
import PracticeTask from './screens/PracticeTask';
import Exam from './screens/Exam';
import Daily from './screens/Daily';
import { Achievements, Certificate, Splash, Stats } from './screens/Misc';
import { preloadLessonsContent, preloadPracticeTasksContent } from './data/content_loaders';
import { AppContext, useAppStoreInit } from './store';
import { getBackgroundGradient } from './utils';

type ScreenName =
  | 'splash'
  | 'home'
  | 'lesson'
  | 'practice'
  | 'practice-task'
  | 'exam'
  | 'daily'
  | 'stats'
  | 'achievements'
  | 'certificate';

const BACKGROUND_TRANSITION_MS = 1450;

const PAGE_TRANSITION = { duration: 0.26, ease: 'easeInOut' as const };

const PAGE_MOTION = {
  initial: { opacity: 0, filter: 'blur(3px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(3px)' },
  transition: PAGE_TRANSITION,
};

const AMBIENT_LAYERS = [
  {
    key: 'ambient-a',
    className: 'top-[-18%] left-[-14%] h-[58vh] w-[58vh]',
    color: 'rgba(96, 165, 250, 0.22)',
    animate: { x: [0, 42, -28, 0], y: [0, -34, 18, 0], scale: [1, 1.09, 0.98, 1] },
    duration: 18,
  },
  {
    key: 'ambient-b',
    className: 'top-[8%] right-[-12%] h-[52vh] w-[52vh]',
    color: 'rgba(52, 211, 153, 0.18)',
    animate: { x: [0, -36, 26, 0], y: [0, 24, -20, 0], scale: [1.02, 0.96, 1.08, 1.02] },
    duration: 22,
  },
  {
    key: 'ambient-c',
    className: 'bottom-[-22%] left-[18%] h-[48vh] w-[48vh]',
    color: 'rgba(251, 191, 36, 0.16)',
    animate: { x: [0, 28, -38, 0], y: [0, -20, 26, 0], scale: [0.98, 1.07, 1, 0.98] },
    duration: 20,
  },
];

export default function App() {
  const store = useAppStoreInit();
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; color: string }>>([]);
  const toastTimersRef = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const nextToastIdRef = useRef(1);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [baseGradient, setBaseGradient] = useState(() => getBackgroundGradient('splash'));
  const [transitionGradient, setTransitionGradient] = useState<string | null>(null);

  const navigate = useCallback((nextScreen: ScreenName, id?: string) => {
    setScreen(nextScreen);
    setCurrentId(id ?? null);
  }, []);

  const showToast = useCallback((msg: string, color: string = 'text-brand-green') => {
    if (/^🔥\s*\d+\s+подряд!?$/i.test(msg.trim())) {
      return;
    }

    const id = nextToastIdRef.current++;

    setToasts((prev) => {
      const next = [...prev, { id, msg, color }];

      if (next.length <= 4) {
        return next;
      }

      const removed = next.shift();
      if (removed) {
        const removedTimer = toastTimersRef.current.get(removed.id);
        if (removedTimer) {
          clearTimeout(removedTimer);
          toastTimersRef.current.delete(removed.id);
        }
      }

      return next;
    });

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      toastTimersRef.current.delete(id);
    }, 3200);

    toastTimersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    const preloadTimer = window.setTimeout(() => {
      preloadLessonsContent();
      preloadPracticeTasksContent();
    }, 120);

    return () => window.clearTimeout(preloadTimer);
  }, []);

  useEffect(() => {
    const nextGradient = getBackgroundGradient(screen);

    if (backgroundTimerRef.current) {
      clearTimeout(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }

    if (nextGradient === transitionGradient) {
      return;
    }

    if (nextGradient === baseGradient) {
      setTransitionGradient(null);
      return;
    }

    setTransitionGradient(nextGradient);

    backgroundTimerRef.current = setTimeout(() => {
      setBaseGradient(nextGradient);
      setTransitionGradient(null);
      backgroundTimerRef.current = null;
    }, BACKGROUND_TRANSITION_MS);
  }, [screen, baseGradient, transitionGradient]);

  useEffect(() => {
    const toastTimers = toastTimersRef.current;

    return () => {
      for (const timer of toastTimers.values()) {
        clearTimeout(timer);
      }
      toastTimers.clear();

      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, []);

  const appContextValue = useMemo(
    () => ({ ...store, navigate, showToast }),
    [store, navigate, showToast]
  );

  const currentScreen = useMemo(() => {
    switch (screen) {
      case 'splash':
        return { key: 'splash', element: <Splash /> };
      case 'home':
        return { key: 'home', element: <Home /> };
      case 'lesson':
        return currentId
          ? { key: 'lesson', element: <Lesson id={currentId} /> }
          : { key: 'lesson-fallback', element: <Home /> };
      case 'practice':
        return { key: 'practice', element: <Practice /> };
      case 'practice-task':
        return currentId
          ? { key: 'practice-task', element: <PracticeTask id={currentId} /> }
          : { key: 'practice-task-fallback', element: <Practice /> };
      case 'exam':
        return { key: 'exam', element: <Exam /> };
      case 'daily':
        return { key: 'daily', element: <Daily /> };
      case 'stats':
        return { key: 'stats', element: <Stats /> };
      case 'achievements':
        return { key: 'achievements', element: <Achievements /> };
      case 'certificate':
        return { key: 'certificate', element: <Certificate /> };
      default:
        return { key: 'home-fallback', element: <Home /> };
    }
  }, [screen, currentId]);

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="selection:bg-brand-purple/30 relative min-h-screen overflow-x-hidden font-sans text-white">
        <motion.div
          className="pointer-events-none fixed -inset-10"
          style={{
            backgroundColor: '#0f111a',
            backgroundImage: baseGradient,
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '120% 120%',
          }}
        />
        <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
          {AMBIENT_LAYERS.map((layer) => (
            <motion.div
              key={layer.key}
              className={`absolute rounded-full blur-2xl ${layer.className}`}
              animate={layer.animate}
              transition={{ duration: layer.duration, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: `radial-gradient(circle, ${layer.color} 0%, rgba(255, 255, 255, 0.05) 34%, rgba(255, 255, 255, 0) 72%)`,
                mixBlendMode: 'screen',
                opacity: 0.9,
                willChange: 'transform',
              }}
            />
          ))}
        </div>
        <AnimatePresence>
          {transitionGradient && (
            <motion.div
              key={transitionGradient}
              initial={{ opacity: 0, scale: 1.02, filter: 'blur(14px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ duration: BACKGROUND_TRANSITION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none fixed -inset-10"
              style={{
                backgroundColor: '#0f111a',
                backgroundImage: transitionGradient,
                backgroundPosition: '50% 50%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '120% 120%',
                transformOrigin: 'center center',
                willChange: 'opacity, transform, filter',
              }}
            />
          )}
        </AnimatePresence>

        <div className="noise-overlay pointer-events-none z-0"></div>

        <div className="relative z-10 flex min-h-screen flex-col overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentScreen.key} {...PAGE_MOTION} className="flex w-full flex-1">
              {currentScreen.element}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none fixed right-4 bottom-6 left-4 z-[140] flex flex-col items-center gap-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.96 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={`glass-panel w-full max-w-[420px] px-5 py-3 text-center text-[13px] font-bold tracking-wide ${toast.color}`}
              >
                {toast.msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AppContext.Provider>
  );
}
