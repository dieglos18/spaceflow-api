/**
 * Two time ranges overlap iff start1 < end2 && end1 > start2.
 * Times compared as strings "HH:mm" or "HH:mm:ss" (lexicographic order works for same format).
 */
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string,
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Returns ISO week bounds (Monday 00:00:00 to next Monday 00:00:00) for the given date.
 * Uses local time.
 */
export function getWeekBounds(date: Date): { weekStart: Date; weekEnd: Date } {
  const d = new Date(date);
  const day = d.getDay();
  // Monday = 1, Sunday = 0; offset so Monday is start (day 1 -> 0, day 0 -> -6)
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  const weekStart = new Date(d);
  const weekEnd = new Date(d);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return { weekStart, weekEnd };
}

/**
 * Parses YYYY-MM-DD string to start-of-day Date (local time).
 */
export function parseDateToStartOfDay(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d, 0, 0, 0, 0);
  return date;
}

/**
 * Start and end of the same calendar day (local) for Prisma range queries.
 * endOfDay is start of next day (exclusive upper bound).
 */
export function getDayBounds(dateStr: string): { startOfDay: Date; endOfDayExclusive: Date } {
  const startOfDay = parseDateToStartOfDay(dateStr);
  const endOfDayExclusive = new Date(startOfDay);
  endOfDayExclusive.setDate(endOfDayExclusive.getDate() + 1);
  return { startOfDay, endOfDayExclusive };
}
