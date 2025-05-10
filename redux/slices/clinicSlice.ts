import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Types
export interface ClinicSubscription {
  planId: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
  features: string[];
  maxUsers: number;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  subscription: ClinicSubscription;
  createdAt: string;
  updatedAt: string;
}

interface ClinicState {
  currentClinic: Clinic | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ClinicState = {
  currentClinic: null,
  isLoading: false,
  error: null,
};

// Mock clinic data
const MOCK_CLINIC: Clinic = {
  id: 'clinic1',
  name: 'Ayurveda Wellness Center',
  address: '123 Healing Path, Harmony City, 12345',
  phone: '+1 (555) 123-4567',
  email: 'contact@ayurvedawellness.com',
  logo: 'https://example.com/logo.png',
  subscription: {
    planId: 'premium',
    planName: 'Premium Plan',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    status: 'active',
    features: ['Appointments', 'Inventory', 'CaseSheets', 'Analytics'],
    maxUsers: 10,
  },
  createdAt: '2022-12-15T00:00:00Z',
  updatedAt: '2023-06-01T00:00:00Z',
};

// Async Thunks
export const fetchClinic = createAsyncThunk(
  'clinic/fetchClinic',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const clinicId = state.auth.user?.clinicId;

      if (!clinicId) {
        return rejectWithValue('No clinic ID found in user info');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Return mock clinic data
      return MOCK_CLINIC;
    } catch (error) {
      return rejectWithValue('Error fetching clinic information');
    }
  }
);

export const updateClinic = createAsyncThunk(
  'clinic/updateClinic',
  async (updateData: Partial<Clinic>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const clinicId = state.auth.user?.clinicId;

      if (!clinicId) {
        return rejectWithValue('No clinic ID found in user info');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update and return mock clinic data
      const updatedClinic = {
        ...MOCK_CLINIC,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      return updatedClinic;
    } catch (error) {
      return rejectWithValue('Error updating clinic information');
    }
  }
);

// Clinic slice
const clinicSlice = createSlice({
  name: 'clinic',
  initialState,
  reducers: {
    clearClinicError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Clinic
    builder
      .addCase(fetchClinic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClinic.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.isLoading = false;
        state.currentClinic = action.payload;
      })
      .addCase(fetchClinic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Clinic
    builder
      .addCase(updateClinic.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClinic.fulfilled, (state, action: PayloadAction<Clinic>) => {
        state.isLoading = false;
        state.currentClinic = action.payload;
      })
      .addCase(updateClinic.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearClinicError } = clinicSlice.actions;

export default clinicSlice.reducer;