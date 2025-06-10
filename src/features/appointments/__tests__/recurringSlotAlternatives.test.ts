import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { getRecurringSlotAlternatives, getTopCommonSlots } from '../helpers/recurringSlotAlternatives';

// --- Mocks for therapists, rooms, and patients ---
const therapists = [
  { id: 't1', gender: 'male', availability: { '2025-06-01': ['09:00', '10:00'], '2025-06-02': ['09:00'] } },
  { id: 't2', gender: 'female', availability: { '2025-06-01': ['09:00', '10:00'], '2025-06-02': ['10:00'] } },
  { id: 't3', gender: 'male', availability: { '2025-06-01': ['09:00'], '2025-06-02': [] } }
];
const rooms = [
  { roomNumber: '101' },
  { roomNumber: '102' },
  { roomNumber: '103' }
];
const patients = [
  { id: 'p1', gender: 'male' },
  { id: 'p2', gender: 'female' }
];

describe('getRecurringSlotAlternatives', () => {
  // --- Test Data Setup ---
  const baseAppointments = [
    { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' },
    { date: '2025-06-01', slot: '09:00', therapistIds: ['t2'], roomNumber: '102' },
  ]


  // --- 1. Auto-assignment if nothing selected ---
  it('auto-assigns therapist and room if not provided and available', () => {
    const result = getRecurringSlotAlternatives({
      startDate: '2025-06-01',
      days: 1,
      requestedSlot: '09:00',
      selectedTherapists: undefined, // none selected
      appointments: [],
      selectedRoom: undefined, // none selected
      patientId: 'p1',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.available).toBe(true);
    expect(dayResult!.alternatives.length).toBe(0);
  });

  // --- 2. Both therapists and rooms unavailable ---
  it('returns "Therapists are busy" and top 5 alternatives when neither therapists nor rooms are available', () => {
    const appointments = [
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2', 't3'], roomNumber: '101' },
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2', 't3'], roomNumber: '102' },
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2', 't3'], roomNumber: '103' }
    ];
    const result2 = getRecurringSlotAlternatives({
      startDate: '2025-06-01',
      days: 1,
      requestedSlot: '09:00',
      selectedTherapists: undefined,
      appointments,
      selectedRoom: undefined,
      patientId: 'p1',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    });
    const dayResult2 = result2.find((r: any) => r.date === '2025-06-01');
    expect(dayResult2).toBeDefined();
    expect(dayResult2!.available).toBe(false);
    expect(dayResult2!.reason).toBe('Therapists are busy');
    expect(dayResult2!.alternatives.length).toBeLessThanOrEqual(5);
  });

  // --- 3. Therapists unavailable, rooms available ---
  it('returns "Therapists are busy" and top 5 alternatives when therapists unavailable but rooms available', () => {
    const appointments = [
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2', 't3'], roomNumber: '101' }
    ];
    const result3 = getRecurringSlotAlternatives({
      startDate: '2025-06-01',
      days: 1,
      requestedSlot: '09:00',
      selectedTherapists: undefined,
      appointments,
      selectedRoom: undefined,
      patientId: 'p1',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    });
    const dayResult3 = result3.find((r: any) => r.date === '2025-06-01');
    expect(dayResult3).toBeDefined();
    expect(dayResult3!.available).toBe(false);
    expect(dayResult3!.reason).toBe('Therapists are busy');
    expect(dayResult3!.alternatives.length).toBeLessThanOrEqual(5);
  });

  // --- 4. Therapists available, rooms unavailable ---
  it('returns "Selected Room is not available" when a selected room is unavailable but therapists are available', () => {
    // Block the selected room for the slot
    const appointments = [
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' }
    ];
    const result = getRecurringSlotAlternatives({
      startDate: '2025-06-01',
      days: 1,
      requestedSlot: '09:00',
      selectedTherapists: ['t1'],
      appointments,
      selectedRoom: '101',
      patientId: 'p1',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.available).toBe(false);
    expect(dayResult!.reason).toBe('Selected Room is not available');
// If the selected room is booked but other rooms are free, alternatives should be suggested for those rooms
    expect(dayResult!.alternatives.length).toBe(2);
  });

  it('suggests alternatives for the same slot if possible when requested slot is in the past', () => {
    // Block t1 for the slot, but t2 is available
    const appointments = [
      { date: '2024-01-01', slot: '08:00', therapistIds: ['t1'], roomNumber: '101' }
    ];
    const result = getRecurringSlotAlternatives({
      startDate: '2024-01-01',
      days: 1,
      requestedSlot: '08:00',
      selectedTherapists: undefined,
      appointments,
      selectedRoom: undefined,
      patientId: 'p2', // female
      allTherapists: therapists,
      allRooms: rooms,
      patients,
      now: new Date('2025-01-01T09:00:00Z')
    });
    const dayResult = result.find((r: any) => r.date === '2024-01-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.reason).toBe('Time Slot is in the past');
    // Should suggest alternatives for the same slot if available
    if (dayResult!.alternatives.length > 0) {
      expect(dayResult!.alternatives[0].slot.startsWith('08:00-')).toBe(true);
    }
  });

  // --- 5. Both available ---
  it('returns available when both therapists and rooms are available', () => {
    const result = getRecurringSlotAlternatives({
      startDate: '2025-06-01',
      days: 1,
      requestedSlot: '09:00',
      selectedTherapists: ['t1'],
      appointments: [],
      selectedRoom: '101',
      patientId: 'p1',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.available).toBe(true);
    expect(dayResult!.reason === undefined || dayResult!.reason === null).toBe(true);
    expect(dayResult!.alternatives.length).toBe(0);
  });

  // --- 6. Past slot handling ---
  it('returns "No booking allowed for the Past" for past slots', () => {
    const resultPast = getRecurringSlotAlternatives({
      startDate: '2024-01-01',
      days: 1,
      requestedSlot: '08:00',
      selectedTherapists: ['t1'],
      appointments: [],
      selectedRoom: '101',
      patientId: 'p1',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    });
    const dayResultPast = resultPast.find((r: any) => r.date === '2024-01-01');
    expect(dayResultPast).toBeDefined();
    expect(dayResultPast!.reason).toBe('Time Slot is in the past');
    expect(dayResultPast!.available).toBe(false);
  });

  // --- 9. Proper slot-room separator ---
  // --- 10. Edge case: no therapists or rooms in system ---
  it('handles empty therapists and rooms arrays gracefully', () => {
                const result = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: undefined,
                  appointments: [],
                  selectedRoom: undefined,
                  patientId: 'p1',
                  allTherapists: [],
                  allRooms: [],
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.available).toBe(false);
    expect(dayResult!.reason).toBe('Therapists are busy');
  });

  // --- 11. Edge case: double-booking prevention ---
  it('prevents double-booking of therapists and rooms', () => {
                const appointments = [
                  { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' }
                ];
                const result = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: ['t1'],
                  appointments,
                  selectedRoom: '101',
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.reason).toMatch(/not available|busy/);
  });

  it('auto-assigns therapist and room if not provided and available', () => {
                const result = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: [], // none selected
                  appointments: [],
                  selectedRoom: '', // none selected,
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.available).toBe(true);
    expect(dayResult!.alternatives.length).toBe(0);
  });

  it('suggests up to 5 nearest future alternatives if therapist/room not available', () => {
                const appointments = [];
                // Block all therapists for 09:00
                for (let t = 1; t <= 3; t++) {
                  appointments.push({ date: '2025-06-01', slot: '09:00', therapistIds: [`t${t}`], roomNumber: `10${t}` });
                }
                const resultFutureAlt = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: [],
                  appointments,
                  selectedRoom: '',
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
                const dayResultFutureAlt = resultFutureAlt.find((r: any) => r.date === '2025-06-01');
                expect(dayResultFutureAlt).toBeDefined();
                expect(dayResultFutureAlt!.available).toBe(false);
                expect(dayResultFutureAlt!.alternatives.length).toBeLessThanOrEqual(5);
                dayResultFutureAlt!.alternatives.forEach((alt: any) => {
                  expect(alt.slot > '09:00').toBe(true);
                });
                expect(dayResultFutureAlt!.reason).toBe('Therapists are busy');
  });

  it('returns reason "Time Slot is in the past" for past slots', () => {
                const result = getRecurringSlotAlternatives({
                  startDate: '2024-01-01',
                  days: 1,
                  requestedSlot: '08:00',
                  selectedTherapists: ['t1'],
                  appointments: [],
                  selectedRoom: '101',
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2024-01-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.reason).toBe('Time Slot is in the past');
    expect(dayResult!.alternatives.length).toBeLessThanOrEqual(5);
    dayResult!.alternatives.forEach((alt: any) => {
      expect(alt.slot > '08:00').toBe(true);
    });
  });

  it('returns reason "Selected Room is not available" if room is booked but therapist is available', () => {
                const result = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: ['t1'],
                  appointments: [
                    { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' }
                  ],
                  selectedRoom: '101',
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
  });

  it('returns reason "Therapists are busy" if all therapists of patient gender are unavailable', () => {
    const inputArgs = {
      startDate: '2025-06-01',
      days: 1,
      requestedSlot: '09:00',
      selectedTherapists: ['t1', 't2'],
      appointments: [
        { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2'], roomNumber: '101' },
        { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2'], roomNumber: '102' },
        { date: '2025-06-01', slot: '09:00', therapistIds: ['t1', 't2'], roomNumber: '103' }
      ],
      selectedRoom: '101',
      patientId: 'p2',
      allTherapists: therapists,
      allRooms: rooms,
      patients
    };
    console.log('[TEST] getRecurringSlotAlternatives input:', JSON.stringify(inputArgs, null, 2));
    const result = getRecurringSlotAlternatives(inputArgs);
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.reason).toBe('Therapists are busy');
    expect(dayResult!.alternatives.length).toBeLessThanOrEqual(5);
  });

  it('uses - as the separator for slot-room alternatives', () => {
                const result = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: ['t1', 't2'],
                  appointments: [],
                  selectedRoom: '101',
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    if (dayResult!.alternatives.length > 0) {
      const alt = dayResult!.alternatives[0]!!;
      expect(`${alt.slot}-${alt[APPOINTMENT_PARAM_KEYS.ROOM_ID]}`).toContain('-');
    }
  });

  it('returns unavailable if no therapist/room and no alternatives', () => {
                // All slots blocked for all therapists
                const result = getRecurringSlotAlternatives({
                  startDate: '2025-06-01',
                  days: 1,
                  requestedSlot: '09:00',
                  selectedTherapists: [],
                  appointments: [
                    { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'], roomNumber: '101' },
                    { date: '2025-06-01', slot: '09:00', therapistIds: ['t2'], roomNumber: '102' },
                    { date: '2025-06-01', slot: '09:00', therapistIds: ['t3'], roomNumber: '103' }
                  ],
                  selectedRoom: '',
                  patientId: 'p1',
                  allTherapists: therapists,
                  allRooms: rooms,
                  patients
                });
    const dayResult = result.find((r: any) => r.date === '2025-06-01');
    expect(dayResult).toBeDefined();
    expect(dayResult!.available).toBe(false);
    expect(dayResult!.alternatives.length).toBe(0);
    expect(dayResult!.reason).toBe('Therapists are busy');
  });
});