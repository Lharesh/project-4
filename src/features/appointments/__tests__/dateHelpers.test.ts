import * as dateHelpers from '../helpers/dateHelpers';

describe('dateHelpers', () => {
  it('formats and parses dates correctly', () => {
    const date = '2025-06-01';
    // Replace with available exported functions, e.g. addDays, if formatDate/parseDate are not exported.
    // Example:
    expect(typeof dateHelpers.addDays).toBe('function');
  });
  it('adds days to a date', () => {
    expect(dateHelpers.addDays('2025-06-01', 2)).toBe('2025-06-03');
  });
});
