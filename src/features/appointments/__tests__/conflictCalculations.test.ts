import { getRecurringConflicts } from '../helpers/conflictCalculations';

describe('getRecurringConflicts', () => {
  const appointments = [
    { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'] },
    { date: '2025-06-02', slot: '09:00', therapistIds: ['t2'] },
  ];
  const addDays = (date: string, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };
  it('finds recurring conflicts for given days and slot', () => {
    const result = getRecurringConflicts(appointments, '2025-06-01', 3, '09:00', ['t1', 't2'], addDays);
    expect(result).toEqual([
      { date: '2025-06-01', slot: '09:00', therapistIds: ['t1'] },
      { date: '2025-06-02', slot: '09:00', therapistIds: ['t2'] },
    ]);
  });
});
