import { CLINIC_TIMINGS, ROOMS, THERAPISTS } from '../mock/scheduleMatrixMock';
import { canBookAppointment } from './rulesEngine';
import { isSlotInPast } from './isSlotInPast';
import { addDays } from './dateHelpers';

// Returns for each date: { alternatives: [{slot, roomNumber}], reason: string, available: boolean }
export function getRecurringSlotAlternatives({
  startDate,
  days,
  requestedSlot,
  selectedTherapists,
  appointments,
  selectedRoom,
  customMode,
  customDuration,
  duration,
  now = new Date(),
  patientId,
}: {
  startDate: string;
  days: number;
  requestedSlot: string;
  selectedTherapists: string[];
  appointments: any[];
  selectedRoom: string;
  customMode: boolean;
  customDuration: number | string;
  duration: number | undefined;
  now?: Date;
  patientId: string;
}) {
  const results: Record<string, {
    available: boolean;
    reason: string | null;
    alternatives: Array<{ slot: string; roomNumber: string }>;
  }> = {};

  const daysToBook = customMode ? Number(customDuration) : (duration ?? 1);

  for (let i = 0; i < daysToBook; i++) {
    const dateVal = addDays(startDate, i);
    const allPossibleSlots = CLINIC_TIMINGS.slots.map((slot: { start: string }) => slot.start);
    const afterRequested = allPossibleSlots.filter(slot => slot > requestedSlot);
    const beforeRequested = allPossibleSlots.filter(slot => slot < requestedSlot);
    let alternatives: Array<{ slot: string; roomNumber: string }> = [];
    let available = false;
    let reason: string | null = null;

    // Check if requested slot is in the past
    if (isSlotInPast(dateVal, requestedSlot, now)) {
      reason = 'Time Slot is in the past';
      // Priority 1: Try same slot with another therapist (same gender) or another room
      const PATIENTS = require('../mock/scheduleMatrixMock').PATIENTS;
      const patient = PATIENTS.find((p: any) => p.id === patientId);
      const patientGender = patient ? patient.gender : undefined;

      // Try same slot, other therapists (same gender, not already selected)
      for (const therapist of THERAPISTS) {
        if (
          (!selectedTherapists.includes(therapist.id)) &&
          therapist.gender === patientGender &&
          therapist.availability?.[dateVal]?.includes(requestedSlot)
        ) {
          // Try all rooms
          for (const room of ROOMS) {
            // Always offer any available room for the same slot, including the originally selected room if a different therapist is available
            const canBook = canBookAppointment({
              therapistIds: [therapist.id],
              roomNumber: room.roomNumber,
              date: dateVal,
              slot: requestedSlot,
              appointments
            });
            if (canBook) {
              alternatives.push({ slot: requestedSlot, roomNumber: room.roomNumber });
            }
          }
        }
      }
      // Priority 2: If no alternatives for same slot, try next nearest future slots (same room, then other rooms)
      if (alternatives.length === 0) {
        const allPossibleSlots = CLINIC_TIMINGS.slots.map((slot: { start: string }) => slot.start);
        const afterRequested = allPossibleSlots.filter(slot => slot > requestedSlot);
        for (const slot of afterRequested) {
          if (!isSlotInPast(dateVal, slot, now)) {
            // Try selected therapist(s) in selected room
            const canBookNext = canBookAppointment({
              therapistIds: selectedTherapists,
              roomNumber: selectedRoom,
              date: dateVal,
              slot,
              appointments
            });
            if (canBookNext) {
              alternatives.push({ slot, roomNumber: selectedRoom });
              break; // Only next nearest
            }
            // Try all therapists (same gender) and all rooms
            for (const therapist of THERAPISTS) {
              if (therapist.gender === patientGender && therapist.availability?.[dateVal]?.includes(slot)) {
                for (const room of ROOMS) {
                  const canBookAlt = canBookAppointment({
                    therapistIds: [therapist.id],
                    roomNumber: room.roomNumber,
                    date: dateVal,
                    slot,
                    appointments
                  });
                  if (canBookAlt) {
                    alternatives.push({ slot, roomNumber: room.roomNumber });
                    break;
                  }
                }
              }
              if (alternatives.length > 0) break;
            }
            if (alternatives.length > 0) break;
          }
        }
      }
    } else {
      // Check if requested slot is available for selected therapist(s) and room
      const canBookPrimary = canBookAppointment({
        therapistIds: selectedTherapists,
        roomNumber: selectedRoom,
        date: dateVal,
        slot: requestedSlot,
        appointments
      });
      if (canBookPrimary) {
        available = true;
      } else {
        // Try same slot in other rooms (if therapist available)
        for (const room of ROOMS) {
          if (room.roomNumber !== selectedRoom) {
            const canBookOtherRoom = canBookAppointment({
              therapistIds: selectedTherapists,
              roomNumber: room.roomNumber,
              date: dateVal,
              slot: requestedSlot,
              appointments
            });
            if (canBookOtherRoom) {
              alternatives.push({ slot: requestedSlot, roomNumber: room.roomNumber });
            }
          }
        }
        // Try next slots after requested slot (same room)
        for (const slot of afterRequested) {
          const canBookNext = canBookAppointment({
            therapistIds: selectedTherapists,
            roomNumber: selectedRoom,
            date: dateVal,
            slot,
            appointments
          });
          if (canBookNext) {
            alternatives.push({ slot, roomNumber: selectedRoom });
          }
        }
        // Try before slots if nothing after
        if (alternatives.length === 0) {
          for (const slot of beforeRequested.reverse()) {
            const canBookPrev = canBookAppointment({
              therapistIds: selectedTherapists,
              roomNumber: selectedRoom,
              date: dateVal,
              slot,
              appointments
            });
            if (canBookPrev) {
              alternatives.push({ slot, roomNumber: selectedRoom });
            }
          }
        }
        // Set reason if no alternatives
        if (alternatives.length === 0) {
          // Check if therapist unavailable
          let therapistUnavailable = false;
          for (const therapistId of selectedTherapists) {
            const therapist = THERAPISTS.find(t => t.id === therapistId);
            if (!therapist || !(therapist.availability?.[dateVal]?.includes(requestedSlot))) {
              therapistUnavailable = true;
              break;
            }
          }
          if (therapistUnavailable) {
            reason = 'Therapists are busy';
          } else {
            // Check if room unavailable
            const room = ROOMS.find(r => r.roomNumber === selectedRoom);
            if (!room) {
              reason = 'Selected Room is not available';
            } else {
              reason = 'Selected Room is not available';
            }
          }
        }
      }
    }
    // If alternatives exist but no reason is set, provide a default reason
    if (!available && alternatives.length > 0 && !reason) {
      reason = 'Selected Room is not available';
    }
    results[dateVal] = {
      available,
      reason,
      alternatives
    };
  }
  return results;
}