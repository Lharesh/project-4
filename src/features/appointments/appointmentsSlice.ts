import { APPOINTMENT_PARAM_KEYS } from "./constants/paramKeys";
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import { APPOINTMENT_STATUS } from './constants/status';
import { getWorkingSeriesDates } from './helpers/dateHelpers';
import type { ClinicTimings } from './helpers/availabilityUtils';
import { CLINIC_TIMINGS } from 'app/(admin)/clinics/setup/setupSlice';
import { safeFormatDate } from './helpers/dateHelpers';

// Appointment interface for both Doctor and Therapy tabs, future-proofed
/**
 * Unified Appointment interface for both Doctor and Therapy appointments.
 * Optional fields are used to accommodate both types.
 */
export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientMobile?: string;
  clientEmail?: string;
  doctorId?: string;
  doctorName?: string;
  therapistIds?: string[];
  therapistNames?: string[];
  treatmentId?: string;
  treatmentName?: string;
  consultationId?: string;
  consultationName?: string;
  duration: number;
  roomNumber?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  notes?: string;
  tab: 'Doctor' | 'Therapy';
  /** Total number of days for therapy sessions (Therapy only) */
  totalDays?: number;
  /** Current day index for therapy session (Therapy only) */
  dayIndex?: number;
  /** ISO string timestamp for when the appointment was created */
  createdAt?: string;
  /** Unique ID for a multi-day treatment series */
  seriesId?: string;
  updatedAt?: string;
  rescheduledBy?: string;
  rescheduleReason?: string;
}

// Redux state for appointments
interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

// Mock data with full interface for both Doctor and Therapy
const MOCK_APPOINTMENTS: Appointment[] = [];

const initialState: AppointmentsState = {
  appointments: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch appointments (mock implementation)
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ validTab, date }: { validTab: 'Doctor' | 'Therapy'; date: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Return mock appointments for the specified tab and date
      return MOCK_APPOINTMENTS.filter(apt => apt.date === date && apt.tab === validTab);
    } catch (error) {
      return rejectWithValue('Error fetching appointments');
    }
  }
);

// Thunk for adding appointment(s) with all business logic and master data
export const addAppointmentThunk = createAsyncThunk(
  'appointments/addAppointmentThunk',
  async (
    { appointment }: { appointment: Appointment },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const clinicTimings = state.setup.timings as ClinicTimings | undefined;
    if (!clinicTimings) throw new Error('Clinic timings not found in state');
    const duration = appointment.totalDays ?? 1;
    const baseId = `${appointment.clientId}_${appointment.treatmentId || ''}_${appointment.roomNumber || ''}`;
    if (duration > 1) {
      // --- Series/multi-day logic is handled here ---
      // Generate a seriesId if not present
      const seriesId = appointment.seriesId || `series_${baseId}_${appointment.date}`;
      const dates = getWorkingSeriesDates(appointment.date, duration, clinicTimings);
      const appointmentsToAdd: Appointment[] = dates.map((date, idx) => {
        const formattedDate = safeFormatDate(date, 'yyyy-MM-dd');
        return {
          ...appointment,
          id: `${baseId}_${formattedDate}_${appointment.time}`,
          date: formattedDate,
          dayIndex: idx + 1,
          totalDays: dates.length,
          seriesId,
        };
      });
      dispatch(addAppointments(appointmentsToAdd));
    } else {
      const formattedDate = safeFormatDate(appointment.date, 'yyyy-MM-dd');
      const id = `${baseId}_${formattedDate}_${appointment.time}`;
      dispatch(addAppointment({ ...appointment, id, date: formattedDate }));
    }
  }
);

// Thunk for cancel and shift series (business logic here, pure reducer below)
export const cancelAndShiftSeries = createAsyncThunk(
  'appointments/cancelAndShiftSeries',
  async (
    { appointmentId, push, cancelAll }: { appointmentId: string; push?: boolean; cancelAll?: boolean },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const clinicTimings = state.setup.timings as ClinicTimings | undefined;
    if (!clinicTimings) throw new Error('Clinic timings not found in state');
    const appointments = state.appointments.appointments.slice(); // shallow copy
    const idx = appointments.findIndex(a => a.id === appointmentId);
    if (idx === -1) return;
    const appt = { ...appointments[idx] };
    appointments[idx] = { ...appt, status: APPOINTMENT_STATUS.CANCELLED as typeof appt.status };

    // Helper to get the next working day after a given date
    function getNextWorkingDay(currentDate: string, clinicTimings: ClinicTimings) {
      const dates = getWorkingSeriesDates(currentDate, 2, clinicTimings);
      return dates[1];
    }

    if (appt.seriesId && clinicTimings) {
      // Multi-day logic
      const seriesDates = getWorkingSeriesDates(appt.date, appt.totalDays ?? 1, clinicTimings);
      if (cancelAll) {
        // Cancel all scheduled, future or today in the series
        const updatedAppointments = appointments.map(a => {
          if (
            a.seriesId === appt.seriesId &&
            seriesDates.includes(a.date) &&
            a.status === APPOINTMENT_STATUS.SCHEDULED
          ) {
            return { ...a, status: APPOINTMENT_STATUS.CANCELLED as typeof a.status };
          }
          return a;
        });
        dispatch(setAppointments(updatedAppointments));
      } else if (push) {
        // 1. Get all series appointments, sorted by date
        const allSeries = appointments
          .filter(a => a.seriesId === appt.seriesId)
          .sort((a, b) => a.date.localeCompare(b.date));

        // 2. Find index of the cancelled appointment
        const cancelIdx = allSeries.findIndex(a => a.id === appt.id);
        if (cancelIdx === -1) return;

        // 3. Cancel the selected appointment
        allSeries[cancelIdx] = { ...allSeries[cancelIdx], status: APPOINTMENT_STATUS.CANCELLED as Appointment['status'] };

        // 4. Get working days for the new (length+1) series, starting from the original first date
        const workingDates = getWorkingSeriesDates(allSeries[0].date, allSeries.length + 1, clinicTimings);

        // 5. Build new shifted series:
        //    - Insert a copy of the cancelled slot (scheduled) on the next working day after the cancelled date
        //    - Shift all scheduled slots with date >= cancelled date forward by one working day
        const newSeries: typeof allSeries = [];
        for (let i = 0; i < allSeries.length; i++) {
          const timeVal = allSeries[i].time || (allSeries[i] as any).slot || '';
          if (i === cancelIdx) {
            // Keep the cancelled slot at its original date
            newSeries.push({ ...allSeries[i], date: workingDates[i], id: `${allSeries[i].clientId}_${allSeries[i].treatmentId || ''}_${allSeries[i].roomNumber || ''}_${workingDates[i]}_${timeVal}` });
            // Insert a copy (scheduled) on the next working day
            newSeries.push({
              ...allSeries[i],
              status: APPOINTMENT_STATUS.SCHEDULED as Appointment['status'],
              date: workingDates[i + 1],
              id: `${allSeries[i].clientId}_${allSeries[i].treatmentId || ''}_${allSeries[i].roomNumber || ''}_${workingDates[i + 1]}_${timeVal}`
            });
          } else if (i > cancelIdx) {
            // Shift all future scheduled slots forward by one working day
            newSeries.push({
              ...allSeries[i],
              date: workingDates[i + 1],
              id: `${allSeries[i].clientId}_${allSeries[i].treatmentId || ''}_${allSeries[i].roomNumber || ''}_${workingDates[i + 1]}_${timeVal}`
            });
          } else {
            // Keep all slots before the cancelled one unchanged
            newSeries.push({
              ...allSeries[i],
              date: workingDates[i],
              id: `${allSeries[i].clientId}_${allSeries[i].treatmentId || ''}_${allSeries[i].roomNumber || ''}_${workingDates[i]}_${timeVal}`
            });
          }
        }

        // 6. Replace the series in the appointments array
        const finalAppointments = appointments
          .filter(a => a.seriesId !== appt.seriesId)
          .concat(newSeries);

        dispatch(setAppointments(finalAppointments));
      }
    }
    // For single cancel (not series), already updated above
    if (!appt.seriesId || (!cancelAll && !push)) {
      dispatch(setAppointments([...appointments]));
    }
  }
);

// Thunk for rescheduling an appointment
export const rescheduleAppointmentThunk = createAsyncThunk(
  'appointments/rescheduleAppointmentThunk',
  async (
    { original, updates }: { original: Appointment; updates: Partial<Appointment> },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const appointments = state.appointments.appointments.slice();
    const now = new Date().toISOString();
    // Single-day appointment (no seriesId)
    if (!original.seriesId) {
      // Cancel the original
      const updatedAppointments: Appointment[] = appointments.map(a =>
        a.id === original.id ? { ...a, status: APPOINTMENT_STATUS.CANCELLED as Appointment['status'] } : a
      );
      // Map form fields to canonical fields
      if (typeof (updates as any).startDate === 'string') updates.date = (updates as any).startDate;
      if (typeof (updates as any).timeSlot === 'string') updates.time = (updates as any).timeSlot;
      // Set duration to correct treatment duration
      if (typeof (updates as any).selectedTherapy === 'string') {
        const therapies = state.setup?.treatmentSlots || [];
        const therapy = therapies.find((t: any) => String(t.id) === String((updates as any).selectedTherapy));
        if (therapy && therapy.duration) {
          updates.duration = therapy.duration;
        }
      }
      // Add log to verify mapped fields
      console.log('[rescheduleAppointmentThunk] mapped updates:', updates);
      // Create new appointment with updated values
      if (!updates.date) {
        throw new Error('No date selected for reschedule.');
      }
      const workingDates = getWorkingSeriesDates(updates.date, 1, state.setup.timings as ClinicTimings | undefined);
      const finalDate = workingDates[0];
      if (finalDate !== updates.date) {
        throw new Error('Selected date is not a working day. Please choose a valid working day.');
      }
      const newAppointment: Appointment = {
        ...original,
        ...updates,
        date: finalDate,
        id: `${original.clientId}_${(updates.therapistIds || original.therapistIds || []).join('_')}_${updates.roomNumber || original.roomNumber}_${finalDate}_${updates.time || original.time}`,
        status: APPOINTMENT_STATUS.SCHEDULED as Appointment['status'],
        updatedAt: now,
        rescheduledBy: (updates as any).rescheduledBy || undefined,
        rescheduleReason: (updates as any).rescheduleReason || undefined,
      };
      updatedAppointments.unshift(newAppointment);
      dispatch(setAppointments(updatedAppointments));
    } else {
      // Multi-day/series appointment: only allow time/therapist/notes changes
      if (updates.date && updates.date !== original.date) {
        throw new Error('Date change is not allowed for multi-day/series appointments.');
      }
      // Set duration to correct treatment duration for series slot
      if (typeof (updates as any).selectedTherapy === 'string') {
        const therapies = state.setup?.treatmentSlots || [];
        const therapy = therapies.find((t: any) => String(t.id) === String((updates as any).selectedTherapy));
        if (therapy && therapy.duration) {
          updates.duration = therapy.duration;
        }
      }
      // Add log to verify mapped fields
      console.log('[rescheduleAppointmentThunk] mapped updates (series):', updates);
      // Update the relevant slot in the series
      const updatedAppointments: Appointment[] = appointments.map(a => {
        if (a.seriesId === original.seriesId && a.date === original.date) {
          return {
            ...a,
            ...updates,
            updatedAt: now,
            rescheduledBy: (updates as any).rescheduledBy || undefined,
            rescheduleReason: (updates as any).rescheduleReason || undefined,
          };
        }
        return a;
      });
      dispatch(setAppointments(updatedAppointments));
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    // Only add a single appointment (no business logic)
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      const exists = state.appointments.some(a => a.id === action.payload.id);
      if (!exists) {
        state.appointments.unshift(action.payload);
      }
    },
    // Add multiple appointments (batch add)
    addAppointments: (state, action: PayloadAction<Appointment[]>) => {
      const existingIds = new Set(state.appointments.map(a => a.id));
      action.payload.forEach(appt => {
        if (!existingIds.has(appt.id)) {
          state.appointments.unshift(appt);
          existingIds.add(appt.id);
        }
      });
    },
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      console.log('setAppointments :', action.payload);
      state.appointments = action.payload;
    },
    clearAppointments: (state) => {
      state.appointments = [];
    },
    clearAppointmentsError: (state) => {
      state.error = null;
    },
    cancelAppointment: (state, action: PayloadAction<string>) => {
      // Find by id and set status to 'cancelled'
      const idx = state.appointments.findIndex(a => a.id === action.payload);
      if (idx !== -1) {
        state.appointments[idx].status = 'cancelled';
      }
    },
    completeAppointment: (state, action: PayloadAction<string>) => {
      // Find by id and set status to 'completed'
      const idx = state.appointments.findIndex(a => a.id === action.payload);
      if (idx !== -1) {
        state.appointments[idx].status = 'completed';
      }
    },
    rescheduleAppointment: (state, action: PayloadAction<{ appointmentId: string, newAppointment: Appointment }>) => {
      // Cancel old appointment
      const idx = state.appointments.findIndex(a => a.id === action.payload.appointmentId);
      if (idx !== -1) {
        state.appointments[idx].status = 'cancelled';
      }
      // Add new scheduled appointment
      state.appointments.unshift(action.payload.newAppointment);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action: PayloadAction<Appointment[]>) => {
        state.isLoading = false;
        // Merge fetched appointments with existing, avoiding duplicates by id
        const incomingIds = new Set(action.payload.map(a => a.id));
        state.appointments = [
          ...action.payload,
          ...state.appointments.filter(a => !incomingIds.has(a.id)),
        ];
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  addAppointment,
  addAppointments,
  setAppointments,
  clearAppointments,
  clearAppointmentsError,
  cancelAppointment,
  completeAppointment,
  rescheduleAppointment,
} = appointmentsSlice.actions;

// Selectors
export const selectAppointmentById = (state: RootState, id: string) =>
  state.appointments.appointments.find(a => a.id === id);

export const selectAppointmentsByStatus = (state: RootState, status: string) =>
  state.appointments.appointments.filter(a => a.status === status);

export const selectClinicTimings = (state: any) => state.setup?.timings || CLINIC_TIMINGS;

export default appointmentsSlice.reducer;