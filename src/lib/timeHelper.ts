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
