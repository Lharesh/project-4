import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  patientId: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  createdAt: string;
}

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClientsState = {
  clients: [],
  isLoading: false,
  error: null,
};

// Mock data
const MOCK_CLIENTS: Client[] = [
  {
    id: 'client1',
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@example.com',
    patientId: 'PAT001',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    address: '123 Main St, Anytown, ST 12345',
    createdAt: '2023-01-15T00:00:00Z',
  },
  {
    id: 'client2',
    name: 'Sarah Johnson',
    phone: '+1 (555) 234-5678',
    email: 'sarah.j@example.com',
    patientId: 'PAT002',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    address: '456 Oak Ave, Somewhere, ST 67890',
    createdAt: '2023-02-01T00:00:00Z',
  },
  {
    id: 'client3',
    name: 'Michael Brown',
    phone: '+1 (555) 345-6789',
    email: 'michael.b@example.com',
    patientId: 'PAT003',
    dateOfBirth: '1978-11-30',
    gender: 'male',
    address: '789 Pine Rd, Elsewhere, ST 13579',
    createdAt: '2023-02-15T00:00:00Z',
  },
];

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (clinicId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock clients
      return MOCK_CLIENTS;
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

export const { clearClientsError } = clientsSlice.actions;

export default clientsSlice.reducer;