// src/services/employeeService.ts
import api from './api';
import { Employee, Role } from '../types/employee';

const employeeService = {
  // Get all employees
  async getEmployees(params = {}) {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get employee by ID
  async getEmployeeById(id: string) {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Get employees by branch
  async getEmployeesByBranch(branchId: string) {
    const response = await api.get(`/employees/by-branch/${branchId}`);
    return response.data;
  },

  // Create employee (with file upload)
  async createEmployee(employeeData: FormData) {
    const response = await api.post('/employees', employeeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update employee (with file upload)
  async updateEmployee(id: string, employeeData: FormData) {
    const response = await api.put(`/employees/${id}`, employeeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete employee
  async deleteEmployee(id: string) {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Get all roles
  async getRoles() {
    const response = await api.get('/roles');
    return response.data;
  },

  // Create role
  async createRole(roleData: Partial<Role>) {
    const response = await api.post('/roles', roleData);
    return response.data;
  },

  // Update role
  async updateRole(id: string, roleData: Partial<Role>) {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data;
  },

  // Delete role
  async deleteRole(id: string) {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },
};

export default employeeService;