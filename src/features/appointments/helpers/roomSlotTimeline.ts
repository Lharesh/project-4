import { format } from 'date-fns';
import { addMinutesToTime, normalizeSlot } from '../helpers/dateHelpers';
import { getAvailableTherapists } from '../helpers/availabilityUtils';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isBreakHour(time: string, clinicTimings: any): boolean {
  if (!clinicTimings.breakStart || !clinicTimings.breakEnd) return false;
  return time >= clinicTimings.breakStart && time < clinicTimings.breakEnd;
}

type RoomSlotStatus = 'available' | 'therapistUnavailable' | 'break' | 'notAvailable';

type RoomSlot = {
  start: string;
  end: string;
  isBreak: boolean;
  status: RoomSlotStatus;
  therapistAvailable: boolean;
  availableTherapists: any[]; // Replace 'any' with 'Therapist[]' if defined
  booking: any;
};

export function generateRoomSlots({
  room,
  date,
  appointments,
  therapists,
  clinicTimings,
  slotDuration = 60,
  enforceGenderMatch = true,
  clientGender = '',
  clients = [], // <-- add clients argument
}: {
  room: any;
  date: string;
  appointments: any[];
  therapists: any[];
  clinicTimings: any;
  slotDuration?: number;
  enforceGenderMatch?: boolean;
  clientGender?: string;
  clients?: any[];
}): import('../modal/buildScheduleMatrix').MatrixCell[] {
  // Defensive: Check if date is valid before using
  if (!date || isNaN(Date.parse(date))) {
    console.error('[generateRoomSlots] Invalid date argument:', date);
    return [];
  }

  if (typeof slotDuration !== 'number' || slotDuration <= 0) {
    console.warn('[generateRoomSlots] Invalid slotDuration:', slotDuration, 'Defaulting to 60.');
    slotDuration = 60;
  }

  const weekday = format(new Date(date), 'EEEE').toLowerCase();
  const timings = clinicTimings.weekdays?.[weekday];

  if (!timings || !timings.isOpen || !timings.start || !timings.end || timings.start === timings.end) {
    console.error('[generateRoomSlots] Invalid or closed timings for', weekday, timings);
    return [];
  }

  clinicTimings = {
    ...clinicTimings,
    start: timings.start,
    end: timings.end,
    breakStart: timings.breakStart,
    breakEnd: timings.breakEnd,
  };

  // Collect all bookings for this room/date, sorted by slot time
  const roomBookings = appointments
    .filter(a => a.roomId === room.id && a.date === date)
    .sort((a, b) => timeToMinutes(a.slot) - timeToMinutes(b.slot));

  // Find earliest booking time for this room/date
  const earliestBooking = roomBookings.length > 0 ? roomBookings[0] : null;
  let earliestBookingTime = earliestBooking ? normalizeSlot(earliestBooking.slot) : null;
  let current = normalizeSlot(clinicTimings.start);
  if (earliestBookingTime && timeToMinutes(earliestBookingTime) < timeToMinutes(current)) {
    current = earliestBookingTime;
  }
  const end = normalizeSlot(clinicTimings.end);
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentTimeStr = now.toTimeString().slice(0,5); // 'HH:mm'

  // --- Build slot grid, merging standard and booking times ---
  // 1. Collect standard slot times
  let standardTimes: string[] = [];
  let slotTime = current;
  while (timeToMinutes(slotTime) < timeToMinutes(end)) {
    standardTimes.push(slotTime);
    slotTime = addMinutesToTime(slotTime, slotDuration);
  }
  // 2. Collect all unique booking start times for this room/date
  const bookingTimes = roomBookings.map(b => normalizeSlot(b.slot));
  // 3. Merge, deduplicate, and sort all times
  const allTimes = Array.from(new Set([...standardTimes, ...bookingTimes])).sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

  // 4. Build slot grid sequentially, always advancing by previous slot's end
  let slotGrid: {start: string, end: string, booking: any, duration: number}[] = [];
  let slotStart = current;
  while (timeToMinutes(slotStart) < timeToMinutes(end)) {
    // If slotStart is in a break, skip to break end
    if (clinicTimings.breakStart && clinicTimings.breakEnd && slotStart >= clinicTimings.breakStart && slotStart < clinicTimings.breakEnd) {
      slotStart = clinicTimings.breakEnd;
      continue;
    }
    // Check if there is a booking starting at this slot
    const booking = roomBookings.find(b => normalizeSlot(b.slot) === slotStart);
    let duration = slotDuration;
    let slotEnd = '';
    let enrichedBooking = null;
    if (booking) {
      duration = booking.duration || slotDuration;
      slotEnd = addMinutesToTime(slotStart, duration);
      // Enrich booking with patient info (make a copy)
      const patientObj = clients && booking.clientId ? clients.find((p: any) => p.id === booking.clientId) : undefined;
      enrichedBooking = { ...booking };
      if (!enrichedBooking.patientId && enrichedBooking.clientId) enrichedBooking.patientId = enrichedBooking.clientId;
      if (!enrichedBooking.patientName && patientObj?.name) enrichedBooking.patientName = patientObj.name;
      if (!enrichedBooking.patientPhone && patientObj?.mobile) enrichedBooking.patientPhone = patientObj.mobile;
      // Prevent slotEnd from exceeding clinic end
      if (timeToMinutes(slotEnd) > timeToMinutes(end)) slotEnd = end;
      slotGrid.push({ start: slotStart, end: slotEnd, booking: enrichedBooking, duration });
      slotStart = slotEnd;
      continue;
    }
    // No booking at this slotStart. Find the next event (booking, break, or clinic end) within 60min
    let nextEvent = end;
    // Next booking
    for (const b of roomBookings) {
      const bStart = normalizeSlot(b.slot);
      if (timeToMinutes(bStart) > timeToMinutes(slotStart) && timeToMinutes(bStart) < timeToMinutes(addMinutesToTime(slotStart, slotDuration)) && timeToMinutes(bStart) < timeToMinutes(nextEvent)) {
        nextEvent = bStart;
      }
    }
    // Next break
    if (clinicTimings.breakStart && clinicTimings.breakEnd) {
      if (slotStart < clinicTimings.breakStart && timeToMinutes(clinicTimings.breakStart) < timeToMinutes(addMinutesToTime(slotStart, slotDuration)) && timeToMinutes(clinicTimings.breakStart) < timeToMinutes(nextEvent)) {
        nextEvent = clinicTimings.breakStart;
      }
    }
    // Next slot end is min(nextEvent, slotStart+60min, clinic end)
    let nextSlotEnd = addMinutesToTime(slotStart, slotDuration);
    if (timeToMinutes(nextEvent) < timeToMinutes(nextSlotEnd)) {
      nextSlotEnd = nextEvent;
    }
    if (timeToMinutes(nextSlotEnd) > timeToMinutes(end)) nextSlotEnd = end;
    slotGrid.push({ start: slotStart, end: nextSlotEnd, booking: null, duration: timeToMinutes(nextSlotEnd) - timeToMinutes(slotStart) });
    slotStart = nextSlotEnd;
  }
  // Use slotGrid for all further logic
  const allSlots = slotGrid;


  // 4. Build RoomSlot objects
  const slots: RoomSlot[] = [];
  let summary = [];
  for (const slot of allSlots) {
    const isBreak = isBreakHour(slot.start, clinicTimings);
    let isPast = false;
    if (date === todayStr && timeToMinutes(slot.end) <= timeToMinutes(currentTimeStr) && !slot.booking) {
      isPast = true;
    }
    // Find actual booking for this slot (if any)
    let slotBooking = slot.booking;
    if (!slotBooking) {
      slotBooking = roomBookings.find(b => normalizeSlot(b.slot) === slot.start);
    }
    // --- ENRICH slotBooking with patientId, patientName and patientPhone if missing ---
    if (slotBooking) {
      // Only add if not present
      if (!slotBooking.patientId && slotBooking.clientId) slotBooking.patientId = slotBooking.clientId;
      if (!slotBooking.patientName || !slotBooking.patientPhone) {
        // Try to find patient in clients array
        const patientObj = clients && slotBooking.clientId ? clients.find((p: any) => p.id === slotBooking.clientId) : undefined;
        if (patientObj) {
          if (!slotBooking.patientName && patientObj.name) slotBooking.patientName = patientObj.name;
          if (!slotBooking.patientPhone && patientObj.mobile) slotBooking.patientPhone = patientObj.mobile;
        }
      }
    }
    // --- Fix therapist availability: exclude therapists booked elsewhere for this slot ---
    // Find all therapistIds booked for this date in any slot that overlaps with the current slot
    const slotStartMins = timeToMinutes(slot.start);
    const slotEndMins = timeToMinutes(slot.end);
    const bookedTherapistIds = appointments
      .filter(a => a.date === date && (
        // booking overlaps if bookingStart < slotEnd && bookingEnd > slotStart
        (() => {
          const bookingStart = timeToMinutes(normalizeSlot(a.slot));
          const bookingDuration = a.duration || slotDuration;
          const bookingEnd = bookingStart + bookingDuration;
          return bookingStart < slotEndMins && bookingEnd > slotStartMins; // Strict overlap, adjacent is allowed
        })()
      ))
      .flatMap(a => Array.isArray(a.therapistIds) ? a.therapistIds : (a.therapistId ? [a.therapistId] : []));
    const availableTherapists = getAvailableTherapists(
      therapists,
      clientGender,
      date,
      slot.start,
      appointments,
      enforceGenderMatch
    ).filter(t => !bookedTherapistIds.includes(t.id));
    let status: RoomSlotStatus = 'available';
    if (isPast) {
      status = 'notAvailable';
    } else if (!slotBooking && availableTherapists.length === 0) {
      status = 'therapistUnavailable';
    }
    if (isBreak) {
      status = 'break';
    }
    slots.push({
      start: slot.start,
      end: slot.end,
      isBreak,
      status,
      therapistAvailable: availableTherapists.length > 0,
      availableTherapists,
      booking: slotBooking,
    });
    summary.push({start: slot.start, end: slot.end, status, isBreak, hasBooking: !!slotBooking});
  }
  // Log only a summary
  console.log('[generateRoomSlots] Summary for room:', room.id, 'date:', date, summary);
  // Map 'notAvailable' status to 'therapistUnavailable' for compatibility with MatrixCell
  return slots.map(slot => ({
    ...slot,
    status: slot.status === 'notAvailable' ? 'therapistUnavailable' : slot.status
  }));
}