// src/types/branch.ts
export interface Branch {
  _id: string;
  namaCabang: string;
  divisiId: string;
  divisi?: {
    _id: string;
    namaDivisi: string;
  };
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kontakPenanggungJawab: {
    nama?: string;
    telepon?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
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
    email: string;
  };
}
