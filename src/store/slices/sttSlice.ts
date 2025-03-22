// Import statements should be at the top
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
  loading: boolean;
  error: string | null;
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
  } | null;
}

const initialState: STTState = {
  sttList: [] as STT[],
  loading: false,
  error: null as string | null,
  trackingData: null,
};

// Get all STTs
export const getSTTs = createAsyncThunk(
  'stt/getSTTs',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.getSTTs();
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to fetch STTs'));
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch STTs' });
    }
  }
);

// Get STT by ID
export const getSTTById = createAsyncThunk(
  'stt/getSTTById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.getSTTById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to fetch STT'));
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch STT' });
    }
  }
);

// Get STTs by branch
export const getSTTsByBranch = createAsyncThunk(
  'stt/getSTTsByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.getSTTsByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to fetch STTs by branch'));
      return rejectWithValue(err.response?.data || { message: 'Failed to fetch STTs by branch' });
    }
  }
);

// Get STTs by status
export const getSTTsByStatus = (status: string) => {
  return {
    type: 'stt/getSTTsByStatus',
    payload: status
  }
};

// Create STT
export const createSTT = createAsyncThunk(
  'stt/createSTT',
  async (sttData: STTFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.createSTT(sttData);
      dispatch(setLoading(false));
      dispatch(setSuccess('STT berhasil dibuat'));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to create STT'));
      return rejectWithValue(err.response?.data || { message: 'Failed to create STT' });
    }
  }
);

// Update STT
export const updateSTT = createAsyncThunk(
  'stt/updateSTT',
  async ({ id, sttData }: { id: string; sttData: Partial<STTFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.updateSTT(id, sttData);
      dispatch(setLoading(false));
      dispatch(setSuccess('STT berhasil diperbarui'));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to update STT'));
      return rejectWithValue(err.response?.data || { message: 'Failed to update STT' });
    }
  }
);

// Update STT status
export const updateSTTStatus = createAsyncThunk(
  'stt/updateSTTStatus',
  async ({ id, statusData }: { id: string; statusData: STTStatusUpdate }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.updateSTTStatus(id, statusData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status STT berhasil diperbarui'));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to update STT status'));
      return rejectWithValue(err.response?.data || { message: 'Failed to update STT status' });
    }
  }
);

// Generate STT PDF
export const generateSTTPDF = createAsyncThunk(
  'stt/generateSTTPDF',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.generatePDF(id);
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to generate PDF'));
      return rejectWithValue(err.response?.data || { message: 'Failed to generate PDF' });
    }
  }
);

// Track STT
export const trackSTT = createAsyncThunk(
  'stt/trackSTT',
  async (sttNumber: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await sttService.trackSTT(sttNumber);
      dispatch(setLoading(false));
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      dispatch(setLoading(false));
      dispatch(setError(err.response?.data?.message || 'Failed to track STT'));
      return rejectWithValue(err.response?.data || { message: 'Failed to track STT' });
    }
  }
);

// Delete STT
export const deleteSTT = createAsyncThunk(
  'stt/deleteSTT',
  async (id: string, { rejectWithValue }) => {
    try {
      await sttService.deleteSTT(id);
      return id;
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      return rejectWithValue(err.message);
    }
  }
);

const sttSlice = createSlice({
  name: 'stt',
  initialState,
  reducers: {
    clearSTTs: (state) => {
      state.sttList = [];
      state.trackingData = null;
    },
    getSTTsByStatus: (state) => {
      state.loading = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get STTs
      .addCase(getSTTs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSTTs.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.sttList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getSTTs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch STTs';
        state.sttList = [];
      })
      // Get STTs by branch
      .addCase(getSTTsByBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSTTsByBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.sttList = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getSTTsByBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch STTs by branch';
        state.sttList = [];
      })
      // Create STT
      .addCase(createSTT.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSTT.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.sttList = Array.isArray(state.sttList) ? [...state.sttList, action.payload] : [action.payload];
      })
      .addCase(createSTT.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create STT';
      })
      // Update STT
      .addCase(updateSTT.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSTT.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (Array.isArray(state.sttList)) {
          state.sttList = state.sttList.map((stt) =>
            stt._id === action.payload._id ? action.payload : stt
          );
        }
      })
      .addCase(updateSTT.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update STT';
      })
      // Update STT status
      .addCase(updateSTTStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSTTStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (Array.isArray(state.sttList)) {
          state.sttList = state.sttList.map((stt) =>
            stt._id === action.payload._id ? action.payload : stt
          );
        }
      })
      .addCase(updateSTTStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update STT status';
      })
      // Delete STT
      .addCase(deleteSTT.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSTT.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (Array.isArray(state.sttList)) {
          state.sttList = state.sttList.filter(stt => stt._id !== action.payload);
        }
      })
      .addCase(deleteSTT.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete STT';
      })
      // Track STT
      .addCase(trackSTT.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.trackingData = null;
      })
      .addCase(trackSTT.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
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
            keterangan: action.payload.keterangan
          };
        }
      })
      .addCase(trackSTT.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to track STT';
        state.trackingData = null;
      });
  },
});

export const { clearSTTs, getSTTsByStatus: fetchSTTsByStatus } = sttSlice.actions;

export default sttSlice.reducer;