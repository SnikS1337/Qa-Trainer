import type { RefObject } from 'react';
import type { Quote } from '../../types';

type HomeQuoteDockProps = {
  quote: Quote;
  isQuoteCollapsed: boolean;
  isQuoteExpandedRendered: boolean;
  quoteExpandedHeight: number;
  quoteExpandedRef: RefObject<HTMLDivElement | null>;
  onHideForToday: () => void;
  onShowAgain: () => void;
};

export default function HomeQuoteDock({
  quote,
  isQuoteCollapsed,
  isQuoteExpandedRendered,
  quoteExpandedHeight,
  quoteExpandedRef,
  onHideForToday,
  onShowAgain,
}: HomeQuoteDockProps) {
  return (
    <div className="relative mb-6">
      <div
        className={`quote-dock ${isQuoteCollapsed ? 'quote-dock--collapsed' : ''}`}
        style={{
          ['--quote-expanded-height' as string]: `${Math.max(quoteExpandedHeight, 92)}px`,
        }}
      >
        {isQuoteExpandedRendered && (
          <div
            ref={quoteExpandedRef}
            className={`quote-dock__expanded ${isQuoteCollapsed ? 'quote-dock__expanded--hidden' : ''}`}
          >
            <div className="home-surface-card home-surface-card--quote border-brand-green/30 bg-brand-green/5 relative flex items-start gap-3 p-4 pr-14">
              <button
                type="button"
                className="quote-toggle-button"
                onClick={onHideForToday}
                aria-label="Скрыть цитату дня"
              >
                ×
              </button>
              <span className="relative z-[1] mt-0.5 shrink-0 text-xl">💬</span>
              <div className="relative z-[1]">
                <div className="text-brand-green mb-1 font-mono text-[11px] font-bold tracking-[2px]">
                  ЦИТАТА ДНЯ
                </div>
                <div className="text-[13px] leading-relaxed text-white italic">"{quote.text}"</div>
                <div className="mt-1 text-[11px] text-slate-300">
                  — {quote.author}, "{quote.book}"
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className={`quote-dock__collapsed ${isQuoteCollapsed ? 'quote-dock__collapsed--visible' : ''}`}
          onClick={onShowAgain}
          aria-label="Показать цитату дня"
        >
          <span className="quote-dock__collapsed-icon">💬</span>
          <div className="quote-dock__collapsed-copy">
            <div className="quote-dock__collapsed-title">Цитата дня скрыта</div>
            <div className="quote-dock__collapsed-subtitle">Можно показать снова</div>
          </div>
          <span className="quote-dock__collapsed-action">Показать</span>
        </button>
      </div>
    </div>
  );
}
