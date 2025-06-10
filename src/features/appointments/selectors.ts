import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
// Memoized selectors for appointments and setup slices
import { createSelector } from 'reselect';

// WARNING: Do NOT return the entire root state from any selector!
// This will cause unnecessary rerenders and break memoization.
// If you need the root state for debugging, use a local variable, not a selector.

// Setup selectors
export const selectStaff = (state: any) => state.setup?.staff || [];
// In your selectors file
export const selectDoctorAvailability = createSelector(
  [(state: any) => state.setup?.doctorAvailability],
  (doctorAvailability) => doctorAvailability || {}
);

export const selectDoctors = createSelector(
  [selectStaff],
  (staff) => staff.filter((member: any) => member.role === 'doctor')
);

// Select therapists from staff
export const selectTherapists = createSelector(
  (state: any) => state.setup?.staff || [],
  (staff: any[]) => staff.filter((s: any) => s.role === 'therapist')
);

// Appointments selectors
export const selectAppointments = (state: any) => state.appointments?.appointments || [];

export const selectAppointmentsByTabAndDate = (tab: 'Doctor' | 'Therapy', date: string) =>
  createSelector([
    selectAppointments
  ], (appointments) => appointments.filter((a: any) => a.tab === tab && a.date === date));

// Clients selectors
export const selectClients = (state: any) => state.clients?.clients || [];
