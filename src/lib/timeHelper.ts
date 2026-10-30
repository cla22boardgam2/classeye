import { PeriodScheduleItem } from '@/types';
import { DEFAULT_PERIOD_SCHEDULE } from './constants';

/**
 * Convert "HH:mm" string to minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Determine the current period based on system time and custom schedule
 */
export function getCurrentPeriodFromSchedule(
  schedule: PeriodScheduleItem[] = DEFAULT_PERIOD_SCHEDULE,
  date: Date = new Date()
): string {
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  for (const item of schedule) {
    const start = timeStringToMinutes(item.startTime);
    const end = timeStringToMinutes(item.endTime);

    if (currentMinutes >= start && currentMinutes <= end) {
      return item.periodName;
    }
  }

  // If before the first period
  if (schedule.length > 0 && currentMinutes < timeStringToMinutes(schedule[0].startTime)) {
    return '등교 전 / 아침';
  }

  // If after the last period
  return '방과후';
}

/**
 * Extract period from user's natural language text if explicitly mentioned
 * e.g., "3번 김철수 2교시에 복도에서 뜀" -> returns "2교시"
 */
export function extractPeriodFromText(text: string): string | null {
  // Check for common patterns: 1교시, 2교시, ..., 점심시간, 쉬는시간, 아침자습, 방과후
  const periodRegex = /([1-6]\s*교시|점심\s*시간|쉬는\s*시간|중간\s*놀이|아침\s*자습|방과\s*후)/i;
  const match = text.match(periodRegex);
  if (match) {
    return match[1].replace(/\s+/g, '');
  }
  return null;
}

/**
 * Format timestamp to readable Korean format (e.g. "2026. 10. 30. (금) 10:15")
 */
export function formatKoreanDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const day = days[date.getDay()];
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${y}.${m}.${d}. (${day}) ${hh}:${mm}`;
  } catch {
    return isoString;
  }
}

/**
 * Format timestamp to short time (e.g. "10:15")
 */
export function formatShortTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
}

/**
 * Get YYYY-MM-DD in local time
 */
export function getKoreanDateString(isoStringOrDate: string | Date = new Date()): string {
  try {
    const d = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Format timestamp to Korean Date Only (e.g. "2026년 10월 30일 (금)")
 */
export function formatKoreanOnlyDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const day = days[date.getDay()];
    return `${y}년 ${m}월 ${d}일 (${day})`;
  } catch {
    return isoString.split('T')[0] || isoString;
  }
}

/**
 * Get Yesterday YYYY-MM-DD string
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getKoreanDateString(d);
}

/**
 * Extract date mentions from natural text (e.g., "어제", "그제", "10월 28일", "10/28")
 */
export function extractDateFromText(text: string): { dateStr: string | null; cleanText: string } {
  const today = new Date();

  // Pattern 1: "어제"
  if (text.includes('어제')) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return {
      dateStr: getKoreanDateString(yesterday),
      cleanText: text.replace(/어제\s*/g, '').trim(),
    };
  }

  // Pattern 2: "그저께" or "그제"
  if (text.includes('그저께') || text.includes('그제')) {
    const beforeYesterday = new Date(today);
    beforeYesterday.setDate(today.getDate() - 2);
    return {
      dateStr: getKoreanDateString(beforeYesterday),
      cleanText: text.replace(/(그저께|그제)\s*/g, '').trim(),
    };
  }

  // Pattern 3: "M월 D일" e.g., "10월 28일", "3월 5일"
  const mdMatch = text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (mdMatch) {
    const month = parseInt(mdMatch[1], 10);
    const day = parseInt(mdMatch[2], 10);
    const year = today.getFullYear();
    const parsedDate = new Date(year, month - 1, day);
    const mStr = String(month).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return {
      dateStr: `${year}-${mStr}-${dStr}`,
      cleanText: text.replace(mdMatch[0], '').trim(),
    };
  }

  return { dateStr: null, cleanText: text };
}

/**
 * Filter records by selected date criteria
 */
export function filterRecordsByDateRange<T extends { timestamp: string }>(
  records: T[],
  filterType: 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom_day' | 'custom_range',
  customDay?: string,
  customStart?: string,
  customEnd?: string
): T[] {
  if (filterType === 'all') return records;

  const todayStr = getKoreanDateString(new Date());
  const yesterdayStr = getYesterdayDateString();

  if (filterType === 'today') {
    return records.filter((r) => getKoreanDateString(r.timestamp) === todayStr);
  }

  if (filterType === 'yesterday') {
    return records.filter((r) => getKoreanDateString(r.timestamp) === yesterdayStr);
  }

  if (filterType === 'this_week') {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Monday = 1, Sunday = 7
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const monStr = getKoreanDateString(monday);
    const sunStr = getKoreanDateString(sunday);

    return records.filter((r) => {
      const dStr = getKoreanDateString(r.timestamp);
      return dStr >= monStr && dStr <= sunStr;
    });
  }

  if (filterType === 'this_month') {
    const currentMonthPrefix = todayStr.substring(0, 7); // "YYYY-MM"
    return records.filter((r) => getKoreanDateString(r.timestamp).startsWith(currentMonthPrefix));
  }

  if (filterType === 'custom_day' && customDay) {
    return records.filter((r) => getKoreanDateString(r.timestamp) === customDay);
  }

  if (filterType === 'custom_range') {
    const start = customStart || '1970-01-01';
    const end = customEnd || '2099-12-31';
    return records.filter((r) => {
      const dStr = getKoreanDateString(r.timestamp);
      return dStr >= start && dStr <= end;
    });
  }

  return records;
}

