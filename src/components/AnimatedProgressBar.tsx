import * as React from "react";
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Progress } from './ui/Progress';

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  className?: string;
}

const AnimatedProgressBar = React.forwardRef<HTMLDivElement, AnimatedProgressBarProps>(
  ({ value, max = 100, color = '#f59e0b', height = '8px', className = '' }, ref) => {
    const [progress, setProgress] = useState(0);
    
    useEffect(() => {
      // Анимация заполнения
      const animationDuration = 500; // ms
      const startTime = Date.now();
      const startProgress = progress;
      const targetProgress = value;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressPercent = Math.min(elapsed / animationDuration, 1);
        
        // Ease-out функция для плавной анимации
        const easedProgress = startProgress + (targetProgress - startProgress) * (1 - Math.pow(1 - progressPercent, 2));
        
        setProgress(easedProgress);
        
        if (elapsed < animationDuration) {
          requestAnimationFrame(animate);
        } else {
          setProgress(targetProgress);
        }
      };
      
      animate();
    }, [value]);

    return (
      <div ref={ref} className={`w-full ${className}`}>
        <Progress 
          value={progress} 
          max={max}
          style={{ 
            height: height,
            color: color // Цвет будет передан через bg-current в Progress компоненте
          }}
          className="bg-white/20"
        />
      </div>
    );
  }
);

AnimatedProgressBar.displayName = "AnimatedProgressBar";

export { AnimatedProgressBar };