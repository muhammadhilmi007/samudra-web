// src/store/slices/pickupRequestSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import pickupRequestService from "../../services/pickupRequestService";
import { setLoading, setError, setSuccess } from "./uiSlice";
import {
  PickupRequest,
  PickupRequestFormInputs,
  Pickup,
  PickupFormInputs,
} from "../../types/pickupRequest";

interface PickupRequestState {
  pickupRequests: PickupRequest[];
  pickupRequest: PickupRequest | null;
  pendingRequests: PickupRequest[];
  pickups: Pickup[]; // Add this line
  loading: boolean;
  error: string | null;
}

const initialState: PickupRequestState = {
  pickupRequests: [],
  pickupRequest: null,
  pendingRequests: [],
  pickups: [], // Add this line
  loading: false,
  error: null,
};

// Get all pickup requests
export const getPickupRequests = createAsyncThunk(
  "pickupRequest/getPickupRequests",
  async (filters: Record<string, any> = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickupRequests(filters);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message || "Failed to fetch pickup requests"
        )
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch pickup requests" }
      );
    }
  }
);

// Get pending pickup requests
export const getPendingPickupRequests = createAsyncThunk(
  "pickupRequest/getPendingPickupRequests",
  async (filters: Record<string, any> = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPendingPickupRequests(
        filters
      );
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message ||
            "Failed to fetch pending pickup requests"
        )
      );
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to fetch pending pickup requests",
        }
      );
    }
  }
);

// Get pickup request by ID
export const getPickupRequestById = createAsyncThunk(
  "pickupRequest/getPickupRequestById",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickupRequestById(id);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message || "Failed to fetch pickup request"
        )
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch pickup request" }
      );
    }
  }
);

// Create pickup request
export const createPickupRequest = createAsyncThunk(
  "pickupRequest/createPickupRequest",
  async (
    requestData: PickupRequestFormInputs,
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.createPickupRequest(
        requestData
      );
      dispatch(setLoading(false));
      dispatch(setSuccess("Permintaan pengambilan berhasil dibuat"));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message || "Failed to create pickup request"
        )
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to create pickup request" }
      );
    }
  }
);

// Update pickup request
export const updatePickupRequest = createAsyncThunk(
  "pickupRequest/updatePickupRequest",
  async (
    {
      id,
      requestData,
    }: { id: string; requestData: Partial<PickupRequestFormInputs> },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.updatePickupRequest(
        id,
        requestData
      );
      dispatch(setLoading(false));
      dispatch(setSuccess("Permintaan pengambilan berhasil diperbarui"));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message || "Failed to update pickup request"
        )
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to update pickup request" }
      );
    }
  }
);

// Update pickup request status
export const updatePickupRequestStatus = createAsyncThunk(
  "pickupRequest/updatePickupRequestStatus",
  async (
    { id, status }: { id: string; status: "PENDING" | "FINISH" },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.updatePickupRequestStatus(
        id,
        status
      );
      dispatch(setLoading(false));
      dispatch(setSuccess("Status permintaan pengambilan berhasil diperbarui"));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message ||
            "Failed to update pickup request status"
        )
      );
      return rejectWithValue(
        error.response?.data || {
          message: "Failed to update pickup request status",
        }
      );
    }
  }
);

// Delete pickup request
export const deletePickupRequest = createAsyncThunk(
  "pickupRequest/deletePickupRequest",
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await pickupRequestService.deletePickupRequest(id);
      dispatch(setLoading(false));
      dispatch(setSuccess("Permintaan pengambilan berhasil dihapus"));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(
          error.response?.data?.message || "Failed to delete pickup request"
        )
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete pickup request" }
      );
    }
  }
);

// Create pickup from pickup request
export const createPickup = createAsyncThunk(
  "pickupRequest/createPickup",
  async (pickupData: PickupFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.createPickup(pickupData);
      dispatch(setLoading(false));
      dispatch(setSuccess("Pengambilan berhasil dibuat"));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Failed to create pickup")
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to create pickup" }
      );
    }
  }
);

// Get all pickups (completed pickup requests)
export const getPickups = createAsyncThunk(
  "pickupRequest/getPickups",
  async (filters: Record<string, any> = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await pickupRequestService.getPickups(filters);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(
        setError(error.response?.data?.message || "Failed to fetch pickups")
      );
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch pickups" }
      );
    }
  }
);

const pickupRequestSlice = createSlice({
  name: "pickupRequest",
  initialState,
  reducers: {
    clearPickupRequest: (state) => {
      state.pickupRequest = null;
    },
    clearPickupRequests: (state) => {
      state.pickupRequests = [];
      state.pendingRequests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all pickup requests
      .addCase(getPickupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPickupRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequests = action.payload;
        state.error = null;
      })
      .addCase(getPickupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get pending pickup requests
      .addCase(getPendingPickupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingPickupRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
        state.error = null;
      })
      .addCase(getPendingPickupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get pickup request by ID
      .addCase(getPickupRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPickupRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequest = action.payload;
        state.error = null;
      })
      .addCase(getPickupRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create pickup request
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.pickupRequests = [action.payload, ...state.pickupRequests];
        if (action.payload.status === "PENDING") {
          state.pendingRequests = [action.payload, ...state.pendingRequests];
        }
        state.pickupRequest = action.payload;
      })

      // Update pickup request
      .addCase(updatePickupRequest.fulfilled, (state, action) => {
        state.pickupRequests = state.pickupRequests.map((request) =>
          request._id === action.payload._id ? action.payload : request
        );
        if (action.payload.status === "PENDING") {
          state.pendingRequests = state.pendingRequests.map((request) =>
            request._id === action.payload._id ? action.payload : request
          );
        } else {
          state.pendingRequests = state.pendingRequests.filter(
            (request) => request._id !== action.payload._id
          );
        }
        state.pickupRequest = action.payload;
      })

      // Update pickup request status
      .addCase(updatePickupRequestStatus.fulfilled, (state, action) => {
        state.pickupRequests = state.pickupRequests.map((request) =>
          request._id === action.payload._id ? action.payload : request
        );
        if (action.payload.status === "PENDING") {
          state.pendingRequests = state.pendingRequests.map((request) =>
            request._id === action.payload._id ? action.payload : request
          );
        } else {
          state.pendingRequests = state.pendingRequests.filter(
            (request) => request._id !== action.payload._id
          );
        }
        state.pickupRequest = action.payload;
      })

      // Get all pickups
      .addCase(getPickups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPickups.fulfilled, (state, action) => {
        state.loading = false;
        state.pickups = action.payload;
        state.error = null;
      })
      .addCase(getPickups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete pickup request
      .addCase(deletePickupRequest.fulfilled, (state, action) => {
        state.pickupRequests = state.pickupRequests.filter(
          (request) => request._id !== action.payload
        );
        state.pendingRequests = state.pendingRequests.filter(
          (request) => request._id !== action.payload
        );
        if (state.pickupRequest && state.pickupRequest._id === action.payload) {
          state.pickupRequest = null;
        }
      });
  },
});

export const { clearPickupRequest, clearPickupRequests } =
  pickupRequestSlice.actions;

export default pickupRequestSlice.reducer;
