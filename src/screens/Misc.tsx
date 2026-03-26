import { useAppStore, initialState } from '../store';
import { QUOTES, LESSONS, ACHIEVEMENTS } from '../data';
import { getLevelInfo } from '../utils';
import { useMemo, useRef, useEffect, useState, FormEvent } from 'react';
import ConfirmModal from '../components/ConfirmModal';

export function Splash() {
  const { navigate } = useAppStore();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center w-full">
      <div className="max-w-[380px] w-full glass-panel p-8">
        <div className="text-[64px] mb-4 animate-bounce">🧪</div>
        <h1 className="text-4xl font-extrabold leading-[1.1] mb-3 text-white">QA<br/><span className="text-brand-green">Trainer</span></h1>
        <p className="text-slate-300 text-[15px] leading-relaxed mb-2">Стань профессиональным тестировщиком. Учись играя, как в Duolingo.</p>
        
        <div className="my-6 p-4 bg-brand-green/10 border-l-[3px] border-brand-green rounded-r-xl text-left text-[13px] leading-relaxed text-white italic">
          "{quote.text}"
          <span className="not-italic text-[11px] text-slate-300 mt-1 block">— {quote.author}, "{quote.book}"</span>
        </div>

        <button className="w-full bg-brand-green/80 hover:bg-brand-green backdrop-blur-md border border-brand-green/50 text-white font-bold py-4 rounded-xl text-base transition-colors" onClick={() => navigate('home')}>
          Начать обучение →
        </button>
        <p className="mt-3 text-[12px] text-slate-400">Прогресс сохраняется автоматически</p>
      </div>
    </div>
  );
}

export function Stats() {
  const { state, navigate, updateState, showToast } = useAppStore();
  const lvl = getLevelInfo(state.totalXP);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="max-w-[600px] mx-auto p-6 pb-10 w-full">
      <ConfirmModal 
        isOpen={showConfirm} 
        title="Сбросить прогресс?" 
        message="Это действие нельзя отменить. Вы уверены?" 
        onConfirm={() => {
          localStorage.removeItem('qa_trainer_v2');
          updateState(initialState);
          setShowConfirm(false);
          navigate('splash');
          showToast('Прогресс сброшен', 'text-brand-green');
        }} 
        onCancel={() => setShowConfirm(false)} 
      />
      <div className="flex items-center gap-3 mb-6">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>← Назад</button>
        <h2 className="text-[22px] font-extrabold text-white">📊 Статистика</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        {[
          {icon:'⚡', label:'Всего XP', value: state.totalXP, color:'text-brand-amber'},
          {icon:'🎯', label:'Уровень', value: `${lvl.level} — ${lvl.name}`, color:'text-brand-green'},
          {icon:'✅', label:'Уроков пройдено', value: `${state.completedLessons.length} / ${LESSONS.length}`, color:'text-brand-blue'},
          {icon:'🏆', label:'Рекорд экзамена', value: state.examBestScore ? `${state.examBestScore}%` : '—', color:'text-brand-red'},
          {icon:'🔥', label:'Серия дней', value: state.dailyStreak || 0, color:'text-brand-purple'},
          {icon:'💎', label:'Достижений', value: `${state.unlockedAchievements.length} / ${ACHIEVEMENTS.length}`, color:'text-brand-amber'},
          {icon:'🎯', label:'Точность ответов', value: `${state.totalQuestionsAnswered > 0 ? Math.round((state.totalCorrect / state.totalQuestionsAnswered) * 100) : 0}%`, color:'text-brand-blue'},
        ].map((s, i) => (
          <div key={i} className="glass-panel p-3.5 text-center">
            <div className="text-[22px] mb-1">{s.icon}</div>
            <div className={`text-lg font-extrabold font-mono break-words ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-slate-300 mt-1 tracking-[1px] uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-panel p-4 mb-5">
        <div className="text-[11px] text-slate-300 tracking-[2px] font-mono mb-2.5">ПРОГРЕСС УРОВНЯ</div>
        <div className="flex justify-between mb-2 text-[13px]">
          <span className="font-bold text-white">{lvl.name}</span>
          <span className="text-slate-300">{lvl.xpInLevel} / {lvl.xpToNext} XP</span>
        </div>
        <div className="bg-black/30 rounded-full h-3 overflow-hidden border border-white/5">
          <div className="h-full bg-brand-amber rounded-full transition-all duration-500" style={{ width: `${lvl.pct}%` }}></div>
        </div>
      </div>

      <div className="glass-panel p-4 mb-5">
        <div className="text-[11px] text-slate-300 tracking-[2px] font-mono mb-3">ПРОГРЕСС ПО УРОКАМ</div>
        {LESSONS.map(l => {
          const done = state.completedLessons.includes(l.id);
          return (
            <div key={l.id} className="flex items-center gap-2.5 py-2 border-b border-white/10 last:border-0">
              <span className="text-lg">{done ? l.icon : '⬜'}</span>
              <span className={`flex-1 text-[13px] ${done ? 'text-white' : 'text-slate-400'}`}>{l.title}</span>
              {done ? <span className="text-brand-green text-xs font-bold">✓</span> : <span className="text-slate-500 text-xs">—</span>}
            </div>
          );
        })}
      </div>

      <button className="w-full glass-button bg-brand-red/10 border-brand-red/30 text-brand-red font-bold py-3.5" onClick={() => setShowConfirm(true)}>
        🗑️ Сбросить прогресс
      </button>
    </div>
  );
}

export function Achievements() {
  const { state, navigate } = useAppStore();
  const earned = state.unlockedAchievements;

  return (
    <div className="max-w-[600px] mx-auto p-6 pb-10 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>← Назад</button>
        <h2 className="text-[22px] font-extrabold text-white">🏆 Достижения</h2>
      </div>

      <div className="text-[13px] text-slate-300 mb-3">{earned.length} из {ACHIEVEMENTS.length} разблокировано</div>
      
      <div className="flex flex-col gap-2.5">
        {ACHIEVEMENTS.map(a => {
          const done = earned.includes(a.id);
          return (
            <div key={a.id} className={`glass-panel p-3.5 flex gap-3.5 items-center ${done ? 'bg-amber-500/10 border-amber-500/30 opacity-100' : 'opacity-50'}`}>
              <div className={`text-[34px] ${done ? '' : 'grayscale'}`}>{a.icon}</div>
              <div className="flex-1">
                <div className={`font-bold ${done ? 'text-brand-amber' : 'text-white'}`}>{a.title}</div>
                <div className="text-xs text-slate-300 mt-0.5">{a.desc}</div>
              </div>
              <div className={`text-lg ${done ? 'text-brand-amber' : 'text-slate-500'}`}>{done ? '✓' : '?'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const FOUNDATION_LESSONS = ['pyramid','testcase','states','checklist','types','buglife','requirements','smoke_sanity','defect_types']; // Основы - 9 уроков
const DESIGN_TECHNIQUES_LESSONS = ['equiv','boundary']; // Техники тест-дизайна - 2 урока
const CAREER_LESSON = ['interview']; // Карьера - 1 урок

export function Certificate() {
  const { state, updateState, navigate, showToast } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(state.certName || '');
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [certType, setCertType] = useState<'none'|'foundation'|'design'|'career'>('none');

  // Проверяем, какие сертификаты доступны
  const coreFoundationDone = FOUNDATION_LESSONS.every(id => state.completedLessons.includes(id)); // 9 уроков основ
  const designDone = coreFoundationDone && DESIGN_TECHNIQUES_LESSONS.every(id => state.completedLessons.includes(id)); // 2 урока техник дизайна
  const foundationDone = coreFoundationDone; // Для сертификата "Основы" теперь требуются все 9 уроков основ
  const careerDone = coreFoundationDone && state.completedLessons.includes(CAREER_LESSON[0]); // 1 урок карьеры (плюс основы)

  // Определяем тип доступного сертификата (наивысший из пройденных)
  useEffect(() => {
    if (careerDone) setCertType('career');
    else if (designDone) setCertType('design');
    else if (coreFoundationDone) setCertType('foundation'); // Используем только 8 основных уроков для сертификата "Основы"
    else setCertType('none');
  }, [careerDone, designDone, coreFoundationDone]);

  const isCheater = state.isCheater;

  const handlePointerDown = () => {
    if (debugUnlocked) return;
    const timer = setTimeout(() => {
      setShowPassModal(true);
    }, 3000);
    setHoldTimer(timer);
  };

  const handlePointerUp = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  };

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

  useEffect(() => {
    if (((certType !== 'none' && !isCheater) || debugUnlocked) && canvasRef.current) {
      drawCertificate(name || 'Твоё имя');
    }
  }, [name, certType, isCheater, debugUnlocked]);

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number = 18): string[] => {
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

  const drawCertificate = (certName: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const W = 800, H = 560;
    ctx.clearRect(0, 0, W, H);

    // Modern gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#ffffff'); 
    bgGrad.addColorStop(0.2, '#f8fafc'); 
    bgGrad.addColorStop(0.8, '#e2e8f0'); 
    bgGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bgGrad; 
    ctx.fillRect(0, 0, W, H);

    // Subtle pattern
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 60) { 
      ctx.beginPath(); 
      ctx.moveTo(x, 0); 
      ctx.lineTo(x, H); 
      ctx.stroke(); 
    }
    for (let y = 0; y < H; y += 60) { 
      ctx.beginPath(); 
      ctx.moveTo(0, y); 
      ctx.lineTo(W, y); 
      ctx.stroke(); 
    }

    // Main border with shadow
    ctx.shadowColor = 'rgba(30, 64, 175, 0.2)';
    ctx.shadowBlur = 15;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(40, 40, W-80, H-80);
    ctx.shadowBlur = 0;

    // Decorative corner elements
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(45, 40); ctx.lineTo(75, 40); ctx.stroke();
    ctx.beginPath(); 
    ctx.moveTo(40, 45); ctx.lineTo(40, 75); ctx.stroke();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(W-45, 40); ctx.lineTo(W-75, 40); ctx.stroke();
    ctx.beginPath(); 
    ctx.moveTo(W-40, 45); ctx.lineTo(W-40, 75); ctx.stroke();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(45, H-40); ctx.lineTo(75, H-40); ctx.stroke();
    ctx.beginPath(); 
    ctx.moveTo(40, H-45); ctx.lineTo(40, H-75); ctx.stroke();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(W-45, H-40); ctx.lineTo(W-75, H-40); ctx.stroke();
    ctx.beginPath(); 
    ctx.moveTo(W-40, H-45); ctx.lineTo(W-40, H-75); ctx.stroke();

    // Logo area with modern styling
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.fillText('🧪', W/2, 140);

    // Title styling
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillStyle = '#1e40af';
    ctx.fillText('QA TRAINER BY SNIKS1337', W/2, 180);

    // Decorative separator
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2 - 100, 190);
    ctx.lineTo(W/2 + 100, 190);
    ctx.stroke();

    // Certificate heading with certificate type
    let headingText = '';
    switch(certType) {
      case 'foundation':
        headingText = 'СЕРТИФИКАТ ОБ ОКОНЧАНИИ КУРСА ПО ОСНОВАМ ТЕСТИРОВАНИЯ';
        break;
      case 'design':
        headingText = 'СЕРТИФИКАТ ОБ ОКОНЧАНИИ КУРСА ПО ТЕХНИКАМ ТЕСТ-ДИЗАЙНА';
        break;
      case 'career':
        headingText = 'СЕРТИФИКАТ ОБ ОКОНЧАНИИ КУРСА ПО КАРЬЕРНОМУ РОСТУ В QA';
        break;
      default:
        headingText = 'СЕРТИФИКАТ ОБ УСПЕШНОМ ОКОНЧАНИИ ОБУЧЕНИЯ';
    }
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.fillStyle = '#1d4ed8';
    
    // Wrap text to multiple lines if needed
    const maxWidth = W - 200;
    const lineHeight = 22;
    const textLines = wrapText(ctx, headingText, maxWidth, 16);
    const startY = 230;
    
    textLines.forEach((line, index) => {
      ctx.fillText(line, W/2, startY + index * lineHeight);
    });

    // Certificate recipient name with enhanced styling
    const fs = certName.length > 22 ? 32 : certName.length > 16 ? 36 : 42;
    ctx.font = `bold italic ${fs}px Georgia, serif`;
    ctx.fillStyle = '#1e3a8a';
    
    // Center name vertically
    const nameY = startY + textLines.length * lineHeight + 50;
    ctx.fillText(certName, W/2, nameY);

    // Elegant underline for name
    const nameWidth = ctx.measureText(certName).width;
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2 - nameWidth/2 - 10, nameY + 10);
    ctx.lineTo(W/2 + nameWidth/2 + 10, nameY + 10);
    ctx.stroke();

    // Description based on certificate type
    ctx.font = 'italic 16px Georgia, serif';
    ctx.fillStyle = '#374151';
    let description = '';
    switch(certType) {
      case 'foundation':
        description = 'успешно завершил(а) курс по основам ручного тестирования';
        break;
      case 'design':
        description = 'успешно завершил(а) курс по техникам тест-дизайна';
        break;
      case 'career':
        description = 'успешно завершил(а) курс по карьерному росту в QA';
        break;
      default:
        description = 'успешно завершил(а) базовый курс ручного тестирования';
    }
    const descY = nameY + 50;
    ctx.fillText(description, W/2, descY);

    // Skill badges with improved styling
    let skills: string[] = [];
    switch(certType) {
      case 'foundation':
        skills = ['Тест-дизайн','Пирамида тестов','Граничные значения','Баг-репорты','Agile QA'];
        break;
      case 'design':
        skills = ['Классы эквивалентности','Граничные значения','Таблицы решений','Тест-кейсы','Исследовательское тестирование'];
        break;
      case 'career':
        skills = ['Собеседования','CV и портфолио','Карьерный рост','Презентация навыков','Работа в команде'];
        break;
      default:
        skills = ['Тест-дизайн','Пирамида тестов','Граничные значения','Баг-репорты','Agile QA'];
    }
    
    const skillY = descY + 40;
    const skillRadius = 30;
    const centerX = W/2;
    const totalAngle = Math.PI * 2;
    const angleStep = totalAngle / skills.length;
    
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI/2; // Start from top (12 o'clock)
      const radius = 120; // Distance from center
      
      const x = centerX + radius * Math.cos(angle);
      const y = skillY + radius * Math.sin(angle);
      
      // Draw circular badge
      ctx.fillStyle = '#dbeafe';
      ctx.beginPath();
      ctx.arc(x, y, skillRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Text in the center of the badge
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Wrap long text
      const skillWords = wrapText(ctx, skill, skillRadius * 1.5, 11);
      skillWords.forEach((word, idx, arr) => {
        ctx.fillText(word, x, y + (idx - (arr.length - 1) / 2) * 12);
      });
    });

    // Stats section
    const statsY = skillY + 200;
    const lvl=getLevelInfo(state.totalXP);
    const statsData = [
      {l:'Уровень', v:lvl.name},
      {l:'Набрано XP', v:state.totalXP+' XP'},
      {l:'Достижений', v:state.unlockedAchievements.length.toString()},
      {l:'Уроков', v:state.completedLessons.length+'/'+LESSONS.length},
    ];
    
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e40af';
    
    statsData.forEach((s, i, arr) => {
      const x = 100 + i * (W - 200) / arr.length;
      ctx.fillText(s.v, x, statsY);
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(s.l, x, statsY + 20);
      ctx.font = 'bold 14px Arial, sans-serif';
      ctx.fillStyle = '#1e40af';
    });

    // Signature lines
    const sigY = statsY + 50;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, sigY);
    ctx.lineTo(250, sigY);
    ctx.stroke();
    
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Руководитель курса', 175, sigY + 20);
    
    ctx.beginPath();
    ctx.moveTo(W - 100, sigY);
    ctx.lineTo(W - 250, sigY);
    ctx.stroke();
    ctx.fillText('Ученик', W - 175, sigY + 20);

    // Footer with date and ID
    const footerY = H - 40;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, footerY - 15);
    ctx.lineTo(W - 60, footerY - 15);
    ctx.stroke();
    
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'left';
    const ds = new Date().toLocaleDateString('ru-RU', {year:'numeric',month:'long',day:'numeric'});
    ctx.fillText('Дата: ' + ds, 60, footerY);
    
    ctx.textAlign = 'right';
    const certId = 'QA-' + Math.abs(certName.split('').reduce((a,c) => a*31 + c.charCodeAt(0), 0) % 99999).toString().padStart(5, '0');
    ctx.fillText('ID: ' + certId, W - 60, footerY);

    // Watermark for debug mode
    if (debugUnlocked && isCheater) {
      ctx.save();
      ctx.translate(W/2, H/2);
      ctx.rotate(-Math.PI/6);
      ctx.font = 'bold 36px Arial';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('НЕДЕЙСТВИТЕЛЬНЫЙ', 0, 0);
      ctx.restore();
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QA_Certificate_${(name || 'QA_Graduate').replace(/\s+/g, '_')}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    showToast('🎓 Сертификат скачан!');
  };

  return (
    <div className="max-w-[600px] mx-auto p-6 pb-10 w-full">
      <div className="flex items-center gap-3 mb-6">
        <button className="glass-button px-3.5 py-2 text-[13px]" onClick={() => navigate('home')}>← Назад</button>
        <h2 className="text-[22px] font-extrabold text-white">🎓 Сертификат</h2>
      </div>

      {certType === 'none' && !debugUnlocked ? (
        <div className="text-center py-10 px-5 glass-panel border-dashed">
          <div 
            className="text-5xl mb-4 grayscale cursor-help select-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            🎓
          </div>
          <div className="text-base font-bold mb-2 text-white">Сертификат заблокирован</div>
          {isCheater ? (
            <div className="text-[13px] text-brand-red leading-relaxed">Выдача сертификата невозможна, так как использовалось меню разработчика (накрутка опыта или открытие уроков).</div>
          ) : (
            <>
              <div className="text-[13px] text-slate-300 leading-relaxed">Пройди уроки по выбранной категории, чтобы получить сертификат:</div>
              <div className="mt-2 text-[13px] text-slate-300 leading-relaxed">
                <div><strong>• Основы</strong>: {FOUNDATION_LESSONS.length} уроков ({FOUNDATION_LESSONS.filter(id => state.completedLessons.includes(id)).length} / {FOUNDATION_LESSONS.length} пройдено)</div>
                <div><strong>• Техники тест-дизайна</strong>: {DESIGN_TECHNIQUES_LESSONS.length} урока ({DESIGN_TECHNIQUES_LESSONS.filter(id => state.completedLessons.includes(id)).length} / {DESIGN_TECHNIQUES_LESSONS.length} пройдено, требуется все из Основ)</div>
                <div><strong>• Карьера</strong>: 1 урок + все из Основ</div>
              </div>
              <div className="mt-4 text-[13px] text-brand-green font-mono">Прогресс: основы {FOUNDATION_LESSONS.filter(id => state.completedLessons.includes(id)).length} / 9 уроков</div>
            </>
          )}

          {showPassModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-panel p-6 max-w-[320px] w-full">
                 <h3 className="text-xl font-extrabold mb-4 text-white">Cert Debug</h3>
                <form onSubmit={handlePassSubmit}>
                  <input 
                    type="password" 
                    value={passInput}
                    onChange={e => setPassInput(e.target.value)}
                    placeholder="Пароль"
                    className="glass-input w-full p-3 mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPassModal(false)} className="flex-1 glass-button py-3 text-xs">ОТМЕНА</button>
                    <button type="submit" className="flex-1 bg-brand-blue/80 text-white font-bold py-3 rounded-xl text-xs">ОК</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {debugUnlocked && isCheater && (
            <div className="text-center mb-5 p-3.5 glass-panel border-brand-red/30 bg-brand-red/10 text-[13px] text-brand-red">
              ⚠️ Режим отладки: Сертификат виден, но скачивание заблокировано (читы).
            </div>
          )}
           {!debugUnlocked && (
            <div className="text-center mb-5 p-3.5 glass-panel border-brand-green/30 bg-brand-green/10 text-[13px] text-brand-green">
              {certType === 'foundation' && '✅ Все уроки "Основы" пройдены! Введи своё имя и скачай сертификат.'}
              {certType === 'design' && '✅ Все уроки "Техники тест-дизайна" пройдены! Введи своё имя и скачай сертификат.'}
              {certType === 'career' && '✅ Все уроки "Карьера" пройдены! Введи своё имя и скачай сертификат.'}
            </div>
          )}
          
          <div className="mb-4">
            <label className="text-[12px] text-slate-300 block mb-1.5 font-mono tracking-[2px]">ТВОЁ ИМЯ</label>
            <input 
              type="text" 
              placeholder="Например: Иван Петров" 
              maxLength={40}
              value={name}
              onChange={e => {
                if (!isCheater && !debugUnlocked) {
                  setName(e.target.value);
                  updateState({ certName: e.target.value });
                }
              }}
              disabled={isCheater || debugUnlocked}
              className={`w-full glass-input p-3.5 text-white font-sans text-[15px] font-semibold ${(isCheater || debugUnlocked) ? 'bg-gray-700 cursor-not-allowed' : ''}`}
            />
          </div>
          
          <div className="mb-5">
            <label className="text-[12px] text-slate-300 block mb-1.5 font-mono tracking-[2px]">ПРЕДПРОСМОТР</label>
            <canvas ref={canvasRef} width="800" height="560" className="w-full rounded-2xl border border-white/10 block shadow-xl"></canvas>
          </div>
          
           <button 
              disabled={isCheater || debugUnlocked}
              className={`w-full font-bold py-4 rounded-xl text-[15px] transition-all backdrop-blur-md border ${(isCheater || debugUnlocked) ? 'bg-black/20 border-white/5 text-slate-500 cursor-not-allowed grayscale' : 'bg-brand-green/80 hover:bg-brand-green border-brand-green/50 text-white'}`}
              onClick={handleDownload}
            >
              {(isCheater || debugUnlocked) ? '🚫 Скачивание заблокировано (дебаг меню активировано)' : '⬇️ Скачать сертификат (PNG)'}
            </button>
        </div>
      )}
    </div>
  );
}
