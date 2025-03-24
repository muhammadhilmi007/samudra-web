// src/services/customerService.ts
import api from './api';
import { Customer, CustomerFormInputs } from '../types/customer';

const customerService = {
  // Get all customers
  async getCustomers() {
    const response = await api.get('/customers');
    return response.data.data; // Extract data from nested response
  },

  // Get customer by ID
  async getCustomerById(id: string) {
    const response = await api.get(`/customers/${id}`);
    return response.data.data; // Extract data from nested response
  },

  // Get customers by branch
  async getCustomersByBranch(branchId: string) {
    const response = await api.get(`/customers/by-branch/${branchId}`);
    return response.data.data; // Extract data from nested response
  },

  // Get customers by type
  async getCustomersByType(type: string) {
    // Convert frontend type format to backend format
    const backendType = type.toLowerCase();
    const response = await api.get(`/customers?tipe=${backendType}`);
    return response.data.data; // Extract data from nested response
  },

  // Get senders
  async getSenders() {
    const response = await api.get('/customers/senders');
    return response.data.data; // Extract data from nested response
  },

  // Get recipients
  async getRecipients() {
    const response = await api.get('/customers/recipients');
    return response.data.data; // Extract data from nested response
  },

  // Get customer's STTs
  async getCustomerSTTs(customerId: string) {
    const response = await api.get(`/stt/by-customer/${customerId}`);
    return response.data.data; // Extract data from nested response
  },

  // Get customer's collections
  async getCustomerCollections(customerId: string) {
    const response = await api.get(`/collections/by-customer/${customerId}`);
    return response.data.data; // Extract data from nested response
  },

  // Get customer's pickups
  async getCustomerPickups(customerId: string) {
    const response = await api.get(`/pickups/by-sender/${customerId}`);
    return response.data.data; // Extract data from nested response
  },

  // Create customer
  async createCustomer(customerData: CustomerFormInputs) {
    // Convert frontend type format to backend format
    const backendData = {
      ...customerData,
      tipe: customerData.tipe.toLowerCase()
    };
    
    const response = await api.post('/customers', backendData);
    return response.data.data; // Extract data from nested response
  },

  // Update customer
  async updateCustomer(id: string, customerData: CustomerFormInputs) {
    // Convert frontend type format to backend format
    const backendData = {
      ...customerData,
      tipe: customerData.tipe.toLowerCase()
    };
    
    const response = await api.put(`/customers/${id}`, backendData);
    return response.data.data; // Extract data from nested response
  },

  // Delete customer
  async deleteCustomer(id: string) {
    const response = await api.delete(`/customers/${id}`);
    return response.data; // Keep full response for success message
  },
};

export default customerService;