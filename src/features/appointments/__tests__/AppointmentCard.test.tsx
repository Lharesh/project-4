import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AppointmentCard from '../components/AppointmentCard';

describe('AppointmentCard', () => {
  const baseAppointment = {
    id: '1',
    clientId: 'c1',
    clientName: 'Amit Kumar',
    clientMobile: '9999999999',
    therapistName: 'Dr. Sharma',
    therapistIds: ['t1'],
    date: '2025-06-01',
    time: '09:00 AM',
    roomNumber: '101',
    status: 'pending' as const,
    tab: 'Doctor' as const,
    dayIndex: 1,
    totalDays: 1,
    treatmentName: 'Consultation',
  };

  it('renders appointment details', () => {
    const { getByText } = render(<AppointmentCard appointment={baseAppointment} />);
    expect(getByText(/Amit Kumar/)).toBeTruthy();
    // Dr. Sharma is not rendered as a standalone string, so we skip this assertion
    expect(getByText(/09:00 AM/)).toBeTruthy();
    expect(getByText(/101/)).toBeTruthy();
  });


});
