// src/types/stt.ts
import { Customer } from './customer';

// STT Status types
export type STTStatus = 
  | 'PENDING'
  | 'MUAT' 
  | 'TRANSIT' 
  | 'LANSIR' 
  | 'TERKIRIM' 
  | 'RETURN';

// Payment Types
export type PaymentType = 
  | 'CASH'  // Cash payment upfront
  | 'COD'   // Cash on delivery
  | 'CAD';  // Cash after delivery

// Forwarding codes
export type ForwardingCode = 
  | '70'  // No forwarding
  | '71'  // Forwarding paid by sender
  | '72'  // Forwarding paid by recipient
  | '73'; // Forwarding advanced by recipient branch

// STT model
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
  kodePenerus: ForwardingCode;
  penerusId?: string;
  paymentType: PaymentType;
  status: STTStatus;
  userId: string;
  cabangId: string;
  barcode: string;
  
  // Populated fields
  cabangAsal?: {
    _id: string;
    namaCabang: string;
  };
  cabangTujuan?: {
    _id: string;
    namaCabang: string;
  };
  pengirim?: Customer;
  penerima?: Customer;
  penerus?: {
    _id: string;
    namaPenerus: string;
  };
  user?: {
    _id: string;
    nama: string;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Tracking history
  trackingHistory?: Array<{
    status: STTStatus;
    timestamp: string;
    location?: string;
    notes?: string;
    userId?: string;
    user?: {
      _id: string;
      nama: string;
    };
  }>;
  
  // Loading information
  muatId?: string;
  lansirId?: string;
  returnId?: string;
  penagihan?: {
    _id: string;
    noPenagihan: string;
    status: 'LUNAS' | 'BELUM LUNAS';
  };
}

// Input type for creating/updating STT
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
  harga?: number;  // Can be calculated automatically
  keterangan?: string;
  kodePenerus: ForwardingCode;
  penerusId?: string;
  paymentType: PaymentType;
}

// Type for updating STT status
export interface STTStatusUpdate {
  status: STTStatus;
  keterangan?: string;
  location?: string;
}

// Type for STT statistics
export interface STTStatistics {
  total: number;
  byStatus: {
    [key in STTStatus]: number;
  };
  byPaymentType: {
    [key in PaymentType]: number;
  };
  totalValue: number;
  averageValue: number;
  topRoutes: Array<{
    origin: string;
    destination: string;
    count: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    count: number;
    value: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
    value: number;
  }>;
}

// Type for tracking data response
export interface STTTrackingData {
  noSTT: string;
  status: STTStatus;
  createdAt: string;
  updatedAt: string;
  cabangAsal: {
    namaCabang: string;
  } | null;
  cabangTujuan: {
    namaCabang: string;
  } | null;
  pengirim: {
    nama: string;
  } | null;
  penerima: {
    nama: string;
  } | null;
  keterangan?: string;
  trackingHistory: Array<{
    status: STTStatus;
    timestamp: string;
    location?: string;
    notes?: string;
  }>;
}