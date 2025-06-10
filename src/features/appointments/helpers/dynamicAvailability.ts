import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { getAvailableSlotsForEntity } from './availabilityUtils';

interface DynamicAvailabilityParams {
  entities: any[];
  entityType: 'therapist' | 'room';
  date: string;
  appointments: any[];
  clinicTimings: any;
  slotDuration: number;
}

export function addDynamicAvailability({
  entities = [],
  entityType,
  date,
  appointments,
  clinicTimings,
  slotDuration,
}: DynamicAvailabilityParams) {
  return (entities || []).map(entity => {
    // Map roomNumber for rooms if missing
    let mappedEntity = { ...entity };
    if (entityType === 'room') {
      if (!('roomNumber' in mappedEntity)) {
        mappedEntity.roomNumber = mappedEntity.id;
      }
    }
    // Add empty availability for therapists if missing
    if (entityType === 'therapist') {
      if (!('availability' in mappedEntity)) {
        mappedEntity.availability = {};
      }
    }
    return {
      ...mappedEntity,
      availability: {
        [date]: getAvailableSlotsForEntity({
          entityId: mappedEntity.id,
          entityType,
          date,
          appointments,
          clinicTimings,
          slotDuration,
        }),
      },
    };
  });
}
