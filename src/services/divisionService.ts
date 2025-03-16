// src/services/divisionService.ts
import api from './api';
import { Division } from '../types/branch';

const divisionService = {
  // Get all divisions
  async getDivisions() {
    const response = await api.get('/divisions');
    return response.data;
  },

  // Get division by ID
  async getDivisionById(id: string) {
    const response = await api.get(`/divisions/${id}`);
    return response.data;
  },

  // Create division
  async createDivision(divisionData: Partial<Division>) {
    const response = await api.post('/divisions', divisionData);
    return response.data;
  },

  // Update division
  async updateDivision(id: string, divisionData: Partial<Division>) {
    const response = await api.put(`/divisions/${id}`, divisionData);
    return response.data;
  },

  // Delete division
  async deleteDivision(id: string) {
    const response = await api.delete(`/divisions/${id}`);
    return response.data;
  },
};

export default divisionService;