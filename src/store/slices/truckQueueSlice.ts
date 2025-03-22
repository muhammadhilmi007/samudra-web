import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Types
interface TruckQueue {
  _id: string;
  id: string;
  cabangId: string;
  vehicleId: string; 
  supirId: string;
  arrivalTime: string;
  status: TruckQueueStatus;
}

type TruckQueueStatus = 'waiting' | 'processing' | 'completed';

interface TruckQueueState {
  truckQueues: TruckQueue[];
  loading: boolean;
  error: string | null;
}

// API endpoints
const API_ENDPOINTS = {
  BASE: '/api/trucks',
  status: (id: string) => `/api/trucks/${id}/status`,
  byId: (id: string) => `/api/trucks/${id}`,
} as const;

// Initial state
const initialState: TruckQueueState = {
  truckQueues: [],
  loading: false,
  error: null
};

// Async thunks
export const getTruckQueues = createAsyncThunk(
  'truckQueue/getTruckQueues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.BASE);
      if (!response.ok) throw new Error('Failed to fetch truck queues');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const createTruckQueue = createAsyncThunk(
  'truckQueue/createTruckQueue',
  async (truckData: Omit<TruckQueue, '_id' | 'id'>, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(truckData),
      });
      if (!response.ok) throw new Error('Failed to create truck queue');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateTruckQueue = createAsyncThunk(
  'truckQueue/updateTruckQueue',
  async ({ id, truckData }: { id: string; truckData: Partial<TruckQueue> }, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.byId(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(truckData),
      });
      if (!response.ok) throw new Error('Failed to update truck queue');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const deleteTruckQueue = createAsyncThunk(
  'truckQueue/deleteTruckQueue',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(API_ENDPOINTS.byId(id), { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete truck queue');
      return id;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// Slice
const truckQueueSlice = createSlice({
  name: 'truckQueue',
  initialState,
  reducers: {
    updateTruckQueueStatus(state, action: PayloadAction<{ id: string; status: TruckQueueStatus }>) {
      const truckQueue = state.truckQueues.find(queue => queue.id === action.payload.id);
      if (truckQueue) {
        truckQueue.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get truck queues
      .addCase(getTruckQueues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTruckQueues.fulfilled, (state, action) => {
        state.truckQueues = action.payload;
        state.loading = false;
      })
      .addCase(getTruckQueues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create truck queue
      .addCase(createTruckQueue.fulfilled, (state, action) => {
        state.truckQueues.push(action.payload);
      })
      // Delete truck queue
      .addCase(deleteTruckQueue.fulfilled, (state, action) => {
        state.truckQueues = state.truckQueues.filter(queue => queue.id !== action.payload);
      });
  },
});
      
// Selectors
export const selectTruckQueues = (state: RootState) => state.truckQueue.truckQueues;
export const selectTruckQueueLoading = (state: RootState) => state.truckQueue.loading;
export const selectTruckQueueError = (state: RootState) => state.truckQueue.error;

export const { updateTruckQueueStatus } = truckQueueSlice.actions;
export default truckQueueSlice.reducer;