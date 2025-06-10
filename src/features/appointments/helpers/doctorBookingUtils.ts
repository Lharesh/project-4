import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
// Doctor Appointment Booking Utilities
// Logic for checking doctor appointment availability and alternatives

import type { Appointment } from '../appointmentsSlice';

export interface DoctorBookingCheckInput {
  doctorId: string;
  date: string; // 'YYYY-MM-DD'
  slot: string; // 'HH:mm'
  appointments: Appointment[];
  patientId: string;
  doctorAvailability?: { [doctorId: string]: { [date: string]: string[] } };
  now?: Date;
}

export interface DoctorBookingResult {
  available: boolean;
  reason: string | null;
  alternatives: string[]; // next available slots (HH:mm)
}

const ALLOWED_REASONS = [
  'Time Slot is in the past',
  'Doctor is busy',
  'Patient is busy',
];

function isSlotInPast(dateStr: string, timeStr: string, now: Date): boolean {
  if (!dateStr || !timeStr) return false;
  const [slotHour, slotMinute] = timeStr.split(':').map(Number);
  const slotDateTime = new Date(dateStr);
  slotDateTime.setHours(slotHour, slotMinute, 0, 0);
  return slotDateTime <= now;
}

export function checkDoctorBooking({
  doctorId,
  date,
  slot,
  appointments,
  patientId,
  doctorAvailability = {},
  now = new Date(),
}: DoctorBookingCheckInput): DoctorBookingResult {
  // Only consider doctor appointments for conflicts
  appointments = appointments.filter(app => app.doctorId);

  // 1. Check if slot is in the past
  if (isSlotInPast(date, slot, now)) {
    // Suggest next available slots for doctor
    const alternatives = getNextAvailableDoctorSlots(doctorId, date, appointments, doctorAvailability, now, 5, slot);
    return {
      available: false,
      reason: 'Time Slot is in the past',
      alternatives,
    };
  }

  // 2. Check if doctor is double-booked
  const doctorBusy = appointments.some(
    (apt) => apt.doctorId === doctorId && apt.date === date && (apt.time === slot)
  );
  if (doctorBusy) {
    const alternatives = getNextAvailableDoctorSlots(doctorId, date, appointments, doctorAvailability, now, 5, slot);
    return {
      available: false,
      reason: 'Doctor is busy',
      alternatives,
    };
  }

  // 3. Check if patient is double-booked
  const patientBusy = appointments.some(
    (apt) => apt.clientId === patientId && apt.date === date && (apt.time === slot)
  );
  if (patientBusy) {
    const alternatives = getNextAvailableDoctorSlots(doctorId, date, appointments, doctorAvailability, now, 5, slot);
    return {
      available: false,
      reason: 'Patient is busy',
      alternatives,
    };
  }

  // 4. Check if doctor is available for this slot (by static availability)
  const availableSlots = doctorAvailability?.[doctorId]?.[date] || [];
  if (availableSlots.length > 0 && !availableSlots.includes(slot)) {
    // Doctor not available for this slot, suggest next available
    const alternatives = availableSlots.filter(s => s > slot).slice(0, 5);
    return {
      available: false,
      reason: 'Doctor is busy',
      alternatives,
    };
  }

  // 5. If all checks passed, booking is available
  return {
    available: true,
    reason: null,
    alternatives: [],
  };
}

export function getNextAvailableDoctorSlots(
  doctorId: string,
  date: string,
  appointments: Appointment[],
  doctorAvailability: { [doctorId: string]: { [date: string]: string[] } },
  now: Date,
  max: number = 5,
  afterSlot?: string
): string[] {
  // Use static availability if present, else generate 15-min slots from 09:00 to 18:00
  let slots: string[] = doctorAvailability?.[doctorId]?.[date] || generateDefaultDoctorSlots();
  // Remove slots in the past
  slots = slots.filter(slot => {
    const [h, m] = slot.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(h, m, 0, 0);
    return slotDate > now;
  });
  // Remove slots already booked
  const bookedSlots = appointments
    .filter(app => app.doctorId === doctorId && app.date === date)
    .map(app => app.time);
  slots = slots.filter(slot => !bookedSlots.includes(slot));
  // If afterSlot is provided, only show slots after it
  if (afterSlot) {
    slots = slots.filter(slot => slot > afterSlot);
  }
  return slots.slice(0, max);
}

function generateDefaultDoctorSlots(): string[] {
  // Generates 15-min slots from 09:00 to 18:00
  const slots: string[] = [];
  let hour = 9, minute = 0;
  while (hour < 18 || (hour === 18 && minute === 0)) {
    slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    minute += 15;
    if (minute === 60) {
      minute = 0;
      hour += 1;
    }
  }
  return slots;
}

// Returns available slots for a doctor on a given date, filtering out booked slots
export function getDoctorAvailableSlots(
  doctor: { id: string; availability: { [date: string]: string[] } },
  date: string,
  appointments: any[]
): string[] {
  const allSlots = doctor.availability?.[date] || [];
  const bookedSlots = appointments
    .filter(app => app.doctorId === doctor.id && app.date === date)
    .map(app => app.slot || app.time);
  return allSlots.filter(slot => !bookedSlots.includes(slot));
}

// Returns true if the doctor is available for a slot (not booked and in availability)
export function isDoctorAvailable(
  doctor: { id: string; availability: { [date: string]: string[] } },
  date: string,
  slot: string,
  appointments: any[]
): boolean {
  const availableSlots = getDoctorAvailableSlots(doctor, date, appointments);
  return availableSlots.includes(slot);
}
