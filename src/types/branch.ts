// src/types/branch.ts
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
}

// This interface represents what we'll submit to the API
export interface BranchFormSubmitData {
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
    email?: string;
  };
}