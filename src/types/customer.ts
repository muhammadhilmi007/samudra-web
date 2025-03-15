// src/types/customer.ts
export interface Customer {
    _id: string;
    nama: string;
    tipe: 'Pengirim' | 'Penerima' | 'Keduanya';
    alamat: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    telepon: string;
    email: string;
    perusahaan: string;
    createdBy: string;
    cabangId: string;
    cabang?: {
      _id: string;
      namaCabang: string;
    };
    createdAt: string;
    updatedAt: string;
  }
  
  export interface CustomerFormInputs {
    nama: string;
    tipe: 'Pengirim' | 'Penerima' | 'Keduanya';
    alamat: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    telepon: string;
    email: string;
    perusahaan: string;
    cabangId: string;
  }