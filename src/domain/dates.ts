export function getLocalDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return null;
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function shiftDateKey(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);
  if (!date) {
    return null;
  }

  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

export function getPreviousDateKey(dateKey: string) {
  return shiftDateKey(dateKey, -1);
}

export function normalizeStoredDateKey(value: string) {
  if (!value) {
    return '';
  }

  const normalized = parseDateKey(value);
  if (normalized) {
    return getLocalDateKey(normalized);
  }

  const legacyDate = new Date(value);
  if (Number.isNaN(legacyDate.getTime())) {
    return '';
  }

  return getLocalDateKey(legacyDate);
}

export function getLocalWeekKey(date: Date = new Date()) {
  const local = new Date(date.getTime());
  local.setHours(0, 0, 0, 0);

  const day = local.getDay() || 7;
  local.setDate(local.getDate() + 4 - day);

  const yearStart = new Date(local.getFullYear(), 0, 1);
  const diffDays = Math.floor((local.getTime() - yearStart.getTime()) / 86400000);
  const week = Math.ceil((diffDays + 1) / 7);

  return `${local.getFullYear()}-W${String(week).padStart(2, '0')}`;
}
