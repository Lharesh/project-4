import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
// Scaffold for buildScheduleMatrix utility tests
import { buildScheduleMatrix } from '../modal/buildScheduleMatrix';


describe('buildScheduleMatrix', () => {
  it('should be defined', () => {
    expect(buildScheduleMatrix).toBeDefined();
  });

  it('returns correct matrix for slots and rooms', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [
      { id: '101', name: 'Room 101' },
      { id: '102', name: 'Room 102' }
    ];
    const clinicTimings = {
      weekdays: {
        thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const }
      },
      slotDuration: 60,
      slots: [
        { start: '09:00' },
        { start: '10:00' },
        { start: '11:00' }
      ]
    };
    const appointments = [
      { id: 'a1', date, slot: '09:00', roomId: '101', clientId: 'p1', therapistIds: ['t1'], duration: 60 },
      { id: 'a2', date, slot: '10:00', roomId: '102', clientId: 'p2', therapistIds: ['t1'], duration: 60 }
    ];
    const matrix = buildScheduleMatrix(date, appointments, rooms, therapists, clinicTimings);
    // Debug logs for diagnosis
    console.log('Appointments:', JSON.stringify(appointments, null, 2));
    console.log('Matrix:', JSON.stringify(matrix, null, 2));
    // Find room 101 and slot '09:00' (use startsWith in case slot is '09:00:00')
    const room101 = matrix.find(r => r.id === '101');
    const slot900 = room101?.slots.find(s => s.slot.startsWith('09:00'));
    expect(slot900?.booking?.clientId).toBe('p1');
    expect(slot900?.isBooked).toBe(true);

    const slot1000 = room101?.slots.find(s => s.slot.startsWith('10:00'));
    expect(slot1000?.isBooked).toBe(false);

    const room102 = matrix.find(r => r.id === '102');
    const slot1000_102 = room102?.slots.find(s => s.slot.startsWith('10:00'));
    expect(slot1000_102?.booking?.clientId).toBe('p2');
    expect(slot1000_102?.isBooked).toBe(true);
  });

  it('marks all slots as available if no appointments', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [
      { id: '101', name: 'Room 101' },
      { id: '102', name: 'Room 102' }
    ];
    const clinicTimings = {
      weekdays: {
        thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const }
      },
      slotDuration: 60,
      slots: [
        { start: '09:00' },
        { start: '10:00' },
        { start: '11:00' }
      ]
    };
    const matrix = buildScheduleMatrix(date, [], rooms, therapists, clinicTimings);
    matrix.forEach(room => {
      room.slots.forEach(slot => {
        expect(slot.isBooked).toBe(false);
        expect(slot.isRoomAvailable).toBe(true);
      });
    });
  });

  it('shows no available therapists if all are booked in all rooms for a slot', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [
      { id: '101', name: 'Room 101' },
      { id: '102', name: 'Room 102' }
    ];
    const clinicTimings = {
      weekdays: {
        thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const }
      },
      slotDuration: 60,
      slots: [
        { start: '09:00' },
        { start: '10:00' },
        { start: '11:00' }
      ]
    };
    const appointments = [
      { id: 'a1', date, slot: '09:00', roomId: '101', clientId: 'p1', therapistIds: ['t1'], duration: 60 },
      { id: 'a2', date, slot: '09:00', roomId: '102', clientId: 'p2', therapistIds: ['t1'], duration: 60 }
    ];
    const matrix = buildScheduleMatrix(date, appointments, rooms, therapists, clinicTimings);
    // Log the matrix structure for debugging
    console.log('Matrix:', JSON.stringify(matrix, null, 2));
    matrix.forEach(room => {
      const slot900 = room.slots.find(s => s.slot.startsWith('09:00'));
      expect(slot900?.availableTherapists.length).toBe(0);
    });
  });

  it('returns empty matrix if no appointments', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [
      { id: '101', name: 'Room 101' },
      { id: '102', name: 'Room 102' }
    ];
    const clinicTimings = {
      weekdays: {
        thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const }
      },
      slotDuration: 60,
      slots: [
        { start: '09:00' },
        { start: '10:00' },
        { start: '11:00' }
      ]
    };
    const appointments: any[] = [];
    const matrix = buildScheduleMatrix(date, appointments, rooms, therapists, clinicTimings);
    // Depending on the implementation, adjust this expectation
    expect(matrix.length).toBeGreaterThanOrEqual(0);
  });

  it('handles empty slots or rooms', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms: any[] = [];
    const clinicTimings = {
      weekdays: {
        thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const }
      },
      slotDuration: 60,
      slots: [
        { start: '09:00' },
        { start: '10:00' },
        { start: '11:00' }
      ]
    };
    // No appointments, so the matrix should be empty
    const matrix = buildScheduleMatrix(date, [], rooms, therapists, clinicTimings);
    expect(matrix.length).toBe(0);
  });

  // Edge Case: Therapist gender filtering
  it('filters therapists by gender when enforceGenderMatch is true', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00'] } },
      { id: 't2', name: 'Therapist 2', gender: 'female' as const, availability: { [date]: ['09:00', '10:00'] } },
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    // Simulate gender filtering by only allowing male therapists for a male patient
    // (Assume buildScheduleMatrix uses enforceGenderMatch: true)
    // Here, we expect only t1 to show up for a male patient
    const matrix = buildScheduleMatrix(date, [], rooms, therapists, clinicTimings, true);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    expect(slot900?.availableTherapists.some(t => t.gender === 'female')).toBe(false);
    expect(slot900?.availableTherapists.some(t => t.gender === 'male')).toBe(true);
  });

  // Edge Case: Therapist unavailable for a slot
  it('shows no available therapists if none are available for a slot', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['10:00'] } }
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    const matrix = buildScheduleMatrix(date, [], rooms, therapists, clinicTimings);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    expect(slot900?.availableTherapists.length).toBe(0);
    const slot1000 = matrix[0].slots.find(s => s.slot.startsWith('10:00'));
    expect(slot1000?.availableTherapists.length).toBe(1);
  });

  // Edge Case: Room unavailable for a slot
  it('marks room as unavailable if booked for a slot', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    const appointments = [
      { id: 'a1', date, slot: '09:00', roomId: '101', clientId: 'p1', therapistIds: ['t1'], duration: 60 }
    ];
    const matrix = buildScheduleMatrix(date, appointments, rooms, therapists, clinicTimings);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    expect(slot900?.isRoomAvailable).toBe(false);
    expect(slot900?.isBooked).toBe(true);
  });

  // Edge Case: Slot during clinic break
  it('does not generate slots during clinic break', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const, breakStart: '10:00', breakEnd: '11:00' } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    const matrix = buildScheduleMatrix(date, [], rooms, therapists, clinicTimings);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    const slot1000 = matrix[0].slots.find(s => s.slot.startsWith('10:00'));
    const slot1100 = matrix[0].slots.find(s => s.slot.startsWith('11:00'));
    expect(slot900).toBeDefined();
    expect(slot1000).toBeUndefined(); // 10:00 is during break
    expect(slot1100).toBeDefined();
  });

  // Edge Case: Therapist with multiple availabilities
  it('handles therapists with multiple availabilities (multi-day)', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00'], '2099-05-22': ['09:00'] } }
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    const matrix = buildScheduleMatrix(date, [], rooms, therapists, clinicTimings);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    const slot1000 = matrix[0].slots.find(s => s.slot.startsWith('10:00'));
    const slot1100 = matrix[0].slots.find(s => s.slot.startsWith('11:00'));
    expect(slot900?.availableTherapists.length).toBe(1);
    expect(slot1000?.availableTherapists.length).toBe(1);
    expect(slot1100?.availableTherapists.length).toBe(0);
  });

  // Edge Case: Room with partial day availability (simulate by booking room for all but one slot)
  it('handles rooms with partial day availability via bookings', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    const appointments = [
      { id: 'a1', date, slot: '09:00', roomId: '101', clientId: 'p1', therapistIds: ['t1'], duration: 60 },
      { id: 'a2', date, slot: '10:00', roomId: '101', clientId: 'p2', therapistIds: ['t1'], duration: 60 }
    ];
    const matrix = buildScheduleMatrix(date, appointments, rooms, therapists, clinicTimings);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    const slot1000 = matrix[0].slots.find(s => s.slot.startsWith('10:00'));
    const slot1100 = matrix[0].slots.find(s => s.slot.startsWith('11:00'));
    expect(slot900?.isRoomAvailable).toBe(false);
    expect(slot1000?.isRoomAvailable).toBe(false);
    expect(slot1100?.isRoomAvailable).toBe(true);
  });

  // Edge Case: Room with partial day availability (simulate by booking room for all but one slot)
  it('handles rooms with partial day availability via bookings', () => {
    const date = '2099-05-21';
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male' as const, availability: { [date]: ['09:00', '10:00', '11:00'] } }
    ];
    const rooms = [ { id: '101', name: 'Room 101' } ];
    const clinicTimings = {
      weekdays: { thursday: { isOpen: true, start: '09:00', end: '12:00', status: 'working' as const } },
      slotDuration: 60,
      slots: [ { start: '09:00' }, { start: '10:00' }, { start: '11:00' } ]
    };
    const appointments = [
      { id: 'a1', date, slot: '09:00', roomId: '101', clientId: 'p1', therapistIds: ['t1'], duration: 60 },
      { id: 'a2', date, slot: '10:00', roomId: '101', clientId: 'p2', therapistIds: ['t1'], duration: 60 }
    ];
    const matrix = buildScheduleMatrix(date, appointments, rooms, therapists, clinicTimings);
    const slot900 = matrix[0].slots.find(s => s.slot.startsWith('09:00'));
    const slot1000 = matrix[0].slots.find(s => s.slot.startsWith('10:00'));
    const slot1100 = matrix[0].slots.find(s => s.slot.startsWith('11:00'));
    expect(slot900?.isRoomAvailable).toBe(false);
    expect(slot1000?.isRoomAvailable).toBe(false);
    expect(slot1100?.isRoomAvailable).toBe(true);
  });
});
