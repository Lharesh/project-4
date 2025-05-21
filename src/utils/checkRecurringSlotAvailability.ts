import { buildScheduleMatrix } from "@/features/appointments/modal/buildScheduleMatrix";
import { addDays, format } from "date-fns";

/**
 * Checks if a specific room and slot are available for every day in a recurring period.
 * @param startDate - The start date (YYYY-MM-DD format)
 * @param days - Number of days to check (e.g., 21)
 * @param roomId - The room ID to check
 * @param slotTime - The slot time to check (e.g., '10:00 AM')
 * @param skipNonWorkingDays - Optional: skip weekends (Saturday/Sunday)
 * @returns Array of { date, available, reason }
 */
export function checkRecurringSlotAvailability({
  startDate,
  days,
  roomId,
  roomNumber,
  slotTime,
  skipNonWorkingDays = false,
  clientId,
  appointments = [],
}: {
  startDate: string;
  days: number;
  roomId?: string;
  roomNumber?: string;
  slotTime: string;
  skipNonWorkingDays?: boolean;
  clientId?: string;
  appointments?: any[];
}): { date: string; available: boolean; reason?: string }[] {
  // Prefer roomId, but allow roomNumber for compatibility
  const effectiveRoomId = roomId ?? roomNumber;
  // Debug log for input parameters
  console.log('[checkRecurringSlotAvailability] called with:', { startDate, days, roomId, slotTime, skipNonWorkingDays });
  // Defensive: Check if startDate is valid
  if (!startDate || isNaN(new Date(startDate).getTime())) {
    console.error('[checkRecurringSlotAvailability] Invalid or missing startDate:', startDate);
    return [];
  }
  const results: { date: string; available: boolean; reason?: string }[] = [];
  let checked = 0;
  let i = 0;
  while (checked < days) {
    const dateObj = addDays(new Date(startDate), i);
    const date = format(dateObj, "yyyy-MM-dd");
    const day = dateObj.getDay();
    if (skipNonWorkingDays && (day === 0 || day === 6)) {
      i++;
      continue;
    }
    const matrix = buildScheduleMatrix(date, []);
    const room = matrix.find((r: { roomNumber: string }) => r.roomNumber === effectiveRoomId);
    if (!room) {
      results.push({ date, available: false, reason: "Room not found" });
      checked++;
      i++;
      continue;
    }
    const slot = room.slots.find((s: { slot: string }) => s.slot === slotTime);
    if (!slot) {
      results.push({ date, available: false, reason: "Slot not found" });
      checked++;
      i++;
      continue;
    }
    // Patient double booking detection
    if (clientId && appointments.some(a => a.date === date && (a.slot === slotTime || a.time === slotTime) && a.clientId === clientId)) {
      results.push({ date, available: false, reason: "Patient already scheduled" });
    } else if (!slot.isRoomAvailable) {
      results.push({ date, available: false, reason: "N/A" });
    } else if (slot.isBooked) {
      results.push({ date, available: false, reason: "Booked" });
    } else {
      results.push({ date, available: true });
    }
    checked++;
    i++;
  }
  return results;
}

/**
 * Example usage:
 *
 * const results = checkRecurringSlotAvailability({
 *   startDate: '2025-05-17',
 *   days: 21,
 *   roomId: 'r1',
 *   slotTime: '10:00 AM',
 *   skipNonWorkingDays: true,
 * });
 *
 * // results: Array of { date, available, reason }
 */
