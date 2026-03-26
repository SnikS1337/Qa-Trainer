// Utility functions for code splitting and lazy loading

/**
 * Lazy load a component with error boundaries
 */
export const lazyWithRetry = (componentImport: () => Promise<any>) => {
  const getComponent = async () => {
    try {
      const component = await componentImport();
      return component;
    } catch (error) {
      console.warn('Error loading component, retrying...', error);
      // Retry after a small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await componentImport();
    }
  };

  return {
    lazy: () => getComponent(),
    preload: () => componentImport()
  };
};

/**
 * Load animation assets only when needed
 */
export const loadAnimationAssets = async () => {
  // Dynamically load animations when needed
  const { motion } = await import('motion/react');
  return motion;
};

/**
 * Lazy load heavy components
 */
export const loadLessonComponents = () => import('../screens/Lesson');
export const loadExamComponents = () => import('../screens/Exam');

// Export preloaded resources for performance
export const preloadedResources = {
  confetti: () => import('canvas-confetti'),
  motion: () => import('motion/react'),
};