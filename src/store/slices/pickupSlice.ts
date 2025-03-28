// src/store/slices/pickupSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Pickup, PickupRequest } from '../../types/pickupRequest';

interface PickupState {
  pickup: Pickup[];
  loading: boolean;
  error: string | null;
  selectedPickup: Pickup | null;
}

const initialState: PickupState = {
  pickup: [],
  loading: false,
  error: null,
  selectedPickup: null
};

export const getPickupRequests = createAsyncThunk(
  'pickup/getRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/pickups');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pickups');
    }
  }
);

export const getPickupById = createAsyncThunk(
  'pickup/getPickupById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/pickups/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pickup details');
    }
  }
);

export const deletePickup = createAsyncThunk(
  'pickup/deletePickup',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/pickups/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete pickup');
    }
  }
);

export const updatePickup = createAsyncThunk(
  'pickup/updatePickup',
  async ({ id, pickupData }: { id: string; pickupData: Partial<Pickup> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/pickups/${id}`, pickupData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update pickup');
    }
  }
);

const pickupSlice = createSlice({
  name: 'pickup',
  initialState,
  reducers: {
    clearPickup: (state) => {
      state.pickup = [];
    },
    clearSelectedPickup: (state) => {
      state.selectedPickup = null;
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
        state.pickup = action.payload;
        state.error = null;
      })
      .addCase(getPickupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getPickupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPickupById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPickup = action.payload;
        state.error = null;
      })
      .addCase(getPickupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePickup.fulfilled, (state, action) => {
        state.pickup = state.pickup.filter(item => item._id !== action.payload);
        if (state.selectedPickup && state.selectedPickup._id === action.payload) {
          state.selectedPickup = null;
        }
      })
      .addCase(updatePickup.fulfilled, (state, action) => {
        state.pickup = state.pickup.map(item => 
          item._id === action.payload._id ? action.payload : item
        );
        state.selectedPickup = action.payload;
      });
  },
});

export const { clearPickup, clearSelectedPickup } = pickupSlice.actions;
export default pickupSlice.reducer;
