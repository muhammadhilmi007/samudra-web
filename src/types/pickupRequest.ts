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
    status: 'PENDING' | 'FINISH';
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    pengirim?: {
      _id: string;
      nama: string;
      telepon: string;
      alamat: string;
    };
    user?: {
      _id: string;
      nama: string;
    };
    cabang?: {
      _id: string;
      namaCabang: string;
    };
  }
  
  export interface PickupRequestFormInputs {
    pengirimId: string;
    alamatPengambilan: string;
    tujuan: string;
    jumlahColly: number;
    cabangId: string;
  }
  
  export interface Pickup {
    _id: string;
    tanggal: string;
    noPengambilan: string;
    pengirimId: string;
    sttIds: string[];
    supirId: string;
    kenekId?: string;
    kendaraanId: string;
    waktuBerangkat?: string;
    waktuPulang?: string;
    estimasiPengambilan: string;
    userId: string;
    cabangId: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    pengirim?: {
      _id: string;
      nama: string;
      telepon: string;
      alamat: string;
    };
    supir?: {
      _id: string;
      nama: string;
    };
    kenek?: {
      _id: string;
      nama: string;
    };
    kendaraan?: {
      _id: string;
      noPolisi: string;
      namaKendaraan: string;
    };
    stts?: Array<{
      _id: string;
      noSTT: string;
    }>;
    user?: {
      _id: string;
      nama: string;
    };
    cabang?: {
      _id: string;
      namaCabang: string;
    };
  }
  
  export interface PickupFormInputs {
    pengirimId: string;
    sttIds: string[];
    supirId: string;
    kenekId?: string;
    kendaraanId: string;
    estimasiPengambilan: string;
    cabangId: string;
  }