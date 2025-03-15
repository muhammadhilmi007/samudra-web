const sttSlice = createSlice({
    name: 'stt',
    initialState,
    reducers: {
      clearSTT: (state) => {
        state.stt = null;
      },
      clearSTTs: (state) => {
        state.sttList = [];
      },
      clearPDFUrl: (state) => {
        state.pdfUrl = null;
      },
      clearTrackingData: (state) => {
        state.trackingData = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // Get all STTs
        .addCase(getSTTs.fulfilled, (state, action) => {
          state.sttList = action.payload;
        })
        // Get STT by ID
        .addCase(getSTTById.fulfilled, (state, action) => {
          state.stt = action.payload;
        })
        // Get STTs by branch
        .addCase(getSTTsByBranch.fulfilled, (state, action) => {
          state.sttList = action.payload;
        })
        // Get STTs by status
        .addCase(getSTTsByStatus.fulfilled, (state, action) => {
          state.sttList = action.payload;
        })
        // Create STT
        .addCase(createSTT.fulfilled, (state, action) => {
          state.sttList.push(action.payload);
          state.stt = action.payload;
        })
        // Update STT
        .addCase(updateSTT.fulfilled, (state, action) => {
          state.sttList = state.sttList.map((stt) =>
            stt._id === action.payload._id ? action.payload : stt
          );
          state.stt = action.payload;
        })
        // Update STT status
        .addCase(updateSTTStatus.fulfilled, (state, action) => {
          state.sttList = state.sttList.map((stt) =>
            stt._id === action.payload._id ? action.payload : stt
          );
          state.stt = action.payload;
        })
        // Generate STT PDF
        .addCase(generateSTTPDF.fulfilled, (state, action) => {
          state.pdfUrl = action.payload.url;
        })
        // Track STT
        .addCase(trackSTT.fulfilled, (state, action) => {
          state.trackingData = action.payload;
        });
    },
  });
  
  export const { clearSTT, clearSTTs, clearPDFUrl, clearTrackingData } = sttSlice.actions;
  
  export default sttSlice.reducer;// Update STT status
  export const updateSTTStatus = createAsyncThunk(
    'stt/updateSTTStatus',
    async ({ id, statusData }: { id: string; statusData: STTStatusUpdate }, { dispatch, rejectWithValue }) => {
      try {
        dispatch(setLoading(true));
        const response = await sttService.updateSTTStatus(id, statusData);
        dispatch(setLoading(false));
        dispatch(setSuccess('Status STT berhasil diperbarui'));
        return response;
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to update STT status'));
        return rejectWithValue(error.response?.data || { message: 'Failed to update STT status' });
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to generate PDF'));
        return rejectWithValue(error.response?.data || { message: 'Failed to generate PDF' });
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to track STT'));
        return rejectWithValue(error.response?.data || { message: 'Failed to track STT' });
      }
    }
  );// src/store/slices/sttSlice.ts
  import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
  import sttService from '../../services/sttService';
  import { setLoading, setError, setSuccess } from './uiSlice';
  import { STT, STTFormInputs, STTStatusUpdate } from '../../types/stt';
  
  interface STTState {
    sttList: STT[];
    stt: STT | null;
    loading: boolean;
    error: string | null;
    pdfUrl: string | null;
    trackingData: any | null;
  }
  
  const initialState: STTState = {
    sttList: [],
    stt: null,
    loading: false,
    error: null,
    pdfUrl: null,
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to fetch STTs'));
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch STTs' });
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to fetch STT'));
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch STT' });
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to fetch STTs by branch'));
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch STTs by branch' });
      }
    }
  );
  
  // Get STTs by status
  export const getSTTsByStatus = createAsyncThunk(
    'stt/getSTTsByStatus',
    async (status: string, { dispatch, rejectWithValue }) => {
      try {
        dispatch(setLoading(true));
        const response = await sttService.getSTTsByStatus(status);
        dispatch(setLoading(false));
        return response;
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to fetch STTs by status'));
        return rejectWithValue(error.response?.data || { message: 'Failed to fetch STTs by status' });
      }
    }
  );
  
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to create STT'));
        return rejectWithValue(error.response?.data || { message: 'Failed to create STT' });
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
      } catch (error: any) {
        dispatch(setLoading(false));
        dispatch(setError(error.response?.data?.message || 'Failed to update STT'));
        return rejectWithValue(error.response?.data || { message: 'Failed to update STT' });
      }
    }
  );