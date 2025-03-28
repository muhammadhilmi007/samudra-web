// src/services/pickupService.ts
import api from './api';
import { PickupFormInputs } from '../types/pickupRequest';

const pickupService = {
  // Pickup API calls
  async getPickups(filters?: Record<string, any>) {
    const queryParams = filters ? new URLSearchParams(filters).toString() : '';
    const response = await api.get(`/pickups${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  async getPickupById(id: string) {
    const response = await api.get(`/pickups/${id}`);
    return response.data;
  },

  async createPickup(pickupData: PickupFormInputs) {
    const response = await api.post('/pickups', pickupData);
    return response.data;
  },

  async updatePickup(id: string, pickupData: Partial<PickupFormInputs>) {
    const response = await api.put(`/pickups/${id}`, pickupData);
    return response.data;
  },

  async deletePickup(id: string) {
    const response = await api.delete(`/pickups/${id}`);
    return response.data;
  },

  async updatePickupStatus(id: string, status: 'PENDING' | 'BERANGKAT' | 'SELESAI' | 'CANCELLED') {
    const response = await api.put(`/pickups/${id}/status`, { status });
    return response.data;
  },

  async addSTTToPickup(id: string, sttIds: string[]) {
    const response = await api.put(`/pickups/${id}/add-stt`, { sttIds });
    return response.data;
  },

  async removeSTTFromPickup(id: string, sttId: string) {
    const response = await api.put(`/pickups/${id}/remove-stt`, { sttId });
    return response.data;
  },

  async getPickupsBySender(senderId: string) {
    const response = await api.get(`/pickups/by-sender/${senderId}`);
    return response.data;
  },

  // Mobile API methods
  async getMobilePickups() {
    const response = await api.get('/mobile/pickups');
    return response.data;
  },

  async updateMobilePickupStatus(id: string, status: 'BERANGKAT' | 'SELESAI') {
    const response = await api.put(`/mobile/pickups/${id}/status`, { status });
    return response.data;
  },
};

export default pickupService;