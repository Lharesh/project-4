import { getClinicPath, getClinicStoragePath, normalizePhoneNumber, formatPhoneNumber } from '../pathing';

describe('pathing utils', () => {
  describe('getClinicPath', () => {
    it('returns path without subPath', () => {
      expect(getClinicPath('abc')).toBe('clinics/abc');
    });
    it('returns path with subPath', () => {
      expect(getClinicPath('abc', 'records')).toBe('clinics/abc/records');
    });
  });

  describe('getClinicStoragePath', () => {
    it('returns correct storage path', () => {
      expect(getClinicStoragePath('abc', 'file.txt')).toBe('storage/abc/file.txt');
    });
  });

  describe('normalizePhoneNumber', () => {
    it('removes non-numeric characters', () => {
      expect(normalizePhoneNumber('(123) 456-7890')).toBe('1234567890');
      expect(normalizePhoneNumber('+91-98765 43210')).toBe('919876543210');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats a 10-digit number', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });
    it('returns original if not 10 digits', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
      expect(formatPhoneNumber('+91-98765 43210')).toBe('+91-98765 43210');
    });
  });
});
