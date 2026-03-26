import * as React from "react";
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface AnimatedStat {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

interface AnimatedStatsCardProps {
  title: string;
  stats: AnimatedStat[];
  className?: string;
}

const AnimatedStatsCard = React.forwardRef<HTMLDivElement, AnimatedStatsCardProps>(
  ({ title, stats, className = "" }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
        className={className}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="glass-panel p-3.5 text-center"
              >
                <div className="text-[22px] mb-1">{stat.icon}</div>
                <div className={`text-lg font-extrabold font-mono ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-300 mt-1 tracking-[1px] uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

AnimatedStatsCard.displayName = "AnimatedStatsCard";

export { AnimatedStatsCard };