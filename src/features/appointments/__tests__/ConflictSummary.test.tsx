import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { render } from '@testing-library/react-native';
import ConflictSummary from '../components/ConflictSummary';

describe('ConflictSummary', () => {
  it('renders summary and details', () => {
    const conflicts = [
      { date: '2025-06-01', slot: '09:00 AM', therapistIds: ['t1'] },
      { date: '2025-06-01', slot: '09:30 AM', therapistIds: ['t2'] }
    ];
    const therapists = [
      { id: 't1', name: 'Dr. Sharma' },
      { id: 't2', name: 'Dr. Reddy' }
    ];
    const { getByText } = render(
      <ConflictSummary conflicts={conflicts} therapists={therapists} />
    );
    expect(getByText('Conflicts Detected:')).toBeTruthy();
    expect(getByText('2025-06-01 @ 09:00 AM: Dr. Sharma already booked')).toBeTruthy();
    expect(getByText('2025-06-01 @ 09:30 AM: Dr. Reddy already booked')).toBeTruthy();
  });
});
