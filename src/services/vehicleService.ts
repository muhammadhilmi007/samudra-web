// src/services/vehicleService.ts
import api from "./api";
import {
  mapVehicleTypeToBackend,
  mapVehicleTypeToFrontend,
} from "../types/vehicle";

const vehicleService = {
  // Get all vehicles
  async getVehicles() {
    const response = await api.get("/vehicles");
    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Get vehicle by ID
  async getVehicleById(id: string) {
    const response = await api.get(`/vehicles/${id}`);
    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = {
        ...response.data.data,
        tipeDisplay: mapVehicleTypeToFrontend(response.data.data.tipe),
      };
    }
    return response.data;
  },

  // Get vehicles by branch
  async getVehiclesByBranch(branchId: string) {
    const response = await api.get(`/vehicles/by-branch/${branchId}`);
    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Get trucks
  async getTrucks() {
    const response = await api.get("/vehicles/trucks");
    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Get delivery vehicles
  async getDeliveryVehicles() {
    const response = await api.get("/vehicles/delivery");
    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Get available vehicles for pickup
  async getAvailableVehiclesForPickup(branchId?: string) {
    const url = branchId
      ? `/vehicles/available-for-pickup?cabangId=${branchId}`
      : "/vehicles/available-for-pickup";

    const response = await api.get(url);

    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Get available trucks for loading
  async getAvailableTrucksForLoading(branchId?: string) {
    const url = branchId
      ? `/vehicles/available-for-loading?cabangId=${branchId}`
      : "/vehicles/available-for-loading";

    const response = await api.get(url);

    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Get mobile-optimized vehicle list
  async getMobileVehicles(params?: {
    cabangId?: string;
    tipe?: string;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params?.cabangId) {
      queryParams.append("cabangId", params.cabangId);
    }

    if (params?.tipe) {
      queryParams.append("tipe", params.tipe);
    }

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const url = `/vehicles/mobile${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await api.get(url);

    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = response.data.data.map((vehicle: any) => ({
        ...vehicle,
        tipeDisplay: mapVehicleTypeToFrontend(vehicle.tipe),
      }));
    }
    return response.data;
  },

  // Create vehicle (with file upload)
  async createVehicle(vehicleData: FormData) {
    // If tipe field exists in form data, ensure it's converted to backend format
    const tipeValue = vehicleData.get("tipe");
    if (tipeValue && typeof tipeValue === "string") {
      vehicleData.delete("tipe");
      vehicleData.append(
        "tipe",
        mapVehicleTypeToBackend(tipeValue as "Lansir" | "Antar Cabang")
      );
    }

    const response = await api.post("/vehicles", vehicleData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = {
        ...response.data.data,
        tipeDisplay: mapVehicleTypeToFrontend(response.data.data.tipe),
      };
    }
    return response.data;
  },

  // Update vehicle (with file upload)
  async updateVehicle(id: string, vehicleData: FormData) {
    // If tipe field exists in form data, ensure it's converted to backend format
    const tipeValue = vehicleData.get("tipe");
    if (tipeValue && typeof tipeValue === "string") {
      vehicleData.delete("tipe");
      vehicleData.append(
        "tipe",
        mapVehicleTypeToBackend(tipeValue as "Lansir" | "Antar Cabang")
      );
    }

    const response = await api.put(`/vehicles/${id}`, vehicleData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Map response data to frontend format
    if (response.data && response.data.data) {
      response.data.data = {
        ...response.data.data,
        tipeDisplay: mapVehicleTypeToFrontend(response.data.data.tipe),
      };
    }
    return response.data;
  },

  // Delete vehicle
  async deleteVehicle(id: string) {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export default vehicleService;
