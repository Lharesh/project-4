import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

// Types
export interface Therapist {
  id: string;
  name: string;
  gender: 'male' | 'female';
}

export interface Room {
  id: string;
  name: string;
}

export interface Booking {
  id: string;
  date: string;
  slot: string;
  time?: string;
  roomId: string;
  therapistIds: string[];
  clientId: string;
}

export interface Booking {
  id: string;
  date: string;
  slot: string;
  roomId: string;
  therapistIds: string[];
  clientId: string;
}

export type TherapistAvailability = {
  [therapistId: string]: {
    [date: string]: string[];
  };
};

export type RoomAvailability = {
  [roomId: string]: {
    [date: string]: string[];
  };
};

// Initial mock data
const initialState = {
  therapists: [
    { id: 't1', name: 'Ms. Priya', gender: 'female' },
    { id: 't2', name: 'Mr. Raj', gender: 'male' },
    { id: 't3', name: 'Mr. Nithin', gender: 'male' },
    { id: 't4', name: 'Ms. Anjali', gender: 'female' },
  ] as Therapist[],
  rooms: [
    { id: 'r1', name: 'Room 1 (Therapy)' },
    { id: 'r2', name: 'Room 2 (Therapy)' },
    { id: 'r3', name: 'Room 3 (Therapy)' },
  ] as Room[],
  therapistAvailability: {
    t1: {
      // Monday (weekly off, but admin can book)
      '2025-05-19': [],
      // Tuesday to Sunday (all slots open)
      '2025-05-20': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-21': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-22': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-23': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-24': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-25': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
    },
    t2: {
      '2025-05-19': [],
      '2025-05-20': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-21': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-22': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-23': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-24': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-25': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
    },
    t3: {
      '2025-05-19': [],
      '2025-05-20': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-21': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-22': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-23': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-24': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-25': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
    },
    t4: {
      '2025-05-19': [],
      '2025-05-20': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-21': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-22': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-23': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-24': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
      '2025-05-25': ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','15:00','16:00','17:00','18:00'],
    },
  } as TherapistAvailability,
  roomAvailability: {
    room1: {
      '2025-05-20': ['07:00', '08:00', '09:00', '10:00', '15:00'],
      '2025-05-21': ['07:00', '08:00', '09:00', '10:00', '11:00'],
      '2025-05-22': ['07:00', '08:00', '09:00', '10:00', '15:00'],
    },
    room2: {
      '2025-05-20': ['07:00', '08:00', '09:00', '10:00', '15:00'],
      '2025-05-21': ['07:00', '08:00', '09:00', '10:00', '16:00'],
      '2025-05-22': ['07:00', '08:00', '09:00', '10:00', '12:00'],
    },
    room3: {
      '2025-05-20': ['09:00', '10:00', '11:00', '12:00'],
      '2025-05-21': ['09:00', '10:00', '11:00'],
      '2025-05-22': ['09:00', '10:00', '11:00'],
    },
  } as RoomAvailability,

};

const scheduleTherapySlice = createSlice({
  name: 'scheduleTherapy',
  initialState,
  reducers: {
    // You can add more reducers as needed
  },
});


export const selectTherapists = (state: RootState) => state.scheduleTherapy.therapists;
export const selectRooms = (state: RootState) => state.scheduleTherapy.rooms;
export const selectTherapistAvailability = (state: RootState) => state.scheduleTherapy.therapistAvailability;
export const selectRoomAvailability = (state: RootState) => state.scheduleTherapy.roomAvailability;

// Selector to get therapy bookings from the appointments slice
export const selectTherapyBookings = (state: RootState) =>
  state.appointments.appointments
    .filter(a => a.tab === 'Therapy')
    .map(a => ({
      id: a.id,
      date: a.date,
      slot: a.time,
      roomId: a.roomNumber,
      therapistIds: a.therapistIds || [],
      clientId: a.clientId,
    }));

// DEPRECATED: All logic moved to setupSlice and selectors.
// This file is retained only for legacy reducer compatibility.
const emptyReducer = (state = {}) => state;
export default emptyReducer;
