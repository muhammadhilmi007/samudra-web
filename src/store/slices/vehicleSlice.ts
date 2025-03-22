// src/store/slices/vehicleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../../services/vehicleService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Vehicle } from '../../types/vehicle';

interface VehicleState {
  vehicles: Vehicle[];
  vehicle: Vehicle | null;
  trucks: Vehicle[];
  deliveryVehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  vehicle: null,
  trucks: [],
  deliveryVehicles: [],
  loading: false,
  error: null,
};

// Get all vehicles
export const getVehicles = createAsyncThunk(
  'vehicle/getVehicles',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.getVehicles();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch vehicles'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch vehicles' });
    }
  }
);

// Get vehicle by ID
export const getVehicleById = createAsyncThunk(
  'vehicle/getVehicleById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.getVehicleById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch vehicle'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch vehicle' });
    }
  }
);

// Get vehicles by branch
export const getVehiclesByBranch = createAsyncThunk(
  'vehicle/getVehiclesByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.getVehiclesByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch vehicles by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch vehicles by branch' });
    }
  }
);

// Get trucks
export const getTrucks = createAsyncThunk(
  'vehicle/getTrucks',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.getTrucks();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch trucks'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch trucks' });
    }
  }
);

// Get delivery vehicles
export const getDeliveryVehicles = createAsyncThunk(
  'vehicle/getDeliveryVehicles',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.getDeliveryVehicles();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch delivery vehicles'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch delivery vehicles' });
    }
  }
);

// Create vehicle
export const createVehicle = createAsyncThunk(
  'vehicle/createVehicle',
  async (vehicleData: FormData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.createVehicle(vehicleData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Kendaraan berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create vehicle'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create vehicle' });
    }
  }
);

// Update vehicle
export const updateVehicle = createAsyncThunk(
  'vehicle/updateVehicle',
  async ({ id, vehicleData }: { id: string; vehicleData: FormData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.updateVehicle(id, vehicleData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Kendaraan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update vehicle'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update vehicle' });
    }
  }
);

// Delete vehicle
export const deleteVehicle = createAsyncThunk(
  'vehicle/deleteVehicle',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await vehicleService.deleteVehicle(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Kendaraan berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete vehicle'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete vehicle' });
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    clearVehicle: (state) => {
      state.vehicle = null;
    },
    clearVehicles: (state) => {
      state.vehicles = [];
      state.trucks = [];
      state.deliveryVehicles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all vehicles
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload || []; // Ensure payload is an array
        state.loading = false;
      })
      // Get vehicle by ID
      .addCase(getVehicleById.fulfilled, (state, action) => {
        state.vehicle = action.payload;
      })
      // Get vehicles by branch
      .addCase(getVehiclesByBranch.fulfilled, (state, action) => {
        state.vehicles = action.payload;
      })
      // Get trucks
      .addCase(getTrucks.fulfilled, (state, action) => {
        state.trucks = action.payload;
      })
      // Get delivery vehicles
      .addCase(getDeliveryVehicles.fulfilled, (state, action) => {
        state.deliveryVehicles = action.payload;
      })
      // Create vehicle
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.vehicles.push(action.payload);
        state.vehicle = action.payload;
        
        // Update trucks or delivery vehicles lists if applicable
        if (action.payload.tipe === 'Antar Cabang') {
          state.trucks.push(action.payload);
        } else if (action.payload.tipe === 'Lansir') {
          state.deliveryVehicles.push(action.payload);
        }
      })
      // Update vehicle
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.map((vehicle) =>
          vehicle._id === action.payload._id ? action.payload : vehicle
        );
        state.vehicle = action.payload;
        
        // Update trucks list if applicable
        if (action.payload.tipe === 'Antar Cabang') {
          const truckIndex = state.trucks.findIndex(truck => truck._id === action.payload._id);
          if (truckIndex >= 0) {
            state.trucks[truckIndex] = action.payload;
          } else {
            state.trucks.push(action.payload);
          }
          state.deliveryVehicles = state.deliveryVehicles.filter(vehicle => vehicle._id !== action.payload._id);
        } 
        // Update delivery vehicles list if applicable
        else if (action.payload.tipe === 'Lansir') {
          const deliveryIndex = state.deliveryVehicles.findIndex(vehicle => vehicle._id === action.payload._id);
          if (deliveryIndex >= 0) {
            state.deliveryVehicles[deliveryIndex] = action.payload;
          } else {
            state.deliveryVehicles.push(action.payload);
          }
          state.trucks = state.trucks.filter(truck => truck._id !== action.payload._id);
        }
      })
      // Delete vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter((vehicle) => vehicle._id !== action.payload);
        state.trucks = state.trucks.filter((truck) => truck._id !== action.payload);
        state.deliveryVehicles = state.deliveryVehicles.filter((vehicle) => vehicle._id !== action.payload);
        
        if (state.vehicle && state.vehicle._id === action.payload) {
          state.vehicle = null;
        }
      });
  },
});

export const { clearVehicle, clearVehicles } = vehicleSlice.actions;

export default vehicleSlice.reducer;