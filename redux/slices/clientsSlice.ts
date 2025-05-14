import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Client {
  id: string; // CNT-001 style
  name: string;
  mobile: string;
  altMobile: string;
  mobileCode: string;
  altMobileCode: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  dob: string;
  height?: number;
  weight?: number;
  presentComplaints: string;
  knownIssues: string[];
  pastIllnesses: string;
  allergies: string;
  familyHistory: string;
  currentMedication: string;
} 

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [
    {
      id: 'CNT-001',
      name: 'John Smith',
      mobile: '+919876543210',
      altMobile: '+919812345678',
      mobileCode: '+91',
      altMobileCode: '+91',
      gender: 'Male',
      email: 'john.smith@example.com',
      dob: '1985-06-15',
      height: 175,
      weight: 70,
      presentComplaints: 'Back pain',
      knownIssues: ['Diabetes'],
      pastIllnesses: 'Chickenpox',
      allergies: 'Penicillin',
      familyHistory: 'Heart Disease',
      currentMedication: 'Metformin',
    },
    {
      id: 'CNT-002',
      name: 'Sarah Johnson',
      mobile: '+919812345678',
      altMobile: '+918888888888',
      mobileCode: '+91',
      altMobileCode: '+91',
      gender: 'Female',
      email: 'sarah.j@example.com',
      dob: '1990-03-22',
      height: 160,
      weight: 55,
      presentComplaints: 'Headache',
      knownIssues: [],
      pastIllnesses: '',
      allergies: '',
      familyHistory: '',
      currentMedication: '',
    },
    {
      id: 'CNT-003',
      name: 'Michael Brown',
      mobile: '+919800112233',
      altMobile: '',
      mobileCode: '+91',
      altMobileCode: '+91',
      gender: 'Male',
      email: 'michael.b@example.com',
      dob: '1978-11-30',
      height: 180,
      weight: 85,
      presentComplaints: '',
      knownIssues: ['Hypertension'],
      pastIllnesses: '',
      allergies: '',
      familyHistory: '',
      currentMedication: 'Amlodipine',
    },
  ],
  isLoading: false,
  error: null,
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (clinicId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock clients
      return initialState.clients;
    } catch (error) {
      return rejectWithValue('Error fetching clients');
    }
  }
);

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClientsError: (state) => {
      state.error = null;
    },
    addClient: (state, action: PayloadAction<Client>) => {
      state.clients.push(action.payload);
    },
    updateClient: (state, action: PayloadAction<Client>) => {
      const idx = state.clients.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.clients[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action: PayloadAction<Client[]>) => {
        state.isLoading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearClientsError, addClient, updateClient } = clientsSlice.actions;

export default clientsSlice.reducer;