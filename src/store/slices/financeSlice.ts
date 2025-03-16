// src/store/slices/financeSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import financeService from '../../services/financeService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { 
  Account, 
  Journal, 
  CashTransaction, 
  AccountFormInputs, 
  JournalFormInputs,
  CashFormInputs 
} from '../../types/finance';

interface FinanceState {
  accounts: Account[];
  currentAccount: Account | null;
  journals: Journal[];
  currentJournal: Journal | null;
  cashTransactions: CashTransaction[];
  currentCashTransaction: CashTransaction | null;
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  accounts: [],
  currentAccount: null,
  journals: [],
  currentJournal: null,
  cashTransactions: [],
  currentCashTransaction: null,
  loading: false,
  error: null,
};

// Account Operations
export const getAccounts = createAsyncThunk(
  'finance/getAccounts',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.getAccounts();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal mengambil daftar akun'));
      return rejectWithValue(error.response?.data || { message: 'Gagal mengambil daftar akun' });
    }
  }
);

export const createAccount = createAsyncThunk(
  'finance/createAccount',
  async (accountData: AccountFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.createAccount(accountData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Akun berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal membuat akun'));
      return rejectWithValue(error.response?.data || { message: 'Gagal membuat akun' });
    }
  }
);

export const updateAccount = createAsyncThunk(
  'finance/updateAccount',
  async ({ id, accountData }: { id: string; accountData: Partial<AccountFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.updateAccount(id, accountData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Akun berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal memperbarui akun'));
      return rejectWithValue(error.response?.data || { message: 'Gagal memperbarui akun' });
    }
  }
);

// Journal Operations
export const getJournals = createAsyncThunk(
  'finance/getJournals',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.getJournals();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal mengambil daftar jurnal'));
      return rejectWithValue(error.response?.data || { message: 'Gagal mengambil daftar jurnal' });
    }
  }
);

export const createJournal = createAsyncThunk(
  'finance/createJournal',
  async (journalData: JournalFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.createJournal(journalData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Jurnal berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal membuat jurnal'));
      return rejectWithValue(error.response?.data || { message: 'Gagal membuat jurnal' });
    }
  }
);

// Cash Transaction Operations
export const getCashTransactions = createAsyncThunk(
  'finance/getCashTransactions',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.getCashTransactions();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal mengambil daftar transaksi kas'));
      return rejectWithValue(error.response?.data || { message: 'Gagal mengambil daftar transaksi kas' });
    }
  }
);

export const createCashTransaction = createAsyncThunk(
  'finance/createCashTransaction',
  async (cashData: CashFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await financeService.createCashTransaction(cashData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Transaksi kas berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Gagal membuat transaksi kas'));
      return rejectWithValue(error.response?.data || { message: 'Gagal membuat transaksi kas' });
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    },
    clearAccounts: (state) => {
      state.accounts = [];
    },
    clearCurrentJournal: (state) => {
      state.currentJournal = null;
    },
    clearJournals: (state) => {
      state.journals = [];
    },
    clearCurrentCashTransaction: (state) => {
      state.currentCashTransaction = null;
    },
    clearCashTransactions: (state) => {
      state.cashTransactions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Account reducers
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
        state.currentAccount = action.payload;
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.map((account) =>
          account._id === action.payload._id ? action.payload : account
        );
        state.currentAccount = action.payload;
      })
      // Journal reducers
      .addCase(getJournals.fulfilled, (state, action) => {
        state.journals = action.payload;
      })
      .addCase(createJournal.fulfilled, (state, action) => {
        state.journals.push(action.payload);
        state.currentJournal = action.payload;
      })
      // Cash Transaction reducers
      .addCase(getCashTransactions.fulfilled, (state, action) => {
        state.cashTransactions = action.payload;
      })
      .addCase(createCashTransaction.fulfilled, (state, action) => {
        state.cashTransactions.push(action.payload);
        state.currentCashTransaction = action.payload;
      });
  },
});

export const { 
  clearCurrentAccount, 
  clearAccounts,
  clearCurrentJournal,
  clearJournals,
  clearCurrentCashTransaction,
  clearCashTransactions
} = financeSlice.actions;

export default financeSlice.reducer;