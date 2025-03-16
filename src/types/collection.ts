// src/types/collection.ts
export interface Collection {
    _id: string;
    noPenagihan: string;
    pelangganId: string;
    tipePelanggan: 'Pengirim' | 'Penerima';
    sttIds: string[];
    cabangId: string;
    overdue: boolean;
    tanggalBayar?: string;
    jumlahBayarTermin: Array<{
      termin: number;
      tanggal: string;
      jumlah: number;
    }>;
    status: 'LUNAS' | 'BELUM LUNAS';
    totalTagihan: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    pelanggan?: {
      _id: string;
      nama: string;
      telepon: string;
      alamat: string;
    };
    stts?: Array<{
      _id: string;
      noSTT: string;
      harga: number;
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
  
  export interface CollectionFormInputs {
    pelangganId: string;
    tipePelanggan: 'Pengirim' | 'Penerima';
    sttIds: string[];
    cabangId: string;
  }
  
  export interface PaymentInput {
    collectionId: string;
    jumlah: number;
    tanggal: string;
    keterangan?: string;
  }