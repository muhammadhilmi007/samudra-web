import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { PickupRequest } from '../../types/pickup';

interface PickupState {
  requests: PickupRequest[];
  currentRequest: PickupRequest | null;
  loading: boolean;
  error: string | null;
}

const initialState: PickupState = {
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
};

export const getPickupRequests = createAsyncThunk(
  'pickup/getRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/pickup-requests');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pickup requests');
    }
  }
);

const pickupSlice = createSlice({
  name: 'pickup',
  initialState,
  reducers: {
    clearRequests: (state) => {
      state.requests = [];
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPickupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPickupRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
        state.error = null;
      })
      .addCase(getPickupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.requests = []; // Initialize as empty array on error
      });
  },
});

export const { clearRequests, clearCurrentRequest } = pickupSlice.actions;
export default pickupSlice.reducer;