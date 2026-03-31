import { useCallback, useEffect, useRef, useState } from 'react';

export function useQuestionTransition(durationMs: number = 280) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionLockRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      transitionLockRef.current = false;
    };
  }, []);

  const runQuestionTransition = useCallback(
    (callback: () => void) => {
      if (isTransitioning || transitionLockRef.current) {
        return;
      }

      transitionLockRef.current = true;
      setIsTransitioning(true);
      timerRef.current = setTimeout(() => {
        callback();
        transitionLockRef.current = false;
        setIsTransitioning(false);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs, isTransitioning]
  );

  return {
    isTransitioning,
    runQuestionTransition,
  };
}
