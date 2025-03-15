// src/types/auth.ts
export interface User {
    _id: string;
    nama: string;
    jabatan: string;
    role: string;
    email: string;
    telepon: string;
    alamat: string;
    fotoProfil?: string;
    dokumen?: {
      ktp?: string;
      npwp?: string;
      lainnya?: string[];
    };
    username: string;
    cabangId: string;
    cabang?: {
      _id: string;
      namaCabang: string;
    };
    aktif: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LoginParams {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    user: User;
    token: string;
  }
  
  export interface ChangePasswordParams {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
  
  export interface RegisterParams {
    nama: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    jabatan: string;
    role: string;
    telepon: string;
    alamat: string;
    cabangId: string;
  }