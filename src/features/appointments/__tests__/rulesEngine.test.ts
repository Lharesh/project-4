import { canBookAppointment } from '../helpers/rulesEngine';

describe('canBookAppointment', () => {
  const appointments = [
    { patientId: 'p1', therapistIds: ['t1'], roomNumber: '101', date: '2025-06-01', slot: '09:00 AM' },
  ];
  it('returns false if therapist is not available', () => {
    const result = canBookAppointment({
      therapistIds: ['t1'],
      roomNumber: '101',
      date: '2025-06-01',
      slot: '09:00 AM',
      appointments,
      patientId: 'p2',
      therapistAvailability: { t1: { '2025-06-01': [] } },
      roomAvailability: { '101': { '2025-06-01': [] } },
    });
    expect(result).toBe(false);
  });
  it('returns true if all are available', () => {
    const result = canBookAppointment({
      therapistIds: ['t1'],
      roomNumber: '101',
      date: '2025-06-02',
      slot: '09:00 AM',
      appointments,
      patientId: 'p2',
      therapistAvailability: { t1: { '2025-06-02': ['09:00 AM'] } },
      roomAvailability: { '101': { '2025-06-02': ['09:00 AM'] } },
    });
    expect(result).toBe(true);
  });
});
