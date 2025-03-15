// src/services/customerService.ts
import api from './api';
import { Customer } from '../types/customer';

const customerService = {
  // Get all customers
  async getCustomers() {
    const response = await api.get('/customers');
    return response.data;
  },

  // Get customer by ID
  async getCustomerById(id: string) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  // Get customers by branch
  async getCustomersByBranch(branchId: string) {
    const response = await api.get(`/customers/by-branch/${branchId}`);
    return response.data;
  },

  // Get senders
  async getSenders() {
    const response = await api.get('/customers/senders');
    return response.data;
  },

  // Get recipients
  async getRecipients() {
    const response = await api.get('/customers/recipients');
    return response.data;
  },

  // Create customer
  async createCustomer(customerData: Partial<Customer>) {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  // Update customer
  async updateCustomer(id: string, customerData: Partial<Customer>) {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer
  async deleteCustomer(id: string) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export default customerService;