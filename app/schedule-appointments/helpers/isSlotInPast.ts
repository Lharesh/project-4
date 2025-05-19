// Utility to check if a date+time slot is in the past
export function isSlotInPast(dateStr: string, timeStr: string, now: Date): boolean {
  if (!dateStr || !timeStr) return false;
  const [slotHour, slotMinute] = timeStr.split(':').map(Number);
  const slotDateTime = new Date(dateStr);
  slotDateTime.setHours(slotHour, slotMinute, 0, 0);
  return slotDateTime <= now;
}
