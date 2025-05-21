// buildScheduleMatrix.ts

import { ROOMS, THERAPISTS, CLINIC_TIMINGS } from '../mock/scheduleMatrixMock';

// No mock availability; all therapists and rooms are available unless booked


export interface MatrixCell {
  slot: string;
  availableTherapists: { id: string, name: string, gender: string, availability: Record<string, string[]> }[];
  isRoomAvailable: boolean;
  isBooked: boolean;
  booking?: any;
}

export interface RoomMatrix {
  roomNumber: string;
  roomName: string;
  slots: MatrixCell[];
}

/**
 * Builds a matrix for a given date.
 */
export function buildScheduleMatrix(date: string, appointments: any[]): RoomMatrix[] {
  console.log('[buildScheduleMatrix] called with date:', date, 'appointments:', JSON.stringify(appointments));
  if (!Array.isArray(appointments)) {
    throw new Error('buildScheduleMatrix: appointments must be an array (received: ' + typeof appointments + ')');
  }
  const slots = CLINIC_TIMINGS.slots.map(slot => slot.start);
  const now = new Date();

  return ROOMS.map(room => {
    const roomSlots: MatrixCell[] = slots.map(slot => {
      // Compute slot datetime (assume slots are in HH:MM format)
      const slotDateTime = new Date(`${date}T${slot}:00`);
      const isPast = slotDateTime < now;

      // Check if slot is already booked in this room
      const booking = appointments.find(
        b => b.date === date && (b.time === slot || b.slot === slot) && b.roomNumber === room.roomNumber
      );
      const isBooked = !!booking;

      // Check if room is booked for this slot
      const isRoomBooked = appointments.some(
        b => b.date === date && (b.slot === slot || b.time === slot) && b.roomNumber === room.roomNumber
      );
      // If the room is booked, no therapists are available for this slot in this room
      const availableTherapists = (!isPast && !isRoomBooked)
        ? THERAPISTS.filter(t => {
            // Only show therapists who are not booked in any room at this slot
            const therapistBooked = appointments.some(
              b => b.date === date && (b.slot === slot || b.time === slot) && b.therapistIds.includes(t.id)
            );
            return !therapistBooked;
          }).map(t => ({ id: t.id, name: t.name, gender: t.gender, availability: {} }))
        : [];

      return {
        slot,
        availableTherapists,
        isRoomAvailable: !isPast && !isRoomBooked,
        isBooked: isRoomBooked,
        booking: appointments.find(
          b => b.date === date && (b.slot === slot || b.time === slot) && b.roomNumber === room.roomNumber
        ),
      };
    });

    return {
      roomNumber: room.roomNumber,
      roomName: room.name,
      slots: roomSlots,
    };
  });
}