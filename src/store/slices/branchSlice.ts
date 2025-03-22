import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import branchService from '../../services/branchService';
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
      const data = await branchService.getBranches();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches');
    }
  }
);

export const getBranchById = createAsyncThunk(
  'branch/getBranchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await branchService.getBranchById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branch');
    }
  }
);

export const createBranch = createAsyncThunk(
  'branch/createBranch',
  async (branchData: Partial<Branch>, { rejectWithValue }) => {
    try {
      const data = await branchService.createBranch(branchData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create branch');
    }
  }
);

export const updateBranch = createAsyncThunk(
  'branch/updateBranch',
  async ({ id, branchData }: { id: string; branchData: Partial<Branch> }, { rejectWithValue }) => {
    try {
      const data = await branchService.updateBranch(id, branchData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update branch');
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branch/deleteBranch',
  async (id: string, { rejectWithValue }) => {
    try {
      await branchService.deleteBranch(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete branch');
    }
  }
);

export const getBranchesByDivision = createAsyncThunk(
  'branch/getBranchesByDivision',
  async (divisionId: string, { rejectWithValue }) => {
    try {
      const data = await branchService.getBranchesByDivision(divisionId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branches by division');
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
        if (Array.isArray(action.payload)) {
          state.branches = action.payload;
          state.error = null;
          console.log("Branch state updated successfully:", state.branches);
        } else {
          state.branches = [];
          state.error = "Invalid data format received from server";
          console.error("Invalid branch data format:", action.payload);
        }
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
        if (action.payload) {
          state.branches.push(action.payload);
          state.error = null;
          console.log("Branch created successfully:", action.payload);
        } else {
          console.error("No branch data returned from API on creation");
        }
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
      })
      // Get Branches By Division
      .addCase(getBranchesByDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchesByDivision.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = action.payload;
        state.error = null;
      })
      .addCase(getBranchesByDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBranch, clearBranches } = branchSlice.actions;
export default branchSlice.reducer;