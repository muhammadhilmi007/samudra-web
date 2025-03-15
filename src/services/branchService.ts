// src/services/branchService.ts
import api from './api';
import { Branch } from '../types/branch';

const branchService = {
  // Get all branches
  async getBranches() {
    const response = await api.get('/branches');
    return response.data;
  },

  // Get branch by ID
  async getBranchById(id: string) {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  // Get branches by division
  async getBranchesByDivision(divisionId: string) {
    const response = await api.get(`/branches/by-division/${divisionId}`);
    return response.data;
  },

  // Create branch
  async createBranch(branchData: Partial<Branch>) {
    const response = await api.post('/branches', branchData);
    return response.data;
  },

  // Update branch
  async updateBranch(id: string, branchData: Partial<Branch>) {
    const response = await api.put(`/branches/${id}`, branchData);
    return response.data;
  },

  // Delete branch
  async deleteBranch(id: string) {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};

export default branchService;