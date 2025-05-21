import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ✅ Mutable mock users list for dev (can be reset in dev tools)
let MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@ayurai.com',
    name: 'Dr. Ayur Admin',
    password: 'password123',
    role: 'admin',
    clinicId: 'clinic1',
  },
  {
    id: '2',
    email: 'doctor@ayurai.com',
    name: 'Dr. Vaidya',
    password: 'password123',
    role: 'doctor',
    clinicId: 'clinic1',
  },
];

// Async Thunks

// ✅ LOGIN
export const login = createAsyncThunk(
  'auth/login',
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    await new Promise((res) => setTimeout(res, 500));
    const user = MOCK_USERS.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) return rejectWithValue('Invalid email or password');

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: 'mock-jwt-token',
    };
  }
);

// ✅ REGISTER (defaults to admin role)
export const register = createAsyncThunk(
  'auth/register',
  async (
    userData: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    await new Promise((res) => setTimeout(res, 500));
    const exists = MOCK_USERS.find((u) => u.email === userData.email);
    if (exists) return rejectWithValue('User with this email already exists');

    const newUser: User & { password: string } = {
      id: Math.random().toString(36).substring(2, 9),
      email: userData.email,
      name: userData.name,
      password: userData.password,
      role: 'admin', // ⬅️ Default role here (can be changed to 'receptionist' or config-driven)
      clinicId: 'clinic1',
    };

    MOCK_USERS.push(newUser);
    const { password, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token: 'mock-jwt-token',
    };
  }
);

// ✅ FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    await new Promise((res) => setTimeout(res, 500));
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) return rejectWithValue('No account found with this email');
    return { success: true, message: 'Reset instructions sent to your email' };
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
