// src/store/slices/loadingSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loadingService from '../../services/loadingService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Loading, LoadingFormInputs, LoadingStatusUpdate, TruckQueue, TruckQueueFormInputs } from '../../types/loading';

interface LoadingState {
  loadings: Loading[];
  loading: Loading | null;
  truckQueues: TruckQueue[];
  truckQueue: TruckQueue | null;
  pdfUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LoadingState = {
  loadings: [],
  loading: null,
  truckQueues: [],
  truckQueue: null,
  pdfUrl: null,
  isLoading: false,
  error: null,
};

// Get all loadings
export const getLoadings = createAsyncThunk(
  'loading/getLoadings',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getLoadings();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch loadings'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch loadings' });
    }
  }
);

// Get loading by ID
export const getLoadingById = createAsyncThunk(
  'loading/getLoadingById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getLoadingById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch loading'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch loading' });
    }
  }
);

// Get loadings by STT
export const getLoadingsBySTT = createAsyncThunk(
  'loading/getLoadingsBySTT',
  async (sttId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getLoadingsBySTT(sttId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch loadings by STT'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch loadings by STT' });
    }
  }
);

// Get loadings by truck
export const getLoadingsByTruck = createAsyncThunk(
  'loading/getLoadingsByTruck',
  async (truckId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getLoadingsByTruck(truckId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch loadings by truck'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch loadings by truck' });
    }
  }
);

// Create loading
export const createLoading = createAsyncThunk(
  'loading/createLoading',
  async (loadingData: LoadingFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.createLoading(loadingData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pemuatan berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create loading'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create loading' });
    }
  }
);

// Update loading
export const updateLoading = createAsyncThunk(
  'loading/updateLoading',
  async ({ id, loadingData }: { id: string; loadingData: Partial<LoadingFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.updateLoading(id, loadingData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pemuatan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update loading'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update loading' });
    }
  }
);

// Update loading status
export const updateLoadingStatus = createAsyncThunk(
  'loading/updateLoadingStatus',
  async ({ id, statusData }: { id: string; statusData: LoadingStatusUpdate }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.updateLoadingStatus(id, statusData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status pemuatan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update loading status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update loading status' });
    }
  }
);

// Add this implementation for the deleteLoading thunk
export const deleteLoading = createAsyncThunk(
  'loadings/deleteLoading',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await loadingService.deleteLoading(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pemuatan berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete loading'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete loading' });
    }
  }
);

// Generate DMB (Daftar Muat Barang)
export const generateDMB = createAsyncThunk(
  'loading/generateDMB',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.generateDMB(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to generate DMB'));
      return rejectWithValue(error.response?.data || { message: 'Failed to generate DMB' });
    }
  }
);

// Get all truck queues
export const getTruckQueues = createAsyncThunk(
  'loading/getTruckQueues',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getTruckQueues();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch truck queues'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch truck queues' });
    }
  }
);

// Get truck queue by ID
export const getTruckQueueById = createAsyncThunk(
  'loading/getTruckQueueById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getTruckQueueById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch truck queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch truck queue' });
    }
  }
);

// Get truck queues by branch
export const getTruckQueuesByBranch = createAsyncThunk(
  'loading/getTruckQueuesByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getTruckQueuesByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch truck queues by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch truck queues by branch' });
    }
  }
);

// Get truck queues by status
export const getTruckQueuesByStatus = createAsyncThunk(
  'loading/getTruckQueuesByStatus',
  async (status: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.getTruckQueuesByStatus(status);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch truck queues by status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch truck queues by status' });
    }
  }
);

// Create truck queue
export const createTruckQueue = createAsyncThunk(
  'loading/createTruckQueue',
  async (queueData: TruckQueueFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.createTruckQueue(queueData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Antrian truk berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create truck queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create truck queue' });
    }
  }
);

// Update truck queue
export const updateTruckQueue = createAsyncThunk(
  'loading/updateTruckQueue',
  async ({ id, queueData }: { id: string; queueData: Partial<TruckQueueFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.updateTruckQueue(id, queueData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Antrian truk berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update truck queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update truck queue' });
    }
  }
);

// Update truck queue status
export const updateTruckQueueStatus = createAsyncThunk(
  'loading/updateTruckQueueStatus',
  async ({ id, status }: { id: string; status: 'MENUNGGU' | 'MUAT' | 'BERANGKAT' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await loadingService.updateTruckQueueStatus(id, status);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status antrian truk berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update truck queue status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update truck queue status' });
    }
  }
);

// Delete truck queue
export const deleteTruckQueue = createAsyncThunk(
  'loading/deleteTruckQueue',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await loadingService.deleteTruckQueue(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Antrian truk berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete truck queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete truck queue' });
    }
  }
);

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    clearLoading: (state) => {
      state.loading = null;
    },
    clearLoadings: (state) => {
      state.loadings = [];
    },
    clearTruckQueue: (state) => {
      state.truckQueue = null;
    },
    clearTruckQueues: (state) => {
      state.truckQueues = [];
    },
    clearPDFUrl: (state) => {
      state.pdfUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all loadings
      .addCase(getLoadings.fulfilled, (state, action) => {
        state.loadings = action.payload;
      })
      // Get loading by ID
      .addCase(getLoadingById.fulfilled, (state, action) => {
        state.loading = action.payload;
      })
      // Get loadings by STT
      .addCase(getLoadingsBySTT.fulfilled, (state, action) => {
        state.loadings = action.payload;
      })
      // Get loadings by truck
      .addCase(getLoadingsByTruck.fulfilled, (state, action) => {
        state.loadings = action.payload;
      })
      // Create loading
      .addCase(createLoading.fulfilled, (state, action) => {
        state.loadings.push(action.payload);
        state.loading = action.payload;
      })
      // Update loading
      .addCase(updateLoading.fulfilled, (state, action) => {
        state.loadings = state.loadings.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.loading = action.payload;
      })
      // Update loading status
      .addCase(updateLoadingStatus.fulfilled, (state, action) => {
        state.loadings = state.loadings.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.loading = action.payload;
      })
      // Generate DMB
      .addCase(generateDMB.fulfilled, (state, action) => {
        state.pdfUrl = action.payload.url;
      })
      // Get all truck queues
      .addCase(getTruckQueues.fulfilled, (state, action) => {
        state.truckQueues = action.payload;
      })
      // Get truck queue by ID
      .addCase(getTruckQueueById.fulfilled, (state, action) => {
        state.truckQueue = action.payload;
      })
      // Get truck queues by branch
      .addCase(getTruckQueuesByBranch.fulfilled, (state, action) => {
        state.truckQueues = action.payload;
      })
      // Get truck queues by status
      .addCase(getTruckQueuesByStatus.fulfilled, (state, action) => {
        state.truckQueues = action.payload;
      })
      // Create truck queue
      .addCase(createTruckQueue.fulfilled, (state, action) => {
        state.truckQueues.push(action.payload);
        state.truckQueue = action.payload;
      })
      // Update truck queue
      .addCase(updateTruckQueue.fulfilled, (state, action) => {
        state.truckQueues = state.truckQueues.map((queue) =>
          queue._id === action.payload._id ? action.payload : queue
        );
        state.truckQueue = action.payload;
      })
      // Update truck queue status
      .addCase(updateTruckQueueStatus.fulfilled, (state, action) => {
        state.truckQueues = state.truckQueues.map((queue) =>
          queue._id === action.payload._id ? action.payload : queue
        );
        state.truckQueue = action.payload;
      })
      // Delete truck queue
      .addCase(deleteTruckQueue.fulfilled, (state, action) => {
        state.truckQueues = state.truckQueues.filter((queue) => queue._id !== action.payload);
        if (state.truckQueue && state.truckQueue._id === action.payload) {
          state.truckQueue = null;
        }
      })
      // Delete loading
      .addCase(deleteLoading.fulfilled, (state, action) => {
        state.loadings = state.loadings.filter((loading) => loading._id !== action.payload);
        if (state.loading && state.loading._id === action.payload) {
          state.loading = null;
        }
      });
  },
});

export const {
  clearLoading,
  clearLoadings,
  clearTruckQueue,
  clearTruckQueues,
  clearPDFUrl,
} = loadingSlice.actions;

export default loadingSlice.reducer;