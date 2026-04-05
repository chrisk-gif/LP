import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
} from "date-fns";
import { nb } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "./constants";

export const TIMEZONE = DEFAULT_TIMEZONE;
const LOCALE = nb;

export function now(): Date {
  return toZonedTime(new Date(), TIMEZONE);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d. MMMM yyyy", { locale: LOCALE });
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d. MMM", { locale: LOCALE });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "HH:mm", { locale: LOCALE });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "d. MMM HH:mm", { locale: LOCALE });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (isToday(d)) return "I dag";
  if (isTomorrow(d)) return "I morgen";
  if (isYesterday(d)) return "I går";
  return formatDistanceToNow(d, { locale: LOCALE, addSuffix: true });
}

export function daysUntil(date: string | Date): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return differenceInDays(startOfDay(d), startOfDay(now()));
}

export function isOverdue(date: string | Date): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return isPast(endOfDay(d));
}

export function isDueSoon(date: string | Date, daysThreshold = 3): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  const days = daysUntil(d);
  return days >= 0 && days <= daysThreshold;
}

// Norwegian relative date parsing
const NB_DATE_PATTERNS: Record<string, () => Date> = {
  "i dag": () => now(),
  "i morgen": () => addDays(now(), 1),
  "i overmorgen": () => addDays(now(), 2),
  "neste uke": () => addWeeks(now(), 1),
  "neste måned": () => addMonths(now(), 1),
};

const NB_WEEKDAYS: Record<string, number> = {
  mandag: 1,
  tirsdag: 2,
  onsdag: 3,
  torsdag: 4,
  fredag: 5,
  lørdag: 6,
  søndag: 0,
};

export function parseNorwegianDate(text: string): Date | null {
  const lower = text.toLowerCase().trim();

  // Check direct patterns
  for (const [pattern, fn] of Object.entries(NB_DATE_PATTERNS)) {
    if (lower.includes(pattern)) return startOfDay(fn());
  }

  // Check "på [weekday]" or just weekday
  for (const [day, dayNum] of Object.entries(NB_WEEKDAYS)) {
    if (lower.includes(day)) {
      const today = now();
      const currentDay = today.getDay();
      let diff = dayNum - currentDay;
      if (diff <= 0) diff += 7;
      return startOfDay(addDays(today, diff));
    }
  }

  // Check "den [number]." pattern for day of month
  const dayMatch = lower.match(/den (\d{1,2})\.?/);
  if (dayMatch) {
    const dayOfMonth = parseInt(dayMatch[1], 10);
    const today = now();
    let target = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (target <= today) {
      target = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
    }
    return startOfDay(target);
  }

  return null;
}

export function parseNorwegianTime(text: string): string | null {
  const lower = text.toLowerCase().trim();

  // "klokken 14", "kl 14:30", "kl. 09:00"
  const timeMatch = lower.match(/(?:klokken|kl\.?)\s*(\d{1,2})(?::(\d{2}))?/);
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, "0");
    const minutes = timeMatch[2] ?? "00";
    return `${hours}:${minutes}`;
  }

  // Bare time like "14:30"
  const bareTime = lower.match(/(\d{1,2}):(\d{2})/);
  if (bareTime) {
    return `${bareTime[1].padStart(2, "0")}:${bareTime[2]}`;
  }

  return null;
}

export {
  isToday,
  isTomorrow,
  isPast,
  isFuture,
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parseISO,
};
