import type { KeyboardEvent } from 'react';
import type { LessonMeta } from '../../types';
import TiltedSurface from '../TiltedSurface';
import CardOutline from './CardOutline';

type HomeLessonCardProps = {
  lesson: LessonMeta;
  done: boolean;
  locked: boolean;
  isOpening: boolean;
  isHovered: boolean;
  questionCountLabel: string;
  onOpen: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, action: () => void) => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
};

export default function HomeLessonCard({
  lesson,
  done,
  locked,
  isOpening,
  isHovered,
  questionCountLabel,
  onOpen,
  onKeyDown,
  onHoverStart,
  onHoverEnd,
}: HomeLessonCardProps) {
  return (
    <div
      onClick={onOpen}
      onKeyDown={(event) => onKeyDown(event, onOpen)}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked}
      className={`relative mb-3 overflow-visible transition-all duration-300 ${locked ? 'cursor-default opacity-50' : 'cursor-pointer'} ${isOpening ? 'lesson-card-opening scale-[0.995]' : ''}`}
    >
      <TiltedSurface disabled={locked} className="rounded-[24px]">
        {!locked && <CardOutline color={lesson.color} hovered={isHovered} opening={isOpening} />}
        <div
          className={`home-surface-card lesson-tilt-face relative overflow-hidden p-4 transition-all duration-300 ${locked ? '' : 'hover:bg-white/10'} ${done ? 'border-opacity-50' : ''}`}
          style={{
            ['--lesson-accent' as string]: lesson.color,
            borderColor: !locked && !done ? 'rgba(255,255,255,0.2)' : undefined,
          }}
        >
          {done && (
            <div
              className="status-ribbon text-black"
              style={{ ['--status-bg' as string]: lesson.color }}
            >
              ГОТОВО ✓
            </div>
          )}
          <div className="lesson-tilt-content relative z-[1] flex items-center gap-3">
            <div className="lesson-tilt-icon-slot relative h-12 w-12 shrink-0">
              <div
                aria-hidden="true"
                className="lesson-tilt-icon-well absolute inset-0 rounded-xl"
                style={{
                  ['--icon-accent' as string]: locked ? 'rgba(255,255,255,0.18)' : lesson.color,
                }}
              />
              <div
                className="lesson-tilt-icon absolute top-0 left-0 flex h-12 w-12 items-center justify-center rounded-xl border bg-black/20 text-2xl"
                data-icon={locked ? '🔒' : lesson.icon}
                style={{
                  ['--icon-color' as string]: locked ? '#94a3b8' : lesson.color,
                  borderColor: locked ? 'rgba(255,255,255,0.1)' : `${lesson.color}50`,
                }}
              >
                {locked ? '🔒' : lesson.icon}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-sm font-bold text-white">{lesson.title}</div>
              <div className="mb-2 truncate text-xs text-slate-300">{lesson.desc}</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-slate-300">{questionCountLabel}</span>
                <span className="text-slate-500">·</span>
                <span className="bg-brand-amber/20 text-brand-amber border-brand-amber/30 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold">
                  До {Math.round(lesson.xp * 1.5)} XP
                </span>
              </div>
            </div>
            {!locked && (
              <div
                className={`shrink-0 text-lg transition-all duration-200 ${isOpening ? 'translate-x-0.5 text-white' : ''}`}
                style={{ color: isOpening ? undefined : lesson.color }}
              >
                ›
              </div>
            )}
          </div>
        </div>
      </TiltedSurface>
    </div>
  );
}
