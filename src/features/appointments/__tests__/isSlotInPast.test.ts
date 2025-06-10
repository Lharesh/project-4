import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { isSlotInPast } from '../helpers/isSlotInPast';

describe('isSlotInPast', () => {
  it('returns true for past slots', () => {
    const now = new Date('2025-06-02T10:00:00');
    expect(isSlotInPast('2025-06-01', '09:00', now)).toBe(true);
  });
  it('returns false for future slots', () => {
    const now = new Date('2025-06-01T08:00:00');
    expect(isSlotInPast('2025-06-01', '09:00', now)).toBe(false);
  });
});
