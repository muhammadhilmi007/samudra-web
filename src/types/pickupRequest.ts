// src/types/pickupRequest.ts
export interface PickupRequest {
  _id: string;
  tanggal: string;
  pengirimId: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly: number;
  userId: string;
  cabangId: string;
  status: "PENDING" | "FINISH";
  createdAt: string;
  updatedAt: string;

  // Related entities that might be included in API responses
  pengirim?: Customer;
  user?: User;
  cabang?: Branch;
}

export interface Pickup {
  _id: string;
  tanggal: string;
  noPengambilan: string;
  pengirimId: string;
  sttIds: string[] | STT[];
  supirId: string;
  kenekId?: string;
  kendaraanId: string;
  waktuBerangkat?: string;
  waktuPulang?: string;
  estimasiPengambilan: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly: number;
  userId: string;
  cabangId: string;
  status: "PENDING" | "BERANGKAT" | "SELESAI" | "CANCELLED";
  createdAt: string;
  updatedAt: string;

  // Related entities that might be included in API responses
  pengirim?: Customer;
  supir?: User;
  kenek?: User;
  kendaraan?: Vehicle;
  stts: STT[];
  user?: User;
  cabang?: Branch;
}

export interface Customer {
  _id: string;
  nama: string;
  telepon?: string;
  alamat?: string;
  tipe?: string;
}

export interface User {
  _id: string;
  nama: string;
  jabatan?: string;
  role?: string;
}

export interface Branch {
  _id: string;
  namaCabang: string;
}

export interface Vehicle {
  _id: string;
  noPolisi: string;
  namaKendaraan: string;
}

export interface STT {
  _id: string;
  noSTT: string;
  namaBarang?: string;
  jumlahColly?: number;
  berat?: number;
  harga?: number;
  paymentType?: string;
}

export interface PickupRequestFormInputs {
  pengirimId: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly: number;
  cabangId: string;
  tanggal?: string;
  estimasiPengambilan?: string;
}

export interface PickupFormInputs {
  pengirimId: string;
  sttIds: string[];
  supirId: string;
  kenekId?: string;
  kendaraanId: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly: string;
  estimasiPengambilan: string;
  cabangId: string;
  tanggal?: string;
}