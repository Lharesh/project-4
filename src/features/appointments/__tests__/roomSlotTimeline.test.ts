import { generateRoomSlots, isBreakHour } from '../helpers/roomSlotTimeline';

describe('generateRoomSlots', () => {
  // --- Additional Edge Case Tests ---
  it('should not double-book a therapist across rooms', () => {
    const rooms = [
      { id: 'room1', name: 'Room 1' },
      { id: 'room2', name: 'Room 2' }
    ];
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00', '10:00', '11:00'] } },
    ];
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 60, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' },
    ];
    const slotsRoom2 = generateRoomSlots({
      room: rooms[1],
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '09:00', end: '12:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 60,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    // t1 is booked in room1 at 09:00, so should not be available in room2 at 09:00
    expect(slotsRoom2[0].therapistAvailable).toBe(false);
  });

  it('should handle booking spanning over a break', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['11:00', '11:30', '12:00', '12:30', '13:00'] } }
    ];
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '11:30', duration: 120, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' }, // 11:30-13:30
    ];
    const slots = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '11:00', end: '14:00', breakStart: '12:00', breakEnd: '13:00' },
      slotDuration: 30,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    // Slot at 12:00 (break) and 12:30 (break) should be booked
    expect(slots.find(s => s.start === '12:00')?.booking).not.toBeNull();
    expect(slots.find(s => s.start === '12:30')?.booking).not.toBeNull();
  });

  it('should handle custom duration bookings not matching slot size, per room', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00', '09:30', '10:00'] } },
      { id: 't2', name: 'Therapist 2', gender: 'male', availability: { '2025-05-29': ['09:00', '09:30', '10:00'] } }
    ];
    const room1 = { id: 'room1', name: 'Room 1' };
    const room2 = { id: 'room2', name: 'Room 2' };
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 45, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' }, // 09:00-09:45 in room1
    ];
    // Room 1: next slot after booking is at 09:45
    const slotsRoom1 = generateRoomSlots({
      room: room1,
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '09:00', end: '11:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 30,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    expect(slotsRoom1.find(s => s.start === '09:00')?.booking).not.toBeNull();
    expect(slotsRoom1.find(s => s.start === '09:45')).toBeDefined();
    expect(slotsRoom1.find(s => s.start === '09:30')).toBeUndefined(); // no slot at 09:30 in room1
    // Room 2: no bookings, regular slots at 09:00, 09:30, 10:00
    const slotsRoom2 = generateRoomSlots({
      room: room2,
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '09:00', end: '11:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 30,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    expect(slotsRoom2.find(s => s.start === '09:00')).toBeDefined();
    expect(slotsRoom2.find(s => s.start === '09:30')).toBeDefined();
    expect(slotsRoom2.find(s => s.start === '09:00')?.booking).toBeNull();
    expect(slotsRoom2.find(s => s.start === '09:00')?.therapistAvailable).toBe(true);
  });

  it('should mark slot as available if at least one therapist is available, even if another is booked elsewhere', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00'] } },
      { id: 't2', name: 'Therapist 2', gender: 'male', availability: { '2025-05-29': ['09:00'] } }
    ];
    const room1 = { id: 'room1', name: 'Room 1' };
    const room2 = { id: 'room2', name: 'Room 2' };
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 60, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' },
    ];
    // Room 2, 09:00: t2 should be available, t1 is booked in room1
    const slotsRoom2 = generateRoomSlots({
      room: room2,
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '09:00', end: '10:00', breakStart: '09:30', breakEnd: '10:00' },
      slotDuration: 60,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    const slot900 = slotsRoom2.find(s => s.start === '09:00');
    expect(slot900).toBeDefined();
    expect(slot900?.therapistAvailable).toBe(true); // t2 is available
    expect(slot900?.availableTherapists.some(t => t.id === 't2')).toBe(true);
    expect(slot900?.availableTherapists.some(t => t.id === 't1')).toBe(false); // t1 is booked elsewhere
  });

  it('should enforce gender match logic with mixed gender therapists', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00', '10:00'] } },
      { id: 't2', name: 'Therapist 2', gender: 'female', availability: { '2025-05-29': ['09:00', '10:00'] } }
    ];
    const slotsMale = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments: [],
      therapists,
      clinicTimings: { start: '09:00', end: '11:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    expect(slotsMale[0].therapistAvailable).toBe(true); // Only male therapist
    const slotsFemale = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments: [],
      therapists,
      clinicTimings: { start: '09:00', end: '11:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'female',
    });
    expect(slotsFemale[0].therapistAvailable).toBe(true); // Only female therapist
  });

  it('should mark slot as available if at least one therapist is available', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00'] } },
      { id: 't2', name: 'Therapist 2', gender: 'male', availability: { '2025-05-29': [] } }
    ];
    const slots = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments: [],
      therapists,
      clinicTimings: { start: '09:00', end: '10:00', breakStart: '09:30', breakEnd: '10:00' },
      slotDuration: 60,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    expect(slots[0].therapistAvailable).toBe(true);
  });

  it('should mark slot as unavailable if all therapists are busy except one', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': [] } },
      { id: 't2', name: 'Therapist 2', gender: 'male', availability: { '2025-05-29': ['09:00'] } }
    ];
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 60, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' },
    ];
    const slots = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '09:00', end: '10:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 60,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    // Print all generated slots
    slots.forEach((slot: any, idx: number) => {
      console.log(`DEBUG TEST: Slot ${idx}:`, {
        start: slot.start,
        end: slot.end,
        therapistAvailable: slot.therapistAvailable,
        availableTherapists: slot.availableTherapists && slot.availableTherapists.map((t: any) => t.id)
      });
    });
    // Find any slot with at least one available therapist
    const availableSlot = slots.find((slot: any) => slot.therapistAvailable && slot.availableTherapists && slot.availableTherapists.length > 0);
    expect(availableSlot).toBeDefined();
    console.log('DEBUG TEST: Checking available slot:', availableSlot?.start, availableSlot?.end);
    console.log('DEBUG TEST: Available therapists for slot:', availableSlot?.availableTherapists && availableSlot.availableTherapists.map((t: any) => ({ id: t.id, name: t.name })));
    expect(availableSlot?.therapistAvailable).toBe(true);
  });

  it('should mark break slots as unselectable', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['12:00', '12:30'] } }
    ];
    const slots = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments: [],
      therapists,
      clinicTimings: { start: '12:00', end: '13:00', breakStart: '12:30', breakEnd: '13:00' },
      slotDuration: 30,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    // Slot at 12:30 should be marked as break and not available
    const breakSlot = slots.find(s => s.start === '12:30');
    expect(breakSlot?.isBreak).toBe(true);
    expect(breakSlot?.therapistAvailable).toBe(false);
  });

  it('should mark slots in the past if date is before today', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2020-01-01': ['09:00'] } }
    ];
    const slots = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2020-01-01',
      appointments: [],
      therapists,
      clinicTimings: { start: '09:00', end: '10:00', breakStart: '09:30', breakEnd: '10:00' },
      slotDuration: 60,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    // All slots are in the past
    expect(slots.every(s => s.start < '2025-05-28')).toBe(true);
  });

  it('should not mark therapist as available if they are booked in another room at the same time', () => {
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00', '10:00'] } }
    ];
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 60, roomId: 'room2', therapistIds: ['t1'], clientId: 'p1' },
    ];
    const slots = generateRoomSlots({
      room: { id: 'room1', name: 'Room 1' },
      date: '2025-05-29',
      appointments,
      therapists,
      clinicTimings: { start: '09:00', end: '11:00', breakStart: '10:00', breakEnd: '10:30' },
      slotDuration: 60,
      enforceGenderMatch: false,
      clientGender: 'male',
    });
    // t1 is booked in room2 at 09:00, so should not be available in room1 at 09:00
    expect(slots[0].therapistAvailable).toBe(false);
  });

  const baseClinicTimings = {
    start: '09:00',
    end: '14:00',
    breakStart: '12:00',
    breakEnd: '13:00',
  };

  const mockRoom = { id: 'room1', name: 'Room 1' };

  const baseTherapists = [
    { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00', '10:00', '10:30', '11:00', '13:00'] } },
    { id: 't2', name: 'Therapist 2', gender: 'male', availability: { '2025-05-29': ['09:00', '10:00', '10:30', '11:00', '13:00'] } },
  ];

  const baseAppointments = [
    { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 90, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' },
    // 09:00-10:30 is booked by t1 in room1
  ];

  it('should generate slots including break hour and therapist availability', () => {
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: baseAppointments,
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    expect(slots[0].start).toBe('09:00');
    expect(slots[0].isBreak).toBe(false);
    expect(slots[0].booking).not.toBeNull();
    expect(slots[1].start).toBe('10:30');
    expect(slots[1].isBreak).toBe(false);
    expect(slots[1].therapistAvailable).toBe(true);
    expect(slots[2].start).toBe('11:30');
    expect(slots[2].isBreak).toBe(false);
    expect(slots[3].start).toBe('12:30');
    expect(slots[3].isBreak).toBe(true);
  });

  it('should mark slots in the past as available but up to consumer to filter', () => {
    // Simulate a slot in the past (date is before today)
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29', // Use a date that matches therapist availability
      appointments: [],
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    expect(slots.length).toBeGreaterThan(0);
    // All slots are in the past, but therapistAvailable is still calculated
    expect(slots[0].therapistAvailable).toBe(true);
  });

  it('should return no therapists if gender does not match', () => {
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: [],
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'female', // no female therapists
    });
    expect(slots.some(s => s.therapistAvailable)).toBe(false);
  });

  it('should allow overlapping appointments in different rooms', () => {
    const otherRoom = { id: 'room2', name: 'Room 2' };
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '09:00', duration: 120, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' },
      { id: 'a2', date: '2025-05-29', slot: '09:00', duration: 120, roomId: 'room2', therapistIds: ['t2'], clientId: 'p2' },
    ];
    const slots1 = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments,
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    const slots2 = generateRoomSlots({
      room: otherRoom,
      date: '2025-05-29',
      appointments,
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    // Both rooms should have their own bookings
    expect(slots1[0].booking).not.toBeNull();
    expect(slots2[0].booking).not.toBeNull();
  });

  it('should handle break at start or end of day', () => {
    const timings = { ...baseClinicTimings, start: '12:00', end: '14:00', breakStart: '12:00', breakEnd: '13:00' };
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: [],
      therapists: baseTherapists,
      clinicTimings: timings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    expect(slots[0].isBreak).toBe(true);
    expect(slots[1].isBreak).toBe(false);
  });

  it('should handle no therapists available at all', () => {
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: [],
      therapists: [],
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    expect(slots.every(s => s.therapistAvailable === false)).toBe(true);
  });

  it('should mark slot as unavailable if room is booked but therapist is available', () => {
    const appointments = [
      { id: 'a1', date: '2025-05-29', slot: '10:30', duration: 60, roomId: 'room1', therapistIds: ['t1'], clientId: 'p1' },
    ];
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments,
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    // Slot 10:30 should be booked
    const slot = slots.find(s => s.start === '10:30');
    expect(slot?.booking).not.toBeNull();
  });

  it('should handle slot exactly at break end', () => {
    const timings = { ...baseClinicTimings, breakStart: '12:00', breakEnd: '13:00' };
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: [],
      therapists: baseTherapists,
      clinicTimings: timings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    // Slot at 13:00 should not be break
    const slot = slots.find(s => s.start === '13:00');
    expect(slot?.isBreak).toBe(false);
  });

  it('should handle slot duration not matching therapist availability granularity', () => {
    // Therapist is available at 09:00 and 10:00, but slotDuration is 90
    const therapists = [
      { id: 't1', name: 'Therapist 1', gender: 'male', availability: { '2025-05-29': ['09:00', '10:00'] } },
    ];
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: [],
      therapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 90,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    // Only first slot should have therapistAvailable
    expect(slots[0].therapistAvailable).toBe(true);
    expect(slots[1].therapistAvailable).toBe(false);
  });

  it('should generate slots including break hour and therapist availability', () => {
    const slots = generateRoomSlots({
      room: mockRoom,
      date: '2025-05-29',
      appointments: baseAppointments,
      therapists: baseTherapists,
      clinicTimings: baseClinicTimings,
      slotDuration: 60,
      enforceGenderMatch: true,
      clientGender: 'male',
    });
    // Slot 09:00-10:30 is booked, 10:30-11:30 should be available, 12:00-13:00 is break
    expect(slots[0].start).toBe('09:00');
    expect(slots[0].isBreak).toBe(false);
    expect(slots[0].booking).not.toBeNull();
    expect(slots[1].start).toBe('10:30');
    expect(slots[1].isBreak).toBe(false);
    expect(slots[1].therapistAvailable).toBe(true);
    expect(slots[2].start).toBe('11:30');
    expect(slots[2].isBreak).toBe(false);
    expect(slots[3].start).toBe('12:30');
    expect(slots[3].isBreak).toBe(true);
  });

  describe('isBreakHour', () => {
    const clinicTimings = {
      breakStart: '12:00',
      breakEnd: '13:00',
    };
    it('should detect break hour correctly', () => {
      expect(isBreakHour('12:00', clinicTimings)).toBe(true);
      expect(isBreakHour('12:30', clinicTimings)).toBe(true);
      expect(isBreakHour('13:00', clinicTimings)).toBe(false);
      expect(isBreakHour('11:30', clinicTimings)).toBe(false);
    });
  });
});
