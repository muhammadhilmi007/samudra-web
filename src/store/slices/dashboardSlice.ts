import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the state interface
interface DashboardState {
  stats: {
    totalShipments: number;
    activeShipments: number;
    completedShipments: number;
    monthlyRevenue: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    monthlyRevenue: 0,
  },
  loading: false,
  error: null,
};

// Create async thunk for fetching dashboard stats
export const getDashboardStats = createAsyncThunk(
  'dashboard/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' });
    }
  }
);

// Create the dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardStats: (state) => {
      state.stats = initialState.stats;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;