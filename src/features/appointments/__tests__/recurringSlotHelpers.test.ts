import { checkTherapistsAvailability, checkRoomsAvailability, getTopCommonSlots } from '../helpers/recurringSlotAlternatives';

describe('checkTherapistsAvailability', () => {
  const allTherapists = [
    { id: 't1', gender: 'male', availability: { '2025-06-01': ['09:00', '10:00', '11:00'] } },
    { id: 't2', gender: 'female', availability: { '2025-06-01': ['09:00', '10:00'] } },
    { id: 't3', gender: 'male', availability: { '2025-06-01': ['10:00', '11:00'] } },
  ];
  const appointments = [
    { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' }
  ];

  it('returns available selected therapists and slots', () => {
    const result = checkTherapistsAvailability({
      selectedTherapists: ['t1'],
      requestedSlot: '09:00',
      dateVal: '2025-06-01',
      appointments: [],
      patientGender: 'male',
      allTherapists
    });
    expect(result.therapists).toEqual(['t1']);
    expect(result.slots).toContain('09:00');
  });

  it('returns other therapists of same gender if selected not available', () => {
    // Book t1 at 10:00 so only t3 is available at 10:00
    const busyAppointments = [
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' },
      { date: '2025-06-01', slot: '10:00', therapistIds: ['t1'], roomNumber: '101' }
    ];
    const result = checkTherapistsAvailability({
      selectedTherapists: ['t1'],
      requestedSlot: '10:00',
      dateVal: '2025-06-01',
      appointments: busyAppointments,
      patientGender: 'male',
      allTherapists
    });
    // Now only t3 is available at 10:00
    expect(result.therapists).toEqual(['t3']);
    expect(result.slots).toContain('10:00');
  });

  it('returns empty therapists and up to 10 alternative slots if none available', () => {
    const result = checkTherapistsAvailability({
      selectedTherapists: ['t1'],
      requestedSlot: '08:00',
      dateVal: '2025-06-01',
      appointments,
      patientGender: 'male',
      allTherapists
    });
    expect(result.therapists).toEqual([]);
    expect(result.slots.length).toBeLessThanOrEqual(10);
  });

  it('auto-assigns if no therapist selected and any therapist is available', () => {
    const result = checkTherapistsAvailability({
      selectedTherapists: undefined,
      requestedSlot: '10:00',
      dateVal: '2025-06-01',
      appointments: [],
      patientGender: 'male',
      allTherapists
    });
    expect(result.therapists).toEqual(['t1', 't3']);
    expect(result.slots).toContain('10:00');
  });
});

describe('checkRoomsAvailability', () => {
  const allRooms = ['101', '102', '103'];
  const appointments = [
    { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' },
    { date: '2025-06-01', slot: '09:00', therapistIds: ['t2'], roomNumber: '102' }
  ];

  it('returns available selected room and slots', () => {
    const result = checkRoomsAvailability({
      selectedRoom: '103',
      requestedSlot: '09:00',
      dateVal: '2025-06-01',
      appointments,
      allRooms
    });
    expect(result.rooms).toEqual(['103']);
    expect(result.slots).toContain('09:00');
  });

  it('returns other rooms if selected not available', () => {
    const result = checkRoomsAvailability({
      selectedRoom: '101',
      requestedSlot: '09:00',
      dateVal: '2025-06-01',
      appointments,
      allRooms
    });
    expect(result.rooms).toEqual(['103']);
    expect(result.slots).toContain('09:00');
  });

  it('returns empty rooms and up to 10 alternative slots if none available', () => {
    // Book all rooms at 08:00 so none are available
    const fullyBookedAppointments = [
      { date: '2025-06-01', slot: '08:00', therapistIds: ['t1'], roomNumber: '101' },
      { date: '2025-06-01', slot: '08:00', therapistIds: ['t2'], roomNumber: '102' },
      { date: '2025-06-01', slot: '08:00', therapistIds: ['t3'], roomNumber: '103' }
    ];
    const result = checkRoomsAvailability({
      selectedRoom: '101',
      requestedSlot: '08:00',
      dateVal: '2025-06-01',
      appointments: fullyBookedAppointments,
      allRooms
    });
    expect(result.rooms).toEqual([]);
    expect(result.slots.length).toBeLessThanOrEqual(10);
  });

  it('auto-assigns if no room selected and any room is available', () => {
    const result = checkRoomsAvailability({
      selectedRoom: undefined,
      requestedSlot: '09:00',
      dateVal: '2025-06-01',
      appointments,
      allRooms
    });
    expect(result.rooms).toContain('103');
    expect(result.slots).toContain('09:00');
  });
});

describe('getTopCommonSlots', () => {
  it('returns the top N sorted common slots between two arrays', () => {
    const arr1 = ['11:00', '10:00', '13:00', '12:00'];
    const arr2 = ['12:00', '13:00', '14:00'];
    const result = getTopCommonSlots(arr1, arr2, 2);
    expect(result).toEqual(['12:00', '13:00']);
  });

  it('returns an empty array if no common slots', () => {
    const arr1 = ['08:00', '09:00'];
    const arr2 = ['10:00', '11:00'];
    const result = getTopCommonSlots(arr1, arr2, 5);
    expect(result).toEqual([]);
  });
});
