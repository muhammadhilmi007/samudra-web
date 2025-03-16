// src/services/reportService.ts
import api from './api';

const reportService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const response = await api.get('/reports/dashboard-stats');
    return response.data;
  },

  // Get sales report
  async getSalesReport(params: any) {
    const response = await api.get('/reports/sales', { params });
    return response.data;
  },

  // Get revenue report
  async getRevenueReport(params: any) {
    const response = await api.get('/reports/revenue', { params });
    return response.data;
  },

  // Get revenue monthly report
  async getMonthlyRevenueReport() {
    const response = await api.get('/reports/revenue/monthly');
    return response.data;
  },

  // Get revenue daily report
  async getDailyRevenueReport() {
    const response = await api.get('/reports/revenue/daily');
    return response.data;
  },

  // Get returns report
  async getReturnsReport(params: any) {
    const response = await api.get('/reports/returns', { params });
    return response.data;
  },

  // Get receivables report
  async getReceivablesReport(params: any) {
    const response = await api.get('/reports/receivables', { params });
    return response.data;
  },

  // Get balance sheet
  async getBalanceSheet(params: any) {
    const response = await api.get('/reports/balance-sheet', { params });
    return response.data;
  },

  // Get profit & loss report
  async getProfitLossReport(params: any) {
    const response = await api.get('/reports/profit-loss', { params });
    return response.data;
  },

  // Export report
  async exportReport(reportType: string, params: any) {
    const response = await api.get(`/reports/export/${reportType}`, { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  }
};

export default reportService;