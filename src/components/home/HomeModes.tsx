import type { KeyboardEvent } from 'react';
import CardOutline from './CardOutline';

type HomeModesProps = {
  dailyDone: boolean;
  dailyStreak: number;
  completedLessonsCount: number;
  examBestScore: number;
  practDone: number;
  practiceTotal: number;
  totalLessons: number;
  isCompleteCelebrating: boolean;
  completeCelebrationKey: number;
  completeStarParticles: Array<{
    id: string;
    x: number;
    delay: number;
    duration: number;
    size: number;
    drift: number;
    rotate: number;
  }>;
  onOpenDaily: () => void;
  onOpenExam: () => void;
  onOpenPractice: () => void;
  onCompleteCelebrate: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, action: () => void) => void;
  plural: (n: number, one: string, two: string, many: string) => string;
};

export default function HomeModes({
  dailyDone,
  dailyStreak,
  completedLessonsCount,
  examBestScore,
  practDone,
  practiceTotal,
  totalLessons,
  isCompleteCelebrating,
  completeCelebrationKey,
  completeStarParticles,
  onOpenDaily,
  onOpenExam,
  onOpenPractice,
  onCompleteCelebrate,
  onKeyDown,
  plural,
}: HomeModesProps) {
  return (
    <div className="pb-10">
      <div className={`relative mb-3 ${dailyDone ? 'opacity-60' : ''}`}>
        <CardOutline color="#a78bfa" variant="ambient" />
        <div
          onClick={() => !dailyDone && onOpenDaily()}
          onKeyDown={(event) => {
            if (dailyDone) {
              return;
            }
            onKeyDown(event, onOpenDaily);
          }}
          role="button"
          tabIndex={dailyDone ? -1 : 0}
          aria-disabled={dailyDone}
          className={`home-surface-card home-surface-card--mode mode-gloss mode-gloss--daily border-purple-400/30 bg-purple-400/5 p-4 transition-all duration-300 ${dailyDone ? 'cursor-default' : 'cursor-pointer hover:bg-purple-400/10'}`}
        >
          <div className="relative z-[1] flex items-center gap-3">
            <div className="text-3xl">{dailyDone ? '✅' : '📅'}</div>
            <div className="flex-1">
              <div className="mb-1 text-sm font-extrabold text-white">
                Ежедневный квиз {dailyStreak > 1 && `🔥${dailyStreak}`}
              </div>
              <div className="text-xs text-slate-300">
                {dailyDone
                  ? 'Уже пройден сегодня — возвращайся завтра!'
                  : '5 случайных вопросов · +15 XP · Обновляется каждый день'}
              </div>
            </div>
            {!dailyDone && <div className="text-brand-purple text-lg">›</div>}
          </div>
        </div>
      </div>

      {completedLessonsCount >= 4 && (
        <div className="relative mb-3">
          <CardOutline color="#f87171" variant="ambient" />
          <div
            onClick={onOpenExam}
            onKeyDown={(event) => onKeyDown(event, onOpenExam)}
            role="button"
            tabIndex={0}
            className="home-surface-card home-surface-card--mode mode-gloss mode-gloss--exam cursor-pointer border-red-400/30 bg-red-400/5 p-4 transition-all duration-300 hover:bg-red-400/10"
          >
            <div className="relative z-[1] flex items-center gap-3">
              <div className="text-3xl">🎯</div>
              <div className="flex-1">
                <div className="mb-1 text-sm font-extrabold text-white">Режим экзамена</div>
                <div className="text-xs text-slate-300">
                  20 вопросов · 10 минут · Без подсказок{' '}
                  {examBestScore > 0 && (
                    <span>
                      · Рекорд:{' '}
                      <span className="text-brand-red font-extrabold">{examBestScore}%</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="text-brand-red text-lg">›</div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-3">
        <CardOutline color="#34d399" variant="ambient" />
        <div
          onClick={onOpenPractice}
          onKeyDown={(event) => onKeyDown(event, onOpenPractice)}
          role="button"
          tabIndex={0}
          className="home-surface-card home-surface-card--mode mode-gloss mode-gloss--practice cursor-pointer border-emerald-400/30 bg-emerald-400/5 p-4 transition-all duration-300 hover:bg-emerald-400/10"
        >
          <div className="relative z-[1] flex items-center gap-3">
            <div className="text-3xl">🛠️</div>
            <div className="flex-1">
              <div className="mb-1 text-sm font-extrabold text-white">Практические задания</div>
              <div className="text-xs text-slate-300">
                Реальные сценарии · {practDone}/{practiceTotal} пройдено
              </div>
            </div>
            <div className="text-lg text-emerald-400">›</div>
          </div>
        </div>
      </div>

      {completedLessonsCount === 0 ? (
        <div className="p-5 text-center text-[13px] leading-relaxed text-slate-300">
          <div className="mb-2 text-3xl">🚀</div>
          Начни с первого урока! Каждый профессиональный тестировщик начинал именно так.
        </div>
      ) : completedLessonsCount < totalLessons ? (
        <div className="glass-panel mt-1 p-4 text-center">
          <div className="mb-1 text-2xl">
            {completedLessonsCount > totalLessons / 2 ? '💪' : '🌱'}
          </div>
          <div className="mb-1 text-sm font-bold text-white">
            {Math.round((completedLessonsCount / totalLessons) * 100)}% пройдено
          </div>
          <div className="text-xs text-slate-300">
            Ещё {totalLessons - completedLessonsCount}{' '}
            {plural(totalLessons - completedLessonsCount, 'урок', 'урока', 'уроков')} до финала!
          </div>
        </div>
      ) : (
        <div className="glass-panel home-complete-panel border-brand-green/40 bg-brand-green/10 p-5 text-center">
          <button
            type="button"
            className={`complete-panel-star-trigger ${isCompleteCelebrating ? 'complete-panel-star-trigger--active' : ''}`}
            onClick={onCompleteCelebrate}
            aria-label="Запустить праздничные звёзды"
          >
            ✦
          </button>
          {isCompleteCelebrating && (
            <div className="complete-panel-stars" key={completeCelebrationKey} aria-hidden="true">
              {completeStarParticles.map((particle) => (
                <span
                  key={`${completeCelebrationKey}-${particle.id}`}
                  className="complete-panel-star"
                  style={{
                    left: `${particle.x}%`,
                    animationDelay: `${particle.delay}ms`,
                    animationDuration: `${particle.duration}ms`,
                    ['--star-size' as string]: `${particle.size}px`,
                    ['--star-drift' as string]: `${particle.drift}px`,
                    ['--star-rotate' as string]: `${particle.rotate}deg`,
                  }}
                >
                  ✦
                </span>
              ))}
            </div>
          )}
          <div className="mb-2 animate-bounce text-4xl">🏆</div>
          <div className="text-brand-green text-base font-extrabold">Все уроки пройдены!</div>
          <div className="mt-1.5 text-xs text-slate-300">
            Теперь испытай себя в режиме экзамена 👆
          </div>
        </div>
      )}
    </div>
  );
}
