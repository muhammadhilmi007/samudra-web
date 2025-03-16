// src/store/slices/collectionSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import collectionService from '../../services/collectionService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Collection, CollectionFormInputs, PaymentInput } from '../../types/collection';

interface CollectionState {
  collections: Collection[];
  currentCollection: Collection | null;
  loading: boolean;
  error: string | null;
  pdfUrl: string | null;
}

const initialState: CollectionState = {
  collections: [],
  currentCollection: null,
  loading: false,
  error: null,
  pdfUrl: null,
};

// Get all collections
export const getCollections = createAsyncThunk(
  'collection/getCollections',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.getCollections();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch collections'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch collections' });
    }
  }
);

// Get collection by ID
export const getCollectionById = createAsyncThunk(
  'collection/getCollectionById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.getCollectionById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch collection'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch collection' });
    }
  }
);

// Get collections by branch
export const getCollectionsByBranch = createAsyncThunk(
  'collection/getCollectionsByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.getCollectionsByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch collections by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch collections by branch' });
    }
  }
);

// Get collections by customer
export const getCollectionsByCustomer = createAsyncThunk(
  'collection/getCollectionsByCustomer',
  async (customerId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.getCollectionsByCustomer(customerId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch collections by customer'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch collections by customer' });
    }
  }
);

// Get collections by status
export const getCollectionsByStatus = createAsyncThunk(
  'collection/getCollectionsByStatus',
  async (status: 'LUNAS' | 'BELUM LUNAS', { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.getCollectionsByStatus(status);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch collections by status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch collections by status' });
    }
  }
);

// Create collection
export const createCollection = createAsyncThunk(
  'collection/createCollection',
  async (collectionData: CollectionFormInputs, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.createCollection(collectionData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Penagihan berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create collection'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create collection' });
    }
  }
);

// Update collection
export const updateCollection = createAsyncThunk(
  'collection/updateCollection',
  async ({ id, collectionData }: { id: string; collectionData: Partial<CollectionFormInputs> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.updateCollection(id, collectionData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Penagihan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update collection'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update collection' });
    }
  }
);

// Update collection status
export const updateCollectionStatus = createAsyncThunk(
  'collection/updateCollectionStatus',
  async ({ id, status }: { id: string; status: 'LUNAS' | 'BELUM LUNAS' }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.updateCollectionStatus(id, status);
      dispatch(setLoading(false));
      dispatch(setSuccess('Status penagihan berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update collection status'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update collection status' });
    }
  }
);

// Add payment
export const addPayment = createAsyncThunk(
  'collection/addPayment',
  async (paymentData: PaymentInput, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.addPayment(paymentData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pembayaran berhasil ditambahkan'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to add payment'));
      return rejectWithValue(error.response?.data || { message: 'Failed to add payment' });
    }
  }
);

// Generate invoice
export const generateInvoice = createAsyncThunk(
  'collection/generateInvoice',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await collectionService.generateInvoice(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to generate invoice'));
      return rejectWithValue(error.response?.data || { message: 'Failed to generate invoice' });
    }
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearCurrentCollection: (state) => {
      state.currentCollection = null;
    },
    clearCollections: (state) => {
      state.collections = [];
    },
    clearPDFUrl: (state) => {
      state.pdfUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all collections
      .addCase(getCollections.fulfilled, (state, action) => {
        state.collections = action.payload;
      })
      // Get collection by ID
      .addCase(getCollectionById.fulfilled, (state, action) => {
        state.currentCollection = action.payload;
      })
      // Get collections by branch
      .addCase(getCollectionsByBranch.fulfilled, (state, action) => {
        state.collections = action.payload;
      })
      // Get collections by customer
      .addCase(getCollectionsByCustomer.fulfilled, (state, action) => {
        state.collections = action.payload;
      })
      // Get collections by status
      .addCase(getCollectionsByStatus.fulfilled, (state, action) => {
        state.collections = action.payload;
      })
      // Create collection
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload);
        state.currentCollection = action.payload;
      })
      // Update collection
      .addCase(updateCollection.fulfilled, (state, action) => {
        state.collections = state.collections.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentCollection = action.payload;
      })
      // Update collection status
      .addCase(updateCollectionStatus.fulfilled, (state, action) => {
        state.collections = state.collections.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentCollection = action.payload;
      })
      // Add payment
      .addCase(addPayment.fulfilled, (state, action) => {
        state.collections = state.collections.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentCollection = action.payload;
      })
      // Generate invoice
      .addCase(generateInvoice.fulfilled, (state, action) => {
        state.pdfUrl = action.payload.url;
      });
  },
});

export const { clearCurrentCollection, clearCollections, clearPDFUrl } = collectionSlice.actions;

export default collectionSlice.reducer;