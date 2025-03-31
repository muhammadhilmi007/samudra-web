import api from './api';
import {
  Employee,
  EmployeeResponse,
  EmployeeListResponse,
  Role,
  RoleResponse,
  RoleListResponse,
  EmployeeQueryParams,
  fileValidationSchema,
  documentValidationSchema,
  EmployeeFormData
} from '../types/employee';

class ApiError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class EmployeeService {
  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any): never {
    console.error('API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || 'An error occurred';
      throw new ApiError(
        errorMessage,
        error.response.status
      );
    } else if (error.request) {
      // The request was made but no response was received
      throw new ApiError('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new ApiError(error.message || 'An error occurred while processing your request.');
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, isDocument: boolean = false): void {
    try {
      const validationSchema = isDocument ? documentValidationSchema : fileValidationSchema;
      const validation = validationSchema.safeParse({
        size: file.size,
        type: file.type
      });

      if (!validation.success) {
        throw new ApiError(validation.error.errors[0].message);
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('File validation failed');
    }
  }

  /**
   * Get all employees with pagination and filters
   */
  async getEmployees(params: EmployeeQueryParams = {}): Promise<EmployeeListResponse> {
    try {
      const response = await api.get('/employees', { params });
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id: string): Promise<EmployeeResponse> {
    try {
      const response = await api.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Get employees by branch
   */
  async getEmployeesByBranch(branchId: string): Promise<EmployeeListResponse> {
    try {
      const response = await api.get(`/employees/by-branch/${branchId}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Create employee (with file upload)
   */
  async createEmployee(employeeData: EmployeeFormData): Promise<EmployeeResponse> {
    try {
      // Validate files if present
      const profileImage = employeeData.get('fotoProfil') as File;
      const ktpFile = employeeData.get('dokumen.ktp') as File;
      const npwpFile = employeeData.get('dokumen.npwp') as File;

      if (profileImage) this.validateFile(profileImage);
      if (ktpFile) this.validateFile(ktpFile, true);
      if (npwpFile) this.validateFile(npwpFile, true);

      const response = await api.post('/employees', employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          console.log('Upload Progress:', percentCompleted);
        },
      });
      
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Update employee (with file upload)
   */
  async updateEmployee(id: string, employeeData: EmployeeFormData): Promise<EmployeeResponse> {
    try {
      // Validate files if present
      const profileImage = employeeData.get('fotoProfil') as File;
      const ktpFile = employeeData.get('dokumen.ktp') as File;
      const npwpFile = employeeData.get('dokumen.npwp') as File;

      if (profileImage) this.validateFile(profileImage);
      if (ktpFile) this.validateFile(ktpFile, true);
      if (npwpFile) this.validateFile(npwpFile, true);

      const response = await api.put(`/employees/${id}`, employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          console.log('Upload Progress:', percentCompleted);
        },
      });
      
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: string, hardDelete: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/employees/${id}`, {
        params: {
          hardDelete: hardDelete
        }
      });
      
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<RoleListResponse> {
    try {
      // Perubahan endpoint dari '/employees/roles' ke '/roles'
      // karena kemungkinan endpoint sebenarnya adalah '/api/roles'
      const response = await api.get('/roles');
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<RoleResponse> {
    try {
      const response = await api.get(`/employees/roles/${id}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Create role
   */
  async createRole(roleData: Omit<Role, '_id' | 'createdAt' | 'updatedAt'>): Promise<RoleResponse> {
    try {
      const response = await api.post('/employees/roles', roleData);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Update role
   */
  async updateRole(
    id: string,
    roleData: Partial<Omit<Role, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<RoleResponse> {
    try {
      const response = await api.put(`/employees/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/employees/roles/${id}`);
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }
}

// Export a singleton instance
export default new EmployeeService();