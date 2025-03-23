import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import branchService from '../../services/branchService';
import { Branch, BranchFormSubmitData } from '../../types/branch';
import { setError, setSuccess } from './uiSlice';

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

const handleThunkError = (error: any, thunkAPI: any, message: string) => {
  let errorMsg = message;
  if (error.response?.data?.message) {
    errorMsg = error.response.data.message;
  } else if (error.message) {
    errorMsg = error.message;
  }
  thunkAPI.dispatch(setError(errorMsg));
  return thunkAPI.rejectWithValue(errorMsg);
};

export const getBranches = createAsyncThunk(
  'branch/getBranches',
  async (_, thunkAPI) => {
    try {
      const data = await branchService.getBranches();
      return data;
    } catch (error) {
      return handleThunkError(error, thunkAPI, 'Failed to fetch branches');
    }
  }
);

export const getBranchById = createAsyncThunk(
  'branch/getBranchById',
  async (id: string, thunkAPI) => {
    try {
      const data = await branchService.getBranchById(id);
      return data;
    } catch (error) {
      return handleThunkError(error, thunkAPI, `Failed to fetch branch with ID ${id}`);
    }
  }
);

export const createBranch = createAsyncThunk(
  'branch/createBranch',
  async (branchData: BranchFormSubmitData, thunkAPI) => {
    try {
      console.log('Creating branch with data:', JSON.stringify(branchData, null, 2));
      const data = await branchService.createBranch(branchData);
      thunkAPI.dispatch(setSuccess('Cabang berhasil dibuat'));
      return data;
    } catch (error: any) {
      console.error('Error in createBranch thunk:', error);
      // Use the specific error message if available
      const errorMessage = error.message || 'Gagal membuat cabang baru';
      return handleThunkError(error, thunkAPI, errorMessage);
    }
  }
);

export const updateBranch = createAsyncThunk(
  'branch/updateBranch',
  async ({ id, branchData }: { id: string; branchData: Partial<Branch> }, thunkAPI) => {
    try {
      const data = await branchService.updateBranch(id, branchData);
      thunkAPI.dispatch(setSuccess('Branch updated successfully'));
      return data;
    } catch (error) {
      return handleThunkError(error, thunkAPI, `Failed to update branch with ID ${id}`);
    }
  }
);

export const deleteBranch = createAsyncThunk(
  'branch/deleteBranch',
  async (id: string, thunkAPI) => {
    try {
      await branchService.deleteBranch(id);
      thunkAPI.dispatch(setSuccess('Branch deleted successfully'));
      return id;
    } catch (error) {
      return handleThunkError(error, thunkAPI, `Failed to delete branch with ID ${id}`);
    }
  }
);

export const getBranchesByDivision = createAsyncThunk(
  'branch/getBranchesByDivision',
  async (divisionId: string, thunkAPI) => {
    try {
      const data = await branchService.getBranchesByDivision(divisionId);
      return data;
    } catch (error) {
      return handleThunkError(error, thunkAPI, `Failed to fetch branches for division ${divisionId}`);
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
    clearBranchErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getBranches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranches.fulfilled, (state, action: PayloadAction<Branch[]>) => {
        state.loading = false;
        state.branches = action.payload || [];
        state.error = null;
      })
      .addCase(getBranches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(getBranchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchById.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.loading = false;
        state.branch = action.payload;
        state.error = null;
      })
      .addCase(getBranchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(createBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.loading = false;
        if (action.payload) {
          state.branches.push(action.payload);
        }
        state.error = null;
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action: PayloadAction<Branch>) => {
        state.loading = false;
        if (action.payload) {
          state.branches = state.branches.map(branch =>
            branch._id === action.payload._id ? action.payload : branch
          );
          if (state.branch?._id === action.payload._id) {
            state.branch = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(deleteBranch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBranch.fulfilled, (state, action: PayloadAction<string>) => {
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
      
      .addCase(getBranchesByDivision.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBranchesByDivision.fulfilled, (state, action: PayloadAction<Branch[]>) => {
        state.loading = false;
        state.branches = action.payload || [];
        state.error = null;
      })
      .addCase(getBranchesByDivision.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBranch, clearBranches, clearBranchErrors } = branchSlice.actions;
export default branchSlice.reducer;