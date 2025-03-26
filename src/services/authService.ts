// src/services/authService.ts
import api from './api';
import { LoginParams, RegisterParams, ChangePasswordParams } from '../types/auth';

const authService = {
  // Login user
  async login(credentials: LoginParams) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  async register(userData: RegisterParams) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
  async getMe() {
    const response = await api.get('/auth/me');
    return response;
  },

  // Change password
  async changePassword(passwordData: ChangePasswordParams) {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },
};

export default authService;