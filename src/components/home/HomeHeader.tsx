type HomeHeaderProps = {
  greeting: string;
  totalXP: number;
  level: number;
  levelName: string;
  streak: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  xpInLevel: number;
  xpToNext: number;
  levelProgressPct: number;
  onOpenAchievements: () => void;
  onOpenStats: () => void;
  onOpenCertificate: () => void;
  onDevPointerDown: () => void;
  onDevPointerUpOrLeave: () => void;
};

export default function HomeHeader({
  greeting,
  totalXP,
  level,
  levelName,
  streak,
  completedLessonsCount,
  totalLessonsCount,
  xpInLevel,
  xpToNext,
  levelProgressPct,
  onOpenAchievements,
  onOpenStats,
  onOpenCertificate,
  onDevPointerDown,
  onDevPointerUpOrLeave,
}: HomeHeaderProps) {
  return (
    <div className="solid-header p-4">
      <div className="mx-auto max-w-[600px]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="cursor-pointer text-2xl select-none"
              onPointerDown={onDevPointerDown}
              onPointerUp={onDevPointerUpOrLeave}
              onPointerLeave={onDevPointerUpOrLeave}
            >
              🧪
            </span>
            <div>
              <div className="text-brand-green font-mono text-[10px] tracking-[3px]">
                QA TRAINER
              </div>
              <div className="text-lg font-extrabold text-white">{greeting}, тестировщик!</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="home-toolbar-button"
              onClick={onOpenAchievements}
              aria-label="Открыть достижения"
            >
              <span className="home-toolbar-icon">🏆</span>
            </button>
            <button
              type="button"
              className="home-toolbar-button"
              onClick={onOpenStats}
              aria-label="Открыть статистику"
            >
              <span className="home-toolbar-icon">📊</span>
            </button>
            <button
              type="button"
              className="home-toolbar-button"
              onClick={onOpenCertificate}
              aria-label="Открыть сертификат"
            >
              <span className="home-toolbar-icon">🎓</span>
            </button>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-4 gap-2">
          {[
            { icon: '⚡', val: totalXP, label: 'XP', color: 'text-brand-amber' },
            { icon: '🎯', val: level, label: 'Уровень', color: 'text-brand-green' },
            { icon: '🔥', val: streak, label: 'Серия', color: 'text-brand-red' },
            {
              icon: '✅',
              val: `${completedLessonsCount}/${totalLessonsCount}`,
              label: 'Уроки',
              color: 'text-brand-blue',
            },
          ].map((s, i) => (
            <div key={i} className="home-clean-glass home-stat-card">
              <div className="mb-1 text-base">{s.icon}</div>
              <div className={`font-mono text-lg font-extrabold ${s.color}`}>{s.val}</div>
              <div className="mt-1 text-[9px] tracking-[1.5px] text-slate-300 uppercase">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[11px] text-slate-300">
            <span>
              Уровень {level} — {levelName}
            </span>
            <span>
              {xpInLevel} / {xpToNext} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full border border-white/5 bg-black/30">
            <div
              className="bg-brand-amber h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPct}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
