/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
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

export default function App() {
  const store = useAppStoreInit();
  const [screen, setScreen] = useState('splash');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, color: string} | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [baseGradient, setBaseGradient] = useState(() => getBackgroundGradient('splash'));
  const [overlayGradient, setOverlayGradient] = useState<string | null>(null);

  const navigate = (s: string, id?: string) => {
    setScreen(s);
    if (id) setCurrentId(id);
  };

  const showToast = (msg: string, color: string = 'text-brand-green') => {
    // Очищаем предыдущий таймер если есть
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    
    setToast({ msg, color });
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const pageTransition = { duration: 0.26, ease: 'easeInOut' as const };
  const pageMotion = {
    initial: { opacity: 0, filter: 'blur(3px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(3px)' },
    transition: pageTransition,
  };

  useEffect(() => {
    // No automatic redirect, wait for user to click start
  }, [screen]);

  useEffect(() => {
    const nextGradient = getBackgroundGradient(screen);

    if (nextGradient === baseGradient) return;

    setOverlayGradient(nextGradient);

    const timer = setTimeout(() => {
      setBaseGradient(nextGradient);
      setOverlayGradient(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [screen, baseGradient]);

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  return (
    <AppContext.Provider value={{ ...store, navigate, showToast }}>
      <div className="min-h-screen overflow-x-hidden text-white font-sans selection:bg-brand-purple/30 relative">
        <div
          className="fixed inset-0"
          style={{
            backgroundColor: '#0f111a',
            backgroundImage: baseGradient,
            backgroundAttachment: 'fixed'
          }}
        />
        <AnimatePresence>
          {overlayGradient && (
            <motion.div
              key={screen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="fixed inset-0"
              style={{
                backgroundColor: '#0f111a',
                backgroundImage: overlayGradient,
                backgroundAttachment: 'fixed'
              }}
            />
          )}
        </AnimatePresence>
        
        <div className="noise-overlay pointer-events-none z-0"></div>
        
        <div className="relative z-10 min-h-screen flex flex-col overflow-x-hidden">
          <AnimatePresence mode="wait">
            {screen === 'splash' && <motion.div key="splash" {...pageMotion} className="flex-1 flex w-full"><Splash /></motion.div>}
            {screen === 'home' && <motion.div key="home" {...pageMotion} className="flex-1 flex w-full"><Home /></motion.div>}
            {screen === 'lesson' && <motion.div key="lesson" {...pageMotion} className="flex-1 flex w-full"><Lesson id={currentId!} /></motion.div>}
            {screen === 'practice' && <motion.div key="practice" {...pageMotion} className="flex-1 flex w-full"><Practice /></motion.div>}
            {screen === 'practice-task' && <motion.div key="practice-task" {...pageMotion} className="flex-1 flex w-full"><PracticeTask id={currentId!} /></motion.div>}
            {screen === 'exam' && <motion.div key="exam" {...pageMotion} className="flex-1 flex w-full"><Exam /></motion.div>}
            {screen === 'daily' && <motion.div key="daily" {...pageMotion} className="flex-1 flex w-full"><Daily /></motion.div>}
            {screen === 'stats' && <motion.div key="stats" {...pageMotion} className="flex-1 flex w-full"><Stats /></motion.div>}
            {screen === 'achievements' && <motion.div key="achievements" {...pageMotion} className="flex-1 flex w-full"><Achievements /></motion.div>}
            {screen === 'certificate' && <motion.div key="certificate" {...pageMotion} className="flex-1 flex w-full"><Certificate /></motion.div>}
          </AnimatePresence>
        </div>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
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
