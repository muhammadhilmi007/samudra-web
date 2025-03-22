// src/services/returnService.ts
import api from './api';
import { ReturnFormInputs } from '../types/return';

const returnService = {
  // Get all returns
  async getReturns() {
    const response = await api.get('/returns');
    return response.data;
  },

  // Get return by ID
  async getReturnById(id: string) {
    const response = await api.get(`/returns/${id}`);
    return response.data;
  },

  // Get returns by branch
  async getReturnsByBranch(branchId: string) {
    const response = await api.get(`/returns/by-branch/${branchId}`);
    return response.data;
  },

  // Get returns by STT
  async getReturnsBySTT(sttId: string) {
    const response = await api.get(`/returns/by-stt/${sttId}`);
    return response.data;
  },

  // Create return
  async createReturn(returnData: ReturnFormInputs) {
    const response = await api.post('/returns', returnData);
    return response.data;
  },

  // Update return
  async updateReturn(id: string, returnData: Partial<ReturnFormInputs>) {
    const response = await api.put(`/returns/${id}`, returnData);
    return response.data;
  },

  // Update return status
  async updateReturnStatus(id: string, status: 'PROSES' | 'SAMPAI') {
    const response = await api.put(`/returns/${id}/status`, { status });
    return response.data;
  },

  // Delete return
  async deleteReturn(id: string) {
    const response = await api.delete(`/returns/${id}`);
    return response.data;
  },
};

export default returnService;