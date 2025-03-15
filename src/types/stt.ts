// src/types/stt.ts
export interface STT {
    _id: string;
    noSTT: string;
    cabangAsalId: string;
    cabangTujuanId: string;
    pengirimId: string;
    penerimaId: string;
    namaBarang: string;
    komoditi: string;
    packing: string;
    jumlahColly: number;
    berat: number;
    hargaPerKilo: number;
    harga: number;
    keterangan: string;
    kodePenerus: string;
    penerusId?: string;
    paymentType: 'CASH' | 'COD' | 'CAD';
    status: string;
    userId: string;
    cabangId: string;
    barcode: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    cabangAsal?: {
      _id: string;
      namaCabang: string;
    };
    cabangTujuan?: {
      _id: string;
      namaCabang: string;
    };
    pengirim?: {
      _id: string;
      nama: string;
      telepon: string;
      alamat: string;
    };
    penerima?: {
      _id: string;
      nama: string;
      telepon: string;
      alamat: string;
    };
    penerus?: {
      _id: string;
      namaPenerus: string;
    };
    user?: {
      _id: string;
      nama: string;
    };
  }
  
  export interface STTFormInputs {
    cabangAsalId: string;
    cabangTujuanId: string;
    pengirimId: string;
    penerimaId: string;
    namaBarang: string;
    komoditi: string;
    packing: string;
    jumlahColly: number;
    berat: number;
    hargaPerKilo: number;
    harga: number;
    keterangan: string;
    kodePenerus: string;
    penerusId?: string;
    paymentType: 'CASH' | 'COD' | 'CAD';
  }
  
  export interface STTStatusUpdate {
    status: string;
  }
  
  export interface ForwarderOption {
    _id: string;
    namaPenerus: string;
    alamat: string;
    telepon: string;
    email: string;
    kontakPerson: string;
  }