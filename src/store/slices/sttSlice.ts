// src/store/slices/sttSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sttService from '../../services/sttService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { STT, STTFormInputs, STTStatusUpdate } from '../../types/stt';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  data?: {
    message?: string;
  };
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface STTState {
  sttList: STT[];
  selectedSTT: STT | null;
  branchSTTs: STT[];
  customerSTTs: STT[];
  trackingData: {
    noSTT: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    cabangAsal: { namaCabang: string } | null;
    cabangTujuan: { namaCabang: string } | null;
    pengirim: { nama: string } | null;
    penerima: { nama: string } | null;
    keterangan?: string;
    trackingHistory?: Array<{
      status: string;
      timestamp: string;
      location?: string;
      notes?: string;
    }>;
  } | null;
}

const initialState: STTState = {
  sttList: [],
  selectedSTT: null,
  branchSTTs: [],
  customerSTTs: [],
  trackingData: null
};

// Common error handling helper function
const createThunkWithErrorHandling = <T, A>(
  typePrefix: string,
  payloadCreator: (arg: A, thunkAPI: any) => Promise<T>,
  successMessage?: string
) => {
  return createAsyncThunk(typePrefix, async (arg: A, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      dispatch(setLoading(true));
      const response = await payloadCreator(arg, thunkAPI);
      dispatch(setLoading(false));
      if (successMessage) {
        dispatch(setSuccess(successMessage));
      }
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      const errorMessage = err.response?.data?.message || `Failed to ${typePrefix.split('/')[1]}`;
      dispatch(setError(errorMessage));
      return thunkAPI.rejectWithValue(err.response?.data || { message: errorMessage });
    }
  });
};

// Get all STTs
export const getSTTs = createThunkWithErrorHandling<STT[], void>(
  'stt/getSTTs',
  async (_, thunkAPI) => await sttService.getSTTs()
);

// Get STT by ID
export const getSTTById = createThunkWithErrorHandling<STT, string>(
  'stt/getSTTById',
  async (id, thunkAPI) => await sttService.getSTTById(id)
);

// Get STTs by branch
export const getSTTsByBranch = createThunkWithErrorHandling<STT[], string>(
  'stt/getSTTsByBranch',
  async (branchId, thunkAPI) => await sttService.getSTTsByBranch(branchId)
);

// Get STTs by status
export const getSTTsByStatus = createThunkWithErrorHandling<STT[], string>(
  'stt/getSTTsByStatus',
  async (status, thunkAPI) => await sttService.getSTTsByStatus(status)
);

// Get STTs by customer
export const getSTTsByCustomer = createThunkWithErrorHandling<STT[], string>(
  'stt/getSTTsByCustomer',
  async (customerId, thunkAPI) => await sttService.getSTTsByCustomer(customerId)
);

// Create STT
export const createSTT = createThunkWithErrorHandling<STT, STTFormInputs>(
  'stt/createSTT',
  async (sttData, thunkAPI) => await sttService.createSTT(sttData),
  'STT berhasil dibuat'
);

// Update STT
export const updateSTT = createThunkWithErrorHandling<
  STT, 
  { id: string; sttData: Partial<STTFormInputs> }
>(
  'stt/updateSTT',
  async ({ id, sttData }, thunkAPI) => await sttService.updateSTT(id, sttData),
  'STT berhasil diperbarui'
);

// Update STT status
export const updateSTTStatus = createThunkWithErrorHandling<
  STT, 
  { id: string; statusData: STTStatusUpdate }
>(
  'stt/updateSTTStatus',
  async ({ id, statusData }, thunkAPI) => await sttService.updateSTTStatus(id, statusData),
  'Status STT berhasil diperbarui'
);

// Generate STT PDF
export const generateSTTPDF = createThunkWithErrorHandling<Blob, string>(
  'stt/generateSTTPDF',
  async (id, thunkAPI) => await sttService.generatePDF(id)
);

// Track STT
export const trackSTT = createThunkWithErrorHandling<any, string>(
  'stt/trackSTT',
  async (sttNumber, thunkAPI) => await sttService.trackSTT(sttNumber)
);

// Delete STT
export const deleteSTT = createThunkWithErrorHandling<string, string>(
  'stt/deleteSTT',
  async (id, thunkAPI) => {
    await sttService.deleteSTT(id);
    return id;
  },
  'STT berhasil dihapus'
);

const sttSlice = createSlice({
  name: 'stt',
  initialState,
  reducers: {
    clearSTTs: (state) => {
      state.sttList = [];
      state.trackingData = null;
    },
    clearSelectedSTT: (state) => {
      state.selectedSTT = null;
    },
    clearCustomerSTTs: (state) => {
      state.customerSTTs = [];
    },
    clearBranchSTTs: (state) => {
      state.branchSTTs = [];
    },
    clearTrackingData: (state) => {
      state.trackingData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get STTs
      .addCase(getSTTs.fulfilled, (state, action) => {
        state.sttList = Array.isArray(action.payload) ? action.payload : [];
      })
      
      // Get STT by ID
      .addCase(getSTTById.fulfilled, (state, action) => {
        state.selectedSTT = action.payload;
      })
      
      // Get STTs by branch
      .addCase(getSTTsByBranch.fulfilled, (state, action) => {
        state.branchSTTs = Array.isArray(action.payload) ? action.payload : [];
        state.sttList = Array.isArray(action.payload) ? action.payload : [];
      })
      
      // Get STTs by status
      .addCase(getSTTsByStatus.fulfilled, (state, action) => {
        state.sttList = Array.isArray(action.payload) ? action.payload : [];
      })
      
      // Get STTs by customer
      .addCase(getSTTsByCustomer.fulfilled, (state, action) => {
        state.customerSTTs = Array.isArray(action.payload) ? action.payload : [];
      })
      
      // Create STT
      .addCase(createSTT.fulfilled, (state, action) => {
        const newSTT = action.payload;
        state.sttList = [...state.sttList, newSTT];
        state.selectedSTT = newSTT;
        
        // Update customerSTTs if the STT belongs to the same customer
        if (state.customerSTTs.length > 0 && 
            (newSTT.pengirimId === state.customerSTTs[0].pengirimId || 
             newSTT.penerimaId === state.customerSTTs[0].penerimaId)) {
          state.customerSTTs = [...state.customerSTTs, newSTT];
        }
        
        // Update branchSTTs if the STT belongs to the same branch
        if (state.branchSTTs.length > 0 && 
            (newSTT.cabangAsalId === state.branchSTTs[0].cabangAsalId || 
             newSTT.cabangTujuanId === state.branchSTTs[0].cabangTujuanId)) {
          state.branchSTTs = [...state.branchSTTs, newSTT];
        }
      })
      
      // Update STT
      .addCase(updateSTT.fulfilled, (state, action) => {
        const updatedSTT = action.payload;
        
        // Update in sttList
        state.sttList = state.sttList.map((stt) =>
          stt._id === updatedSTT._id ? updatedSTT : stt
        );
        
        // Update in customerSTTs if present
        if (state.customerSTTs.some(stt => stt._id === updatedSTT._id)) {
          state.customerSTTs = state.customerSTTs.map((stt) =>
            stt._id === updatedSTT._id ? updatedSTT : stt
          );
        }
        
        // Update in branchSTTs if present
        if (state.branchSTTs.some(stt => stt._id === updatedSTT._id)) {
          state.branchSTTs = state.branchSTTs.map((stt) =>
            stt._id === updatedSTT._id ? updatedSTT : stt
          );
        }
        
        // Update selectedSTT if it's the same STT
        if (state.selectedSTT && state.selectedSTT._id === updatedSTT._id) {
          state.selectedSTT = updatedSTT;
        }
      })
      
      // Update STT status
      .addCase(updateSTTStatus.fulfilled, (state, action) => {
        const updatedSTT = action.payload;
        
        // Update in sttList
        state.sttList = state.sttList.map((stt) =>
          stt._id === updatedSTT._id ? updatedSTT : stt
        );
        
        // Update in customerSTTs if present
        if (state.customerSTTs.some(stt => stt._id === updatedSTT._id)) {
          state.customerSTTs = state.customerSTTs.map((stt) =>
            stt._id === updatedSTT._id ? updatedSTT : stt
          );
        }
        
        // Update in branchSTTs if present
        if (state.branchSTTs.some(stt => stt._id === updatedSTT._id)) {
          state.branchSTTs = state.branchSTTs.map((stt) =>
            stt._id === updatedSTT._id ? updatedSTT : stt
          );
        }
        
        // Update selectedSTT if it's the same STT
        if (state.selectedSTT && state.selectedSTT._id === updatedSTT._id) {
          state.selectedSTT = updatedSTT;
        }
        
        // Update tracking data if it's the same STT
        if (state.trackingData && state.trackingData.noSTT === updatedSTT.noSTT) {
          state.trackingData = {
            ...state.trackingData,
            status: updatedSTT.status,
            updatedAt: updatedSTT.updatedAt
          };
        }
      })
      
      // Delete STT
      .addCase(deleteSTT.fulfilled, (state, action) => {
        const deletedId = action.payload;
        
        // Remove from sttList
        state.sttList = state.sttList.filter(stt => stt._id !== deletedId);
        
        // Remove from customerSTTs if present
        state.customerSTTs = state.customerSTTs.filter(stt => stt._id !== deletedId);
        
        // Remove from branchSTTs if present
        state.branchSTTs = state.branchSTTs.filter(stt => stt._id !== deletedId);
        
        // Clear selectedSTT if it's the same STT
        if (state.selectedSTT && state.selectedSTT._id === deletedId) {
          state.selectedSTT = null;
        }
      })
      
      // Track STT
      .addCase(trackSTT.fulfilled, (state, action) => {
        if (action.payload) {
          state.trackingData = {
            noSTT: action.payload.noSTT,
            status: action.payload.status,
            createdAt: action.payload.createdAt,
            updatedAt: action.payload.updatedAt,
            cabangAsal: action.payload.cabangAsal,
            cabangTujuan: action.payload.cabangTujuan,
            pengirim: action.payload.pengirim,
            penerima: action.payload.penerima,
            keterangan: action.payload.keterangan,
            trackingHistory: action.payload.trackingHistory || []
          };
        }
      });
  },
});

export const { 
  clearSTTs, 
  clearSelectedSTT, 
  clearCustomerSTTs, 
  clearBranchSTTs, 
  clearTrackingData 
} = sttSlice.actions;

export default sttSlice.reducer;