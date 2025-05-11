import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface ClinicTimings {
  weekdays: {
    [key: string]: {
      isOpen: boolean;
      start: string;
      end: string;
      status: 'working' | 'half_day' | 'holiday' | 'weekly_off';
      breakStart?: string;
      breakEnd?: string;
    };
  };
}

export interface TreatmentSlot {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'doctor' | 'therapist' | 'admin' | 'receptionist';
  email: string;
  phone: string;
  specialization?: string;
  isActive: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

interface SetupState {
  timings: ClinicTimings;
  draftTimings?: ClinicTimings;
  treatmentSlots: TreatmentSlot[];
  staff: StaffMember[];
  whatsappTemplates: WhatsAppTemplate[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SetupState = {
  timings: {
    weekdays: {
      monday: { isOpen: true, start: '09:00', end: '18:00', status: 'working' },
      tuesday: { isOpen: true, start: '09:00', end: '18:00', status: 'working' },
      wednesday: { isOpen: true, start: '09:00', end: '18:00', status: 'working' },
      thursday: { isOpen: true, start: '09:00', end: '18:00', status: 'working' },
      friday: { isOpen: true, start: '09:00', end: '18:00', status: 'working' },
      saturday: { isOpen: true, start: '09:00', end: '14:00', status: 'working' },
      sunday: { isOpen: false, start: '09:00', end: '18:00', status: 'working' },
    },
  },
  draftTimings: undefined,
  treatmentSlots: [],
  staff: [],
  whatsappTemplates: [],
  isLoading: false,
  error: null,
};

// Mock data
const MOCK_TREATMENT_SLOTS: TreatmentSlot[] = [
  {
    id: '1',
    name: 'Abhyanga Massage',
    duration: 60,
    price: 120,
    description: 'Traditional Ayurvedic full body massage',
    isActive: true,
  },
  {
    id: '2',
    name: 'Shirodhara',
    duration: 45,
    price: 90,
    description: 'Relaxing oil flow therapy',
    isActive: true,
  },
];

const MOCK_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Dr. Sharma',
    role: 'doctor',
    email: 'sharma@clinic.com',
    phone: '+1234567890',
    specialization: 'Panchakarma',
    isActive: true,
  },
  {
    id: '2',
    name: 'John Doe',
    role: 'therapist',
    email: 'john@clinic.com',
    phone: '+1234567891',
    specialization: 'Massage Therapy',
    isActive: true,
  },
];

const MOCK_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: '1',
    name: 'Appointment Reminder',
    content: 'Hi {{name}}, reminder for your appointment on {{date}} at {{time}}.',
    variables: ['name', 'date', 'time'],
    isActive: true,
  },
];

// Thunks
export const fetchTimings = createAsyncThunk(
  'setup/fetchTimings',
  async (clinicId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return initialState.timings;
  }
);

export const saveTimings = createAsyncThunk(
  'setup/saveTimings',
  async ({ clinicId, timings }: { clinicId: string; timings: ClinicTimings }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return timings;
  }
);

export const fetchTreatmentSlots = createAsyncThunk(
  'setup/fetchTreatmentSlots',
  async (clinicId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TREATMENT_SLOTS;
  }
);

export const fetchStaff = createAsyncThunk(
  'setup/fetchStaff',
  async (clinicId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_STAFF;
  }
);

export const fetchTemplates = createAsyncThunk(
  'setup/fetchTemplates',
  async (clinicId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_TEMPLATES;
  }
);

export const addTemplate = createAsyncThunk(
  'setup/addTemplate',
  async (template: Omit<WhatsAppTemplate, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...template,
    };
  }
);

export const addStaffMember = createAsyncThunk(
  'setup/addStaffMember',
  async (staffData: Omit<StaffMember, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...staffData
    };
  }
);

export const updateStaffMember = createAsyncThunk(
  'setup/updateStaffMember',
  async (staffData: StaffMember) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return staffData;
  }
);

export const deleteStaffMember = createAsyncThunk(
  'setup/deleteStaffMember',
  async (staffId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return staffId;
  }
);

const setupSlice = createSlice({
  name: 'setup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDraftTimings: (state, action: PayloadAction<ClinicTimings>) => {
      state.draftTimings = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTimings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timings = action.payload;
      })
      .addCase(fetchTimings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch timings';
      })

      .addCase(fetchTreatmentSlots.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTreatmentSlots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treatmentSlots = action.payload;
      })
      .addCase(fetchTreatmentSlots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch treatment slots';
      })

      .addCase(fetchStaff.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff = action.payload;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch staff';
      })

      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsappTemplates = action.payload;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch templates';
      })

      .addCase(addTemplate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.whatsappTemplates.push(action.payload);
      })
      .addCase(addTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add template';
      })

      .addCase(addStaffMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addStaffMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff.push(action.payload);
      })
      .addCase(addStaffMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add staff member';
      })

      .addCase(updateStaffMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStaffMember.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.staff.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      .addCase(updateStaffMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update staff member';
      })

      .addCase(deleteStaffMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteStaffMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff = state.staff.filter(s => s.id !== action.payload);
      })
      .addCase(deleteStaffMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete staff member';
      });
  },
});

export const { clearError, setDraftTimings } = setupSlice.actions;
export default setupSlice.reducer;
