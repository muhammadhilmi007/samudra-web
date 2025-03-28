// src/store/slices/employeeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import employeeService from '../../services/employeeService';
import { setLoading, setError, setSuccess } from './uiSlice';
import { Employee, Role, EmployeeListResponse, RoleListResponse, EmployeeResponse, RoleResponse } from '../../types/employee';

interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  roles: Role[];
  selectedRole: Role | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  roles: [],
  selectedRole: null,
  loading: false,
  error: null,
  total: 0,
  page: 0,
  limit: 0
};

// Get all employees
export const getEmployees = createAsyncThunk(
  'employee/getEmployees',
  async (params: any = {}, { dispatch, rejectWithValue }): Promise<EmployeeListResponse | ReturnType<typeof rejectWithValue>> => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getEmployees(params);
      dispatch(setLoading(false));
      return response;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch employees'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch employees' });
    }
  }
);

// Get employee by ID
export const getEmployeeById = createAsyncThunk(
  'employee/getEmployeeById',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getEmployeeById(id);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch employee'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch employee' });
    }
  }
);

// Get employees by branch
export const getEmployeesByBranch = createAsyncThunk(
  'employee/getEmployeesByBranch',
  async (branchId: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getEmployeesByBranch(branchId);
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch employees by branch'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch employees by branch' });
    }
  }
);

// Create employee
export const createEmployee = createAsyncThunk(
  'employee/createEmployee',
  async (employeeData: FormData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.createEmployee(employeeData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pegawai berhasil dibuat'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create employee'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create employee' });
    }
  }
);

// src/store/slices/employeeSlice.ts (continued)
// Update employee
export const updateEmployee = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, employeeData }: { id: string; employeeData: FormData }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.updateEmployee(id, employeeData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pegawai berhasil diperbarui'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update employee'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update employee' });
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  'employee/deleteEmployee',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await employeeService.deleteEmployee(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Pegawai berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete employee'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete employee' });
    }
  }
);

// Get all roles
export const getRoles = createAsyncThunk(
  'employee/getRoles',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.getRoles();
      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to fetch roles'));
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch roles' });
    }
  }
);

// Create role
export const createRole = createAsyncThunk(
  'employee/createRole',
  async (roleData: Omit<Role, "_id" | "createdAt" | "updatedAt">, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.createRole(roleData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Role berhasil dibuat'));
  
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to create role'));
      return rejectWithValue(error.response?.data || { message: 'Failed to create role' });
    }
  }
);

// Update role
export const updateRole = createAsyncThunk(
  'employee/updateRole',
  async ({ id, roleData }: { id: string; roleData: Partial<Role> }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await employeeService.updateRole(id, roleData);
      dispatch(setLoading(false));
      dispatch(setSuccess('Role berhasil diperbarui'));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to update role'));
      return rejectWithValue(error.response?.data || { message: 'Failed to update role' });
    }
  }
);

// Delete role
export const deleteRole = createAsyncThunk(
  'employee/deleteRole',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await employeeService.deleteRole(id);
      dispatch(setLoading(false));
      dispatch(setSuccess('Role berhasil dihapus'));
      return id;
    } catch (error: any) {
      dispatch(setLoading(false));
      dispatch(setError(error.response?.data?.message || 'Failed to delete role'));
      return rejectWithValue(error.response?.data || { message: 'Failed to delete role' });
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    setSelectedRole: (state, action: PayloadAction<Role | null>) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all employees
      .addCase(getEmployees.fulfilled, (state, action: PayloadAction<EmployeeListResponse>) => {
        if (action.payload.success) {
          state.employees = action.payload.data?.employees || action.payload.data || [];
          state.total = action.payload.data?.total || 0;
          state.page = action.payload.data?.page || 0;
          state.limit = action.payload.data?.limit || 10;
        }
      })
      // Get employee by ID
      .addCase(getEmployeeById.fulfilled, (state, action) => {
        state.selectedEmployee = action.payload;
      })
      // Get employees by branch
      .addCase(getEmployeesByBranch.fulfilled, (state, action) => {
        state.employees = Array.isArray(action.payload) ? action.payload : action.payload?.employees || [];
      })
      // Create employee
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      // Update employee
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.map((employee) =>
          employee._id === action.payload._id ? action.payload : employee
        );
        if (state.selectedEmployee && state.selectedEmployee._id === action.payload._id) {
          state.selectedEmployee = action.payload;
        }
      })
      // Delete employee
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((employee) => employee._id !== action.payload);
        if (state.selectedEmployee && state.selectedEmployee._id === action.payload) {
          state.selectedEmployee = null;
        }
      })
      // Get all roles
      .addCase(getRoles.fulfilled, (state, action) => {
        state.roles = Array.isArray(action.payload) ? action.payload : action.payload.roles || [];
      })
      // Create role
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles.push(action.payload);
      })
      // Update role
      .addCase(updateRole.fulfilled, (state, action) => {
        state.roles = state.roles.map((role) =>
          role._id === action.payload._id ? action.payload : role
        );
        if (state.selectedRole && state.selectedRole._id === action.payload._id) {
          state.selectedRole = action.payload;
        }
      })
      // Delete role
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter((role) => role._id !== action.payload);
        if (state.selectedRole && state.selectedRole._id === action.payload) {
          state.selectedRole = null;
        }
      });
  },
});

export const {
  setSelectedEmployee,
  clearSelectedEmployee,
  setSelectedRole,
  clearSelectedRole,
} = employeeSlice.actions;

export default employeeSlice.reducer;