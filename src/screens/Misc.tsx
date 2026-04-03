import { APP_STATE_STORAGE_KEY, useAppStore, initialState } from '../store';
import { ACHIEVEMENTS } from '../data/achievements';
import { LESSON_META } from '../data/lesson_meta';
import { getLevelInfo } from '../utils';
import { useMemo, useRef, useEffect, useState, useCallback, FormEvent } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import ModalShell from '../components/ModalShell';
import {
  DESIGN_TECHNIQUES_LESSON_IDS,
  FOUNDATION_LESSON_IDS,
  getCertificateProgress,
} from '../domain/course';

export function Stats() {
  const { state, navigate, updateState, showToast } = useAppStore();
  const lvl = getLevelInfo(state.totalXP);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[600px] p-6 pb-10">
      <ConfirmModal
        isOpen={showConfirm}
        title="Сбросить прогресс?"
        message="Это действие нельзя отменить. Вы уверены?"
        onConfirm={() => {
          localStorage.removeItem(APP_STATE_STORAGE_KEY);
          updateState(initialState);
          setShowConfirm(false);
          navigate('splash');
          showToast('Прогресс сброшен', 'text-brand-green');
        }}
        onCancel={() => setShowConfirm(false)}
      />
      <div className="mb-6 flex items-center gap-3">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>
          ← Назад
        </button>
        <h2 className="text-[22px] font-extrabold text-white">📊 Статистика</h2>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {[
          { icon: '⚡', label: 'Всего XP', value: state.totalXP, color: 'text-brand-amber' },
          {
            icon: '🎯',
            label: 'Уровень',
            value: `${lvl.level} — ${lvl.name}`,
            color: 'text-brand-green',
          },
          {
            icon: '✅',
            label: 'Уроков пройдено',
            value: `${state.completedLessons.length} / ${LESSON_META.length}`,
            color: 'text-brand-blue',
          },
          {
            icon: '🏆',
            label: 'Рекорд экзамена',
            value: state.examBestScore ? `${state.examBestScore}%` : '—',
            color: 'text-brand-red',
          },
          {
            icon: '🔥',
            label: 'Серия дней',
            value: state.dailyStreak || 0,
            color: 'text-brand-purple',
          },
          {
            icon: '💎',
            label: 'Достижений',
            value: `${state.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`,
            color: 'text-brand-amber',
          },
          {
            icon: '🎯',
            label: 'Точность ответов',
            value: `${state.totalQuestionsAnswered > 0 ? Math.round((state.totalCorrect / state.totalQuestionsAnswered) * 100) : 0}%`,
            color: 'text-brand-blue',
          },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-3.5 text-center">
            <div className="mb-1 text-[22px]">{s.icon}</div>
            <div className={`font-mono text-lg font-extrabold break-words ${s.color}`}>
              {s.value}
            </div>
            <div className="mt-1 text-[10px] tracking-[1px] text-slate-300 uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel mb-5 p-4">
        <div className="mb-2.5 font-mono text-[11px] tracking-[2px] text-slate-300">
          ПРОГРЕСС УРОВНЯ
        </div>
        <div className="mb-2 flex justify-between text-[13px]">
          <span className="font-bold text-white">{lvl.name}</span>
          <span className="text-slate-300">
            {lvl.xpInLevel} / {lvl.xpToNext} XP
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full border border-white/5 bg-black/30">
          <div
            className="bg-brand-amber h-full rounded-full transition-all duration-500"
            style={{ width: `${lvl.pct}%` }}
          ></div>
        </div>
      </div>

      <div className="glass-panel mb-5 p-4">
        <div className="mb-3 font-mono text-[11px] tracking-[2px] text-slate-300">
          ПРОГРЕСС ПО УРОКАМ
        </div>
        {LESSON_META.map((l) => {
          const done = state.completedLessons.includes(l.id);
          return (
            <div
              key={l.id}
              className="flex items-center gap-2.5 border-b border-white/10 py-2 last:border-0"
            >
              <span className="text-lg">{done ? l.icon : '⬜'}</span>
              <span className={`flex-1 text-[13px] ${done ? 'text-white' : 'text-slate-400'}`}>
                {l.title}
              </span>
              {done ? (
                <span className="text-brand-green text-xs font-bold">✓</span>
              ) : (
                <span className="text-xs text-slate-500">—</span>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="glass-button bg-brand-red/10 border-brand-red/30 text-brand-red w-full py-3.5 font-bold"
        onClick={() => setShowConfirm(true)}
      >
        🗑️ Сбросить прогресс
      </button>
    </div>
  );
}

export function Achievements() {
  const { state, navigate } = useAppStore();
  const earned = state.unlockedAchievements;

  return (
    <div className="mx-auto w-full max-w-[600px] p-6 pb-10">
      <div className="mb-6 flex items-center gap-3">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>
          ← Назад
        </button>
        <h2 className="text-[22px] font-extrabold text-white">🏆 Достижения</h2>
      </div>

      <div className="mb-3 text-[13px] text-slate-300">
        {earned.length} из {ACHIEVEMENTS.length} разблокировано
      </div>

      <div className="flex flex-col gap-2.5">
        {ACHIEVEMENTS.map((a) => {
          const done = earned.includes(a.id);
          return (
            <div
              key={a.id}
              className={`glass-panel flex items-center gap-3.5 p-3.5 ${done ? 'border-amber-500/30 bg-amber-500/10 opacity-100' : 'opacity-50'}`}
            >
              <div className={`text-[34px] ${done ? '' : 'grayscale'}`}>{a.icon}</div>
              <div className="flex-1">
                <div className={`font-bold ${done ? 'text-brand-amber' : 'text-white'}`}>
                  {a.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-300">{a.desc}</div>
              </div>
              <div className={`text-lg ${done ? 'text-brand-amber' : 'text-slate-500'}`}>
                {done ? '✓' : '?'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FOUNDATION_LESSONS = FOUNDATION_LESSON_IDS;
const DESIGN_TECHNIQUES_LESSONS = DESIGN_TECHNIQUES_LESSON_IDS;

export function Certificate() {
  const { state, updateState, navigate, showToast } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(state.certName || '');
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const passInputRef = useRef<HTMLInputElement | null>(null);
  const decorativeCircles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        x: ((i * 83) % 800) + 20,
        y: ((i * 137) % 560) + 10,
        size: 12 + ((i * 17) % 28),
      })),
    []
  );

  const {
    certType,
    foundationCompletedCount,
    designCompletedCount,
    totalCompletedCount,
    totalRequiredCount,
  } = useMemo(() => getCertificateProgress(state.completedLessons), [state.completedLessons]);

  const isCheater = state.isCheater;

  const handlePointerDown = () => {
    if (debugUnlocked) return;
    holdTimerRef.current = setTimeout(() => {
      setShowPassModal(true);
    }, 3000);
  };

  const handlePointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (showPassModal) {
      passInputRef.current?.focus();
    }
  }, [showPassModal]);

  const handlePassSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (passInput === 'cert') {
      setDebugUnlocked(true);
      setShowPassModal(false);
      showToast('Debug: Сертификат разблокирован', 'text-brand-blue');
    } else {
      showToast('Неверный пароль', 'text-brand-red');
    }
    setPassInput('');
  };

  // Helper function to wrap text
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    fontSize: number = 18
  ): string[] => {
    ctx.font = `${fontSize}px Arial, sans-serif`;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const traceRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  const drawCertificate = useCallback(
    (certName: string) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        showToast('Ошибка: Canvas не поддерживается', 'text-brand-red');
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        showToast('Ошибка: Не удалось получить контекст Canvas', 'text-brand-red');
        return;
      }

      try {
        const W = 800,
          H = 560;
        ctx.clearRect(0, 0, W, H);

        const paperGradient = ctx.createLinearGradient(0, 0, 0, H);
        paperGradient.addColorStop(0, '#FFFDF8');
        paperGradient.addColorStop(0.55, '#FEFCF7');
        paperGradient.addColorStop(1, '#F8F4EC');
        ctx.fillStyle = paperGradient;
        ctx.fillRect(0, 0, W, H);

        const ambientGlow = ctx.createRadialGradient(W / 2, 30, 40, W / 2, 30, 360);
        ambientGlow.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
        ambientGlow.addColorStop(0.45, 'rgba(139, 92, 246, 0.04)');
        ambientGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, W, H);

        traceRoundedRect(ctx, 18, 18, W - 36, H - 36, 8);
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 6;
        ctx.stroke();

        traceRoundedRect(ctx, 34, 34, W - 68, H - 68, 4);
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = 'rgba(139, 92, 246, 0.035)';
        for (const circle of decorativeCircles) {
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, circle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.12)';
        ctx.lineWidth = 1.3;
        ctx.setLineDash([8, 10]);
        ctx.beginPath();
        ctx.arc(W / 2, H / 2 + 12, 165, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.beginPath();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
        ctx.lineWidth = 1;
        ctx.arc(W / 2, H / 2 + 12, 132, 0, Math.PI * 2);
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#5B21B6';
        ctx.font = 'bold 15px Arial, sans-serif';
        ctx.fillText('QA TRAINER BY SNIKS1337', W / 2, 68);

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.24)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(130, 82);
        ctx.lineTo(670, 82);
        ctx.stroke();

        ctx.font = 'bold 34px Georgia, serif';
        ctx.fillStyle = '#4C1D95';
        ctx.fillText('СЕРТИФИКАТ', W / 2, 120);

        let headingText = '';
        switch (certType) {
          case 'career':
            headingText = 'о прохождении полного курса ручного тестировщика';
            break;
          default:
            headingText = 'об успешном окончании курса ручного тестирования';
        }

        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = '#5B21B6';
        const maxWidth = W - 180;
        const lineHeight = 20;
        const textLines = wrapText(ctx, headingText, maxWidth, 16);
        const startY = 148;

        textLines.forEach((line, index) => {
          ctx.fillText(line, W / 2, startY + index * lineHeight);
        });

        ctx.font = 'bold 42px Georgia, serif';
        ctx.fillStyle = '#1F2937';
        const nameY = startY + textLines.length * lineHeight + 40;
        ctx.fillText(certName, W / 2, nameY);

        const nameWidth = ctx.measureText(certName).width;
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(W / 2 - nameWidth / 2, nameY + 15);
        ctx.lineTo(W / 2 + nameWidth / 2, nameY + 15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(W / 2 - nameWidth / 2 - 26, nameY + 15);
        ctx.lineTo(W / 2 - nameWidth / 2 - 8, nameY + 15);
        ctx.moveTo(W / 2 + nameWidth / 2 + 8, nameY + 15);
        ctx.lineTo(W / 2 + nameWidth / 2 + 26, nameY + 15);
        ctx.stroke();

        ctx.font = 'italic 18px Georgia, serif';
        ctx.fillStyle = '#4B5563';
        let description = '';
        switch (certType) {
          case 'career':
            description = 'успешно завершил(а) полный курс ручного тестировщика';
            break;
          default:
            description = 'успешно завершил(а) курс ручного тестирования';
        }
        const descY = nameY + 40;
        ctx.fillText(description, W / 2, descY);

        let skills: string[] = [];
        switch (certType) {
          case 'career':
            skills = [
              'Ручное тестирование',
              'Тест-дизайн',
              'Баг-репорты',
              'Smoke и Regression',
              'Анализ требований',
            ];
            break;
          default:
            skills = [
              'Тест-кейсы',
              'Тест-дизайн',
              'Баг-репорты',
              'Smoke и Regression',
              'Анализ требований',
            ];
        }

        ctx.font = 'bold 12px Arial, sans-serif';
        ctx.fillStyle = '#6B21A8';
        ctx.fillText('ПОДТВЕРЖДЕННЫЕ НАВЫКИ', W / 2, descY + 34);

        ctx.font = 'bold 12px Arial, sans-serif';
        const chipPaddingX = 16;
        const chipHeight = 34;
        const chipGap = 12;
        const chipRowGap = 12;
        const maxRowWidth = W - 120;
        const skillRows: Array<Array<{ label: string; width: number }>> = [];
        let currentRow: Array<{ label: string; width: number }> = [];
        let currentRowWidth = 0;

        skills.forEach((skill) => {
          const chipWidth = Math.min(
            180,
            Math.max(104, ctx.measureText(skill).width + chipPaddingX * 2)
          );

          if (currentRow.length > 0 && currentRowWidth + chipGap + chipWidth > maxRowWidth) {
            skillRows.push(currentRow);
            currentRow = [];
            currentRowWidth = 0;
          }

          currentRow.push({ label: skill, width: chipWidth });
          currentRowWidth += currentRow.length > 1 ? chipGap + chipWidth : chipWidth;
        });

        if (currentRow.length > 0) {
          skillRows.push(currentRow);
        }

        const chipsStartY = descY + 54;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        skillRows.forEach((row, rowIndex) => {
          const totalWidth =
            row.reduce((sum, chip) => sum + chip.width, 0) + chipGap * (row.length - 1);
          let x = (W - totalWidth) / 2;
          const y = chipsStartY + rowIndex * (chipHeight + chipRowGap);

          row.forEach((chip) => {
            traceRoundedRect(ctx, x, y, chip.width, chipHeight, 17);
            ctx.fillStyle = '#F5F3FF';
            ctx.fill();
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.36)';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#4C1D95';
            ctx.font = 'bold 12px Arial, sans-serif';
            ctx.fillText(chip.label, x + chip.width / 2, y + chipHeight / 2 + 1);
            x += chip.width + chipGap;
          });
        });

        ctx.textBaseline = 'alphabetic';

        const statsPanelY = chipsStartY + skillRows.length * (chipHeight + chipRowGap) + 18;
        const statsPanelX = 74;
        const statsPanelWidth = W - 148;
        const statsPanelHeight = 78;

        traceRoundedRect(ctx, statsPanelX, statsPanelY, statsPanelWidth, statsPanelHeight, 24);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.20)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        const lvl = getLevelInfo(state.totalXP);
        const statsData = [
          { l: 'Уровень', v: lvl.name },
          { l: 'Набрано XP', v: state.totalXP + ' XP' },
          { l: 'Достижений', v: state.unlockedAchievements.length.toString() },
          { l: 'Уроков', v: state.completedLessons.length + '/' + LESSON_META.length },
        ];

        ctx.textAlign = 'center';
        for (let i = 0; i < statsData.length; i++) {
          const sectionWidth = statsPanelWidth / statsData.length;
          const x = statsPanelX + sectionWidth * i + sectionWidth / 2;

          if (i > 0) {
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.14)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(statsPanelX + sectionWidth * i, statsPanelY + 16);
            ctx.lineTo(statsPanelX + sectionWidth * i, statsPanelY + statsPanelHeight - 16);
            ctx.stroke();
          }

          ctx.font = 'bold 20px Arial, sans-serif';
          ctx.fillStyle = '#312E81';
          ctx.fillText(statsData[i].v, x, statsPanelY + 33);
          ctx.font = '11px Arial, sans-serif';
          ctx.fillStyle = '#6B7280';
          ctx.fillText(statsData[i].l, x, statsPanelY + 54);
        }

        // Footer with date
        const footerY = H - 42;
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, footerY - 10);
        ctx.lineTo(W - 60, footerY - 10);
        ctx.stroke();

        ctx.fillStyle = '#6B7280';
        ctx.font = '11px Arial, sans-serif';
        const ds = new Date().toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        ctx.textAlign = 'center';
        ctx.fillText(`Дата выдачи: ${ds}`, W / 2, footerY);

        // Watermark for debug mode
        if (isCheater) {
          ctx.save();
          ctx.translate(W / 2, H / 2 + 8);
          ctx.rotate(-Math.PI / 7);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          traceRoundedRect(ctx, -245, -48, 490, 96, 18);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.22)';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.font = 'bold 42px Arial, sans-serif';
          ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
          ctx.fillText('НЕДЕЙСТВИТЕЛЬНЫЙ', 0, 4);
          ctx.restore();
        }
      } catch (error) {
        console.error('Ошибка при рисовании сертификата:', error);
        showToast('Ошибка при создании сертификата', 'text-brand-red');
      }
    },
    [
      certType,
      decorativeCircles,
      isCheater,
      showToast,
      state.completedLessons.length,
      state.totalXP,
      state.unlockedAchievements.length,
    ]
  );

  useEffect(() => {
    if ((certType !== 'none' || debugUnlocked) && canvasRef.current) {
      drawCertificate(name || 'Твоё имя');
    }
  }, [certType, debugUnlocked, drawCertificate, name]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QA_Certificate_${(name || 'QA_Graduate').replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast('🎓 Сертификат скачан!');
  };

  return (
    <div className="mx-auto w-full max-w-[600px] p-6 pb-10">
      {/* Modal вынесен наружу, чтобы не ограничивался размером родителя */}
      {showPassModal && (
        <ModalShell
          isOpen={showPassModal}
          onClose={() => setShowPassModal(false)}
          size="wide"
          showCloseButton
        >
          <h3 className="mb-2 text-xl font-extrabold text-white">Cert Debug</h3>
          <p className="mb-6 text-[14px] leading-relaxed text-slate-300">
            Введи сервисный пароль, чтобы открыть отладочный просмотр сертификата.
          </p>
          <form onSubmit={handlePassSubmit}>
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="Пароль"
              className="glass-input mb-4 w-full p-3"
              ref={passInputRef}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="glass-button flex-1 py-3 text-[13px] font-bold tracking-wide uppercase"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="bg-brand-blue/80 hover:bg-brand-blue border-brand-blue/50 flex-1 rounded-2xl border py-3 text-[13px] font-bold tracking-wide text-white uppercase backdrop-blur-md transition-colors"
              >
                Открыть
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      <div className="mb-6 flex items-center gap-3">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>
          ← Назад
        </button>
        <h2 className="text-[22px] font-extrabold text-white">🎓 Сертификат</h2>
      </div>

      {certType === 'none' && !debugUnlocked ? (
        <div className="glass-panel border-dashed px-5 py-10 text-center">
          <div
            className="mb-4 cursor-help text-5xl grayscale select-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            🎓
          </div>
          <div className="mb-2 text-base font-bold text-white">Сертификат заблокирован</div>
          {isCheater ? (
            <div className="text-brand-red text-[13px] leading-relaxed">
              Выдача сертификата невозможна, так как использовалось меню разработчика (накрутка
              опыта или открытие уроков).
            </div>
          ) : (
            <>
              <div className="text-[13px] leading-relaxed text-slate-300">
                Пройди уроки по выбранной категории, чтобы получить сертификат:
              </div>
              <div className="mt-2 text-[13px] leading-relaxed text-slate-300">
                <div>
                  <strong>• Основы</strong>: {FOUNDATION_LESSONS.length} уроков (
                  {foundationCompletedCount} / {FOUNDATION_LESSONS.length} пройдено)
                </div>
                <div>
                  <strong>• Техники тест-дизайна</strong>: {DESIGN_TECHNIQUES_LESSONS.length} урока
                  ({designCompletedCount} / {DESIGN_TECHNIQUES_LESSONS.length} пройдено, требуется
                  все из Основ)
                </div>
                <div>
                  <strong>• Карьера</strong>: 1 урок + все из Основ
                </div>
              </div>
              <div className="text-brand-green mt-4 font-mono text-[13px]">
                Прогресс цепочки: {totalCompletedCount} / {totalRequiredCount} уроков
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {isCheater && (
            <div className="glass-panel border-brand-red/30 bg-brand-red/10 text-brand-red mb-5 p-3.5 text-center text-[13px]">
              ⚠️ Обнаружено читерство: сертификат показан только для просмотра, скачивание
              заблокировано.
            </div>
          )}
          {!isCheater && !debugUnlocked && (
            <div className="glass-panel border-brand-green/30 bg-brand-green/10 text-brand-green mb-5 p-3.5 text-center text-[13px]">
              {certType === 'career' && (
                <>
                  <div className="mb-2">
                    ✅ Вся цепочка уроков завершена: Основы, Техники тест-дизайна и Карьера.
                  </div>
                  {'✅ Введи своё имя и скачай сертификат.'}
                </>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block font-mono text-[12px] tracking-[2px] text-slate-300">
              ТВОЁ ИМЯ
            </label>
            <input
              type="text"
              placeholder="Например: Иван Петров"
              maxLength={40}
              value={name}
              onChange={(e) => {
                if (!isCheater && !debugUnlocked) {
                  setName(e.target.value);
                  updateState({ certName: e.target.value });
                }
              }}
              disabled={isCheater || debugUnlocked}
              className={`glass-input w-full p-3.5 font-sans text-[15px] font-semibold text-white ${isCheater || debugUnlocked ? 'cursor-not-allowed bg-gray-700' : ''}`}
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block font-mono text-[12px] tracking-[2px] text-slate-300">
              ПРЕДПРОСМОТР
            </label>
            <canvas
              ref={canvasRef}
              width="800"
              height="560"
              className="block w-full rounded-2xl border border-white/10 shadow-xl"
            ></canvas>
          </div>

          <button
            disabled={isCheater || debugUnlocked}
            className={`w-full rounded-xl border py-4 text-[15px] font-bold backdrop-blur-md transition-all ${isCheater || debugUnlocked ? 'cursor-not-allowed border-white/5 bg-black/20 text-slate-500 grayscale' : 'bg-brand-green/80 hover:bg-brand-green border-brand-green/50 text-white'}`}
            onClick={handleDownload}
          >
            {isCheater || debugUnlocked
              ? '🚫 Скачивание заблокировано из-за читов / дебаг-режима'
              : '⬇️ Скачать сертификат (PNG)'}
          </button>
        </div>
      )}
    </div>
  );
}
