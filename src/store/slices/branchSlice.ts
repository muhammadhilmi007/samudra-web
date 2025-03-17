import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
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

export const getBranches = createAsyncThunk(
  'branch/getBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/branches');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches');
    }
  }
);

export const getBranchById = createAsyncThunk(
  'branch/getBranchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/branches/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branch');
    }
  }
);

export const createBranch = createAsyncThunk(
  'branch/createBranch',
  async (branchData: Partial<Branch>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/branches', branchData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create branch');
    }
  }
);

export const updateBranch = createAsyncThunk(
  'branch/updateBranch',
  async ({ id, branchData }: { id: string; branchData: Partial<Branch> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/branches/${id}`, branchData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update branch');
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branch/deleteBranch',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/branches/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete branch');
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
      // Get Branches
      .addCase(getBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranches.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
        state.error = null;
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Branch By Id
      .addCase(getBranchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchById.fulfilled, (state, action) => {
        state.loading = false;
        state.branch = action.payload;
        state.error = null;
      })
      .addCase(getBranchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Branch
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches.push(action.payload);
        state.error = null;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.map(branch =>
          branch._id === action.payload._id ? action.payload : branch
        );
        state.branch = action.payload;
        state.error = null;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Branch
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(branch => branch._id !== action.payload);
        if (state.branch?._id === action.payload) {
          state.branch = null;
        }
        state.error = null;
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBranch, clearBranches } = branchSlice.actions;
export default branchSlice.reducer;