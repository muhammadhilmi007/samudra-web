// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { setLoading, setError, clearError, setSuccess } from './uiSlice';
import { User, LoginParams, ChangePasswordParams, RegisterParams } from '../../types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  loading: true,
};

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const response = await authService.login(credentials);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Login gagal'));
      return rejectWithValue(error.response?.data || { message: 'Login gagal' });
    }
  }
);

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const response = await authService.register(userData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengguna berhasil didaftarkan'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Registrasi gagal'));
      return rejectWithValue(error.response?.data || { message: 'Registrasi gagal' });
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      await authService.logout();
      dispatch(setLoading(false));
      
      // Clear token from local storage on successful logout
      localStorage.removeItem('token');
      
      return true;
    } catch (error) {
      dispatch(setLoading(false));
      
      // Even if API logout fails, clear local storage
      localStorage.removeItem('token');
      
      return false;
    }
  }
);

// Get current user profile
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.getMe();
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user data' });
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: ChangePasswordParams, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const response = await authService.changePassword(passwordData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Password berhasil diubah'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal mengubah password'));
      return rejectWithValue(error.response?.data || { message: 'Gagal mengubah password' });
    }
  }
);

// Check auth status on app initialization
export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { dispatch, getState }) => {
    const { auth } = getState() as { auth: AuthState };
    if (auth.token) {
      try {
        const response = await authService.getMe();
        return { user: response.data, token: auth.token };
      } catch (error) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        return { user: null, token: null };
      }
    }
    return { user: null, token: null };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login reducers
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      
      // Logout reducers
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Get current user reducers
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      })
      
      // Check auth status reducers
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = !!action.payload.user;
        state.loading = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('token');
      })
      
      // Register doesn't modify auth state, just confirms success

      // Change password doesn't modify auth state, just confirms success
  },
});

export const { setCredentials, clearCredentials, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;