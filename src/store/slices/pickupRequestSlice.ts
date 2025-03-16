// src/store/slices/pickupRequestSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pickupRequestService from '../../services/pickupRequestService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { PickupRequest, PickupRequestFormInputs, Pickup, PickupFormInputs } from '../../types/pickupRequest';

interface PickupRequestState {
  pickupRequests: PickupRequest[];
  pickupRequest: PickupRequest | null;
  pendingRequests: PickupRequest[];
  pickups: Pickup[];
  pickup: Pickup | null;
  loading: boolean;
  error: string | null;
}

const initialState: PickupRequestState = {
  pickupRequests: [],
  pickupRequest: null,
  pendingRequests: [],
  pickups: [],
  pickup: null,
  loading: false,
  error: null,
};

// Get all pickup requests
export const getPickupRequests = createAsyncThunk(
  'pickupRequest/getPickupRequests',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickupRequests();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pickup requests'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pickup requests' });
    }
  }
);

// Get pending pickup requests
export const getPendingPickupRequests = createAsyncThunk(
  'pickupRequest/getPendingPickupRequests',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPendingPickupRequests();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pending pickup requests'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pending pickup requests' });
    }
  }
);

// Get pickup request by ID
export const getPickupRequestById = createAsyncThunk(
  'pickupRequest/getPickupRequestById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickupRequestById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pickup request'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pickup request' });
    }
  }
);

// Create pickup request
export const createPickupRequest = createAsyncThunk(
  'pickupRequest/createPickupRequest',
  async (requestData: PickupRequestFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.createPickupRequest(requestData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Permintaan pengambilan berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create pickup request'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create pickup request' });
    }
  }
);

// Update pickup request
export const updatePickupRequest = createAsyncThunk(
  'pickupRequest/updatePickupRequest',
  async ({ id, requestData }: { id: string; requestData: Partial<PickupRequestFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.updatePickupRequest(id, requestData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Permintaan pengambilan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update pickup request'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update pickup request' });
    }
  }
);

// Update pickup request status
export const updatePickupRequestStatus = createAsyncThunk(
  'pickupRequest/updatePickupRequestStatus',
  async ({ id, status }: { id: string; status: 'PENDING' | 'FINISH' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.updatePickupRequestStatus(id, status);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status permintaan pengambilan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update pickup request status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update pickup request status' });
    }
  }
);

// Delete pickup request
export const deletePickupRequest = createAsyncThunk(
  'pickupRequest/deletePickupRequest',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await pickupRequestService.deletePickupRequest(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Permintaan pengambilan berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete pickup request'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete pickup request' });
    }
  }
);

// Get all pickups
export const getPickups = createAsyncThunk(
  'pickupRequest/getPickups',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickups();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pickups'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pickups' });
    }
  }
);

// Get pickup by ID
export const getPickupById = createAsyncThunk(
  'pickupRequest/getPickupById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickupById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch pickup' });
    }
  }
);

// Create pickup
export const createPickup = createAsyncThunk(
  'pickupRequest/createPickup',
  async (pickupData: PickupFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.createPickup(pickupData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengambilan berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create pickup' });
    }
  }
);

// Update pickup
export const updatePickup = createAsyncThunk(
  'pickupRequest/updatePickup',
  async ({ id, pickupData }: { id: string; pickupData: Partial<PickupFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.updatePickup(id, pickupData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengambilan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update pickup' });
    }
  }
);

// Delete pickup
export const deletePickup = createAsyncThunk(
  'pickupRequest/deletePickup',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await pickupRequestService.deletePickup(id);
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

// Add STT to pickup
export const addSTTToPickup = createAsyncThunk(
  'pickupRequest/addSTTToPickup',
  async ({ id, sttId }: { id: string; sttId: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.addSTTToPickup(id, sttId);
      dispatch(setLoading(false));
      dispatch(setSuccess('STT berhasil ditambahkan ke pengambilan'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to add STT to pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to add STT to pickup' });
    }
  }
);

// Remove STT from pickup
export const removeSTTFromPickup = createAsyncThunk(
  'pickupRequest/removeSTTFromPickup',
  async ({ id, sttId }: { id: string; sttId: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.removeSTTFromPickup(id, sttId);
      dispatch(setLoading(false));
      dispatch(setSuccess('STT berhasil dihapus dari pengambilan'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to remove STT from pickup'));
      return rejectWithValue(error.response?.data || { message: 'Failed to remove STT from pickup' });
    }
  }
);

const pickupRequestSlice = createSlice({
  name: 'pickupRequest',
  initialState,
  reducers: {
    clearPickupRequest: (state) => {
      state.pickupRequest = null;
    },
    clearPickupRequests: (state) => {
      state.pickupRequests = [];
      state.pendingRequests = [];
    },
    clearPickup: (state) => {
      state.pickup = null;
    },
    clearPickups: (state) => {
      state.pickups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all pickup requests
      .addCase(getPickupRequests.fulfilled, (state, action) => {
        state.pickupRequests = action.payload;
      })
      // Get pending pickup requests
      .addCase(getPendingPickupRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      // Get pickup request by ID
      .addCase(getPickupRequestById.fulfilled, (state, action) => {
        state.pickupRequest = action.payload;
      })
      // Create pickup request
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.pickupRequests.push(action.payload);
        if (action.payload.status === 'PENDING') {
          state.pendingRequests.push(action.payload);
        }
        state.pickupRequest = action.payload;
      })
      // Update pickup request
      .addCase(updatePickupRequest.fulfilled, (state, action) => {
        state.pickupRequests = state.pickupRequests.map((request) =>
          request._id === action.payload._id ? action.payload : request
        );
        if (action.payload.status === 'PENDING') {
          state.pendingRequests = state.pendingRequests.map((request) =>
            request._id === action.payload._id ? action.payload : request
          );
        } else {
          state.pendingRequests = state.pendingRequests.filter((request) => request._id !== action.payload._id);
        }
        state.pickupRequest = action.payload;
      })
      // Update pickup request status
      .addCase(updatePickupRequestStatus.fulfilled, (state, action) => {
        state.pickupRequests = state.pickupRequests.map((request) =>
          request._id === action.payload._id ? action.payload : request
        );
        if (action.payload.status === 'PENDING') {
          state.pendingRequests = state.pendingRequests.map((request) =>
            request._id === action.payload._id ? action.payload : request
          );
        } else {
          state.pendingRequests = state.pendingRequests.filter((request) => request._id !== action.payload._id);
        }
        state.pickupRequest = action.payload;
      })
      // Delete pickup request
      .addCase(deletePickupRequest.fulfilled, (state, action) => {
        state.pickupRequests = state.pickupRequests.filter((request) => request._id !== action.payload);
        state.pendingRequests = state.pendingRequests.filter((request) => request._id !== action.payload);
        if (state.pickupRequest && state.pickupRequest._id === action.payload) {
          state.pickupRequest = null;
        }
      })
      // Get all pickups
      .addCase(getPickups.fulfilled, (state, action) => {
        state.pickups = action.payload;
      })
      // Get pickup by ID
      .addCase(getPickupById.fulfilled, (state, action) => {
        state.pickup = action.payload;
      })
      // Create pickup
      .addCase(createPickup.fulfilled, (state, action) => {
        state.pickups.push(action.payload);
        state.pickup = action.payload;
      })
      // Update pickup
      .addCase(updatePickup.fulfilled, (state, action) => {
        state.pickups = state.pickups.map((pickup) =>
          pickup._id === action.payload._id ? action.payload : pickup
        );
        state.pickup = action.payload;
      })
      // Delete pickup
      .addCase(deletePickup.fulfilled, (state, action) => {
        state.pickups = state.pickups.filter((pickup) => pickup._id !== action.payload);
        if (state.pickup && state.pickup._id === action.payload) {
          state.pickup = null;
        }
      })
      // Add STT to pickup
      .addCase(addSTTToPickup.fulfilled, (state, action) => {
        state.pickups = state.pickups.map((pickup) =>
          pickup._id === action.payload._id ? action.payload : pickup
        );
        state.pickup = action.payload;
      })
      // Remove STT from pickup
      .addCase(removeSTTFromPickup.fulfilled, (state, action) => {
        state.pickups = state.pickups.map((pickup) =>
          pickup._id === action.payload._id ? action.payload : pickup
        );
        state.pickup = action.payload;
      });
  },
});

export const { clearPickupRequest, clearPickupRequests, clearPickup, clearPickups } = pickupRequestSlice.actions;

export default pickupRequestSlice.reducer;