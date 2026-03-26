import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to optimize animations based on user preferences
 */
export const useOptimizedAnimations = () => {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false);
  
  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (mediaQuery.matches) {
      setShouldReduceMotion(true);
    }
    
    const handleChange = (e: MediaQueryListEvent) => {
      setShouldReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return { shouldReduceMotion };
};

/**
 * Hook to control animation timing for performance
 */
export const useAnimationController = (initialDelay: number = 0) => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, initialDelay);
    
    return () => clearTimeout(timer);
  }, [initialDelay]);
  
  return { isReady };
};

/**
 * Hook to debounce expensive animations
 */
export const useDebouncedAnimation = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedCallback = (...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback.apply(null, args);
    }, delay);
  };
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback;
};