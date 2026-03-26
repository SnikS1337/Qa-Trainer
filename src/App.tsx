/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AppContext, useAppStoreInit } from './store';
import { motion, AnimatePresence } from 'motion/react';
import Home from './screens/Home';
import Lesson from './screens/Lesson';
import Practice from './screens/Practice';
import PracticeTask from './screens/PracticeTask';
import Exam from './screens/Exam';
import Daily from './screens/Daily';
import { Splash, Stats, Achievements, Certificate } from './screens/Misc';

export default function App() {
  const store = useAppStoreInit();
  const [screen, setScreen] = useState('splash');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, color: string} | null>(null);

  const navigate = (s: string, id?: string) => {
    setScreen(s);
    if (id) setCurrentId(id);
  };

  const showToast = (msg: string, color: string = 'text-brand-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const state = store.state;

  const screenBgClass = (() => {
    switch (screen) {
      case 'lesson':
        return 'bg-screen-lesson';
      case 'practice':
      case 'practice_task':
        return 'bg-screen-practice';
      case 'exam':
        return 'bg-screen-exam';
      case 'daily':
        return 'bg-screen-daily';
      case 'certificate':
        return 'bg-screen-certificate';
      case 'stats':
      case 'achievements':
        return 'bg-screen-stats';
      case 'home':
      default:
        return 'bg-screen-home';
    }
  })();

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

  return (
    <AppContext.Provider value={{ ...store, navigate, showToast }}>
      <div className="min-h-screen text-white font-sans selection:bg-brand-purple/30 relative overflow-x-hidden">
        <div className="noise-overlay pointer-events-none z-0"></div>
        
        <div className="relative z-10 min-h-screen flex flex-col">
          <AnimatePresence mode="wait">
            {screen === 'splash' && <motion.div key="splash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Splash /></motion.div>}
            {screen === 'home' && <motion.div key="home" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Home /></motion.div>}
            {screen === 'lesson' && <motion.div key="lesson" initial={{ opacity: 0, y: 14, scale: 0.992 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.996 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Lesson id={currentId!} /></motion.div>}
            {screen === 'practice' && <motion.div key="practice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Practice /></motion.div>}
            {screen === 'practice_task' && <motion.div key="practice_task" initial={{ opacity: 0, y: 14, scale: 0.994 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.996 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><PracticeTask id={currentId!} /></motion.div>}
            {screen === 'exam' && <motion.div key="exam" initial={{ opacity: 0, y: 12, scale: 0.992 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.996 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Exam /></motion.div>}
            {screen === 'daily' && <motion.div key="daily" initial={{ opacity: 0, y: 12, scale: 0.994 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.996 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Daily /></motion.div>}
            {screen === 'stats' && <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Stats /></motion.div>}
            {screen === 'achievements' && <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Achievements /></motion.div>}
            {screen === 'certificate' && <motion.div key="certificate" initial={{ opacity: 0, y: 10, scale: 0.994 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.996 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="screen-shell flex-1 flex"><Certificate /></motion.div>}
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
