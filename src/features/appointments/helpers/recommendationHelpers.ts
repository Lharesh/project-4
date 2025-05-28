import { RoomMatrix } from '../modal/buildScheduleMatrix';
import { THERAPISTS, PATIENTS } from '../mock/scheduleMatrixMock';

export interface RecommendationCriteria {
  originalSlot: string;
  originalTherapistIds: string[];
  patientId: string;
  date: string;
  matrix: RoomMatrix[];
}

export interface SlotRecommendation {
  roomNumber: string;
  slot: string;
  therapistId: string;
  reason: string; // e.g. 'same therapist', 'same gender', etc.
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getRecommendedSlots({
  originalSlot,
  originalTherapistIds,
  patientId,
  date,
  matrix,
}: RecommendationCriteria): SlotRecommendation[] {
  // Get patient gender
  const patient = PATIENTS.find(p => p.id === patientId);
  if (!patient) return [];
  const patientGender = patient.gender;
  // Use filterTherapistsByGender for all gender filtering
  // (Apply in slot/therapist selection logic below as appropriate)

  // Flatten all available slots
  let allSlots: SlotRecommendation[] = [];
  // Only consider cells for the requested slot (time), but check all rooms and all therapists
  matrix.forEach(room => {
    room.slots.forEach((cell: any) => {
      if (cell.slot !== originalSlot) return;
      if (!cell.isRoomAvailable || cell.isBooked) return;
      cell.availableTherapists.forEach((t: any) => {
        let reason = '';
        if (originalTherapistIds.includes(t.id)) {
          reason = 'same therapist';
        } else if (t.gender === patientGender) {
          reason = 'same gender';
        } else {
          reason = 'other';
        }
        allSlots.push({
          roomNumber: room.id,
          slot: cell.slot,
          therapistId: t.id,
          reason,
        });
      });
    });
  });

  // Prioritize: same therapist > same gender > other
  allSlots.sort((a, b) => {
    if (a.reason === b.reason) return 0;
    if (a.reason === 'same therapist') return -1;
    if (b.reason === 'same therapist') return 1;
    if (a.reason === 'same gender') return -1;
    if (b.reason === 'same gender') return 1;
    return 0;
  });

  // Sort by proximity to original slot time, then by reason
  allSlots.sort((a, b) => {
    const aDist = Math.abs(timeToMinutes(a.slot) - timeToMinutes(originalSlot));
    const bDist = Math.abs(timeToMinutes(b.slot) - timeToMinutes(originalSlot));
    if (aDist !== bDist) return aDist - bDist;
    // Priority: same therapist > same gender > other
    const reasonRank = (r: string) => r === 'same therapist' ? 0 : r === 'same gender' ? 1 : 2;
    return reasonRank(a.reason) - reasonRank(b.reason);
  });

  return allSlots;
}
