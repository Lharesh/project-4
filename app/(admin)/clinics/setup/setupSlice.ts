import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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
  email?: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
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

export interface Room {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

interface SetupState {
  timings: ClinicTimings;
  draftTimings?: ClinicTimings;
  treatmentSlots: TreatmentSlot[];
  staff: StaffMember[];
  whatsappTemplates: WhatsAppTemplate[];
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
}
// Mock data
const MOCK_TREATMENT_SLOTS: TreatmentSlot[] = [
  { id: 't1', name: 'Abhyanga', duration: 60, price: 100, description: 'Traditional Ayurvedic full body massage', isActive: true },
  { id: 't2', name: 'Elakizhi', duration: 60, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't3', name: 'Podikizhi', duration: 60, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't4', name: 'Navarakizhi', duration: 60, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't5', name: 'Shirodhara', duration: 90, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't6', name: 'Udvartana', duration: 45, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't7', name: 'Nasya', duration: 30, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't8', name: 'Kati Basti', duration: 60, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't9', name: 'Panchakarma', duration: 90, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't10', name: 'Pizhichil', duration: 90, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't11', name: 'Karna purana', duration: 60, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
  { id: 't12', name: 'Akshi Tarpanam', duration: 60, price: 100, description: 'Traditional Ayurvedic treatment', isActive: true },
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

// Mock rooms
// Combined mock rooms from appointments (if not already present)
export const ROOMS_MOCK: Room[] = [
  { id: 'r1', name: 'Vata (Therapy)', type: 'therapy', isActive: true },
  { id: 'r2', name: 'Pitta (Therapy)', type: 'therapy', isActive: true },
  { id: 'r3', name: 'Kapha (Therapy)', type: 'therapy', isActive: true },
];

// Mock: Clinic timings (7:00-13:00, 15:00-18:00, Monday off)
export const CLINIC_TIMINGS: ClinicTimings = {


  weekdays: {
    monday: { isOpen: false, start: '', end: '', status: 'weekly_off' },
    tuesday: { isOpen: true, start: '07:00', end: '18:00', status: 'working', breakStart: '13:00', breakEnd: '15:00' },
    wednesday: { isOpen: true, start: '07:00', end: '18:00', status: 'working', breakStart: '13:00', breakEnd: '15:00' },
    thursday: { isOpen: true, start: '07:00', end: '18:00', status: 'working', breakStart: '13:00', breakEnd: '15:00' },
    friday: { isOpen: true, start: '07:00', end: '18:00', status: 'working', breakStart: '13:00', breakEnd: '15:00' },
    saturday: { isOpen: true, start: '07:00', end: '18:00', status: 'working', breakStart: '13:00', breakEnd: '15:00' },
    sunday: { isOpen: true, start: '07:00', end: '18:00', status: 'working', breakStart: '13:00', breakEnd: '15:00' },
  },
};

// Mock staff must be defined before initialState
const MOCK_STAFF: StaffMember[] = [
  {
    id: '1',
    name: 'Dr. Sharma',
    role: 'doctor',
    email: 'sharma@clinic.com',
    phone: '234567890',
    gender: 'Male',
    specialization: 'Panchakarma',
    isActive: true,
  },
  {
    id: '2',
    name: 'Dr. Haresh',
    role: 'doctor',
    email: 'haresh@clinic.com',
    phone: '9877654432',
    gender: 'Male',
    specialization: 'Panchakarma',
    isActive: true,
  },
  {
    id: '3',
    name: 'John Doe',
    role: 'therapist',
    email: 'john@clinic.com',
    phone: '234567891',
    gender: 'Male',
    specialization: '',
    isActive: true,
  },
  {
    id: '4',
    name: 'Nitin',
    role: 'therapist',
    email: 'nitin@clinic.com',
    phone: '2222222222',
    gender: 'Male',
    specialization: '',
    isActive: true,
  },
  {
    id: '5',
    name: 'Shilpa',
    role: 'therapist',
    email: 'shilpa@clinic.com',
    phone: '1212112122',
    gender: 'Female',
    specialization: '',
    isActive: true,
  },
  {
    id: '6',
    name: 'Anjali',
    role: 'therapist',
    email: 'anjali@clinic.com',
    phone: '234567891',
    gender: 'Female',
    specialization: '',
    isActive: true,
  },
];

const initialState: SetupState = {
  timings: CLINIC_TIMINGS,
  draftTimings: undefined,
  treatmentSlots: MOCK_TREATMENT_SLOTS,
  staff: MOCK_STAFF,
  whatsappTemplates: [],
  rooms: ROOMS_MOCK,
  isLoading: false,
  error: null,
};



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

// Selectors
import type { RootState } from '@/redux/store';
import { createSelector } from 'reselect';
export const selectStaff = (state: RootState) => state.setup.staff || [];
export const selectTherapists = createSelector(
  [selectStaff],
  (staff) => staff.filter(s => s.role === 'therapist')
)
export const selectDoctors = createSelector(
  [selectStaff],
  (staff) => staff.filter(s => s.role === 'doctor')
)
export const selectAdmins = createSelector(
  [selectStaff],
  (staff) => staff.filter(s => s.role === 'admin')
)
export const selectRooms = (state: RootState) => state.setup.rooms;
// Selector to get clinic timings from Redux state
export const selectClinicTimings = (state: any) => state.setup?.timings || CLINIC_TIMINGS;

export const { clearError, setDraftTimings } = setupSlice.actions;
export default setupSlice.reducer;
export { MOCK_STAFF };
