// src/types/finance.ts
export interface Account {
    _id: string;
    kodeAccount: string;
    namaAccount: string;
    tipeAccount: 'Pendapatan' | 'Biaya' | 'Aset' | 'Kewajiban' | 'Ekuitas';
    deskripsi?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AccountFormInputs {
    kodeAccount: string;
    namaAccount: string;
    tipeAccount: 'Pendapatan' | 'Biaya' | 'Aset' | 'Kewajiban' | 'Ekuitas';
    deskripsi?: string;
}

export interface JournalEntry {
    _id: string;
    tanggal: string;
    accountId: string;
    cabangId: string;
    keterangan?: string;
    debet: number;
    kredit: number;
    tipe: 'Lokal' | 'Pusat';
    userId: string;
    sttIds?: string[];
    status: 'DRAFT' | 'FINAL';
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    account?: {
        _id: string;
        kodeAccount: string;
        namaAccount: string;
        tipeAccount: string;
    };
    cabang?: {
        _id: string;
        namaCabang: string;
    };
    user?: {
        _id: string;
        nama: string;
    };
    stts?: Array<{
        _id: string;
        noSTT: string;
    }>;
}

export interface JournalFormInputs {
    tanggal: string;
    accountId: string;
    cabangId: string;
    keterangan?: string;
    debet: number;
    kredit: number;
    tipe: 'Lokal' | 'Pusat';
    sttIds?: string[];
}

export interface Cash {
    _id: string;
    tanggal: string;
    tipeKas: 'Awal' | 'Akhir' | 'Kecil' | 'Rekening' | 'Tangan';
    cabangId: string;
    keterangan?: string;
    debet: number;
    kredit: number;
    saldo: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    cabang?: {
        _id: string;
        namaCabang: string;
    };
    user?: {
        _id: string;
        nama: string;
    };
}

export interface CashFormInputs {
    tanggal: string;
    tipeKas: 'Awal' | 'Akhir' | 'Kecil' | 'Rekening' | 'Tangan';
    cabangId: string;
    keterangan?: string;
    debet: number;
    kredit: number;
}

export interface BankStatement {
    _id: string;
    tanggal: string;
    bank: string;
    noRekening: string;
    keterangan?: string;
    debet: number;
    kredit: number;
    saldo: number;
    status: 'VALIDATED' | 'UNVALIDATED';
    cabangId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    cabang?: {
        _id: string;
        namaCabang: string;
    };
    user?: {
        _id: string;
        nama: string;
    };
}

export interface BankStatementFormInputs {
    tanggal: string;
    bank: string;
    noRekening: string;
    keterangan?: string;
    debet: number;
    kredit: number;
    cabangId: string;
}

export interface Asset {
    _id: string;
    namaAset: string;
    tipeAset: string;
    tanggalPembelian: string;
    nilaiPembelian: number;
    nilaiSekarang: number;
    persentasePenyusutan: number;
    statusAset: 'AKTIF' | 'DIJUAL' | 'RUSAK';
    lokasiAset: string;
    cabangId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    
    // Relasi yang mungkin ada dalam respon API
    cabang?: {
        _id: string;
        namaCabang: string;
    };
    user?: {
        _id: string;
        nama: string;
    };
}

export interface AssetFormInputs {
    namaAset: string;
    tipeAset: string;
    tanggalPembelian: string;
    nilaiPembelian: number;
    persentasePenyusutan: number;
    statusAset: 'AKTIF' | 'DIJUAL' | 'RUSAK';
    lokasiAset: string;
    cabangId: string;
}