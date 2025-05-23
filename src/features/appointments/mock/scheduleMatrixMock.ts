// scheduleMatrixMock.ts
export const NON_WORKING_DAYS = [0, 6]; // Sunday, Saturday
export const MOCK_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM'];
export const CONSULT_TYPES = ['New', 'Follow Up'];
export const CONSULT_MODE = ['Walk-In', 'On-Line'];

// Mock Data
export const DOCTORS = [
  { id: '1', name: 'Dr. Sharma (Ayurvedic Physician)' },
  { id: '2', name: 'Dr. Gupta (Therapist)' },
];
// Mock: List of therapies
export const THERAPIES = [
  { id: 't1', name: 'Abhyanga', slotDuration: 60 },
  { id: 't2', name: 'Elakizhi', slotDuration: 60 },
  { id: 't3', name: 'Podikizhi', slotDuration: 60 },
  { id: 't4', name: 'Navarakizhi', slotDuration: 60 },
  { id: 't5', name: 'Shirodhara', slotDuration: 60 },
  { id: 't6', name: 'Udvartana', slotDuration: 60 },
  { id: 't7', name: 'Nasya', slotDuration: 60 },
  { id: 't8', name: 'Kati Basti', slotDuration: 60 },
  { id: 't9', name: 'Panchakarma', slotDuration: 60 },
  { id: 't10', name: 'Pizhichil', slotDuration: 60 },
  { id: 't11', name: 'Nasya', slotDuration: 60 },
  { id: 't12', name: 'Karna purana', slotDuration: 60 },
  { id: 't13', name: 'Akshi Tarpanam', slotDuration: 60 },
];

// Mock: List of rooms
export const ROOMS = [
    { roomNumber: '101', name: 'Room 101' },
    { roomNumber: '102', name: 'Room 102' },
    { roomNumber: '103', name: 'Room 103' },
    { roomNumber: 'r1', name: 'Room 1 (Therapy)' },
    { roomNumber: 'r2', name: 'Room 2 (Therapy)' },
    { roomNumber: 'r3', name: 'Room 3 (Therapy)' },
  ];
  
  // Mock: List of patients
export const PATIENTS = [
  { id: 'p1', name: 'Test Male', gender: 'male', mobile: '9876543210' },
  { id: 'p2', name: 'Rahul', gender: 'male', mobile: '9123456780' },
  { id: 'p3', name: 'Sunita Singh', gender: 'female', mobile: '9123456781' },
  { id: 'p4', name: 'Amit Kumar', gender: 'male', mobile: '9988776655' },
];

// Mock: List of therapists
export interface Therapist {
  id: string;
  name: string;
  gender: string;
  availability: { [key: string]: string[] };
}

export const THERAPISTS: Therapist[] = [
  {
    id: 't1',
    name: 'Test Male Therapist',
    gender: 'male',
    availability: {
      '2025-06-01': ['09:00'],
      '2025-05-20': ['07:00', '08:00', '09:00', '15:00'],
      '2025-05-21': ['07:00', '08:00', '09:00', '10:00'],
      '2025-05-22': ['07:00', '09:00', '10:00', '15:00'],
    }
  },
  {
    id: 't2',
    name: 'Test Female Therapist',
    gender: 'female',
    availability: {
      '2025-06-01': ['09:00'],
      '2025-05-20': ['07:00', '09:00', '10:00', '15:00'],
      '2025-05-21': ['08:00', '09:00', '11:00', '16:00'],
      '2025-05-22': ['07:00', '08:00', '09:00', '10:00', '12:00'],
    }
  },
  {
    id: 't3',
    name: 'Mr. Nithin',
    gender: 'male',
    availability: {
      '2025-05-20': ['10:00', '11:00'],
      '2025-05-21': ['09:00', '10:00', '11:00'],
      '2025-05-22': ['15:00', '16:00'],
    }
  },
  {
    id: 't4',
    name: 'Ms. Anjali',
    gender: 'female',
    availability: {
      '2025-05-20': ['08:00', '09:00'],
      '2025-05-21': ['07:00', '08:00', '10:00'],
      '2025-05-22': ['09:00', '10:00', '11:00'],
    }
  }
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
  
  // Mock: Room availability (per day, per slot)
  export const ROOM_AVAILABILITY = {
    r1: {
      '2025-05-20': ['07:00', '08:00', '09:00', '10:00', '15:00'],
      '2025-05-21': ['07:00', '08:00', '09:00', '10:00', '11:00'],
      '2025-05-22': ['07:00', '08:00', '09:00', '10:00', '15:00'],
    },
    r2: {
      '2025-05-20': ['07:00', '08:00', '10:00', '16:00'],
      '2025-05-21': ['07:00', '09:00', '11:00', '15:00'],
      '2025-05-22': ['08:00', '09:00', '10:00', '12:00'],
    },
    r3: {
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