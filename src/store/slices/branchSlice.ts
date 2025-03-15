// src/store/slices/branchSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import branchService from '../../services/branchService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Branch } from '../../types/branch';

interface BranchState {
  branches: Branch[];
  branch: Branch | null;
  loading: boolean;
  error: string | null;
}

const initialState: BranchState = {
  branches: [],
  branch: null,
  loading: false,
  error: null,
};

// Get all branches
export const getBranches = createAsyncThunk(
  'branch/getBranches',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await branchService.getBranches();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch branches'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch branches' });
    }
  }
);

// Get branch by ID
export const getBranchById = createAsyncThunk(
  'branch/getBranchById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await branchService.getBranchById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch branch' });
    }
  }
);

// Get branches by division
export const getBranchesByDivision = createAsyncThunk(
  'branch/getBranchesByDivision',
  async (divisionId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await branchService.getBranchesByDivision(divisionId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch branches by division'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch branches by division' });
    }
  }
);

// Create branch
export const createBranch = createAsyncThunk(
  'branch/createBranch',
  async (branchData: Partial<Branch>, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await branchService.createBranch(branchData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Cabang berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create branch' });
    }
  }
);

// Update branch
export const updateBranch = createAsyncThunk(
  'branch/updateBranch',
  async ({ id, branchData }: { id: string; branchData: Partial<Branch> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await branchService.updateBranch(id, branchData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Cabang berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update branch' });
    }
  }
);

// Delete branch
export const deleteBranch = createAsyncThunk(
  'branch/deleteBranch',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await branchService.deleteBranch(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Cabang berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete branch' });
    }
  }
);

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    clearBranch: (state) => {
      state.branch = null;
    },
    clearBranches: (state) => {
      state.branches = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all branches
      .addCase(getBranches.fulfilled, (state, action) => {
        state.branches = action.payload;
      })
      // Get branch by ID
      .addCase(getBranchById.fulfilled, (state, action) => {
        state.branch = action.payload;
      })
      // Get branches by division
      .addCase(getBranchesByDivision.fulfilled, (state, action) => {
        state.branches = action.payload;
      })
      // Create branch
      .addCase(createBranch.fulfilled, (state, action) => {
        state.branches.push(action.payload);
        state.branch = action.payload;
      })
      // Update branch
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.branches = state.branches.map((branch) =>
          branch._id === action.payload._id ? action.payload : branch
        );
        state.branch = action.payload;
      })
      // Delete branch
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.branches = state.branches.filter((branch) => branch._id !== action.payload);
        if (state.branch && state.branch._id === action.payload) {
          state.branch = null;
        }
      });
  },
});

export const { clearBranch, clearBranches } = branchSlice.actions;

export default branchSlice.reducer;