import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ReportFilters, Report } from '@/components/ui/types';

interface State {
  filters: ReportFilters;
  appointments: Report[];
  revenue: Report[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  filters: {
    type: 'appointments',
    timeRange: 'today',
    startDate: '',
    endDate: '',
  },
  appointments: [],
  revenue: [],
  loading: false,
  error: null,
};

const MOCK_APPOINTMENTS: Report[] = [
  {
    id: '1',
    date: '2025-05-09',
    clientName: 'John Doe',
    mobile: '1234567890',
    reason: 'Consultation',
  },
  {
    id: '2',
    date: '2025-05-10',
    clientName: 'Jane Doe',
    mobile: '0987654321',
    reason: 'Follow-up',
  },
];

const MOCK_REVENUE: Report[] = [
  {
    id: '1',
    date: '2025-05-09',
    clientName: 'John Doe',
    mobile: '1234567890',
    doctor: 'Dr. Smith',
    amount: 100,
    reason: 'Consultation',
  },
  {
    id: '2',
    date: '2025-05-10',
    clientName: 'Jane Doe',
    mobile: '0987654321',
    doctor: 'Dr. Johnson',
    amount: 200,
    reason: 'Treatment',
  },
];

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (filters: ReportFilters) => {
    try {
      // Replace with actual API call
      const mockData = filters.type === 'appointments'
        ? MOCK_APPOINTMENTS
        : MOCK_REVENUE;

      return mockData;
    } catch (error) {
      throw error;
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReportFilters: (state, action: PayloadAction<ReportFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        type: 'appointments',
        timeRange: 'today',
        startDate: '',
        endDate: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (state.filters.type === 'appointments') {
          state.appointments = action.payload as Report[];
        } else {
          state.revenue = action.payload as Report[];
        }
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      });
  },
});

export const { setReportFilters, clearFilters } = reportsSlice.actions;
export default reportsSlice.reducer;