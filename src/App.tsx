/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import { AppContext, useAppStoreInit } from './store';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from './types';

const Home = lazy(() => import('./screens/Home'));
const Lesson = lazy(() => import('./screens/Lesson'));
const Practice = lazy(() => import('./screens/Practice'));
const PracticeTask = lazy(() => import('./screens/PracticeTask'));
const Exam = lazy(() => import('./screens/Exam'));
const Daily = lazy(() => import('./screens/Daily'));
const Splash = lazy(() => import('./screens/Misc').then(module => ({ default: module.Splash })));
const Stats = lazy(() => import('./screens/Misc').then(module => ({ default: module.Stats })));
const Achievements = lazy(() => import('./screens/Misc').then(module => ({ default: module.Achievements })));
const Certificate = lazy(() => import('./screens/Misc').then(module => ({ default: module.Certificate })));

type ScreenComponent = LazyExoticComponent<ComponentType<any>>;

type ScreenConfig = {
  backgroundClass: string;
  transition: {
    duration: number;
    ease: [number, number, number, number];
  };
  motion: {
    initial: Record<string, number>;
    animate: Record<string, number>;
    exit: Record<string, number>;
  };
  component: ScreenComponent;
  getProps?: (currentId: string | null) => Record<string, string>;
};

const SCREEN_CONFIG: Record<Screen, ScreenConfig> = {
  splash: {
    backgroundClass: 'bg-screen-home',
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } },
    component: Splash,
  },
  home: {
    backgroundClass: 'bg-screen-home',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } },
    component: Home,
  },
  lesson: {
    backgroundClass: 'bg-screen-lesson',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 14, scale: 0.992 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.996 } },
    component: Lesson,
    getProps: currentId => ({ id: currentId ?? '' }),
  },
  practice: {
    backgroundClass: 'bg-screen-practice',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } },
    component: Practice,
  },
  practice_task: {
    backgroundClass: 'bg-screen-practice',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 14, scale: 0.994 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -10, scale: 0.996 } },
    component: PracticeTask,
    getProps: currentId => ({ id: currentId ?? '' }),
  },
  exam: {
    backgroundClass: 'bg-screen-exam',
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 12, scale: 0.992 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -12, scale: 0.996 } },
    component: Exam,
  },
  daily: {
    backgroundClass: 'bg-screen-daily',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 12, scale: 0.994 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -12, scale: 0.996 } },
    component: Daily,
  },
  stats: {
    backgroundClass: 'bg-screen-stats',
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } },
    component: Stats,
  },
  achievements: {
    backgroundClass: 'bg-screen-stats',
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 } },
    component: Achievements,
  },
  certificate: {
    backgroundClass: 'bg-screen-certificate',
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    motion: { initial: { opacity: 0, y: 10, scale: 0.994 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -8, scale: 0.996 } },
    component: Certificate,
  },
};

export default function App() {
  const store = useAppStoreInit();
  const [screen, setScreen] = useState<Screen>('splash');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, color: string} | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = (s: Screen, id?: string) => {
    setScreen(s);
    setCurrentId(id ?? null);
  };

  const showToast = (msg: string, color: string = 'text-brand-green') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ msg, color });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  };

  const currentScreenConfig = SCREEN_CONFIG[screen];
  const screenBgClass = currentScreenConfig.backgroundClass;
  const ActiveScreen = currentScreenConfig.component;
  const activeScreenProps = currentScreenConfig.getProps?.(currentId) ?? {};

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  useEffect(() => {
    const body = document.body;
    const classes = [
      'bg-screen-home',
      'bg-screen-lesson',
      'bg-screen-practice',
      'bg-screen-exam',
      'bg-screen-daily',
      'bg-screen-certificate',
      'bg-screen-stats',
    ];
    body.classList.remove(...classes);
    body.classList.add(screenBgClass);

    return () => {
      body.classList.remove(screenBgClass);
    };
  }, [screenBgClass]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <AppContext.Provider value={{ ...store, navigate, showToast }}>
      <div className="min-h-screen text-white font-sans selection:bg-brand-purple/30 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={screenBgClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`screen-background-layer ${screenBgClass}`}
          />
        </AnimatePresence>
        <div className="noise-overlay pointer-events-none z-0"></div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={currentScreenConfig.motion.initial}
              animate={currentScreenConfig.motion.animate}
              exit={currentScreenConfig.motion.exit}
              transition={currentScreenConfig.transition}
              className="screen-shell flex-1 flex"
            >
              <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center text-slate-400">Загрузка...</div>}>
                <ActiveScreen {...activeScreenProps} />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 glass-panel font-bold text-[13px] tracking-wide text-center min-w-[280px] ${toast.color}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}
