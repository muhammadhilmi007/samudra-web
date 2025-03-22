// src/services/branchService.ts
import api from "./api";
import { Branch } from "../types/branch";

const branchService = {
  // Get all branches
  async getBranches() {
    try {
      const response = await api.get("/branches");
      console.log("Raw API response for branches:", response);

      // Handle different possible response structures
      let branches;
      if (Array.isArray(response.data)) {
        branches = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        branches = response.data.data;
      } else if (
        response.data?.branches &&
        Array.isArray(response.data.branches)
      ) {
        branches = response.data.branches;
      } else {
        branches = [];
        console.warn("Unexpected API response format:", response.data);
      }

      console.log("Processed branch data:", branches);
      return branches;
    } catch (error) {
      console.error("API error getting branches:", error);
      throw error;
    }
  },

  // Get branch by ID
  async getBranchById(id: string) {
    const response = await api.get(`/branches/${id}`);
    return response.data;
  },

  // Get branches by division
  async getBranchesByDivision(divisionId: string) {
    const response = await api.get(`/branches/by-division/${divisionId}`);
    return response.data;
  },

  // Create branch
  async createBranch(branchData: Partial<Branch>) {
    console.log("Sending branch data to API:", JSON.stringify(branchData, null, 2));
    try {
      const response = await api.post("/branches", branchData);
      return response.data;
    } catch (error) {
      console.error("Error creating branch:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update branch
  async updateBranch(id: string, branchData: Partial<Branch>) {
    const response = await api.put(`/branches/${id}`, branchData);
    return response.data;
  },

  // Delete branch
  async deleteBranch(id: string) {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};

export default branchService;