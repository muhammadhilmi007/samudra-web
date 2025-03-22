import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Activity {
  id: string;
  type: 'STT' | 'MUAT' | 'LANSIR' | 'TERKIRIM' | 'RETUR' | 'PAYMENT' | 'VEHICLE' | 'CUSTOMER';
  description: string;
  timestamp: string;
  referenceId: string;
  status: string;
  user?: {
    id: string;
    name: string;
  };
}

type ShipmentStatusData = {
  name: string;
  value: number;
  color: string;
};

interface RevenueData {
  name: string;
  revenue: number;
  target?: number;
  expenses?: number;
  profit?: number;
}

interface DashboardState {
  stats: {
    totalShipments: number;
    activeShipments: number;
    completedShipments: number;
    monthlyRevenue: number;
  };
  recentActivities: Activity[];
  revenueData: RevenueData[];
  shipmentStatusData?: ShipmentStatusData[];
  timeRange: 'monthly' | 'quarterly' | 'yearly';
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
  recentActivities: [],
  revenueData: [],
  shipmentStatusData: [],
  timeRange: 'monthly',
  loading: false,
  error: null,
};

export const getRecentActivities = createAsyncThunk(
  'dashboard/getRecentActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/activities');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch recent activities' });
    }
  }
);

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

export const getRevenueData = createAsyncThunk(
  'revenue/getRevenueData',
  async (params: { period: 'monthly' | 'quarterly' | 'yearly' }, thunkAPI) => {
    try {
      const response = await axios.get(`/api/dashboard/revenue?period=${params.period}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || { message: 'Failed to fetch revenue data' });
    }
  }
);

export const getShipmentStatusData = createAsyncThunk(
  'dashboard/getShipmentStatusData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/dashboard/shipment-status');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch shipment status data' });
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardStats: (state) => {
      state.stats = initialState.stats;
    },
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRecentActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRecentActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.recentActivities = action.payload;
        state.error = null;
      })
      .addCase(getRecentActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
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
      })
      .addCase(getRevenueData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRevenueData.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueData = action.payload;
        state.error = null;
      })
      .addCase(getRevenueData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getShipmentStatusData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipmentStatusData.fulfilled, (state, action) => {
        state.loading = false;
        state.shipmentStatusData = action.payload;
        state.error = null;
      })
      .addCase(getShipmentStatusData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardStats, setTimeRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;