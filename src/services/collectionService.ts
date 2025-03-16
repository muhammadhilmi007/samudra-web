// src/services/collectionService.ts
import api from './api';
import { CollectionFormInputs, PaymentInput } from '../types/collection';

const collectionService = {
  // Get all collections
  async getCollections() {
    const response = await api.get('/collections');
    return response.data;
  },

  // Get collection by ID
  async getCollectionById(id: string) {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },

  // Get collections by branch
  async getCollectionsByBranch(branchId: string) {
    const response = await api.get(`/collections/by-branch/${branchId}`);
    return response.data;
  },

  // Get collections by customer
  async getCollectionsByCustomer(customerId: string) {
    const response = await api.get(`/collections/by-customer/${customerId}`);
    return response.data;
  },

  // Get collections by status
  async getCollectionsByStatus(status: 'LUNAS' | 'BELUM LUNAS') {
    const response = await api.get(`/collections/by-status/${status}`);
    return response.data;
  },

  // Create collection
  async createCollection(collectionData: CollectionFormInputs) {
    const response = await api.post('/collections', collectionData);
    return response.data;
  },

  // Update collection
  async updateCollection(id: string, collectionData: Partial<CollectionFormInputs>) {
    const response = await api.put(`/collections/${id}`, collectionData);
    return response.data;
  },

  // Update collection status
  async updateCollectionStatus(id: string, status: 'LUNAS' | 'BELUM LUNAS') {
    const response = await api.put(`/collections/${id}/status`, { status });
    return response.data;
  },

  // Add payment
  async addPayment(paymentData: PaymentInput) {
    const response = await api.post('/collections/payment', paymentData);
    return response.data;
  },

  // Generate invoice
  async generateInvoice(id: string) {
    const response = await api.get(`/collections/generate-invoice/${id}`);
    return response.data;
  },
};

export default collectionService;