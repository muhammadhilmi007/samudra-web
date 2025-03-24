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

// Types for related data
export interface CustomerSTT {
  _id: string;
  noSTT: string;
  cabangAsalId: string;
  cabangTujuanId: string;
  pengirimId: string;
  penerimaId: string;
  pengirim?: Partial<Customer>;
  penerima?: Partial<Customer>;
  namaBarang: string;
  komoditi: string;
  packing: string;
  jumlahColly: number;
  berat: number;
  hargaPerKilo: number;
  harga: number;
  keterangan: string;
  kodePenerus: string;
  penerusId: string;
  paymentType: 'CASH' | 'COD' | 'CAD';
  status: 'PENDING' | 'MUAT' | 'TRANSIT' | 'LANSIR' | 'TERKIRIM' | 'RETURN';
  userId: string;
  cabangId: string;
  barcode: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCollection {
  _id: string;
  noPenagihan: string;
  pelangganId: string;
  tipePelanggan: string;
  sttIds: string[];
  cabangId: string;
  overdue: boolean;
  tanggalBayar: string | null;
  jumlahBayarTermin: { 
    termin: number;
    tanggal: string;
    jumlah: number;
  }[];
  status: 'LUNAS' | 'BELUM LUNAS';
  totalTagihan: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPickup {
  _id: string;
  tanggal: string;
  noPengambilan: string;
  pengirimId: string;
  sttIds: string[];
  supirId: string;
  kenekId: string;
  kendaraanId: string;
  kendaraan?: {
    _id: string;
    noPolisi: string;
  };
  supir?: {
    _id: string;
    nama: string;
  };
  waktuBerangkat: string;
  waktuPulang: string | null;
  estimasiPengambilan: string;
  userId: string;
  cabangId: string;
  alamatPengambilan?: string;
  createdAt: string;
  updatedAt: string;
}