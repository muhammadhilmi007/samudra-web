// src/services/loadingService.ts
import api from './api';
import { LoadingFormInputs, LoadingStatusUpdate, TruckQueueFormInputs } from '../types/loading';

const loadingService = {
  // Loading API calls
  async getLoadings() {
    const response = await api.get('/loadings');
    return response.data;
  },

  async getLoadingById(id: string) {
    const response = await api.get(`/loadings/${id}`);
    return response.data;
  },

  async getLoadingsBySTT(sttId: string) {
    const response = await api.get(`/loadings/by-stt/${sttId}`);
    return response.data;
  },

  async getLoadingsByTruck(truckId: string) {
    const response = await api.get(`/loadings/by-truck/${truckId}`);
    return response.data;
  },

  async createLoading(loadingData: LoadingFormInputs) {
    const response = await api.post('/loadings', loadingData);
    return response.data;
  },

  async updateLoading(id: string, loadingData: Partial<LoadingFormInputs>) {
    const response = await api.put(`/loadings/${id}`, loadingData);
    return response.data;
  },

  async updateLoadingStatus(id: string, statusData: LoadingStatusUpdate) {
    const response = await api.put(`/loadings/${id}/status`, statusData);
    return response.data;
  },

  async deleteLoading(id: string) {
    const response = await api.delete(`/loadings/${id}`);
    return response.data;
  },

  async generateDMB(id: string) {
    const response = await api.get(`/loadings/generate-dmb/${id}`);
    return response.data;
  },

  // Truck Queue API calls
  async getTruckQueues() {
    const response = await api.get('/truck-queues');
    return response.data;
  },

  async getTruckQueueById(id: string) {
    const response = await api.get(`/truck-queues/${id}`);
    return response.data;
  },

  async getTruckQueuesByBranch(branchId: string) {
    const response = await api.get(`/truck-queues/by-branch/${branchId}`);
    return response.data;
  },

  async getTruckQueuesByStatus(status: string) {
    const response = await api.get(`/truck-queues/by-status/${status}`);
    return response.data;
  },

  async createTruckQueue(queueData: TruckQueueFormInputs) {
    const response = await api.post('/truck-queues', queueData);
    return response.data;
  },

  async updateTruckQueue(id: string, queueData: Partial<TruckQueueFormInputs>) {
    const response = await api.put(`/truck-queues/${id}`, queueData);
    return response.data;
  },

  async updateTruckQueueStatus(id: string, status: 'MENUNGGU' | 'MUAT' | 'BERANGKAT') {
    const response = await api.put(`/truck-queues/${id}/status`, { status });
    return response.data;
  },

  async deleteTruckQueue(id: string) {
    const response = await api.delete(`/truck-queues/${id}`);
    return response.data;
  },

  // Mobile API calls
  async getMobileTruckQueues() {
    const response = await api.get('/mobile/truck-queues');
    return response.data;
  },

  async createMobileTruckQueue(queueData: TruckQueueFormInputs) {
    const response = await api.post('/mobile/truck-queues', queueData);
    return response.data;
  },
};

export default loadingService;