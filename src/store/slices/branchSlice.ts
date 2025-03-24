import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import branchService from '../../services/branchService';
import { Branch, BranchFormInputs, BranchStats } from '../../types/branch';
import { setLoading, setError, setSuccess, clearError, clearSuccess } from './uiSlice';

interface BranchState {
  branches: Branch[];
  branch: Branch | null;
  branchStats: BranchStats | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: BranchState = {
  branches: [],
  branch: null,
  branchStats: null,
  loading: false,
  error: null,
  success: null,
};

export const getBranches = createAsyncThunk(
  'branch/getBranches',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const branches = await branchService.getBranches();
      
      dispatch(setLoading(false));
      return branches;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || 'Gagal mengambil data cabang'));
      
      return rejectWithValue(error.message || 'Gagal mengambil data cabang');
    }
  }
);

export const getBranchById = createAsyncThunk(
  'branch/getBranchById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const branch = await branchService.getBranchById(id);
      
      dispatch(setLoading(false));
      return branch;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || `Gagal mengambil data cabang dengan ID ${id}`));
      
      return rejectWithValue(error.message || `Gagal mengambil data cabang dengan ID ${id}`);
    }
  }
);

export const getBranchStats = createAsyncThunk(
  'branch/getBranchStats',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const stats = await branchService.getBranchStats(id);
      
      dispatch(setLoading(false));
      return stats;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || `Gagal mengambil statistik cabang dengan ID ${id}`));
      
      return rejectWithValue(error.message || `Gagal mengambil statistik cabang dengan ID ${id}`);
    }
  }
);

export const createBranch = createAsyncThunk(
  'branch/createBranch',
  async (branchData: BranchFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      dispatch(clearSuccess());
      
      // Log data being sent to createBranch
      console.log('Creating branch with data:', branchData);
      
      const newBranch = await branchService.createBranch(branchData);
      
      dispatch(setLoading(false));
      dispatch(setSuccess('Cabang berhasil dibuat'));
      
      return newBranch;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || 'Gagal membuat cabang'));
      
      return rejectWithValue(error.message || 'Gagal membuat cabang');
    }
  }
);

export const updateBranch = createAsyncThunk(
  'branch/updateBranch',
  async ({ id, branchData }: { id: string; branchData: Partial<BranchFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      dispatch(clearSuccess());
      
      const updatedBranch = await branchService.updateBranch(id, branchData);
      
      dispatch(setLoading(false));
      dispatch(setSuccess('Cabang berhasil diperbarui'));
      
      return updatedBranch;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || `Gagal memperbarui cabang dengan ID ${id}`));
      
      return rejectWithValue(error.message || `Gagal memperbarui cabang dengan ID ${id}`);
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branch/deleteBranch',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      dispatch(clearSuccess());
      
      await branchService.deleteBranch(id);
      
      dispatch(setLoading(false));
      dispatch(setSuccess('Cabang berhasil dihapus'));
      
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || `Gagal menghapus cabang dengan ID ${id}`));
      
      return rejectWithValue(error.message || `Gagal menghapus cabang dengan ID ${id}`);
    }
  }
);

export const getBranchesByDivision = createAsyncThunk(
  'branch/getBranchesByDivision',
  async (divisionId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const branches = await branchService.getBranchesByDivision(divisionId);
      
      dispatch(setLoading(false));
      return branches;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.message || `Gagal mengambil cabang untuk divisi dengan ID ${divisionId}`));
      
      return rejectWithValue(error.message || `Gagal mengambil cabang untuk divisi dengan ID ${divisionId}`);
    }
  }
);

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    clearBranch: (state) => {
      state.branch = null;
      state.error = null;
      state.success = null;
    },
    clearBranches: (state) => {
      state.branches = [];
      state.error = null;
      state.success = null;
    },
    clearBranchStats: (state) => {
      state.branchStats = null;
    },
    setErrorState: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearErrorState: (state) => {
      state.error = null;
    },
    setSuccessState: (state, action: PayloadAction<string>) => {
      state.success = action.payload;
    },
    clearSuccessState: (state) => {
      state.success = null;
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
        } else {
          // Handle unexpected data format (should be an array)
          console.error("Invalid branch data format:", action.payload);
          state.branches = [];
          state.error = "Format data cabang tidak valid";
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
      })
      .addCase(getBranchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Get Branch Stats
      .addCase(getBranchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.branchStats = action.payload;
      })
      .addCase(getBranchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Branch
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.branches.push(action.payload);
          state.branch = action.payload;
          state.success = "Cabang berhasil dibuat";
        }
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = null;
      })
      
      // Update Branch
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.map(branch =>
          branch._id === action.payload._id ? action.payload : branch
        );
        state.branch = action.payload;
        state.success = "Cabang berhasil diperbarui";
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = null;
      })
      
      // Delete Branch
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action) => {
        state.loading = false;
        state.branches = state.branches.filter(branch => branch._id !== action.payload);
        if (state.branch?._id === action.payload) {
          state.branch = null;
        }
        state.success = "Cabang berhasil dihapus";
      })
      .addCase(deleteBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = null;
      })
      
      // Get Branches By Division
      .addCase(getBranchesByDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchesByDivision.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.branches = action.payload;
        } else {
          // Handle unexpected data format (should be an array)
          console.error("Invalid branch data format:", action.payload);
          state.branches = [];
          state.error = "Format data cabang tidak valid";
        }
      })
      .addCase(getBranchesByDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearBranch, 
  clearBranches, 
  clearBranchStats, 
  setErrorState, 
  clearErrorState,
  setSuccessState,
  clearSuccessState
} = branchSlice.actions;

export default branchSlice.reducer;