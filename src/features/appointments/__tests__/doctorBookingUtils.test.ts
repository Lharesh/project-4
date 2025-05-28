import { getDoctorAvailableSlots, isDoctorAvailable, getNextAvailableDoctorSlots } from '../helpers/doctorBookingUtils';
import type { Appointment } from '../appointmentsSlice';

describe('doctorBookingUtils', () => {
  const doctor = {
    id: 'd1',
    name: 'Dr. A',
    availability: { '2099-06-01': ['09:00', '09:15', '09:30'] },
    consultationDuration: 15
  };
  const appointments: Appointment[] = [
    {
      id: 'a1',
      date: '2099-06-01',
            doctorId: 'd1',
            clientId: 'p1',
      clientName: 'Patient 1',
      time: '09:00',
      status: 'scheduled',
      tab: 'Doctor'
    },
    {
      id: 'a2',
      date: '2099-06-01',
            doctorId: 'd1',
            clientId: 'p2',
      clientName: 'Patient 2',
      time: '09:15',
      status: 'scheduled',
      tab: 'Doctor'
    }
  ];

  it('returns available slots for doctor', () => {
    expect(getDoctorAvailableSlots(doctor, '2099-06-01', appointments)).toEqual(['09:30']);
  });

  it('returns true if doctor is available for slot', () => {
    expect(isDoctorAvailable(doctor, '2099-06-01', '09:30', appointments)).toBe(true);
  });

  it('returns false if doctor is not available for slot', () => {
    expect(isDoctorAvailable(doctor, '2099-06-01', '09:15', appointments)).toBe(false);
  });

  it('returns next available slots for doctor', () => {
    const doctorAvailability = { d1: { '2099-06-01': ['09:00', '09:15', '09:30'] } };
    // Use a fixed date for 'now' to avoid timezone issues
    const now = new Date('2099-06-01T08:00:00');
    expect(getNextAvailableDoctorSlots('d1', '2099-06-01', appointments, doctorAvailability, now)).toEqual(['09:30']);
  });

  it('returns empty array if no slots available', () => {
    const doctorAvailability = { d1: { '2099-06-01': [] } };
    const now = new Date('2099-06-01T08:00:00');
    expect(getNextAvailableDoctorSlots('d1', '2099-06-01', appointments, doctorAvailability, now)).toEqual([]);
  });
});
