import * as React from "react";
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/Card';

interface LessonCardProps {
  icon: string;
  title: string;
  category: string;
  xp: number;
  color: string;
  done?: boolean;
  locked?: boolean;
  onClick?: () => void;
  requiredXP?: number;
  hasEnoughXP?: boolean;
}

const LessonCard = React.forwardRef<HTMLDivElement, LessonCardProps>(
  ({ icon, title, category, xp, color, done = false, locked = false, onClick, requiredXP, hasEnoughXP }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    
    const handleClick = () => {
      if (!locked && onClick) {
        onClick();
      }
    };

    return (
      <motion.div
        ref={ref}
        onClick={handleClick}
        className={`relative overflow-hidden transition-all duration-300 ${
          locked 
            ? 'opacity-50 cursor-default' 
            : 'cursor-pointer hover:translate-x-1 hover:bg-white/10'
        }`}
        whileHover={!locked ? { scale: 1.02, x: 5 } : {}}
        whileTap={!locked ? { scale: 0.98 } : {}}
        onHoverStart={() => !locked && setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card 
          className={`p-4 mb-3 transition-all duration-300 ${
            done ? 'border-opacity-50' : ''
          }`}
          style={{ 
            borderColor: !locked && !done ? 'rgba(255,255,255,0.2)' : undefined,
            backgroundColor: !locked && isHovered ? `${color}10` : undefined
          }}
        >
          {done && (
            <div 
              className="absolute top-0 right-0 text-black text-[9px] font-extrabold px-2.5 py-1 rounded-bl-xl tracking-[1px] font-mono" 
              style={{ backgroundColor: color }}
            >
              ГОТОВО ✓
            </div>
          )}
          {locked && requiredXP && !hasEnoughXP && (
            <div className="absolute top-0 right-0 bg-brand-red/80 text-white text-[8px] font-extrabold px-2 py-1 rounded-bl-xl tracking-[1px] font-mono">
              Нужно {requiredXP} честного XP
            </div>
          )}
          <CardContent className="p-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shrink-0 bg-black/20" 
                style={{ borderColor: locked ? 'rgba(255,255,255,0.1)' : `${color}50` }}
              >
                {locked ? '🔒' : icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm mb-0.5 text-white">{title}</div>
                <div className="text-xs text-slate-300 mb-2 truncate">{category}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-300 font-mono">Урок</span>
                  <span className="text-slate-500">·</span>
                  <span 
                    className="bg-brand-amber/20 text-brand-amber border border-brand-amber/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono"
                    style={{ borderColor: `${color}50`, color: color }}
                  >
                    +{xp} XP
                  </span>
                </div>
              </div>
              {!locked && <div className="text-lg shrink-0" style={{ color: color }}>›</div>}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

LessonCard.displayName = "LessonCard";

export { LessonCard };