// src/services/sttService.ts
import api from './api';
import { STTFormInputs, STTStatusUpdate } from '../types/stt';

const sttService = {
  // Get all STTs
  async getSTTs() {
    const response = await api.get('/stt');
    return response.data;
  },

  // Get STT by ID
  async getSTTById(id: string) {
    const response = await api.get(`/stt/${id}`);
    return response.data;
  },

  // Get STTs by branch
  async getSTTsByBranch(branchId: string) {
    const response = await api.get(`/stt/by-branch/${branchId}`);
    return response.data;
  },

  // Get STTs by status
  async getSTTsByStatus(status: string) {
    const response = await api.get(`/stt/by-status/${status}`);
    return response.data;
  },

  // Create STT
  async createSTT(sttData: STTFormInputs) {
    const response = await api.post('/stt', sttData);
    return response.data;
  },

  // Update STT
  async updateSTT(id: string, sttData: Partial<STTFormInputs>) {
    const response = await api.put(`/stt/${id}`, sttData);
    return response.data;
  },

  // Update STT status
  // Update STT status with enhanced error handling
  async updateSTTStatus(id: string, statusData: STTStatusUpdate) {
      try {
          const response = await api.put(`/stt/${id}/status`, statusData);
          return response.data;
      } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Failed to update STT status');
      }
  },

  // Add method for batch status updates
  async updateMultipleSTTStatus(ids: string[], statusData: STTStatusUpdate) {
      try {
          const response = await api.put('/stt/batch-status-update', {
              ids,
              ...statusData
          });
          return response.data;
      } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Failed to update multiple STT status');
      }
  },

  async deleteSTT(id: string) {
    const response = await api.delete(`/stt/${id}`);
    return response.data;
  },

  // Generate PDF
  async generatePDF(id: string) {
    const response = await api.get(`/stt/generate-pdf/${id}`);
    return response.data;
  },

  // Track STT
  async trackSTT(sttNumber: string) {
    const response = await api.get(`/stt/track/${sttNumber}`);
    return response.data;
  },
};

export default sttService;