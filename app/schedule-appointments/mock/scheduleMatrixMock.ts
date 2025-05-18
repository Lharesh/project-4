// scheduleMatrixMock.ts

// Mock: List of rooms
export const ROOMS = [
    { roomNumber: 'room1', name: 'Room 1 (Therapy)' },
    { roomNumber: 'room2', name: 'Room 2 (Therapy)' },
    { roomNumber: 'room3', name: 'Room 3 (Therapy)' },
  ];
  
  // Mock: List of patients
export const PATIENTS = [
  { id: 'p1', name: 'Anita', gender: 'female' },
  { id: 'p2', name: 'Rahul', gender: 'male' },
];

// Mock: List of therapists
export const THERAPISTS = [
  { id: 't1', name: 'Ms. Priya', gender: 'female' },
  { id: 't2', name: 'Mr. Raj', gender: 'male' },
  { id: 't3', name: 'Mr. Nithin', gender: 'male' },
  { id: 't4', name: 'Ms. Anjali', gender: 'female' },
];
  
  // Mock: Clinic timings (7:00-13:00, 15:00-18:00, Monday off)
  export const CLINIC_TIMINGS = {
    workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    weeklyOff: ['Monday'],
    slotDurationMinutes: 60,
    slots: [
      { start: '07:00', end: '08:00' },
      { start: '08:00', end: '09:00' },
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '12:00', end: '13:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
      { start: '17:00', end: '18:00' },
    ],
  };
  
  // Mock: Therapist availability (per day, per slot)
  export const THERAPIST_AVAILABILITY = {
  t1: { // Ms. Priya
    '2025-05-20': ['07:00', '08:00', '09:00', '15:00'],
    '2025-05-21': ['07:00', '08:00', '09:00', '10:00'],
    '2025-05-22': ['07:00', '09:00', '10:00', '15:00'],
  },
  t2: { // Mr. Raj
    '2025-05-20': ['07:00', '09:00', '10:00', '15:00'],
    '2025-05-21': ['08:00', '09:00', '11:00', '16:00'],
    '2025-05-22': ['07:00', '08:00', '09:00', '10:00', '12:00'],
  },
  t3: { // Mr. Nithin
    '2025-05-20': ['10:00', '11:00'],
    '2025-05-21': ['09:00', '10:00', '11:00'],
    '2025-05-22': ['15:00', '16:00'],
  },
  t4: { // Ms. Anjali
    '2025-05-20': ['08:00', '09:00'],
    '2025-05-21': ['07:00', '08:00', '10:00'],
    '2025-05-22': ['09:00', '10:00', '11:00'],
  },
};
  
  // Mock: Room availability (per day, per slot)
  export const ROOM_AVAILABILITY = {
    room1: {
      '2025-05-20': ['07:00', '08:00', '09:00', '10:00', '15:00'],
      '2025-05-21': ['07:00', '08:00', '09:00', '10:00', '11:00'],
      '2025-05-22': ['07:00', '08:00', '09:00', '10:00', '15:00'],
    },
    room2: {
      '2025-05-20': ['07:00', '08:00', '10:00', '16:00'],
      '2025-05-21': ['07:00', '09:00', '11:00', '15:00'],
      '2025-05-22': ['08:00', '09:00', '10:00', '12:00'],
    },
    room3: {
      '2025-05-20': ['09:00', '10:00', '11:00', '12:00'],
      '2025-05-21': ['08:00', '09:00', '10:00', '15:00'],
      '2025-05-22': ['07:00', '08:00', '09:00', '17:00'],
    },
  };
  
  // Mock: Existing bookings (to mark slots as unavailable)
  export const BOOKINGS = [
    {
      id: 'b1',
      date: '2025-05-20',
      slot: '07:00',
      roomNumber: 'room1',
      therapistIds: ['t1'] ,
      clientId: 'c1',
    },
    {
      id: 'b2',
      date: '2025-05-21',
      slot: '09:00',
      roomNumber: 'room2',
      therapistIds: ['t2'] ,
      clientId: 'c2',
    },
    // Add more bookings as needed for testing
  ];