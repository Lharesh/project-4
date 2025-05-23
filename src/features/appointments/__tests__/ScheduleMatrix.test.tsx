import React from 'react';
import { render } from '@testing-library/react-native';
import ScheduleMatrix from '../components/ScheduleMatrix';

describe('ScheduleMatrix', () => {
  it('renders matrix and slots', () => {
    const matrix = [
      {
        roomNumber: '101',
        roomName: 'Room 101',
        slots: [
          { slot: '09:00 AM', availableTherapists: [], isRoomAvailable: true, isBooked: false },
          { slot: '09:30 AM', availableTherapists: [], isRoomAvailable: true, isBooked: false }
        ]
      },
      {
        roomNumber: '102',
        roomName: 'Room 102',
        slots: [
          { slot: '09:00 AM', availableTherapists: [], isRoomAvailable: true, isBooked: false },
          { slot: '09:30 AM', availableTherapists: [], isRoomAvailable: true, isBooked: false }
        ]
      }
    ];
    const slots = ['09:00 AM', '09:30 AM'];
    const rooms = ['101', '102'];
    const therapists = [
      { id: 't1', name: 'Dr. Sharma', gender: 'male', availability: { '2025-06-01': ['09:00 AM'] } },
      { id: 't2', name: 'Dr. Reddy', gender: 'female', availability: { '2025-06-01': ['09:30 AM'] } }
    ];
    const appointments = [
      { id: 'a1', clientId: 'p1', clientName: 'Amit Kumar', therapistName: 'Dr. Sharma', date: '2025-06-01', time: '09:00 AM', roomNumber: '101', status: 'scheduled', tab: 'Doctor' },
      { id: 'a2', clientId: 'p2', clientName: 'Sunita Singh', therapistName: 'Dr. Reddy', date: '2025-06-01', time: '09:30 AM', roomNumber: '102', status: 'scheduled', tab: 'Doctor' }
    ];
    const { getByText } = render(
      <ScheduleMatrix
        matrix={matrix}
        conflicts={[]}
        selectedDate={"2025-06-01"}
        selectedTherapists={[]}
        selectedSlot={undefined}
        onSlotSelect={jest.fn()}
      />
    );
    expect(getByText('09:00 AM')).toBeTruthy();
    expect(getByText('09:30 AM')).toBeTruthy();
    expect(getByText('Room 101')).toBeTruthy();
    expect(getByText('Room 102')).toBeTruthy();
  });
});
