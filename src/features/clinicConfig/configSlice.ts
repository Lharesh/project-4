import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux/store';
import type { ThemeMode, DoshaType } from '@/theme/constants/theme';

// Types
export interface ClinicConfig {
  id: string;
  clinicId: string;
  notifications: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
    pushNotifications: boolean;
  };
  language: 'en' | 'hi' | 'es' | 'fr';
  theme: {
    mode: ThemeMode;
    doshaType: DoshaType;
  };
  calendar: {
    firstDayOfWeek: 0 | 1; // 0: Sunday, 1: Monday
    defaultView: 'day' | 'week' | 'month';
    dayStartHour: number;
    dayEndHour: number;
  };
  updatedAt: string;
}

interface ConfigState {
  clinicConfig: ClinicConfig | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ConfigState = {
  clinicConfig: null,
  isLoading: false,
  error: null,
};

// Mock config data
const MOCK_CONFIG: ClinicConfig = {
  id: 'config1',
  clinicId: 'clinic1',
  notifications: {
    sms: true,
    email: true,
    whatsapp: false,
    pushNotifications: true,
  },
  language: 'en',
  theme: {
    mode: 'light',
    doshaType: 'vata',
  },
  calendar: {
    firstDayOfWeek: 1, // Monday
    defaultView: 'week',
    dayStartHour: 8,
    dayEndHour: 18,
  },
  updatedAt: '2023-09-01T00:00:00Z',
};

// Async Thunks
export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const clinicId = state.auth.user?.clinicId;

      if (!clinicId) {
        return rejectWithValue('No clinic ID found in user info');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Return mock config data
      return MOCK_CONFIG;
    } catch (error) {
      return rejectWithValue('Error fetching clinic configuration');
    }
  }
);

export const saveConfig = createAsyncThunk(
  'config/saveConfig',
  async (configData: Partial<ClinicConfig>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const clinicId = state.auth.user?.clinicId;
      const currentConfig = state.config.clinicConfig;

      if (!clinicId) {
        return rejectWithValue('No clinic ID found in user info');
      }

      if (!currentConfig) {
        return rejectWithValue('No current configuration found');
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update and return mock config data
      const updatedConfig = {
        ...currentConfig,
        ...configData,
        updatedAt: new Date().toISOString(),
      };

      return updatedConfig;
    } catch (error) {
      return rejectWithValue('Error saving clinic configuration');
    }
  }
);

// Config slice
const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    clearConfigError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Config
    builder
      .addCase(fetchConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action: PayloadAction<ClinicConfig>) => {
        state.isLoading = false;
        state.clinicConfig = action.payload;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Save Config
    builder
      .addCase(saveConfig.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveConfig.fulfilled, (state, action: PayloadAction<ClinicConfig>) => {
        state.isLoading = false;
        state.clinicConfig = action.payload;
      })
      .addCase(saveConfig.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearConfigError } = configSlice.actions;

export default configSlice.reducer;