// src/services/pickupRequestService.ts
import api from "./api";
import {
  PickupRequestFormInputs,
  PickupRequestFilterParams,
  StatusUpdateInput,
  LinkPickupInput
} from "../types/pickupRequest";

const pickupRequestService = {
  /**
   * Get pickup requests with optional filters
   */
  getPickupRequests: async (filters: PickupRequestFilterParams = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add each filter to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await api.get(
      `/pickup-requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  /**
   * Get pending pickup requests
   */
  getPendingPickupRequests: async (filters: PickupRequestFilterParams = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add each filter to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await api.get(
      `/pickup-requests/pending${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  },

  /**
   * Get pickup request by ID
   */
  getPickupRequestById: async (id: string) => {
    const response = await api.get(`/pickup-requests/${id}`);
    return response.data;
  },

  /**
   * Create pickup request
   */
  createPickupRequest: async (requestData: PickupRequestFormInputs) => {
    const response = await api.post("/pickup-requests", requestData);
    return response.data;
  },

  /**
   * Update pickup request
   */
  updatePickupRequest: async (
    id: string,
    requestData: Partial<PickupRequestFormInputs>
  ) => {
    const response = await api.put(`/pickup-requests/${id}`, requestData);
    return response.data;
  },

  /**
   * Update pickup request status
   */
  updatePickupRequestStatus: async (id: string, statusData: StatusUpdateInput) => {
    const response = await api.put(`/pickup-requests/${id}/status`, statusData);
    return response.data;
  },

  /**
   * Delete pickup request
   */
  deletePickupRequest: async (id: string) => {
    const response = await api.delete(`/pickup-requests/${id}`);
    return response.data;
  },

  /**
   * Link pickup request to pickup
   */
  linkToPickup: async (id: string, linkData: LinkPickupInput) => {
    const response = await api.put(`/pickup-requests/${id}/link`, linkData);
    return response.data;
  },

  /**
   * Get pickup requests by customer
   */
  getPickupRequestsByCustomer: async (customerId: string, filters: PickupRequestFilterParams = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add each filter to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    const response = await api.get(
      `/pickup-requests/customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    );
    return response.data;
  }
};

export default pickupRequestService;