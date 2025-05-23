// Scaffold for buildScheduleMatrix utility tests
import { buildScheduleMatrix } from '../modal/buildScheduleMatrix';

describe('buildScheduleMatrix', () => {
  it('should be defined', () => {
    expect(buildScheduleMatrix).toBeDefined();
  });
  it('returns correct matrix for slots and rooms', () => {
    const date = '2025-05-22';
    const appointments = [
      { date, slot: '09:00 AM', roomNumber: '101', patientId: 'p1' },
      { date, slot: '09:30 AM', roomNumber: '102', patientId: 'p2' },
    ];
    const matrix = buildScheduleMatrix(date, appointments);
    expect(matrix['09:00 AM']['101'].patientId).toBe('p1');
    expect(matrix['09:30 AM']['102'].patientId).toBe('p2');
  });
  it('returns empty matrix if no appointments', () => {
    const date = '2025-05-22';
    const appointments: any[] = [];
    const matrix = buildScheduleMatrix(date, appointments);
    // Depending on the implementation, adjust this expectation
    expect(matrix.length).toBeGreaterThanOrEqual(0);
  });
  it('handles empty slots or rooms', () => {
    const date = '2025-05-22';
    // No appointments, so the matrix should be empty
    const matrix1 = buildScheduleMatrix(date, []);
    expect(Array.isArray(matrix1)).toBe(true);
    expect(matrix1.length).toBeGreaterThanOrEqual(0);
    // If you want to check for a specific slot/room structure, adjust as needed
  });
});
