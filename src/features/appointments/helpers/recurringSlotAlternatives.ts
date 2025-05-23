import { CLINIC_TIMINGS, ROOMS, THERAPISTS } from '../mock/scheduleMatrixMock';
import { canBookAppointment } from './rulesEngine';
import { isSlotInPast } from './isSlotInPast';
import { addDays } from './dateHelpers';

// Returns for each date: { alternatives: [{slot, roomNumber}], reason: string, available: boolean }
/**
 * Returns available therapists and time slots for a given patient, slot, and appointment schedule.
 * @param params - See parameter details below.
 * @returns { therapists: string[], slots: string[] }
 */
/**
 * Returns available therapists and time slots for a given patient, slot, and appointment schedule.
 * If selectedTherapists is not provided, checks all therapists of patient gender.
 * @param params - See parameter details below.
 * @returns { therapists: string[], slots: string[] }
 */
export function checkTherapistsAvailability({
  selectedTherapists,
  requestedSlot,
  dateVal,
  appointments,
  patientGender,
  allTherapists
}: {
  selectedTherapists?: string[];
  requestedSlot: string;
  dateVal: string;
  appointments: any[];
  patientGender: string;
  allTherapists: any[];
}): { therapists: string[]; slots: string[] } {
  // Helper: checks if therapist is booked at this date/slot
  const isTherapistBooked = (therapistId: string, slot: string) =>
    appointments.some(a => a.date === dateVal && a.slot === slot && a.therapistIds && a.therapistIds.includes(therapistId));

  // 1. Try selected therapists (if any)
  let candidates: any[] = [];
  if (selectedTherapists && selectedTherapists.length > 0) {
    candidates = allTherapists.filter(t =>
      selectedTherapists.includes(t.id) &&
      t.gender === patientGender &&
      t.availability?.[dateVal]?.includes(requestedSlot) &&
      !isTherapistBooked(t.id, requestedSlot)
    );
    if (candidates.length > 0) {
      return {
        therapists: candidates.map(t => t.id),
        slots: [requestedSlot]
      };
    }
  }

  // 2. Try all therapists of patient gender
  candidates = allTherapists.filter(t =>
    t.gender === patientGender &&
    t.availability?.[dateVal]?.includes(requestedSlot) &&
    !isTherapistBooked(t.id, requestedSlot)
  );
  if (candidates.length > 0) {
    return {
      therapists: candidates.map(t => t.id),
      slots: [requestedSlot]
    };
  }

  // 3. No therapists available at requested slot, suggest up to 10 alternative slots (future slots only)
  // Gather all available slots for therapists of patient gender, not booked
  const futureSlotsSet = new Set<string>();
  const now = new Date();
  allTherapists.forEach(t => {
    if (t.gender !== patientGender || !t.availability?.[dateVal]) return;
    t.availability[dateVal].forEach((slot: string) => {
      // Only future slots
      const slotDate = new Date(`${dateVal}T${slot}`);
      if (slotDate > now && !isTherapistBooked(t.id, slot)) {
        futureSlotsSet.add(slot);
      }
    });
  });
  const futureSlots = Array.from(futureSlotsSet).sort().slice(0, 10);
  return { therapists: [], slots: futureSlots };
}


/**
 * Returns available rooms and time slots for a given slot and appointment schedule.
 * @param params - See parameter details below.
 * @returns { rooms: string[], slots: string[] }
 */
/**
 * Returns available rooms and time slots for a given slot and appointment schedule.
 * If selectedRoom is not provided, checks all rooms.
 * @param params - See parameter details below.
 * @returns { rooms: string[], slots: string[] }
 */
export function checkRoomsAvailability({
  selectedRoom,
  requestedSlot,
  dateVal,
  appointments,
  allRooms
}: {
  selectedRoom?: string;
  requestedSlot: string;
  dateVal: string;
  appointments: any[];
  allRooms: any[];
}): { rooms: string[]; slots: string[] } {
  // Helper: checks if room is booked at this date/slot
  const isRoomBooked = (room: string, slot: string) =>
    appointments.some(a => a.date === dateVal && a.slot === slot && a.roomNumber === room);

  // 1. Try selected room (if any)
  let candidates: string[] = [];
  if (selectedRoom) {
    if (!isRoomBooked(selectedRoom, requestedSlot)) {
      return {
        rooms: [selectedRoom],
        slots: [requestedSlot]
      };
    }
  }

  // 2. Try all other rooms
  candidates = allRooms.filter(room =>
    (!selectedRoom || room !== selectedRoom) && !isRoomBooked(room, requestedSlot)
  );
  if (candidates.length > 0) {
    return {
      rooms: candidates,
      slots: [requestedSlot]
    };
  }

  // 3. No rooms available at requested slot, suggest up to 10 alternative slots (future slots only)
  // Gather all available slots for any room not booked
  const futureSlotsSet = new Set<string>();
  const now = new Date();
  allRooms.forEach(room => {
    // Simulate clinic timings (assume slots on the hour from 08:00 to 18:00)
    for (let hour = 8; hour <= 18; hour++) {
      const slot = `${hour.toString().padStart(2, '0')}:00`;
      const slotDate = new Date(`${dateVal}T${slot}`);
      if (slotDate > now && !isRoomBooked(room, slot)) {
        futureSlotsSet.add(slot);
      }
    }
  });
  const futureSlots = Array.from(futureSlotsSet).sort().slice(0, 10);
  return { rooms: [], slots: futureSlots };
}


/**
 * Returns the top N sorted common slots between two arrays.
 * @param arr1 First array of slots
 * @param arr2 Second array of slots
 * @param topN Number of top slots to return
 * @returns Sorted array of common slots (up to topN)
 */
export function getTopCommonSlots(arr1: string[], arr2: string[], topN = 5): string[] {
  const intersection = arr1.filter(slot => arr2.includes(slot));
  return intersection.sort().slice(0, topN);
}

/**
 * Main function to orchestrate recurring slot alternatives logic.
 * Handles past slots, per-day conflicts, and detailed suggestions for recurring appointments.
 * @param params - See parameter details below.
 * @returns Object keyed by date, with availability, message, therapists, rooms, and alternatives.
 */
// --- Pure Helper Functions ---
function isTherapistAvailable(therapist: any, date: string, slot: string): boolean {
  return therapist && therapist.availability && Array.isArray(therapist.availability[date]) && therapist.availability[date].includes(slot);
}

function isRoomAvailable(room: any, date: string, slot: string, appointments: any[]): boolean {
  return !appointments.some(a => a.date === date && a.slot === slot && a.roomNumber === room.roomNumber);
}

function getAvailableTherapists(allTherapists: any[], patientGender: string, date: string, slot: string): any[] {
  return allTherapists.filter(t => t && t.gender === patientGender && isTherapistAvailable(t, date, slot));
}

function getAvailableRooms(allRooms: any[], date: string, slot: string, appointments: any[]): any[] {
  return allRooms.filter(room => isRoomAvailable(room, date, slot, appointments));
}

function findFirstAvailableTherapistRoomPair(therapists: any[], rooms: any[], date: string, slot: string, appointments: any[]): { therapist: any, room: any } | null {
  for (const therapist of therapists) {
    for (const room of rooms) {
      if (isRoomAvailable(room, date, slot, appointments)) {
        return { therapist, room };
      }
    }
  }
  return null;
}

function getSlotRoomAlternatives(therapists: any[], rooms: any[], date: string, afterSlot: string, allPossibleSlots: string[], appointments: any[], max: number = 5): { slot: string; roomNumber: string }[] {
  const alternatives: { slot: string; roomNumber: string }[] = [];
  const futureSlots = allPossibleSlots.filter(slot => slot > afterSlot);
  outer: for (const slot of futureSlots) {
    for (const therapist of therapists) {
      for (const room of rooms) {
        if (isTherapistAvailable(therapist, date, slot) && isRoomAvailable(room, date, slot, appointments)) {
          alternatives.push({ slot: `${slot}-${room.roomNumber}`, roomNumber: room.roomNumber });
          if (alternatives.length >= max) break outer;
        }
      }
    }
  }
  return alternatives;
}

function getReasonForUnavailability({ isPast, selectedRoom, roomAvailable, therapistsAvailable }: { isPast: boolean; selectedRoom?: string; roomAvailable: boolean; therapistsAvailable: boolean }): string | null {
  if (isPast) return 'Time Slot is in the past';
  if (selectedRoom && !roomAvailable && therapistsAvailable) return 'Selected Room is not available';
  if (!therapistsAvailable) return 'Therapists are busy';
  return null;
}

// --- Main Orchestration Function ---
export function getRecurringSlotAlternatives({
  startDate,
  days,
  requestedSlot,
  selectedTherapists,
  appointments,
  selectedRoom,
  patientId,
  allTherapists,
  allRooms,
  patients,
  now = new Date(),
}: {
  startDate: string;
  days: number;
  requestedSlot: string;
  selectedTherapists?: string[];
  appointments: any[];
  selectedRoom?: string;
  patientId: string;
  allTherapists: any[];
  allRooms: any[];
  patients: any[];
  now?: Date;
}): Array<{
  date: string;
  available: boolean;
  reason: string | null;
  alternatives: { slot: string; roomNumber: string }[];
}> {
  // --- Input validation ---
  if (!startDate || typeof startDate !== 'string') throw new Error('Missing or invalid startDate');
  if (!requestedSlot || typeof requestedSlot !== 'string') throw new Error('Missing or invalid requestedSlot');
  if (!Array.isArray(appointments)) throw new Error('Missing or invalid appointments array');
  if (!patientId || typeof patientId !== 'string') throw new Error('Missing or invalid patientId');
  if (!Array.isArray(allTherapists) || allTherapists.length === 0) throw new Error('Missing or invalid allTherapists array');
  if (!Array.isArray(allRooms) || allRooms.length === 0) throw new Error('Missing or invalid allRooms array');
  if (!Array.isArray(patients) || patients.length === 0) throw new Error('Missing or invalid patients array');
  if (typeof days !== 'number' || days < 1) throw new Error('Missing or invalid days');
  if (!(now instanceof Date)) throw new Error('Missing or invalid now (should be Date object)');

  // --- Input validation ---
  if (!startDate || typeof startDate !== 'string') throw new Error('Missing or invalid startDate');
  if (!requestedSlot || typeof requestedSlot !== 'string') throw new Error('Missing or invalid requestedSlot');
  if (!Array.isArray(appointments)) throw new Error('Missing or invalid appointments array');
  if (!patientId || typeof patientId !== 'string') throw new Error('Missing or invalid patientId');
  if (!Array.isArray(allTherapists) || allTherapists.length === 0) throw new Error('Missing or invalid allTherapists array');
  const patient = patients.find((p: any) => p.id === patientId);
  const patientGender = patient?.gender;
  const daysToBook = 1; // Per your code, always 1
  const results: Array<{ date: string; available: boolean; reason: string | null; alternatives: { slot: string; roomNumber: string }[] }> = [];

  for (let i = 0; i < daysToBook; i++) {
    const allPossibleSlots = CLINIC_TIMINGS.slots.map((slot: { start: string }) => slot.start);
    const dateVal = addDays(startDate, i);
    const isPast = isSlotInPast(dateVal, requestedSlot, now);
    let alternatives: { slot: string; roomNumber: string }[] = [];
    let available = true;
    let reason: string | null = null;

    // 1. Early return if therapists or rooms array is empty
    if (!allTherapists || allTherapists.length === 0 || !allRooms || allRooms.length === 0) {
      results.push({ date: dateVal, available: false, reason: 'Therapists are busy', alternatives: [] });
      continue;
    }

    // 2. Slot in the past
    if (isPast) {
      reason = 'Time Slot is in the past';
      alternatives = getSlotRoomAlternatives(
        getAvailableTherapists(allTherapists, patientGender, dateVal, requestedSlot),
        allRooms,
        dateVal,
        requestedSlot,
        allPossibleSlots,
        appointments
      );
      results.push({ date: dateVal, available: false, reason, alternatives });
      continue;
    }

    // 3. Therapist availability
    const safeSelectedTherapists = selectedTherapists || [];
    let therapistsOfGender: any[] = [];
    if (safeSelectedTherapists.length > 0) {
      therapistsOfGender = safeSelectedTherapists
        .map(tid => allTherapists.find((t: any) => t && t.id === tid))
        .filter(t => t && t.gender === patientGender && isTherapistAvailable(t, dateVal, requestedSlot));
    } else {
      therapistsOfGender = getAvailableTherapists(allTherapists, patientGender, dateVal, requestedSlot);
    }
    const therapistsAvailable = therapistsOfGender.length > 0;

    // 4. Room availability
    let roomsAvailable: any[] = getAvailableRooms(allRooms, dateVal, requestedSlot, appointments);
    let roomAvailable = !selectedRoom || roomsAvailable.some(room => room.roomNumber === selectedRoom);

    // 5. Main decision logic
    if (!therapistsAvailable) {
      reason = 'Therapists are busy';
      available = false;
      alternatives = getSlotRoomAlternatives(
        getAvailableTherapists(allTherapists, patientGender, dateVal, requestedSlot),
        allRooms,
        dateVal,
        requestedSlot,
        allPossibleSlots,
        appointments
      );
      results.push({ date: dateVal, available, reason, alternatives });
      continue;
    }

    // If a specific room is selected
    if (selectedRoom) {
      if (!roomAvailable) {
        reason = 'Selected Room is not available';
        available = false;
        // Suggest alternatives for same slot with other rooms (if therapists available)
        alternatives = allRooms
          .filter(room => room.roomNumber !== selectedRoom && isRoomAvailable(room, dateVal, requestedSlot, appointments))
          .slice(0, 5)
          .map(room => ({ slot: `${requestedSlot}-${room.roomNumber}`, roomNumber: room.roomNumber }));
        results.push({ date: dateVal, available, reason, alternatives });
        continue;
      }
      // Room is available and therapists are available
      results.push({ date: dateVal, available: true, reason: null, alternatives: [] });
      continue;
    }

    // If therapists selected but no room
    if (safeSelectedTherapists.length > 0 && !selectedRoom) {
      // Try to find any room for selected therapists
      let found = false;
      for (const therapist of therapistsOfGender) {
        for (const room of roomsAvailable) {
          if (isRoomAvailable(room, dateVal, requestedSlot, appointments)) {
            results.push({ date: dateVal, available: true, reason: null, alternatives: [] });
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        reason = 'Therapists are busy';
        available = false;
        alternatives = getSlotRoomAlternatives(
          therapistsOfGender,
          allRooms,
          dateVal,
          requestedSlot,
          allPossibleSlots,
          appointments
        );
        results.push({ date: dateVal, available, reason, alternatives });
      }
      continue;
    }

    // Auto-assign (no therapist, no room selected)
    if (!selectedTherapists && !selectedRoom) {
      const pair = findFirstAvailableTherapistRoomPair(therapistsOfGender, roomsAvailable, dateVal, requestedSlot, appointments);
      if (pair) {
        results.push({ date: dateVal, available: true, reason: null, alternatives: [] });
        continue;
      } else {
        reason = 'Therapists are busy';
        available = false;
        alternatives = getSlotRoomAlternatives(
          getAvailableTherapists(allTherapists, patientGender, dateVal, requestedSlot),
          allRooms,
          dateVal,
          requestedSlot,
          allPossibleSlots,
          appointments
        );
        results.push({ date: dateVal, available, reason, alternatives });
        continue;
      }
    }

    // Default: all available
    results.push({ date: dateVal, available: true, reason: null, alternatives: [] });
  }
  return results;
};
 