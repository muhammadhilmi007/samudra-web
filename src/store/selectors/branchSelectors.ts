import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '..';
import type { Branch } from '../../types/branch';
import type { Division } from '../../types/division';

// Base selectors
const selectBranchState = (state: RootState) => state.branch;
const selectDivisionState = (state: RootState) => state.division;
const selectUiStateSlice = (state: RootState) => state.ui;

// Types for selector returns
interface BranchData {
  branches: Branch[];
  isLoading: boolean;
  error: string | null;
}

interface UiState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Memoized selectors
export const selectBranchData = createSelector(
  [selectBranchState],
  (branchState): BranchData => ({
    branches: Array.isArray(branchState.branches) ? branchState.branches : [],
    isLoading: branchState.loading,
    error: branchState.error
  })
);

export const selectDivisionList = createSelector(
  [selectDivisionState],
  (divisionState): Division[] => divisionState.divisions || []
);

export const selectUiState = createSelector(
  [selectUiStateSlice],
  (uiState): UiState => ({
    loading: uiState.loading,
    error: uiState.error,
    success: uiState.success
  })
);