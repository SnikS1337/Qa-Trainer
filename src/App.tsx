/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Home from './screens/Home';
import Splash from './screens/Splash';
import Lesson from './screens/Lesson';
import Practice from './screens/Practice';
import PracticeTask from './screens/PracticeTask';
import Exam from './screens/Exam';
import Daily from './screens/Daily';
import { Achievements, Certificate, Stats } from './screens/Misc';
import { preloadLessonsContent, preloadPracticeTasksContent } from './data/content_loaders';
import { AppContext, useAppStoreInit } from './store';
import { getBackgroundGradient } from './utils';

type MotionReactModule = typeof import('motion/react');

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
  initial: { opacity: 0, filter: 'blur(2px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(2px)' },
  transition: PAGE_TRANSITION,
};

const MOBILE_PAGE_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: PAGE_TRANSITION,
};

function detectMobileDevice() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return (
    window.matchMedia('(max-width: 900px)').matches ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  );
}

function isSlowConnection() {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;

  if (!connection) {
    return false;
  }

  if (connection.saveData) {
    return true;
  }

  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.effectiveType === '3g'
  );
}

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
  const [isMobileDevice, setIsMobileDevice] = useState(() => detectMobileDevice());
  const [motionReact, setMotionReact] = useState<MotionReactModule | null>(null);
  const [isSlowNetwork, setIsSlowNetwork] = useState(() => isSlowConnection());

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
    if (isSlowNetwork) {
      return;
    }

    let preloaded = false;
    let preloadTimer: number | null = null;
    let idleId: number | null = null;

    const runPreload = () => {
      if (preloaded) {
        return;
      }

      preloaded = true;
      preloadLessonsContent();
      preloadPracticeTasksContent();
    };

    const schedulePreload = (delayMs: number) => {
      if (preloaded) {
        return;
      }

      if (preloadTimer !== null) {
        window.clearTimeout(preloadTimer);
      }

      preloadTimer = window.setTimeout(() => {
        if (typeof window.requestIdleCallback === 'function') {
          idleId = window.requestIdleCallback(runPreload, { timeout: 2600 });
          return;
        }

        runPreload();
      }, delayMs);
    };

    const postponePreloadOnInteraction = () => {
      schedulePreload(1900);
    };

    schedulePreload(1100);

    window.addEventListener('scroll', postponePreloadOnInteraction, { passive: true });
    window.addEventListener('touchstart', postponePreloadOnInteraction, { passive: true });
    window.addEventListener('wheel', postponePreloadOnInteraction, { passive: true });

    return () => {
      if (preloadTimer !== null) {
        window.clearTimeout(preloadTimer);
      }
      if (idleId !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      window.removeEventListener('scroll', postponePreloadOnInteraction);
      window.removeEventListener('touchstart', postponePreloadOnInteraction);
      window.removeEventListener('wheel', postponePreloadOnInteraction);
    };
  }, [isSlowNetwork]);

  useEffect(() => {
    const handleNetworkState = () => {
      setIsSlowNetwork(isSlowConnection());
    };

    window.addEventListener('online', handleNetworkState);
    window.addEventListener('offline', handleNetworkState);

    const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
    if (connection && 'addEventListener' in connection) {
      connection.addEventListener('change', handleNetworkState as EventListener);
    }

    return () => {
      window.removeEventListener('online', handleNetworkState);
      window.removeEventListener('offline', handleNetworkState);
      if (connection && 'removeEventListener' in connection) {
        connection.removeEventListener('change', handleNetworkState as EventListener);
      }
    };
  }, []);

  const shouldUseMotion = !isMobileDevice && !isSlowNetwork;

  useEffect(() => {
    if (!shouldUseMotion) {
      setMotionReact(null);
      return;
    }

    let active = true;

    void import('motion/react')
      .then((module) => {
        if (!active) return;
        setMotionReact(module);
      })
      .catch(() => {
        if (!active) return;
        setMotionReact(null);
      });

    return () => {
      active = false;
    };
  }, [shouldUseMotion]);

  useEffect(() => {
    const mobileWidthQuery = window.matchMedia('(max-width: 900px)');
    const coarsePointerQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

    const updateDevice = () => {
      const mobile = mobileWidthQuery.matches || coarsePointerQuery.matches;
      setIsMobileDevice(mobile);
      document.documentElement.dataset.device = mobile ? 'mobile' : 'desktop';
      document.body.dataset.device = mobile ? 'mobile' : 'desktop';
    };

    updateDevice();

    return () => undefined;
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

  const ambientLayers = useMemo(() => [], []);

  const pageMotion = isMobileDevice ? MOBILE_PAGE_MOTION : PAGE_MOTION;
  const ambientOpacity = isMobileDevice ? 0.72 : 0.9;
  const MotionDiv = motionReact?.motion.div;
  const AnimatePresence = motionReact?.AnimatePresence;

  return (
    <AppContext.Provider value={appContextValue}>
      <div
        className={`selection:bg-brand-purple/30 relative min-h-screen overflow-x-hidden font-sans text-white ${isMobileDevice ? 'device-mobile' : 'device-desktop'}`}
      >
        {MotionDiv ? (
          <MotionDiv
            className="pointer-events-none fixed -inset-10"
            style={{
              backgroundColor: '#0f111a',
              backgroundImage: baseGradient,
              backgroundPosition: '50% 50%',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '120% 120%',
            }}
          />
        ) : (
          <div
            className="pointer-events-none fixed -inset-10"
            style={{
              backgroundColor: '#0f111a',
              backgroundImage: baseGradient,
              backgroundPosition: '50% 50%',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '120% 120%',
            }}
          />
        )}
        <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
          {ambientLayers.map((layer) =>
            MotionDiv ? (
              <MotionDiv
                key={layer.key}
                className={`absolute rounded-full ${isMobileDevice ? 'blur-xl' : 'blur-2xl'} ${layer.className}`}
                animate={layer.animate}
                transition={{ duration: layer.duration, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: `radial-gradient(circle, ${layer.color} 0%, rgba(255, 255, 255, 0.05) 34%, rgba(255, 255, 255, 0) 72%)`,
                  mixBlendMode: 'screen',
                  opacity: ambientOpacity,
                  willChange: 'transform',
                }}
              />
            ) : (
              <div
                key={layer.key}
                className={`absolute rounded-full ${isMobileDevice ? 'blur-xl' : 'blur-2xl'} ${layer.className}`}
                style={{
                  background: `radial-gradient(circle, ${layer.color} 0%, rgba(255, 255, 255, 0.05) 34%, rgba(255, 255, 255, 0) 72%)`,
                  mixBlendMode: 'screen',
                  opacity: ambientOpacity,
                }}
              />
            )
          )}
        </div>
        {AnimatePresence && MotionDiv ? (
          <AnimatePresence>
            {transitionGradient && (
              <MotionDiv
                key={transitionGradient}
                initial={
                  isMobileDevice ? { opacity: 0 } : { opacity: 0, scale: 1.01, filter: 'blur(8px)' }
                }
                animate={
                  isMobileDevice ? { opacity: 1 } : { opacity: 1, scale: 1, filter: 'blur(0px)' }
                }
                exit={
                  isMobileDevice ? { opacity: 0 } : { opacity: 0, scale: 1.01, filter: 'blur(6px)' }
                }
                transition={{ duration: BACKGROUND_TRANSITION_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none fixed -inset-10"
                style={{
                  backgroundColor: '#0f111a',
                  backgroundImage: transitionGradient,
                  backgroundPosition: '50% 50%',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '120% 120%',
                  transformOrigin: 'center center',
                  willChange: 'opacity, filter',
                }}
              />
            )}
          </AnimatePresence>
        ) : (
          transitionGradient && (
            <div
              className="pointer-events-none fixed -inset-10"
              style={{
                backgroundColor: '#0f111a',
                backgroundImage: transitionGradient,
                backgroundPosition: '50% 50%',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '120% 120%',
              }}
            />
          )
        )}

        <div className="noise-overlay pointer-events-none z-0"></div>

        <div className="relative z-10 flex min-h-screen flex-col overflow-x-hidden">
          {AnimatePresence && MotionDiv ? (
            <AnimatePresence mode="wait">
              <MotionDiv key={currentScreen.key} {...pageMotion} className="flex w-full flex-1">
                {currentScreen.element}
              </MotionDiv>
            </AnimatePresence>
          ) : (
            <div className="flex w-full flex-1">{currentScreen.element}</div>
          )}
        </div>

        <div className="pointer-events-none fixed right-4 bottom-6 left-4 z-[140] flex flex-col items-center gap-3">
          {AnimatePresence && MotionDiv ? (
            <AnimatePresence>
              {toasts.map((toast) => (
                <MotionDiv
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 14, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className={`glass-panel w-full max-w-[420px] px-5 py-3 text-center text-[13px] font-bold tracking-wide ${toast.color}`}
                >
                  {toast.msg}
                </MotionDiv>
              ))}
            </AnimatePresence>
          ) : (
            toasts.map((toast) => (
              <div
                key={toast.id}
                className={`glass-panel w-full max-w-[420px] px-5 py-3 text-center text-[13px] font-bold tracking-wide ${toast.color}`}
              >
                {toast.msg}
              </div>
            ))
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}
