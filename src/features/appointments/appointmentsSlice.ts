import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';

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
  duration?: number;
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
}


// Redux state for appointments
interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

// Mock data with full interface for both Doctor and Therapy
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    clientId: 'client1',
    clientName: 'John Smith',
    clientMobile: '9876543210',
    clientEmail: 'john.smith@email.com',
    doctorId: 'doctor1',
    doctorName: 'Dr. Sharma',
    therapistIds: [],
    therapistNames: [],
    treatmentId: 'treatment1',
    treatmentName: 'Abhyanga Massage',
    consultationId: 'consult1',
    consultationName: 'Initial',
    duration: 60,
    roomNumber: '101',
    date: '2025-05-15',
    time: '09:00',
    status: 'scheduled',
    notes: 'Prefers morning',
    tab: 'Doctor',
  },
  {
    id: '2',
    clientId: 'client2',
    clientName: 'Sarah Johnson',
    clientMobile: '9123456780',
    clientEmail: 'sarah.johnson@email.com',
    doctorId: '',
    doctorName: '',
    therapistIds: ['therapist1'],
    therapistNames: ['Dr. Gupta'],
    treatmentId: 'treatment2',
    treatmentName: 'Shirodhara',
    consultationId: 'consult2',
    consultationName: 'Follow Up',
    duration: 45,
    roomNumber: '202',
    date: '2025-05-15',
    time: '10:30',
    status: 'completed',
    notes: 'Bring previous reports',
    tab: 'Therapy',
  },
  {
    id: '3',
    clientId: 'client3',
    clientName: 'Michael Brown',
    clientMobile: '9988776655',
    clientEmail: 'michael.brown@email.com',
    doctorId: 'doctor2',
    doctorName: 'Dr. Mehta',
    therapistIds: [],
    therapistNames: [],
    treatmentId: 'treatment3',
    treatmentName: 'Panchakarma',
    consultationId: 'consult3',
    consultationName: 'Online',
    duration: 30,
    roomNumber: '103',
    date: '2025-05-15',
    time: '14:00',
    status: 'cancelled',
    notes: '',
    tab: 'Doctor',
  },
];

const initialState: AppointmentsState = {
  appointments: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch appointments (mock implementation)
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ tab, date }: { tab: 'Doctor' | 'Therapy'; date: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Return mock appointments for the specified tab and date
      return MOCK_APPOINTMENTS.filter(apt => apt.date === date && apt.tab === tab);
    } catch (error) {
      return rejectWithValue('Error fetching appointments');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    addAppointment: (state, action: PayloadAction<Appointment>) => {
      console.log('[appointmentsSlice] addAppointment called with', action.payload.id);
      state.appointments.unshift(action.payload);
    },
    addAppointments: (state, action: PayloadAction<Appointment[]>) => {
      action.payload.forEach(appt => state.appointments.unshift(appt));
    },
    setAppointments: (state, action: PayloadAction<Appointment[]>) => {
      state.appointments = action.payload;
    },
    clearAppointments: (state) => {
      state.appointments = [];
    },
    clearAppointmentsError: (state) => {
      state.error = null;
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


export const { addAppointment, addAppointments, setAppointments, clearAppointments, clearAppointmentsError } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;