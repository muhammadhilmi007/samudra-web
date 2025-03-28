// src/services/pickupRequestService.ts
import api from "./api";
import {
  PickupRequestFormInputs,
  PickupFormInputs,
} from "../types/pickupRequest";

const pickupRequestService = {
  // Pickup Request API calls
  async getPickupRequests(filters?: Record<string, any>) {
    const queryParams = filters ? new URLSearchParams(filters).toString() : "";
    const response = await api.get(
      `/pickup-requests${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  getPickups: (filters: Record<string, any> = {}) => {
    return api.get("/pickups", { params: filters });
  },

  async getPendingPickupRequests(filters?: Record<string, any>) {
    const queryParams = filters ? new URLSearchParams(filters).toString() : "";
    const response = await api.get(
      `/pickup-requests/pending${queryParams ? `?${queryParams}` : ""}`
    );
    return response.data;
  },

  async getPickupRequestById(id: string) {
    const response = await api.get(`/pickup-requests/${id}`);
    return response.data;
  },

  async createPickupRequest(requestData: PickupRequestFormInputs) {
    const response = await api.post("/pickup-requests", requestData);
    return response.data;
  },

  async updatePickupRequest(
    id: string,
    requestData: Partial<PickupRequestFormInputs>
  ) {
    const response = await api.put(`/pickup-requests/${id}`, requestData);
    return response.data;
  },

  async updatePickupRequestStatus(id: string, status: "PENDING" | "FINISH") {
    const response = await api.put(`/pickup-requests/${id}/status`, { status });
    return response.data;
  },

  async deletePickupRequest(id: string) {
    const response = await api.delete(`/pickup-requests/${id}`);
    return response.data;
  },

  // Pickup API calls
  async createPickup(pickupData: PickupFormInputs) {
    const response = await api.post("/pickups", pickupData);
    return response.data;
  },
};

export default pickupRequestService;
