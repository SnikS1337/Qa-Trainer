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
        <div className="font-mono text-[11px] text-brand-green tracking-[4px] mb-2 uppercase">v2.0 — React</div>
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

const BASE_LESSONS = ['pyramid','equiv','boundary','decision','testcase','states','types','checklist'];

export function Certificate() {
  const { state, updateState, navigate, showToast } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState(state.certName || '');
  const [debugUnlocked, setDebugUnlocked] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [holdTimer, setHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const done = BASE_LESSONS.filter(id => state.completedLessons.includes(id));
  const allDone = done.length >= BASE_LESSONS.length;
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
    if (((allDone && !isCheater) || debugUnlocked) && canvasRef.current) {
      drawCertificate(name || 'Твоё имя');
    }
  }, [name, allDone, isCheater, debugUnlocked]);

  const drawCertificate = (certName: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const W = 800, H = 560;
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#060a12'); bgGrad.addColorStop(0.5, '#0c1628'); bgGrad.addColorStop(1, '#060a12');
    ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

    // Grid pattern
    ctx.strokeStyle = 'rgba(28,40,64,0.8)'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // Corner brackets
    [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([cx,cy,dx,dy]) => {
      ctx.strokeStyle='#22d3a060'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx+dx*22,cy); ctx.lineTo(cx,cy); ctx.lineTo(cx,cy+dy*22); ctx.stroke();
      ctx.strokeStyle='#22d3a030'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx+dx*50,cy); ctx.lineTo(cx+dx*30,cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy+dy*50); ctx.lineTo(cx,cy+dy*30); ctx.stroke();
    });

    // Borders
    ctx.strokeStyle='#22d3a025'; ctx.lineWidth=1.5; ctx.strokeRect(20,20,W-40,H-40);
    ctx.strokeStyle='#22d3a012'; ctx.lineWidth=1; ctx.strokeRect(28,28,W-56,H-56);

    // Glow lines top/bottom
    const makeHGrad = () => { const g=ctx.createLinearGradient(0,0,W,0); g.addColorStop(0,'transparent'); g.addColorStop(0.3,'#22d3a080'); g.addColorStop(0.7,'#22d3a080'); g.addColorStop(1,'transparent'); return g; };
    ctx.strokeStyle=makeHGrad(); ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(60,78); ctx.lineTo(W-60,78); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(60,H-78); ctx.lineTo(W-60,H-78); ctx.stroke();

    // Side accent dots
    for (let i=0; i<6; i++) {
      ctx.fillStyle='rgba(34,211,160,'+(0.1+i*0.05)+')';
      ctx.beginPath(); ctx.arc(42,150+i*38,2.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(W-42,150+i*38,2.5,0,Math.PI*2); ctx.fill();
    }

    // Emoji icon with glow
    ctx.save();
    ctx.shadowColor='#22d3a060'; ctx.shadowBlur=20;
    ctx.font='48px serif'; ctx.textAlign='center'; ctx.fillText('🧪',W/2,132);
    ctx.restore();

    // QA TRAINER label
    ctx.font='bold 10px monospace'; ctx.fillStyle='#22d3a0'; ctx.textAlign='center';
    ctx.fillText('Q A   T R A I N E R',W/2,158);

    // Separator dot line
    ctx.fillStyle='#22d3a030';
    for (let i=-3; i<=3; i++) { ctx.beginPath(); ctx.arc(W/2+i*16,170,1.5,0,Math.PI*2); ctx.fill(); }

    // "СЕРТИФИКАТ" heading
    ctx.font='bold 13px monospace'; ctx.fillStyle='#2a3a5c';
    ctx.fillText('С Е Р Т И Ф И К А Т   О Б   О К О Н Ч А Н И И',W/2,205);

    // Name
    const fs = certName.length > 22 ? 34 : certName.length > 16 ? 40 : 48;
    ctx.font='bold '+fs+'px Georgia,serif';
    const ng=ctx.createLinearGradient(W/2-220,0,W/2+220,0);
    ng.addColorStop(0,'#22d3a0'); ng.addColorStop(0.5,'#a8f0dc'); ng.addColorStop(1,'#22d3a0');
    ctx.fillStyle=ng; ctx.fillText(certName,W/2,266);

    // Name underline
    const nw=Math.min(ctx.measureText(certName).width+60,520);
    const ug=ctx.createLinearGradient(W/2-nw/2,0,W/2+nw/2,0);
    ug.addColorStop(0,'transparent'); ug.addColorStop(0.5,'#22d3a050'); ug.addColorStop(1,'transparent');
    ctx.strokeStyle=ug; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(W/2-nw/2,278); ctx.lineTo(W/2+nw/2,278); ctx.stroke();

    // Description
    ctx.font='15px Georgia,serif'; ctx.fillStyle='#6b7a9a';
    ctx.fillText('успешно завершил(а) базовый курс ручного тестирования',W/2,310);

    // Skill chips
    const skills=['Тест-дизайн','Пирамида тестов','Граничные значения','Баг-репорты','Agile QA'];
    const cw=126, ch=26, tot=skills.length*cw+(skills.length-1)*8, sx=W/2-tot/2;
    skills.forEach((sk,i)=>{
      const x=sx+i*(cw+8), y=328;
      ctx.fillStyle='rgba(34,211,160,0.07)'; 
      ctx.beginPath(); ctx.roundRect(x,y,cw,ch,5); ctx.fill();
      ctx.strokeStyle='rgba(34,211,160,0.22)'; ctx.lineWidth=1; 
      ctx.beginPath(); ctx.roundRect(x,y,cw,ch,5); ctx.stroke();
      ctx.font='10px monospace'; ctx.fillStyle='#22d3a0'; ctx.fillText(sk,x+cw/2,y+17);
    });

    // Stats row
    const lvl=getLevelInfo(state.totalXP);
    [
      {l:'Уровень', v:lvl.name},
      {l:'Набрано XP', v:state.totalXP+' XP'},
      {l:'Достижений', v:state.unlockedAchievements.length.toString()},
      {l:'Уроков', v:state.completedLessons.length+'/'+LESSONS.length},
    ].forEach((s,i,arr)=>{
      const x=60+(W-120)/arr.length*i+(W-120)/arr.length/2;
      ctx.font='bold 15px monospace'; ctx.fillStyle='#c8d8f0'; ctx.fillText(s.v,x,402);
      ctx.font='9px monospace'; ctx.fillStyle='#2a3a5c'; ctx.fillText(s.l.toUpperCase(),x,416);
    });

    // Bottom rule
    ctx.fillStyle='#1c2840'; ctx.fillRect(60,432,W-120,1);

    // Date & ID
    const ds=new Date().toLocaleDateString('ru-RU',{year:'numeric',month:'long',day:'numeric'});
    const certId='QA-'+Math.abs(certName.split('').reduce((a,c)=>a*31+c.charCodeAt(0),0)%99999).toString().padStart(5,'0');
    ctx.font='10px monospace'; ctx.fillStyle='#2a3a5c';
    ctx.textAlign='left'; ctx.fillText('Дата: '+ds,60,452);
    ctx.textAlign='right'; ctx.fillText('ID: '+certId,W-60,452);
    ctx.textAlign='center'; ctx.fillStyle='#161e30'; ctx.font='10px monospace';
    ctx.fillText('qa-trainer  •  Школа ручного тестирования  •  Ручное тестирование ПО',W/2,485);
    
    // Watermark for debug mode
    if (debugUnlocked && isCheater) {
      ctx.save();
      ctx.translate(W/2, H/2);
      ctx.rotate(-Math.PI/6); // Rotate the watermark
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; // Semi-transparent red
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NOT VALID', 0, 0);
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

      {!(allDone || debugUnlocked) ? (
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
              <div className="text-[13px] text-slate-300 leading-relaxed">Пройди все базовые уроки (первые 8), чтобы получить сертификат</div>
              <div className="mt-4 text-[13px] text-brand-green font-mono">Прогресс: {done.length} / {BASE_LESSONS.length} уроков</div>
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
              ✅ Все базовые уроки пройдены! Введи своё имя и скачай сертификат.
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
