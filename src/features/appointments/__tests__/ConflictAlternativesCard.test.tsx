import React from 'react';
import { render } from '@testing-library/react-native';
import ConflictAlternativesCard from '../components/ConflictAlternativesCard';

describe('ConflictAlternativesCard', () => {
  it('renders alternatives and messages', () => {
    const alternatives = [
      { roomId: '102', slot: '09:00 AM', therapistId: 't2', reason: 'same therapist', roomName: 'Room 102', therapistName: 'Dr. Reddy' },
      { roomId: '101', slot: '09:30 AM', therapistId: 't1', reason: 'same gender', roomName: 'Room 101', therapistName: 'Dr. Sharma' }
    ];
    const conflict = { date: '2025-06-01', slot: '09:00 AM', therapistIds: ['t1', 't2'] };
    const { getByText } = render(
      <ConflictAlternativesCard
        conflict={conflict}
        alternatives={alternatives}
        onSelectAlternative={jest.fn()}
      />
    );
    expect(getByText('Conflict: 2025-06-01 @ 09:00 AM')).toBeTruthy();
    expect(getByText('09:00 AM | Room 102')).toBeTruthy();
    expect(getByText('09:30 AM | Room 101')).toBeTruthy();
  });
});
