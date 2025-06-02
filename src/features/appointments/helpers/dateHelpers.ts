export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

import { addMinutes, format, parseISO } from 'date-fns';

/**
 * Robust date formatting utility. Returns fallback if dateValue is invalid.
 */
export function safeFormatDate(dateValue: string | Date | undefined, fallback = '--', fmt = 'yyyy-MM-dd') {
  if (!dateValue) return fallback;
  let d: Date;
  if (typeof dateValue === 'string') {
    // Try parsing as ISO, fallback to Date constructor
    d = parseISO(dateValue);
    if (isNaN(d.getTime())) d = new Date(dateValue);
  } else {
    d = dateValue;
  }
  if (isNaN(d.getTime())) return fallback;
  try {
    return format(d, fmt);
  } catch {
    return fallback;
  }
}


/**
 * Generate all slot times for a given date, clinic timings, and slot duration (in minutes).
 * Skips break periods and closed days.
 */
export function getSlotsForDay(
  date: string,
  clinicTimings: any,
  slotDuration: number
): string[] {
  const weekday = format(new Date(date), 'EEEE').toLowerCase();
  const timings = clinicTimings.weekdays[weekday];
  if (!timings?.isOpen) return [];

  const slots: string[] = [];
  let current = timings.start;
  // Generate slots up to breakStart
  while (current < timings.breakStart) {
    slots.push(current);
    current = addMinutesToTime(current, slotDuration);
  }
  // Generate slots after breakEnd up to end
  current = timings.breakEnd;
  while (current < timings.end) {
    slots.push(current);
    current = addMinutesToTime(current, slotDuration);
  }
  return slots;
}

// Helper to add minutes to a time string "HH:mm"
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const date = new Date(2000, 0, 1, h, m);
  const newDate = addMinutes(date, minutes);
  return format(newDate, 'HH:mm');
}
/**
 * Normalize a slot string to 'HH:mm' format (e.g., '9:00' -> '09:00')
 */
export function normalizeSlot(slot: string): string {
  if (!slot) return '';
  // Accepts '09:00', '09:00:00', '9:0', etc. Always returns 'HH:mm'.
  const parts = slot.split(':');
  const hour = parts[0] && !isNaN(Number(parts[0])) ? parts[0].padStart(2, '0') : '00';
  const min = parts[1] && !isNaN(Number(parts[1])) ? parts[1].padStart(2, '0') : '00';
  return `${hour}:${min}`;
}
