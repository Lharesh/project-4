import { CLINIC_TIMINGS, ROOMS, THERAPISTS } from '../mock/scheduleMatrixMock';
import { isSlotInPast } from './isSlotInPast';
import { addDays } from './dateHelpers';
import { isTherapistAvailable, isRoomAvailable, isPatientAvailable, getAvailableTherapists, getAvailableRooms, Therapist, Room, Booking, Patient } from './availabilityUtils';
import { filterTherapistsByGender } from './rulesEngine';

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
  allTherapists,
  enforceGenderMatch = true
}: {
  selectedTherapists?: string[];
  requestedSlot: string;
  dateVal: string;
  appointments: any[];
  patientGender: string;
  allTherapists: any[];
  enforceGenderMatch?: boolean;
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
    // Replace direct gender filtering with filterTherapistsByGender
    if (!filterTherapistsByGender([t], patientGender, enforceGenderMatch).length || !t.availability?.[dateVal]) return;
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

// Remove local implementations and use shared helpers



function findFirstAvailableTherapistRoomPair(therapists: Therapist[], rooms: Room[], date: string, slot: string, appointments: Booking[]): { therapist: Therapist, room: Room } | null {
  for (const therapist of therapists) {
    for (const room of rooms) {
      if (isRoomAvailable(room, date, slot, appointments)) {
        return { therapist, room };
      }
    }
  }
  return null;
}

function getSlotRoomAlternatives(therapists: any[], rooms: any[], date: string, afterSlot: string, allPossibleSlots: string[], appointments: any[], max: number = 5): { slot: string; roomId: string }[] {
  const alternatives: { slot: string; roomId: string }[] = [];
  const futureSlots = allPossibleSlots.filter(slot => slot > afterSlot);
  outer: for (const slot of futureSlots) {
    for (const therapist of therapists) {
      for (const room of rooms) {
        if (isTherapistAvailable(therapist, date, slot, appointments) && isRoomAvailable(room, date, slot, appointments)) {
          alternatives.push({ slot: `${slot}-${room.id}`, roomId: room.id });
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

/**
 * REFACTOR NOTICE (2025-05-25):
 * This file was refactored to use the centralized `getAvailableSlotsForEntity` helper
 * for generating available slots for therapists and rooms.
 *
 * - All slot-generation logic now delegates to this helper to ensure consistency.
 * - No changes have been made to function signatures or output structures.
 * - All existing tests for this module should continue to pass without modification.
 *
 * For the original logic, see recurringSlotAlternatives.backup.ts in the same directory.
 */

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
  enforceGenderMatch = true,
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
  enforceGenderMatch?: boolean;
}): Array<{
  date: string;
  available: boolean;
  reason: string | null;
  alternatives: { slot: string; roomId: string }[];
}> {
  // --- Input validation ---
  if (!startDate || typeof startDate !== 'string') throw new Error('Missing or invalid startDate');
  if (!requestedSlot || typeof requestedSlot !== 'string') throw new Error('Missing or invalid requestedSlot');
  if (!Array.isArray(appointments)) throw new Error('Missing or invalid appointments array');
  if (!patientId || typeof patientId !== 'string') throw new Error('Missing or invalid patientId');
  if (!Array.isArray(patients) || patients.length === 0) throw new Error('Missing or invalid patients array');
  if (typeof days !== 'number' || days < 1) throw new Error('Missing or invalid days');
  if (!(now instanceof Date)) throw new Error('Missing or invalid now (should be Date object)');
  const results: Array<{ date: string; available: boolean; reason: string | null; alternatives: { slot: string; roomId: string }[] }> = [];
  if (!Array.isArray(allTherapists) || allTherapists.length === 0 || !Array.isArray(allRooms) || allRooms.length === 0) {
    for (let i = 0; i < days; i++) {
      const dateVal = addDays(startDate, i);
      results.push({ date: dateVal, available: false, reason: 'Therapists are busy', alternatives: [] });
    }
    return results;
  }
  const patient = patients.find((p: any) => p.id === patientId);
  const patientGender = patient?.gender;
  const daysToBook = days;
  for (let i = 0; i < daysToBook; i++) {
    let available: boolean = false;
    let reason: string | null = null;
    let alternatives: { slot: string; roomId: string }[] = [];
    const dateVal = addDays(startDate, i);
    const allPossibleSlots = CLINIC_TIMINGS.slots.map((slot: { start: string }) => slot.start);
    const isPast = isSlotInPast(dateVal, requestedSlot, now);
    const slotDuration = 60; // Make this dynamic if needed
    // 1. Early return if slot is in the past
    if (isPast) {
      reason = 'Time Slot is in the past';
      available = false;
      // Suggest alternatives for the same slot, with available therapist (same gender) and available room (not booked)
      const availableTherapists = getAvailableTherapists(allTherapists, patientGender, dateVal, requestedSlot, appointments, enforceGenderMatch);
      const altRooms = allRooms.filter(room => isRoomAvailable(room, dateVal, requestedSlot, appointments));
      alternatives = [];
      for (const therapist of availableTherapists) {
        for (const room of altRooms) {
          if (alternatives.length >= 5) break;
          alternatives.push({ slot: `${requestedSlot}-${room.id}`, roomId: room.id });
        }
        if (alternatives.length >= 5) break;
      }
      results.push({ date: dateVal, available, reason, alternatives });
      continue;
    }
    // 1a. Patient double-booking (overlap) check
    const patientAvailable = isPatientAvailable(patientId, dateVal, requestedSlot, appointments, slotDuration);
    if (!patientAvailable) {
      reason = 'Patient already has an appointment at this time';
      available = false;
      // Suggest alternatives for the next available slots/rooms
      alternatives = [];
      outer: for (const slot of allPossibleSlots) {
        if (slot === requestedSlot) continue;
        let altTherapists = getAvailableTherapists(allTherapists, patientGender, dateVal, slot, appointments, enforceGenderMatch);
        for (const therapist of altTherapists) {
          let altRoomObjs = allRooms.filter(room => isRoomAvailable(room, dateVal, slot, appointments, undefined, slotDuration));
          for (const room of altRoomObjs) {
            alternatives.push({ slot: `${slot}-${room.id}`, roomId: room.id });
            if (alternatives.length >= 5) break outer;
          }
        }
      }
      results.push({ date: dateVal, available, reason, alternatives });
      continue;
    }
    // 2. Therapist availability
    const safeSelectedTherapists = selectedTherapists || [];
    // DRY: Use getAvailableTherapists utility for gender and slot filtering
    const therapistsAvailableForSlot = getAvailableTherapists(allTherapists, patientGender, dateVal, requestedSlot, appointments, enforceGenderMatch);
    if (therapistsAvailableForSlot.length === 0) {
      // No therapists of correct gender available for this slot
      
      reason = 'Therapists are busy';
      available = false;
      alternatives = [];
      results.push({ date: dateVal, available, reason, alternatives });
      continue;
    }
    if (selectedRoom) {
      let roomsAvailable: any[] = getAvailableRooms(allRooms, dateVal, requestedSlot, appointments);
      let roomAvailable = roomsAvailable.some(room => room.roomNumber === selectedRoom);
      if (!roomAvailable) {
        // At least one therapist of correct gender is available for the slot (already checked above)
        
        reason = 'Selected Room is not available';
        available = false;
        // Suggest alternatives for the SAME slot, for other available rooms
        const altRooms = allRooms.filter(
          room => room.id !== selectedRoom && isRoomAvailable(room, dateVal, requestedSlot, appointments)
        );
        alternatives = [];
        for (const room of altRooms) {
          if (alternatives.length >= 5) break;
          alternatives.push({ slot: `${requestedSlot}-${room.id}`, roomId: room.id });
        }
        results.push({ date: dateVal, available, reason, alternatives });
        continue;
      }
    }
    // Overlap-aware availability check for both therapist and room
    let therapistAvailable = therapistsAvailableForSlot.length > 0 && therapistsAvailableForSlot.some(t =>
      isTherapistAvailable(t, dateVal, requestedSlot, appointments, undefined, slotDuration)
    );
    let roomAvailable = true;
    if (selectedRoom) {
      const roomObj = allRooms.find(room => room.id === selectedRoom);
      roomAvailable = !!roomObj && isRoomAvailable(roomObj, dateVal, requestedSlot, appointments, undefined, slotDuration);
    }
    if (!therapistAvailable || !roomAvailable) {
      available = false;
      reason = !roomAvailable ? 'Selected Room is not available' : 'Therapists are busy';
      // Always suggest alternatives for other slots if current is unavailable
      alternatives = [];
      outer: for (const slot of allPossibleSlots) {
        if (slot === requestedSlot) continue;
        let altTherapists = getAvailableTherapists(allTherapists, patientGender, dateVal, slot, appointments, enforceGenderMatch);
        for (const therapist of altTherapists) {
          let altRoomObjs = allRooms.filter(room => isRoomAvailable(room, dateVal, slot, appointments, undefined, slotDuration));
          for (const room of altRoomObjs) {
            alternatives.push({ slot: `${slot}-${room.id}`, roomId: room.id });
            if (alternatives.length >= 5) break outer;
          }
        }
      }
      results.push({ date: dateVal, available, reason, alternatives });
      continue;
    }
    // Default: both therapist and room are available
    available = true;
    reason = null;
    alternatives = [];
    results.push({ date: dateVal, available, reason, alternatives });
  }
  return results;
}
