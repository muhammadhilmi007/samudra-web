// src/services/sttService.ts
import api from './api';
import { STT, STTFormInputs, STTStatusUpdate } from '../types/stt';
import { saveAs } from 'file-saver';

const sttService = {
  // Get all STTs
  async getSTTs(): Promise<STT[]> {
    const response = await api.get('/stt');
    return response.data.data || [];
  },

  // Get STT by ID
  async getSTTById(id: string): Promise<STT> {
    const response = await api.get(`/stt/${id}`);
    return response.data.data;
  },

  // Get STTs by branch
  async getSTTsByBranch(branchId: string): Promise<STT[]> {
    const response = await api.get(`/stt/by-branch/${branchId}`);
    return response.data.data || [];
  },

  // Get STTs by status
  async getSTTsByStatus(status: string): Promise<STT[]> {
    const response = await api.get(`/stt/by-status/${status}`);
    return response.data.data || [];
  },

  // Get STTs by customer (sender or recipient)
  async getSTTsByCustomer(customerId: string): Promise<STT[]> {
    const response = await api.get(`/customers/${customerId}/stts`);
    return response.data.data || [];
  },

  // Get STTs for a sender
  async getSTTsBySender(senderId: string): Promise<STT[]> {
    const response = await api.get(`/stt/by-sender/${senderId}`);
    return response.data.data || [];
  },

  // Get STTs for a recipient
  async getSTTsByRecipient(recipientId: string): Promise<STT[]> {
    const response = await api.get(`/stt/by-recipient/${recipientId}`);
    return response.data.data || [];
  },

  // Create STT
  async createSTT(sttData: STTFormInputs): Promise<STT> {
    const response = await api.post('/stt', sttData);
    return response.data.data;
  },

  // Update STT
  async updateSTT(id: string, sttData: Partial<STTFormInputs>): Promise<STT> {
    const response = await api.put(`/stt/${id}`, sttData);
    return response.data.data;
  },

  // Update STT status
  async updateSTTStatus(id: string, statusData: STTStatusUpdate): Promise<STT> {
    const response = await api.put(`/stt/${id}/status`, statusData);
    return response.data.data;
  },

  // Generate PDF
  async generatePDF(id: string): Promise<Blob> {
    const response = await api.get(`/stt/generate-pdf/${id}`, {
      responseType: 'blob'
    });
    
    // Get STT details for filename
    const sttDetails = await this.getSTTById(id);
    
    // Create a file name
    const fileName = `STT-${sttDetails.noSTT}.pdf`;
    
    // Save the file
    saveAs(new Blob([response.data], { type: 'application/pdf' }), fileName);
    
    return response.data;
  },

  // Track STT
  async trackSTT(sttNumber: string): Promise<any> {
    const response = await api.get(`/stt/track/${sttNumber}`);
    return response.data.data;
  },

  // Delete STT
  async deleteSTT(id: string): Promise<void> {
    await api.delete(`/stt/${id}`);
  },

  // Batch update STTs (for loading and unloading)
  async updateBatchSTTs(ids: string[], updateData: { status: string, keterangan?: string }): Promise<STT[]> {
    const response = await api.put('/stt/batch-update', { 
      sttIds: ids, 
      data: updateData 
    });
    return response.data.data || [];
  },

  // Print multiple STTs as a single PDF
  async printBatchSTTs(ids: string[]): Promise<Blob> {
    const response = await api.post('/stt/batch-print', { sttIds: ids }, {
      responseType: 'blob'
    });
    
    // Create a file name with timestamp
    const fileName = `Batch-STT-${new Date().toISOString().slice(0, 10)}.pdf`;
    
    // Save the file
    saveAs(new Blob([response.data], { type: 'application/pdf' }), fileName);
    
    return response.data;
  },

  // Get STT statistics
  async getSTTStatistics(params: { 
    startDate?: string; 
    endDate?: string;
    branchId?: string;
  }): Promise<any> {
    const response = await api.get('/stt/statistics', { params });
    return response.data.data;
  }
};

export default sttService;