import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import {
  getAvailableSlotsForEntity,
  isTherapistAvailable,
  isRoomAvailable,
  isPatientAvailable,
  getAvailableTherapists,
  getAvailableRooms,
  Therapist,
  Booking,
  Room,
  Patient,
  ClinicTimings
} from '../helpers/availabilityUtils';

describe('availabilityUtils', () => {
  const baseClinicTimings: ClinicTimings = {
    weekdays: {
      monday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' },
      tuesday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' },
      wednesday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' },
      thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' },
      friday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' },
      saturday: { isOpen: false, start: '09:00', end: '12:00', status: 'weekly_off' },
      sunday: { isOpen: false, start: '09:00', end: '12:00', status: 'holiday' }
    }
  };

  const therapist: Therapist = {
    id: 't1',
    name: 'Therapist 1',
    gender: 'male',
    availability: {
      '2099-05-24': ['09:00', '10:00'],
      '2099-05-25': ['09:00', '10:00', '11:00']
    }
  };
  const therapist2: Therapist = {
    id: 't2',
    name: 'Therapist 2',
    gender: 'female',
    availability: {
      '2099-05-25': ['09:00', '10:00']
    }
  };

  const room: Room = { id: 'r1', availability: { '2099-05-25': ['09:00', '10:00', '11:00'] } };
  const room2: Room = { id: 'r2', availability: { '2099-05-25': ['10:00', '11:00'] } };

  const appointments: Booking[] = [
    { id: 'a1', date: '2099-05-25', slot: '09:00', roomId: 'r1', clientId: 'p1', therapistIds: ['t1'] },
    { id: 'a2', date: '2099-05-25', slot: '10:00', roomId: 'r2', clientId: 'p2', therapistIds: ['t2'] }
  ];

  describe('getAvailableSlotsForEntity', () => {
    it('returns all available slots for a room on a working day', () => {
      const slots = getAvailableSlotsForEntity({
        entityId: 'r1',
        entityType: 'room',
        date: '2099-05-25',
        appointments: [],
        clinicTimings: baseClinicTimings,
        slotDuration: 60
      });
      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });
    it('excludes slots that are booked', () => {
      const slots = getAvailableSlotsForEntity({
        entityId: 'r1',
        entityType: 'room',
        date: '2099-05-25',
        appointments,
        clinicTimings: baseClinicTimings,
        slotDuration: 60
      });
      expect(slots).toEqual(['10:00', '11:00']);
    });
    it('returns empty array for holidays', () => {
      const slots = getAvailableSlotsForEntity({
        entityId: 'r1',
        entityType: 'room',
        date: '2099-05-30', // Sunday
        appointments: [],
        clinicTimings: baseClinicTimings,
        slotDuration: 60
      });
      expect(slots).toEqual([]);
    });
  });

  describe('isTherapistAvailable', () => {
    it('returns true if therapist is available and not booked', () => {
      expect(isTherapistAvailable(therapist, '2099-05-25', '11:00', appointments)).toBe(true);
    });
    it('returns false if therapist is booked for slot', () => {
      expect(isTherapistAvailable(therapist, '2099-05-25', '09:00', appointments)).toBe(false);
    });
    it('returns false if therapist is not in static availability', () => {
      expect(isTherapistAvailable(therapist, '2099-05-25', '12:00', appointments)).toBe(false);
    });
  });

  describe('isRoomAvailable', () => {
    it('returns true if room is available and not booked', () => {
      expect(isRoomAvailable(room, '2099-05-25', '11:00', appointments)).toBe(true);
    });
    it('returns false if room is booked for slot', () => {
      expect(isRoomAvailable(room, '2099-05-25', '09:00', appointments)).toBe(false);
    });
    it('returns false if room is not in static availability', () => {
      expect(isRoomAvailable(room, '2099-05-25', '12:00', appointments)).toBe(false);
    });
  });

  describe('isPatientAvailable', () => {
    it('returns true if patient is not booked for slot', () => {
      expect(isPatientAvailable('p3', '2099-05-25', '09:00', appointments)).toBe(true);
    });
    it('returns false if patient is booked for slot', () => {
      expect(isPatientAvailable('p1', '2099-05-25', '09:00', appointments)).toBe(false);
    });
  });

  describe('getAvailableTherapists', () => {
    it('returns therapists matching gender and available', () => {
      const therapists = getAvailableTherapists(
        [therapist, therapist2],
        'male',
        '2099-05-25',
        '10:00',
        appointments,
        true
      );
      expect(therapists.map(t => t.id)).toEqual(['t1']);
    });
    it('returns empty if none available for slot', () => {
      const therapists = getAvailableTherapists(
        [therapist, therapist2],
        'male',
        '2099-05-25',
        '12:00',
        appointments,
        true
      );
      expect(therapists).toEqual([]);
    });
  });

  describe('getAvailableRooms', () => {
    it('returns rooms available for slot', () => {
      const rooms = getAvailableRooms([room, room2], '2099-05-25', '11:00', appointments);
      expect(rooms.map(r => r.id)).toEqual(['r1', 'r2']);
    });
    it('returns empty if none available', () => {
      const rooms = getAvailableRooms([room], '2099-05-25', '12:00', appointments);
      expect(rooms).toEqual([]);
    });
  });
});
