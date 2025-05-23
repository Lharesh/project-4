import { hasPermission, Role } from '../hasPermission';

describe('hasPermission', () => {
  it('returns true for admin with all actions', () => {
    const actions = ["add", "edit", "delete", "upload", "download", "view", "clear"];
    actions.forEach(action => {
      expect(hasPermission('admin', action)).toBe(true);
    });
  });

  it('returns true for doctor with allowed actions, false for clear', () => {
    const allowed = ["add", "edit", "delete", "upload", "download", "view"];
    allowed.forEach(action => {
      expect(hasPermission('doctor', action)).toBe(true);
    });
    expect(hasPermission('doctor', 'clear')).toBe(false);
  });

  it('returns true for therapist only for view, false for others', () => {
    expect(hasPermission('therapist', 'view')).toBe(true);
    ["add", "edit", "delete", "upload", "download", "clear"].forEach(action => {
      expect(hasPermission('therapist', action)).toBe(false);
    });
  });

  it('returns false for patient for any action', () => {
    ["add", "edit", "delete", "upload", "download", "view", "clear"].forEach(action => {
      expect(hasPermission('patient', action)).toBe(false);
    });
  });
});
