import { LEVEL_NAMES } from './data/messages';

export function getLevelInfo(xp: number) {
  const levels = [0, 50, 120, 220, 350, 500, 700, 1000];
  let level = 1;
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i]) level = i + 1;
  }
  const name = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  const curr = levels[Math.min(level - 1, levels.length - 1)];
  const next = levels[Math.min(level, levels.length - 1)];
  const pct = next === curr ? 100 : Math.round(((xp - curr) / (next - curr)) * 100);
  return { level, name, curr, next, pct, xpInLevel: xp - curr, xpToNext: next - curr };
}

export function getBackgroundGradient(screen: string): string {
  const gradients: Record<string, string> = {
    splash:
      'radial-gradient(circle at 18% 20%, rgba(124, 58, 237, 0.42), transparent 38%), radial-gradient(circle at 82% 24%, rgba(8, 145, 178, 0.34), transparent 40%), radial-gradient(circle at 50% 84%, rgba(30, 64, 175, 0.28), transparent 46%), radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.35), transparent 65%)',
    home: 'radial-gradient(circle at 15% 50%, rgba(21, 128, 61, 0.36), transparent 44%), radial-gradient(circle at 85% 30%, rgba(14, 116, 144, 0.32), transparent 42%), radial-gradient(circle at 52% 84%, rgba(59, 130, 246, 0.22), transparent 48%), radial-gradient(circle at 50% 18%, rgba(56, 189, 248, 0.12), transparent 34%)',
    lesson:
      'radial-gradient(circle at 18% 22%, rgba(251, 191, 36, 0.28), transparent 36%), radial-gradient(circle at 86% 28%, rgba(234, 88, 12, 0.32), transparent 40%), radial-gradient(circle at 50% 82%, rgba(14, 165, 233, 0.18), transparent 48%), radial-gradient(circle at 48% 16%, rgba(217, 119, 6, 0.14), transparent 30%)',
    practice:
      'radial-gradient(circle at 14% 52%, rgba(6, 95, 70, 0.36), transparent 42%), radial-gradient(circle at 84% 26%, rgba(79, 70, 229, 0.3), transparent 40%), radial-gradient(circle at 50% 84%, rgba(16, 185, 129, 0.2), transparent 48%), radial-gradient(circle at 52% 18%, rgba(45, 212, 191, 0.12), transparent 34%)',
    'practice-task':
      'radial-gradient(circle at 18% 18%, rgba(15, 118, 110, 0.36), transparent 40%), radial-gradient(circle at 82% 24%, rgba(168, 85, 247, 0.3), transparent 40%), radial-gradient(circle at 50% 84%, rgba(34, 197, 94, 0.18), transparent 50%), radial-gradient(circle at 48% 14%, rgba(14, 165, 233, 0.12), transparent 30%)',
    exam: 'radial-gradient(circle at 16% 18%, rgba(220, 38, 38, 0.32), transparent 38%), radial-gradient(circle at 82% 24%, rgba(126, 34, 206, 0.28), transparent 38%), radial-gradient(circle at 50% 84%, rgba(30, 64, 175, 0.18), transparent 50%), radial-gradient(circle at 50% 16%, rgba(239, 68, 68, 0.12), transparent 28%)',
    daily:
      'radial-gradient(circle at 15% 24%, rgba(245, 158, 11, 0.32), transparent 38%), radial-gradient(circle at 84% 30%, rgba(22, 163, 74, 0.28), transparent 40%), radial-gradient(circle at 50% 84%, rgba(14, 165, 233, 0.18), transparent 48%), radial-gradient(circle at 46% 16%, rgba(250, 204, 21, 0.12), transparent 30%)',
    stats:
      'radial-gradient(circle at 15% 22%, rgba(37, 99, 235, 0.32), transparent 38%), radial-gradient(circle at 84% 26%, rgba(8, 145, 178, 0.28), transparent 40%), radial-gradient(circle at 50% 84%, rgba(34, 197, 94, 0.14), transparent 52%), radial-gradient(circle at 50% 16%, rgba(96, 165, 250, 0.12), transparent 30%)',
    achievements:
      'radial-gradient(circle at 16% 18%, rgba(217, 119, 6, 0.34), transparent 38%), radial-gradient(circle at 84% 24%, rgba(217, 70, 239, 0.26), transparent 38%), radial-gradient(circle at 50% 84%, rgba(234, 179, 8, 0.18), transparent 50%), radial-gradient(circle at 50% 16%, rgba(251, 191, 36, 0.12), transparent 28%)',
    certificate:
      'radial-gradient(circle at 18% 20%, rgba(190, 24, 93, 0.3), transparent 38%), radial-gradient(circle at 84% 22%, rgba(124, 58, 237, 0.28), transparent 38%), radial-gradient(circle at 50% 84%, rgba(14, 165, 233, 0.16), transparent 52%), radial-gradient(circle at 50% 14%, rgba(244, 114, 182, 0.1), transparent 28%)',
  };

  return gradients[screen] ?? gradients.home;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function plural(n: number, a: string, b: string, c: string) {
  const m = n % 100,
    m10 = n % 10;
  if (m >= 11 && m <= 19) return c;
  if (m10 === 1) return a;
  if (m10 >= 2 && m10 <= 4) return b;
  return c;
}
