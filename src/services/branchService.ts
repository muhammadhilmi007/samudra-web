import api from "./api";
import { Branch, BranchFormSubmitData } from "../types/branch";

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
    try {
      const response = await api.get(`/branches/${id}`);
      
      // Handle different possible response structures
      let branch;
      if (response.data && response.data._id) {
        branch = response.data;
      } else if (response.data?.data && response.data.data._id) {
        branch = response.data.data;
      } else if (response.data?.branch && response.data.branch._id) {
        branch = response.data.branch;
      } else {
        console.warn("Unexpected API response format for branch by ID:", response.data);
        throw new Error("Invalid branch data format");
      }

      return branch;
    } catch (error) {
      console.error(`Error fetching branch with ID ${id}:`, error);
      throw error;
    }
  },

  // Get branches by division
  async getBranchesByDivision(divisionId: string) {
    try {
      const response = await api.get(`/branches/by-division/${divisionId}`);
      
      // Handle different possible response structures
      let branches;
      if (Array.isArray(response.data)) {
        branches = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        branches = response.data.data;
      } else if (response.data?.branches && Array.isArray(response.data.branches)) {
        branches = response.data.branches;
      } else {
        console.warn("Unexpected API response format for branches by division:", response.data);
        branches = [];
      }

      return branches;
    } catch (error) {
      console.error(`Error fetching branches for division ${divisionId}:`, error);
      throw error;
    }
  },

  // Create branch
  async createBranch(branchData: BranchFormSubmitData) {
    try {
      // Validate required fields before proceeding
      if (!branchData.namaCabang || !branchData.divisiId || !branchData.alamat) {
        throw new Error('Missing required branch fields');
      }

      // Validate that kontakPenanggungJawab exists and has required fields
      if (!branchData.kontakPenanggungJawab) {
        throw new Error('Field kontakPenanggungJawab is required');
      }

      if (!branchData.kontakPenanggungJawab.nama) {
        throw new Error('Field kontakPenanggungJawab.nama harus diisi');
      }

      if (!branchData.kontakPenanggungJawab.telepon) {
        throw new Error('Field kontakPenanggungJawab.telepon harus diisi');
      }

      // Clean the data by trimming strings
      const payload = {
        ...branchData,
        namaCabang: branchData.namaCabang.trim(),
        alamat: branchData.alamat.trim(),
        kelurahan: branchData.kelurahan.trim(),
        kecamatan: branchData.kecamatan.trim(),
        kota: branchData.kota.trim(),
        provinsi: branchData.provinsi.trim(),
        kontakPenanggungJawab: {
          nama: branchData.kontakPenanggungJawab.nama.trim(),
          telepon: branchData.kontakPenanggungJawab.telepon.trim(),
          email: branchData.kontakPenanggungJawab.email?.trim() || ''
        }
      };

      console.log("Creating branch with data:", JSON.stringify(payload, null, 2));
      
      // Send the prepared payload, not the original branchData
      const response = await api.post("/branches", payload);
      
      // Normalize response to consistently return branch object
      let createdBranch;
      if (response.data && response.data._id) {
        createdBranch = response.data;
      } else if (response.data?.data && response.data.data._id) {
        createdBranch = response.data.data;
      } else if (response.data?.branch && response.data.branch._id) {
        createdBranch = response.data.branch;
      } else {
        console.warn("Unexpected API response format for branch creation:", response.data);
        throw new Error("Invalid response format from branch creation");
      }

      console.log("Branch created successfully:", createdBranch);
      return createdBranch;
    } catch (error: any) {
      console.error("Error creating branch:", {
        error,
        response: error.response?.data,
        status: error.response?.status,
        requestData: branchData
      });
      // Throw the specific error message from the backend if available
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Update branch
  async updateBranch(id: string, branchData: Partial<Branch>) {
    try {
      console.log(`Updating branch ${id} with data:`, branchData);
      const response = await api.put(`/branches/${id}`, branchData);
      
      // Handle different possible response structures
      let updatedBranch;
      if (response.data && response.data._id) {
        updatedBranch = response.data;
      } else if (response.data?.data && response.data.data._id) {
        updatedBranch = response.data.data;
      } else if (response.data?.branch && response.data.branch._id) {
        updatedBranch = response.data.branch;
      } else {
        console.warn("Unexpected API response format for branch update:", response.data);
        throw new Error("Invalid response format from branch update");
      }

      console.log("Branch updated successfully:", updatedBranch);
      return updatedBranch;
    } catch (error: any) {
      console.error(`Error updating branch ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete branch
  async deleteBranch(id: string) {
    try {
      console.log(`Deleting branch ${id}`);
      await api.delete(`/branches/${id}`);
      console.log(`Branch ${id} deleted successfully`);
      return id; // Return the ID for state updates
    } catch (error: any) {
      console.error(`Error deleting branch ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};

export default branchService;