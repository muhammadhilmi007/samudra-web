// src/services/vehicleService.ts
import api from './api';

const vehicleService = {
  // Get all vehicles
  async getVehicles() {
    const response = await api.get('/vehicles');
    return response.data;
  },

  // Get vehicle by ID
  async getVehicleById(id: string) {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Get vehicles by branch
  async getVehiclesByBranch(branchId: string) {
    const response = await api.get(`/vehicles/by-branch/${branchId}`);
    return response.data;
  },

  // Get trucks
  async getTrucks() {
    const response = await api.get('/vehicles/trucks');
    return response.data;
  },

  // Get delivery vehicles
  async getDeliveryVehicles() {
    const response = await api.get('/vehicles/delivery');
    return response.data;
  },

  // Create vehicle (with file upload)
  async createVehicle(vehicleData: FormData) {
    const response = await api.post('/vehicles', vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update vehicle (with file upload)
  async updateVehicle(id: string, vehicleData: FormData) {
    const response = await api.put(`/vehicles/${id}`, vehicleData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete vehicle
  async deleteVehicle(id: string) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export default vehicleService;