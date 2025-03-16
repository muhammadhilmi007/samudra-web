// src/store/slices/deliverySlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import deliveryService from '../../services/deliveryService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Delivery, DeliveryFormInputs, DeliveryStatusUpdate, VehicleQueue, VehicleQueueFormInputs } from '../../types/delivery';

interface DeliveryState {
  deliveries: Delivery[];
  currentDelivery: Delivery | null;
  vehicleQueues: VehicleQueue[];
  currentVehicleQueue: VehicleQueue | null;
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: DeliveryState = {
  deliveries: [],
  currentDelivery: null,
  vehicleQueues: [],
  currentVehicleQueue: null,
  pdfUrl: null,
  loading: false,
  error: null,
};

// Get all deliveries
export const getDeliveries = createAsyncThunk(
  'delivery/getDeliveries',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getDeliveries();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch deliveries'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch deliveries' });
    }
  }
);

// Get delivery by ID
export const getDeliveryById = createAsyncThunk(
  'delivery/getDeliveryById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getDeliveryById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch delivery'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch delivery' });
    }
  }
);

// Get deliveries by branch
export const getDeliveriesByBranch = createAsyncThunk(
  'delivery/getDeliveriesByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getDeliveriesByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch deliveries by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch deliveries by branch' });
    }
  }
);

// Get deliveries by STT
export const getDeliveriesBySTT = createAsyncThunk(
  'delivery/getDeliveriesBySTT',
  async (sttId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getDeliveriesBySTT(sttId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch deliveries by STT'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch deliveries by STT' });
    }
  }
);

// Create delivery
export const createDelivery = createAsyncThunk(
  'delivery/createDelivery',
  async (deliveryData: DeliveryFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.createDelivery(deliveryData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengiriman berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create delivery'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create delivery' });
    }
  }
);

// Update delivery
export const updateDelivery = createAsyncThunk(
  'delivery/updateDelivery',
  async ({ id, deliveryData }: { id: string; deliveryData: Partial<DeliveryFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.updateDelivery(id, deliveryData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pengiriman berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update delivery'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update delivery' });
    }
  }
);

// Update delivery status
export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateDeliveryStatus',
  async ({ id, statusData }: { id: string; statusData: DeliveryStatusUpdate }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.updateDeliveryStatus(id, statusData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status pengiriman berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update delivery status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update delivery status' });
    }
  }
);

// Generate delivery form
export const generateDeliveryForm = createAsyncThunk(
  'delivery/generateDeliveryForm',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.generateDeliveryForm(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to generate delivery form'));
      return rejectWithValue(error.response?.data || { message: 'Failed to generate delivery form' });
    }
  }
);

// Get all vehicle queues
export const getVehicleQueues = createAsyncThunk(
  'delivery/getVehicleQueues',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getVehicleQueues();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch vehicle queues'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch vehicle queues' });
    }
  }
);

// Get vehicle queue by ID
export const getVehicleQueueById = createAsyncThunk(
  'delivery/getVehicleQueueById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getVehicleQueueById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch vehicle queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch vehicle queue' });
    }
  }
);

// Get vehicle queues by branch
export const getVehicleQueuesByBranch = createAsyncThunk(
  'delivery/getVehicleQueuesByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.getVehicleQueuesByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch vehicle queues by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch vehicle queues by branch' });
    }
  }
);

// Create vehicle queue
export const createVehicleQueue = createAsyncThunk(
  'delivery/createVehicleQueue',
  async (queueData: VehicleQueueFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.createVehicleQueue(queueData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Antrian kendaraan berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create vehicle queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create vehicle queue' });
    }
  }
);

// Update vehicle queue
export const updateVehicleQueue = createAsyncThunk(
  'delivery/updateVehicleQueue',
  async ({ id, queueData }: { id: string; queueData: Partial<VehicleQueueFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.updateVehicleQueue(id, queueData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Antrian kendaraan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update vehicle queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update vehicle queue' });
    }
  }
);

// Update vehicle queue status
export const updateVehicleQueueStatus = createAsyncThunk(
  'delivery/updateVehicleQueueStatus',
  async ({ id, status }: { id: string; status: 'MENUNGGU' | 'LANSIR' | 'KEMBALI' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await deliveryService.updateVehicleQueueStatus(id, status);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status antrian kendaraan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update vehicle queue status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update vehicle queue status' });
    }
  }
);

// Delete vehicle queue
export const deleteVehicleQueue = createAsyncThunk(
  'delivery/deleteVehicleQueue',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await deliveryService.deleteVehicleQueue(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Antrian kendaraan berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete vehicle queue'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete vehicle queue' });
    }
  }
);

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearCurrentDelivery: (state) => {
      state.currentDelivery = null;
    },
    clearDeliveries: (state) => {
      state.deliveries = [];
    },
    clearCurrentVehicleQueue: (state) => {
      state.currentVehicleQueue = null;
    },
    clearVehicleQueues: (state) => {
      state.vehicleQueues = [];
    },
    clearPDFUrl: (state) => {
      state.pdfUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all deliveries
      .addCase(getDeliveries.fulfilled, (state, action) => {
        state.deliveries = action.payload;
      })
      // Get delivery by ID
      .addCase(getDeliveryById.fulfilled, (state, action) => {
        state.currentDelivery = action.payload;
      })
      // Get deliveries by branch
      .addCase(getDeliveriesByBranch.fulfilled, (state, action) => {
        state.deliveries = action.payload;
      })
      // Get deliveries by STT
      .addCase(getDeliveriesBySTT.fulfilled, (state, action) => {
        state.deliveries = action.payload;
      })
      // Create delivery
      .addCase(createDelivery.fulfilled, (state, action) => {
        state.deliveries.push(action.payload);
        state.currentDelivery = action.payload;
      })
      // Update delivery
      .addCase(updateDelivery.fulfilled, (state, action) => {
        state.deliveries = state.deliveries.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentDelivery = action.payload;
      })
      // Update delivery status
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        state.deliveries = state.deliveries.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentDelivery = action.payload;
      })
      // Generate delivery form
      .addCase(generateDeliveryForm.fulfilled, (state, action) => {
        state.pdfUrl = action.payload.url;
      })
      // Get all vehicle queues
      .addCase(getVehicleQueues.fulfilled, (state, action) => {
        state.vehicleQueues = action.payload;
      })
      // Get vehicle queue by ID
      .addCase(getVehicleQueueById.fulfilled, (state, action) => {
        state.currentVehicleQueue = action.payload;
      })
      // Get vehicle queues by branch
      .addCase(getVehicleQueuesByBranch.fulfilled, (state, action) => {
        state.vehicleQueues = action.payload;
      })
      // Create vehicle queue
      .addCase(createVehicleQueue.fulfilled, (state, action) => {
        state.vehicleQueues.push(action.payload);
        state.currentVehicleQueue = action.payload;
      })
      // Update vehicle queue
      .addCase(updateVehicleQueue.fulfilled, (state, action) => {
        state.vehicleQueues = state.vehicleQueues.map((queue) =>
          queue._id === action.payload._id ? action.payload : queue
        );
        state.currentVehicleQueue = action.payload;
      })
      // Update vehicle queue status
      .addCase(updateVehicleQueueStatus.fulfilled, (state, action) => {
        state.vehicleQueues = state.vehicleQueues.map((queue) =>
          queue._id === action.payload._id ? action.payload : queue
        );
        state.currentVehicleQueue = action.payload;
      })
      // Delete vehicle queue
      .addCase(deleteVehicleQueue.fulfilled, (state, action) => {
        state.vehicleQueues = state.vehicleQueues.filter((queue) => queue._id !== action.payload);
        if (state.currentVehicleQueue && state.currentVehicleQueue._id === action.payload) {
          state.currentVehicleQueue = null;
        }
      });
  },
});

export const {
  clearCurrentDelivery,
  clearDeliveries,
  clearCurrentVehicleQueue,
  clearVehicleQueues,
  clearPDFUrl,
} = deliverySlice.actions;

export default deliverySlice.reducer;