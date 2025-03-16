// src/types/loading.ts
export interface Loading {
    _id: string;
    idMuat: string;
    sttIds: string[];
    antrianTruckId: string;
    checkerId: string;
    waktuBerangkat?: string;
    waktuSampai?: string;
    keterangan?: string;
    status: 'MUAT' | 'BERANGKAT' | 'SAMPAI';
    cabangMuatId: string;
    cabangBongkarId: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    stts?: Array<{
      _id: string;
      noSTT: string;
      pengirim?: {
        _id: string;
        nama: string;
      };
      penerima?: {
        _id: string;
        nama: string;
      };
    }>;
    antrianTruck?: {
      _id: string;
      truck?: {
        _id: string;
        noPolisi: string;
        namaKendaraan: string;
      };
      supir?: {
        _id: string;
        nama: string;
      };
      kenek?: {
        _id: string;
        nama: string;
      };
    };
    checker?: {
      _id: string;
      nama: string;
    };
    cabangMuat?: {
      _id: string;
      namaCabang: string;
    };
    cabangBongkar?: {
      _id: string;
      namaCabang: string;
    };
  }
  
  export interface LoadingFormInputs {
    sttIds: string[];
    antrianTruckId: string;
    checkerId: string;
    keterangan?: string;
    cabangMuatId: string;
    cabangBongkarId: string;
  }
  
  export interface TruckQueue {
    _id: string;
    truckId: string;
    supirId: string;
    noTelp: string;
    kenekId?: string;
    noTelpKenek?: string;
    urutan: number;
    status: 'MENUNGGU' | 'MUAT' | 'BERANGKAT';
    cabangId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    truck?: {
      _id: string;
      noPolisi: string;
      namaKendaraan: string;
    };
    supir?: {
      _id: string;
      nama: string;
    };
    kenek?: {
      _id: string;
      nama: string;
    };
    cabang?: {
      _id: string;
      namaCabang: string;
    };
    createdByUser?: {
      _id: string;
      nama: string;
    };
  }
  
  export interface TruckQueueFormInputs {
    truckId: string;
    supirId: string;
    noTelp: string;
    kenekId?: string;
    noTelpKenek?: string;
    cabangId: string;
  }
  
  export interface LoadingStatusUpdate {
    status: 'MUAT' | 'BERANGKAT' | 'SAMPAI';
    waktuBerangkat?: string;
    waktuSampai?: string;
  }