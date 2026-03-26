import { LEVEL_NAMES } from './data';

export function getLevelInfo(xp: number) {
  const levels = [0,50,120,220,350,500,700,1000];
  let level = 1;
  for (let i = 0; i < levels.length; i++) { if (xp >= levels[i]) level = i+1; }
  const name = LEVEL_NAMES[Math.min(level-1, LEVEL_NAMES.length-1)];
  const curr = levels[Math.min(level-1, levels.length-1)];
  const next = levels[Math.min(level, levels.length-1)];
  const pct = next === curr ? 100 : Math.round(((xp - curr)/(next - curr))*100);
  return { level, name, curr, next, pct, xpInLevel: xp-curr, xpToNext: next-curr };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle options and track correct answer index
export function shuffleOptions(opts: string[], correctIndex: number): { shuffledOpts: string[], newCorrectIndex: number } {
  const indexed = opts.map((opt, idx) => ({ opt, idx }));
  const shuffled = shuffle(indexed);
  const newCorrectIndex = shuffled.findIndex(item => item.idx === correctIndex);
  return {
    shuffledOpts: shuffled.map(item => item.opt),
    newCorrectIndex
  };
}

export function plural(n: number, a: string, b: string, c: string) {
  const m = n % 100, m10 = n % 10;
  if (m >= 11 && m <= 19) return c;
  if (m10 === 1) return a;
  if (m10 >= 2 && m10 <= 4) return b;
  return c;
}
