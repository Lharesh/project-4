// Shared helpers for therapist/room/patient availability and double-booking
// Centralized types for appointment logic

// --- Slot Availability Helper ---
import { filterTherapistsByGender } from './rulesEngine';

export type EntityType = 'therapist' | 'room';

export interface ClinicTimings {
  weekdays: {
    [key: string]: {
      isOpen: boolean;
      start: string;
      end: string;
      status: 'working' | 'half_day' | 'holiday' | 'weekly_off';
      breakStart?: string;
      breakEnd?: string;
    };
  };
}

export interface GetAvailableSlotsParams {
  entityId: string;
  entityType: EntityType;
  date: string; // 'YYYY-MM-DD'
  appointments: Booking[];
  clinicTimings: ClinicTimings;
  slotDuration: number; // in minutes
}

export interface Therapist {
  id: string;
  name: string;
  gender: 'male' | 'female';
  availability: Record<string, string[]>;
}

export function getAvailableSlotsForEntity({
  entityId,
  entityType,
  date,
  appointments,
  clinicTimings,
  slotDuration,
}: GetAvailableSlotsParams): string[] {
  // 1. Determine weekday and working hours for the date
  const weekday = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  if (!clinicTimings || !clinicTimings.weekdays || !clinicTimings.weekdays[weekday]) {
    return [];
  }
  const dayTiming = clinicTimings.weekdays[weekday];

  if (!dayTiming || dayTiming.isOpen === false || dayTiming.status === 'holiday' || dayTiming.status === 'weekly_off') {
    return [];
  }

  // 2. Generate all possible slots for the day, respecting breaks (if present)
  const slots: string[] = [];
  let current = dayTiming.start;
  const end = dayTiming.end;

  function addMinutes(time: string, mins: number): string {
    const [h, m] = (time ?? '00:00').split(':').map(Number);
    const dateObj = new Date(0, 0, 0, h, m + mins);
    return dateObj.toTimeString().slice(0, 5);
  }

  const hasBreak = !!dayTiming.breakStart && !!dayTiming.breakEnd;

  while (current < end) {
    // Only skip break if both breakStart and breakEnd are defined
    if (
      hasBreak &&
      current >= dayTiming.breakStart! &&
      current < dayTiming.breakEnd!
    ) {
      current = dayTiming.breakEnd!;
      continue;
    }
    slots.push(current);
    current = addMinutes(current, slotDuration);
  }





  // 3. Filter out slots that are already booked for this entity
  const bookedSlots = appointments
    .filter(app =>
      app.date === date &&
      ((entityType === 'therapist' && Array.isArray(app.therapistIds) && app.therapistIds.includes(entityId)) ||
       (entityType === 'room' && app.roomId === entityId))
    )
    .map(app => app.slot);

  const availableSlots = slots.filter(slot => !bookedSlots.includes(slot));

  return availableSlots;
}

export type Booking = {
  id: string;
  date: string;
  slot: string;
  time?: string;
  roomId: string;
  therapistIds: string[];
  clientId: string;
};

export type Room = { id: string; availability?: { [date: string]: string[] }; };
export type Patient = { id: string; gender: string; };


/**
 * Determines if two time ranges overlap using [start, end) logic.
 * Returns true if the ranges overlap, false otherwise.
 * @param startA - Start of first range (Date)
 * @param endA - End of first range (Date)
 * @param startB - Start of second range (Date)
 * @param endB - End of second range (Date)
 */
function doTimeRangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && startB < endA;
}

/**
 * Converts a date string (YYYY-MM-DD) and a slot string (HH:mm) into a Date object.
 * @param date - Date string in YYYY-MM-DD format
 * @param slot - Time string in HH:mm format
 * @returns Date object representing the combined date and time
 */
function slotToDate(date: string, slot: string): Date {
  const [h, m] = (slot ?? '00:00').split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Checks if a proposed booking (date, slot, duration) would overlap with an existing booking.
 * Uses [start, end) logic and defaults to 60 minutes if duration is missing.
 * @param booking - Existing booking with date, slot, and optional duration (minutes)
 * @param testDate - Date string for the proposed booking
 * @param testSlot - Slot string (HH:mm) for the proposed booking
 * @param testDuration - Duration of the proposed booking in minutes
 * @returns True if the bookings overlap, false otherwise
 */
function doesBookingOverlap(
  booking: { date: string, slot: string, duration?: number, therapistIds?: string[] },
  testDate: string,
  testSlot: string,
  testDuration: number
): boolean {
  const overlapResult = (() => {
  if (booking.date !== testDate) return false;
  const durA = booking.duration ?? 60;
  const durB = testDuration;
  const startA = slotToDate(booking.date, booking.slot);
  const endA = new Date(startA.getTime() + durA * 60000);
  const startB = slotToDate(testDate, testSlot);
  const endB = new Date(startB.getTime() + durB * 60000);
  // Only return true if the time ranges strictly overlap (not if they just touch)
  // [startA, endA) and [startB, endB) overlap if startA < endB && startB < endA
  // If endA === startB or endB === startA, this returns false (adjacent slots are allowed)
  const result = (startA < endB && startB < endA);
  return result;
})();
  return overlapResult;
}

export function isTherapistAvailable(
  therapist: Therapist,
  date: string,
  slot: string,
  appointments: Booking[],
  availability?: { [therapistId: string]: { [date: string]: string[] } },
  slotDuration: number = 60
): boolean {
  // Prefer explicit availability if provided
  let staticallyAvailable = true;
  if (availability && availability[therapist.id]) {
    staticallyAvailable = !!availability[therapist.id][date] && availability[therapist.id][date].includes(slot);
  } else if (therapist.availability) {
    staticallyAvailable = !!therapist.availability[date] && therapist.availability[date].includes(slot);
  }
  // Overlap-aware booking check
  const notBooked = !appointments.some(
    (apt) =>
      Array.isArray(apt.therapistIds) && therapist?.id && apt.therapistIds.includes(therapist.id) &&
      doesBookingOverlap(apt, date, slot, slotDuration)
  );
  return staticallyAvailable && notBooked;
}

export function isRoomAvailable(
  room: Room,
  date: string,
  slot: string,
  appointments: Booking[],
  availability?: { [id: string]: { [date: string]: string[] } },
  slotDuration: number = 60
): boolean {
  let staticallyAvailable = true;
  if (availability && availability[room.id]) {
    staticallyAvailable = !!availability[room.id][date] && availability[room.id][date].includes(slot);
  } else if (room.availability) {
    staticallyAvailable = !!room.availability[date] && room.availability[date].includes(slot);
  }
  // Overlap-aware booking check
  const notBooked = !appointments.some(
    (apt) =>
      apt.roomId === room.id &&
      doesBookingOverlap(apt, date, slot, slotDuration)
  );
  return staticallyAvailable && notBooked;
}

/**
 * Checks if a patient is available for a given slot, using overlap-aware logic.
 * Prevents double-booking the same patient in overlapping slots.
 * @param patientId - ID of the patient
 * @param date - Date string (YYYY-MM-DD)
 * @param slot - Slot string (HH:mm)
 * @param appointments - All appointments
 * @param slotDuration - Duration of the proposed slot (minutes, default 60)
 */
/**
 * Checks if a patient is available for a given slot, using overlap-aware logic.
 * Prevents double-booking the same patient in overlapping slots.
 * Uses doesBookingOverlap for accurate overlap detection.
 * @param clientId - ID of the patient
 * @param date - Date string (YYYY-MM-DD)
 * @param slot - Slot string (HH:mm)
 * @param appointments - All appointments
 * @param slotDuration - Duration of the proposed slot (minutes, default 60)
 * @returns true if available, false if overlapping
 */
export function isPatientAvailable(
  clientId: string,
  date: string,
  slot: string,
  appointments: Booking[],
  slotDuration: number = 60
): boolean {
  
  const result = !appointments.some((apt) => {
    const isSamePatient = apt.clientId === clientId;
    const isSameDate = apt.date === date;
    const overlap = doesBookingOverlap(apt, date, slot, slotDuration);
    return isSamePatient && isSameDate && overlap;
  });
  return result;
}

export function getAvailableTherapists(
  allTherapists: Therapist[],
  patientGender: string,
  date: string,
  slot: string,
  appointments: Booking[],
  enforceGenderMatch: boolean,
  availability?: { [therapistId: string]: { [date: string]: string[] } }
): Therapist[] {
  const genderMatchedTherapists = filterTherapistsByGender(allTherapists, patientGender, enforceGenderMatch);
  const availableTherapists = genderMatchedTherapists.filter(
    (t) =>
      t &&
      isTherapistAvailable(t, date, slot, appointments, availability)
  );
  return availableTherapists;
}

export function getAvailableRooms(
  allRooms: Room[],
  date: string,
  slot: string,
  appointments: Booking[],
  availability?: { [id: string]: { [date: string]: string[] } }
): Room[] {
  return allRooms.filter((room) => isRoomAvailable(room, date, slot, appointments, availability));
}
