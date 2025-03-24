// src/types/branch.ts
import { Division } from './division';

export interface Branch {
  _id: string;
  namaCabang: string;
  divisiId: {
    _id: string;
    namaDivisi: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  divisi?: Division;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kontakPenanggungJawab: {
    nama: string;
    telepon: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  alamatLengkap?: string; // Virtual field from backend
}

export interface BranchFormInputs {
  namaCabang: string;
  divisiId: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kontakPenanggungJawab: {
    nama: string;
    telepon: string;
    email: string; // Add this line
  };
}

export interface BranchCreateData {
  namaCabang: string;
  divisiId: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kontakPenanggungJawab?: {
    nama: string;
    telepon: string;
    email?: string;
  };
  // Allow for dot notation format as well
  "kontakPenanggungJawab.nama"?: string;
  "kontakPenanggungJawab.telepon"?: string;
  "kontakPenanggungJawab.email"?: string;
}

export interface BranchStats {
  employeeCount: number;
  vehicleCount: number;
  truckCount: number;
  lansirCount: number;
}