// src/types/vehicle.ts
export interface Vehicle {
  _id: string;
  noPolisi: string;
  namaKendaraan: string;
  supirId: string;
  noTeleponSupir: string;
  noKTPSupir: string;
  fotoKTPSupir?: string;
  fotoSupir?: string;
  alamatSupir: string;
  kenekId?: string;
  noTeleponKenek?: string;
  noKTPKenek?: string;
  fotoKTPKenek?: string;
  fotoKenek?: string;
  alamatKenek?: string;
  cabangId: string;
  tipe: 'lansir' | 'antar_cabang'; // Backend format
  tipeDisplay?: 'Lansir' | 'Antar Cabang'; // Frontend display format
  grup?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations that may be included in API response
  cabang?: {
    _id: string;
    namaCabang: string;
  };
  supir?: {
    _id: string;
    nama: string;
  };
  kenek?: {
    _id: string;
    nama: string;
  };
}

export interface VehicleFormInputs {
  noPolisi: string;
  namaKendaraan: string;
  supirId: string;
  noTeleponSupir: string;
  noKTPSupir: string;
  fotoKTPSupir?: File | null;
  fotoSupir?: File | null;
  alamatSupir: string;
  kenekId?: string;
  noTeleponKenek?: string;
  noKTPKenek?: string;
  fotoKTPKenek?: File | null;
  fotoKenek?: File | null;
  alamatKenek?: string;
  cabangId: string;
  tipe: 'Lansir' | 'Antar Cabang'; // Frontend format
  grup?: string;
}

// Mapping functions between frontend and backend formats
export const mapVehicleTypeToBackend = (tipe: 'Lansir' | 'Antar Cabang'): 'lansir' | 'antar_cabang' => {
  return tipe === 'Lansir' ? 'lansir' : 'antar_cabang';
};

export const mapVehicleTypeToFrontend = (tipe: 'lansir' | 'antar_cabang'): 'Lansir' | 'Antar Cabang' => {
  return tipe === 'lansir' ? 'Lansir' : 'Antar Cabang';
};