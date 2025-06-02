// --- Types for shared helpers ---
import { Booking, Therapist, Room, Patient, isTherapistAvailable, isRoomAvailable, isPatientAvailable } from './availabilityUtils';
import { getAvailableSlotsForEntity } from './availabilityUtils';
import { CLINIC_TIMINGS } from '../mock/scheduleMatrixMock';

// Centralized therapist gender filtering utility
// Centralized therapist gender filtering utility
export function filterTherapistsByGender(
  therapists: Therapist[],
  patientGender: string | undefined,
  enforceGenderMatch: boolean
): Therapist[] {
  // If gender match is not enforced or patient gender is not set, return all therapists
  if (!enforceGenderMatch || !patientGender) return therapists;
  // Normalize both genders to lowercase for robust comparison
  const normalizedGender = patientGender?.toLowerCase();
  return therapists.filter(t => t.gender.toLowerCase() === normalizedGender);
}

// --- Unified booking options API ---
export interface BookingOption {
  date: string;
  slot: string;
  available: boolean;
  reason: string | null;
  selectedTherapists: string[];
  selectedRoom: string;
  alternatives: Array<{
    slot: string;
    therapistIds: string[];
    roomId: string;
  }>;
}

export interface GetBookingOptionsInput {
  date: string;
  slot: string;
  clientId: string;
  selectedTherapists?: string[];
  selectedRoom?: string;
  appointments: Booking[];
  allTherapists: Therapist[];
  allRooms: Room[];
  clients: Patient[];
  now?: Date;
  maxAlternatives?: number;
}

// --- Integrated double-booking check ---
function canBookTherapyAppointment({ appointments, date, slot, roomId, therapistIds, clientId, slotDuration = 60 }: {
  appointments: Booking[],
  date: string,
  slot: string,
  roomId: string,
  therapistIds: string[],
  clientId: string,
  slotDuration?: number
}): { available: boolean; reason: string | null } {
  // 1. Patient overlap check
  if (!isPatientAvailable(clientId, date, slot, appointments, slotDuration)) {
    return { available: false, reason: 'Patient already has an appointment at this time' };
  }
  // 2. Therapist overlap check
  const therapistUnavailable = therapistIds.length > 0 && !therapistIds.every(
    tid => isTherapistAvailable({ id: tid } as Therapist, date, slot, appointments, undefined, slotDuration)
  );
  if (therapistUnavailable) {
    return { available: false, reason: 'Therapists are busy' };
  }
  // 3. Room overlap check
  if (roomId && !isRoomAvailable({ id: roomId } as Room, date, slot, appointments, undefined, slotDuration)) {
    return { available: false, reason: 'Selected Room is not available' };
  }
  return { available: true, reason: null };
}

export function getBookingOptions({
  date,
  slot,
  clientId,
  selectedTherapists = [],
  selectedRoom = '',
  appointments,
  allTherapists,
  allRooms,
  clients,
  now = new Date(),
  maxAlternatives = 5,
  enforceGenderMatch = true
}: GetBookingOptionsInput & { enforceGenderMatch: boolean }): BookingOption[] {
 
  // Fallback guards for arrays
  clients = Array.isArray(clients) ? clients : [];
  allTherapists = Array.isArray(allTherapists) ? allTherapists : [];
  allRooms = Array.isArray(allRooms) ? allRooms : [];

  // Find patient gender
  const patient = clients.find(p => p.id === clientId);
  const patientGender = patient ? patient.gender : undefined;


  // Normalize clinic timings for compatibility (fixes TS errors)
  function normalizeClinicTimings(raw: any): any {
    // If already has weekdays and slotDuration, return as is
    if (raw && raw.weekdays && raw.slotDuration) return raw;
    // Convert workingDays/weeklyOff to weekdays if needed
    let weekdays = raw.weekdays;
    if (!weekdays && raw.workingDays) {
      weekdays = {
        sunday: { isOpen: raw.workingDays.includes('sunday'), start: '09:00', end: '18:00' },
        monday: { isOpen: raw.workingDays.includes('monday'), start: '09:00', end: '18:00' },
        tuesday: { isOpen: raw.workingDays.includes('tuesday'), start: '09:00', end: '18:00' },
        wednesday: { isOpen: raw.workingDays.includes('wednesday'), start: '09:00', end: '18:00' },
        thursday: { isOpen: raw.workingDays.includes('thursday'), start: '09:00', end: '18:00' },
        friday: { isOpen: raw.workingDays.includes('friday'), start: '09:00', end: '18:00' },
        saturday: { isOpen: raw.workingDays.includes('saturday'), start: '09:00', end: '14:00' }
      };
    }
    return {
      ...raw,
      weekdays: weekdays || {
        sunday: { isOpen: false },
        monday: { isOpen: true, start: '09:00', end: '18:00' },
        tuesday: { isOpen: true, start: '09:00', end: '18:00' },
        wednesday: { isOpen: true, start: '09:00', end: '18:00' },
        thursday: { isOpen: true, start: '09:00', end: '18:00' },
        friday: { isOpen: true, start: '09:00', end: '18:00' },
        saturday: { isOpen: true, start: '09:00', end: '14:00' }
      },
      slotDuration: raw.slotDuration || raw.slotDurationMinutes || 60
    };
  }
  const clinicTimings = normalizeClinicTimings(CLINIC_TIMINGS);
  const slotDuration = clinicTimings.slotDuration;

  // --- Use getAvailableSlotsForEntity for slot checks ---
  // Find all eligible therapists: if selectedTherapists is set, use only those, else use all by patient gender
  const eligibleTherapists = selectedTherapists.length > 0
    ? allTherapists.filter(t => selectedTherapists.includes(t.id))
    : filterTherapistsByGender(allTherapists, patientGender, enforceGenderMatch);
  // Build slot map for all eligible therapists
  const therapistSlotMap: Record<string, string[]> = {};
  for (const therapist of eligibleTherapists) {
    const input = {
      entityId: therapist.id,
      entityType: 'therapist' as import('./availabilityUtils').EntityType,
      date,
      appointments,
      clinicTimings,
      slotDuration
    };
    const slots = getAvailableSlotsForEntity(input);
    therapistSlotMap[therapist.id] = slots;
  }

  // Room slot availability
  const roomSlotMap: Record<string, string[]> = {};
  for (const room of allRooms) {
    const input = {
      entityId: room.id,
      entityType: 'room' as import('./availabilityUtils').EntityType,
      date,
      appointments,
      clinicTimings,
      slotDuration
    };
    const slots = getAvailableSlotsForEntity(input);
    roomSlotMap[room.id] = slots;
  }

  // Room and selected room availability for the requested slot
  const availableRooms = allRooms.filter((r: Room) => roomSlotMap[r.id].includes(slot));
  const selectedRoomAvailable = selectedRoom
    ? availableRooms.some((r: Room) => r.id === selectedRoom)
    : false;

  // --- Strict Reason and Alternatives Logic ---
  // Removed block-scoped redeclarations. Use only 'finalReason', 'finalAvailable', etc. below.

  // Calculate availableTherapists BEFORE using in canBookTherapyAppointment
  let availableTherapists = eligibleTherapists.filter((t: Therapist) => therapistSlotMap[t.id].includes(slot));
  // Do NOT redeclare availableTherapists elsewhere in this function. Only reassign if needed.
  // --- Integrated double-booking check ---
  const { available, reason } = canBookTherapyAppointment({
    appointments,
    date,
    slot,
    roomId: selectedRoom,
    therapistIds: availableTherapists.map((t: Therapist) => t.id),
    clientId
  });

  // Helper: get future slot alternatives
  function getFutureSlotAlternatives({
    excludeRoomId
  }: { excludeRoomId?: string } = {}) {
    let futureAlts: BookingOption['alternatives'] = [];
    let allSlots: string[] = [];
    if (clinicTimings && Array.isArray(clinicTimings.slots)) {
      allSlots = clinicTimings.slots.map((s: { start: string }) => s.start);
    }
    allSlots = allSlots.sort();
    const futureSlots = allSlots.filter((s: string) => s > slot);
    slotLoop: for (const altSlot of futureSlots) {
      if (altSlot === slot) continue;
      for (const room of allRooms) {
        if (excludeRoomId && room.id === excludeRoomId) continue;
        for (const therapist of eligibleTherapists) {
          const therapistAvailable = isTherapistAvailable(therapist, date, altSlot, appointments, undefined);
          const roomAvailable = isRoomAvailable(room, date, altSlot, appointments);
          if (therapistAvailable && roomAvailable) {
            futureAlts.push({
              slot: `${altSlot}-${room.id}`,
              therapistIds: [therapist.id],
              roomId: room.id
            });
            if (futureAlts.length >= maxAlternatives) break slotLoop;
          }
        }
      }
    }
    return futureAlts;
  }

  // Slot in the past
  const slotDateTime = new Date(`${date}T${slot}`);
  // Explicitly check therapist and room availability for the slot
  const selectedRoomObj = allRooms.find(r => r.id === selectedRoom);
  const therapistAvailableForSlot = eligibleTherapists.some(t => isTherapistAvailable(t, date, slot, appointments, undefined));
  const selectedRoomAvailableForSlot = selectedRoomObj ? isRoomAvailable(selectedRoomObj, date, slot, appointments) : false;

  // --- Integrated double-booking logic ---
  // Remove original block-scoped variables 'reason', 'available', etc. Only use the 'final' variables below.
  let finalAvailable = available;
  let finalReason: string | null = reason;
  let finalAlternatives: BookingOption['alternatives'] = [];
  let finalAlternativesPopulated = false;

  if (slotDateTime < now) {
    finalReason = 'Time Slot is in the past';
    finalAvailable = false;
  } else if (!finalAvailable) {
    // Use the prioritized reason from canBookTherapyAppointment
    if (finalReason === 'Patient already has an appointment at this time') {
      // Patient is double-booked, suggest next available slots for patient
      finalAlternatives = getFutureSlotAlternatives();
      finalAlternativesPopulated = true;
    } else if (finalReason === 'Therapists are busy') {
      // Suggest alternatives with available therapists
      finalAlternatives = getFutureSlotAlternatives();
      finalAlternativesPopulated = true;
    } else if (finalReason === 'Selected Room is not available') {
      // Suggest alternatives with available rooms
      finalAlternatives = getFutureSlotAlternatives();
      finalAlternativesPopulated = true;
    } else {
      finalReason = 'Slot unavailable';
      finalAlternatives = getFutureSlotAlternatives();
      finalAlternativesPopulated = true;
    }
  } else if (therapistAvailableForSlot && selectedRoomAvailableForSlot) {
    finalAvailable = true;
    finalReason = null;
  } else {
    finalReason = 'Slot unavailable';
    finalAvailable = false;
    finalAlternatives = getFutureSlotAlternatives();
    finalAlternativesPopulated = true;
  }

  console.log('[DEBUG][Alternatives][RETURN]', finalAlternatives);
  const result = [{
    date,
    slot,
    available: finalAvailable,
    reason: finalReason,
    selectedTherapists: availableTherapists.map((t: Therapist) => t.id),
    selectedRoom,
    alternatives: JSON.parse(JSON.stringify(finalAlternatives))
  }];
  // DEBUG LOG: Output value
  console.log('[DEBUG][getBookingOptions][OUTPUT]', result);
  return result;
}