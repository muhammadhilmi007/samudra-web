// src/services/branchService.ts
import api from "./api";
import { Branch, BranchFormInputs, BranchCreateData } from "../types/branch";

const branchService = {
  // Get all branches
  async getBranches() {
    try {
      const response = await api.get("/branches");
      
      // Handle different possible response structures
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.branches && Array.isArray(response.data.branches)) {
        return response.data.branches;
      }
      
      // Log unexpected format but return empty array to prevent errors
      console.warn("Unexpected API response format:", response.data);
      return [];
    } catch (error) {
      console.error("API error getting branches:", error);
      throw error;
    }
  },

  // Get branch by ID
  async getBranchById(id: string) {
    try {
      const response = await api.get(`/branches/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching branch with ID ${id}:`, error);
      throw error;
    }
  },

  // Get branches by division
  async getBranchesByDivision(divisionId: string) {
    try {
      const response = await api.get(`/branches/by-division/${divisionId}`);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching branches for division ${divisionId}:`, error);
      throw error;
    }
  },

  // Create branch
  async createBranch(branchData: BranchFormInputs) {
    try {
      // Format data exactly as is (no need to transform dot notation fields)
      console.log("Sending branch data to API:", branchData);
      
      const response = await api.post("/branches", branchData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Error creating branch:", error.response?.data || error.message);
      
      // Throw a more informative error
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Format validation errors
        const errorMessages = Object.values(error.response.data.errors).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      
      throw error;
    }
  },

  // Update branch
  async updateBranch(id: string, branchData: Partial<BranchFormInputs>) {
    try {
      console.log("Updating branch data:", branchData);
      
      const response = await api.put(`/branches/${id}`, branchData);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Error updating branch ${id}:`, error.response?.data || error.message);
      
      // Throw a more informative error
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Format validation errors
        const errorMessages = Object.values(error.response.data.errors).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      
      throw error;
    }
  },

  // Delete branch
  async deleteBranch(id: string) {
    try {
      const response = await api.delete(`/branches/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting branch ${id}:`, error.response?.data || error.message);
      
      // Throw a more informative error
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },
  
  // Get branch statistics
  async getBranchStats(id: string) {
    try {
      const response = await api.get(`/branches/${id}/stats`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for branch ${id}:`, error);
      throw error;
    }
  }
};

export default branchService;