// src/store/slices/customerSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Customer, CustomerFormInputs } from '../../types/customer';
import { getSTTsByCustomer } from './sttSlice';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  senders: Customer[];
  recipients: Customer[];
  customerSTTs: any[]; // STT type
  customerCollections: any[]; // Collection type
  customerPickups: any[]; // Pickup type
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  senders: [],
  recipients: [],
  customerSTTs: [],
  customerCollections: [],
  customerPickups: []
};

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

// Get customers by type
export const getCustomersByType = createAsyncThunk(
  'customer/getCustomersByType',
  async (type: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getCustomersByType(type);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customers by type'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch customers by type' });
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

// Get customer's collections
export const getCustomerCollections = createAsyncThunk(
  'customer/getCustomerCollections',
  async (customerId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getCustomerCollections(customerId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customer collections'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch customer collections' });
    }
  }
);

// Get customer's pickups
export const getCustomerPickups = createAsyncThunk(
  'customer/getCustomerPickups',
  async (customerId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await customerService.getCustomerPickups(customerId);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch customer pickups'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch customer pickups' });
    }
  }
);

// Create customer
export const createCustomer = createAsyncThunk(
  'customer/createCustomer',
  async (customerData: CustomerFormInputs, { dispatch, rejectWithValue }) => {
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
  async ({ id, customerData }: { id: string; customerData: CustomerFormInputs }, { dispatch, rejectWithValue }) => {
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
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    clearCustomers: (state) => {
      state.customers = [];
    },
    clearCustomerRelatedData: (state) => {
      state.customerSTTs = [];
      state.customerCollections = [];
      state.customerPickups = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all customers
      .addCase(getCustomers.fulfilled, (state, action) => {
        // Normalize customer types to match frontend format
        state.customers = action.payload.map((customer: Customer) => ({
          ...customer,
          tipe: customer.tipe.charAt(0).toUpperCase() + customer.tipe.slice(1)
        }));
      })
      // Get customer by ID
      .addCase(getCustomerById.fulfilled, (state, action) => {
        if (action.payload) {
          // Normalize customer type to match frontend format
          state.selectedCustomer = {
            ...action.payload,
            tipe: action.payload.tipe.charAt(0).toUpperCase() + action.payload.tipe.slice(1)
          };
        }
      })
      // Get customers by branch
      .addCase(getCustomersByBranch.fulfilled, (state, action) => {
        // Normalize customer types to match frontend format
        state.customers = action.payload.map((customer: Customer) => ({
          ...customer,
          tipe: customer.tipe.charAt(0).toUpperCase() + customer.tipe.slice(1)
        }));
      })
      // Get customers by type
      .addCase(getCustomersByType.fulfilled, (state, action) => {
        // Normalize customer types to match frontend format
        state.customers = action.payload.map((customer: Customer) => ({
          ...customer,
          tipe: customer.tipe.charAt(0).toUpperCase() + customer.tipe.slice(1)
        }));
      })
      // Get senders
      .addCase(getSenders.fulfilled, (state, action) => {
        // Normalize customer types to match frontend format
        state.senders = action.payload.map((customer: Customer) => ({
          ...customer,
          tipe: customer.tipe.charAt(0).toUpperCase() + customer.tipe.slice(1)
        }));
      })
      // Get recipients
      .addCase(getRecipients.fulfilled, (state, action) => {
        // Normalize customer types to match frontend format
        state.recipients = action.payload.map((customer: Customer) => ({
          ...customer,
          tipe: customer.tipe.charAt(0).toUpperCase() + customer.tipe.slice(1)
        }));
      })
      // Get customer STTs (handled in sttSlice, but we need to receive the result)
      .addCase(getSTTsByCustomer.fulfilled, (state, action) => {
        state.customerSTTs = action.payload || [];
      })
      // Get customer collections
      .addCase(getCustomerCollections.fulfilled, (state, action) => {
        state.customerCollections = action.payload || [];
      })
      // Get customer pickups
      .addCase(getCustomerPickups.fulfilled, (state, action) => {
        state.customerPickups = action.payload || [];
      })
      // Create customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        if (action.payload) {
          // Normalize customer type to match frontend format
          const normalizedCustomer = {
            ...action.payload,
            tipe: action.payload.tipe.charAt(0).toUpperCase() + action.payload.tipe.slice(1)
          };
          
          state.customers.push(normalizedCustomer);
          state.selectedCustomer = normalizedCustomer;
          
          // Update senders or recipients lists if applicable
          const customerType = normalizedCustomer.tipe;
          if (customerType === 'Pengirim' || customerType === 'Keduanya') {
            state.senders.push(normalizedCustomer);
          }
          if (customerType === 'Penerima' || customerType === 'Keduanya') {
            state.recipients.push(normalizedCustomer);
          }
        }
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state, action) => {
        if (action.payload) {
          // Normalize customer type to match frontend format
          const normalizedCustomer = {
            ...action.payload,
            tipe: action.payload.tipe.charAt(0).toUpperCase() + action.payload.tipe.slice(1)
          };
          
          state.customers = state.customers.map((customer) =>
            customer._id === normalizedCustomer._id ? normalizedCustomer : customer
          );
          state.selectedCustomer = normalizedCustomer;
          
          // Update senders list if applicable
          const customerType = normalizedCustomer.tipe;
          if (customerType === 'Pengirim' || customerType === 'Keduanya') {
            const senderIndex = state.senders.findIndex(sender => sender._id === normalizedCustomer._id);
            if (senderIndex >= 0) {
              state.senders[senderIndex] = normalizedCustomer;
            } else {
              state.senders.push(normalizedCustomer);
            }
          } else {
            state.senders = state.senders.filter(sender => sender._id !== normalizedCustomer._id);
          }
          
          // Update recipients list if applicable
          if (customerType === 'Penerima' || customerType === 'Keduanya') {
            const recipientIndex = state.recipients.findIndex(recipient => recipient._id === normalizedCustomer._id);
            if (recipientIndex >= 0) {
              state.recipients[recipientIndex] = normalizedCustomer;
            } else {
              state.recipients.push(normalizedCustomer);
            }
          } else {
            state.recipients = state.recipients.filter(recipient => recipient._id !== normalizedCustomer._id);
          }
        }
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter((customer) => customer._id !== action.payload);
        state.senders = state.senders.filter((sender) => sender._id !== action.payload);
        state.recipients = state.recipients.filter((recipient) => recipient._id !== action.payload);
        
        if (state.selectedCustomer && state.selectedCustomer._id === action.payload) {
          state.selectedCustomer = null;
        }
      });
  },
});

export const { clearSelectedCustomer, clearCustomers, clearCustomerRelatedData } = customerSlice.actions;

export default customerSlice.reducer;