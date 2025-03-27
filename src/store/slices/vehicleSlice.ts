// src/store/slices/vehicleSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vehicleService from '../../services/vehicleService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Vehicle, mapVehicleTypeToFrontend } from '../../types/vehicle';

interface VehicleState {
  vehicles: Vehicle[];
  vehicle: Vehicle | null;
  trucks: Vehicle[];
  deliveryVehicles: Vehicle[];
  availableVehicles: Vehicle[];
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  vehicle: null,
  trucks: [],
  deliveryVehicles: [],
  availableVehicles: [],
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

// Get available vehicles for pickup
export const getAvailableVehiclesForPickup = createAsyncThunk(
  'vehicle/getAvailableVehiclesForPickup',
  async (branchId: string | undefined, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await vehicleService.getAvailableVehiclesForPickup(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch available vehicles'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch available vehicles' });
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

// Helper function to process vehicles with tipeDisplay
const processVehicles = (vehicles: Vehicle[]): Vehicle[] => {
  return vehicles.map(vehicle => ({
    ...vehicle,
    tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe as 'lansir' | 'antar_cabang')
  }));
};

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
      state.availableVehicles = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all vehicles
      .addCase(getVehicles.fulfilled, (state, action) => {
        state.vehicles = action.payload?.data || [];
        state.loading = false;
      })
      // Get vehicle by ID
      .addCase(getVehicleById.fulfilled, (state, action) => {
        state.vehicle = action.payload?.data || null;
      })
      // Get vehicles by branch
      .addCase(getVehiclesByBranch.fulfilled, (state, action) => {
        state.vehicles = action.payload?.data || [];
      })
      // Get trucks
      .addCase(getTrucks.fulfilled, (state, action) => {
        state.trucks = action.payload?.data || [];
      })
      // Get delivery vehicles
      .addCase(getDeliveryVehicles.fulfilled, (state, action) => {
        state.deliveryVehicles = action.payload?.data || [];
      })
      // Get available vehicles for pickup
      .addCase(getAvailableVehiclesForPickup.fulfilled, (state, action) => {
        state.availableVehicles = action.payload?.data || [];
      })
      // Create vehicle
      .addCase(createVehicle.fulfilled, (state, action) => {
        const newVehicle = action.payload?.data;
        if (newVehicle) {
          // Add to main vehicles list
          state.vehicles.unshift(newVehicle);
          state.vehicle = newVehicle;
          
          // Add to specific type list
          if (newVehicle.tipe === 'antar_cabang') {
            state.trucks.unshift(newVehicle);
          } else if (newVehicle.tipe === 'lansir') {
            state.deliveryVehicles.unshift(newVehicle);
          }
        }
      })
      // Update vehicle
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const updatedVehicle = action.payload?.data;
        if (updatedVehicle) {
          // Update in main list
          state.vehicles = state.vehicles.map((vehicle) =>
            vehicle._id === updatedVehicle._id ? updatedVehicle : vehicle
          );
          state.vehicle = updatedVehicle;
          
          // Update in trucks or delivery vehicles lists
          if (updatedVehicle.tipe === 'antar_cabang') {
            // Remove from delivery vehicles if it was there
            state.deliveryVehicles = state.deliveryVehicles.filter(
              (vehicle) => vehicle._id !== updatedVehicle._id
            );
            
            // Update or add to trucks
            const truckIndex = state.trucks.findIndex(truck => truck._id === updatedVehicle._id);
            if (truckIndex >= 0) {
              state.trucks[truckIndex] = updatedVehicle;
            } else {
              state.trucks.unshift(updatedVehicle);
            }
          } else if (updatedVehicle.tipe === 'lansir') {
            // Remove from trucks if it was there
            state.trucks = state.trucks.filter(
              (truck) => truck._id !== updatedVehicle._id
            );
            
            // Update or add to delivery vehicles
            const deliveryIndex = state.deliveryVehicles.findIndex(
              vehicle => vehicle._id === updatedVehicle._id
            );
            if (deliveryIndex >= 0) {
              state.deliveryVehicles[deliveryIndex] = updatedVehicle;
            } else {
              state.deliveryVehicles.unshift(updatedVehicle);
            }
          }
        }
      })
      // Delete vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        const id = action.payload;
        if (id) {
          state.vehicles = state.vehicles.filter((vehicle) => vehicle._id !== id);
          state.trucks = state.trucks.filter((truck) => truck._id !== id);
          state.deliveryVehicles = state.deliveryVehicles.filter((vehicle) => vehicle._id !== id);
          state.availableVehicles = state.availableVehicles.filter((vehicle) => vehicle._id !== id);
          
          if (state.vehicle && state.vehicle._id === id) {
            state.vehicle = null;
          }
        }
      });
  },
});

export const { clearVehicle, clearVehicles } = vehicleSlice.actions;

export default vehicleSlice.reducer;