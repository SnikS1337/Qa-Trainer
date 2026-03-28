/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppContext, useAppStoreInit } from './store';
import { motion, AnimatePresence } from 'motion/react';
import Home from './screens/Home';
import Lesson from './screens/Lesson';
import Practice from './screens/Practice';
import PracticeTask from './screens/PracticeTask';
import Exam from './screens/Exam';
import Daily from './screens/Daily';
import { Splash, Stats, Achievements, Certificate } from './screens/Misc';
import { getBackgroundGradient } from './utils';

type ScreenName = 'splash' | 'home' | 'lesson' | 'practice' | 'practice-task' | 'exam' | 'daily' | 'stats' | 'achievements' | 'certificate';

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
  const [toast, setToast] = useState<{msg: string, color: string} | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [baseGradient, setBaseGradient] = useState(() => getBackgroundGradient('splash'));
  const [transitionGradient, setTransitionGradient] = useState<string | null>(null);

  const navigate = useCallback((s: ScreenName, id?: string) => {
    setScreen(s);
    setCurrentId(id ?? null);
  }, []);

  const showToast = useCallback((msg: string, color: string = 'text-brand-green') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ msg, color });
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (backgroundTimerRef.current) {
        clearTimeout(backgroundTimerRef.current);
      }
    };
  }, []);

  const appContextValue = useMemo(
    () => ({ ...store, navigate, showToast }),
    [store, navigate, showToast]
  );

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="min-h-screen overflow-x-hidden text-white font-sans selection:bg-brand-purple/30 relative">
        <motion.div
          className="fixed -inset-10 pointer-events-none"
          style={{
            backgroundColor: '#0f111a',
            backgroundImage: baseGradient,
            backgroundPosition: '50% 50%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '120% 120%'
          }}
        />
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
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
              className="fixed -inset-10 pointer-events-none"
              style={{
                backgroundColor: '#0f111a',
                backgroundImage: transitionGradient,
                backgroundPosition: '50% 50%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '120% 120%',
                transformOrigin: 'center center',
                willChange: 'opacity, transform, filter'
              }}
            />
          )}
        </AnimatePresence>
        
        <div className="noise-overlay pointer-events-none z-0"></div>
        
        <div className="relative z-10 min-h-screen flex flex-col overflow-x-hidden">
          <AnimatePresence mode="wait">
            {screen === 'splash' && <motion.div key="splash" {...PAGE_MOTION} className="flex-1 flex w-full"><Splash /></motion.div>}
            {screen === 'home' && <motion.div key="home" {...PAGE_MOTION} className="flex-1 flex w-full"><Home /></motion.div>}
            {screen === 'lesson' && currentId && <motion.div key="lesson" {...PAGE_MOTION} className="flex-1 flex w-full"><Lesson id={currentId} /></motion.div>}
            {screen === 'lesson' && !currentId && <motion.div key="lesson-fallback" {...PAGE_MOTION} className="flex-1 flex w-full"><Home /></motion.div>}
            {screen === 'practice' && <motion.div key="practice" {...PAGE_MOTION} className="flex-1 flex w-full"><Practice /></motion.div>}
            {screen === 'practice-task' && currentId && <motion.div key="practice-task" {...PAGE_MOTION} className="flex-1 flex w-full"><PracticeTask id={currentId} /></motion.div>}
            {screen === 'practice-task' && !currentId && <motion.div key="practice-task-fallback" {...PAGE_MOTION} className="flex-1 flex w-full"><Practice /></motion.div>}
            {screen === 'exam' && <motion.div key="exam" {...PAGE_MOTION} className="flex-1 flex w-full"><Exam /></motion.div>}
            {screen === 'daily' && <motion.div key="daily" {...PAGE_MOTION} className="flex-1 flex w-full"><Daily /></motion.div>}
            {screen === 'stats' && <motion.div key="stats" {...PAGE_MOTION} className="flex-1 flex w-full"><Stats /></motion.div>}
            {screen === 'achievements' && <motion.div key="achievements" {...PAGE_MOTION} className="flex-1 flex w-full"><Achievements /></motion.div>}
            {screen === 'certificate' && <motion.div key="certificate" {...PAGE_MOTION} className="flex-1 flex w-full"><Certificate /></motion.div>}
          </AnimatePresence>
        </div>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[140] px-5 py-3 glass-panel font-bold text-[13px] tracking-wide text-center min-w-[280px] ${toast.color}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  );
}
