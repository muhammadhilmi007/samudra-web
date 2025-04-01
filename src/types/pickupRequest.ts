// src/types/pickupRequest.ts
export interface PickupRequest {
  _id: string;
  noRequest?: string;
  tanggal: string;
  pengirimId: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly: number;
  estimasiPengambilan?: string | null;
  userId: string;
  cabangId: string;
  status: "PENDING" | "FINISH" | "CANCELLED";
  pickupId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  // Related entities that might be populated
  pengirim?: Customer;
  user?: User;
  cabang?: Branch;
  pickup?: Pickup;
}

export interface Pickup {
  _id: string;
  noPengambilan: string;
  waktuBerangkat?: string;
  waktuPulang?: string;
  pengirimId: string;
  cabangId: string;
  userId: string;
  supirId: string;
  kenekId?: string;
  kendaraanId: string;
  status: string;
  tanggal: string;
  alamatPengambilan: string;
  jumlahColly: number;
  estimasiPengambilan: string;
  tujuan: string;
  createdAt: string;
  updatedAt: string;
  sttIds?: string[];
}

export interface Customer {
  _id: string;
  nama: string;
  telepon?: string;
  alamat?: string;
  email?: string;
  kota?: string;
  provinsi?: string;
  kelurahan?: string;
  kecamatan?: string;
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

export interface PickupRequestFormInputs {
  pengirimId: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly: number;
  cabangId: string;
  tanggal?: string;
  estimasiPengambilan?: string;
  notes?: string;
}

export interface PickupRequestFilterParams {
  cabangId?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StatusUpdateInput {
  status: "PENDING" | "FINISH" | "CANCELLED";
  notes?: string;
}

export interface LinkPickupInput {
  pickupId: string;
}

export interface PickupFormInputs {
  noPengambilan?: string;
  waktuBerangkat?: string;
  waktuPulang?: string;
  requestIds?: string[];
  driverId?: string;
  vehicleId?: string;
  // Additional fields from pickup schema
  pengirimId: string;
  alamatPengambilan: string;
  tujuan: string;
  jumlahColly?: string | number;
  cabangId: string;
  supirId: string;
  kenekId?: string;
  kendaraanId: string;
  estimasiPengambilan: string;
  sttIds?: string[];
}
