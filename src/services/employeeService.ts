import api from './api';
import {
  Employee,
  EmployeeResponse,
  EmployeeListResponse,
  Role,
  RoleResponse,
  RoleListResponse,
  fileValidationSchema
} from '../types/employee';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

class EmployeeService {
  private handleApiError(error: any): never {
    if (error.response) {
      throw new ApiError(
        error.response.data.message || 'An error occurred',
        error.response.status
      );
    }
    throw new ApiError(error.message || 'Network error occurred');
  }

  private validateFile(file: File): void {
    const validation = fileValidationSchema.safeParse({
      size: file.size,
      type: file.type
    });

    if (!validation.success) {
      throw new ApiError(validation.error.errors[0].message);
    }
  }

  // Get all employees with pagination and filters
  async getEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    cabangId?: string;
    roleId?: string;
    aktif?: boolean;
  } = {}): Promise<EmployeeListResponse> {
    try {
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<EmployeeResponse> {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Get employees by branch
  async getEmployeesByBranch(branchId: string): Promise<EmployeeListResponse> {
    try {
      const response = await api.get(`/employees/by-branch/${branchId}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Create employee (with file upload)
  async createEmployee(employeeData: FormData): Promise<EmployeeResponse> {
    try {
      // Validate files if present
      const profileImage = employeeData.get('fotoProfil') as File;
      const ktpFile = employeeData.get('ktp') as File;
      const npwpFile = employeeData.get('npwp') as File;

      if (profileImage) this.validateFile(profileImage);
      if (ktpFile) this.validateFile(ktpFile);
      if (npwpFile) this.validateFile(npwpFile);

      // Restructure document fields
      if (ktpFile) {
        employeeData.delete('dokumen.ktp');
        employeeData.append('ktp', ktpFile);
      }
      if (npwpFile) {
        employeeData.delete('dokumen.npwp');
        employeeData.append('npwp', npwpFile);
      }

      const response = await api.post('/employees', employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log('Upload Progress:', percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      return this.handleApiError(error);
    }
  }

  // Update employee (with file upload)
  async updateEmployee(id: string, employeeData: FormData): Promise<EmployeeResponse> {
    try {
      // Validate files if present
      const profileImage = employeeData.get('fotoProfil') as File;
      const ktpFile = employeeData.get('ktp') as File;
      const npwpFile = employeeData.get('npwp') as File;

      if (profileImage) this.validateFile(profileImage);
      if (ktpFile) this.validateFile(ktpFile);
      if (npwpFile) this.validateFile(npwpFile);

      // Restructure document fields
      if (ktpFile) {
        employeeData.delete('dokumen.ktp');
        employeeData.append('ktp', ktpFile);
      }
      if (npwpFile) {
        employeeData.delete('dokumen.npwp');
        employeeData.append('npwp', npwpFile);
      }

      const response = await api.put(`/employees/${id}`, employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          console.log('Upload Progress:', percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      return this.handleApiError(error);
    }
  }

  // Delete employee
  async deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Get all roles
  async getRoles(): Promise<RoleListResponse> {
    try {
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Create role
  async createRole(roleData: Omit<Role, '_id' | 'createdAt' | 'updatedAt'>): Promise<RoleResponse> {
    try {
      const response = await api.post('/roles', roleData);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Update role
  async updateRole(
    id: string,
    roleData: Partial<Omit<Role, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<RoleResponse> {
    try {
      const response = await api.put(`/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // Delete role
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/roles/${id}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
}

// Export a singleton instance
export default new EmployeeService();