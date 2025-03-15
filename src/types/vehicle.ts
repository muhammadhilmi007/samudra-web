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
    tipe: 'Lansir' | 'Antar Cabang';
    grup?: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
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
    fotoKTPSupir?: File;
    fotoSupir?: File;
    alamatSupir: string;
    kenekId?: string;
    noTeleponKenek?: string;
    noKTPKenek?: string;
    fotoKTPKenek?: File;
    fotoKenek?: File;
    alamatKenek?: string;
    cabangId: string;
    tipe: 'Lansir' | 'Antar Cabang';
    grup?: string;
  }