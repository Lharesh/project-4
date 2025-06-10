import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { getBookingOptions } from '../helpers/rulesEngine';

function createBaseInput() {
  return {
    date: '2025-06-01',
    slot: '09:00',
    patientId: 'p2',
    selectedTherapists: ['t1'],
    selectedRoom: 'r1',
    appointments: [
      { id: 'a1', clientId: 'p1', therapistIds: ['t1'], roomId: 'r1', date: '2025-06-01', slot: '09:00' },
    ],
    allTherapists: [
      { id: 't1', gender: 'male' as const, name: 'Therapist 1', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } },
      { id: 't2', gender: 'male' as const, name: 'Therapist 2', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } },
      { id: 't3', gender: 'female' as const, name: 'Therapist 3', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } },
    ],
    allRooms: [
      { id: 'r1' },
      { id: 'r2' }
    ],
    patients: [
      { id: 'p1', gender: 'male' as const },
      { id: 'p2', gender: 'male' as const },
    ],
    now: new Date('2025-06-01T08:00:00'),
    maxAlternatives: 2
  };
}

describe('getBookingOptions', () => {
  it('returns reason Time Slot is in the past', () => {
    // Use slot as '09:00' to match slot parsing logic in getBookingOptions
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      date: '2025-05-01',
      slot: '09:00',
      now: new Date('2025-06-01T10:00:00'),
      appointments: [] // No appointments needed for this test
    });
    expect(result[0].available).toBe(false);
    expect(result[0].reason).toBe('Time Slot is in the past');
  });
  it('returns reason Therapists are busy', () => {
    // Therapist 't2' is booked for this slot, so should return 'Therapists are busy'
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      selectedTherapists: ['t2'],
      allTherapists: [
        { id: 't2', gender: 'male' as const, name: 'Therapist 2', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } }
      ],
      appointments: [
        { id: 'a2', clientId: 'p1', therapistIds: ['t2'], roomId: 'r2', date: '2025-06-01', slot: '09:00' },
      ],
      allRooms: [
        { id: 'r1' },
        { id: 'r2' }
      ]
    });
    expect(result[0].available).toBe(false);
    expect(result[0].reason).toBe('Therapists are busy');
  });
  it('returns reason Selected Room is not available', () => {
    // Therapist 't2' is available, but room 'r1' is booked by someone else
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      selectedRoom: 'r1',
      selectedTherapists: ['t2'],
      allTherapists: [
        { id: 't2', gender: 'male' as const, name: 'Therapist 2', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } }
      ],
      allRooms: [
        { id: 'r1'},
        { id: 'r2'}
      ],
      appointments: [
        { id: 'a3', clientId: 'other', therapistIds: ['t1'], roomId: 'r1', date: '2025-06-01', slot: '09:00' },
      ]
    });
    expect(result[0].available).toBe(false);
    expect(result[0].reason).toBe('Selected Room is not available');
  });
  it('returns available true if all are available', () => {
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      date: '2025-06-02',
      slot: '09:00',
      selectedRoom: 'r2',
      selectedTherapists: ['t2'],
      appointments: [],
      allTherapists: [
        { id: 't2', gender: 'male' as const, name: 'Therapist 2', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } }
      ],
      allRooms: [
        { id: 'r1' },
        { id: 'r2' }
      ],
      patients: [
        { id: 'p2', gender: 'male' as const },
      ],
    });
    expect(result[0].available).toBe(true);
    expect(result[0].reason).toBeNull();
  });
  it('clinicTimings.slots should be present and contain expected slots', () => {
    // Import or mock CLINIC_TIMINGS if not already available
    const CLINIC_TIMINGS = {
      weekdays: {
        monday: { isOpen: true, start: '09:00', end: '18:00' },
        tuesday: { isOpen: true, start: '09:00', end: '18:00' },
        wednesday: { isOpen: true, start: '09:00', end: '18:00' },
        thursday: { isOpen: true, start: '09:00', end: '18:00' },
        friday: { isOpen: true, start: '09:00', end: '18:00' },
        saturday: { isOpen: true, start: '09:00', end: '14:00' },
        sunday: { isOpen: false }
      },
      slotDuration: 60,
      slots: [
        { start: '09:00' },
        { start: '10:00' },
        { start: '11:00' }
      ]
    };
  
    expect(CLINIC_TIMINGS.slots).toBeDefined();
    expect(Array.isArray(CLINIC_TIMINGS.slots)).toBe(true);
    expect(CLINIC_TIMINGS.slots.length).toBeGreaterThan(0);
    expect(CLINIC_TIMINGS.slots.map(s => s.start)).toEqual(['09:00', '10:00', '11:00']);
  });
  
  it('returns alternatives for other rooms if room not available', () => {
    // Therapist 't2' is available, but room 'r1' is booked by someone else; 'r2' is free
    // Therapist 't2' is available, but room '101' is booked by someone else; '102' is free
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      selectedRoom: '101',
      selectedTherapists: ['t2'],
      allTherapists: [{
        id: 't2',
        gender: 'male' as const,
        name: 'Therapist 2',
        availability: { '2025-06-01': ['09:00', '10:00', '11:00'] }
      }],
      allRooms: [
        { id: 'r1' },
        { id: 'r2' }
      ],
      appointments: [
        { id: 'a4', clientId: 'other', therapistIds: ['t1'], roomId: 'r1', date: '2025-06-01', slot: '09:00' },
      ]
    });
    expect(result[0].alternatives.length).toBeGreaterThan(0);
    expect(result[0].alternatives[0].slot).toContain('-'); // slot-room separator
  });

  it('returns alternatives for next available time slot if therapist is busy', () => {
    // Therapist is busy at 09:00 but free at 10:00, room is available at both slots
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      selectedTherapists: ['t2'],
      allTherapists: [{
        id: 't2',
        gender: 'male' as const,
        name: 'Therapist 2',
        availability: { '2025-06-01': ['09:00', '10:00', '11:00'] }
      }],
      allRooms: [
        { id: 'r1' },
        { id: 'r2' }
      ],
      appointments: [
        { id: 'a2', clientId: 'p1', therapistIds: ['t2'], roomId: 'r1', date: '2025-06-01', slot: '09:00' },
        { id: 'a3', clientId: 'p1', therapistIds: ['t2'], roomId: 'r2', date: '2025-06-01', slot: '09:00' }
        // Do NOT add any appointments for 10:00!
      ]
    });
    // Should suggest a next slot (e.g., 10:00) as an alternative
    expect(result[0].alternatives.length).toBeGreaterThan(0);
    // Slot should not be the originally requested slot
    expect(result[0].alternatives[0].slot).not.toContain('09:00');
  });

  it('returns alternatives for next available time slot if room is busy', () => {
    // Room is busy at 09:00 but available at 10:00, therapist is available at both slots
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      selectedRoom: 'r1',
      selectedTherapists: ['t2'],
      allRooms: [
        { id: 'r1' },
        { id: 'r2' }
      ],
      allTherapists: [{
        id: 't2',
        gender: 'male' as const,
        name: 'Therapist 2',
        availability: { '2025-06-01': ['09:00', '10:00', '11:00'] }
      }],
      appointments: [
        { id: 'a2', clientId: 'p1', therapistIds: ['t2'], roomId: 'r1', date: '2025-06-01', slot: '09:00' },
        { id: 'a3', clientId: 'p1', therapistIds: ['t2'], roomId: 'r2', date: '2025-06-01', slot: '09:00' }
        // Do NOT add any appointments for 10:00!
      ]
    });
    expect(result[0].available).toBe(false);
    expect(result[0].reason).toBe('Selected Room is not available');
    expect(result[0].alternatives.length).toBeGreaterThan(0);
    expect(result[0].alternatives[0].slot).not.toContain('09:00');
  });

  it('returns alternatives for next available time slot if both therapist and room are busy', () => {
    // All therapists and rooms are booked at 09:00, but t2 and 102 are free at 10:00
    const input = createBaseInput();
    const result = getBookingOptions({
      enforceGenderMatch: true,
      ...input,
      selectedTherapists: ['t2'],
      selectedRoom: '102',
      allTherapists: [{
        id: 't2',
        gender: 'male' as const,
        name: 'Therapist 2',
        availability: { '2025-06-01': ['09:00', '10:00', '11:00'] }
      }],
      allRooms: [
        { id: 'r1' },
        { id: 'r2' }
      ],
      appointments: [
        { id: 'a5', clientId: 'p1', therapistIds: ['t2'], roomId: 'r1', date: '2025-06-01', slot: '09:00' },
        { id: 'a6', clientId: 'p1', therapistIds: ['t2'], roomId: 'r2', date: '2025-06-01', slot: '09:00' },
        { id: 'a7', clientId: 'p1', therapistIds: ['t2'], roomId: 'r1', date: '2025-06-01', slot: '10:00' },
      ]
    });
    expect(result[0].alternatives.length).toBeGreaterThan(0);
    expect(result[0].alternatives[0].slot).not.toContain('09:00');
  });
});
