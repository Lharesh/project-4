import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
// buildScheduleMatrix.ts
import { Therapist, ClinicTimings } from '../helpers/availabilityUtils';
import { generateRoomSlots } from '../helpers/roomSlotTimeline';
import { SlotStatus } from '../constants/status';

export interface Room {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  date: string;
  slot: string;
  duration: number;
  time?: string;
  roomId: string;
  therapistIds: string[];
  clientId: string;
}

import { normalizeSlot } from '../helpers/dateHelpers';

// No mock availability; all therapists and rooms are available unless booked


export interface MatrixCell {
  start: string;
  end: string;
  isBreak: boolean;
  status: SlotStatus;
  therapistAvailable: boolean;
  availableTherapists: { id: string, name: string, gender: string, availability: Record<string, string[]> }[];
  booking: any | null;
}

export interface RoomMatrix {
  id: string;
  roomName: string;
  slots: MatrixCell[];
}

/**
 * REFACTOR NOTICE (2025-05-25):
 * This file was refactored to use the centralized `getAvailableSlotsForEntity` helper
 * for generating available slots for rooms (and therapists, if needed).
 *
 * - All slot-generation logic now delegates to this helper to ensure consistency.
 * - No changes have been made to function signatures or output structures.
 * - All existing tests for this module should continue to pass without modification.
 *
 * For the original logic, see buildScheduleMatrix.backup.ts in the same directory.
 */

/**
 * Builds a matrix for a given date.
 */
export function buildScheduleMatrix(
  date: string,
  appointments: Booking[],
  rooms: Room[],
  therapists: Therapist[],
  clinicTimings: ClinicTimings,
  enforceGenderMatch?: boolean,
  clientGender?: string,
  slotDuration?: number,
  clients: any[] = [] // Add clients as argument
): RoomMatrix[] {

  const matrix = rooms.map(room => {
    let slots = generateRoomSlots({
      room,
      date,
      appointments,
      therapists,
      clinicTimings,
      slotDuration,
      enforceGenderMatch,
      clientGender,
      clients, // Pass clients array for enrichment
    });
    console.log('[Matrix Room Slots]', room.id, slots.length);
    return {
      id: room.id,
      roomName: room.name || room.id,
      slots,
    };

  });

  return matrix;
}