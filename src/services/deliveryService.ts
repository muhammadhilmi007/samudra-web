// src/services/deliveryService.ts
import api from './api';
import { DeliveryFormInputs, DeliveryStatusUpdate, VehicleQueueFormInputs } from '../types/delivery';

const deliveryService = {
  // Get all deliveries
  async getDeliveries() {
    const response = await api.get('/deliveries');
    return response.data;
  },

  // Get delivery by ID
  async getDeliveryById(id: string) {
    const response = await api.get(`/deliveries/${id}`);
    return response.data;
  },

  // Get deliveries by branch
  async getDeliveriesByBranch(branchId: string) {
    const response = await api.get(`/deliveries/by-branch/${branchId}`);
    return response.data;
  },

  // Get deliveries by STT
  async getDeliveriesBySTT(sttId: string) {
    const response = await api.get(`/deliveries/by-stt/${sttId}`);
    return response.data;
  },

  // Get deliveries by vehicle
  async getDeliveriesByVehicle(vehicleId: string) {
    const response = await api.get(`/deliveries/by-vehicle/${vehicleId}`);
    return response.data;
  },

  // Create delivery
  async createDelivery(deliveryData: DeliveryFormInputs) {
    const response = await api.post('/deliveries', deliveryData);
    return response.data;
  },

  // Update delivery
  async updateDelivery(id: string, deliveryData: Partial<DeliveryFormInputs>) {
    const response = await api.put(`/deliveries/${id}`, deliveryData);
    return response.data;
  },

  // Update delivery status
  async updateDeliveryStatus(id: string, statusData: DeliveryStatusUpdate) {
    const response = await api.put(`/deliveries/${id}/status`, statusData);
    return response.data;
  },

  // Generate delivery form
  async generateDeliveryForm(id: string) {
    const response = await api.get(`/deliveries/generate-form/${id}`);
    return response.data;
  },

  // Vehicle Queue API calls
  // Get all vehicle queues
  async getVehicleQueues() {
    const response = await api.get('/vehicle-queues');
    return response.data;
  },

  // Get vehicle queue by ID
  async getVehicleQueueById(id: string) {
    const response = await api.get(`/vehicle-queues/${id}`);
    return response.data;
  },

  // Get vehicle queues by branch
  async getVehicleQueuesByBranch(branchId: string) {
    const response = await api.get(`/vehicle-queues/by-branch/${branchId}`);
    return response.data;
  },

  // Get vehicle queues by status
  async getVehicleQueuesByStatus(status: string) {
    const response = await api.get(`/vehicle-queues/by-status/${status}`);
    return response.data;
  },

  // Create vehicle queue
  async createVehicleQueue(queueData: VehicleQueueFormInputs) {
    const response = await api.post('/vehicle-queues', queueData);
    return response.data;
  },

  // Update vehicle queue
  async updateVehicleQueue(id: string, queueData: Partial<VehicleQueueFormInputs>) {
    const response = await api.put(`/vehicle-queues/${id}`, queueData);
    return response.data;
  },

  // Update vehicle queue status
  async updateVehicleQueueStatus(id: string, status: 'MENUNGGU' | 'LANSIR' | 'KEMBALI') {
    const response = await api.put(`/vehicle-queues/${id}/status`, { status });
    return response.data;
  },

  // Delete vehicle queue
  async deleteVehicleQueue(id: string) {
    const response = await api.delete(`/vehicle-queues/${id}`);
    return response.data;
  },
};

export default deliveryService;