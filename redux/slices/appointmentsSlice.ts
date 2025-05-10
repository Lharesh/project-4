import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  treatmentId: string;
  treatmentName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  isLoading: false,
  error: null,
};

// Mock data
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    clientId: 'client1',
    clientName: 'John Smith',
    treatmentId: 'treatment1',
    treatmentName: 'Abhyanga Massage',
    date: '2024-02-20',
    time: '09:00',
    status: 'scheduled',
  },
  {
    id: '2',
    clientId: 'client2',
    clientName: 'Sarah Johnson',
    treatmentId: 'treatment2',
    treatmentName: 'Shirodhara',
    date: '2024-02-20',
    time: '10:30',
    status: 'scheduled',
  },
  {
    id: '3',
    clientId: 'client3',
    clientName: 'Michael Brown',
    treatmentId: 'treatment3',
    treatmentName: 'Panchakarma Consultation',
    date: '2024-02-20',
    time: '14:00',
    status: 'scheduled',
  },
];

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async ({ clinicId, date }: { clinicId: string; date: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock appointments for the specified date
      return MOCK_APPOINTMENTS.filter(apt => apt.date === date);
    } catch (error) {
      return rejectWithValue('Error fetching appointments');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
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
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAppointmentsError } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;