// src/store/slices/reportSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';
import { setLoading, setError } from './uiSlice';

interface ReportState {
  loading: boolean;
  dashboardStats: any;
  salesReport: any;
  revenueReport: any;
  returnsReport: any;
  receivablesReport: any;
  balanceSheet: any;
  profitLossReport: any;
}

const initialState: ReportState = {
  loading: false,
  dashboardStats: null,
  salesReport: null,
  revenueReport: null,
  returnsReport: null,
  receivablesReport: null,
  balanceSheet: null,
  profitLossReport: null,
};

// Get dashboard statistics
export const getDashboardStats = createAsyncThunk(
  'report/getDashboardStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getDashboardStats();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch dashboard statistics'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard statistics' });
    }
  }
);

// Get sales report
export const getSalesReport = createAsyncThunk(
  'report/getSalesReport',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getSalesReport(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch sales report'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch sales report' });
    }
  }
);

// Get revenue report
export const getRevenueReport = createAsyncThunk(
  'report/getRevenueReport',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getRevenueReport(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch revenue report'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch revenue report' });
    }
  }
);

// Get returns report
export const getReturnsReport = createAsyncThunk(
  'report/getReturnsReport',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getReturnsReport(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch returns report'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch returns report' });
    }
  }
);

// Get receivables report
export const getReceivablesReport = createAsyncThunk(
  'report/getReceivablesReport',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getReceivablesReport(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch receivables report'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch receivables report' });
    }
  }
);

// Get balance sheet
export const getBalanceSheet = createAsyncThunk(
  'report/getBalanceSheet',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getBalanceSheet(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch balance sheet'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch balance sheet' });
    }
  }
);

// Get profit & loss report
export const getProfitLossReport = createAsyncThunk(
  'report/getProfitLossReport',
  async (params: any, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await reportService.getProfitLossReport(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch profit & loss report'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch profit & loss report' });
    }
  }
);

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    clearReports: (state) => {
      state.dashboardStats = null;
      state.salesReport = null;
      state.revenueReport = null;
      state.returnsReport = null;
      state.receivablesReport = null;
      state.balanceSheet = null;
      state.profitLossReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getSalesReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.salesReport = action.payload;
      })
      .addCase(getSalesReport.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getRevenueReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRevenueReport.fulfilled, (state, action) => {
        state.loading = false;
        state.revenueReport = action.payload;
      })
      .addCase(getRevenueReport.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getReturnsReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReturnsReport.fulfilled, (state, action) => {
        state.loading = false;
        state.returnsReport = action.payload;
      })
      .addCase(getReturnsReport.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getReceivablesReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getReceivablesReport.fulfilled, (state, action) => {
        state.loading = false;
        state.receivablesReport = action.payload;
      })
      .addCase(getReceivablesReport.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getBalanceSheet.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBalanceSheet.fulfilled, (state, action) => {
        state.loading = false;
        state.balanceSheet = action.payload;
      })
      .addCase(getBalanceSheet.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getProfitLossReport.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfitLossReport.fulfilled, (state, action) => {
        state.loading = false;
        state.profitLossReport = action.payload;
      })
      .addCase(getProfitLossReport.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { clearReports } = reportSlice.actions;

export default reportSlice.reducer;