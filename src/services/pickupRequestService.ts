// src/services/pickupRequestService.ts
import api from './api';
import { PickupRequestFormInputs, PickupFormInputs } from '../types/pickupRequest';

const pickupRequestService = {
  // Pickup Request API calls
  async getPickupRequests() {
    const response = await api.get('/pickup-requests');
    return response.data;
  },

  async getPendingPickupRequests() {
    const response = await api.get('/pickup-requests/pending');
    return response.data;
  },

  async getPickupRequestById(id: string) {
    const response = await api.get(`/pickup-requests/${id}`);
    return response.data;
  },

  async createPickupRequest(requestData: PickupRequestFormInputs) {
    const response = await api.post('/pickup-requests', requestData);
    return response.data;
  },

  async updatePickupRequest(id: string, requestData: Partial<PickupRequestFormInputs>) {
    const response = await api.put(`/pickup-requests/${id}`, requestData);
    return response.data;
  },

  async updatePickupRequestStatus(id: string, status: 'PENDING' | 'FINISH') {
    const response = await api.put(`/pickup-requests/${id}/status`, { status });
    return response.data;
  },

  async deletePickupRequest(id: string) {
    const response = await api.delete(`/pickup-requests/${id}`);
    return response.data;
  },

  // Pickup API calls
  async getPickups() {
    const response = await api.get('/pickups');
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

  async addSTTToPickup(id: string, sttId: string) {
    const response = await api.put(`/pickups/${id}/add-stt`, { sttId });
    return response.data;
  },

  async removeSTTFromPickup(id: string, sttId: string) {
    const response = await api.put(`/pickups/${id}/remove-stt`, { sttId });
    return response.data;
  },

  // Mobile API calls for pickups
  async getMobilePickupRequests() {
    const response = await api.get('/mobile/pickup-requests');
    return response.data;
  },

  async updateMobilePickupRequestStatus(id: string, status: 'PENDING' | 'FINISH') {
    const response = await api.put(`/mobile/pickup-requests/${id}/status`, { status });
    return response.data;
  },
};

export default pickupRequestService;