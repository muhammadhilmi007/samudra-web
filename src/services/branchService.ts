// src/services/branchService.ts
import api from "./api";
import { Branch, BranchFormInputs } from "../types/branch";

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
      // Format data for backend - transform from dot notation to nested object
      // This is critical for ensuring kontakPenanggungJawab data is properly saved
      const formattedData: any = {
        namaCabang: branchData.namaCabang,
        divisiId: branchData.divisiId,
        alamat: branchData.alamat,
        kelurahan: branchData.kelurahan,
        kecamatan: branchData.kecamatan,
        kota: branchData.kota,
        provinsi: branchData.provinsi,
      };

      // Only include kontakPenanggungJawab if at least one field has a value
      const { nama, telepon, email } = branchData.kontakPenanggungJawab || {};
      if (nama || telepon || email) {
        formattedData.kontakPenanggungJawab = {
          nama: nama || "",
          telepon: telepon || "",
          email: email || ""
        };
      }
      
      // Log the formatted data for debugging
      console.log("Formatted branch data for API:", formattedData);
      
      const response = await api.post("/branches", formattedData);
      
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
      // Format data for backend - similar to createBranch
      const formattedData: any = {...branchData};
      
      // Only include kontakPenanggungJawab if at least one field has a value
      if (branchData.kontakPenanggungJawab) {
        const { nama, telepon, email } = branchData.kontakPenanggungJawab;
        if (nama || telepon || email) {
          formattedData.kontakPenanggungJawab = {
            nama: nama || "",
            telepon: telepon || "",
            email: email || ""
          };
        }
      }
      
      // Log the formatted data for debugging
      console.log("Formatted branch update data for API:", formattedData);
      
      const response = await api.put(`/branches/${id}`, formattedData);
      
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