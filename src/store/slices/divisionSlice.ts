// src/store/slices/divisionSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import divisionService from '../../services/divisionService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Division } from '../../types/division';

interface DivisionState {
  divisions: Division[];
  division: Division | null;
  loading: boolean;
  error: string | null;
}

const initialState: DivisionState = {
  divisions: [],
  division: null,
  loading: false,
  error: null,
};

// Get all divisions
export const getDivisions = createAsyncThunk(
  'division/getDivisions',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await divisionService.getDivisions();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch divisions'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch divisions' });

export const { clearDivision, clearDivisions } = divisionSlice.actions;

export default divisionSlice.reducer;
    }
  }
);

// Get division by ID
export const getDivisionById = createAsyncThunk(
  'division/getDivisionById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await divisionService.getDivisionById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch division'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch division' });
    }
  }
);

// Create division
export const createDivision = createAsyncThunk(
  'division/createDivision',
  async (divisionData: Partial<Division>, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await divisionService.createDivision(divisionData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Divisi berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create division'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create division' });
    }
  }
);

// Update division
export const updateDivision = createAsyncThunk(
  'division/updateDivision',
  async ({ id, divisionData }: { id: string; divisionData: Partial<Division> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await divisionService.updateDivision(id, divisionData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Divisi berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update division'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update division' });
    }
  }
);

// Delete division
export const deleteDivision = createAsyncThunk(
  'division/deleteDivision',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await divisionService.deleteDivision(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Divisi berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete division'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete division' });
    }
  }
);

const divisionSlice = createSlice({
  name: 'division',
  initialState,
  reducers: {
    clearDivision: (state) => {
      state.division = null;
    },
    clearDivisions: (state) => {
      state.divisions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all divisions
      .addCase(getDivisions.fulfilled, (state, action) => {
        state.divisions = action.payload;
      })
      // Get division by ID
      .addCase(getDivisionById.fulfilled, (state, action) => {
        state.division = action.payload;
      })
      // Create division
      .addCase(createDivision.fulfilled, (state, action) => {
        state.divisions.push(action.payload);
        state.division = action.payload;
      })
      // Update division
      .addCase(updateDivision.fulfilled, (state, action) => {
        state.divisions = state.divisions.map((division) =>
          division._id === action.payload._id ? action.payload : division
        );
        state.division = action.payload;
      })
      // Delete division
      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.divisions = state.divisions.filter((division) => division._id !== action.payload);
        if (state.division && state.division._id === action.payload) {
          state.division = null;
        }
      });
  },
});