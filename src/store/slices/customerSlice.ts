// src/store/slices/customerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Customer } from '../../types/customer';

interface CustomerState {
  customers: Customer[];
  customer: Customer | null;
  senders: Customer[];
  recipients: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  customer: null,
  senders: [],
  recipients: [],
  loading: false,
  error: null,
};

// Common error handling helper
const createAsyncThunkWithErrorHandling = <T, A>(
  typePrefix: string,
  payloadCreator: (arg: A, thunkAPI: any) => Promise<T>
) => {
  return createAsyncThunk(typePrefix, async (arg: A, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
      dispatch(setLoading(true));
      const response = await payloadCreator(arg, thunkAPI);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      const message = error.response?.data?.message || `Failed to ${typePrefix}`;
      dispatch(setError(message));
      return thunkAPI.rejectWithValue({ message });
    }
  });
}


// Get all customers
export const getCustomers = createAsyncThunk(
  'customer/getCustomers',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getCustomers();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customers'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch customers' });
    }
  }
);

// Get customer by ID
export const getCustomerById = createAsyncThunk(
  'customer/getCustomerById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getCustomerById(id);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customer'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch customer' });
    }
  }
);

// Get customers by branch
export const getCustomersByBranch = createAsyncThunk(
  'customer/getCustomersByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getCustomersByBranch(branchId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customers by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch customers by branch' });
    }
  }
);

// Get senders
export const getSenders = createAsyncThunk(
  'customer/getSenders',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getSenders();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch senders'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch senders' });
    }
  }
);

// Get recipients
export const getRecipients = createAsyncThunk(
  'customer/getRecipients',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getRecipients();
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch recipients'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch recipients' });
    }
  }
);

// Create customer
export const createCustomer = createAsyncThunkWithErrorHandling<Customer, Partial<Customer>>(
  'customer/createCustomer',
  async (customerData: Partial<Customer>, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.createCustomer(customerData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Customer berhasil dibuat'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create customer'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create customer' });
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customer/updateCustomer',
  async ({ id, customerData }: { id: string; customerData: Partial<Customer> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.updateCustomer(id, customerData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Customer berhasil diperbarui'));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update customer'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update customer' });
    }
  }
);

// Delete customer
export const deleteCustomer = createAsyncThunk(
  'customer/deleteCustomer',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await customerService.deleteCustomer(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Customer berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete customer'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete customer' });
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomer: (state) => {
      state.customer = null;
    },
    clearCustomers: (state) => {
      state.customers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all customers
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      // Get customer by ID
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.customer = action.payload;
      })
      // Get customers by branch
      .addCase(getCustomersByBranch.fulfilled, (state, action) => {
        state.customers = action.payload;
      })
      // Get senders
      .addCase(getSenders.fulfilled, (state, action) => {
        state.senders = action.payload;
      })
      // Get recipients
      .addCase(getRecipients.fulfilled, (state, action) => {
        state.recipients = action.payload;
      })
      // Create customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
        state.customer = action.payload;
        
        // Update senders or recipients lists if applicable
        if (action.payload.tipe === 'Pengirim' || action.payload.tipe === 'Keduanya') {
          state.senders.push(action.payload);
        }
        if (action.payload.tipe === 'Penerima' || action.payload.tipe === 'Keduanya') {
          state.recipients.push(action.payload);
        }
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
        state.customer = action.payload;
        
        // Update senders list if applicable
        if (action.payload.tipe === 'Pengirim' || action.payload.tipe === 'Keduanya') {
          const senderIndex = state.senders.findIndex(sender => sender._id === action.payload._id);
          if (senderIndex >= 0) {
            state.senders[senderIndex] = action.payload;
          } else {
            state.senders.push(action.payload);
          }
        } else {
          state.senders = state.senders.filter(sender => sender._id !== action.payload._id);
        }
        
        // Update recipients list if applicable
        if (action.payload.tipe === 'Penerima' || action.payload.tipe === 'Keduanya') {
          const recipientIndex = state.recipients.findIndex(recipient => recipient._id === action.payload._id);
          if (recipientIndex >= 0) {
            state.recipients[recipientIndex] = action.payload;
          } else {
            state.recipients.push(action.payload);
          }
        } else {
          state.recipients = state.recipients.filter(recipient => recipient._id !== action.payload._id);
        }
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter((customer) => customer._id !== action.payload);
        state.senders = state.senders.filter((sender) => sender._id !== action.payload);
        state.recipients = state.recipients.filter((recipient) => recipient._id !== action.payload);
        
        if (state.customer && state.customer._id === action.payload) {
          state.customer = null;
        }
      });
  },
});

export const { clearCustomer, clearCustomers } = customerSlice.actions;

export default customerSlice.reducer;