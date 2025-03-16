// src/store/slices/returnSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import returnService from '../../services/returnService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Return, ReturnFormInputs } from '../../types/return';

interface ReturnState {
  returns: Return[];
  currentReturn: Return | null;
  loading: boolean;
  error: string | null;
}

const initialState: ReturnState = {
  returns: [],
  currentReturn: null,
  loading: false,
  error: null,
};

// Get all returns
export const getReturns = createAsyncThunk(
  'return/getReturns',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await returnService.getReturns();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch returns'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch returns' });
    }
  }
);

// Get return by ID
export const getReturnById = createAsyncThunk(
  'return/getReturnById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await returnService.getReturnById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch return'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch return' });
    }
  }
);

// Get returns by branch
export const getReturnsByBranch = createAsyncThunk(
  'return/getReturnsByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await returnService.getReturnsByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch returns by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch returns by branch' });
    }
  }
);

// Create return
export const createReturn = createAsyncThunk(
  'return/createReturn',
  async (returnData: ReturnFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await returnService.createReturn(returnData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Retur berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create return'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create return' });
    }
  }
);

// Update return
export const updateReturn = createAsyncThunk(
  'return/updateReturn',
  async ({ id, returnData }: { id: string; returnData: Partial<ReturnFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await returnService.updateReturn(id, returnData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Retur berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update return'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update return' });
    }
  }
);

// Update return status
export const updateReturnStatus = createAsyncThunk(
  'return/updateReturnStatus',
  async ({ id, status }: { id: string; status: 'PROSES' | 'SAMPAI' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await returnService.updateReturnStatus(id, status);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status retur berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update return status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update return status' });
    }
  }
);

const returnSlice = createSlice({
  name: 'return',
  initialState,
  reducers: {
    clearCurrentReturn: (state) => {
      state.currentReturn = null;
    },
    clearReturns: (state) => {
      state.returns = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all returns
      .addCase(getReturns.fulfilled, (state, action) => {
        state.returns = action.payload;
      })
      // Get return by ID
      .addCase(getReturnById.fulfilled, (state, action) => {
        state.currentReturn = action.payload;
      })
      // Get returns by branch
      .addCase(getReturnsByBranch.fulfilled, (state, action) => {
        state.returns = action.payload;
      })
      // Create return
      .addCase(createReturn.fulfilled, (state, action) => {
        state.returns.push(action.payload);
        state.currentReturn = action.payload;
      })
      // Update return
      .addCase(updateReturn.fulfilled, (state, action) => {
        state.returns = state.returns.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentReturn = action.payload;
      })
      // Update return status
      .addCase(updateReturnStatus.fulfilled, (state, action) => {
        state.returns = state.returns.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentReturn = action.payload;
      });
  },
});

export const { clearCurrentReturn, clearReturns } = returnSlice.actions;

export default returnSlice.reducer;