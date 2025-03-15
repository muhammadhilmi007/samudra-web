// src/services/forwarderService.ts
import api from './api';
import { ForwarderOption } from '../types/stt';

const forwarderService = {
  // Get all forwarders
  async getForwarders() {
    const response = await api.get('/forwarders');
    return response.data;
  },

  // Get forwarder by ID
  async getForwarderById(id: string) {
    const response = await api.get(`/forwarders/${id}`);
    return response.data;
  },

  // Create forwarder
  async createForwarder(forwarderData: Partial<ForwarderOption>) {
    const response = await api.post('/forwarders', forwarderData);
    return response.data;
  },

  // Update forwarder
  async updateForwarder(id: string, forwarderData: Partial<ForwarderOption>) {
    const response = await api.put(`/forwarders/${id}`, forwarderData);
    return response.data;
  },

  // Delete forwarder
  async deleteForwarder(id: string) {
    const response = await api.delete(`/forwarders/${id}`);
    return response.data;
  },
};

export default forwarderService;