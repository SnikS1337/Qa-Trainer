import { useMemo } from 'react';
import { QUOTES } from '../data/quotes';
import { useAppStore } from '../store';

export default function Splash() {
  const { navigate } = useAppStore();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel w-full max-w-[380px] p-8">
        <div className="mb-4 animate-bounce text-[64px]">🧪</div>
        <h1 className="mb-3 text-4xl leading-[1.1] font-extrabold text-white">
          QA
          <br />
          <span className="text-brand-green">Trainer</span>
        </h1>
        <p className="mb-2 text-[15px] leading-relaxed text-slate-300">
          Стань профессиональным тестировщиком. Учись играя, как в Duolingo.
        </p>

        <div className="bg-brand-green/10 border-brand-green my-6 rounded-r-xl border-l-[3px] p-4 text-left text-[13px] leading-relaxed text-white italic">
          "{quote.text}"
          <span className="mt-1 block text-[11px] text-slate-300 not-italic">
            — {quote.author}, "{quote.book}"
          </span>
        </div>

        <button
          className="bg-brand-green/80 hover:bg-brand-green border-brand-green/50 w-full rounded-xl border py-4 text-base font-bold text-white backdrop-blur-md transition-colors"
          onClick={() => navigate('home')}
        >
          Начать обучение →
        </button>
        <p className="mt-3 text-[12px] text-slate-400">Прогресс сохраняется автоматически</p>
      </div>
    </div>
  );
}
