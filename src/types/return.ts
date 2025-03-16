// src/types/return.ts
export interface Return {
    _id: string;
    idRetur: string;
    sttIds: string[];
    tanggalKirim: string;
    tanggalSampai?: string;
    tandaTerima?: string;
    status: 'PROSES' | 'SAMPAI';
    cabangId: string;
    createdBy: string;
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
    cabang?: {
      _id: string;
      namaCabang: string;
    };
    creator?: {
      _id: string;
      nama: string;
    };
  }
  
  export interface ReturnFormInputs {
    sttIds: string[];
    tanggalKirim: string;
    cabangId: string;
  }