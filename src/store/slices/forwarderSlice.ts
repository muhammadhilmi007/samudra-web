import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import API_URL from '../../services/api';

// Define the forwarder type
interface Forwarder {
  _id: string;
  namaPenerus: string;
  alamat?: string;
  noTelp?: string;
  email?: string;
  kota?: string;
  kodePos?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// State interface
interface ForwarderState {
  forwarders: Forwarder[];
  selectedForwarder: Forwarder | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: ForwarderState = {
  forwarders: [],
  selectedForwarder: null,
  loading: false,
  error: null
};

// Async thunks
export const getForwarders = createAsyncThunk(
  'forwarder/getForwarders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/forwarders`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch forwarders');
    }
  }
);

export const getForwarderById = createAsyncThunk(
  'forwarder/getForwarderById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/forwarders/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch forwarder');
    }
  }
);

export const createForwarder = createAsyncThunk(
  'forwarder/createForwarder',
  async (data: Omit<Forwarder, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/forwarders`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create forwarder');
    }
  }
);

export const updateForwarder = createAsyncThunk(
  'forwarder/updateForwarder',
  async ({ id, data }: { id: string; data: Partial<Forwarder> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/forwarders/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update forwarder');
    }
  }
);

export const deleteForwarder = createAsyncThunk(
  'forwarder/deleteForwarder',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/forwarders/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete forwarder');
    }
  }
);

// Create the slice
const forwarderSlice = createSlice({
  name: 'forwarder',
  initialState,
  reducers: {
    clearSelectedForwarder(state) {
      state.selectedForwarder = null;
    },
    clearErrors(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all forwarders
      .addCase(getForwarders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getForwarders.fulfilled, (state, action: PayloadAction<Forwarder[]>) => {
        state.loading = false;
        state.forwarders = action.payload;
      })
      .addCase(getForwarders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get forwarder by ID
      .addCase(getForwarderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getForwarderById.fulfilled, (state, action: PayloadAction<Forwarder>) => {
        state.loading = false;
        state.selectedForwarder = action.payload;
      })
      .addCase(getForwarderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create forwarder
      .addCase(createForwarder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createForwarder.fulfilled, (state, action: PayloadAction<Forwarder>) => {
        state.loading = false;
        state.forwarders.push(action.payload);
      })
      .addCase(createForwarder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update forwarder
      .addCase(updateForwarder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateForwarder.fulfilled, (state, action: PayloadAction<Forwarder>) => {
        state.loading = false;
        state.forwarders = state.forwarders.map(forwarder => 
          forwarder._id === action.payload._id ? action.payload : forwarder
        );
        state.selectedForwarder = action.payload;
      })
      .addCase(updateForwarder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete forwarder
      .addCase(deleteForwarder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteForwarder.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.forwarders = state.forwarders.filter(forwarder => forwarder._id !== action.payload);
        if (state.selectedForwarder && state.selectedForwarder._id === action.payload) {
          state.selectedForwarder = null;
        }
      })
      .addCase(deleteForwarder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSelectedForwarder, clearErrors } = forwarderSlice.actions;
export default forwarderSlice.reducer;
