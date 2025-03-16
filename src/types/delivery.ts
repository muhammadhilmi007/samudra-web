// src/types/delivery.ts
export interface Delivery {
  _id: string;
  idLansir: string;
  sttIds: string[];
  antrianKendaraanId: string;
  checkerId: string;
  adminId?: string;
  berangkat?: string;
  sampai?: string;
  estimasiLansir?: string;
  kilometerBerangkat?: number;
  kilometerPulang?: number;
  namaPenerima?: string;
  keterangan?: string;
  status: "LANSIR" | "TERKIRIM" | "BELUM SELESAI";
  cabangId: string;
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
  antrianKendaraan?: {
    _id: string;
    kendaraan?: {
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
  admin?: {
    _id: string;
    nama: string;
  };
  cabang?: {
    _id: string;
    namaCabang: string;
  };
}

export interface DeliveryFormInputs {
  sttIds: string[];
  antrianKendaraanId: string;
  checkerId: string;
  adminId?: string;
  estimasiLansir?: string;
  kilometerBerangkat?: number;
  cabangId: string;
}

export interface VehicleQueue {
  _id: string;
  kendaraanId: string;
  supirId: string;
  kenekId?: string;
  urutan: number;
  status: "MENUNGGU" | "LANSIR" | "KEMBALI";
  cabangId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relasi yang mungkin ada dalam respon API
  kendaraan?: {
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

export interface VehicleQueueFormInputs {
  kendaraanId: string;
  supirId: string;
  kenekId?: string;
  cabangId: string;
}

export interface DeliveryStatusUpdate {
  status: "LANSIR" | "TERKIRIM" | "BELUM SELESAI";
  kilometerPulang?: number;
  sampai?: string;
  namaPenerima?: string;
  keterangan?: string;
}

export interface DeliveryFilterParams {
  cabangId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
