// src/store/slices/pickupSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pickupService from '../../services/pickupService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Pickup, PickupFormInputs } from '../../types/pickupRequest';

interface PickupState {
  pickup: Pickup[];
  selectedPickup: Pickup | null;
  loading: boolean;
  error: string | null;
}

const initialState: PickupState = {
  pickup: [],
  selectedPickup: null,
  loading: false,
  error: null
};

// Get all pickups
export const getPickupRequests = createAsyncThunk(
  'pickup/getRequests',
  async (filters: Record<string, any> = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.getPickups(filters);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pickups'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pickups' });
    }
  }
);

// Get pickup by ID
export const getPickupById = createAsyncThunk(
  'pickup/getPickupById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.getPickupById(id);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pickup details'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pickup details' });
    }
  }
);

// Create pickup
export const createPickup = createAsyncThunk(
  'pickup/createPickup',
  async (pickupData: PickupFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.createPickup(pickupData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengambilan berhasil dibuat'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create pickup' });
    }
  }
);

// Update pickup
export const updatePickup = createAsyncThunk(
  'pickup/updatePickup',
  async ({ id, pickupData }: { id: string; pickupData: Partial<PickupFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.updatePickup(id, pickupData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengambilan berhasil diperbarui'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update pickup' });
    }
  }
);

// Delete pickup
export const deletePickup = createAsyncThunk(
  'pickup/deletePickup',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await pickupService.deletePickup(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengambilan berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete pickup' });
    }
  }
);

// Update pickup status
export const updatePickupStatus = createAsyncThunk(
  'pickup/updatePickupStatus',
  async ({ id, status }: { id: string; status: 'PENDING' | 'BERANGKAT' | 'SELESAI' | 'CANCELLED' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.updatePickupStatus(id, status);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status pengambilan berhasil diperbarui'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update pickup status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update pickup status' });
    }
  }
);

// Add STT to pickup
export const addSTTToPickup = createAsyncThunk(
  'pickup/addSTTToPickup',
  async ({ id, sttIds }: { id: string; sttIds: string[] }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.addSTTToPickup(id, sttIds);
      dispatch(setLoading(false));
      dispatch(setSuccess('STT berhasil ditambahkan ke pengambilan'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to add STT to pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to add STT to pickup' });
    }
  }
);

// src/store/slices/pickupSlice.ts (continued)
// Remove STT from pickup
export const removeSTTFromPickup = createAsyncThunk(
  'pickup/removeSTTFromPickup',
  async ({ id, sttId }: { id: string; sttId: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupService.removeSTTFromPickup(id, sttId);
      dispatch(setLoading(false));
      dispatch(setSuccess('STT berhasil dihapus dari pengambilan'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to remove STT from pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to remove STT from pickup' });
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
      // Get all pickups
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
      
      // Get pickup by ID
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
      
      // Create pickup
      .addCase(createPickup.fulfilled, (state, action) => {
        state.pickup = [action.payload, ...state.pickup];
        state.selectedPickup = action.payload;
      })
      
      // Update pickup
      .addCase(updatePickup.fulfilled, (state, action) => {
        state.pickup = state.pickup.map((item) => 
          item._id === action.payload._id ? action.payload : item
        );
        state.selectedPickup = action.payload;
      })
      
      // Delete pickup
      .addCase(deletePickup.fulfilled, (state, action) => {
        state.pickup = state.pickup.filter((item) => item._id !== action.payload);
        if (state.selectedPickup && state.selectedPickup._id === action.payload) {
          state.selectedPickup = null;
        }
      })
      
      // Update pickup status
      .addCase(updatePickupStatus.fulfilled, (state, action) => {
        state.pickup = state.pickup.map((item) => 
          item._id === action.payload._id ? action.payload : item
        );
        state.selectedPickup = action.payload;
      })
      
      // Add STT to pickup
      .addCase(addSTTToPickup.fulfilled, (state, action) => {
        state.pickup = state.pickup.map((item) => 
          item._id === action.payload._id ? action.payload : item
        );
        state.selectedPickup = action.payload;
      })
      
      // Remove STT from pickup
      .addCase(removeSTTFromPickup.fulfilled, (state, action) => {
        state.pickup = state.pickup.map((item) => 
          item._id === action.payload._id ? action.payload : item
        );
        state.selectedPickup = action.payload;
      });
  },
});

export const { clearPickup, clearSelectedPickup } = pickupSlice.actions;
export default pickupSlice.reducer;